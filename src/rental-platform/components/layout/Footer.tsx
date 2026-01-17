import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 關於我們 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-8 h-8 text-orange-500" />
              <span className="text-xl font-bold text-white">591租屋網</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              台灣最大的租屋平台，提供最豐富的房源資訊，讓您輕鬆找到理想的租屋。
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* 快速連結 */}
          <div>
            <h3 className="text-white font-semibold mb-4">快速連結</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/rental/search" className="text-gray-400 hover:text-white transition-colors">
                  找房子
                </Link>
              </li>
              <li>
                <Link to="/rental/map" className="text-gray-400 hover:text-white transition-colors">
                  地圖找房
                </Link>
              </li>
              <li>
                <Link to="/rental/create-listing" className="text-gray-400 hover:text-white transition-colors">
                  刊登物件
                </Link>
              </li>
              <li>
                <Link to="/rental/register" className="text-gray-400 hover:text-white transition-colors">
                  加入會員
                </Link>
              </li>
            </ul>
          </div>

          {/* 房型分類 */}
          <div>
            <h3 className="text-white font-semibold mb-4">房型分類</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/rental/search?propertyType=suite" className="text-gray-400 hover:text-white transition-colors">
                  獨立套房
                </Link>
              </li>
              <li>
                <Link to="/rental/search?propertyType=apartment" className="text-gray-400 hover:text-white transition-colors">
                  公寓
                </Link>
              </li>
              <li>
                <Link to="/rental/search?propertyType=whole_floor" className="text-gray-400 hover:text-white transition-colors">
                  整層住家
                </Link>
              </li>
              <li>
                <Link to="/rental/search?propertyType=studio" className="text-gray-400 hover:text-white transition-colors">
                  雅房
                </Link>
              </li>
            </ul>
          </div>

          {/* 聯絡我們 */}
          <div>
            <h3 className="text-white font-semibold mb-4">聯絡我們</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-500" />
                <span className="text-gray-400">02-1234-5678</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-500" />
                <span className="text-gray-400">service@591.com.tw</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-500 mt-0.5" />
                <span className="text-gray-400">台北市信義區信義路五段7號</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              &copy; {currentYear} 591租屋網. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                服務條款
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                隱私權政策
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                常見問題
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
