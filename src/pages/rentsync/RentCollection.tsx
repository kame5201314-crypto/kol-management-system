import React, { useState, useEffect } from 'react'
import { DollarSign, CheckCircle, Clock, AlertCircle, Send, Download, Filter } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface RentPayment {
  id: string
  property_name: string
  tenant_name: string
  amount: number
  due_date: string
  paid_date?: string
  status: 'paid' | 'pending' | 'overdue'
  payment_method?: string
  notes?: string
}

export default function RentCollection() {
  const [payments, setPayments] = useState<RentPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all')
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<RentPayment | null>(null)

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      // TODO: 從 Supabase 載入實際數據
      const mockPayments: RentPayment[] = [
        {
          id: '1',
          property_name: '台北市大安區公寓 3F',
          tenant_name: '王小明',
          amount: 25000,
          due_date: '2025-01-05',
          paid_date: '2025-01-03',
          status: 'paid',
          payment_method: '轉帳',
          notes: '已確認收款',
        },
        {
          id: '2',
          property_name: '新北市板橋區套房 5F',
          tenant_name: '李小華',
          amount: 18000,
          due_date: '2025-01-05',
          status: 'pending',
        },
        {
          id: '3',
          property_name: '台中市西屯區電梯大樓 12F',
          tenant_name: '陳小芳',
          amount: 22000,
          due_date: '2024-12-05',
          status: 'overdue',
        },
        {
          id: '4',
          property_name: '高雄市前鎮區公寓 7F',
          tenant_name: '張大偉',
          amount: 19000,
          due_date: '2025-01-05',
          status: 'pending',
        },
      ]
      setPayments(mockPayments)
    } catch (error) {
      console.error('載入收租記錄失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsPaid = async (payment: RentPayment) => {
    try {
      // TODO: 更新 Supabase 數據
      console.log('標記為已繳:', payment.id)
      await loadPayments()
    } catch (error) {
      console.error('更新付款狀態失敗:', error)
    }
  }

  const handleSendReminder = (payment: RentPayment) => {
    setSelectedPayment(payment)
    setShowReminderModal(true)
  }

  const sendReminder = async () => {
    try {
      // TODO: 實作發送提醒功能（Email / LINE）
      console.log('發送提醒給:', selectedPayment?.tenant_name)
      setShowReminderModal(false)
      setSelectedPayment(null)
    } catch (error) {
      console.error('發送提醒失敗:', error)
    }
  }

  const handleExportReport = () => {
    // TODO: 實作匯出報表功能（CSV / PDF）
    alert('匯出收租報表')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
            <CheckCircle size={14} />
            已繳納
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
            <Clock size={14} />
            待繳納
          </span>
        )
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
            <AlertCircle size={14} />
            已逾期
          </span>
        )
      default:
        return null
    }
  }

  const filteredPayments = payments.filter((payment) => {
    if (filter === 'all') return true
    return payment.status === filter
  })

  const stats = {
    total: payments.reduce((sum, p) => sum + p.amount, 0),
    paid: payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    pending: payments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    overdue: payments.filter((p) => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">收租管理</h1>
          <p className="text-gray-600">追蹤租金繳納狀況與發送提醒</p>
        </div>
        <button
          onClick={handleExportReport}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download size={20} />
          匯出報表
        </button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">總應收金額</p>
              <p className="text-2xl font-bold text-blue-600">NT$ {stats.total.toLocaleString()}</p>
            </div>
            <DollarSign className="text-blue-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">已收金額</p>
              <p className="text-2xl font-bold text-green-600">NT$ {stats.paid.toLocaleString()}</p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">待收金額</p>
              <p className="text-2xl font-bold text-yellow-600">NT$ {stats.pending.toLocaleString()}</p>
            </div>
            <Clock className="text-yellow-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">逾期金額</p>
              <p className="text-2xl font-bold text-red-600">NT$ {stats.overdue.toLocaleString()}</p>
            </div>
            <AlertCircle className="text-red-600" size={32} />
          </div>
        </div>
      </div>

      {/* 篩選器 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="text-gray-600" size={20} />
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'paid'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              已繳納
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              待繳納
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'overdue'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              已逾期
            </button>
          </div>
        </div>
      </div>

      {/* 付款記錄列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">房源</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">租客</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">金額</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">應繳日期</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">狀態</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-800">{payment.property_name}</p>
                </td>
                <td className="px-6 py-4 text-gray-700">{payment.tenant_name}</td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-800">NT$ {payment.amount.toLocaleString()}</p>
                </td>
                <td className="px-6 py-4 text-gray-700">{payment.due_date}</td>
                <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {payment.status !== 'paid' && (
                      <>
                        <button
                          onClick={() => handleMarkAsPaid(payment)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm"
                        >
                          標記已繳
                        </button>
                        <button
                          onClick={() => handleSendReminder(payment)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="發送提醒"
                        >
                          <Send size={18} />
                        </button>
                      </>
                    )}
                    {payment.status === 'paid' && payment.paid_date && (
                      <p className="text-sm text-gray-600">繳納日：{payment.paid_date}</p>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">沒有符合條件的記錄</p>
          </div>
        )}
      </div>

      {/* 發送提醒彈窗 */}
      {showReminderModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">發送繳租提醒</h3>
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                <span className="font-medium">租客：</span>{selectedPayment.tenant_name}
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-medium">房源：</span>{selectedPayment.property_name}
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-medium">金額：</span>NT$ {selectedPayment.amount.toLocaleString()}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">應繳日期：</span>{selectedPayment.due_date}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">提醒方式</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-gray-700">Email</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-gray-700">LINE 訊息</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-gray-700">SMS 簡訊</span>
                </label>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={sendReminder}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                發送提醒
              </button>
              <button
                onClick={() => {
                  setShowReminderModal(false)
                  setSelectedPayment(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
