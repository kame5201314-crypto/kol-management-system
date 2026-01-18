'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Database, Download, Upload, Clock, HardDrive, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const backupHistory = [
  { id: '1', date: '2026-01-18 03:00', size: '125 MB', status: 'success' },
  { id: '2', date: '2026-01-17 03:00', size: '124 MB', status: 'success' },
  { id: '3', date: '2026-01-16 03:00', size: '123 MB', status: 'success' },
  { id: '4', date: '2026-01-15 03:00', size: '122 MB', status: 'success' },
]

export default function DataSettingsPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [exportType, setExportType] = useState<string | null>(null)

  const handleExport = async (type: string) => {
    setExportType(type)
    setIsExporting(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsExporting(false)
    setExportType(null)
  }

  const handleBackup = async () => {
    setIsBackingUp(true)
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsBackingUp(false)
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
              <Database className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">資料管理</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* 匯出資料 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="w-5 h-5 mr-2" />
                匯出資料
              </CardTitle>
              <CardDescription>將資料匯出為 Excel 或 CSV 格式</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">供應商資料</h4>
                  <p className="text-sm text-gray-500 mb-3">匯出所有供應商資料與評分記錄</p>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isExporting}
                    onClick={() => handleExport('suppliers')}
                  >
                    {isExporting && exportType === 'suppliers' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    匯出 Excel
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">採購單資料</h4>
                  <p className="text-sm text-gray-500 mb-3">匯出所有採購單與明細</p>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isExporting}
                    onClick={() => handleExport('orders')}
                  >
                    {isExporting && exportType === 'orders' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    匯出 Excel
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">報價單資料</h4>
                  <p className="text-sm text-gray-500 mb-3">匯出所有報價單與明細</p>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isExporting}
                    onClick={() => handleExport('quotations')}
                  >
                    {isExporting && exportType === 'quotations' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    匯出 Excel
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">產品資料</h4>
                  <p className="text-sm text-gray-500 mb-3">匯出所有產品目錄與價格</p>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isExporting}
                    onClick={() => handleExport('products')}
                  >
                    {isExporting && exportType === 'products' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    匯出 Excel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 匯入資料 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                匯入資料
              </CardTitle>
              <CardDescription>從 Excel 或 CSV 檔案匯入資料</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">拖放檔案至此處或</p>
                <Button variant="outline">選擇檔案</Button>
                <p className="text-sm text-gray-500 mt-2">支援 .xlsx, .xls, .csv 格式</p>
              </div>
            </CardContent>
          </Card>

          {/* 備份管理 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HardDrive className="w-5 h-5 mr-2" />
                備份管理
              </CardTitle>
              <CardDescription>自動備份排程與備份記錄</CardDescription>
            </CardHeader>
            <CardContent>
              {/* 備份設定 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                <div>
                  <p className="font-medium">自動備份</p>
                  <p className="text-sm text-gray-500">每日凌晨 3:00 自動備份</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="success">已啟用</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBackup}
                    disabled={isBackingUp}
                  >
                    {isBackingUp ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        備份中...
                      </>
                    ) : (
                      '立即備份'
                    )}
                  </Button>
                </div>
              </div>

              {/* 備份記錄 */}
              <h4 className="font-medium mb-3">備份記錄</h4>
              <div className="space-y-2">
                {backupHistory.map((backup) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">{backup.date}</p>
                        <p className="text-sm text-gray-500">{backup.size}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
