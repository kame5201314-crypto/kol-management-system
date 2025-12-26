import {
  Shipment,
  Anomaly,
  AnomalyRule,
  NotificationHistory,
  CarrierStats,
  ShipmentStatus,
  AnomalyType,
  AnomalySeverity,
  AnomalyStatus,
  CarrierCode
} from '../types/logisticsRadar';

// Mock Shipments
export const mockShipments: Shipment[] = [
  {
    id: 'ship-001',
    trackingNumber: '7ELEVEN123456789',
    orderId: 'ORD-2024122001',
    carrier: 'seven_eleven',
    customerName: '林小姐',
    customerPhone: '0912-345-678',
    customerEmail: 'lin@example.com',
    origin: '台北市內湖區',
    destination: '台北市大安區',
    destinationStore: '7-11 大安門市',
    currentStatus: 'at_store',
    estimatedDelivery: '2024-12-21',
    events: [
      { id: 'e1', timestamp: '2024-12-19T10:00:00Z', status: 'created', description: '訂單已建立' },
      { id: 'e2', timestamp: '2024-12-19T14:00:00Z', status: 'picked_up', location: '內湖倉庫', description: '已取件' },
      { id: 'e3', timestamp: '2024-12-20T08:00:00Z', status: 'in_transit', location: '台北轉運中心', description: '運送中' },
      { id: 'e4', timestamp: '2024-12-20T16:00:00Z', status: 'at_store', location: '7-11 大安門市', description: '已到店，等待取件' }
    ],
    hasAnomaly: false,
    createdAt: '2024-12-19T10:00:00Z',
    updatedAt: '2024-12-20T16:00:00Z',
    lastCheckedAt: '2024-12-21T08:00:00Z'
  },
  {
    id: 'ship-002',
    trackingNumber: 'BLACKCAT987654321',
    orderId: 'ORD-2024121801',
    carrier: 'black_cat',
    customerName: '陳先生',
    customerPhone: '0923-456-789',
    origin: '台中市西屯區',
    destination: '高雄市左營區',
    currentStatus: 'in_transit',
    estimatedDelivery: '2024-12-20',
    events: [
      { id: 'e1', timestamp: '2024-12-18T09:00:00Z', status: 'created', description: '訂單已建立' },
      { id: 'e2', timestamp: '2024-12-18T14:00:00Z', status: 'picked_up', location: '台中倉庫', description: '已取件' },
      { id: 'e3', timestamp: '2024-12-18T20:00:00Z', status: 'in_transit', location: '台中轉運站', description: '運送中' }
    ],
    hasAnomaly: true,
    anomalyIds: ['anom-001'],
    createdAt: '2024-12-18T09:00:00Z',
    updatedAt: '2024-12-18T20:00:00Z',
    lastCheckedAt: '2024-12-21T08:00:00Z'
  },
  {
    id: 'ship-003',
    trackingNumber: 'FAMILY456789123',
    orderId: 'ORD-2024121901',
    carrier: 'family_mart',
    customerName: '王小姐',
    customerPhone: '0934-567-890',
    origin: '新北市板橋區',
    destination: '桃園市中壢區',
    destinationStore: '全家 中壢站前店',
    currentStatus: 'at_warehouse',
    estimatedDelivery: '2024-12-20',
    events: [
      { id: 'e1', timestamp: '2024-12-19T11:00:00Z', status: 'created', description: '訂單已建立' },
      { id: 'e2', timestamp: '2024-12-19T15:00:00Z', status: 'picked_up', description: '已取件' },
      { id: 'e3', timestamp: '2024-12-19T22:00:00Z', status: 'at_warehouse', location: '桃園倉庫', description: '在倉庫' }
    ],
    hasAnomaly: true,
    anomalyIds: ['anom-002'],
    createdAt: '2024-12-19T11:00:00Z',
    updatedAt: '2024-12-19T22:00:00Z',
    lastCheckedAt: '2024-12-21T08:00:00Z'
  },
  {
    id: 'ship-004',
    trackingNumber: 'SF789456123',
    orderId: 'ORD-2024122002',
    carrier: 'sf_express',
    customerName: '張先生',
    origin: '台北市信義區',
    destination: '台南市東區',
    currentStatus: 'delivered',
    actualDelivery: '2024-12-20',
    events: [
      { id: 'e1', timestamp: '2024-12-19T08:00:00Z', status: 'created', description: '訂單已建立' },
      { id: 'e2', timestamp: '2024-12-19T10:00:00Z', status: 'picked_up', description: '已取件' },
      { id: 'e3', timestamp: '2024-12-19T18:00:00Z', status: 'in_transit', description: '運送中' },
      { id: 'e4', timestamp: '2024-12-20T10:00:00Z', status: 'out_for_delivery', description: '配送中' },
      { id: 'e5', timestamp: '2024-12-20T14:30:00Z', status: 'delivered', description: '已送達' }
    ],
    hasAnomaly: false,
    createdAt: '2024-12-19T08:00:00Z',
    updatedAt: '2024-12-20T14:30:00Z',
    lastCheckedAt: '2024-12-21T08:00:00Z'
  }
];

