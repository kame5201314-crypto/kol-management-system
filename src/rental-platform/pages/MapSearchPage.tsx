import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { List, MapPin, X, Heart, Filter, ChevronDown } from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { useFavorites } from '../contexts/FavoriteContext';
import { TAIWAN_CITIES, POPULAR_CITIES } from '../data/taiwanAreas';
import { PROPERTY_TYPES, PRICE_RANGES } from '../data/amenities';
import { RentalProperty, PropertyType } from '../types';
import 'leaflet/dist/leaflet.css';

// 修復 Leaflet 預設圖標問題
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 自定義價格標記圖標
const createPriceIcon = (price: number, isSelected: boolean = false) => {
  const displayPrice = price >= 10000 ? `${(price / 10000).toFixed(1)}萬` : `${(price / 1000).toFixed(0)}k`;

  return L.divIcon({
    className: 'custom-price-marker',
    html: `
      <div style="
        background: ${isSelected ? '#f97316' : 'white'};
        color: ${isSelected ? 'white' : '#1f2937'};
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        border: 2px solid ${isSelected ? '#f97316' : '#e5e7eb'};
        white-space: nowrap;
      ">
        $${displayPrice}
      </div>
    `,
    iconSize: [60, 30],
    iconAnchor: [30, 30],
  });
};

// 地圖控制組件 - 用於更新地圖中心
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

