import React, { useState, useEffect } from 'react'
import { ShoppingBag, Star, MapPin, Phone, Mail, Search, Filter } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Service {
  id: string
  name: string
  category: string
  description: string
  price_range: string
  rating: number
  reviews_count: number
  contact_person: string
  phone: string
  email: string
  location: string
  services_offered: string[]
}

interface ServiceOrder {
  id: string
  service_id: string
  service_name: string
  tenant_name: string
  property_name: string
  scheduled_date: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
}

export default function ServiceMarketplace() {
  const [services, setServices] = useState<Service[]>([])
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'services' | 'orders'>('services')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [orderFormData, setOrderFormData] = useState({
    tenant_name: '',
    property_name: '',
    scheduled_date: '',
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // TODO: 從 Supabase 載入實際數據
      const mockServices: Service[] = [
        {
          id: '1',
          name: '清潔達人專業清潔',
          category: '清潔服務',
          description: '提供居家深度清潔、定期清潔、搬家清潔等服務',
          price_range: 'NT$ 1,500 - 5,000',
          rating: 4.8,
          reviews_count: 156,
          contact_person: '陳小姐',
          phone: '0912-345-678',
          email: 'cleaning@example.com',
          location: '台北市、新北市',
          services_offered: ['居家清潔', '辦公室清潔', '搬家清潔', '裝潢後清潔'],
        },
        {
          id: '2',
          name: '搬家大師物流',
          category: '搬家服務',
          description: '專業搬家團隊，提供包裝、搬運、定位服務',
          price_range: 'NT$ 3,000 - 15,000',
          rating: 4.6,
          reviews_count: 89,
          contact_person: '王先生',
          phone: '0923-456-789',
          email: 'moving@example.com',
          location: '全台服務',
          services_offered: ['家庭搬家', '辦公室搬遷', '鋼琴搬運', '包裝服務'],
        },
        {
          id: '3',
          name: '水電快修',
          category: '水電維修',
          description: '24小時緊急維修，經驗豐富技術團隊',
          price_range: 'NT$ 800 起',
          rating: 4.9,
          reviews_count: 234,
          contact_person: '張師傅',
          phone: '0934-567-890',
          email: 'plumbing@example.com',
          location: '台北市、新北市',
          services_offered: ['水管維修', '電路檢修', '馬桶維修', '燈具安裝'],
        },
        {
          id: '4',
          name: '綠意園藝造景',
          category: '園藝服務',
          description: '專業園藝師提供植栽設計與養護服務',
          price_range: 'NT$ 2,000 - 10,000',
          rating: 4.7,
          reviews_count: 67,
          contact_person: '林先生',
          phone: '0945-678-901',
          email: 'garden@example.com',
          location: '台北市、新北市、桃園市',
          services_offered: ['庭院造景', '植栽養護', '除草修剪', '盆栽設計'],
        },
      ]

      const mockOrders: ServiceOrder[] = [
        {
          id: '1',
          service_id: '1',
          service_name: '清潔達人專業清潔',
          tenant_name: '王小明',
          property_name: '台北市大安區公寓 3F',
          scheduled_date: '2025-01-20',
          status: 'confirmed',
          notes: '請於上午 10 點到達',
        },
        {
          id: '2',
          service_id: '3',
          service_name: '水電快修',
          tenant_name: '李小華',
          property_name: '新北市板橋區套房 5F',
          scheduled_date: '2025-01-18',
          status: 'completed',
        },
      ]

      setServices(mockServices)
      setOrders(mockOrders)
    } catch (error) {
      console.error('載入服務數據失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedService) return

    try {
      // TODO: 儲存訂單到 Supabase
      console.log('預約服務:', { service: selectedService, ...orderFormData })
      await loadData()
      setShowOrderForm(false)
      setSelectedService(null)
      setOrderFormData({
        tenant_name: '',
        property_name: '',
        scheduled_date: '',
        notes: '',
      })
      alert('預約成功！服務提供者將盡快與您聯繫確認。')
    } catch (error) {
      console.error('預約服務失敗:', error)
    }
  }

  const categories = ['all', '清潔服務', '搬家服務', '水電維修', '園藝服務', '其他']

  const filteredServices = services.filter((service) => {
    const matchCategory = selectedCategory === 'all' || service.category === selectedCategory
    const matchSearch =
      searchQuery === '' ||
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  const getOrderStatusBadge = (status: ServiceOrder['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">待確認</span>
      case 'confirmed':
        return <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">已確認</span>
      case 'completed':
        return <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">已完成</span>
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">已取消</span>
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">生活服務市集</h1>
        <p className="text-gray-600">優質服務廠商推薦，讓生活更便利</p>
      </div>

      {/* 標籤切換 */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === 'services'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            服務列表
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === 'orders'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            我的預約
          </button>
        </div>
      </div>

      {activeTab === 'services' && (
        <>
          {/* 搜尋與篩選 */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="搜尋服務..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-gray-600" size={20} />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? '全部類別' : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 服務列表 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredServices.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">{service.name}</h3>
                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                      {service.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-500 fill-current" size={18} />
                    <span className="font-semibold text-gray-800">{service.rating}</span>
                    <span className="text-gray-500 text-sm">({service.reviews_count})</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{service.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex flex-wrap gap-2">
                    {service.services_offered.map((s, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{service.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    <span>{service.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span>{service.email}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">價格範圍</p>
                    <p className="font-semibold text-gray-800">{service.price_range}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedService(service)
                      setShowOrderForm(true)
                    }}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    預約服務
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">沒有找到符合的服務</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">服務名稱</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">租客</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">房源</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">預約日期</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{order.service_name}</td>
                  <td className="px-6 py-4 text-gray-700">{order.tenant_name}</td>
                  <td className="px-6 py-4 text-gray-700">{order.property_name}</td>
                  <td className="px-6 py-4 text-gray-700">{order.scheduled_date}</td>
                  <td className="px-6 py-4">{getOrderStatusBadge(order.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">尚無預約記錄</p>
            </div>
          )}
        </div>
      )}

      {/* 預約表單彈窗 */}
      {showOrderForm && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">預約服務</h3>
            <div className="mb-4 p-4 bg-indigo-50 rounded-lg">
              <p className="font-medium text-gray-800">{selectedService.name}</p>
              <p className="text-sm text-gray-600">{selectedService.category}</p>
              <p className="text-sm text-gray-600 mt-1">{selectedService.price_range}</p>
            </div>
            <form onSubmit={handleOrderSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">租客姓名</label>
                  <input
                    type="text"
                    value={orderFormData.tenant_name}
                    onChange={(e) => setOrderFormData({ ...orderFormData, tenant_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">房源地址</label>
                  <input
                    type="text"
                    value={orderFormData.property_name}
                    onChange={(e) => setOrderFormData({ ...orderFormData, property_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">預約日期</label>
                  <input
                    type="date"
                    value={orderFormData.scheduled_date}
                    onChange={(e) => setOrderFormData({ ...orderFormData, scheduled_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">備註</label>
                  <textarea
                    value={orderFormData.notes}
                    onChange={(e) => setOrderFormData({ ...orderFormData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  確認預約
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowOrderForm(false)
                    setSelectedService(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
