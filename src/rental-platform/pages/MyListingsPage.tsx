import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Plus, Edit2, Trash2, Eye, AlertCircle, MoreVertical } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { propertyService } from '../services/propertyService';
import { RentalProperty } from '../types';
import { PROPERTY_TYPES } from '../data/amenities';

export default function MyListingsPage() {
  const { user, isAuthenticated } = useAuth();
  const [listings, setListings] = useState<RentalProperty[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const userListings = propertyService.getByLandlord(user.id);
      setListings(userListings);
    }
  }, [user]);

  // 需要登入
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">請先登入</h2>
          <p className="text-gray-500 mb-6">登入後即可管理您的房源</p>
          <Link
            to="/rental/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            立即登入
          </Link>
        </div>
      </div>
    );
  }

  // 需要房東身份
  if (user?.role !== 'landlord') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">僅限房東使用</h2>
          <p className="text-gray-500 mb-6">您需要房東帳號才能管理房源</p>
          <Link
            to="/rental"
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            返回首頁
          </Link>
        </div>
      </div>
    );
  }

  const handleDelete = (propertyId: string) => {
    if (window.confirm('確定要刪除這個房源嗎？此操作無法復原。')) {
      propertyService.delete(propertyId);
      setListings(prev => prev.filter(p => p.id !== propertyId));
    }
    setActiveMenu(null);
  };

  const handleToggleStatus = (property: RentalProperty) => {
    const newStatus = property.status === 'available' ? 'rented' : 'available';
    propertyService.update(property.id, { status: newStatus });
    setListings(prev =>
      prev.map(p => (p.id === property.id ? { ...p, status: newStatus } : p))
    );
    setActiveMenu(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">出租中</span>;
      case 'rented':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">已出租</span>;
      case 'reserved':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">已預訂</span>;
      default:
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">待審核</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 頁面標題 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Home className="w-7 h-7 text-orange-500" />
              我的房源
            </h1>
            <p className="text-gray-500 mt-1">
              共 {listings.length} 個房源
            </p>
          </div>

          <Link
            to="/rental/create-listing"
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>刊登房源</span>
          </Link>
        </div>

        {/* 房源列表 */}
        {listings.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">房源</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">類型</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">租金</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">狀態</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">瀏覽</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {listings.map(property => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="min-w-0">
                            <Link
                              to={`/rental/property/${property.id}`}
                              className="font-medium text-gray-900 hover:text-orange-500 line-clamp-1"
                            >
                              {property.title}
                            </Link>
                            <p className="text-sm text-gray-500 mt-1">
                              {property.location.city} {property.location.district}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {PROPERTY_TYPES.find(t => t.id === property.propertyType)?.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-orange-500">
                          ${property.pricing.rent.toLocaleString()}
                        </span>
                        <span className="text-gray-500 text-sm">/月</span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(property.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {property.viewCount.toLocaleString()} 次
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenu(activeMenu === property.id ? null : property.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-500" />
                          </button>

                          {activeMenu === property.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                              <Link
                                to={`/rental/property/${property.id}`}
                                className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50"
                              >
                                <Eye className="w-4 h-4" />
                                查看詳情
                              </Link>
                              <button
                                onClick={() => handleToggleStatus(property)}
                                className="w-full flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50"
                              >
                                <Edit2 className="w-4 h-4" />
                                {property.status === 'available' ? '標記已出租' : '重新上架'}
                              </button>
                              <button
                                onClick={() => handleDelete(property.id)}
                                className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                                刪除房源
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Home className="w-20 h-20 text-gray-200 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              還沒有刊登任何房源
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              刊登您的第一個房源，開始尋找理想租客！
            </p>
            <Link
              to="/rental/create-listing"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              刊登房源
            </Link>
          </div>
        )}

        {/* 統計摘要 */}
        {listings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500">總房源數</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{listings.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500">出租中</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {listings.filter(l => l.status === 'available').length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500">已出租</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">
                {listings.filter(l => l.status === 'rented').length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500">總瀏覽數</p>
              <p className="text-2xl font-bold text-orange-500 mt-1">
                {listings.reduce((sum, l) => sum + l.viewCount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
