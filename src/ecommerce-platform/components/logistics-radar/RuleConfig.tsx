import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Settings,
  ToggleLeft,
  ToggleRight,
  Edit2,
  Trash2,
  AlertTriangle,
  Clock,
  Bell,
  Save,
  X,
  CheckCircle
} from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import { anomalyRuleService } from '../../services/logisticsRadarService';
import {
  AnomalyRule,
  AnomalySeverity,
  NotificationChannel,
  ShipmentStatus,
  CarrierCode,
  ANOMALY_SEVERITY_LABELS,
  ANOMALY_SEVERITY_COLORS,
  NOTIFICATION_CHANNEL_LABELS,
  CARRIER_LABELS,
  SHIPMENT_STATUS_LABELS
} from '../../types/logisticsRadar';

export default function RuleConfig() {
  const [rules, setRules] = useState<AnomalyRule[]>(() => anomalyRuleService.getAll());
  const [isEditing, setIsEditing] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<AnomalyRule> | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const activeRules = useMemo(() => rules.filter(r => r.isActive), [rules]);

  const handleToggleActive = (id: string) => {
    const updated = anomalyRuleService.toggleActive(id);
    if (updated) {
      setRules(anomalyRuleService.getAll());
    }
  };

  const handleEdit = (rule: AnomalyRule) => {
    setEditingRule({ ...rule });
    setIsEditing(true);
  };

  const handleNewRule = () => {
    setEditingRule({
      name: '',
      description: '',
      isActive: true,
      conditions: {},
      severity: 'medium',
      autoNotifyCustomer: false,
      notificationChannels: ['email']
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editingRule?.name) return;

    if (editingRule.id) {
      // 更新現有規則
      anomalyRuleService.update(editingRule.id, editingRule);
    } else {
      // 建立新規則
      anomalyRuleService.create({
        name: editingRule.name,
        description: editingRule.description || '',
        isActive: editingRule.isActive ?? true,
        conditions: editingRule.conditions || {},
        severity: editingRule.severity || 'medium',
        autoNotifyCustomer: editingRule.autoNotifyCustomer ?? false,
        notificationChannels: editingRule.notificationChannels || ['email'],
        createdBy: '系統管理員'
      });
    }

    setRules(anomalyRuleService.getAll());
    setIsEditing(false);
    setEditingRule(null);
  };

  const handleDelete = (id: string) => {
    anomalyRuleService.delete(id);
    setRules(anomalyRuleService.getAll());
    setShowDeleteConfirm(null);
  };

  const getSeverityIcon = (severity: AnomalySeverity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/ecommerce/logistics"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">異常偵測規則</h1>
            <p className="text-gray-500 mt-1">設定物流異常偵測規則和通知條件</p>
          </div>
        </div>
        <button
          onClick={handleNewRule}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增規則
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Settings className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{rules.length}</p>
              <p className="text-sm text-gray-500">總規則數</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeRules.length}</p>
              <p className="text-sm text-gray-500">已啟用</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {rules.filter(r => r.severity === 'critical' && r.isActive).length}
              </p>
              <p className="text-sm text-gray-500">緊急規則</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">規則列表</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-6 ${!rule.isActive ? 'bg-gray-50 opacity-75' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${rule.isActive ? ANOMALY_SEVERITY_COLORS[rule.severity].replace('text-', 'bg-').split(' ')[0] : 'bg-gray-100'}`}>
                    {getSeverityIcon(rule.severity)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{rule.name}</h4>
                      <StatusBadge
                        label={ANOMALY_SEVERITY_LABELS[rule.severity]}
                        color={rule.isActive ? ANOMALY_SEVERITY_COLORS[rule.severity] : 'bg-gray-100 text-gray-500'}
                        size="sm"
                      />
                      {!rule.isActive && (
                        <StatusBadge label="已停用" color="bg-gray-100 text-gray-500" size="sm" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{rule.description}</p>

                    {/* Conditions */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {rule.conditions.statusUnchangedHours && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          狀態未變 {rule.conditions.statusUnchangedHours} 小時
                        </span>
                      )}
                      {rule.conditions.statusIs && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          狀態 = {SHIPMENT_STATUS_LABELS[rule.conditions.statusIs]}
                        </span>
                      )}
                      {rule.conditions.daysSinceShipped && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          發貨後 {rule.conditions.daysSinceShipped} 天
                        </span>
                      )}
                      {rule.conditions.carrierIs && rule.conditions.carrierIs.length > 0 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          物流商: {rule.conditions.carrierIs.map(c => CARRIER_LABELS[c]).join(', ')}
                        </span>
                      )}
                    </div>

                    {/* Notification Channels */}
                    <div className="flex items-center gap-2 mt-3">
                      <Bell className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {rule.autoNotifyCustomer ? '自動通知客戶：' : '內部通知：'}
                        {rule.notificationChannels.map(ch => NOTIFICATION_CHANNEL_LABELS[ch]).join('、')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(rule.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      rule.isActive
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={rule.isActive ? '停用規則' : '啟用規則'}
                  >
                    {rule.isActive ? (
                      <ToggleRight className="w-6 h-6" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(rule)}
                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(rule.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Delete Confirmation */}
              {showDeleteConfirm === rule.id && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">確定要刪除此規則嗎？此操作無法復原。</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                    >
                      確定刪除
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {rules.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              尚未設定任何規則
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && editingRule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                {editingRule.id ? '編輯規則' : '新增規則'}
              </h3>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingRule(null);
                }}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">規則名稱</label>
                  <input
                    type="text"
                    value={editingRule.name || ''}
                    onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="例如：超商取貨延遲警告"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                  <textarea
                    value={editingRule.description || ''}
                    onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="規則的詳細說明"
                  />
                </div>
              </div>

              {/* Conditions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">觸發條件</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={editingRule.conditions?.statusUnchangedHours || ''}
                      onChange={(e) => setEditingRule({
                        ...editingRule,
                        conditions: { ...editingRule.conditions, statusUnchangedHours: parseInt(e.target.value) || undefined }
                      })}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="時數"
                    />
                    <span className="text-sm text-gray-600">小時內狀態未變更</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={editingRule.conditions?.statusIs || ''}
                      onChange={(e) => setEditingRule({
                        ...editingRule,
                        conditions: { ...editingRule.conditions, statusIs: e.target.value as ShipmentStatus || undefined }
                      })}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">不限狀態</option>
                      {Object.entries(SHIPMENT_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <span className="text-sm text-gray-600">當狀態等於</span>
                  </div>
                </div>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">嚴重程度</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high', 'critical'] as AnomalySeverity[]).map((severity) => (
                    <button
                      key={severity}
                      onClick={() => setEditingRule({ ...editingRule, severity })}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        editingRule.severity === severity
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <StatusBadge
                        label={ANOMALY_SEVERITY_LABELS[severity]}
                        color={ANOMALY_SEVERITY_COLORS[severity]}
                        size="sm"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">通知設定</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingRule.autoNotifyCustomer || false}
                      onChange={(e) => setEditingRule({ ...editingRule, autoNotifyCustomer: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">自動通知客戶</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['sms', 'email', 'line', 'push'] as NotificationChannel[]).map((channel) => (
                      <label
                        key={channel}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                          editingRule.notificationChannels?.includes(channel)
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={editingRule.notificationChannels?.includes(channel) || false}
                          onChange={(e) => {
                            const current = editingRule.notificationChannels || [];
                            setEditingRule({
                              ...editingRule,
                              notificationChannels: e.target.checked
                                ? [...current, channel]
                                : current.filter(c => c !== channel)
                            });
                          }}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm">{NOTIFICATION_CHANNEL_LABELS[channel]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingRule(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!editingRule.name}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
