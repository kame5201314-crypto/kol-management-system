import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, Search, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoriteContext';
import PropertyCard from '../components/property/PropertyCard';

export default function FavoritesPage() {
  const { user, isAuthenticated } = useAuth();
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites();

  // 需要登入才能查看收藏
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">請先登入</h2>
          <p className="text-gray-500 mb-6">登入後即可查看您的收藏列表</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 頁面標題 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-7 h-7 text-orange-500" />
              我的收藏
            </h1>
            <p className="text-gray-500 mt-1">
              共 {favorites.length} 個收藏房源
            </p>
          </div>

          {favorites.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('確定要清空所有收藏嗎？')) {
                  clearFavorites();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              <span>清空收藏</span>
            </button>
          )}
        </div>

        {/* 收藏列表 */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Heart className="w-20 h-20 text-gray-200 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              還沒有收藏任何房源
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              瀏覽房源時，點擊愛心圖示即可將喜歡的房源加入收藏，方便日後比較查看
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/rental/search"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                <Search className="w-5 h-5" />
                開始找房
              </Link>
              <Link
                to="/rental"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <Home className="w-5 h-5" />
                返回首頁
              </Link>
            </div>
          </div>
        )}

        {/* 推薦提示 */}
        {favorites.length > 0 && favorites.length < 5 && (
          <div className="mt-8 bg-orange-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-orange-800 mb-2">
              小提示
            </h3>
            <p className="text-orange-700">
              多收藏幾個喜歡的房源，方便您進行比較。建議至少收藏 5-10 個房源再做決定！
            </p>
            <Link
              to="/rental/search"
              className="inline-flex items-center gap-2 mt-4 text-orange-600 hover:text-orange-700 font-medium"
            >
              繼續瀏覽更多房源
              <span>→</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
