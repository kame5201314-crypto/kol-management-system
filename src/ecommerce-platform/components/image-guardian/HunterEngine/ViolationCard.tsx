import React from 'react';
import {
  ExternalLink,
  Eye,
  ShieldCheck,
  FileWarning,
  MapPin,
  Star,
  ShoppingCart,
  DollarSign
} from 'lucide-react';
import {
  Violation,
  DigitalAsset,
  PLATFORM_LABELS,
  PLATFORM_COLORS,
  SIMILARITY_LEVEL_COLORS
} from '../../../types/imageGuardian';
import SimilarityMeter from './SimilarityMeter';

interface ViolationCardProps {
  violation: Violation;
  originalAsset?: DigitalAsset;
  onViewDetail?: () => void;
  onAddToWhitelist?: () => void;
  onCreateCase?: () => void;
  compact?: boolean;
}

const ViolationCard: React.FC<ViolationCardProps> = ({
  violation,
  originalAsset,
  onViewDetail,
  onAddToWhitelist,
  onCreateCase,
  compact = false
}) => {
  const formatPrice = (price: number, currency: string): string => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: currency === 'TWD' ? 'TWD' : 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatNumber = (num: number): string => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}萬`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  if (compact) {
    return (
      <div
        className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer ${
          SIMILARITY_LEVEL_COLORS[violation.similarity.level].replace('text-', 'border-l-4 border-l-')
        }`}
        onClick={onViewDetail}
      >
        <div className="flex gap-3">
          <img
            src={violation.listing.thumbnailUrl}
            alt={violation.listing.title}
            className="w-16 h-16 rounded object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${PLATFORM_COLORS[violation.platform]}`}>
                {PLATFORM_LABELS[violation.platform]}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${SIMILARITY_LEVEL_COLORS[violation.similarity.level]}`}>
                {violation.similarity.overall.toFixed(0)}%
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 truncate">
              {violation.listing.title}
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span className="font-bold text-red-600">
                {formatPrice(violation.listing.price, violation.listing.currency)}
              </span>
              {violation.listing.salesCount !== undefined && (
                <span>已售 {formatNumber(violation.listing.salesCount)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* 圖片比對區 */}
      <div className="flex">
        {/* 原圖 */}
        {originalAsset && (
          <div className="flex-1 p-4 bg-green-50">
            <p className="text-xs text-green-700 font-medium mb-2 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              原始圖片
            </p>
            <div className="aspect-square rounded-lg overflow-hidden bg-white">
              <img
                src={originalAsset.thumbnailUrl}
                alt={originalAsset.fileName}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 truncate">
              {originalAsset.fileName}
            </p>
          </div>
        )}

        {/* 侵權圖 */}
        <div className="flex-1 p-4 bg-red-50">
          <p className="text-xs text-red-700 font-medium mb-2 flex items-center gap-1">
            <FileWarning className="w-3 h-3" />
            疑似侵權
          </p>
          <div className="aspect-square rounded-lg overflow-hidden bg-white">
            <img
              src={violation.listing.thumbnailUrl}
              alt={violation.listing.title}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500 truncate">
            {violation.listing.title}
          </p>
        </div>
      </div>

      {/* 相似度 */}
      <div className="px-4 py-3 border-t border-b">
        <SimilarityMeter
          score={violation.similarity.overall}
          level={violation.similarity.level}
          showDetails
          size="md"
        />

        {/* 詳細分數 */}
        <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
          <div className="text-center">
            <p className="text-gray-500">pHash</p>
            <p className="font-bold">{violation.similarity.pHashScore.toFixed(1)}%</p>
          </div>
          {violation.similarity.orbScore !== undefined && (
            <div className="text-center">
              <p className="text-gray-500">ORB 特徵</p>
              <p className="font-bold">{violation.similarity.orbScore.toFixed(1)}%</p>
            </div>
          )}
          {violation.similarity.colorScore !== undefined && (
            <div className="text-center">
              <p className="text-gray-500">顏色</p>
              <p className="font-bold">{violation.similarity.colorScore.toFixed(1)}%</p>
            </div>
          )}
        </div>
      </div>

      {/* 商品資訊 */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${PLATFORM_COLORS[violation.platform]}`}>
            {PLATFORM_LABELS[violation.platform]}
          </span>
          <a
            href={violation.listing.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <h3 className="font-medium text-gray-900 line-clamp-2 mb-3">
          {violation.listing.title}
        </h3>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="font-bold text-red-600">
              {formatPrice(violation.listing.price, violation.listing.currency)}
            </span>
          </div>

          {violation.listing.salesCount !== undefined && (
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-gray-400" />
              <span>已售 {formatNumber(violation.listing.salesCount)}</span>
            </div>
          )}

          {violation.listing.rating !== undefined && (
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>{violation.listing.rating.toFixed(1)}</span>
            </div>
          )}

          {violation.listing.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="truncate">{violation.listing.location}</span>
            </div>
          )}
        </div>

        {/* 賣家資訊 */}
        <div className="mt-3 pt-3 border-t">
          <a
            href={violation.listing.sellerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {violation.listing.sellerName}
          </a>
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail?.();
          }}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
        >
          <Eye className="w-4 h-4" />
          查看詳情
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToWhitelist?.();
          }}
          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          <ShieldCheck className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCreateCase?.();
          }}
          className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm"
        >
          <FileWarning className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ViolationCard;
