import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronDown } from 'lucide-react';
import { getCityList, getDistrictList, TAIWAN_CITIES } from '../../data/taiwanAreas';

interface SearchBoxProps {
  variant?: 'default' | 'hero';
  initialCity?: string;
  initialKeyword?: string;
}

export default function SearchBox({ variant = 'default', initialCity, initialKeyword }: SearchBoxProps) {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState(initialKeyword || '');
  const [selectedCity, setSelectedCity] = useState(initialCity || '');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const cities = getCityList();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (selectedCity) params.set('city', selectedCity);
    navigate(`/rental/search?${params.toString()}`);
  };

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    setShowCityDropdown(false);
  };

  if (variant === 'hero') {
    return (
      <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-2">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* City Selector */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                className="flex items-center justify-between w-full sm:w-40 px-4 py-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className={selectedCity ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedCity || '選擇地區'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showCityDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowCityDropdown(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-2 z-20 max-h-60 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => handleCitySelect('')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-500"
                    >
                      不限地區
                    </button>
                    {cities.map(city => (
                      <button
                        key={city.key}
                        type="button"
                        onClick={() => handleCitySelect(city.name)}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                          selectedCity === city.name ? 'text-orange-500 bg-orange-50' : 'text-gray-700'
                        }`}
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Keyword Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="輸入關鍵字、地址或捷運站..."
                className="w-full px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              <Search className="w-5 h-5" />
              <span>搜尋</span>
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowCityDropdown(!showCityDropdown)}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:border-gray-400 transition-colors"
        >
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className={selectedCity ? 'text-gray-900' : 'text-gray-400'}>
            {selectedCity || '地區'}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {showCityDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowCityDropdown(false)}
            />
            <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-lg shadow-lg py-2 z-20 max-h-60 overflow-y-auto">
              <button
                type="button"
                onClick={() => handleCitySelect('')}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-500 text-sm"
              >
                不限地區
              </button>
              {cities.map(city => (
                <button
                  key={city.key}
                  type="button"
                  onClick={() => handleCitySelect(city.name)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-100 text-sm ${
                    selectedCity === city.name ? 'text-orange-500 bg-orange-50' : 'text-gray-700'
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="搜尋關鍵字..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
        />
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
      >
        搜尋
      </button>
    </form>
  );
}
