import React, { useState, useEffect, useCallback } from 'react';
import {
  Target,
  Play,
  Pause,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  X,
  Loader2,
  Eye,
  Wifi,
  WifiOff,
  Server
} from 'lucide-react';
import { imageGuardianService, checkBackendStatus, getBackendUrl } from '../../services/imageGuardianService';
import type { ScanTask, Violation, InfringerProfile, DigitalAsset } from '../../types/imageGuardian';
import { PLATFORM_LABELS, SIMILARITY_LEVEL_LABELS, SIMILARITY_LEVEL_COLORS } from '../../types/imageGuardian';
import ScanConfig from '../../components/image-guardian/HunterEngine/ScanConfig';
import ViolationCard from '../../components/image-guardian/HunterEngine/ViolationCard';
import InfringerProfileComponent from '../../components/image-guardian/HunterEngine/InfringerProfile';

type Tab = 'dashboard' | 'scan' | 'violations' | 'infringers';

interface ScanProgress {
  taskId: string;
  progress: number;
  message: string;
  scanned: number;
  violations: number;
  isActive: boolean;
}

export default function HunterPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [scanTasks, setScanTasks] = useState<ScanTask[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [infringers, setInfringers] = useState<InfringerProfile[]>([]);
  const [assets, setAssets] = useState<DigitalAsset[]>([]);
  const [selectedInfringer, setSelectedInfringer] = useState<InfringerProfile | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 檢查後端狀態
      const isOnline = await checkBackendStatus();
      setBackendStatus(isOnline ? 'online' : 'offline');

      // 使用異步方法獲取資料（會自動嘗試從後端獲取）
      const [tasksData, violationsData, assetsData] = await Promise.all([
        imageGuardianService.scan.getTasksAsync(),
        imageGuardianService.violations.getAllAsync(),
        imageGuardianService.assets.getAllAsync()
      ]);

      const infringersData = imageGuardianService.infringers.getAllProfiles();

      setScanTasks(tasksData);
      setViolations(violationsData);
      setInfringers(infringersData);
      setAssets(assetsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      setBackendStatus('offline');
      // 降級到本地資料
      setScanTasks(imageGuardianService.scan.getTasks());
      setViolations(imageGuardianService.violations.getAll());
      setInfringers(imageGuardianService.infringers.getAllProfiles());
      setAssets(imageGuardianService.assets.getAll());
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartScan = async (task: ScanTask) => {
    try {
      setScanTasks(prev => [task, ...prev]);
      setActiveTab('dashboard');

      // 初始化進度狀態
      setScanProgress({
        taskId: task.id,
        progress: 0,
        message: '🚀 準備開始掃描...',
        scanned: 0,
        violations: 0,
        isActive: true
      });

      // 啟動掃描並監聽進度
      await imageGuardianService.scan.startScan(
        task.id,
        (progress, message, scanned, violations) => {
          setScanProgress({
            taskId: task.id,
            progress,
            message,
            scanned,
            violations,
            isActive: progress < 100
          });
        }
      );

      // 掃描完成後重新載入資料
      await loadData();

      // 3秒後關閉進度面板
      setTimeout(() => {
        setScanProgress(null);
      }, 3000);

    } catch (error) {
      console.error('Failed to start scan:', error);
      setScanProgress(prev => prev ? { ...prev, message: '❌ 掃描失敗', isActive: false } : null);
    }
  };

  // 查看特定任務的侵權結果
  const handleViewTaskViolations = (taskId: string) => {
    setSelectedTaskId(taskId);
    setActiveTab('violations');
  };

  // 獲取篩選後的侵權記錄
  const filteredViolations = selectedTaskId
    ? violations.filter(v => v.taskId === selectedTaskId)
    : violations;

  const handleCreateCase = async (violationIds: string[]) => {
    // 這裡會導航到 WarRoom 創建案件
    console.log('Creating case for violations:', violationIds);
  };

  const stats = {
    totalScans: scanTasks.length,
    runningScans: scanTasks.filter(t => t.status === 'running').length,
    totalViolations: violations.length,
    pendingViolations: violations.filter(v => !v.caseId).length, // 未建立案件的侵權
    topInfringers: infringers.slice(0, 5)
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">全網巡邏獵人</h1>
            <p className="text-sm text-gray-500">自動掃描電商平台，偵測盜圖行為</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* 後端連接狀態 */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
            backendStatus === 'checking' ? 'bg-gray-100 text-gray-600' :
            backendStatus === 'online' ? 'bg-green-100 text-green-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {backendStatus === 'checking' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>連接中...</span>
              </>
            ) : backendStatus === 'online' ? (
              <>
                <Server className="w-4 h-4" />
                <span>後端已連接</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>本地模式</span>
              </>
            )}
          </div>
          <button
            onClick={loadData}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            title="重新整理"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Play className="w-5 h-5" />
            新增掃描
          </button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-500">總掃描次數</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalScans}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">進行中</p>
            {(stats.runningScans > 0 || scanProgress?.isActive) && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>
          <p className="text-2xl font-bold text-green-600">
            {scanProgress?.isActive ? 1 : stats.runningScans}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-500">偵測侵權</p>
          <p className="text-2xl font-bold text-red-600">{stats.totalViolations}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-500">待處理</p>
          <p className="text-2xl font-bold text-orange-600">{stats.pendingViolations}</p>
        </div>
      </div>

      {/* 即時掃描進度面板 */}
      {scanProgress && (
        <div className={`rounded-xl shadow-lg overflow-hidden ${
          scanProgress.isActive ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gradient-to-r from-green-500 to-emerald-500'
        }`}>
          <div className="p-4 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {scanProgress.isActive ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <CheckCircle className="w-6 h-6" />
                )}
                <span className="font-semibold text-lg">
                  {scanProgress.isActive ? '掃描進行中' : '掃描完成'}
                </span>
              </div>
              <button
                onClick={() => setScanProgress(null)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 進度條 */}
            <div className="mb-3">
              <div className="h-3 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${scanProgress.progress}%` }}
                />
              </div>
            </div>

            {/* 狀態訊息 */}
            <div className="flex items-center justify-between">
              <p className="text-white/90">{scanProgress.message}</p>
              <p className="text-white font-bold">{scanProgress.progress}%</p>
            </div>

            {/* 掃描統計 */}
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/20">
              <div>
                <p className="text-white/70 text-sm">已掃描商品</p>
                <p className="text-2xl font-bold">{scanProgress.scanned.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-white/70 text-sm">發現侵權</p>
                <p className="text-2xl font-bold text-yellow-300">
                  {scanProgress.violations}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 標籤頁 */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b">
          <div className="flex px-4">
            {[
              { id: 'dashboard', label: '掃描概覽' },
              { id: 'scan', label: '設定掃描' },
              { id: 'violations', label: `侵權記錄 (${violations.length})` },
              { id: 'infringers', label: `盜圖者畫像 (${infringers.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 內容區 */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : activeTab === 'dashboard' ? (
            <div className="space-y-6">
              {/* 進行中的掃描 */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">掃描任務</h3>
                {scanTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>尚無掃描任務</p>
                    <button
                      onClick={() => setActiveTab('scan')}
                      className="mt-2 text-purple-600 hover:text-purple-700"
                    >
                      建立第一個掃描
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scanTasks.slice(0, 5).map(task => (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-colors ${
                          task.status === 'completed' && task.violationsFound > 0
                            ? 'hover:bg-purple-50 cursor-pointer'
                            : ''
                        }`}
                        onClick={() => {
                          if (task.status === 'completed' && task.violationsFound > 0) {
                            handleViewTaskViolations(task.id);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {task.status === 'running' ? (
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                          ) : task.status === 'completed' ? (
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <Clock className="w-4 h-4 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              掃描 {task.config.assetIds.length} 個資產
                            </p>
                            <p className="text-sm text-gray-500">
                              {task.config.platforms.map(p => PLATFORM_LABELS[p]).join(', ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {task.status === 'running' ? (
                                <span className="text-green-600">
                                  {task.progress}%
                                </span>
                              ) : task.status === 'completed' ? (
                                <span className={task.violationsFound > 0 ? 'text-red-600' : 'text-blue-600'}>
                                  發現 {task.violationsFound || 0} 項侵權
                                </span>
                              ) : (
                                <span className="text-gray-500">待執行</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDate(task.createdAt)}
                            </p>
                          </div>
                          {task.status === 'completed' && task.violationsFound > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewTaskViolations(task.id);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              查看
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 最近侵權 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">最近偵測侵權</h3>
                  <button
                    onClick={() => setActiveTab('violations')}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    查看全部
                  </button>
                </div>
                {violations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                    <p>目前沒有偵測到侵權</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {violations.slice(0, 4).map(violation => (
                      <ViolationCard
                        key={violation.id}
                        violation={violation}
                        onViewDetail={() => setSelectedViolation(violation)}
                        onCreateCase={() => handleCreateCase([violation.id])}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Top 盜圖者 */}
              {infringers.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Top 盜圖者</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.topInfringers.map((infringer, index) => (
                      <div
                        key={infringer.sellerId}
                        onClick={() => setSelectedInfringer(infringer)}
                        className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      >
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center font-bold text-red-600">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {infringer.sellerName || infringer.sellerId}
                          </p>
                          <p className="text-sm text-gray-500">
                            {PLATFORM_LABELS[infringer.platform]} • {infringer.stats.violatingListings} 項侵權
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          infringer.riskLevel === 'high' || infringer.riskLevel === 'critical' ? 'bg-red-100 text-red-700' :
                          infringer.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {infringer.riskLevel === 'high' || infringer.riskLevel === 'critical' ? '高風險' :
                           infringer.riskLevel === 'medium' ? '中風險' : '低風險'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'scan' ? (
            <ScanConfig
              onStartScan={handleStartScan}
              onClose={() => setActiveTab('dashboard')}
            />
          ) : activeTab === 'violations' ? (
            <div className="space-y-4">
              {/* 篩選狀態 */}
              {selectedTaskId && (
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-700">
                      正在顯示特定掃描任務的侵權結果
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedTaskId(null)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    顯示全部
                  </button>
                </div>
              )}

              {filteredViolations.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedTaskId ? '此掃描任務無侵權記錄' : '尚無侵權記錄'}
                  </h3>
                  <p className="text-gray-500">
                    {selectedTaskId ? '可能侵權記錄已被處理或掃描未發現侵權' : '掃描完成後，偵測到的侵權將顯示在此'}
                  </p>
                  {selectedTaskId && (
                    <button
                      onClick={() => setSelectedTaskId(null)}
                      className="mt-4 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      查看所有侵權記錄
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      共 {filteredViolations.length} 筆侵權記錄
                      {selectedTaskId && violations.length !== filteredViolations.length && (
                        <span className="text-gray-400"> (全部 {violations.length} 筆)</span>
                      )}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredViolations.map(violation => (
                      <ViolationCard
                        key={violation.id}
                        violation={violation}
                        onViewDetail={() => setSelectedViolation(violation)}
                        onCreateCase={() => handleCreateCase([violation.id])}
                        compact
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {infringers.map(infringer => (
                <div
                  key={infringer.sellerId}
                  onClick={() => setSelectedInfringer(infringer)}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-gray-900">
                      {infringer.sellerName || infringer.sellerId}
                    </p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      infringer.riskLevel === 'high' || infringer.riskLevel === 'critical' ? 'bg-red-100 text-red-700' :
                      infringer.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {infringer.riskLevel === 'high' || infringer.riskLevel === 'critical' ? '高風險' :
                       infringer.riskLevel === 'medium' ? '中風險' : '低風險'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-500">
                    <p>平台：{PLATFORM_LABELS[infringer.platform]}</p>
                    <p>侵權次數：{infringer.stats.violatingListings}</p>
                    <p>首次偵測：{formatDate(infringer.stats.firstDetectedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 盜圖者詳情模態框 */}
      {selectedInfringer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <InfringerProfileComponent
              infringer={selectedInfringer}
              onClose={() => setSelectedInfringer(null)}
              onCreateCase={(vios) => {
                handleCreateCase(vios.map(v => v.id));
                setSelectedInfringer(null);
              }}
            />
          </div>
        </div>
      )}

      {/* 侵權詳情模態框 */}
      {selectedViolation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">侵權詳情</h2>
              <button
                onClick={() => setSelectedViolation(null)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              {/* 圖片比對 */}
              <div className="flex gap-4 mb-6">
                {/* 原圖 */}
                <div className="flex-1">
                  <p className="text-sm text-green-700 font-medium mb-2">原始圖片</p>
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    {assets.find(a => a.id === selectedViolation.assetId) && (
                      <img
                        src={assets.find(a => a.id === selectedViolation.assetId)?.thumbnailUrl}
                        alt="原始圖片"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
                {/* 侵權圖 */}
                <div className="flex-1">
                  <p className="text-sm text-red-700 font-medium mb-2">疑似侵權</p>
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={selectedViolation.listing.thumbnailUrl}
                      alt="侵權圖片"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* 相似度分數 */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">整體相似度</span>
                  <span className={`text-xl font-bold ${
                    selectedViolation.similarity.level === 'exact' ? 'text-red-600' :
                    selectedViolation.similarity.level === 'high' ? 'text-orange-600' :
                    selectedViolation.similarity.level === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {selectedViolation.similarity.overall.toFixed(1)}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">pHash</p>
                    <p className="font-semibold">{selectedViolation.similarity.pHashScore.toFixed(1)}%</p>
                  </div>
                  {selectedViolation.similarity.orbScore !== undefined && (
                    <div>
                      <p className="text-gray-500">ORB 特徵</p>
                      <p className="font-semibold">{selectedViolation.similarity.orbScore.toFixed(1)}%</p>
                    </div>
                  )}
                  {selectedViolation.similarity.colorScore !== undefined && (
                    <div>
                      <p className="text-gray-500">顏色</p>
                      <p className="font-semibold">{selectedViolation.similarity.colorScore.toFixed(1)}%</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 商品資訊 */}
              <div className="space-y-3 mb-4">
                <h3 className="font-semibold text-gray-900">商品資訊</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">商品名稱：</span>{selectedViolation.listing.title}</p>
                  <p><span className="text-gray-500">售價：</span>NT$ {selectedViolation.listing.price.toLocaleString()}</p>
                  <p><span className="text-gray-500">平台：</span>{PLATFORM_LABELS[selectedViolation.platform]}</p>
                  <p><span className="text-gray-500">賣家：</span>{selectedViolation.listing.sellerName || selectedViolation.listing.sellerId}</p>
                  {selectedViolation.listing.salesCount !== undefined && (
                    <p><span className="text-gray-500">已售：</span>{selectedViolation.listing.salesCount}</p>
                  )}
                </div>
              </div>

              {/* 操作按鈕 */}
              <div className="flex gap-3">
                <a
                  href={selectedViolation.listing.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center"
                >
                  前往商品頁面
                </a>
                <button
                  onClick={() => {
                    handleCreateCase([selectedViolation.id]);
                    setSelectedViolation(null);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  建立維權案件
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
