// Logistics Radar 服務層
import {
  Shipment,
  Anomaly,
  AnomalyRule,
  NotificationHistory,
  CarrierStats,
  LogisticsRadarStats,
  AnomalyStatus,
  AnomalySeverity,
  CarrierCode
} from '../types/logisticsRadar';
import {
  mockShipments,
  mockAnomalies,
  mockAnomalyRules,
  mockNotificationHistory,
  getLogisticsRadarStats
} from '../data/logisticsRadarMockData';

// localStorage Keys
const STORAGE_KEYS = {
  SHIPMENTS: 'ecommerce_shipments',
  ANOMALIES: 'ecommerce_anomalies',
  ANOMALY_RULES: 'ecommerce_anomaly_rules',
  NOTIFICATIONS: 'ecommerce_notifications'
};

// 包裹服務
export const shipmentService = {
  getAll: (): Shipment[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.SHIPMENTS);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(mockShipments));
    return mockShipments;
  },

  getById: (id: string): Shipment | undefined => {
    const shipments = shipmentService.getAll();
    return shipments.find(s => s.id === id);
  },

  getByTrackingNumber: (trackingNumber: string): Shipment | undefined => {
    const shipments = shipmentService.getAll();
    return shipments.find(s => s.trackingNumber === trackingNumber);
  },

  getByCarrier: (carrier: CarrierCode): Shipment[] => {
    const shipments = shipmentService.getAll();
    return shipments.filter(s => s.carrier === carrier);
  },

  getWithAnomalies: (): Shipment[] => {
    const shipments = shipmentService.getAll();
    return shipments.filter(s => s.hasAnomaly);
  },

  update: (id: string, data: Partial<Shipment>): Shipment | undefined => {
    const shipments = shipmentService.getAll();
    const index = shipments.findIndex(s => s.id === id);
    if (index === -1) return undefined;

    shipments[index] = {
      ...shipments[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(shipments));
    return shipments[index];
  },

  search: (query: string): Shipment[] => {
    const shipments = shipmentService.getAll();
    const lowerQuery = query.toLowerCase();
    return shipments.filter(s =>
      s.trackingNumber.toLowerCase().includes(lowerQuery) ||
      s.orderId.toLowerCase().includes(lowerQuery) ||
      s.customerName.toLowerCase().includes(lowerQuery)
    );
  }
};

// 異常服務
export const anomalyService = {
  getAll: (): Anomaly[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.ANOMALIES);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(STORAGE_KEYS.ANOMALIES, JSON.stringify(mockAnomalies));
    return mockAnomalies;
  },

  getById: (id: string): Anomaly | undefined => {
    const anomalies = anomalyService.getAll();
    return anomalies.find(a => a.id === id);
  },

  getByStatus: (status: AnomalyStatus): Anomaly[] => {
    const anomalies = anomalyService.getAll();
    return anomalies.filter(a => a.status === status);
  },

  getBySeverity: (severity: AnomalySeverity): Anomaly[] => {
    const anomalies = anomalyService.getAll();
    return anomalies.filter(a => a.severity === severity);
  },

  getUnresolved: (): Anomaly[] => {
    const anomalies = anomalyService.getAll();
    return anomalies.filter(a => !['resolved', 'dismissed'].includes(a.status));
  },

  acknowledge: (id: string): Anomaly | undefined => {
    return anomalyService.updateStatus(id, 'acknowledged');
  },

  investigate: (id: string): Anomaly | undefined => {
    return anomalyService.updateStatus(id, 'investigating');
  },

  resolve: (id: string, resolution: string, resolvedBy: string): Anomaly | undefined => {
    const anomalies = anomalyService.getAll();
    const index = anomalies.findIndex(a => a.id === id);
    if (index === -1) return undefined;

    anomalies[index] = {
      ...anomalies[index],
      status: 'resolved',
      resolution,
      resolvedBy,
      resolvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.ANOMALIES, JSON.stringify(anomalies));
    return anomalies[index];
  },

  dismiss: (id: string): Anomaly | undefined => {
    return anomalyService.updateStatus(id, 'dismissed');
  },

  updateStatus: (id: string, status: AnomalyStatus): Anomaly | undefined => {
    const anomalies = anomalyService.getAll();
    const index = anomalies.findIndex(a => a.id === id);
    if (index === -1) return undefined;

    const updateFields: Partial<Anomaly> = {
      status,
      updatedAt: new Date().toISOString()
    };

    if (status === 'acknowledged') {
      updateFields.acknowledgedAt = new Date().toISOString();
    }

    anomalies[index] = { ...anomalies[index], ...updateFields };
    localStorage.setItem(STORAGE_KEYS.ANOMALIES, JSON.stringify(anomalies));
    return anomalies[index];
  }
};

