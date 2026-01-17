import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home, MapPin, DollarSign, Bed, Image, Check,
  ChevronRight, ChevronLeft, AlertCircle, Upload, X, Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { propertyService } from '../services/propertyService';
import { TAIWAN_CITIES } from '../data/taiwanAreas';
import { AMENITY_CATEGORIES, FURNITURE_ITEMS, PROPERTY_TYPES } from '../data/amenities';
import { PropertyType, RentalProperty } from '../types';

interface FormData {
  // 基本資訊
  title: string;
  description: string;
  propertyType: PropertyType;

  // 地址
  city: string;
  district: string;
  address: string;

  // 房屋資訊
  floor: number;
  totalFloors: number;
  area: number;
  buildingAge: number;

  // 格局
  bedrooms: number;
  livingRooms: number;
  bathrooms: number;
  balconies: number;

  // 租金
  rentPrice: number;
  deposit: number;
  managementFee: number;
  includeUtilities: boolean;

  // 條件
  minLeaseTerm: number;
  availableDate: string;
  allowCooking: boolean;
  allowPets: boolean;
  genderRestriction: 'none' | 'male' | 'female';

  // 設備
  amenities: string[];
  furniture: string[];

  // 圖片
  images: string[];
}

const STEPS = [
  { id: 1, name: '基本資訊', icon: Home },
  { id: 2, name: '地址位置', icon: MapPin },
  { id: 3, name: '租金設定', icon: DollarSign },
  { id: 4, name: '房屋設備', icon: Bed },
  { id: 5, name: '上傳照片', icon: Image },
  { id: 6, name: '確認發布', icon: Check },
];

const initialFormData: FormData = {
  title: '',
  description: '',
  propertyType: 'suite',
  city: '',
  district: '',
  address: '',
  floor: 1,
  totalFloors: 5,
  area: 10,
  buildingAge: 5,
  bedrooms: 1,
  livingRooms: 0,
  bathrooms: 1,
  balconies: 0,
  rentPrice: 10000,
  deposit: 2,
  managementFee: 0,
  includeUtilities: false,
  minLeaseTerm: 12,
  availableDate: new Date().toISOString().split('T')[0],
  allowCooking: true,
  allowPets: false,
  genderRestriction: 'none',
  amenities: [],
  furniture: [],
  images: [],
};

// 示範圖片 URL
const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
  'https://images.unsplash.com/photo-1630699144867-37acec97df5a?w=800',
];

