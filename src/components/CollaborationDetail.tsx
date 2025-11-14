import React, { useState } from 'react';
import { Collaboration, KOL, ProfitShareRecord, Reminder, SalesTracking } from '../types/kol';
import { ArrowLeft, DollarSign, Calendar, Bell, Plus, Edit2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface CollaborationDetailProps {
  collaboration: Collaboration;
  kol: KOL;
  salesTracking?: SalesTracking;
  onBack: () => void;
  onSaveProfitShare: (collaborationId: number, profitShare: Partial<ProfitShareRecord>) => void;
  onDeleteProfitShare: (collaborationId: number, profitShareId: string) => void;
  onSaveReminder: (collaborationId: number, reminder: Partial<Reminder>) => void;
  onDeleteReminder: (collaborationId: number, reminderId: string) => void;
  onToggleReminderComplete: (collaborationId: number, reminderId: string) => void;
}

const CollaborationDetail: React.FC<CollaborationDetailProps> = ({
  collaboration,
  kol,
  salesTracking,
  onBack,
  onSaveProfitShare,
  onDeleteProfitShare,
  onSaveReminder,
  onDeleteReminder,
  onToggleReminderComplete,
}) => {
  const [showProfitShareForm, setShowProfitShareForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [editingProfitShare, setEditingProfitShare] = useState<ProfitShareRecord | null>(null);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  // 分潤表單資料
  const [profitShareFormData, setProfitShareFormData] = useState({
    settlementDate: '',
    period: 'monthly' as any,
    periodStart: '',
    periodEnd: '',
    salesAmount: 0,
    profitShareRate: 0,
    bonusAmount: 0,
    note: ''
  });

  // 提醒表單資料
  const [reminderFormData, setReminderFormData] = useState({
    type: 'deadline' as any,
    title: '',
    description: '',
    reminderDate: ''
  });

  const profitShares = collaboration.profitShares || [];
  const reminders = collaboration.reminders || [];

  // 計算總分潤金額
  const totalProfitAmount = profitShares.reduce((sum, ps) => {
    return sum + (ps.totalAmount || ps.profitAmount + (ps.bonusAmount || 0));
  }, 0);

  const handleAddProfitShare = () => {
    setEditingProfitShare(null);
    setProfitShareFormData({
      settlementDate: new Date().toISOString().split('T')[0],
      period: 'monthly',
      periodStart: collaboration.startDate,
      periodEnd: collaboration.endDate,
      salesAmount: 0,
      profitShareRate: 0,
      bonusAmount: 0,
      note: ''
    });
    setShowProfitShareForm(true);
  };

  const handleEditProfitShare = (ps: ProfitShareRecord) => {
    setEditingProfitShare(ps);
    setProfitShareFormData({
      settlementDate: ps.settlementDate,
      period: ps.period,
      periodStart: ps.periodStart,
      periodEnd: ps.periodEnd,
      salesAmount: ps.salesAmount,
      profitShareRate: ps.profitShareRate,
      bonusAmount: ps.bonusAmount || 0,
      note: ps.note || ''
    });
    setShowProfitShareForm(true);
  };

  const handleSubmitProfitShare = (e: React.FormEvent) => {
    e.preventDefault();
    const profitAmount = (profitShareFormData.salesAmount * profitShareFormData.profitShareRate) / 100;
    const totalAmount = profitAmount + profitShareFormData.bonusAmount;

    const data = {
      ...profitShareFormData,
      profitAmount,
      totalAmount,
      id: editingProfitShare?.id || `ps-${Date.now()}`,
      collaborationId: collaboration.id,
      kolId: collaboration.kolId,
      createdAt: editingProfitShare?.createdAt || new Date().toISOString()
    };

    onSaveProfitShare(collaboration.id, data);
    setShowProfitShareForm(false);
  };

  const handleAddReminder = () => {
    setEditingReminder(null);
    setReminderFormData({
      type: 'deadline',
      title: '',
      description: '',
      reminderDate: new Date().toISOString().split('T')[0]
    });
    setShowReminderForm(true);
  };

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setReminderFormData({
      type: reminder.type,
      title: reminder.title,
      description: reminder.description,
      reminderDate: reminder.reminderDate
    });
    setShowReminderForm(true);
  };

  const handleSubmitReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...reminderFormData,
      id: editingReminder?.id || `reminder-${Date.now()}`,
      collaborationId: collaboration.id,
      kolId: collaboration.kolId,
      isCompleted: editingReminder?.isCompleted || false,
      createdAt: editingReminder?.createdAt || new Date().toISOString()
    };

    onSaveReminder(collaboration.id, data);
    setShowReminderForm(false);
  };

  const getPeriodText = (period: string) => {
    const map: { [key: string]: string } = {
      'monthly': '每月',
      'quarterly': '每季',
      'semi-annual': '每半年',
      'yearly': '每年'
    };
    return map[period] || period;
  };

  const getReminderTypeText = (type: string) => {
    const map: { [key: string]: string } = {
      'deadline': '截止日期',
      'payment': '付款提醒',
      'content_delivery': '內容交付',
      'follow_up': '後續追蹤',
      'other': '其他'
    };
    return map[type] || type;
  };

  const getReminderTypeColor = (type: string) => {
    const map: { [key: string]: string } = {
      'deadline': 'bg-red-100 text-red-700',
      'payment': 'bg-green-100 text-green-700',
      'content_delivery': 'bg-blue-100 text-blue-700',
      'follow_up': 'bg-yellow-100 text-yellow-700',
      'other': 'bg-gray-100 text-gray-700'
    };
    return map[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* 返回按鈕 */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={20} />
        返回列表
      </button>

      {/* 專案資訊 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{collaboration.projectName}</h2>
          <p className="text-gray-600 mt-1">商品：{collaboration.productName}</p>
          <p className="text-gray-600">KOL：{kol.name} {kol.nickname && `(@${kol.nickname})`}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">專案期間</p>
            <p className="text-lg font-semibold text-gray-800">{collaboration.startDate} ~ {collaboration.endDate}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">預算</p>
            <p className="text-lg font-semibold text-green-600">NT$ {collaboration.budget.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">實際費用</p>
            <p className="text-lg font-semibold text-purple-600">NT$ {collaboration.actualCost.toLocaleString()}</p>
          </div>
        </div>

        {salesTracking && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="text-md font-semibold text-gray-700 mb-3">銷售成效</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600">點擊數</p>
                <p className="text-lg font-bold text-blue-600">{salesTracking.clicks.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600">轉換數</p>
                <p className="text-lg font-bold text-green-600">{salesTracking.conversions.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-600">收益</p>
                <p className="text-lg font-bold text-purple-600">NT$ {salesTracking.revenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-xs text-gray-600">佣金</p>
                <p className="text-lg font-bold text-orange-600">NT$ {salesTracking.commission.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 分潤管理 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <DollarSign className="text-green-600" size={24} />
            分潤管理
          </h3>
          <button
            onClick={handleAddProfitShare}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <Plus size={18} />
            新增分潤
          </button>
        </div>

        {profitShares.length > 0 ? (
          <div className="space-y-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
              <p className="text-sm text-gray-600">總分潤金額</p>
              <p className="text-2xl font-bold text-green-600">NT$ {totalProfitAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{profitShares.length} 筆分潤記錄</p>
            </div>

            {profitShares.map(ps => (
              <div key={ps.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">結算日期：{ps.settlementDate}</p>
                    <p className="text-sm text-gray-600">期間：{ps.periodStart} ~ {ps.periodEnd} ({getPeriodText(ps.period)})</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProfitShare(ps)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteProfitShare(collaboration.id, ps.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">銷售金額</p>
                    <p className="text-sm font-semibold text-gray-800">NT$ {ps.salesAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">分潤比例</p>
                    <p className="text-sm font-semibold text-blue-600">{ps.profitShareRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">分潤金額</p>
                    <p className="text-sm font-semibold text-green-600">NT$ {ps.profitAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">總金額 (含獎金)</p>
                    <p className="text-sm font-semibold text-purple-600">NT$ {(ps.totalAmount || ps.profitAmount).toLocaleString()}</p>
                  </div>
                </div>
                {ps.note && (
                  <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">備註：{ps.note}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">尚無分潤記錄</p>
        )}
      </div>

      {/* 提醒管理 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Bell className="text-blue-600" size={24} />
            提醒事項
          </h3>
          <button
            onClick={handleAddReminder}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            新增提醒
          </button>
        </div>

        {reminders.length > 0 ? (
          <div className="space-y-3">
            {reminders.map(reminder => (
              <div
                key={reminder.id}
                className={`border rounded-lg p-4 ${reminder.isCompleted ? 'bg-gray-50 border-gray-300' : 'border-blue-200 bg-blue-50'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => onToggleReminderComplete(collaboration.id, reminder.id)}
                      className="mt-1"
                    >
                      {reminder.isCompleted ? (
                        <CheckCircle className="text-green-600" size={20} />
                      ) : (
                        <AlertCircle className="text-blue-600" size={20} />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold ${reminder.isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                          {reminder.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getReminderTypeColor(reminder.type)}`}>
                          {getReminderTypeText(reminder.type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{reminder.description}</p>
                      <p className="text-xs text-gray-500">
                        <Calendar size={14} className="inline mr-1" />
                        提醒日期：{reminder.reminderDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditReminder(reminder)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-md"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteReminder(collaboration.id, reminder.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">尚無提醒事項</p>
        )}
      </div>

      {/* 分潤表單 Modal */}
      {showProfitShareForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {editingProfitShare ? '編輯分潤記錄' : '新增分潤記錄'}
              </h3>
              <form onSubmit={handleSubmitProfitShare} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">結算日期 *</label>
                    <input
                      type="date"
                      required
                      value={profitShareFormData.settlementDate}
                      onChange={(e) => setProfitShareFormData({ ...profitShareFormData, settlementDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">分潤週期 *</label>
                    <select
                      value={profitShareFormData.period}
                      onChange={(e) => setProfitShareFormData({ ...profitShareFormData, period: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="monthly">每月</option>
                      <option value="quarterly">每季</option>
                      <option value="semi-annual">每半年</option>
                      <option value="yearly">每年</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">期間開始 *</label>
                    <input
                      type="date"
                      required
                      value={profitShareFormData.periodStart}
                      onChange={(e) => setProfitShareFormData({ ...profitShareFormData, periodStart: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">期間結束 *</label>
                    <input
                      type="date"
                      required
                      value={profitShareFormData.periodEnd}
                      onChange={(e) => setProfitShareFormData({ ...profitShareFormData, periodEnd: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">銷售金額 (NT$) *</label>
                    <input
                      type="number"
                      required
                      value={profitShareFormData.salesAmount}
                      onChange={(e) => setProfitShareFormData({ ...profitShareFormData, salesAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">分潤比例 (%) *</label>
                    <input
                      type="number"
                      required
                      step="0.1"
                      value={profitShareFormData.profitShareRate}
                      onChange={(e) => setProfitShareFormData({ ...profitShareFormData, profitShareRate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">額外獎金 (NT$)</label>
                    <input
                      type="number"
                      value={profitShareFormData.bonusAmount}
                      onChange={(e) => setProfitShareFormData({ ...profitShareFormData, bonusAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">預估分潤金額</label>
                    <input
                      type="text"
                      disabled
                      value={`NT$ ${((profitShareFormData.salesAmount * profitShareFormData.profitShareRate) / 100 + profitShareFormData.bonusAmount).toLocaleString()}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
                  <textarea
                    value={profitShareFormData.note}
                    onChange={(e) => setProfitShareFormData({ ...profitShareFormData, note: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                  >
                    {editingProfitShare ? '更新' : '新增'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProfitShareForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 提醒表單 Modal */}
      {showReminderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {editingReminder ? '編輯提醒事項' : '新增提醒事項'}
              </h3>
              <form onSubmit={handleSubmitReminder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">提醒類型 *</label>
                  <select
                    value={reminderFormData.type}
                    onChange={(e) => setReminderFormData({ ...reminderFormData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="deadline">截止日期</option>
                    <option value="payment">付款提醒</option>
                    <option value="content_delivery">內容交付</option>
                    <option value="follow_up">後續追蹤</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">提醒標題 *</label>
                  <input
                    type="text"
                    required
                    value={reminderFormData.title}
                    onChange={(e) => setReminderFormData({ ...reminderFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">提醒描述 *</label>
                  <textarea
                    required
                    value={reminderFormData.description}
                    onChange={(e) => setReminderFormData({ ...reminderFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">提醒日期 *</label>
                  <input
                    type="date"
                    required
                    value={reminderFormData.reminderDate}
                    onChange={(e) => setReminderFormData({ ...reminderFormData, reminderDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {editingReminder ? '更新' : '新增'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReminderForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborationDetail;
