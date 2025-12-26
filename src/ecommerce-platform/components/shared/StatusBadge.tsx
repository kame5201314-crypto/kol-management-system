import React from 'react';

interface StatusBadgeProps {
  label: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

export default function StatusBadge({
  label,
  color = 'bg-gray-100 text-gray-700',
  size = 'md',
  dot = false,
  className = ''
}: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm'
  };

  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  };

  // 從 color 類別中提取背景色來設定 dot 顏色
  const getDotColor = () => {
    if (color.includes('green')) return 'bg-green-500';
    if (color.includes('red')) return 'bg-red-500';
    if (color.includes('yellow')) return 'bg-yellow-500';
    if (color.includes('blue')) return 'bg-blue-500';
    if (color.includes('orange')) return 'bg-orange-500';
    if (color.includes('purple')) return 'bg-purple-500';
    if (color.includes('indigo')) return 'bg-indigo-500';
    if (color.includes('cyan')) return 'bg-cyan-500';
    if (color.includes('emerald')) return 'bg-emerald-500';
    return 'bg-gray-500';
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeClasses[size]} ${color} ${className}`}
    >
      {dot && (
        <span className={`${dotSizeClasses[size]} ${getDotColor()} rounded-full`} />
      )}
      {label}
    </span>
  );
}

// 帶圖標的狀態標籤
interface IconStatusBadgeProps extends StatusBadgeProps {
  icon?: React.ReactNode;
}

export function IconStatusBadge({
  label,
  color = 'bg-gray-100 text-gray-700',
  size = 'md',
  icon,
  className = ''
}: IconStatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeClasses[size]} ${color} ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}

// 可點擊的標籤
interface ClickableBadgeProps extends StatusBadgeProps {
  onClick?: () => void;
  onRemove?: () => void;
}

export function ClickableBadge({
  label,
  color = 'bg-gray-100 text-gray-700',
  size = 'md',
  onClick,
  onRemove,
  className = ''
}: ClickableBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${sizeClasses[size]} ${color} ${className} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
      onClick={onClick}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}

// 進度指示標籤
interface ProgressBadgeProps {
  label: string;
  progress: number; // 0-100
  color?: string;
  size?: 'sm' | 'md';
}

export function ProgressBadge({
  label,
  progress,
  color = 'bg-blue-500',
  size = 'md'
}: ProgressBadgeProps) {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-1.5'
  };

  return (
    <div className="inline-flex flex-col gap-1">
      <span className={`text-${size === 'sm' ? 'xs' : 'sm'} font-medium text-gray-700`}>
        {label}
      </span>
      <div className={`w-24 bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${color} ${sizeClasses[size]} rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}
