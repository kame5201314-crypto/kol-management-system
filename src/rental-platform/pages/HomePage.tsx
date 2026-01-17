import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Map,
  Train,
  Building2,
  TrendingUp,
  Users,
  Home,
  ArrowRight
} from 'lucide-react';
import SearchBox from '../components/search/SearchBox';
import PropertyCard from '../components/property/PropertyCard';
import { propertyService } from '../services';
import { RentalProperty } from '../types';
import { POPULAR_CITIES } from '../data/taiwanAreas';

export default function HomePage() {
  const [popularProperties, setPopularProperties] = useState<RentalProperty[]>([]);
  const [latestProperties, setLatestProperties] = useState<RentalProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = () => {
    setIsLoading(true);
    try {
      const popular = propertyService.getPopular(6);
      const latest = propertyService.getLatest(6);
      setPopularProperties(popular);
      setLatestProperties(latest);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    { icon: Building2, label: '房源數量', value: '50,000+' },
    { icon: Users, label: '活躍用戶', value: '100,000+' },
    { icon: TrendingUp, label: '每日成交', value: '500+' },
    { icon: Home, label: '合作房東', value: '10,000+' },
  ];

  const quickLinks = [
    { icon: Map, label: '地圖找房', to: '/rental/map', desc: '用地圖找到理想位置' },
    { icon: Train, label: '捷運找房', to: '/rental/search?nearbyMRT=true', desc: '靠近捷運站的好物件' },
    { icon: Building2, label: '新建案', to: '/rental/search?buildingAge=5', desc: '屋齡五年內的新房' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500 to-orange-600 py-20 px-4">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            找到你的理想租屋
          </h1>
          <p className="text-xl text-white/90 mb-8">
            全台最大的租屋平台，超過 50,000 間房源等你來挑選
          </p>

          {/* Search Box */}
          <SearchBox variant="hero" />

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
                <stat.icon className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                to={link.to}
                className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl hover:bg-orange-50 hover:shadow-md transition-all group"
              >
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                  <link.icon className="w-7 h-7 text-orange-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-orange-500 transition-colors">
                    {link.label}
                  </h3>
                  <p className="text-sm text-gray-500">{link.desc}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 ml-auto group-hover:text-orange-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cities Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">熱門地區</h2>
            <Link
              to="/rental/search"
              className="text-orange-500 hover:text-orange-600 flex items-center gap-1"
            >
              查看全部
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {POPULAR_CITIES.map(city => (
              <Link
                key={city.key}
                to={`/rental/search?city=${encodeURIComponent(city.name)}`}
                className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow group"
              >
                <div className="text-lg font-medium text-gray-900 group-hover:text-orange-500 transition-colors">
                  {city.name}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {city.propertyCount.toLocaleString()} 間
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Properties Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">熱門物件</h2>
            <Link
              to="/rental/search?sortBy=popular"
              className="text-orange-500 hover:text-orange-600 flex items-center gap-1"
            >
              查看更多
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Properties Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">最新物件</h2>
            <Link
              to="/rental/search?sortBy=newest"
              className="text-orange-500 hover:text-orange-600 flex items-center gap-1"
            >
              查看更多
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            你有房屋要出租嗎？
          </h2>
          <p className="text-xl text-white/90 mb-8">
            立即刊登物件，快速找到優質房客
          </p>
          <Link
            to="/rental/create-listing"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-500 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <Building2 className="w-5 h-5" />
            免費刊登物件
          </Link>
        </div>
      </section>
    </div>
  );
}
