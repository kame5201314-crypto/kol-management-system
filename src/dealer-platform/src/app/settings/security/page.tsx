'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield, Key, Smartphone, Clock, Save, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function SecuritySettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
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
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">安全設定</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* 密碼變更 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="w-5 h-5 mr-2" />
                變更密碼
              </CardTitle>
              <CardDescription>定期更換密碼以確保帳號安全</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  目前密碼
                </label>
                <Input type="password" placeholder="請輸入目前密碼" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  新密碼
                </label>
                <Input type="password" placeholder="請輸入新密碼" />
                <p className="mt-1 text-sm text-gray-500">
                  密碼須至少 8 個字元，包含大小寫字母與數字
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  確認新密碼
                </label>
                <Input type="password" placeholder="請再次輸入新密碼" />
              </div>
              <Button variant="outline">更新密碼</Button>
            </CardContent>
          </Card>

          {/* 雙因素驗證 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="w-5 h-5 mr-2" />
                雙因素驗證 (2FA)
              </CardTitle>
              <CardDescription>為您的帳號增加額外的安全保護</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    狀態：
                    {twoFactorEnabled ? (
                      <Badge variant="success" className="ml-2">已啟用</Badge>
                    ) : (
                      <Badge variant="secondary" className="ml-2">未啟用</Badge>
                    )}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {twoFactorEnabled
                      ? '您的帳號受到雙因素驗證保護'
                      : '啟用雙因素驗證以提升帳號安全性'}
                  </p>
                </div>
                <Button
                  variant={twoFactorEnabled ? 'outline' : 'default'}
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                >
                  {twoFactorEnabled ? '停用' : '啟用'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Session 管理 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                登入裝置管理
              </CardTitle>
              <CardDescription>管理您目前登入的裝置</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="font-medium text-green-700">目前裝置</p>
                    <p className="text-sm text-green-600">Windows - Chrome</p>
                    <p className="text-xs text-green-500">台北市 - 最後活動: 剛才</p>
                  </div>
                  <Badge variant="success">活躍中</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div>
                    <p className="font-medium">iPhone</p>
                    <p className="text-sm text-gray-500">iOS - Safari</p>
                    <p className="text-xs text-gray-400">台北市 - 最後活動: 2 天前</p>
                  </div>
                  <Button variant="outline" size="sm">登出</Button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="text-red-600 hover:text-red-700">
                  登出所有其他裝置
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 安全提示 */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-700">安全提示</p>
                  <ul className="mt-2 text-sm text-yellow-600 space-y-1">
                    <li>• 請勿與他人分享您的帳號密碼</li>
                    <li>• 定期更換密碼 (建議每 90 天)</li>
                    <li>• 啟用雙因素驗證以增強安全性</li>
                    <li>• 在公共電腦使用後請記得登出</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
