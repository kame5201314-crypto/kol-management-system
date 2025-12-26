import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Mail,
  MessageSquare,
  Phone,
  Smartphone,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import { notificationHistoryService } from '../../services/logisticsRadarService';
import {
  NotificationHistory as NotificationHistoryType,
  NotificationChannel,
  NotificationStatus,
  NOTIFICATION_CHANNEL_LABELS,
  NOTIFICATION_STATUS_LABELS
} from '../../types/logisticsRadar';

export default function NotificationHistory() {
  const [notifications] = useState<NotificationHistoryType[]>(() =>
    notificationHistoryService.getRecent(100)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<NotificationStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotification, setSelectedNotification] = useState<NotificationHistoryType | null>(null);

  const itemsPerPage = 15;

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !n.trackingNumber.toLowerCase().includes(query) &&
          !n.customerName.toLowerCase().includes(query) &&
          !n.recipient.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Channel filter
      if (selectedChannel !== 'all' && n.channel !== selectedChannel) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && n.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [notifications, searchQuery, selectedChannel, selectedStatus]);

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(start, start + itemsPerPage);
  }, [filteredNotifications, currentPage]);

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayNotifications = notifications.filter(
      n => new Date(n.sentAt).toDateString() === today
    );

    return {
      total: notifications.length,
      sent: notifications.filter(n => n.status === 'sent' || n.status === 'delivered').length,
      delivered: notifications.filter(n => n.status === 'delivered').length,
      failed: notifications.filter(n => n.status === 'failed').length,
      todayCount: todayNotifications.length
    };
  }, [notifications]);

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case 'sms':
        return <Phone className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'line':
        return <MessageSquare className="w-4 h-4" />;
      case 'push':
        return <Smartphone className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: NotificationStatus) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'skipped':
        return <RefreshCw className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: NotificationStatus): string => {
    const colors: Record<NotificationStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      sent: 'bg-blue-100 text-blue-700',
      delivered: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      skipped: 'bg-gray-100 text-gray-700'
    };
    return colors[status];
  };

  const getChannelColor = (channel: NotificationChannel): string => {
    const colors: Record<NotificationChannel, string> = {
      sms: 'bg-purple-100 text-purple-700',
      email: 'bg-blue-100 text-blue-700',
      line: 'bg-green-100 text-green-700',
      push: 'bg-orange-100 text-orange-700'
    };
    return colors[channel];
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('zh-TW', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/ecommerce/logistics"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">通知歷史</h1>
            <p className="text-gray-500 mt-1">查看所有已發送的通知記錄</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Bell className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">總通知數</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{stats.sent}</p>
              <p className="text-xs text-gray-500">已發送</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{stats.delivered}</p>
              <p className="text-xs text-gray-500">已送達</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{stats.failed}</p>
              <p className="text-xs text-gray-500">發送失敗</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{stats.todayCount}</p>
              <p className="text-xs text-gray-500">今日通知</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="搜尋追蹤號碼、客戶名稱或收件者..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={selectedChannel}
              onChange={(e) => {
                setSelectedChannel(e.target.value as NotificationChannel | 'all');
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">所有管道</option>
              {Object.entries(NOTIFICATION_CHANNEL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as NotificationStatus | 'all');
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">所有狀態</option>
              {Object.entries(NOTIFICATION_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">時間</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">追蹤號碼</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">客戶</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">管道</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">收件者</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">狀態</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedNotifications.map((notification) => (
                <tr key={notification.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDateTime(notification.sentAt)}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-sm font-mono text-gray-900">{notification.trackingNumber}</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{notification.customerName}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg ${getChannelColor(notification.channel)}`}>
                        {getChannelIcon(notification.channel)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {NOTIFICATION_CHANNEL_LABELS[notification.channel]}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-[150px] truncate">
                    {notification.recipient}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(notification.status)}
                      <StatusBadge
                        label={NOTIFICATION_STATUS_LABELS[notification.status]}
                        color={getStatusColor(notification.status)}
                        size="sm"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedNotification(notification)}
                      className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedNotifications.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    無符合條件的通知記錄
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              顯示 {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredNotifications.length)} 筆，
              共 {filteredNotifications.length} 筆
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => Math.abs(page - currentPage) <= 2)
                .map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg ${
                      page === currentPage
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">通知詳情</h3>
              <button
                onClick={() => setSelectedNotification(null)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">追蹤號碼</p>
                  <code className="font-mono text-gray-900">{selectedNotification.trackingNumber}</code>
                </div>
                <div>
                  <p className="text-sm text-gray-500">客戶名稱</p>
                  <p className="text-gray-900">{selectedNotification.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">通知管道</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`p-1.5 rounded-lg ${getChannelColor(selectedNotification.channel)}`}>
                      {getChannelIcon(selectedNotification.channel)}
                    </span>
                    <span>{NOTIFICATION_CHANNEL_LABELS[selectedNotification.channel]}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">狀態</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedNotification.status)}
                    <StatusBadge
                      label={NOTIFICATION_STATUS_LABELS[selectedNotification.status]}
                      color={getStatusColor(selectedNotification.status)}
                      size="sm"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">收件者</p>
                  <p className="text-gray-900">{selectedNotification.recipient}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">發送時間</p>
                  <p className="text-gray-900">
                    {new Date(selectedNotification.sentAt).toLocaleString('zh-TW')}
                  </p>
                </div>
                {selectedNotification.deliveredAt && (
                  <div>
                    <p className="text-sm text-gray-500">送達時間</p>
                    <p className="text-gray-900">
                      {new Date(selectedNotification.deliveredAt).toLocaleString('zh-TW')}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-2">通知內容</p>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedNotification.message}</p>
                </div>
              </div>

              {selectedNotification.error && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-red-600 mb-2">錯誤訊息</p>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700">{selectedNotification.error}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
