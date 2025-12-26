import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  Calendar
} from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import { ConfirmModal } from '../shared/Modal';
import { NoDataEmpty } from '../shared/EmptyState';
import { invoiceService } from '../../services/invoiceFlowService';
import {
  Invoice,
  InvoiceStatus,
  InvoiceCategory,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  INVOICE_CATEGORY_LABELS,
  OCR_STATUS_LABELS,
  OCR_STATUS_COLORS
} from '../../types/invoiceFlow';

export default function InvoiceList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>(
    (searchParams.get('status') as InvoiceStatus) || 'all'
  );
  const [categoryFilter, setCategoryFilter] = useState<InvoiceCategory | 'all'>('all');
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; invoiceId: string | null }>({
    isOpen: false,
    invoiceId: null
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchQuery, statusFilter, categoryFilter]);

  const loadInvoices = () => {
    setLoading(true);
    try {
      const data = invoiceService.getAll();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(inv =>
        inv.storeName.toLowerCase().includes(query) ||
        inv.invoiceNumber.toLowerCase().includes(query) ||
        inv.taxId.includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(inv => inv.category === categoryFilter);
    }

    setFilteredInvoices(filtered);
  };

  const handleConfirm = (id: string) => {
    invoiceService.confirm(id, '王小明');
    loadInvoices();
  };

  const handleReject = (id: string) => {
    invoiceService.reject(id, '王小明', '資料不正確');
    loadInvoices();
  };

  const handleDelete = () => {
    if (!deleteConfirm.invoiceId) return;
    invoiceService.delete(deleteConfirm.invoiceId);
    loadInvoices();
    setDeleteConfirm({ isOpen: false, invoiceId: null });
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedInvoices);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedInvoices(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedInvoices.size === filteredInvoices.length) {
      setSelectedInvoices(new Set());
    } else {
      setSelectedInvoices(new Set(filteredInvoices.map(inv => inv.id)));
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const statusCounts = {
    all: invoices.length,
    draft: invoices.filter(inv => inv.status === 'draft').length,
    pending_review: invoices.filter(inv => inv.status === 'pending_review').length,
    confirmed: invoices.filter(inv => inv.status === 'confirmed').length,
    archived: invoices.filter(inv => inv.status === 'archived').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">發票列表</h1>
          <p className="text-gray-500 mt-1">管理所有發票記錄</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            匯出
          </button>
          <Link
            to="/ecommerce/invoice/upload"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            上傳發票
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋商家名稱、發票號碼或統編..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as InvoiceCategory | 'all')}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="all">所有分類</option>
            {Object.entries(INVOICE_CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto">
            {(['all', 'pending_review', 'confirmed', 'draft'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? '全部' : INVOICE_STATUS_LABELS[status]}
                <span className="ml-1.5 opacity-70">({statusCounts[status]})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <NoDataEmpty
            title="沒有找到發票"
            description={searchQuery ? '嘗試使用不同的搜尋條件' : '開始上傳您的第一張發票'}
            action={searchQuery ? undefined : {
              label: '上傳發票',
              onClick: () => window.location.href = '/ecommerce/invoice/upload'
            }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.size === filteredInvoices.length && filteredInvoices.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">日期</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">商家</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">發票號碼</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">分類</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">金額</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">OCR</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">狀態</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.has(invoice.id)}
                        onChange={() => toggleSelect(invoice.id)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">{invoice.invoiceDate}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {invoice.storeName || '未知商家'}
                        </p>
                        <p className="text-xs text-gray-500">{invoice.taxId || '-'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900 font-mono">
                        {invoice.invoiceNumber || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {INVOICE_CATEGORY_LABELS[invoice.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={OCR_STATUS_LABELS[invoice.ocrStatus]}
                        color={OCR_STATUS_COLORS[invoice.ocrStatus]}
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={INVOICE_STATUS_LABELS[invoice.status]}
                        color={INVOICE_STATUS_COLORS[invoice.status]}
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {invoice.status === 'pending_review' && (
                          <>
                            <button
                              onClick={() => handleConfirm(invoice.id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="確認"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(invoice.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="拒絕"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title="編輯"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, invoiceId: invoice.id })}
                          className="p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                          title="刪除"
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

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              顯示 {filteredInvoices.length} 筆結果
            </p>
            {selectedInvoices.size > 0 && (
              <p className="text-sm text-blue-600">
                已選擇 {selectedInvoices.size} 筆
              </p>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, invoiceId: null })}
        onConfirm={handleDelete}
        title="確認刪除"
        message="確定要刪除此發票嗎？此操作無法復原。"
        confirmText="刪除"
        confirmColor="danger"
      />
    </div>
  );
}
