// Logistics Radar (物流異常偵測) 類型定義

// 物流商/快遞公司代碼
export type CarrierCode =
  | 'seven_eleven'    // 7-11
  | 'family_mart'     // 全家
  | 'hilife'          // 萊爾富
  | 'ok_mart'         // OK超商
  | 'sf_express'      // 順豐
  | 'kerry'           // 嘉里大榮
  | 'black_cat'       // 黑貓
  | 'post'            // 郵局
  | 'shopee'          // 蝦皮店到店
  | 'momo'            // momo 物流
  | 'other';

// 包裹狀態
export type ShipmentStatus =
  | 'created'         // 已建立
  | 'picked_up'       // 已取件
  | 'in_transit'      // 運送中
  | 'at_warehouse'    // 在倉庫
  | 'at_store'        // 已到店
  | 'out_for_delivery'// 配送中
  | 'delivered'       // 已送達
  | 'returned'        // 已退回
  | 'exception';      // 異常

// 異常類型
export type AnomalyType =
  | 'delayed_pickup'      // 取件延遲
  | 'transit_delay'       // 運送延遲
  | 'stuck_at_warehouse'  // 滯留倉庫
  | 'delivery_failed'     // 配送失敗
  | 'store_not_arrived'   // 未到店
  | 'return_initiated'    // 退貨發起
  | 'lost_package'        // 包裹遺失
  | 'damaged'             // 包裹損壞
  | 'address_issue'       // 地址問題
  | 'custom_rule';        // 自訂規則觸發

// 異常嚴重程度
export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';

// 異常處理狀態
export type AnomalyStatus = 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'dismissed';

// 通知狀態
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'skipped';

// 通知管道
export type NotificationChannel = 'sms' | 'email' | 'line' | 'push';

// 包裹記錄
export interface Shipment {
  id: string;
  trackingNumber: string;
  orderId: string;
  carrier: CarrierCode;

  // 客戶資訊
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;

  // 配送資訊
  origin: string;
  destination: string;
  destinationStore?: string; // 超商取貨店名

  // 狀態
  currentStatus: ShipmentStatus;
  estimatedDelivery?: string;
  actualDelivery?: string;

  // 追蹤事件
  events: ShipmentEvent[];

  // 異常
  hasAnomaly: boolean;
  anomalyIds?: string[];

  // 元資料
  createdAt: string;
  updatedAt: string;
  lastCheckedAt: string;
}

// 包裹追蹤事件
export interface ShipmentEvent {
  id: string;
  timestamp: string;
  status: ShipmentStatus;
  location?: string;
  description: string;
}

// 異常記錄
export interface Anomaly {
  id: string;
  shipmentId: string;
  trackingNumber: string;
  orderId: string;

  // 異常詳情
  type: AnomalyType;
  severity: AnomalySeverity;
  status: AnomalyStatus;

  // 描述
  title: string;
  description: string;
  triggeredRule?: string;

  // 時間軸
  detectedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;

  // 客戶資訊
  customerName: string;
  customerContact?: string;

  // 通知
  notificationsSent: AnomalyNotification[];

  // 解決方案
  resolution?: string;
  resolvedBy?: string;

  // 元資料
  createdAt: string;
  updatedAt: string;
}

// 異常通知記錄
export interface AnomalyNotification {
  id: string;
  anomalyId: string;
  channel: NotificationChannel;
  recipient: string;
  message: string;
  status: NotificationStatus;
  sentAt?: string;
  deliveredAt?: string;
  error?: string;
}

// 異常規則
export interface AnomalyRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;

  // 觸發條件
  conditions: {
    statusUnchangedHours?: number;     // 狀態未變更時數
    statusIs?: ShipmentStatus;         // 當前狀態等於
    statusNotIn?: ShipmentStatus[];    // 狀態不在列表中
    carrierIs?: CarrierCode[];         // 指定物流商
    daysSinceShipped?: number;         // 發貨後天數
  };

  // 動作
  severity: AnomalySeverity;
  autoNotifyCustomer: boolean;
  notificationChannels: NotificationChannel[];
  notificationTemplate?: string;

  // 元資料
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// 通知歷史
export interface NotificationHistory {
  id: string;
  anomalyId: string;
  shipmentId: string;
  trackingNumber: string;
  customerName: string;
  channel: NotificationChannel;
  recipient: string;
  message: string;
  status: NotificationStatus;
  sentAt: string;
  deliveredAt?: string;
  error?: string;
}

// 物流商統計
export interface CarrierStats {
  carrier: CarrierCode;
  totalShipments: number;
  deliveredOnTime: number;
  delayed: number;
  anomalies: number;
  avgDeliveryDays: number;
  performanceScore: number; // 0-100
}