export default function CreateListingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 需要登入
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">請先登入</h2>
          <p className="text-gray-500 mb-6">登入後即可刊登房源</p>
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
          <p className="text-gray-500 mb-6">您需要房東帳號才能刊登房源</p>
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

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // 清除相關錯誤
    const clearedErrors = { ...errors };
    Object.keys(updates).forEach(key => delete clearedErrors[key]);
    setErrors(clearedErrors);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = '請輸入標題';
        if (!formData.propertyType) newErrors.propertyType = '請選擇房屋類型';
        if (formData.area <= 0) newErrors.area = '請輸入有效坪數';
        break;
      case 2:
        if (!formData.city) newErrors.city = '請選擇縣市';
        if (!formData.district) newErrors.district = '請選擇區域';
        if (!formData.address.trim()) newErrors.address = '請輸入詳細地址';
        break;
      case 3:
        if (formData.rentPrice <= 0) newErrors.rentPrice = '請輸入有效租金';
        if (formData.deposit < 0) newErrors.deposit = '押金不能為負數';
        break;
      case 5:
        if (formData.images.length === 0) newErrors.images = '請至少上傳一張照片';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const city = TAIWAN_CITIES[formData.city];
      const propertyData: Omit<RentalProperty, 'id' | 'createdAt' | 'updatedAt'> = {
        landlordId: user!.id,
        title: formData.title,
        description: formData.description,
        location: {
          city: city?.name || formData.city,
          district: formData.district,
          address: formData.address,
          lat: city?.lat || 25.0330,
          lng: city?.lng || 121.5654,
        },
        propertyType: formData.propertyType,
        floor: formData.floor,
        totalFloors: formData.totalFloors,
        area: formData.area,
        buildingAge: formData.buildingAge,
        layout: {
          bedrooms: formData.bedrooms,
          livingRooms: formData.livingRooms,
          bathrooms: formData.bathrooms,
          balconies: formData.balconies,
        },
        pricing: {
          rent: formData.rentPrice,
          deposit: formData.deposit,
          managementFee: formData.managementFee,
          includeUtilities: formData.includeUtilities,
        },
        conditions: {
          minLeaseTerm: formData.minLeaseTerm,
          availableDate: formData.availableDate,
          allowCooking: formData.allowCooking,
          allowPets: formData.allowPets,
          genderRestriction: formData.genderRestriction,
        },
        amenities: formData.amenities,
        furniture: formData.furniture,
        images: formData.images,
        status: 'available',
        viewCount: 0,
        favoriteCount: 0,
      };

      propertyService.create(propertyData as RentalProperty);
      navigate('/rental/my-listings', { replace: true });
    } catch (error) {
      setErrors({ submit: '發布失敗，請重試' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSampleImage = () => {
    const unusedImages = SAMPLE_IMAGES.filter(img => !formData.images.includes(img));
    if (unusedImages.length > 0) {
      updateFormData({ images: [...formData.images, unusedImages[0]] });
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    updateFormData({ images: newImages });
  };

  const getDistrictsForCity = () => {
    if (!formData.city) return [];
    return TAIWAN_CITIES[formData.city]?.districts || [];
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">房屋基本資訊</h3>

            {/* 標題 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                標題 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => updateFormData({ title: e.target.value })}
                placeholder="例：近捷運站溫馨套房"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
            </div>

            {/* 房屋類型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                房屋類型 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PROPERTY_TYPES.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => updateFormData({ propertyType: type.id as PropertyType })}
                    className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                      formData.propertyType === type.id
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 格局 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">格局</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-gray-500">房間</label>
                  <select
                    value={formData.bedrooms}
                    onChange={e => updateFormData({ bedrooms: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {[0, 1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n} 房</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">客廳</label>
                  <select
                    value={formData.livingRooms}
                    onChange={e => updateFormData({ livingRooms: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {[0, 1, 2].map(n => (
                      <option key={n} value={n}>{n} 廳</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">衛浴</label>
                  <select
                    value={formData.bathrooms}
                    onChange={e => updateFormData({ bathrooms: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {[1, 2, 3, 4].map(n => (
                      <option key={n} value={n}>{n} 衛</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">陽台</label>
                  <select
                    value={formData.balconies}
                    onChange={e => updateFormData({ balconies: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {[0, 1, 2].map(n => (
                      <option key={n} value={n}>{n} 個</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 坪數和樓層 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  坪數 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={e => updateFormData({ area: parseFloat(e.target.value) || 0 })}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">樓層</label>
                <input
                  type="number"
                  value={formData.floor}
                  onChange={e => updateFormData({ floor: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">總樓層</label>
                <input
                  type="number"
                  value={formData.totalFloors}
                  onChange={e => updateFormData({ totalFloors: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">屋齡</label>
                <input
                  type="number"
                  value={formData.buildingAge}
                  onChange={e => updateFormData({ buildingAge: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* 描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">房屋描述</label>
              <textarea
                value={formData.description}
                onChange={e => updateFormData({ description: e.target.value })}
                placeholder="詳細描述您的房屋特色、周邊環境..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">地址位置</h3>

            {/* 縣市 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  縣市 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.city}
                  onChange={e => updateFormData({ city: e.target.value, district: '' })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">請選擇縣市</option>
                  {Object.entries(TAIWAN_CITIES).map(([key, city]) => (
                    <option key={key} value={key}>{city.name}</option>
                  ))}
                </select>
                {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  區域 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.district}
                  onChange={e => updateFormData({ district: e.target.value })}
                  disabled={!formData.city}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.district ? 'border-red-500' : 'border-gray-300'
                  } ${!formData.city ? 'bg-gray-100' : ''}`}
                >
                  <option value="">請選擇區域</option>
                  {getDistrictsForCity().map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                {errors.district && <p className="mt-1 text-sm text-red-500">{errors.district}</p>}
              </div>
            </div>

            {/* 詳細地址 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                詳細地址 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={e => updateFormData({ address: e.target.value })}
                placeholder="例：XX路XX號XX樓"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
              <p className="mt-1 text-xs text-gray-500">詳細地址不會公開顯示，僅供聯繫時提供</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">租金設定</h3>

            {/* 租金 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  月租金 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.rentPrice}
                    onChange={e => updateFormData({ rentPrice: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full pl-8 pr-12 py-3 border border-gray-300 rounded-lg"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">元/月</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">押金</label>
                <select
                  value={formData.deposit}
                  onChange={e => updateFormData({ deposit: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value={1}>1 個月</option>
                  <option value={2}>2 個月</option>
                  <option value={3}>3 個月</option>
                </select>
              </div>
            </div>

            {/* 管理費 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">管理費</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.managementFee}
                    onChange={e => updateFormData({ managementFee: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full pl-8 pr-12 py-3 border border-gray-300 rounded-lg"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">元/月</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">最短租期</label>
                <select
                  value={formData.minLeaseTerm}
                  onChange={e => updateFormData({ minLeaseTerm: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value={1}>1 個月</option>
                  <option value={3}>3 個月</option>
                  <option value={6}>6 個月</option>
                  <option value={12}>12 個月</option>
                  <option value={24}>24 個月</option>
                </select>
              </div>
            </div>

            {/* 水電費 */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.includeUtilities}
                  onChange={e => updateFormData({ includeUtilities: e.target.checked })}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">租金含水電費</span>
              </label>
            </div>

            {/* 入住日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">可入住日期</label>
              <input
                type="date"
                value={formData.availableDate}
                onChange={e => updateFormData({ availableDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            {/* 租屋條件 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">租屋條件</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.allowCooking}
                    onChange={e => updateFormData({ allowCooking: e.target.checked })}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">可開伙</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.allowPets}
                    onChange={e => updateFormData({ allowPets: e.target.checked })}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">可養寵物</span>
                </label>
              </div>
            </div>

            {/* 性別限制 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">性別限制</label>
              <div className="flex gap-4">
                {[
                  { value: 'none', label: '不限' },
                  { value: 'male', label: '限男性' },
                  { value: 'female', label: '限女性' },
                ].map(option => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="genderRestriction"
                      value={option.value}
                      checked={formData.genderRestriction === option.value}
                      onChange={e => updateFormData({
                        genderRestriction: e.target.value as 'none' | 'male' | 'female'
                      })}
                      className="border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">房屋設備</h3>

            {/* 設備設施 */}
            {AMENITY_CATEGORIES.map(category => (
              <div key={category.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {category.name}
                </label>
                <div className="flex flex-wrap gap-2">
                  {category.items.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        const newAmenities = formData.amenities.includes(item.id)
                          ? formData.amenities.filter(a => a !== item.id)
                          : [...formData.amenities, item.id];
                        updateFormData({ amenities: newAmenities });
                      }}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        formData.amenities.includes(item.id)
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* 家具 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                家具設備
              </label>
              <div className="flex flex-wrap gap-2">
                {FURNITURE_ITEMS.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      const newFurniture = formData.furniture.includes(item.id)
                        ? formData.furniture.filter(f => f !== item.id)
                        : [...formData.furniture, item.id];
                      updateFormData({ furniture: newFurniture });
                    }}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      formData.furniture.includes(item.id)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">上傳照片</h3>
            <p className="text-sm text-gray-500">
              上傳房屋照片，清晰的照片能吸引更多租客（最多10張）
            </p>

            {/* 圖片上傳區 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={image} alt={`房屋照片 ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 px-2 py-1 bg-orange-500 text-white text-xs rounded">
                      封面
                    </span>
                  )}
                </div>
              ))}
              {formData.images.length < 10 && (
                <button
                  type="button"
                  onClick={addSampleImage}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-orange-500 hover:bg-orange-50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500">新增照片</span>
                </button>
              )}
            </div>

            {errors.images && (
              <p className="text-sm text-red-500">{errors.images}</p>
            )}

            <p className="text-xs text-gray-400">
              提示：點擊「新增照片」將自動添加示範圖片（實際應用會開啟檔案選擇器）
            </p>
          </div>
        );

      case 6:
        const cityData = TAIWAN_CITIES[formData.city];
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">確認發布</h3>
            <p className="text-sm text-gray-500">請確認以下資訊正確無誤</p>

            {/* 預覽卡片 */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              {formData.images.length > 0 && (
                <img
                  src={formData.images[0]}
                  alt="封面"
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              <div className="space-y-3">
                <h4 className="text-xl font-bold text-gray-900">{formData.title || '未設定標題'}</h4>

                <p className="text-2xl font-bold text-orange-500">
                  ${formData.rentPrice.toLocaleString()} /月
                </p>

                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                  <span>{cityData?.name || formData.city} {formData.district}</span>
                  <span>•</span>
                  <span>{PROPERTY_TYPES.find(t => t.id === formData.propertyType)?.name}</span>
                  <span>•</span>
                  <span>{formData.area} 坪</span>
                  <span>•</span>
                  <span>{formData.bedrooms}房{formData.livingRooms}廳{formData.bathrooms}衛</span>
                </div>

                <div className="pt-3 border-t">
                  <h5 className="font-medium text-gray-700 mb-2">設備設施</h5>
                  <div className="flex flex-wrap gap-1">
                    {formData.amenities.slice(0, 6).map(amenityId => {
                      const amenity = AMENITY_CATEGORIES
                        .flatMap(c => c.items)
                        .find(a => a.id === amenityId);
                      return (
                        <span
                          key={amenityId}
                          className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded"
                        >
                          {amenity?.name || amenityId}
                        </span>
                      );
                    })}
                    {formData.amenities.length > 6 && (
                      <span className="px-2 py-1 text-gray-500 text-xs">
                        +{formData.amenities.length - 6} 項
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{errors.submit}</span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* 標題 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">刊登房源</h1>
          <p className="text-gray-500 mt-1">填寫房屋資訊，輕鬆找到理想租客</p>
        </div>

        {/* 步驟指示器 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-orange-500 text-white'
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs mt-1 hidden sm:block ${
                      isActive ? 'text-orange-500 font-medium' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* 表單內容 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {renderStepContent()}

          {/* 導航按鈕 */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              上一步
            </button>

            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                下一步
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '發布中...' : '確認發布'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
