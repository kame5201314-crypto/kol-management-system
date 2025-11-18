import React, { useState, useEffect } from 'react'
import { Plus, FileText, Download, Mail, Edit, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Contract {
  id: string
  property_name: string
  tenant_name: string
  tenant_email: string
  tenant_phone: string
  start_date: string
  end_date: string
  monthly_rent: number
  deposit: number
  status: 'active' | 'expiring_soon' | 'expired'
  created_at: string
}

export default function RentContracts() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [formData, setFormData] = useState({
    property_name: '',
    tenant_name: '',
    tenant_email: '',
    tenant_phone: '',
    start_date: '',
    end_date: '',
    monthly_rent: 0,
    deposit: 0,
  })

  useEffect(() => {
    loadContracts()
  }, [])

  const loadContracts = async () => {
    try {
      // TODO: 從 Supabase 載入實際數據
      // 暫時使用模擬數據
      const mockContracts: Contract[] = [
        {
          id: '1',
          property_name: '台北市大安區公寓 3F',
          tenant_name: '王小明',
          tenant_email: 'wang@example.com',
          tenant_phone: '0912-345-678',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          monthly_rent: 25000,
          deposit: 50000,
          status: 'active',
          created_at: '2023-12-15',
        },
        {
          id: '2',
          property_name: '新北市板橋區套房 5F',
          tenant_name: '李小華',
          tenant_email: 'lee@example.com',
          tenant_phone: '0923-456-789',
          start_date: '2024-03-01',
          end_date: '2025-02-28',
          monthly_rent: 18000,
          deposit: 36000,
          status: 'active',
          created_at: '2024-02-10',
        },
        {
          id: '3',
          property_name: '台中市西屯區電梯大樓 12F',
          tenant_name: '陳小芳',
          tenant_email: 'chen@example.com',
          tenant_phone: '0934-567-890',
          start_date: '2024-06-01',
          end_date: '2025-05-31',
          monthly_rent: 22000,
          deposit: 44000,
          status: 'expiring_soon',
          created_at: '2024-05-20',
        },
      ]
      setContracts(mockContracts)
    } catch (error) {
      console.error('載入租約失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TODO: 儲存到 Supabase
      console.log('新增/編輯租約:', formData)

      // 重新載入數據
      await loadContracts()

      // 重置表單
      setShowForm(false)
      setEditingContract(null)
      setFormData({
        property_name: '',
        tenant_name: '',
        tenant_email: '',
        tenant_phone: '',
        start_date: '',
        end_date: '',
        monthly_rent: 0,
        deposit: 0,
      })
    } catch (error) {
      console.error('儲存租約失敗:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此租約嗎？')) return

    try {
      // TODO: 從 Supabase 刪除
      console.log('刪除租約:', id)
      await loadContracts()
    } catch (error) {
      console.error('刪除租約失敗:', error)
    }
  }

  const handleDownloadPDF = (contract: Contract) => {
    // TODO: 實作 PDF 生成功能
    alert(`下載租約 PDF: ${contract.property_name}`)
  }

  const handleSendEmail = (contract: Contract) => {
    // TODO: 實作 Email 發送功能
    alert(`發送租約至: ${contract.tenant_email}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
            <CheckCircle size={14} />
            有效中
          </span>
        )
      case 'expiring_soon':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
            <Clock size={14} />
            即將到期
          </span>
        )
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
            <AlertCircle size={14} />
            已到期
          </span>
        )
      default:
        return null
    }
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">租約管理</h1>
          <p className="text-gray-600">管理所有房源租賃合約</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          新增租約
        </button>
      </div>

      {/* 新增/編輯表單 */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {editingContract ? '編輯租約' : '新增租約'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">房源名稱</label>
                <input
                  type="text"
                  value={formData.property_name}
                  onChange={(e) => setFormData({ ...formData, property_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">租客姓名</label>
                <input
                  type="text"
                  value={formData.tenant_name}
                  onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">租客 Email</label>
                <input
                  type="email"
                  value={formData.tenant_email}
                  onChange={(e) => setFormData({ ...formData, tenant_email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">租客電話</label>
                <input
                  type="tel"
                  value={formData.tenant_phone}
                  onChange={(e) => setFormData({ ...formData, tenant_phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">租約起始日</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">租約到期日</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">月租金 (NT$)</label>
                <input
                  type="number"
                  value={formData.monthly_rent}
                  onChange={(e) => setFormData({ ...formData, monthly_rent: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">押金 (NT$)</label>
                <input
                  type="number"
                  value={formData.deposit}
                  onChange={(e) => setFormData({ ...formData, deposit: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                儲存租約
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingContract(null)
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 租約列表 */}
      <div className="grid grid-cols-1 gap-6">
        {contracts.map((contract) => (
          <div key={contract.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="text-indigo-600" size={24} />
                  <h3 className="text-xl font-semibold text-gray-800">{contract.property_name}</h3>
                  {getStatusBadge(contract.status)}
                </div>
                <p className="text-gray-600">租客：{contract.tenant_name}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadPDF(contract)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="下載 PDF"
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={() => handleSendEmail(contract)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="發送 Email"
                >
                  <Mail size={20} />
                </button>
                <button
                  onClick={() => {
                    setEditingContract(contract)
                    setFormData({
                      property_name: contract.property_name,
                      tenant_name: contract.tenant_name,
                      tenant_email: contract.tenant_email,
                      tenant_phone: contract.tenant_phone,
                      start_date: contract.start_date,
                      end_date: contract.end_date,
                      monthly_rent: contract.monthly_rent,
                      deposit: contract.deposit,
                    })
                    setShowForm(true)
                  }}
                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  title="編輯"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(contract.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="刪除"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-500">租約期間</p>
                <p className="font-semibold text-gray-800">
                  {contract.start_date} ~ {contract.end_date}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">月租金</p>
                <p className="font-semibold text-gray-800">NT$ {contract.monthly_rent.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">押金</p>
                <p className="font-semibold text-gray-800">NT$ {contract.deposit.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">聯絡方式</p>
                <p className="font-semibold text-gray-800">{contract.tenant_phone}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {contracts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">尚無租約資料，點擊「新增租約」開始建立</p>
        </div>
      )}
    </div>
  )
}
