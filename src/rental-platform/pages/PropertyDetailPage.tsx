import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  Share2,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Calendar,
  Building2,
  Clock,
  Eye,
  Phone,
  Mail,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  X,
  Home,
  DollarSign,
  Users,
  PawPrint,
  Flame
} from 'lucide-react';
import { propertyService } from '../services';
import { RentalProperty, PROPERTY_TYPE_LABELS, RENTAL_STATUS_LABELS } from '../types';
import { getAmenityNameById, getFurnitureNameById } from '../data/amenities';
import PropertyCard from '../components/property/PropertyCard';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoriteContext';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();

  const [property, setProperty] = useState<RentalProperty | null>(null);
  const [recommendedProperties, setRecommendedProperties] = useState<RentalProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadProperty(id);
    }
  }, [id]);

  const loadProperty = (propertyId: string) => {
    setIsLoading(true);
    try {
      const prop = propertyService.getById(propertyId);
      if (prop) {
        setProperty(prop);
        propertyService.incrementViewCount(propertyId);
        const recommended = propertyService.getRecommended(propertyId, 4);
        setRecommendedProperties(recommended);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteClick = () => {
    if (isAuthenticated && property) {
      toggleFavorite(property.id);
    } else {
      navigate('/rental/login');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('連結已複製到剪貼簿');
    }
  };

  const nextImage = () => {
    if (property) {
      setCurrentImageIndex(prev => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property) {
      setCurrentImageIndex(prev => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString('zh-TW');
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">找不到此物件</h2>
          <Link to="/rental/search" className="text-orange-500 hover:text-orange-600">
            返回搜尋
          </Link>
        </div>
      </div>
    );
  }

  const favorited = isFavorited(property.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/rental" className="hover:text-orange-500">首頁</Link>
            <span>/</span>
            <Link to={`/rental/search?city=${encodeURIComponent(property.location.city)}`} className="hover:text-orange-500">
              {property.location.city}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{property.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="relative aspect-[16/10]">
                <img
                  src={property.images[currentImageIndex] || 'https://via.placeholder.com/800x500?text=No+Image'}
                  alt={property.title}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setShowImageModal(true)}
                />

                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {property.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>

                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-orange-500 text-white text-sm font-medium rounded">
                    {PROPERTY_TYPE_LABELS[property.propertyType]}
                  </span>
                </div>

                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={handleFavoriteClick}
                    className={`p-2 rounded-full transition-colors ${
                      favorited ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 bg-white/90 text-gray-600 rounded-full hover:text-orange-500"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Thumbnail Strip */}
              {property.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {property.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex ? 'border-orange-500' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{property.location.city} {property.location.district} {property.location.address}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-orange-500">
                    ${formatPrice(property.pricing.rentPrice)}
                    <span className="text-lg text-gray-500 font-normal">/月</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 py-4 border-y border-gray-200">
                <div className="text-center">
                  <Maximize className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                  <div className="font-medium text-gray-900">{property.area} 坪</div>
                  <div className="text-xs text-gray-500">建坪</div>
                </div>
                <div className="text-center">
                  <Bed className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                  <div className="font-medium text-gray-900">{property.layout.bedrooms}房{property.layout.livingRooms}廳</div>
                  <div className="text-xs text-gray-500">格局</div>
                </div>
                <div className="text-center">
                  <Bath className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                  <div className="font-medium text-gray-900">{property.layout.bathrooms}</div>
                  <div className="text-xs text-gray-500">衛浴</div>
                </div>
                <div className="text-center">
                  <Building2 className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                  <div className="font-medium text-gray-900">{property.floor}/{property.totalFloors}F</div>
                  <div className="text-xs text-gray-500">樓層</div>
                </div>
              </div>

              {/* Description */}
              {property.description && (
                <div className="py-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">物件介紹</h3>
                  <p className="text-gray-600 whitespace-pre-line">{property.description}</p>
                </div>
              )}

              {/* Details */}
              <div className="py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">詳細資訊</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500">押金：</span>
                    <span className="text-gray-900">{property.pricing.deposit} 個月</span>
                  </div>
                  {property.pricing.managementFee && (
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-500">管理費：</span>
                      <span className="text-gray-900">${formatPrice(property.pricing.managementFee)}/月</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500">最短租期：</span>
                    <span className="text-gray-900">{property.conditions.minLeaseTerm} 個月</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500">可入住：</span>
                    <span className="text-gray-900">{formatDate(property.conditions.availableDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500">屋齡：</span>
                    <span className="text-gray-900">{property.buildingAge || '不詳'} 年</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PawPrint className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500">養寵物：</span>
                    <span className={property.conditions.allowPets ? 'text-green-600' : 'text-red-500'}>
                      {property.conditions.allowPets ? '可以' : '不可'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500">開伙：</span>
                    <span className={property.conditions.allowCooking ? 'text-green-600' : 'text-red-500'}>
                      {property.conditions.allowCooking ? '可以' : '不可'}
                    </span>
                  </div>
                  {property.conditions.genderRestriction && (
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-500">性別限制：</span>
                      <span className="text-gray-900">
                        {property.conditions.genderRestriction === 'male' ? '限男性' : '限女性'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Amenities */}
              <div className="py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">設備設施</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map(amenityId => (
                    <span
                      key={amenityId}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg"
                    >
                      {getAmenityNameById(amenityId) || amenityId}
                    </span>
                  ))}
                </div>
              </div>

              {/* Furniture */}
              {property.furniture.length > 0 && (
                <div className="py-4">
                  <h3 className="font-semibold text-gray-900 mb-4">附帶傢俱</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.furniture.map(furnitureId => (
                      <span
                        key={furnitureId}
                        className="px-3 py-1.5 bg-orange-50 text-orange-700 text-sm rounded-lg"
                      >
                        {getFurnitureNameById(furnitureId) || furnitureId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Nearby MRT */}
            {property.location.nearbyMRT && property.location.nearbyMRT.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">鄰近捷運</h3>
                <div className="flex flex-wrap gap-2">
                  {property.location.nearbyMRT.map(mrt => (
                    <span
                      key={mrt}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg"
                    >
                      {mrt}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Landlord Info */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">聯絡人資訊</h3>
                {property.landlord ? (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center text-xl font-medium text-orange-600">
                        {property.landlord.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{property.landlord.fullName}</span>
                          {property.landlord.verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {property.landlord.role === 'agent' ? '房仲' : '屋主'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowContactModal(true)}
                      className="w-full py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="w-5 h-5" />
                      立即聯繫
                    </button>

                    <button className="w-full mt-3 py-3 border border-orange-500 text-orange-500 rounded-lg font-medium hover:bg-orange-50 transition-colors flex items-center justify-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      傳送訊息
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500">聯絡資訊暫不可用</p>
                )}
              </div>

              {/* Stats */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{property.viewCount} 次瀏覽</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{property.favoriteCount} 人收藏</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  發布時間：{property.publishedAt ? formatDate(property.publishedAt) : '不詳'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Properties */}
        {recommendedProperties.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">類似物件推薦</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProperties.map(prop => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showContactModal && property.landlord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowContactModal(false)} />
          <div className="relative bg-white rounded-xl max-w-md w-full p-6">
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-4">聯絡資訊</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  {property.landlord.fullName.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{property.landlord.fullName}</div>
                  <div className="text-sm text-gray-500">
                    {property.landlord.role === 'agent' ? '房仲' : '屋主'}
                  </div>
                </div>
              </div>
              {property.landlord.phone && (
                <a
                  href={`tel:${property.landlord.phone}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <Phone className="w-5 h-5 text-orange-500" />
                  <span className="text-gray-900">{property.landlord.phone}</span>
                </a>
              )}
              {property.landlord.email && (
                <a
                  href={`mailto:${property.landlord.email}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <Mail className="w-5 h-5 text-orange-500" />
                  <span className="text-gray-900">{property.landlord.email}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X className="w-8 h-8" />
          </button>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 text-white rounded-full hover:bg-white/20"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <img
            src={property.images[currentImageIndex]}
            alt=""
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 text-white rounded-full hover:bg-white/20"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
            {currentImageIndex + 1} / {property.images.length}
          </div>
        </div>
      )}
    </div>
  );
}