// 異常規則服務
export const anomalyRuleService = {
  getAll: (): AnomalyRule[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.ANOMALY_RULES);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(STORAGE_KEYS.ANOMALY_RULES, JSON.stringify(mockAnomalyRules));
    return mockAnomalyRules;
  },

  getById: (id: string): AnomalyRule | undefined => {
    const rules = anomalyRuleService.getAll();
    return rules.find(r => r.id === id);
  },

  getActive: (): AnomalyRule[] => {
    const rules = anomalyRuleService.getAll();
    return rules.filter(r => r.isActive);
  },

  create: (rule: Omit<AnomalyRule, 'id' | 'createdAt' | 'updatedAt'>): AnomalyRule => {
    const rules = anomalyRuleService.getAll();
    const newRule: AnomalyRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    rules.push(newRule);
    localStorage.setItem(STORAGE_KEYS.ANOMALY_RULES, JSON.stringify(rules));
    return newRule;
  },

  update: (id: string, data: Partial<AnomalyRule>): AnomalyRule | undefined => {
    const rules = anomalyRuleService.getAll();
    const index = rules.findIndex(r => r.id === id);
    if (index === -1) return undefined;

    rules[index] = {
      ...rules[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.ANOMALY_RULES, JSON.stringify(rules));
    return rules[index];
  },

  toggleActive: (id: string): AnomalyRule | undefined => {
    const rules = anomalyRuleService.getAll();
    const index = rules.findIndex(r => r.id === id);
    if (index === -1) return undefined;

    rules[index].isActive = !rules[index].isActive;
    rules[index].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.ANOMALY_RULES, JSON.stringify(rules));
    return rules[index];
  },

  delete: (id: string): boolean => {
    const rules = anomalyRuleService.getAll();
    const filtered = rules.filter(r => r.id !== id);
    if (filtered.length === rules.length) return false;
    localStorage.setItem(STORAGE_KEYS.ANOMALY_RULES, JSON.stringify(filtered));
    return true;
  }
};

// 通知歷史服務
export const notificationHistoryService = {
  getAll: (): NotificationHistory[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(mockNotificationHistory));
    return mockNotificationHistory;
  },

  getByAnomalyId: (anomalyId: string): NotificationHistory[] => {
    const notifications = notificationHistoryService.getAll();
    return notifications.filter(n => n.anomalyId === anomalyId);
  },

  getRecent: (limit: number = 50): NotificationHistory[] => {
    const notifications = notificationHistoryService.getAll();
    return notifications
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
      .slice(0, limit);
  }
};

// 儀表板服務
export const logisticsDashboardService = {
  getStats: (): LogisticsRadarStats => {
    return getLogisticsRadarStats();
  }
};

// 模擬通知發送
export const notificationService = {
  sendSMS: async (phone: string, message: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return Math.random() > 0.1
      ? { success: true }
      : { success: false, error: '發送失敗：號碼格式錯誤' };
  },

  sendEmail: async (email: string, subject: string, message: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return Math.random() > 0.05
      ? { success: true }
      : { success: false, error: '發送失敗：郵件伺服器錯誤' };
  },

  sendLine: async (lineId: string, message: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return Math.random() > 0.15
      ? { success: true }
      : { success: false, error: '發送失敗：用戶未綁定 LINE' };
  }
};
