import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  subtitle?: string;
  className?: string;
  iconBgColor?: string;
  iconColor?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  className = '',
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600'
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (trend.value < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.value > 0) return 'text-green-600';
    if (trend.value < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>

          {(trend || subtitle) && (
            <div className="mt-2 flex items-center gap-2">
              {trend && (
                <div className={`flex items-center gap-1 ${getTrendColor()}`}>
                  {getTrendIcon()}
                  <span className="text-sm font-medium">
                    {trend.value > 0 ? '+' : ''}{trend.value}%
                  </span>
                  {trend.label && (
                    <span className="text-gray-400 text-sm">{trend.label}</span>
                  )}
                </div>
              )}
              {subtitle && !trend && (
                <span className="text-sm text-gray-500">{subtitle}</span>
              )}
            </div>
          )}
        </div>

        {icon && (
          <div className={`${iconBgColor} ${iconColor} p-3 rounded-lg`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// 漸層背景版本
interface GradientStatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  subtitle?: string;
  gradient?: string;
  className?: string;
}

export function GradientStatsCard({
  title,
  value,
  icon,
  subtitle,
  gradient = 'from-blue-500 to-indigo-600',
  className = ''
}: GradientStatsCardProps) {
  return (
    <div className={`bg-gradient-to-r ${gradient} rounded-xl shadow-sm p-6 text-white ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          {subtitle && (
            <p className="mt-2 text-sm opacity-80">{subtitle}</p>
          )}
        </div>

        {icon && (
          <div className="bg-white/20 p-3 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// 迷你統計卡片
interface MiniStatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

export function MiniStatsCard({
  label,
  value,
  icon,
  color = 'text-blue-600'
}: MiniStatsCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      {icon && (
        <div className={color}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
