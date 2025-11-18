import React, { useState, useEffect } from 'react'
import { Wrench, Plus, Image, MessageSquare, CheckCircle, Clock, AlertCircle, User } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface RepairRequest {
  id: string
  property_name: string
  tenant_name: string
  category: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  assigned_to?: string
  images?: string[]
  comments?: Comment[]
}

interface Comment {
  id: string
  user: string
  message: string
  timestamp: string
}

export default function RepairRequests() {
  const [requests, setRequests] = useState<RepairRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<RepairRequest | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')
  const [formData, setFormData] = useState({
    property_name: '',
    tenant_name: '',
    category: '水電',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  })
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    loadRepairRequests()
  }, [])

  const loadRepairRequests = async () => {
    try {
      // TODO: 從 Supabase 載入實際數據
      const mockRequests: RepairRequest[] = [
        {
          id: '1',
          property_name: '台北市大安區公寓 3F',
          tenant_name: '王小明',
          category: '水電',
          description: '浴室水龍頭漏水，需要維修',
          status: 'in_progress',
          priority: 'high',
          created_at: '2025-01-15',
          assigned_to: '張師傅水電行',
          images: [],
          comments: [
            { id: '1', user: '房東', message: '已安排師傅前往查看', timestamp: '2025-01-15 10:30' },
            { id: '2', user: '張師傅', message: '預計今天下午 2 點到場', timestamp: '2025-01-15 11:00' },
          ],
        },
        {
          id: '2',
          property_name: '新北市板橋區套房 5F',
          tenant_name: '李小華',
          category: '家電',
          description: '冰箱不冷了，可能需要維修或更換',
          status: 'pending',
          priority: 'medium',
          created_at: '2025-01-16',
          images: [],
          comments: [],
        },
        {
          id: '3',
          property_name: '台中市西屯區電梯大樓 12F',
          tenant_name: '陳小芳',
          category: '門窗',
          description: '臥室窗戶關不緊，會漏風',
          status: 'pending',
          priority: 'low',
          created_at: '2025-01-17',
          images: [],
          comments: [],
        },
        {
          id: '4',
          property_name: '高雄市前鎮區公寓 7F',
          tenant_name: '張大偉',
          category: '其他',
          description: '客廳天花板有水漬，懷疑樓上漏水',
          status: 'completed',
          priority: 'high',
          created_at: '2025-01-10',
          assigned_to: '專業防水工程',
          images: [],
          comments: [
            { id: '1', user: '房東', message: '已聯繫樓上住戶確認', timestamp: '2025-01-10 14:00' },
            { id: '2', user: '防水師傅', message: '已完成修補，測試無漏水', timestamp: '2025-01-12 16:30' },
          ],
        },
      ]
      setRequests(mockRequests)
    } catch (error) {
      console.error('載入報修記錄失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TODO: 儲存到 Supabase
      console.log('新增報修:', formData)
      await loadRepairRequests()
      setShowForm(false)
      setFormData({
        property_name: '',
        tenant_name: '',
        category: '水電',
        description: '',
        priority: 'medium',
      })
    } catch (error) {
      console.error('新增報修失敗:', error)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: RepairRequest['status']) => {
    try {
      // TODO: 更新 Supabase 數據
      console.log('更新狀態:', id, newStatus)
      await loadRepairRequests()
    } catch (error) {
      console.error('更新狀態失敗:', error)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedRequest) return

    try {
      // TODO: 儲存評論到 Supabase
      console.log('新增評論:', newComment)
      setNewComment('')
      await loadRepairRequests()
    } catch (error) {
      console.error('新增評論失敗:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
            <Clock size={14} />
            待處理
          </span>
        )
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
            <Wrench size={14} />
            處理中
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
            <CheckCircle size={14} />
            已完工
          </span>
        )
      default:
        return null
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800 font-medium">緊急</span>
      case 'medium':
        return <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-800 font-medium">普通</span>
      case 'low':
        return <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800 font-medium">一般</span>
      default:
        return null
    }
  }

  const filteredRequests = requests.filter((req) => {
    if (filter === 'all') return true
    return req.status === filter
  })

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">報修管理</h1>
          <p className="text-gray-600">處理房客報修需求與維修進度追蹤</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          新增報修
        </button>
      </div>

      {/* 新增報修表單 */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">新增報修單</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">報修類別</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="水電">水電</option>
                  <option value="家電">家電</option>
                  <option value="門窗">門窗</option>
                  <option value="漏水">漏水</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">優先等級</label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="low">一般</option>
                  <option value="medium">普通</option>
                  <option value="high">緊急</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">問題描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                提交報修
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 篩選器 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            待處理
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            處理中
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            已完工
          </button>
        </div>
      </div>

      {/* 報修列表 */}
      <div className="grid grid-cols-1 gap-6">
        {filteredRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Wrench className="text-orange-600" size={24} />
                  <h3 className="text-xl font-semibold text-gray-800">{request.property_name}</h3>
                  {getStatusBadge(request.status)}
                  {getPriorityBadge(request.priority)}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>租客：{request.tenant_name}</span>
                  <span>類別：{request.category}</span>
                  <span>日期：{request.created_at}</span>
                </div>
              </div>
              {request.status !== 'completed' && (
                <div className="flex gap-2">
                  {request.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(request.id, 'in_progress')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      開始處理
                    </button>
                  )}
                  {request.status === 'in_progress' && (
                    <button
                      onClick={() => handleUpdateStatus(request.id, 'completed')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      標記完工
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="mb-4">
              <p className="text-gray-700">{request.description}</p>
            </div>

            {request.assigned_to && (
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                <User size={16} />
                <span>指派給：{request.assigned_to}</span>
              </div>
            )}

            {request.comments && request.comments.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MessageSquare size={16} />
                  處理記錄 ({request.comments.length})
                </h4>
                <div className="space-y-3">
                  {request.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-800">{comment.user}</span>
                        <span className="text-xs text-gray-500">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedRequest(request)}
              className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              新增處理記錄
            </button>
          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">沒有符合條件的報修記錄</p>
        </div>
      )}

      {/* 新增評論彈窗 */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">新增處理記錄</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">報修單：{selectedRequest.property_name}</p>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={4}
                placeholder="輸入處理記錄或回覆..."
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleAddComment}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                送出
              </button>
              <button
                onClick={() => {
                  setSelectedRequest(null)
                  setNewComment('')
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