// Logistics Radar 儀表板統計
export interface LogisticsRadarStats {
  totalActiveShipments: number;
  shipmentsInTransit: number;
  deliveredToday: number;
  totalAnomalies: number;
  unresolvedAnomalies: number;
  criticalAnomalies: number;
  notificationsSentToday: number;
  carrierPerformance: CarrierStats[];
  recentAnomalies: Anomaly[];
  anomalyTrend: {
    date: string;
    count: number;
    resolved: number;
  }[];
  statusDistribution: {
    status: ShipmentStatus;
    count: number;
  }[];
}

// 標籤中文對應
export const CARRIER_LABELS: Record<CarrierCode, string> = {
  seven_eleven: '7-11',
  family_mart: '全家',
  hilife: '萊爾富',
  ok_mart: 'OK超商',
  sf_express: '順豐速運',
  kerry: '嘉里大榮',
  black_cat: '黑貓宅急便',
  post: '中華郵政',
  shopee: '蝦皮店到店',
  momo: 'momo物流',
  other: '其他'
};

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  created: '已建立',
  picked_up: '已取件',
  in_transit: '運送中',
  at_warehouse: '在倉庫',
  at_store: '已到店',
  out_for_delivery: '配送中',
  delivered: '已送達',
  returned: '已退回',
  exception: '異常'
};

export const ANOMALY_TYPE_LABELS: Record<AnomalyType, string> = {
  delayed_pickup: '取件延遲',
  transit_delay: '運送延遲',
  stuck_at_warehouse: '滯留倉庫',
  delivery_failed: '配送失敗',
  store_not_arrived: '未到店',
  return_initiated: '退貨發起',
  lost_package: '包裹遺失',
  damaged: '包裹損壞',
  address_issue: '地址問題',
  custom_rule: '自訂規則觸發'
};

export const ANOMALY_SEVERITY_LABELS: Record<AnomalySeverity, string> = {
  low: '低',
  medium: '中',
  high: '高',
  critical: '緊急'
};

export const ANOMALY_STATUS_LABELS: Record<AnomalyStatus, string> = {
  new: '新發現',
  acknowledged: '已確認',
  investigating: '調查中',
  resolved: '已解決',
  dismissed: '已忽略'
};

export const NOTIFICATION_STATUS_LABELS: Record<NotificationStatus, string> = {
  pending: '待發送',
  sent: '已發送',
  delivered: '已送達',
  failed: '發送失敗',
  skipped: '已跳過'
};

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  sms: '簡訊',
  email: 'Email',
  line: 'LINE',
  push: '推播通知'
};

// 狀態顏色對應
export const SHIPMENT_STATUS_COLORS: Record<ShipmentStatus, string> = {
  created: 'bg-gray-100 text-gray-700',
  picked_up: 'bg-blue-100 text-blue-700',
  in_transit: 'bg-indigo-100 text-indigo-700',
  at_warehouse: 'bg-purple-100 text-purple-700',
  at_store: 'bg-cyan-100 text-cyan-700',
  out_for_delivery: 'bg-yellow-100 text-yellow-700',
  delivered: 'bg-green-100 text-green-700',
  returned: 'bg-orange-100 text-orange-700',
  exception: 'bg-red-100 text-red-700'
};

export const ANOMALY_SEVERITY_COLORS: Record<AnomalySeverity, string> = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700'
};

export const ANOMALY_STATUS_COLORS: Record<AnomalyStatus, string> = {
  new: 'bg-red-100 text-red-700',
  acknowledged: 'bg-yellow-100 text-yellow-700',
  investigating: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  dismissed: 'bg-gray-100 text-gray-700'
};

// 預設異常規則
export const DEFAULT_ANOMALY_RULES: Partial<AnomalyRule>[] = [
  {
    name: '超商取貨延遲 (72小時)',
    description: '發貨後 72 小時未抵達門市',
    conditions: {
      statusUnchangedHours: 72,
      statusNotIn: ['at_store', 'delivered', 'returned']
    },
    severity: 'medium',
    autoNotifyCustomer: true,
    notificationChannels: ['sms', 'email']
  },
  {
    name: '滯留倉庫 (48小時)',
    description: '包裹在倉庫停留超過 48 小時',
    conditions: {
      statusUnchangedHours: 48,
      statusIs: 'at_warehouse'
    },
    severity: 'high',
    autoNotifyCustomer: false,
    notificationChannels: ['email']
  },
  {
    name: '配送失敗',
    description: '配送失敗或地址問題',
    conditions: {
      statusIs: 'exception'
    },
    severity: 'critical',
    autoNotifyCustomer: true,
    notificationChannels: ['sms', 'line']
  }
];
