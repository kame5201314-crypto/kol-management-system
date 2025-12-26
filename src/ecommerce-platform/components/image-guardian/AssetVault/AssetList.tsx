import React from 'react';
import {
  Image,
  Eye,
  Trash2,
  Shield,
  AlertTriangle,
  Clock,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import {
  DigitalAsset,
  ASSET_STATUS_LABELS,
  ASSET_STATUS_COLORS
} from '../../../types/imageGuardian';

interface AssetListProps {
  assets: DigitalAsset[];
  onAssetSelect?: (asset: DigitalAsset) => void;
  onDeleteAsset?: (assetId: string) => void;
  viewMode?: 'grid' | 'list';
}

const AssetList: React.FC<AssetListProps> = ({
  assets,
  onAssetSelect,
  onDeleteAsset,
  viewMode = 'grid'
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                資產
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                狀態
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                指紋
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                掃描統計
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                上傳日期
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">操作</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assets.map((asset) => (
              <tr
                key={asset.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onAssetSelect?.(asset)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <img
                        className="h-12 w-12 rounded-lg object-cover"
                        src={asset.thumbnailUrl}
                        alt={asset.fileName}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {asset.fileName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {asset.dimensions.width} x {asset.dimensions.height} • {formatFileSize(asset.fileSize)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ASSET_STATUS_COLORS[asset.status]}`}>
                    {ASSET_STATUS_LABELS[asset.status]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {asset.fingerprint.pHash.substring(0, 8)}...
                  </code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="text-gray-500">掃描：</span>
                      <span className="font-medium">{asset.scanStats.totalScans}</span>
                    </div>
                    {asset.scanStats.violationsFound > 0 && (
                      <div className="flex items-center text-red-600">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        <span className="font-medium">{asset.scanStats.violationsFound}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(asset.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAssetSelect?.(asset);
                      }}
                      className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAsset?.(asset.id);
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Grid View
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => onAssetSelect?.(asset)}
        >
          {/* 圖片區 */}
          <div className="relative aspect-square">
            <img
              src={asset.thumbnailUrl}
              alt={asset.fileName}
              className="w-full h-full object-cover"
            />

            {/* 狀態標籤 */}
            <div className="absolute top-2 left-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ASSET_STATUS_COLORS[asset.status]}`}>
                {ASSET_STATUS_LABELS[asset.status]}
              </span>
            </div>

            {/* 侵權警告 */}
            {asset.scanStats.violationsFound > 0 && (
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {asset.scanStats.violationsFound}
                </span>
              </div>
            )}

            {/* 操作覆蓋層 */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssetSelect?.(asset);
                  }}
                  className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                >
                  <Eye className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAsset?.(asset.id);
                  }}
                  className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          </div>

          {/* 資訊區 */}
          <div className="p-3">
            <h3 className="font-medium text-gray-900 truncate text-sm">
              {asset.fileName}
            </h3>

            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              <span>{asset.dimensions.width}x{asset.dimensions.height}</span>
              <span>•</span>
              <span>{formatFileSize(asset.fileSize)}</span>
            </div>

            {/* 標籤 */}
            {asset.metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {asset.metadata.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {asset.metadata.tags.length > 2 && (
                  <span className="px-1.5 py-0.5 text-gray-400 text-xs">
                    +{asset.metadata.tags.length - 2}
                  </span>
                )}
              </div>
            )}

            {/* 指紋預覽 */}
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
              <Shield className="w-3 h-3" />
              <code className="truncate">
                {asset.fingerprint.pHash.substring(0, 12)}...
              </code>
            </div>

            {/* 掃描統計 */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs">
              <span className="text-gray-500">
                掃描 {asset.scanStats.totalScans} 次
              </span>
              {asset.scanStats.lastScanAt && (
                <span className="flex items-center text-gray-400">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDate(asset.scanStats.lastScanAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssetList;
