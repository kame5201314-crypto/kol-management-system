import React, { useState, useEffect } from 'react'
import { Bell, Plus, Send, Edit, Trash2, Users, User, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Notification {
  id: string
  title: string
  content: string
  type: 'announcement' | 'reminder' | 'alert'
  target: 'all' | 'individual'
  recipients?: string[]
  sender: string
  created_at: string
  read_by?: string[]
}

export default function RentSyncNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'announcement' as 'announcement' | 'reminder' | 'alert',
    target: 'all' as 'all' | 'individual',
    recipients: [] as string[],
  })

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      // TODO: 從 Supabase 載入實際數據
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: '【重要通知】社區停水公告',
          content: '各位住戶好，本週六 (1/20) 上午 8:00 至下午 5:00 將進行水管維修工程，期間將停水。請提前儲水，造成不便敬請見諒。',
          type: 'announcement',
          target: 'all',
          sender: '管理處',
          created_at: '2025-01-15',
          read_by: ['user1', 'user2'],
        },
        {
          id: '2',
          title: '租金繳納提醒',
          content: '王小明先生您好，本月租金 NT$ 25,000 將於 1/5 到期，請記得準時繳納。謝謝！',
          type: 'reminder',
          target: 'individual',
          recipients: ['王小明'],
          sender: '房東',
          created_at: '2025-01-03',
          read_by: ['user1'],
        },
        {
          id: '3',
          title: '【緊急】電梯維修通知',
          content: '大樓電梯發生故障，維修人員已在處理中。預計今日下午 6 點前修復完成。造成不便請見諒。',
          type: 'alert',
          target: 'all',
          sender: '管理處',
          created_at: '2025-01-17',
          read_by: [],
        },
        {
          id: '4',
          title: '租約到期提醒',
          content: '陳小芳小姐您好，您的租約將於 2025-05-31 到期，若有續約需求請提前告知。謝謝！',
          type: 'reminder',
          target: 'individual',
          recipients: ['陳小芳'],
          sender: '房東',
          created_at: '2025-01-16',
          read_by: [],
        },
      ]
      setNotifications(mockNotifications)
    } catch (error) {
      console.error('載入通知失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TODO: 儲存到 Supabase 並發送通知
      console.log('發送通知:', formData)
      await loadNotifications()
      setShowForm(false)
      setFormData({
        title: '',
        content: '',
        type: 'announcement',
        target: 'all',
        recipients: [],
      })
      alert('通知已發送！')
    } catch (error) {
      console.error('發送通知失敗:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此通知嗎？')) return

    try {
      // TODO: 從 Supabase 刪除
      console.log('刪除通知:', id)
      await loadNotifications()
    } catch (error) {
      console.error('刪除通知失敗:', error)
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'announcement':
        return <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">公告</span>
      case 'reminder':
        return <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">提醒</span>
      case 'alert':
        return <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">緊急</span>
      default:
        return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <Bell className="text-blue-600" size={24} />
      case 'reminder':
        return <Calendar className="text-yellow-600" size={24} />
      case 'alert':
        return <Bell className="text-red-600 animate-pulse" size={24} />
      default:
        return <Bell className="text-gray-600" size={24} />
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">通知公告</h1>
          <p className="text-gray-600">發送社區公告與個人訊息</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          發送通知
        </button>
      </div>

      {/* 發送通知表單 */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">發送新通知</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">通知標題</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="輸入通知標題"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">通知內容</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={5}
                  placeholder="輸入詳細內容"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">通知類型</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as 'announcement' | 'reminder' | 'alert' })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="announcement">一般公告</option>
                    <option value="reminder">提醒通知</option>
                    <option value="alert">緊急通知</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">發送對象</label>
                  <select
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value as 'all' | 'individual' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">所有住戶</option>
                    <option value="individual">指定住戶</option>
                  </select>
                </div>
              </div>
              {formData.target === 'individual' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">指定住戶（以逗號分隔）</label>
                  <input
                    type="text"
                    placeholder="例如：王小明, 李小華"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    onChange={(e) =>
                      setFormData({ ...formData, recipients: e.target.value.split(',').map((s) => s.trim()) })
                    }
                  />
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Send size={18} />
                發送通知
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

      {/* 通知列表 */}
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="mt-1">{getTypeIcon(notification.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{notification.title}</h3>
                    {getTypeBadge(notification.type)}
                  </div>
                  <p className="text-gray-700 mb-3 whitespace-pre-line">{notification.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      {notification.target === 'all' ? (
                        <>
                          <Users size={16} />
                          <span>所有住戶</span>
                        </>
                      ) : (
                        <>
                          <User size={16} />
                          <span>
                            {notification.recipients && notification.recipients.length > 0
                              ? notification.recipients.join(', ')
                              : '指定住戶'}
                          </span>
                        </>
                      )}
                    </div>
                    <span>•</span>
                    <span>發送者：{notification.sender}</span>
                    <span>•</span>
                    <span>{notification.created_at}</span>
                    {notification.read_by && notification.read_by.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-green-600">{notification.read_by.length} 人已讀</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  title="編輯"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="刪除"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">尚無通知記錄</p>
        </div>
      )}

      {/* 使用提示 */}
      <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-6 rounded">
        <h4 className="font-semibold text-blue-900 mb-2">使用說明</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• 一般公告：適用於社區活動、設施維護等一般性通知</li>
          <li>• 提醒通知：適用於租金提醒、租約到期等需要行動的提醒</li>
          <li>• 緊急通知：適用於停水停電、安全警示等緊急事項</li>
          <li>• 可選擇發送給所有住戶或指定特定住戶</li>
          <li>• 系統將透過 Email、APP 推播等方式發送通知</li>
        </ul>
      </div>
    </div>
  )
}
