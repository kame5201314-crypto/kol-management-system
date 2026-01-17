import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Map as MapIcon
} from 'lucide-react';
import PropertyCard from '../components/property/PropertyCard';
import SearchBox from '../components/search/SearchBox';
import { propertyService } from '../services';
import { RentalProperty, PropertySearchFilters, PropertyType, PROPERTY_TYPE_LABELS } from '../types';
import { getCityList, getDistrictList, TAIWAN_CITIES } from '../data/taiwanAreas';
import { PRICE_RANGES, AREA_RANGES, BEDROOM_OPTIONS, QUICK_FILTER_AMENITIES } from '../data/amenities';

type ViewMode = 'grid' | 'list';
type SortBy = 'newest' | 'price_asc' | 'price_desc' | 'popular';

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'newest', label: '最新上架' },
  { value: 'price_asc', label: '租金低到高' },
  { value: 'price_desc', label: '租金高到低' },
  { value: 'popular', label: '熱門程度' },
];

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<RentalProperty[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    propertyType: true,
    price: true,
    area: false,
    bedrooms: false,
    amenities: false,
  });

  // Filter states
  const [filters, setFilters] = useState<PropertySearchFilters>({
    keyword: searchParams.get('keyword') || '',
    city: searchParams.get('city') || '',
    district: searchParams.getAll('district') || [],
    propertyType: (searchParams.getAll('propertyType') as PropertyType[]) || [],
    priceMin: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : undefined,
    priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : undefined,
    areaMin: searchParams.get('areaMin') ? Number(searchParams.get('areaMin')) : undefined,
    areaMax: searchParams.get('areaMax') ? Number(searchParams.get('areaMax')) : undefined,
    bedrooms: searchParams.getAll('bedrooms').map(Number) || [],
    amenities: searchParams.getAll('amenities') || [],
    sortBy: (searchParams.get('sortBy') as SortBy) || 'newest',
    page: Number(searchParams.get('page')) || 1,
    pageSize: 12,
  });

  const [currentPage, setCurrentPage] = useState(filters.page || 1);
  const [totalPages, setTotalPages] = useState(1);

  const cities = getCityList();
  const districts = filters.city
    ? getDistrictList(Object.entries(TAIWAN_CITIES).find(([_, c]) => c.name === filters.city)?.[0] || '')
    : [];

  useEffect(() => {
    loadProperties();
  }, [filters, currentPage]);

  const loadProperties = () => {
    setIsLoading(true);
    try {
      const result = propertyService.search({
        ...filters,
        page: currentPage,
      });
      setProperties(result.properties);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<PropertySearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const toggleArrayFilter = (key: keyof PropertySearchFilters, value: any) => {
    const current = (filters[key] as any[]) || [];
    const newValue = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilters({ [key]: newValue });
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      city: '',
      district: [],
      propertyType: [],
      priceMin: undefined,
      priceMax: undefined,
      areaMin: undefined,
      areaMax: undefined,
      bedrooms: [],
      amenities: [],
      sortBy: 'newest',
      page: 1,
      pageSize: 12,
    });
    setCurrentPage(1);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const activeFilterCount = [
    filters.propertyType?.length || 0,
    filters.priceMin || filters.priceMax ? 1 : 0,
    filters.areaMin || filters.areaMax ? 1 : 0,
    filters.bedrooms?.length || 0,
    filters.amenities?.length || 0,
    filters.district?.length || 0,
  ].reduce((a, b) => a + b, 0);

  const FilterSection = ({ title, section, children }: { title: string; section: string; children: React.ReactNode }) => (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => toggleSection(section)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="font-medium text-gray-900">{title}</span>
        {expandedSections[section] ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {expandedSections[section] && (
        <div className="mt-3">{children}</div>
      )}
    </div>
  );

  const FilterPanel = () => (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">篩選條件</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-orange-500 hover:text-orange-600"
          >
            清除全部
          </button>
        )}
      </div>

      {/* City */}
      <div className="border-b border-gray-200 py-4">
        <label className="block font-medium text-gray-900 mb-2">地區</label>
        <select
          value={filters.city || ''}
          onChange={e => updateFilters({ city: e.target.value, district: [] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">不限地區</option>
          {cities.map(city => (
            <option key={city.key} value={city.name}>{city.name}</option>
          ))}
        </select>

        {filters.city && districts.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {districts.slice(0, 10).map(district => (
              <button
                key={district}
                onClick={() => toggleArrayFilter('district', district)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  filters.district?.includes(district)
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-orange-500'
                }`}
              >
                {district}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Property Type */}
      <FilterSection title="房屋類型" section="propertyType">
        <div className="flex flex-wrap gap-2">
          {Object.entries(PROPERTY_TYPE_LABELS).slice(0, 6).map(([type, label]) => (
            <button
              key={type}
              onClick={() => toggleArrayFilter('propertyType', type)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                filters.propertyType?.includes(type as PropertyType)
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-orange-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="租金範圍" section="price">
        <div className="space-y-2">
          {PRICE_RANGES.map((range, index) => (
            <button
              key={index}
              onClick={() => updateFilters({ priceMin: range.min, priceMax: range.max || undefined })}
              className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                filters.priceMin === range.min && filters.priceMax === range.max
                  ? 'bg-orange-100 text-orange-700'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Area Range */}
      <FilterSection title="坪數範圍" section="area">
        <div className="space-y-2">
          {AREA_RANGES.map((range, index) => (
            <button
              key={index}
              onClick={() => updateFilters({ areaMin: range.min, areaMax: range.max || undefined })}
              className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                filters.areaMin === range.min && filters.areaMax === range.max
                  ? 'bg-orange-100 text-orange-700'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Bedrooms */}
      <FilterSection title="格局" section="bedrooms">
        <div className="flex flex-wrap gap-2">
          {BEDROOM_OPTIONS.slice(1).map(option => (
            <button
              key={option.value}
              onClick={() => toggleArrayFilter('bedrooms', option.value)}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                filters.bedrooms?.includes(option.value)
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-orange-500'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Amenities */}
      <FilterSection title="設備" section="amenities">
        <div className="flex flex-wrap gap-2">
          {QUICK_FILTER_AMENITIES.map(amenity => (
            <button
              key={amenity.id}
              onClick={() => toggleArrayFilter('amenities', amenity.id)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                filters.amenities?.includes(amenity.id)
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-orange-500'
              }`}
            >
              {amenity.name}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <SearchBox initialCity={filters.city} initialKeyword={filters.keyword} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-36">
              <FilterPanel />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {filters.city || '全部地區'}
                  {filters.district?.length ? ` - ${filters.district.join(', ')}` : ''}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  共找到 <span className="font-medium text-orange-500">{total}</span> 間物件
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg"
                >
                  <Filter className="w-4 h-4" />
                  <span>篩選</span>
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort */}
                <select
                  value={filters.sortBy}
                  onChange={e => updateFilters({ sortBy: e.target.value as SortBy })}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* View Mode */}
                <div className="hidden sm:flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                {/* Map Link */}
                <Link
                  to="/rental/map"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-orange-500 transition-colors"
                >
                  <MapIcon className="w-4 h-4" />
                  <span>地圖</span>
                </Link>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.propertyType?.map(type => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full"
                  >
                    {PROPERTY_TYPE_LABELS[type]}
                    <button onClick={() => toggleArrayFilter('propertyType', type)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {(filters.priceMin || filters.priceMax) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                    ${filters.priceMin?.toLocaleString() || 0} - ${filters.priceMax?.toLocaleString() || '不限'}
                    <button onClick={() => updateFilters({ priceMin: undefined, priceMax: undefined })}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Results */}
            {isLoading ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl h-80 animate-pulse" />
                ))}
              </div>
            ) : properties.length > 0 ? (
              <>
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                  {properties.map(property => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-orange-500"
                    >
                      上一頁
                    </button>
                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-lg ${
                              currentPage === page
                                ? 'bg-orange-500 text-white'
                                : 'border border-gray-300 hover:border-orange-500'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-orange-500"
                    >
                      下一頁
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">找不到符合條件的物件</h3>
                <p className="text-gray-500 mb-4">請嘗試調整篩選條件或搜尋其他地區</p>
                <button
                  onClick={clearFilters}
                  className="text-orange-500 hover:text-orange-600 font-medium"
                >
                  清除所有篩選條件
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">篩選條件</h2>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <div className="p-4">
              <FilterPanel />
            </div>
            <div className="sticky bottom-0 bg-white border-t p-4">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3 bg-orange-500 text-white rounded-lg font-medium"
              >
                查看 {total} 個結果
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Import Building2 icon for empty state
import { Building2 } from 'lucide-react';
