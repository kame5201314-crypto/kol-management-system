import React, { useState, useEffect } from 'react';
import {
  Shield,
  Image,
  Search,
  Gavel,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Target,
  FileWarning
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { imageGuardianService } from '../../services/imageGuardianService';
import type { ImageGuardianStats, Violation, LegalCase } from '../../types/imageGuardian';
import {
  CASE_STATUS_LABELS,
  CASE_STATUS_COLORS,
  SIMILARITY_LEVEL_LABELS,
  SIMILARITY_LEVEL_COLORS,
  PLATFORM_LABELS
} from '../../types/imageGuardian';

export default function GuardianOverviewPage() {
  const [stats, setStats] = useState<ImageGuardianStats | null>(null);
  const [recentViolations, setRecentViolations] = useState<Violation[]>([]);
  const [activeCases, setActiveCases] = useState<LegalCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      try {
        const statsData = imageGuardianService.stats.getStats();
        const violationsData = imageGuardianService.violations.getAll();
        const casesData = imageGuardianService.cases.getAll();
        setStats(statsData);
        setRecentViolations(violationsData.slice(0, 5));
        setActiveCases(casesData.filter(c => !['resolved', 'dismissed'].includes(c.status)).slice(0, 5));
      } catch (error) {
        console.error('Failed to load guardian data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Image Guardian</h1>
            <p className="text-sm text-gray-500">AI 智慧圖片版權保護系統</p>
          </div>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">受保護資產</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.assets.total || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Image className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>本月新增 {stats?.assets.newThisMonth || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">總掃描次數</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.scans.totalScans || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Search className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>本月 {stats?.scans.scansThisMonth || 0} 次</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">偵測侵權</p>
              <p className="text-2xl font-bold text-red-600">{stats?.violations.total || 0}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm text-orange-600">
            <FileWarning className="w-4 h-4" />
            <span>本週新增 {stats?.violations.newThisWeek || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">維權案件</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.cases.active || 0}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Gavel className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>成功維權 {stats?.cases.resolved || 0}</span>
          </div>
        </div>
      </div>

      {/* 三大模組快速入口 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/ecommerce/image-guardian/vault"
          className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Image className="w-8 h-8" />
            </div>
            <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-xl font-bold mb-1">數位資產庫</h3>
          <p className="text-sm text-blue-100">上傳原創圖片、計算 AI 指紋、管理授權白名單</p>
          <div className="mt-4 pt-3 border-t border-white/20 text-sm">
            {stats?.assets.total || 0} 個受保護資產
          </div>
        </Link>

        <Link
          to="/ecommerce/image-guardian/hunter"
          className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Target className="w-8 h-8" />
            </div>
            <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-xl font-bold mb-1">全網巡邏獵人</h3>
          <p className="text-sm text-purple-100">自動爬取電商平台、pHash + ORB 雙重偵測</p>
          <div className="mt-4 pt-3 border-t border-white/20 text-sm">
            {stats?.scans.totalScans || 0} 次掃描完成
          </div>
        </Link>

        <Link
          to="/ecommerce/image-guardian/warroom"
          className="group bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Gavel className="w-8 h-8" />
            </div>
            <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-xl font-bold mb-1">維權作戰中心</h3>
          <p className="text-sm text-orange-100">截圖存證、三級警告信、一鍵檢舉</p>
          <div className="mt-4 pt-3 border-t border-white/20 text-sm">
            {stats?.cases.active || 0} 個進行中案件
          </div>
        </Link>
      </div>

      {/* 最近侵權 & 進行中案件 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近偵測的侵權 */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-gray-900">最近偵測侵權</h2>
            <Link
              to="/ecommerce/image-guardian/hunter"
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              查看全部
            </Link>
          </div>
          <div className="divide-y">
            {recentViolations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                <p>目前沒有偵測到侵權行為</p>
              </div>
            ) : (
              recentViolations.map((violation) => (
                <div key={violation.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <img
                      src={violation.listing.thumbnailUrl}
                      alt="侵權圖片"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          SIMILARITY_LEVEL_COLORS[violation.similarity.level]
                        }`}>
                          {Math.round(violation.similarity.overall)}%
                        </span>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {PLATFORM_LABELS[violation.platform]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {violation.listing.sellerName || violation.listing.sellerId}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(violation.detectedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 進行中案件 */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-gray-900">進行中案件</h2>
            <Link
              to="/ecommerce/image-guardian/warroom"
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              查看全部
            </Link>
          </div>
          <div className="divide-y">
            {activeCases.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Gavel className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>目前沒有進行中的案件</p>
              </div>
            ) : (
              activeCases.map((caseItem) => (
                <div key={caseItem.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          CASE_STATUS_COLORS[caseItem.status]
                        }`}>
                          {CASE_STATUS_LABELS[caseItem.status]}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {caseItem.infringer.sellerName || caseItem.infringer.sellerId}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {caseItem.violations.length} 項侵權 • {PLATFORM_LABELS[caseItem.infringer.platform]}
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      {formatDate(caseItem.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 系統狀態 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">系統運作正常</span>
          </div>
          <div className="h-4 w-px bg-gray-200"></div>
          <span className="text-sm text-gray-500">
            上次掃描：{stats?.scans.lastScanAt ? formatDate(stats.scans.lastScanAt) : '尚未執行'}
          </span>
          <div className="h-4 w-px bg-gray-200"></div>
          <span className="text-sm text-gray-500">
            指紋服務：pHash + ORB 雙重偵測
          </span>
        </div>
      </div>
    </div>
  );
}
