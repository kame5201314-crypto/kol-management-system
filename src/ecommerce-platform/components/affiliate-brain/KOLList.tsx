import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Users,
  DollarSign,
  Instagram,
  Youtube,
  Facebook
} from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import { ConfirmModal } from '../shared/Modal';
import { NoDataEmpty } from '../shared/EmptyState';
import { kolProfileService } from '../../services/affiliateBrainService';
import {
  KOLProfile,
  KOLStatus,
  KOL_STATUS_LABELS,
  KOL_STATUS_COLORS
} from '../../types/affiliateBrain';
import KOLForm from './KOLForm';

export default function KOLList() {
  const [kols, setKOLs] = useState<KOLProfile[]>([]);
  const [filteredKOLs, setFilteredKOLs] = useState<KOLProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<KOLStatus | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingKOL, setEditingKOL] = useState<KOLProfile | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; kolId: string | null }>({
    isOpen: false,
    kolId: null
  });

  useEffect(() => {
    loadKOLs();
  }, []);

  useEffect(() => {
    filterKOLs();
  }, [kols, searchQuery, statusFilter]);

  const loadKOLs = () => {
    setLoading(true);
    try {
      const data = kolProfileService.getAll();
      setKOLs(data);
    } catch (error) {
      console.error('Failed to load KOLs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterKOLs = () => {
    let filtered = [...kols];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(k =>
        k.name.toLowerCase().includes(query) ||
        k.email.toLowerCase().includes(query) ||
        k.promoCode.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(k => k.status === statusFilter);
    }

    setFilteredKOLs(filtered);
  };

  const handleDelete = async () => {
    if (!deleteConfirm.kolId) return;

    try {
      kolProfileService.delete(deleteConfirm.kolId);
      loadKOLs();
      setDeleteConfirm({ isOpen: false, kolId: null });
    } catch (error) {
      console.error('Failed to delete KOL:', error);
    }
  };

  const handleFormSubmit = () => {
    loadKOLs();
    setIsFormOpen(false);
    setEditingKOL(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-500" />;
      case 'facebook':
        return <Facebook className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const statusCounts = {
    all: kols.length,
    active: kols.filter(k => k.status === 'active').length,
    inactive: kols.filter(k => k.status === 'inactive').length,
    pending: kols.filter(k => k.status === 'pending').length,
    suspended: kols.filter(k => k.status === 'suspended').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KOL 管理</h1>
          <p className="text-gray-500 mt-1">管理合作的 KOL 和團購主</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增 KOL
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋 KOL 名稱、Email 或折扣碼..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {(['all', 'active', 'inactive', 'pending'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? '全部' : KOL_STATUS_LABELS[status]}
                <span className="ml-1.5 opacity-70">({statusCounts[status]})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KOL Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredKOLs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <NoDataEmpty
            title="沒有找到 KOL"
            description={searchQuery ? '嘗試使用不同的搜尋條件' : '開始新增您的第一位合作夥伴'}
            action={searchQuery ? undefined : {
              label: '新增 KOL',
              onClick: () => setIsFormOpen(true)
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredKOLs.map((kol) => (
            <div
              key={kol.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
                      {kol.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{kol.name}</h3>
                      <p className="text-sm text-white/80">{kol.email}</p>
                    </div>
                  </div>
                  <StatusBadge
                    label={KOL_STATUS_LABELS[kol.status]}
                    color={kol.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-white/20 text-white'}
                    size="sm"
                  />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                {/* Promo Code */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">折扣碼</p>
                  <div className="flex items-center justify-between">
                    <code className="text-lg font-mono font-bold text-indigo-600">
                      {kol.promoCode}
                    </code>
                    <span className="text-sm text-gray-500">{kol.commissionRate}% 分潤</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">累計銷售</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(kol.totalSales)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">待發傭金</p>
                    <p className="text-lg font-semibold text-orange-600">
                      {formatCurrency(kol.pendingCommission)}
                    </p>
                  </div>
                </div>

                {/* Social Media */}
                {kol.socialMedia && (
                  <div className="flex gap-2 mb-4">
                    {kol.socialMedia.instagram && getSocialIcon('instagram')}
                    {kol.socialMedia.youtube && getSocialIcon('youtube')}
                    {kol.socialMedia.facebook && getSocialIcon('facebook')}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setEditingKOL(kol);
                      setIsFormOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    編輯
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ isOpen: true, kolId: kol.id })}
                    className="px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KOL Form Modal */}
      {isFormOpen && (
        <KOLForm
          kol={editingKOL}
          onClose={() => {
            setIsFormOpen(false);
            setEditingKOL(null);
          }}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, kolId: null })}
        onConfirm={handleDelete}
        title="確認刪除"
        message="確定要刪除此 KOL 嗎？此操作無法復原。"
        confirmText="刪除"
        confirmColor="danger"
      />
    </div>
  );
}
