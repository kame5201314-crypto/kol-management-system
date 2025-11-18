import React, { useState, useEffect } from 'react'
import { DollarSign, Home, Wrench, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface DashboardStats {
  totalRent: number
  collectedRent: number
  pendingRent: number
  overdueRent: number
  totalProperties: number
  occupiedProperties: number
  vacantProperties: number
  activeRepairs: number
  completedRepairs: number
  occupancyRate: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRent: 0,
    collectedRent: 0,
    pendingRent: 0,
    overdueRent: 0,
    totalProperties: 0,
    occupiedProperties: 0,
    vacantProperties: 0,
    activeRepairs: 0,
    completedRepairs: 0,
    occupancyRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // TODO: 從 Supabase 載入實際數據
      // 這裡先使用模擬數據
      setStats({
        totalRent: 250000,
        collectedRent: 180000,
        pendingRent: 50000,
        overdueRent: 20000,
        totalProperties: 20,
        occupiedProperties: 16,
        vacantProperties: 4,
        activeRepairs: 5,
        completedRepairs: 12,
        occupancyRate: 80,
      })
    } catch (error) {
      console.error('載入儀表板數據失敗:', error)
    } finally {
      setLoading(false)
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

  const StatCard = ({ title, value, subtitle, icon: Icon, color, bgColor }: any) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`${bgColor} p-3 rounded-lg`}>
          <Icon size={24} className={color} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">儀表板總覽</h1>
        <p className="text-gray-600">RentSync 好住管家 - 租賃管理一目了然</p>
      </div>

      {/* 租金總覽 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">租金收繳狀況</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="本月應收租金"
            value={`NT$ ${stats.totalRent.toLocaleString()}`}
            icon={DollarSign}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            title="已收租金"
            value={`NT$ ${stats.collectedRent.toLocaleString()}`}
            subtitle={`收繳率: ${Math.round((stats.collectedRent / stats.totalRent) * 100)}%`}
            icon={CheckCircle}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <StatCard
            title="待收租金"
            value={`NT$ ${stats.pendingRent.toLocaleString()}`}
            icon={AlertCircle}
            color="text-yellow-600"
            bgColor="bg-yellow-50"
          />
          <StatCard
            title="逾期租金"
            value={`NT$ ${stats.overdueRent.toLocaleString()}`}
            icon={AlertCircle}
            color="text-red-600"
            bgColor="bg-red-50"
          />
        </div>
      </div>

      {/* 房源與報修狀況 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">房源入住狀況</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Home className="text-blue-600" size={20} />
                <span className="text-gray-700">總房源數</span>
              </div>
              <span className="text-xl font-bold text-gray-800">{stats.totalProperties}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={20} />
                <span className="text-gray-700">已出租</span>
              </div>
              <span className="text-xl font-bold text-green-600">{stats.occupiedProperties}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-yellow-600" size={20} />
                <span className="text-gray-700">空置中</span>
              </div>
              <span className="text-xl font-bold text-yellow-600">{stats.vacantProperties}</span>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-semibold">入住率</span>
                <span className="text-2xl font-bold text-blue-600">{stats.occupancyRate}%</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stats.occupancyRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">報修單進度</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wrench className="text-orange-600" size={20} />
                <span className="text-gray-700">處理中</span>
              </div>
              <span className="text-xl font-bold text-orange-600">{stats.activeRepairs}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={20} />
                <span className="text-gray-700">已完工</span>
              </div>
              <span className="text-xl font-bold text-green-600">{stats.completedRepairs}</span>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">待處理報修</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      有 {stats.activeRepairs} 件報修單需要您的關注
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">快速操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
            <DollarSign className="text-indigo-600" size={24} />
            <div className="text-left">
              <p className="font-semibold text-gray-800">發送租金提醒</p>
              <p className="text-sm text-gray-600">提醒租客繳納租金</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors">
            <TrendingUp className="text-green-600" size={24} />
            <div className="text-left">
              <p className="font-semibold text-gray-800">匯出報表</p>
              <p className="text-sm text-gray-600">下載收租明細</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
            <Wrench className="text-orange-600" size={24} />
            <div className="text-left">
              <p className="font-semibold text-gray-800">查看報修</p>
              <p className="text-sm text-gray-600">處理待辦事項</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
