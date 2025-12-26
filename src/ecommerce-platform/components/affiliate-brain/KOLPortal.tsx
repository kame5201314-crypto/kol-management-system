import React, { useState, useEffect } from 'react';
import {
  User,
  DollarSign,
  TrendingUp,
  Package,
  Calendar,
  Copy,
  CheckCircle,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import StatsCard, { GradientStatsCard } from '../shared/StatsCard';
import StatusBadge from '../shared/StatusBadge';
import { kolProfileService, commissionRecordService, importedOrderService } from '../../services/affiliateBrainService';
import { KOLProfile, CommissionRecord, ImportedOrder, COMMISSION_STATUS_LABELS, COMMISSION_STATUS_COLORS } from '../../types/affiliateBrain';

export default function KOLPortal() {
  const [selectedKOL, setSelectedKOL] = useState<KOLProfile | null>(null);
  const [kols, setKOLs] = useState<KOLProfile[]>([]);
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [recentOrders, setRecentOrders] = useState<ImportedOrder[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const allKOLs = kolProfileService.getAll();
    setKOLs(allKOLs);
    if (allKOLs.length > 0) {
      setSelectedKOL(allKOLs[0]);
    }
  }, []);

  useEffect(() => {
    if (selectedKOL) {
      const kolCommissions = commissionRecordService.getByKOL(selectedKOL.id);
      setCommissions(kolCommissions);

      const kolOrders = importedOrderService.getByKOL(selectedKOL.id);
      setRecentOrders(kolOrders.slice(0, 10));
    }
  }, [selectedKOL]);

  const copyPromoCode = () => {
    if (selectedKOL) {
      navigator.clipboard.writeText(selectedKOL.promoCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (!selectedKOL) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <User className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <p>尚無 KOL 資料</p>
        </div>
      </div>
    );
  }

  // 計算統計
  const thisMonthCommission = commissions
    .filter(c => c.period === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`)
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  const totalPendingCommission = commissions
    .filter(c => c.status === 'pending' || c.status === 'approved')
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  const totalPaidCommission = commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KOL Portal</h1>
          <p className="text-gray-500 mt-1">KOL 自助查詢銷售和傭金</p>
        </div>

        {/* KOL Selector */}
        <select
          value={selectedKOL.id}
          onChange={(e) => {
            const kol = kols.find(k => k.id === e.target.value);
            if (kol) setSelectedKOL(kol);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
        >
          {kols.map(kol => (
            <option key={kol.id} value={kol.id}>{kol.name}</option>
          ))}
        </select>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              {selectedKOL.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{selectedKOL.name}</h2>
              <p className="text-white/80">{selectedKOL.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge
                  label={selectedKOL.status === 'active' ? '活躍中' : '未啟用'}
                  color={selectedKOL.status === 'active' ? 'bg-green-400/30 text-green-100' : 'bg-white/20 text-white/80'}
                  size="sm"
                />
                <span className="text-sm text-white/80">分潤率 {selectedKOL.commissionRate}%</span>
              </div>
            </div>
          </div>

          {/* Promo Code */}
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm text-white/80 mb-1">我的折扣碼</p>
            <div className="flex items-center gap-2">
              <code className="text-2xl font-mono font-bold">{selectedKOL.promoCode}</code>
              <button
                onClick={copyPromoCode}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {copiedCode ? (
                  <CheckCircle className="w-5 h-5 text-green-300" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="累計銷售額"
          value={formatCurrency(selectedKOL.totalSales)}
          icon={<TrendingUp className="w-6 h-6" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          title="累計訂單"
          value={selectedKOL.totalOrders}
          subtitle="筆訂單"
          icon={<Package className="w-6 h-6" />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          title="待領取傭金"
          value={formatCurrency(totalPendingCommission)}
          subtitle="待審核或待發放"
          icon={<DollarSign className="w-6 h-6" />}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
        />
        <StatsCard
          title="已領取傭金"
          value={formatCurrency(totalPaidCommission)}
          subtitle="累計已發放"
          icon={<CheckCircle className="w-6 h-6" />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commission History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            傭金記錄
          </h3>
          <div className="space-y-3">
            {commissions.slice(0, 6).map((commission) => (
              <div key={commission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{commission.period}</p>
                  <p className="text-sm text-gray-500">
                    銷售 {formatCurrency(commission.totalSales)} · {commission.ordersCount} 筆
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {formatCurrency(commission.commissionAmount)}
                  </p>
                  <StatusBadge
                    label={COMMISSION_STATUS_LABELS[commission.status]}
                    color={COMMISSION_STATUS_COLORS[commission.status]}
                    size="sm"
                  />
                </div>
              </div>
            ))}
            {commissions.length === 0 && (
              <p className="text-center text-gray-500 py-4">尚無傭金記錄</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            近期訂單
          </h3>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{order.productName}</p>
                  <p className="text-sm text-gray-500">
                    {order.orderDate} · {order.quantity} 件
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(order.totalAmount)}
                  </p>
                  <p className="text-sm text-green-600">
                    +{formatCurrency(order.commissionAmount || 0)}
                  </p>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-center text-gray-500 py-4">尚無訂單記錄</p>
            )}
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          銷售趨勢
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-2" />
            <p>月度銷售趨勢圖表</p>
            <p className="text-sm mt-1">(可整合 Recharts 繪製)</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-indigo-50 rounded-xl p-4">
        <h3 className="font-medium text-indigo-900 mb-3">快速連結</h3>
        <div className="flex flex-wrap gap-3">
          <a href="#" className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors">
            <ExternalLink className="w-4 h-4" />
            分享專屬連結
          </a>
          <a href="#" className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors">
            <Calendar className="w-4 h-4" />
            查看完整報表
          </a>
        </div>
      </div>
    </div>
  );
}
