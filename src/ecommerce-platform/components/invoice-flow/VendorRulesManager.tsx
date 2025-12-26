// Vendor Rules Manager (供應商規則管理元件)
// 讓使用者可以查看、編輯、新增供應商學習規則

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Tag,
  Building2,
  Check,
  X,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  InvoiceCategory,
  VendorRule,
  VendorRulesData,
  VendorStats,
  INVOICE_CATEGORY_LABELS
} from '../../types/invoiceFlow';
import { vendorLearningService } from '../../services/vendorLearningService';

interface VendorRulesManagerProps {
  onClose?: () => void;
}

const VendorRulesManager: React.FC<VendorRulesManagerProps> = ({ onClose }) => {
  const [rules, setRules] = useState<VendorRulesData | null>(null);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<InvoiceCategory | 'all'>('all');
  const [editingVendor, setEditingVendor] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);

  // 新增/編輯表單狀態
  const [formData, setFormData] = useState({
    vendorName: '',
    category: 'other' as InvoiceCategory,
    aliases: '',
    confidence: 0.8,
    notes: ''
  });

  // 載入資料
  const loadData = () => {
    setRules(vendorLearningService.getRules());
    setStats(vendorLearningService.getStats());
  };

  useEffect(() => {
    loadData();
  }, []);

  // 過濾供應商
  const getFilteredVendors = () => {
    if (!rules) return [];

    let entries = Object.entries(rules.rules);

    // 類別過濾
    if (selectedCategory !== 'all') {
      entries = entries.filter(([_, rule]) => rule.category === selectedCategory);
    }

    // 搜尋過濾
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      entries = entries.filter(([name, rule]) =>
        name.toLowerCase().includes(query) ||
        rule.aliases?.some(a => a.toLowerCase().includes(query)) ||
        rule.categoryLabel.includes(searchQuery) ||
        rule.notes?.toLowerCase().includes(query)
      );
    }

    // 按使用次數排序
    return entries.sort((a, b) => (b[1].usageCount || 0) - (a[1].usageCount || 0));
  };

  // 開始編輯
  const startEdit = (vendorName: string, rule: VendorRule) => {
    setEditingVendor(vendorName);
    setFormData({
      vendorName,
      category: rule.category,
      aliases: rule.aliases?.join(', ') || '',
      confidence: rule.confidence,
      notes: rule.notes || ''
    });
    setIsAddingNew(false);
  };

  // 開始新增
  const startAdd = () => {
    setIsAddingNew(true);
    setEditingVendor(null);
    setFormData({
      vendorName: '',
      category: 'other',
      aliases: '',
      confidence: 0.8,
      notes: ''
    });
  };

  // 儲存
  const handleSave = () => {
    const aliasArray = formData.aliases
      .split(',')
      .map(a => a.trim())
      .filter(a => a.length > 0);

    if (isAddingNew) {
      vendorLearningService.addRule(formData.vendorName, formData.category, {
        aliases: aliasArray,
        confidence: formData.confidence,
        notes: formData.notes
      });
    } else if (editingVendor) {
      vendorLearningService.updateRule(editingVendor, {
        category: formData.category,
        aliases: aliasArray,
        confidence: formData.confidence,
        notes: formData.notes
      });
    }

    setEditingVendor(null);
    setIsAddingNew(false);
    loadData();
  };

  // 刪除
  const handleDelete = (vendorName: string) => {
    if (confirm(`確定要刪除 "${vendorName}" 的規則嗎？`)) {
      vendorLearningService.deleteRule(vendorName);
      loadData();
    }
  };

  // 匯出 JSON
  const handleExport = () => {
    const json = vendorLearningService.exportRulesAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendor_rules_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 匯入 JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = vendorLearningService.importRulesFromJSON(content);
      if (result.success) {
        alert(`成功匯入 ${result.imported} 個供應商規則`);
        loadData();
      } else {
        alert(`匯入失敗: ${result.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 重置為預設
  const handleReset = () => {
    if (confirm('確定要重置為預設規則嗎？所有自訂規則將被清除。')) {
      vendorLearningService.resetToDefaults();
      loadData();
    }
  };

  const filteredVendors = getFilteredVendors();

  return (
    <div className="bg-white rounded-lg shadow-lg max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">供應商學習規則</h2>
              <p className="text-sm text-gray-500">Vendor Learning Rules</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{stats.totalVendors}</div>
              <div className="text-xs text-gray-500">供應商數量</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{stats.totalRules}</div>
              <div className="text-xs text-gray-500">規則數量 (含別名)</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{stats.categoryCoverage.length}</div>
              <div className="text-xs text-gray-500">涵蓋類別</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-orange-600">
                {stats.topVendors.reduce((sum, v) => sum + v.usageCount, 0)}
              </div>
              <div className="text-xs text-gray-500">總使用次數</div>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="p-4 border-b flex flex-wrap gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋供應商..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as InvoiceCategory | 'all')}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">所有類別</option>
          {Object.entries(INVOICE_CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        {/* Actions */}
        <button
          onClick={startAdd}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          新增規則
        </button>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          <Download className="w-4 h-4" />
          匯出
        </button>

        <label className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <Upload className="w-4 h-4" />
          匯入
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
        >
          <RefreshCw className="w-4 h-4" />
          重置
        </button>
      </div>

      {/* Add/Edit Form */}
      {(isAddingNew || editingVendor) && (
        <div className="p-4 border-b bg-yellow-50">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-yellow-600" />
            <span className="font-medium">
              {isAddingNew ? '新增供應商規則' : `編輯: ${editingVendor}`}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isAddingNew && (
              <div>
                <label className="block text-sm font-medium mb-1">供應商名稱</label>
                <input
                  type="text"
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="例: PChome"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">分類</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as InvoiceCategory })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {Object.entries(INVOICE_CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">信心度</label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={formData.confidence}
                onChange={(e) => setFormData({ ...formData, confidence: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium mb-1">別名 (逗號分隔)</label>
              <input
                type="text"
                value={formData.aliases}
                onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="例: PC home, 網家"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">備註</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="可選備註"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={isAddingNew && !formData.vendorName}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              儲存
            </button>
            <button
              onClick={() => {
                setIsAddingNew(false);
                setEditingVendor(null);
              }}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
              取消
            </button>
          </div>
        </div>
      )}

      {/* Vendor List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredVendors.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>沒有找到符合條件的供應商規則</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredVendors.map(([vendorName, rule]) => (
              <div
                key={vendorName}
                className="border rounded-lg hover:border-purple-300 transition-colors"
              >
                {/* Main Row */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => setExpandedVendor(expandedVendor === vendorName ? null : vendorName)}
                >
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{vendorName}</div>
                    {rule.aliases && rule.aliases.length > 0 && (
                      <div className="text-xs text-gray-500">
                        別名: {rule.aliases.slice(0, 3).join(', ')}
                        {rule.aliases.length > 3 && ` +${rule.aliases.length - 3}`}
                      </div>
                    )}
                  </div>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {rule.categoryLabel}
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(rule.confidence * 100)}%
                  </span>
                  {rule.usageCount && rule.usageCount > 0 && (
                    <span className="text-xs text-gray-400">
                      使用 {rule.usageCount} 次
                    </span>
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(vendorName, rule);
                      }}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(vendorName);
                      }}
                      className="p-2 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  {expandedVendor === vendorName ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>

                {/* Expanded Details */}
                {expandedVendor === vendorName && (
                  <div className="px-4 pb-4 pt-0 border-t bg-gray-50">
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-gray-500">分類:</span>
                        <span className="ml-2 font-medium">{rule.categoryLabel}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">分類代碼:</span>
                        <span className="ml-2 font-mono text-purple-600">{rule.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">信心度:</span>
                        <span className="ml-2">{Math.round(rule.confidence * 100)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">使用次數:</span>
                        <span className="ml-2">{rule.usageCount || 0}</span>
                      </div>
                      {rule.lastUsed && (
                        <div className="col-span-2">
                          <span className="text-gray-500">最後使用:</span>
                          <span className="ml-2">{new Date(rule.lastUsed).toLocaleString('zh-TW')}</span>
                        </div>
                      )}
                      {rule.notes && (
                        <div className="col-span-2">
                          <span className="text-gray-500">備註:</span>
                          <span className="ml-2">{rule.notes}</span>
                        </div>
                      )}
                      {rule.aliases && rule.aliases.length > 0 && (
                        <div className="col-span-2">
                          <span className="text-gray-500">所有別名:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {rule.aliases.map((alias, i) => (
                              <span key={i} className="px-2 py-0.5 bg-gray-200 rounded text-xs">
                                {alias}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>
            提示：當 OCR 識別到供應商名稱時，系統會自動套用對應的分類規則。
            您也可以手動編輯此 JSON 檔案來新增更多規則。
          </span>
        </div>
      </div>
    </div>
  );
};

export default VendorRulesManager;