// Mock Anomalies
export const mockAnomalies: Anomaly[] = [
  {
    id: 'anom-001',
    shipmentId: 'ship-002',
    trackingNumber: 'BLACKCAT987654321',
    orderId: 'ORD-2024121801',
    type: 'transit_delay',
    severity: 'high',
    status: 'new',
    title: '運送延遲超過 72 小時',
    description: '包裹自 12/18 進入運送狀態後已超過 72 小時未更新',
    triggeredRule: '超商取貨延遲 (72小時)',
    detectedAt: '2024-12-21T08:00:00Z',
    customerName: '陳先生',
    customerContact: '0923-456-789',
    notificationsSent: [],
    createdAt: '2024-12-21T08:00:00Z',
    updatedAt: '2024-12-21T08:00:00Z'
  },
  {
    id: 'anom-002',
    shipmentId: 'ship-003',
    trackingNumber: 'FAMILY456789123',
    orderId: 'ORD-2024121901',
    type: 'stuck_at_warehouse',
    severity: 'medium',
    status: 'acknowledged',
    title: '滯留倉庫超過 48 小時',
    description: '包裹在桃園倉庫停留超過 48 小時',
    triggeredRule: '滯留倉庫 (48小時)',
    detectedAt: '2024-12-21T06:00:00Z',
    acknowledgedAt: '2024-12-21T09:00:00Z',
    customerName: '王小姐',
    customerContact: '0934-567-890',
    notificationsSent: [
      {
        id: 'notif-001',
        anomalyId: 'anom-002',
        channel: 'sms',
        recipient: '0934-567-890',
        message: '您的包裹因物流繁忙稍有延遲，我們正在幫您追蹤，請放心。',
        status: 'delivered',
        sentAt: '2024-12-21T09:30:00Z',
        deliveredAt: '2024-12-21T09:31:00Z'
      }
    ],
    createdAt: '2024-12-21T06:00:00Z',
    updatedAt: '2024-12-21T09:30:00Z'
  },
  {
    id: 'anom-003',
    shipmentId: 'ship-005',
    trackingNumber: 'KERRY111222333',
    orderId: 'ORD-2024121502',
    type: 'delivery_failed',
    severity: 'critical',
    status: 'investigating',
    title: '配送失敗 - 地址問題',
    description: '配送員無法找到正確地址',
    detectedAt: '2024-12-20T15:00:00Z',
    acknowledgedAt: '2024-12-20T15:30:00Z',
    customerName: '黃先生',
    customerContact: '0945-678-901',
    notificationsSent: [
      {
        id: 'notif-002',
        anomalyId: 'anom-003',
        channel: 'sms',
        recipient: '0945-678-901',
        message: '您的包裹配送失敗，請確認收件地址是否正確，或與我們聯繫。',
        status: 'delivered',
        sentAt: '2024-12-20T15:35:00Z',
        deliveredAt: '2024-12-20T15:36:00Z'
      },
      {
        id: 'notif-003',
        anomalyId: 'anom-003',
        channel: 'email',
        recipient: 'huang@example.com',
        message: '您的包裹配送失敗詳細說明...',
        status: 'delivered',
        sentAt: '2024-12-20T15:35:00Z',
        deliveredAt: '2024-12-20T15:40:00Z'
      }
    ],
    createdAt: '2024-12-20T15:00:00Z',
    updatedAt: '2024-12-21T10:00:00Z'
  }
];

