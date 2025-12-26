import React, { useState } from 'react';
import { X, User, Mail, Phone, Percent, CreditCard, AtSign } from 'lucide-react';
import { kolProfileService } from '../../services/affiliateBrainService';
import { KOLProfile, KOLStatus, KOL_STATUS_LABELS } from '../../types/affiliateBrain';

interface KOLFormProps {
  kol?: KOLProfile | null;
  onClose: () => void;
  onSubmit: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  promoCode: string;
  commissionRate: number;
  status: KOLStatus;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  socialMedia: {
    instagram: string;
    youtube: string;
    facebook: string;
    line: string;
  };
  notes: string;
}

export default function KOLForm({ kol, onClose, onSubmit }: KOLFormProps) {
  const isEditing = !!kol;

  const [formData, setFormData] = useState<FormData>({
    name: kol?.name || '',
    email: kol?.email || '',
    phone: kol?.phone || '',
    promoCode: kol?.promoCode || '',
    commissionRate: kol?.commissionRate || 10,
    status: kol?.status || 'pending',
    bankAccount: {
      bankName: kol?.bankAccount?.bankName || '',
      accountNumber: kol?.bankAccount?.accountNumber || '',
      accountName: kol?.bankAccount?.accountName || ''
    },
    socialMedia: {
      instagram: kol?.socialMedia?.instagram || '',
      youtube: kol?.socialMedia?.youtube || '',
      facebook: kol?.socialMedia?.facebook || '',
      line: kol?.socialMedia?.line || ''
    },
    notes: kol?.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '請輸入名稱';
    }

    if (!formData.email.trim()) {
      newErrors.email = '請輸入 Email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email 格式不正確';
    }

    if (!formData.promoCode.trim()) {
      newErrors.promoCode = '請輸入折扣碼';
    } else if (!/^[A-Za-z0-9]+$/.test(formData.promoCode)) {
      newErrors.promoCode = '折扣碼只能包含英文字母和數字';
    }

    if (formData.commissionRate < 0 || formData.commissionRate > 100) {
      newErrors.commissionRate = '分潤比例需在 0-100% 之間';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const kolData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        promoCode: formData.promoCode.trim().toUpperCase(),
        commissionRate: formData.commissionRate,
        status: formData.status,
        bankAccount: formData.bankAccount.bankName ? formData.bankAccount : undefined,
        socialMedia: Object.values(formData.socialMedia).some(v => v)
          ? formData.socialMedia
          : undefined,
        notes: formData.notes.trim() || undefined,
        joinDate: kol?.joinDate || new Date().toISOString().split('T')[0]
      };

      if (isEditing && kol) {
        kolProfileService.update(kol.id, kolData);
      } else {
        kolProfileService.create(kolData);
      }

      onSubmit();
    } catch (error) {
      console.error('Failed to save KOL:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNestedChange = (parent: 'bankAccount' | 'socialMedia', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? '編輯 KOL' : '新增 KOL'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                基本資料
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    名稱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="KOL 名稱"
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="email@example.com"
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    電話
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="0912-345-678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    狀態
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value as KOLStatus)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    {Object.entries(KOL_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Commission Settings */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Percent className="w-4 h-4" />
                分潤設定
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    折扣碼 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.promoCode}
                    onChange={(e) => handleChange('promoCode', e.target.value.toUpperCase())}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono uppercase ${
                      errors.promoCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="例如：MING10"
                  />
                  {errors.promoCode && <p className="text-sm text-red-500 mt-1">{errors.promoCode}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分潤比例 (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.commissionRate}
                    onChange={(e) => handleChange('commissionRate', Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                      errors.commissionRate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.commissionRate && <p className="text-sm text-red-500 mt-1">{errors.commissionRate}</p>}
                </div>
              </div>
            </div>

            {/* Bank Account */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                匯款帳戶（選填）
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    銀行名稱
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccount.bankName}
                    onChange={(e) => handleNestedChange('bankAccount', 'bankName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="中國信託"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    帳戶號碼
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccount.accountNumber}
                    onChange={(e) => handleNestedChange('bankAccount', 'accountNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="帳號"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    戶名
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccount.accountName}
                    onChange={(e) => handleNestedChange('bankAccount', 'accountName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="帳戶戶名"
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AtSign className="w-4 h-4" />
                社群帳號（選填）
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={formData.socialMedia.instagram}
                    onChange={(e) => handleNestedChange('socialMedia', 'instagram', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    YouTube
                  </label>
                  <input
                    type="text"
                    value={formData.socialMedia.youtube}
                    onChange={(e) => handleNestedChange('socialMedia', 'youtube', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="頻道名稱"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook
                  </label>
                  <input
                    type="text"
                    value={formData.socialMedia.facebook}
                    onChange={(e) => handleNestedChange('socialMedia', 'facebook', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="粉絲專頁"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LINE
                  </label>
                  <input
                    type="text"
                    value={formData.socialMedia.line}
                    onChange={(e) => handleNestedChange('socialMedia', 'line', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="LINE ID"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                備註
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                placeholder="其他備註事項..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '處理中...' : isEditing ? '更新' : '新增'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
