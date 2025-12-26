import React, { useState, useEffect } from 'react';
import {
  Radar,
  Play,
  Pause,
  History,
  AlertTriangle,
  TrendingUp,
  Target,
  RefreshCw,
  Filter,
  ChevronRight
} from 'lucide-react';
import {
  ScanTask,
  Violation,
  InfringerProfile as InfringerProfileType,
  SCAN_STATUS_LABELS,
  SCAN_STATUS_COLORS,
  PLATFORM_LABELS
} from '../../../types/imageGuardian';
import { imageGuardianService } from '../../../services/imageGuardianService';
import ScanConfig from './ScanConfig';
import ScanResults from './ScanResults';
import ViolationCard from './ViolationCard';

interface HunterDashboardProps {
  onViewViolation?: (violation: Violation) => void;
  onViewInfringer?: (infringer: InfringerProfileType) => void;
  onCreateCase?: (violations: Violation[]) => void;
}

const HunterDashboard: React.FC<HunterDashboardProps> = ({
  onViewViolation,
  onViewInfringer,
  onCreateCase
}) => {
  const [tasks, setTasks] = useState<ScanTask[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [infringers, setInfringers] = useState<InfringerProfileType[]>([]);
  const [showScanConfig, setShowScanConfig] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ScanTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    setTasks(imageGuardianService.scan.getTasks());
    setViolations(imageGuardianService.violations.getAll());
    setInfringers(imageGuardianService.infringers.getAllProfiles());
    setIsLoading(false);
  };

  const handleStartScan = async (task: ScanTask) => {
    setTasks(prev => [task, ...prev]);
    setShowScanConfig(false);

    // 模擬掃描
    await imageGuardianService.scan.startScan(task.id);
    loadData();
  };

  const runningTasks = tasks.filter(t => t.status === 'running');
  const recentViolations = violations.slice(0, 6);
  const topInfringers = infringers.slice(0, 3);

  const stats = {
    totalScans: tasks.length,
    runningScans: runningTasks.length,
    totalViolations: violations.length,
    newViolations: violations.filter(v => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(v.detectedAt) > weekAgo;
    }).length,
    topPlatform: Object.entries(
      violations.reduce((acc, v) => {
        acc[v.platform] = (acc[v.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1])[0]
  };

  return (
    <div className="space-y-6">
      {/* 標題區 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Radar className="w-7 h-7 text-indigo-600" />
            全網巡邏獵人
          </h1>
          <p className="text-gray-600 mt-1">自動掃描電商平台，偵測盜圖侵權</p>
        </div>
        <button
          onClick={() => setShowScanConfig(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Play className="w-4 h-4" />
          啟動掃描
        </button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <History className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">總掃描次數</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalScans}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stats.runningScans > 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {stats.runningScans > 0 ? (
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                <Pause className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">進行中</p>
              <p className="text-2xl font-bold text-gray-900">{stats.runningScans}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">偵測到侵權</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalViolations}</p>
            </div>
          </div>
          {stats.newViolations > 0 && (
            <p className="text-xs text-red-600 mt-2">
              +{stats.newViolations} 本週新增
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">主要侵權平台</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.topPlatform ? PLATFORM_LABELS[stats.topPlatform[0] as keyof typeof PLATFORM_LABELS] : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 進行中的任務 */}
      {runningTasks.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
            進行中的掃描
          </h2>
          <div className="space-y-3">
            {runningTasks.map(task => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      掃描 {task.config.platforms.map(p => PLATFORM_LABELS[p]).join('、')}
                    </span>
                    <span className="text-sm text-gray-500">
                      {task.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>已掃描 {task.totalScanned} 個商品</span>
                    {task.violationsFound > 0 && (
                      <span className="text-red-600 font-medium">
                        發現 {task.violationsFound} 個侵權
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTask(task)}
                  className="p-2 hover:bg-blue-100 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 最新侵權記錄 */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">最新侵權記錄</h2>
            <button className="text-sm text-indigo-600 hover:underline">
              查看全部
            </button>
          </div>
          <div className="p-4">
            {recentViolations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>尚未偵測到侵權記錄</p>
                <p className="text-sm mt-1">啟動掃描開始偵測</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentViolations.map(violation => (
                  <ViolationCard
                    key={violation.id}
                    violation={violation}
                    onViewDetail={() => onViewViolation?.(violation)}
                    compact
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 高風險盜圖者 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-red-600" />
              高風險盜圖者
            </h2>
          </div>
          <div className="p-4">
            {topInfringers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>尚無盜圖者資料</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topInfringers.map(infringer => (
                  <div
                    key={infringer.sellerId}
                    onClick={() => onViewInfringer?.(infringer)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      infringer.riskLevel === 'critical' ? 'bg-red-500' :
                      infringer.riskLevel === 'high' ? 'bg-orange-500' :
                      infringer.riskLevel === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {infringer.sellerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {PLATFORM_LABELS[infringer.platform]} • {infringer.stats.violatingListings} 個侵權商品
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">
                        {infringer.riskScore}
                      </p>
                      <p className="text-xs text-gray-500">風險分數</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 掃描歷史 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <History className="w-5 h-5" />
            掃描歷史
          </h2>
          <button
            onClick={loadData}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  任務
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  狀態
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  平台
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  掃描數
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  侵權數
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  耗時
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  時間
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tasks.slice(0, 10).map(task => (
                <tr
                  key={task.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedTask(task)}
                >
                  <td className="px-4 py-3 text-sm">
                    <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                      {task.id.substring(0, 12)}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${SCAN_STATUS_COLORS[task.status]}`}>
                      {SCAN_STATUS_LABELS[task.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {task.config.platforms.map(p => PLATFORM_LABELS[p]).join('、')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {task.totalScanned}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${task.violationsFound > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {task.violationsFound}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {task.executionTimeMs
                      ? `${(task.executionTimeMs / 1000).toFixed(1)}s`
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(task.createdAt).toLocaleString('zh-TW')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 掃描設定 Modal */}
      {showScanConfig && (
        <ScanConfig
          onStartScan={handleStartScan}
          onClose={() => setShowScanConfig(false)}
        />
      )}

      {/* 掃描結果 Modal */}
      {selectedTask && (
        <ScanResults
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onViewViolation={onViewViolation}
          onCreateCase={onCreateCase}
        />
      )}
    </div>
  );
};

export default HunterDashboard;
