import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Eye,
  CheckCircle
} from 'lucide-react';
import { RentalProperty, PROPERTY_TYPE_LABELS } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoriteContext';

interface PropertyCardProps {
  property: RentalProperty;
  compact?: boolean;
}

export default function PropertyCard({ property, compact = false }: PropertyCardProps) {
  const { isAuthenticated } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();
  const favorited = isFavorited(property.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated) {
      toggleFavorite(property.id);
    }
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString('zh-TW');
  };

  if (compact) {
    return (
      <Link
        to={`/rental/property/${property.id}`}
        className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      >
        <div className="flex">
          <div className="w-32 h-24 flex-shrink-0">
            <img
              src={property.images[0] || 'https://via.placeholder.com/128x96?text=No+Image'}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 p-3">
            <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
              {property.title}
            </h3>
            <p className="text-orange-500 font-bold mt-1">
              ${formatPrice(property.pricing.rentPrice)}/月
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <span>{property.area}坪</span>
              <span>|</span>
              <span>{property.layout.bedrooms}房{property.layout.livingRooms}廳</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/rental/property/${property.id}`}
      className="group block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Favorite Button */}
        {isAuthenticated && (
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
              favorited
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Property Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded">
            {PROPERTY_TYPE_LABELS[property.propertyType]}
          </span>
        </div>

        {/* View Count */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 text-white text-xs rounded">
          <Eye className="w-3 h-3" />
          <span>{property.viewCount}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-2xl font-bold text-orange-500">
              ${formatPrice(property.pricing.rentPrice)}
            </span>
            <span className="text-gray-500 text-sm">/月</span>
          </div>
          {property.pricing.includedUtilities && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
              含水電
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-500 transition-colors">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <MapPin className="w-4 h-4" />
          <span>{property.location.city} {property.location.district}</span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-3">
          <div className="flex items-center gap-1">
            <Maximize className="w-4 h-4" />
            <span>{property.area}坪</span>
          </div>
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{property.layout.bedrooms}房</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span>{property.layout.bathrooms}衛</span>
          </div>
        </div>

        {/* Landlord */}
        {property.landlord && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                {property.landlord.fullName.charAt(0)}
              </div>
              <span className="text-sm text-gray-600">{property.landlord.fullName}</span>
              {property.landlord.verified && (
                <CheckCircle className="w-4 h-4 text-blue-500" />
              )}
            </div>
            <span className="text-xs text-gray-400">
              {property.landlord.role === 'agent' ? '仲介' : '屋主'}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