export default function MapSearchPage() {
  const { isFavorited, toggleFavorite } = useFavorites();
  const [properties, setProperties] = useState<RentalProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<RentalProperty | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showList, setShowList] = useState(false);

  // 篩選條件
  const [filters, setFilters] = useState({
    city: 'taipei',
    propertyType: '' as PropertyType | '',
    priceRange: '',
  });

  // 地圖中心
  const [mapCenter, setMapCenter] = useState<[number, number]>([25.0330, 121.5654]);

  // 載入房源資料
  useEffect(() => {
    const result = propertyService.search({
      city: TAIWAN_CITIES[filters.city]?.name || '',
      propertyType: filters.propertyType || undefined,
      priceMin: filters.priceRange ? PRICE_RANGES.find(r => r.label === filters.priceRange)?.min : undefined,
      priceMax: filters.priceRange ? PRICE_RANGES.find(r => r.label === filters.priceRange)?.max : undefined,
      limit: 50,
    });
    setProperties(result.properties);
  }, [filters]);

  // 更新地圖中心當城市改變
  useEffect(() => {
    const city = TAIWAN_CITIES[filters.city];
    if (city) {
      setMapCenter([city.lat, city.lng]);
    }
  }, [filters.city]);

  // 為每個房源生成隨機座標（基於城市中心）
  const propertiesWithCoords = useMemo(() => {
    const city = TAIWAN_CITIES[filters.city];
    const baseLat = city?.lat || 25.0330;
    const baseLng = city?.lng || 121.5654;

    return properties.map(property => ({
      ...property,
      coords: {
        lat: baseLat + (Math.random() - 0.5) * 0.05,
        lng: baseLng + (Math.random() - 0.5) * 0.05,
      },
    }));
  }, [properties, filters.city]);

  const handleCityChange = (cityKey: string) => {
    setFilters(prev => ({ ...prev, city: cityKey }));
    setSelectedProperty(null);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* 頂部篩選欄 */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-4 z-20">
        <Link to="/rental" className="text-gray-600 hover:text-gray-900">
          <X className="w-6 h-6" />
        </Link>

        <h1 className="text-lg font-semibold">地圖找房</h1>

        {/* 城市選擇 */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto">
          {POPULAR_CITIES.slice(0, 6).map(city => {
            const cityKey = Object.entries(TAIWAN_CITIES).find(([_, c]) => c.name === city.name)?.[0] || '';
            return (
              <button
                key={cityKey}
                onClick={() => handleCityChange(cityKey)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  filters.city === cityKey
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {city.name}
              </button>
            );
          })}
        </div>

        {/* 篩選按鈕 */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            showFilters ? 'border-orange-500 text-orange-500' : 'border-gray-300 text-gray-700'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>篩選</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* 列表按鈕 */}
        <button
          onClick={() => setShowList(!showList)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            showList ? 'border-orange-500 text-orange-500' : 'border-gray-300 text-gray-700'
          }`}
        >
          <List className="w-4 h-4" />
          <span className="hidden sm:inline">列表</span>
        </button>
      </div>

      {/* 篩選面板 */}
      {showFilters && (
        <div className="bg-white border-b px-4 py-4 z-10">
          <div className="flex flex-wrap gap-4">
            {/* 房屋類型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">房屋類型</label>
              <select
                value={filters.propertyType}
                onChange={e => setFilters(prev => ({ ...prev, propertyType: e.target.value as PropertyType | '' }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">不限</option>
                {PROPERTY_TYPES.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            {/* 價格範圍 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">租金範圍</label>
              <select
                value={filters.priceRange}
                onChange={e => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">不限</option>
                {PRICE_RANGES.map(range => (
                  <option key={range.label} value={range.label}>{range.label}</option>
                ))}
              </select>
            </div>

            {/* 清除篩選 */}
            <button
              onClick={() => setFilters(prev => ({ ...prev, propertyType: '', priceRange: '' }))}
              className="self-end px-4 py-2 text-orange-500 hover:bg-orange-50 rounded-lg text-sm"
            >
              清除篩選
            </button>
          </div>
        </div>
      )}

      {/* 主要內容區 */}
      <div className="flex-1 flex relative">
        {/* 地圖 */}
        <div className={`flex-1 ${showList ? 'hidden md:block' : ''}`}>
          <MapContainer
            center={mapCenter}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <MapController center={mapCenter} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {propertiesWithCoords.map(property => (
              <Marker
                key={property.id}
                position={[property.coords.lat, property.coords.lng]}
                icon={createPriceIcon(property.pricing.rent, selectedProperty?.id === property.id)}
                eventHandlers={{
                  click: () => setSelectedProperty(property),
                }}
              >
                <Popup>
                  <div className="w-64 p-0">
                    <Link to={`/rental/property/${property.id}`}>
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-32 object-cover rounded-t"
                      />
                    </Link>
                    <div className="p-3">
                      <Link
                        to={`/rental/property/${property.id}`}
                        className="font-semibold text-gray-900 hover:text-orange-500 line-clamp-1"
                      >
                        {property.title}
                      </Link>
                      <p className="text-orange-500 font-bold mt-1">
                        ${property.pricing.rent.toLocaleString()} /月
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {property.location.district} · {property.area}坪
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* 房源列表側邊欄 */}
        {showList && (
          <div className="w-full md:w-96 bg-white border-l overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="font-semibold">
                找到 {properties.length} 間房源
              </h3>
            </div>
            <div className="divide-y">
              {propertiesWithCoords.map(property => (
                <div
                  key={property.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${
                    selectedProperty?.id === property.id ? 'bg-orange-50' : ''
                  }`}
                  onClick={() => {
                    setSelectedProperty(property);
                    setMapCenter([property.coords.lat, property.coords.lng]);
                  }}
                >
                  <div className="flex gap-4">
                    <Link to={`/rental/property/${property.id}`}>
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/rental/property/${property.id}`}
                        className="font-semibold text-gray-900 hover:text-orange-500 line-clamp-2"
                      >
                        {property.title}
                      </Link>
                      <p className="text-orange-500 font-bold mt-1">
                        ${property.pricing.rent.toLocaleString()} /月
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {property.location.district} · {property.area}坪 ·
                        {property.layout.bedrooms}房{property.layout.livingRooms}廳
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {PROPERTY_TYPES.find(t => t.id === property.propertyType)?.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(property.id);
                          }}
                          className={`p-1.5 rounded-full transition-colors ${
                            isFavorited(property.id)
                              ? 'text-red-500 bg-red-50'
                              : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                          }`}
                        >
                          <Heart
                            className="w-4 h-4"
                            fill={isFavorited(property.id) ? 'currentColor' : 'none'}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 選中的房源詳情卡 (移動端) */}
        {selectedProperty && !showList && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-xl shadow-xl overflow-hidden z-10">
            <button
              onClick={() => setSelectedProperty(null)}
              className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <Link to={`/rental/property/${selectedProperty.id}`}>
              <img
                src={selectedProperty.images[0]}
                alt={selectedProperty.title}
                className="w-full h-40 object-cover"
              />
            </Link>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/rental/property/${selectedProperty.id}`}
                    className="font-semibold text-gray-900 hover:text-orange-500 line-clamp-1"
                  >
                    {selectedProperty.title}
                  </Link>
                  <p className="text-orange-500 font-bold text-lg mt-1">
                    ${selectedProperty.pricing.rent.toLocaleString()} /月
                  </p>
                </div>
                <button
                  onClick={() => toggleFavorite(selectedProperty.id)}
                  className={`p-2 rounded-full transition-colors ${
                    isFavorited(selectedProperty.id)
                      ? 'text-red-500 bg-red-50'
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Heart
                    className="w-5 h-5"
                    fill={isFavorited(selectedProperty.id) ? 'currentColor' : 'none'}
                  />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{selectedProperty.location.district}</span>
                <span>·</span>
                <span>{selectedProperty.area}坪</span>
                <span>·</span>
                <span>{selectedProperty.layout.bedrooms}房{selectedProperty.layout.livingRooms}廳</span>
              </div>
              <Link
                to={`/rental/property/${selectedProperty.id}`}
                className="mt-4 block w-full py-2 bg-orange-500 text-white text-center rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                查看詳情
              </Link>
            </div>
          </div>
        )}

        {/* 房源數量指示 */}
        <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-full shadow-md z-10">
          <span className="text-sm font-medium">
            {properties.length} 間房源
          </span>
        </div>
      </div>
    </div>
  );
}
