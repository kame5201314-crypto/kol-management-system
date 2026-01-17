'use client'

import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  User,
  Building,
  Bell,
  RefreshCw,
  Shield,
  CreditCard,
  Save,
} from 'lucide-react'
import { SYNC_INTERVALS } from '@/config/constants'

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false)

  // Profile settings
  const [profile, setProfile] = useState({
    name: '使用者',
    email: 'user@example.com',
    phone: '0912-345-678',
  })

  // Organization settings
  const [organization, setOrganization] = useState({
    name: '我的商店',
    address: '台北市信義區信義路五段7號',
    taxId: '12345678',
  })

  // Notification settings
  const [notifications, setNotifications] = useState({
    orderEmail: true,
    orderPush: true,
    lowStockEmail: true,
    lowStockPush: false,
    syncFailEmail: true,
    syncFailPush: true,
  })

  // Sync settings
  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncInterval: 15,
    syncOnOrderCreate: true,
    syncOnStockChange: true,
  })

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="設定"
        description="管理您的帳戶和系統設定"
      />

      <div className="flex-1 p-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              個人資料
            </TabsTrigger>
            <TabsTrigger value="organization">
              <Building className="mr-2 h-4 w-4" />
              商店資訊
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              通知設定
            </TabsTrigger>
            <TabsTrigger value="sync">
              <RefreshCw className="mr-2 h-4 w-4" />
              同步設定
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="mr-2 h-4 w-4" />
              安全性
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard className="mr-2 h-4 w-4" />
              訂閱方案
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>個人資料</CardTitle>
                <CardDescription>管理您的帳戶資訊</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">電子郵件</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">電話</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? '儲存中...' : '儲存變更'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organization Tab */}
          <TabsContent value="organization">
            <Card>
              <CardHeader>
                <CardTitle>商店資訊</CardTitle>
                <CardDescription>設定您的商店基本資料</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">商店名稱</Label>
                    <Input
                      id="orgName"
                      value={organization.name}
                      onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">統一編號</Label>
                    <Input
                      id="taxId"
                      value={organization.taxId}
                      onChange={(e) => setOrganization({ ...organization, taxId: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="address">地址</Label>
                    <Input
                      id="address"
                      value={organization.address}
                      onChange={(e) => setOrganization({ ...organization, address: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? '儲存中...' : '儲存變更'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>通知設定</CardTitle>
                <CardDescription>設定您希望收到的通知類型</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-4">新訂單通知</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>電子郵件通知</Label>
                        <p className="text-sm text-muted-foreground">收到新訂單時發送郵件</p>
                      </div>
                      <Switch
                        checked={notifications.orderEmail}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, orderEmail: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>推播通知</Label>
                        <p className="text-sm text-muted-foreground">收到新訂單時推播通知</p>
                      </div>
                      <Switch
                        checked={notifications.orderPush}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, orderPush: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-4">庫存預警</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>電子郵件通知</Label>
                        <p className="text-sm text-muted-foreground">庫存低於安全水位時發送郵件</p>
                      </div>
                      <Switch
                        checked={notifications.lowStockEmail}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, lowStockEmail: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>推播通知</Label>
                        <p className="text-sm text-muted-foreground">庫存低於安全水位時推播通知</p>
                      </div>
                      <Switch
                        checked={notifications.lowStockPush}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, lowStockPush: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-4">同步失敗通知</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>電子郵件通知</Label>
                        <p className="text-sm text-muted-foreground">同步失敗時發送郵件</p>
                      </div>
                      <Switch
                        checked={notifications.syncFailEmail}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, syncFailEmail: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>推播通知</Label>
                        <p className="text-sm text-muted-foreground">同步失敗時推播通知</p>
                      </div>
                      <Switch
                        checked={notifications.syncFailPush}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, syncFailPush: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? '儲存中...' : '儲存變更'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sync Tab */}
          <TabsContent value="sync">
            <Card>
              <CardHeader>
                <CardTitle>同步設定</CardTitle>
                <CardDescription>設定商品和訂單的同步行為</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>自動同步</Label>
                    <p className="text-sm text-muted-foreground">定期自動同步所有平台</p>
                  </div>
                  <Switch
                    checked={syncSettings.autoSync}
                    onCheckedChange={(checked) =>
                      setSyncSettings({ ...syncSettings, autoSync: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>同步間隔</Label>
                  <Select
                    value={String(syncSettings.syncInterval)}
                    onValueChange={(value) =>
                      setSyncSettings({ ...syncSettings, syncInterval: parseInt(value) })
                    }
                    disabled={!syncSettings.autoSync}
                  >
                    <SelectTrigger className="w-48">
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

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>訂單建立時同步</Label>
                    <p className="text-sm text-muted-foreground">新訂單建立時立即扣減庫存</p>
                  </div>
                  <Switch
                    checked={syncSettings.syncOnOrderCreate}
                    onCheckedChange={(checked) =>
                      setSyncSettings({ ...syncSettings, syncOnOrderCreate: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>庫存變動時同步</Label>
                    <p className="text-sm text-muted-foreground">庫存調整時立即同步到所有平台</p>
                  </div>
                  <Switch
                    checked={syncSettings.syncOnStockChange}
                    onCheckedChange={(checked) =>
                      setSyncSettings({ ...syncSettings, syncOnStockChange: checked })
                    }
                  />
                </div>

                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? '儲存中...' : '儲存變更'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>安全性</CardTitle>
                <CardDescription>管理您的帳戶安全設定</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>變更密碼</Label>
                    <p className="text-sm text-muted-foreground mb-2">定期更換密碼以保護您的帳戶</p>
                    <Button variant="outline">變更密碼</Button>
                  </div>

                  <Separator />

                  <div>
                    <Label>雙重驗證</Label>
                    <p className="text-sm text-muted-foreground mb-2">啟用雙重驗證以增加帳戶安全性</p>
                    <Button variant="outline">設定雙重驗證</Button>
                  </div>

                  <Separator />

                  <div>
                    <Label>登入紀錄</Label>
                    <p className="text-sm text-muted-foreground mb-2">查看最近的登入活動</p>
                    <Button variant="outline">查看紀錄</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>訂閱方案</CardTitle>
                <CardDescription>管理您的訂閱和付款資訊</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">專業版</h4>
                      <p className="text-sm text-muted-foreground">無限平台、無限商品、即時同步</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">$999</p>
                      <p className="text-sm text-muted-foreground">/月</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline">變更方案</Button>
                  <Button variant="outline">更新付款方式</Button>
                  <Button variant="outline">查看帳單紀錄</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
