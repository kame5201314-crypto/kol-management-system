import React, { useState, useCallback } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterConfig {
  id: string;
  label: string;
  type: 'select' | 'multi-select' | 'date-range';
  options?: FilterOption[];
}

interface ActiveFilter {
  id: string;
  value: string | string[];
  label: string;
}

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  activeFilters?: ActiveFilter[];
  onFilterChange?: (filterId: string, value: string | string[] | null) => void;
  onClearAllFilters?: () => void;
  showAdvancedFilters?: boolean;
  className?: string;
}

export default function SearchFilter({
  searchValue,
  onSearchChange,
  searchPlaceholder = '搜尋...',
  filters = [],
  activeFilters = [],
  onFilterChange,
  onClearAllFilters,
  showAdvancedFilters = false,
  className = ''
}: SearchFilterProps) {
  const [isFilterExpanded, setIsFilterExpanded] = useState(showAdvancedFilters);

  const handleSearchClear = useCallback(() => {
    onSearchChange('');
  }, [onSearchChange]);

  const handleFilterRemove = useCallback((filterId: string) => {
    onFilterChange?.(filterId, null);
  }, [onFilterChange]);

  return (
    <div className={className}>
      {/* Main Search Bar */}
      <div className="flex gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          {searchValue && (
            <button
              onClick={handleSearchClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        {filters.length > 0 && (
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
              isFilterExpanded || activeFilters.length > 0
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>篩選</span>
            {activeFilters.length > 0 && (
              <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {activeFilters.length}
              </span>
            )}
            {isFilterExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Active Filters Tags */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {activeFilters.map((filter) => (
            <span
              key={filter.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
            >
              <span className="text-blue-500">{filter.label}:</span>
              <span className="font-medium">
                {Array.isArray(filter.value) ? filter.value.join(', ') : filter.value}
              </span>
              <button
                onClick={() => handleFilterRemove(filter.id)}
                className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {activeFilters.length > 1 && (
            <button
              onClick={onClearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1"
            >
              清除全部
            </button>
          )}
        </div>
      )}

      {/* Expanded Filter Panel */}
      {isFilterExpanded && filters.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {filter.label}
                </label>

                {filter.type === 'select' && filter.options && (
                  <select
                    value={activeFilters.find(f => f.id === filter.id)?.value as string || ''}
                    onChange={(e) => onFilterChange?.(filter.id, e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">全部</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                        {option.count !== undefined && ` (${option.count})`}
                      </option>
                    ))}
                  </select>
                )}

                {filter.type === 'multi-select' && filter.options && (
                  <div className="flex flex-wrap gap-1.5">
                    {filter.options.map((option) => {
                      const currentValue = activeFilters.find(f => f.id === filter.id)?.value as string[] || [];
                      const isSelected = currentValue.includes(option.value);

                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            const newValue = isSelected
                              ? currentValue.filter(v => v !== option.value)
                              : [...currentValue, option.value];
                            onFilterChange?.(filter.id, newValue.length > 0 ? newValue : null);
                          }}
                          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {option.label}
                          {option.count !== undefined && (
                            <span className="ml-1 opacity-70">({option.count})</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {filter.type === 'date-range' && (
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="開始日期"
                    />
                    <span className="self-center text-gray-400">~</span>
                    <input
                      type="date"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="結束日期"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Simple inline search
interface InlineSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function InlineSearch({
  value,
  onChange,
  placeholder = '搜尋...',
  className = ''
}: InlineSearchProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      />
    </div>
  );
}

// Quick filter buttons
interface QuickFilterProps<T extends string> {
  options: { value: T; label: string; count?: number }[];
  value: T | null;
  onChange: (value: T | null) => void;
  allLabel?: string;
}

export function QuickFilter<T extends string>({
  options,
  value,
  onChange,
  allLabel = '全部'
}: QuickFilterProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
          value === null
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {allLabel}
      </button>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            value === option.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {option.label}
          {option.count !== undefined && (
            <span className="ml-1 opacity-70">({option.count})</span>
          )}
        </button>
      ))}
    </div>
  );
}
