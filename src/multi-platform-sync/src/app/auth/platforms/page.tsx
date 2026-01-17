'use client'

import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Link2,
  Settings,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react'
import { PLATFORMS, SYNC_INTERVALS } from '@/config/constants'
import { formatDateTime } from '@/lib/utils'

interface PlatformConnection {
  id: string
  platform: keyof typeof PLATFORMS
  shopId: string
  shopName: string
  isConnected: boolean
  lastSyncAt: string | null
  syncSettings: {
    autoSync: boolean
    syncIntervalMinutes: number
    syncInventory: boolean
    syncOrders: boolean
    syncPrices: boolean
  }
}

// Mock data
const initialConnections: PlatformConnection[] = [
  {
    id: '1',
    platform: 'shopee',
    shopId: 'shop_123456',
    shopName: '我的蝦皮商店',
    isConnected: true,
    lastSyncAt: '2026-01-17T10:30:00Z',
    syncSettings: {
      autoSync: true,
      syncIntervalMinutes: 15,
      syncInventory: true,
      syncOrders: true,
      syncPrices: true,
    },
  },
  {
    id: '2',
    platform: 'momo',
    shopId: 'momo_789',
    shopName: 'momo 供應商帳號',
    isConnected: true,
    lastSyncAt: '2026-01-17T10:25:00Z',
    syncSettings: {
      autoSync: true,
      syncIntervalMinutes: 30,
      syncInventory: true,
      syncOrders: true,
      syncPrices: false,
    },
  },
  {
    id: '3',
    platform: 'shopline',
    shopId: '',
    shopName: '',
    isConnected: false,
    lastSyncAt: null,
    syncSettings: {
      autoSync: false,
      syncIntervalMinutes: 60,
      syncInventory: true,
      syncOrders: true,
      syncPrices: true,
    },
  },
]

