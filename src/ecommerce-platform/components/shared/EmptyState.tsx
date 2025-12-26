import React from 'react';
import { FileQuestion, Search, Inbox, Database, AlertCircle, Plus } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className = ''
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      iconSize: 'w-10 h-10',
      iconContainer: 'p-3',
      title: 'text-base',
      description: 'text-sm'
    },
    md: {
      container: 'py-12',
      iconSize: 'w-12 h-12',
      iconContainer: 'p-4',
      title: 'text-lg',
      description: 'text-sm'
    },
    lg: {
      container: 'py-16',
      iconSize: 'w-16 h-16',
      iconContainer: 'p-6',
      title: 'text-xl',
      description: 'text-base'
    }
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizes.container} ${className}`}>
      {icon && (
        <div className={`${sizes.iconContainer} bg-gray-100 rounded-full text-gray-400 mb-4`}>
          {React.isValidElement(icon)
            ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                className: sizes.iconSize
              })
            : icon
          }
        </div>
      )}

      <h3 className={`font-semibold text-gray-900 ${sizes.title}`}>
        {title}
      </h3>

      {description && (
        <p className={`text-gray-500 mt-1 max-w-md ${sizes.description}`}>
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-6">
          {action && (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {action.icon || <Plus className="w-4 h-4" />}
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// 預設空狀態變體
export function NoDataEmpty({
  title = '沒有資料',
  description = '目前沒有任何資料',
  action,
  size = 'md'
}: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon={<Database />}
      title={title}
      description={description}
      action={action}
      size={size}
    />
  );
}

export function NoSearchResultsEmpty({
  title = '沒有搜尋結果',
  description = '嘗試使用不同的關鍵字或篩選條件',
  secondaryAction,
  size = 'md'
}: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon={<Search />}
      title={title}
      description={description}
      secondaryAction={secondaryAction}
      size={size}
    />
  );
}

export function NoItemsEmpty({
  title = '沒有項目',
  description = '開始新增第一個項目',
  action,
  size = 'md'
}: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon={<Inbox />}
      title={title}
      description={description}
      action={action}
      size={size}
    />
  );
}

export function ErrorEmpty({
  title = '載入失敗',
  description = '無法載入資料，請稍後再試',
  action,
  size = 'md'
}: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon={<AlertCircle />}
      title={title}
      description={description}
      action={action}
      size={size}
    />
  );
}

export function NoFileEmpty({
  title = '沒有檔案',
  description = '上傳檔案以開始',
  action,
  size = 'md'
}: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon={<FileQuestion />}
      title={title}
      description={description}
      action={action}
      size={size}
    />
  );
}
