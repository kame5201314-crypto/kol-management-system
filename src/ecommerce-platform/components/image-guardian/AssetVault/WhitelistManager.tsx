import React, { useState } from 'react';
import { X, Users, Store, Link, Calendar, FileText, Trash2, ExternalLink, Plus } from 'lucide-react';
import {
  WhitelistEntry,
  PlatformType,
  PLATFORM_LABELS
} from '../../../types/imageGuardian';

interface WhitelistManagerProps {
  entries: WhitelistEntry[];
  onAddEntry: () => void;
  onRemoveEntry: (id: string) => void;
}

// 列表顯示組件
const WhitelistManager: React.FC<WhitelistManagerProps> = ({
  entries,
  onAddEntry,
  onRemoveEntry
}) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">尚無授權賣家</h3>
        <p className="text-gray-500 mb-4">新增授權賣家可在掃描時自動排除，避免誤判</p>
        <button
          onClick={onAddEntry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5" />
          新增授權賣家
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Store className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {entry.sellerName || entry.sellerId}
                  </span>
                  <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded">
                    {PLATFORM_LABELS[entry.platformType] || entry.platformType}
                  </span>
                </div>
                {entry.sellerId && (
                  <p className="text-sm text-gray-500">ID: {entry.sellerId}</p>
                )}
                {entry.expiresAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    授權至：{new Date(entry.expiresAt).toLocaleDateString('zh-TW')}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {entry.storeUrl && (
                <a
                  href={entry.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={() => onRemoveEntry(entry.id)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 新增白名單的 Modal 組件
interface WhitelistAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (entry: Omit<WhitelistEntry, 'id' | 'createdAt'>) => void;
}

export const WhitelistAddModal: React.FC<WhitelistAddModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [formData, setFormData] = useState({
    platformType: 'shopee' as PlatformType,
    sellerName: '',
    sellerId: '',
    storeUrl: '',
    notes: '',
    expiresAt: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.sellerName.trim()) {
      newErrors.sellerName = '請輸入賣家名稱';
    }

    if (!formData.storeUrl.trim()) {
      newErrors.storeUrl = '請輸入賣場連結';
    } else if (!formData.storeUrl.startsWith('http')) {
      newErrors.storeUrl = '請輸入有效的網址';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      onAdd({
        assetId: 'all',
        platformType: formData.platformType,
        sellerId: formData.sellerId.trim() || undefined,
        sellerName: formData.sellerName.trim(),
        storeUrl: formData.storeUrl.trim(),
        authorizedAt: new Date().toISOString(),
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
        notes: formData.notes.trim() || undefined
      });

      // 重置表單
      setFormData({
        platformType: 'shopee',
        sellerName: '',
        sellerId: '',
        storeUrl: '',
        notes: '',
        expiresAt: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Failed to add whitelist entry:', error);
      alert('新增失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">新增授權賣家</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 平台選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Store className="inline w-4 h-4 mr-1" />
              電商平台
            </label>
            <select
              value={formData.platformType}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                platformType: e.target.value as PlatformType
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {Object.entries(PLATFORM_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 賣家名稱 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              賣家名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.sellerName}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                sellerName: e.target.value
              }))}
              placeholder="例如：官方旗艦店"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.sellerName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.sellerName && (
              <p className="mt-1 text-sm text-red-500">{errors.sellerName}</p>
            )}
          </div>

          {/* 賣家 ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              賣家帳號 ID（選填）
            </label>
            <input
              type="text"
              value={formData.sellerId}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                sellerId: e.target.value
              }))}
              placeholder="例如：apexlens_official"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* 賣場連結 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Link className="inline w-4 h-4 mr-1" />
              賣場連結 <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.storeUrl}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                storeUrl: e.target.value
              }))}
              placeholder="https://shopee.tw/..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.storeUrl ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.storeUrl && (
              <p className="mt-1 text-sm text-red-500">{errors.storeUrl}</p>
            )}
          </div>

          {/* 授權到期日 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="inline w-4 h-4 mr-1" />
              授權到期日（選填）
            </label>
            <input
              type="date"
              value={formData.expiresAt}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                expiresAt: e.target.value
              }))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              留空表示永久授權
            </p>
          </div>

          {/* 備註 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="inline w-4 h-4 mr-1" />
              備註（選填）
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              placeholder="例如：年度授權經銷商"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* 提示說明 */}
          <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
            <p className="font-medium mb-1">說明</p>
            <p>
              加入白名單的賣家在掃描時將被自動排除，
              不會被標記為侵權。請確認該賣家已獲得正式授權。
            </p>
          </div>

          {/* 操作按鈕 */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '處理中...' : '新增白名單'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WhitelistManager;