// Mock Anomaly Rules
export const mockAnomalyRules: AnomalyRule[] = [
  {
    id: 'rule-001',
    name: '超商取貨延遲 (72小時)',
    description: '發貨後 72 小時未抵達門市',
    isActive: true,
    conditions: {
      statusUnchangedHours: 72,
      statusNotIn: ['at_store', 'delivered', 'returned']
    },
    severity: 'medium',
    autoNotifyCustomer: true,
    notificationChannels: ['sms', 'email'],
    notificationTemplate: '您的包裹因物流繁忙稍有延遲，我們正在幫您追蹤，請放心。',
    createdBy: '系統管理員',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'rule-002',
    name: '滯留倉庫 (48小時)',
    description: '包裹在倉庫停留超過 48 小時',
    isActive: true,
    conditions: {
      statusUnchangedHours: 48,
      statusIs: 'at_warehouse'
    },
    severity: 'high',
    autoNotifyCustomer: false,
    notificationChannels: ['email'],
    createdBy: '系統管理員',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'rule-003',
    name: '配送失敗',
    description: '配送失敗或地址問題',
    isActive: true,
    conditions: {
      statusIs: 'exception'
    },
    severity: 'critical',
    autoNotifyCustomer: true,
    notificationChannels: ['sms', 'line'],
    notificationTemplate: '您的包裹配送失敗，請確認收件地址是否正確，或與我們聯繫。',
    createdBy: '系統管理員',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Mock Notification History
export const mockNotificationHistory: NotificationHistory[] = [
  {
    id: 'notif-001',
    anomalyId: 'anom-002',
    shipmentId: 'ship-003',
    trackingNumber: 'FAMILY456789123',
    customerName: '王小姐',
    channel: 'sms',
    recipient: '0934-567-890',
    message: '您的包裹因物流繁忙稍有延遲，我們正在幫您追蹤，請放心。',
    status: 'delivered',
    sentAt: '2024-12-21T09:30:00Z',
    deliveredAt: '2024-12-21T09:31:00Z'
  },
  {
    id: 'notif-002',
    anomalyId: 'anom-003',
    shipmentId: 'ship-005',
    trackingNumber: 'KERRY111222333',
    customerName: '黃先生',
    channel: 'sms',
    recipient: '0945-678-901',
    message: '您的包裹配送失敗，請確認收件地址是否正確，或與我們聯繫。',
    status: 'delivered',
    sentAt: '2024-12-20T15:35:00Z',
    deliveredAt: '2024-12-20T15:36:00Z'
  },
  {
    id: 'notif-003',
    anomalyId: 'anom-003',
    shipmentId: 'ship-005',
    trackingNumber: 'KERRY111222333',
    customerName: '黃先生',
    channel: 'email',
    recipient: 'huang@example.com',
    message: '您的包裹配送失敗詳細說明...',
    status: 'delivered',
    sentAt: '2024-12-20T15:35:00Z',
    deliveredAt: '2024-12-20T15:40:00Z'
  }
];

// Mock Carrier Stats
export const mockCarrierStats: CarrierStats[] = [
  {
    carrier: 'seven_eleven',
    totalShipments: 450,
    deliveredOnTime: 420,
    delayed: 25,
    anomalies: 5,
    avgDeliveryDays: 2.1,
    performanceScore: 93
  },
  {
    carrier: 'family_mart',
    totalShipments: 380,
    deliveredOnTime: 345,
    delayed: 30,
    anomalies: 5,
    avgDeliveryDays: 2.3,
    performanceScore: 91
  },
  {
    carrier: 'black_cat',
    totalShipments: 520,
    deliveredOnTime: 480,
    delayed: 35,
    anomalies: 5,
    avgDeliveryDays: 1.8,
    performanceScore: 92
  },
  {
    carrier: 'sf_express',
    totalShipments: 180,
    deliveredOnTime: 175,
    delayed: 4,
    anomalies: 1,
    avgDeliveryDays: 1.5,
    performanceScore: 97
  }
];

// Helper function to get dashboard stats
export function getLogisticsRadarStats() {
  const activeShipments = mockShipments.filter(s =>
    !['delivered', 'returned'].includes(s.currentStatus)
  );
  const inTransit = mockShipments.filter(s => s.currentStatus === 'in_transit');
  const deliveredToday = mockShipments.filter(s =>
    s.currentStatus === 'delivered' &&
    s.actualDelivery === new Date().toISOString().split('T')[0]
  );

  const unresolvedAnomalies = mockAnomalies.filter(a =>
    !['resolved', 'dismissed'].includes(a.status)
  );
  const criticalAnomalies = unresolvedAnomalies.filter(a => a.severity === 'critical');

  return {
    totalActiveShipments: activeShipments.length,
    shipmentsInTransit: inTransit.length,
    deliveredToday: deliveredToday.length || 28, // Mock data
    totalAnomalies: mockAnomalies.length,
    unresolvedAnomalies: unresolvedAnomalies.length,
    criticalAnomalies: criticalAnomalies.length,
    notificationsSentToday: 15, // Mock
    carrierPerformance: mockCarrierStats,
    recentAnomalies: mockAnomalies.slice(0, 5),
    anomalyTrend: [
      { date: '2024-12-15', count: 5, resolved: 4 },
      { date: '2024-12-16', count: 3, resolved: 3 },
      { date: '2024-12-17', count: 7, resolved: 5 },
      { date: '2024-12-18', count: 4, resolved: 4 },
      { date: '2024-12-19', count: 6, resolved: 4 },
      { date: '2024-12-20', count: 8, resolved: 5 },
      { date: '2024-12-21', count: 3, resolved: 0 }
    ],
    statusDistribution: [
      { status: 'created' as ShipmentStatus, count: 12 },
      { status: 'picked_up' as ShipmentStatus, count: 18 },
      { status: 'in_transit' as ShipmentStatus, count: 35 },
      { status: 'at_store' as ShipmentStatus, count: 24 },
      { status: 'delivered' as ShipmentStatus, count: 156 }
    ]
  };
}
