import React, { useState, useEffect } from 'react';
import {
  Image,
  Upload,
  Grid,
  List,
  Search,
  Filter,
  Plus,
  Shield,
  RefreshCw
} from 'lucide-react';
import { imageGuardianService } from '../../services/imageGuardianService';
import type { DigitalAsset, WhitelistEntry } from '../../types/imageGuardian';
import { ASSET_STATUS_LABELS } from '../../types/imageGuardian';
import AssetUpload from '../../components/image-guardian/AssetVault/AssetUpload';
import AssetList from '../../components/image-guardian/AssetVault/AssetList';
import AssetDetail from '../../components/image-guardian/AssetVault/AssetDetail';
import WhitelistManager, { WhitelistAddModal } from '../../components/image-guardian/AssetVault/WhitelistManager';

type ViewMode = 'grid' | 'list';
type Tab = 'assets' | 'whitelist';

export default function AssetVaultPage() {
  const [activeTab, setActiveTab] = useState<Tab>('assets');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [assets, setAssets] = useState<DigitalAsset[]>([]);
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<DigitalAsset | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showWhitelistModal, setShowWhitelistModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [assetsData, whitelistData] = await Promise.all([
        imageGuardianService.assets.getAll(),
        imageGuardianService.whitelist.getAll()
      ]);
      setAssets(assetsData);
      setWhitelist(whitelistData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = async (newAssets: DigitalAsset[]) => {
    setAssets(prev => [...newAssets, ...prev]);
    setShowUploadModal(false);
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (window.confirm('確定要刪除此資產嗎？此操作無法復原。')) {
      try {
        await imageGuardianService.assets.delete(assetId);
        setAssets(prev => prev.filter(a => a.id !== assetId));
        if (selectedAsset?.id === assetId) {
          setSelectedAsset(null);
        }
      } catch (error) {
        console.error('Failed to delete asset:', error);
      }
    }
  };

  const handleAddToWhitelist = async (entry: Omit<WhitelistEntry, 'id' | 'createdAt'>) => {
    try {
      const newEntry = await imageGuardianService.whitelist.add(entry);
      setWhitelist(prev => [newEntry, ...prev]);
      setShowWhitelistModal(false);
    } catch (error) {
      console.error('Failed to add to whitelist:', error);
    }
  };

  const handleRemoveFromWhitelist = async (entryId: string) => {
    try {
      await imageGuardianService.whitelist.remove(entryId);
      setWhitelist(prev => prev.filter(e => e.id !== entryId));
    } catch (error) {
      console.error('Failed to remove from whitelist:', error);
    }
  };

  // 過濾資產
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: assets.length,
    indexed: assets.filter(a => a.status === 'indexed').length,
    monitoring: assets.filter(a => a.status === 'monitoring').length,
    violations: assets.reduce((sum, a) => sum + a.scanStats.violationsFound, 0)
  };

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <Image className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">數位資產庫</h1>
            <p className="text-sm text-gray-500">管理您的原創圖片與 AI 指紋</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Upload className="w-5 h-5" />
            上傳資產
          </button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-500">總資產數</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-500">已建立指紋</p>
          <p className="text-2xl font-bold text-blue-600">{stats.indexed}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-500">監控中</p>
          <p className="text-2xl font-bold text-green-600">{stats.monitoring}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-500">偵測侵權</p>
          <p className="text-2xl font-bold text-red-600">{stats.violations}</p>
        </div>
      </div>

      {/* 標籤頁 */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b">
          <div className="flex items-center justify-between px-4">
            <div className="flex">
              <button
                onClick={() => setActiveTab('assets')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'assets'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                資產列表 ({assets.length})
              </button>
              <button
                onClick={() => setActiveTab('whitelist')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'whitelist'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                授權白名單 ({whitelist.length})
              </button>
            </div>

            {activeTab === 'assets' && (
              <div className="flex items-center gap-2 py-2">
                {/* 搜尋 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜尋資產..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 w-48 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* 狀態篩選 */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">所有狀態</option>
                  {Object.entries(ASSET_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>

                {/* 檢視模式 */}
                <div className="flex border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'whitelist' && (
              <button
                onClick={() => setShowWhitelistModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                新增授權
              </button>
            )}
          </div>
        </div>

        {/* 內容區 */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : activeTab === 'assets' ? (
            filteredAssets.length === 0 ? (
              <div className="text-center py-12">
                <Image className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">尚無資產</h3>
                <p className="text-gray-500 mb-4">上傳您的原創圖片以開始保護</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Upload className="w-5 h-5" />
                  上傳資產
                </button>
              </div>
            ) : (
              <AssetList
                assets={filteredAssets}
                viewMode={viewMode}
                onAssetSelect={setSelectedAsset}
                onDeleteAsset={handleDeleteAsset}
              />
            )
          ) : (
            <WhitelistManager
              entries={whitelist}
              onAddEntry={() => setShowWhitelistModal(true)}
              onRemoveEntry={handleRemoveFromWhitelist}
            />
          )}
        </div>
      </div>

      {/* 上傳模態框 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <h2 className="text-lg font-semibold">上傳數位資產</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <AssetUpload
                onUploadComplete={handleUploadComplete}
                onCancel={() => setShowUploadModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* 資產詳情模態框 */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <AssetDetail
              asset={selectedAsset}
              onClose={() => setSelectedAsset(null)}
              onDelete={handleDeleteAsset}
            />
          </div>
        </div>
      )}

      {/* 白名單新增模態框 */}
      <WhitelistAddModal
        isOpen={showWhitelistModal}
        onClose={() => setShowWhitelistModal(false)}
        onAdd={handleAddToWhitelist}
      />
    </div>
  );
}
