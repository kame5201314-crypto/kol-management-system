import React, { useState, useEffect } from 'react';
import {
  Image,
  Upload,
  Shield,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react';
import {
  DigitalAsset,
  AssetStatus,
  ASSET_STATUS_LABELS,
  ASSET_STATUS_COLORS
} from '../../../types/imageGuardian';
import { imageGuardianService } from '../../../services/imageGuardianService';
import AssetList from './AssetList';
import AssetUpload from './AssetUpload';

interface AssetVaultDashboardProps {
  onAssetSelect?: (asset: DigitalAsset) => void;
  onNavigateToUpload?: () => void;
}

const AssetVaultDashboard: React.FC<AssetVaultDashboardProps> = ({
  onAssetSelect,
  onNavigateToUpload
}) => {
  const [assets, setAssets] = useState<DigitalAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<DigitalAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssetStatus | 'all'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    filterAssets();
  }, [assets, searchQuery, statusFilter]);

  const loadAssets = () => {
    setIsLoading(true);
    console.log('[Dashboard] 載入資產...');
    const loadedAssets = imageGuardianService.assets.getAll();
    console.log(`[Dashboard] 從 storage 載入 ${loadedAssets.length} 個資產`);
    setAssets(loadedAssets);
    setIsLoading(false);
  };

  const filterAssets = () => {
    let result = assets;

    if (searchQuery) {
      result = imageGuardianService.assets.search(searchQuery);
    }

    if (statusFilter !== 'all') {
      result = result.filter(a => a.status === statusFilter);
    }

    setFilteredAssets(result);
  };

  const handleUploadComplete = (newAssets: DigitalAsset[]) => {
    console.log(`[Dashboard] 上傳完成，新增 ${newAssets.length} 個資產`);
    // 重新從 storage 載入以驗證儲存成功
    loadAssets();
    setShowUploadModal(false);
  };

  const handleDeleteAsset = (assetId: string) => {
    if (window.confirm('確定要刪除此資產嗎？')) {
      imageGuardianService.assets.delete(assetId);
      loadAssets();
    }
  };

  const stats = {
    total: assets.length,
    monitoring: assets.filter(a => a.status === 'monitoring').length,
    indexed: assets.filter(a => a.status === 'indexed').length,
    processing: assets.filter(a => a.status === 'processing').length,
    totalViolations: assets.reduce((sum, a) => sum + a.scanStats.violationsFound, 0)
  };

  return (
    <div className="space-y-6">
      {/* 標題區 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Image className="w-7 h-7 text-indigo-600" />
            數位資產庫
          </h1>
          <p className="text-gray-600 mt-1">管理您的品牌圖片資產，建立 AI 指紋保護</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Upload className="w-4 h-4" />
          上傳圖片
        </button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Image className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">總資產數</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">監控中</p>
              <p className="text-2xl font-bold text-gray-900">{stats.monitoring}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">已索引</p>
              <p className="text-2xl font-bold text-gray-900">{stats.indexed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin" />
            </div>
            <div>
              <p className="text-sm text-gray-500">處理中</p>
              <p className="text-2xl font-bold text-gray-900">{stats.processing}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Eye className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">偵測到侵權</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalViolations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 搜尋和篩選 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜尋資產名稱、標籤、SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AssetStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">全部狀態</option>
              <option value="monitoring">監控中</option>
              <option value="indexed">已索引</option>
              <option value="processing">處理中</option>
              <option value="archived">已歸檔</option>
            </select>
          </div>

          <button
            onClick={loadAssets}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
        </div>
      </div>

      {/* 資產列表 */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">載入中...</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Image className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || statusFilter !== 'all' ? '沒有找到符合條件的資產' : '尚無資產'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter !== 'all'
              ? '請嘗試調整搜尋條件'
              : '上傳您的品牌圖片，開始建立 AI 指紋保護'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              上傳第一張圖片
            </button>
          )}
        </div>
      ) : (
        <AssetList
          assets={filteredAssets}
          onAssetSelect={onAssetSelect}
          onDeleteAsset={handleDeleteAsset}
        />
      )}

      {/* 上傳 Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">上傳圖片資產</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <AssetUpload
                onUploadComplete={handleUploadComplete}
                onCancel={() => setShowUploadModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetVaultDashboard;
