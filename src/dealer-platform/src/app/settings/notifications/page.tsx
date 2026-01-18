'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bell, Mail, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface NotificationSetting {
  id: string
  title: string
  description: string
  email: boolean
  push: boolean
}

const defaultSettings: NotificationSetting[] = [
  {
    id: 'new_order',
    title: '新採購單',
    description: '當有新的採購單建立時通知',
    email: true,
    push: true,
  },
  {
    id: 'order_approved',
    title: '採購單核准',
    description: '當採購單被核准時通知',
    email: true,
    push: true,
  },
  {
    id: 'delivery_update',
    title: '交貨狀態更新',
    description: '當交貨狀態有變更時通知',
    email: true,
    push: false,
  },
  {
    id: 'quotation_response',
    title: '報價單回覆',
    description: '當客戶回覆報價單時通知',
    email: true,
    push: true,
  },
  {
    id: 'low_stock',
    title: '庫存不足警示',
    description: '當產品庫存低於安全水位時通知',
    email: false,
    push: true,
  },
  {
    id: 'supplier_grade',
    title: '供應商評等變更',
    description: '當供應商評等有變動時通知',
    email: true,
    push: false,
  },
]

export default function NotificationsSettingsPage() {
  const [settings, setSettings] = useState(defaultSettings)
  const [isSaving, setIsSaving] = useState(false)

  const toggleSetting = (id: string, type: 'email' | 'push') => {
    setSettings(prev =>
      prev.map(s =>
        s.id === id ? { ...s, [type]: !s[type] } : s
      )
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    // TODO: Implement save logic
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <Link href="/settings" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">通知設定</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>通知偏好</CardTitle>
            <CardDescription>
              選擇您想要接收通知的方式
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Header */}
            <div className="flex items-center justify-end space-x-8 pb-4 border-b mb-4">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </div>
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                <Bell className="w-4 h-4" />
                <span>推播</span>
              </div>
            </div>

            {/* Settings List */}
            <div className="space-y-4">
              {settings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{setting.title}</p>
                    <p className="text-sm text-gray-500">{setting.description}</p>
                  </div>
                  <div className="flex items-center space-x-8">
                    {/* Email Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleSetting(setting.id, 'email')}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        setting.email ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          setting.email ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    {/* Push Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleSetting(setting.id, 'push')}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        setting.push ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          setting.push ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                儲存中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                儲存設定
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  )
}
