import React, { useState, useEffect } from 'react';
import {
  Image,
  Shield,
  AlertTriangle,
  Tag,
  Calendar,
  Box,
  Hash,
  Eye,
  Scan,
  X,
  ChevronRight,
  ExternalLink,
  Play,
  Users
} from 'lucide-react';
import {
  DigitalAsset,
  Violation,
  WhitelistEntry,
  ASSET_STATUS_LABELS,
  ASSET_STATUS_COLORS,
  PLATFORM_LABELS
} from '../../../types/imageGuardian';
import { imageGuardianService } from '../../../services/imageGuardianService';
import WhitelistManager, { WhitelistAddModal } from './WhitelistManager';

interface AssetDetailProps {
  asset: DigitalAsset;
  onClose: () => void;
  onDelete?: (assetId: string) => void | Promise<void>;
  onStartScan?: (assetId: string) => void;
  onViewViolation?: (violation: Violation) => void;
}

const AssetDetail: React.FC<AssetDetailProps> = ({
  asset,
  onClose,
  onStartScan,
  onViewViolation
}) => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'violations' | 'whitelist'>('info');
  const [showWhitelistModal, setShowWhitelistModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [asset.id]);

  const loadData = () => {
    setViolations(imageGuardianService.violations.getByAssetId(asset.id));
    setWhitelist(imageGuardianService.whitelist.getByAssetId(asset.id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW');
  };

  const handleWhitelistAdd = (entry: WhitelistEntry) => {
    setWhitelist(prev => [...prev, entry]);
  };

  const handleWhitelistRemove = (entryId: string) => {
    imageGuardianService.whitelist.remove(entryId);
    setWhitelist(prev => prev.filter(w => w.id !== entryId));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 標題列 */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">資產詳情</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 內容區 */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row">
            {/* 左側圖片 */}
            <div className="md:w-1/2 p-6 bg-gray-50">
              <div className="aspect-square rounded-lg overflow-hidden bg-white shadow">
                <img
                  src={asset.originalUrl || asset.thumbnailUrl}
                  alt={asset.fileName}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* 快速操作 */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => onStartScan?.(asset.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Scan className="w-4 h-4" />
                  開始掃描
                </button>
                <button
                  onClick={() => setShowWhitelistModal(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  白名單
                </button>
              </div>
            </div>

            {/* 右側資訊 */}
            <div className="md:w-1/2 p-6">
              {/* 標籤頁切換 */}
              <div className="flex border-b mb-4">
                {[
                  { key: 'info', label: '基本資訊' },
                  { key: 'violations', label: `侵權記錄 (${violations.length})` },
                  { key: 'whitelist', label: `白名單 (${whitelist.length})` }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 基本資訊 */}
              {activeTab === 'info' && (
                <div className="space-y-4">
                  {/* 檔案資訊 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">檔案資訊</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">檔案名稱</span>
                        <span className="font-medium text-gray-900">{asset.fileName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">尺寸</span>
                        <span className="font-medium text-gray-900">
                          {asset.dimensions.width} x {asset.dimensions.height} px
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">檔案大小</span>
                        <span className="font-medium text-gray-900">
                          {formatFileSize(asset.fileSize)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">狀態</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ASSET_STATUS_COLORS[asset.status]}`}>
                          {ASSET_STATUS_LABELS[asset.status]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI 指紋 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      AI 指紋
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div>
                        <span className="text-xs text-gray-500">pHash (感知雜湊)</span>
                        <code className="block mt-1 bg-white px-3 py-2 rounded border text-sm font-mono break-all">
                          {asset.fingerprint.pHash}
                        </code>
                      </div>
                      {asset.fingerprint.featureCount && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">ORB 特徵點</span>
                          <span className="font-medium text-gray-900">
                            {asset.fingerprint.featureCount} 個
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 元數據 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">元數據</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      {asset.metadata.brandName && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">品牌</span>
                          <span className="font-medium text-gray-900">
                            {asset.metadata.brandName}
                          </span>
                        </div>
                      )}
                      {asset.metadata.productSku && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">產品 SKU</span>
                          <code className="font-medium text-gray-900 bg-white px-2 py-0.5 rounded">
                            {asset.metadata.productSku}
                          </code>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">上傳時間</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(asset.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 標籤 */}
                  {asset.metadata.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        標籤
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {asset.metadata.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 掃描統計 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                      <Scan className="w-4 h-4" />
                      掃描統計
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {asset.scanStats.totalScans}
                        </p>
                        <p className="text-xs text-gray-500">總掃描次數</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className={`text-2xl font-bold ${
                          asset.scanStats.violationsFound > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {asset.scanStats.violationsFound}
                        </p>
                        <p className="text-xs text-gray-500">偵測到侵權</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 侵權記錄 */}
              {activeTab === 'violations' && (
                <div className="space-y-3">
                  {violations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="w-12 h-12 mx-auto mb-3 text-green-400" />
                      <p>尚未偵測到侵權記錄</p>
                    </div>
                  ) : (
                    violations.map(violation => (
                      <div
                        key={violation.id}
                        onClick={() => onViewViolation?.(violation)}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      >
                        <img
                          src={violation.listing.thumbnailUrl}
                          alt={violation.listing.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {violation.listing.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded">
                              {PLATFORM_LABELS[violation.platform]}
                            </span>
                            <span>相似度 {violation.similarity.overall}%</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 白名單 */}
              {activeTab === 'whitelist' && (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowWhitelistModal(true)}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                  >
                    + 新增授權賣家
                  </button>

                  {whitelist.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>尚未設定白名單</p>
                    </div>
                  ) : (
                    whitelist.map(entry => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{entry.sellerName}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="px-1.5 py-0.5 bg-gray-200 rounded">
                              {PLATFORM_LABELS[entry.platformType]}
                            </span>
                            <span>授權於 {formatDate(entry.authorizedAt)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleWhitelistRemove(entry.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 白名單 Modal */}
        <WhitelistAddModal
          isOpen={showWhitelistModal}
          onAdd={handleWhitelistAdd}
          onClose={() => setShowWhitelistModal(false)}
        />
      </div>
    </div>
  );
};

export default AssetDetail;