export default function PlatformsPage() {
  const [connections, setConnections] = useState<PlatformConnection[]>(initialConnections)
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformConnection | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isConnectOpen, setIsConnectOpen] = useState(false)
  const [connectingPlatform, setConnectingPlatform] = useState<keyof typeof PLATFORMS | null>(null)

  const handleConnect = (platform: keyof typeof PLATFORMS) => {
    setConnectingPlatform(platform)
    setIsConnectOpen(true)
  }

  const handleDisconnect = (connectionId: string) => {
    if (confirm('確定要斷開此平台連接嗎？')) {
      setConnections(
        connections.map((c) =>
          c.id === connectionId
            ? { ...c, isConnected: false, shopId: '', shopName: '' }
            : c
        )
      )
    }
  }

  const handleSync = async (connectionId: string) => {
    // Update sync status
    setConnections(prev =>
      prev.map(c =>
        c.id === connectionId
          ? { ...c, lastSyncAt: new Date().toISOString() }
          : c
      )
    )
    // TODO: In production, trigger actual sync job via server action
  }

  const handleSaveSettings = () => {
    if (selectedPlatform) {
      setConnections(
        connections.map((c) =>
          c.id === selectedPlatform.id ? selectedPlatform : c
        )
      )
      setIsSettingsOpen(false)
    }
  }

  const handleConnectSubmit = (formData: FormData) => {
    const shopId = formData.get('shopId') as string
    const shopName = formData.get('shopName') as string

    if (connectingPlatform) {
      const existingConnection = connections.find((c) => c.platform === connectingPlatform)
      if (existingConnection) {
        setConnections(
          connections.map((c) =>
            c.platform === connectingPlatform
              ? { ...c, isConnected: true, shopId, shopName }
              : c
          )
        )
      } else {
        setConnections([
          ...connections,
          {
            id: crypto.randomUUID(),
            platform: connectingPlatform,
            shopId,
            shopName,
            isConnected: true,
            lastSyncAt: null,
            syncSettings: {
              autoSync: true,
              syncIntervalMinutes: 15,
              syncInventory: true,
              syncOrders: true,
              syncPrices: true,
            },
          },
        ])
      }
    }
    setIsConnectOpen(false)
    setConnectingPlatform(null)
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="平台連接"
        description="管理您的電商平台連接設定"
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Connected Platforms */}
        <div>
          <h2 className="text-lg font-semibold mb-4">已連接的平台</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {connections
              .filter((c) => c.isConnected)
              .map((connection) => {
                const platform = PLATFORMS[connection.platform]
                return (
                  <Card key={connection.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: platform.color }}
                          >
                            <Link2 className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{platform.displayName}</CardTitle>
                            <CardDescription>{connection.shopName}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="success">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          已連接
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">自動同步</span>
                          <Badge variant={connection.syncSettings.autoSync ? 'default' : 'secondary'}>
                            {connection.syncSettings.autoSync ? '開啟' : '關閉'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">最後同步</span>
                          <span>
                            {connection.lastSyncAt
                              ? formatDateTime(connection.lastSyncAt)
                              : '從未同步'}
                          </span>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleSync(connection.id)}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            同步
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPlatform(connection)
                              setIsSettingsOpen(true)
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </div>

        {/* Available Platforms */}
        <div>
          <h2 className="text-lg font-semibold mb-4">可連接的平台</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(PLATFORMS)
              .filter(([key]) => !connections.find((c) => c.platform === key && c.isConnected))
              .map(([key, platform]) => (
                <Card key={key} className="border-dashed">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center opacity-50"
                          style={{ backgroundColor: platform.color }}
                        >
                          <Link2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{platform.displayName}</CardTitle>
                          <CardDescription>尚未連接</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline">
                        <XCircle className="mr-1 h-3 w-3" />
                        未連接
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        連接 {platform.displayName} 以同步商品和訂單
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleConnect(key as keyof typeof PLATFORMS)}
                        >
                          <Link2 className="mr-2 h-4 w-4" />
                          連接平台
                        </Button>
                        {platform.apiDocs && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={platform.apiDocs} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedPlatform && PLATFORMS[selectedPlatform.platform].displayName} 設定
            </DialogTitle>
            <DialogDescription>
              調整同步設定
            </DialogDescription>
          </DialogHeader>
          {selectedPlatform && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>自動同步</Label>
                  <p className="text-sm text-muted-foreground">定時自動同步商品和訂單</p>
                </div>
                <Switch
                  checked={selectedPlatform.syncSettings.autoSync}
                  onCheckedChange={(checked) =>
                    setSelectedPlatform({
                      ...selectedPlatform,
                      syncSettings: { ...selectedPlatform.syncSettings, autoSync: checked },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>同步間隔</Label>
                <Select
                  value={String(selectedPlatform.syncSettings.syncIntervalMinutes)}
                  onValueChange={(value) =>
                    setSelectedPlatform({
                      ...selectedPlatform,
                      syncSettings: { ...selectedPlatform.syncSettings, syncIntervalMinutes: parseInt(value) },
                    })
                  }
                  disabled={!selectedPlatform.syncSettings.autoSync}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SYNC_INTERVALS.map((interval) => (
                      <SelectItem key={interval.value} value={String(interval.value)}>
                        {interval.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>同步項目</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">同步庫存</span>
                    <Switch
                      checked={selectedPlatform.syncSettings.syncInventory}
                      onCheckedChange={(checked) =>
                        setSelectedPlatform({
                          ...selectedPlatform,
                          syncSettings: { ...selectedPlatform.syncSettings, syncInventory: checked },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">同步訂單</span>
                    <Switch
                      checked={selectedPlatform.syncSettings.syncOrders}
                      onCheckedChange={(checked) =>
                        setSelectedPlatform({
                          ...selectedPlatform,
                          syncSettings: { ...selectedPlatform.syncSettings, syncOrders: checked },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">同步價格</span>
                    <Switch
                      checked={selectedPlatform.syncSettings.syncPrices}
                      onCheckedChange={(checked) =>
                        setSelectedPlatform({
                          ...selectedPlatform,
                          syncSettings: { ...selectedPlatform.syncSettings, syncPrices: checked },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    handleDisconnect(selectedPlatform.id)
                    setIsSettingsOpen(false)
                  }}
                >
                  斷開連接
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveSettings}>儲存設定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Connect Dialog */}
      <Dialog open={isConnectOpen} onOpenChange={setIsConnectOpen}>
        <DialogContent>
          <form action={handleConnectSubmit}>
            <DialogHeader>
              <DialogTitle>
                連接 {connectingPlatform && PLATFORMS[connectingPlatform].displayName}
              </DialogTitle>
              <DialogDescription>
                輸入您的商店資訊以連接平台
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="shopId">商店 ID</Label>
                <Input id="shopId" name="shopId" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopName">商店名稱</Label>
                <Input id="shopName" name="shopName" required />
              </div>
              <p className="text-sm text-muted-foreground">
                注意：實際連接需要通過平台的 OAuth 授權流程
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsConnectOpen(false)}>
                取消
              </Button>
              <Button type="submit">連接平台</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
