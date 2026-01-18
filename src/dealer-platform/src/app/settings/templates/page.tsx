'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, Eye, Edit, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const templates = [
  {
    id: '1',
    name: '標準報價單',
    type: 'quotation',
    description: '適用於一般報價',
    isDefault: true,
    lastModified: '2026-01-15',
  },
  {
    id: '2',
    name: '詳細報價單',
    type: 'quotation',
    description: '包含產品規格詳細說明',
    isDefault: false,
    lastModified: '2026-01-10',
  },
  {
    id: '3',
    name: '標準採購單',
    type: 'purchase_order',
    description: '適用於一般採購',
    isDefault: true,
    lastModified: '2026-01-12',
  },
  {
    id: '4',
    name: '緊急採購單',
    type: 'purchase_order',
    description: '加註緊急標記與優先處理說明',
    isDefault: false,
    lastModified: '2026-01-08',
  },
]

const typeLabels: Record<string, { label: string; color: string }> = {
  quotation: { label: '報價單', color: 'text-purple-500' },
  purchase_order: { label: '採購單', color: 'text-green-500' },
}

export default function TemplatesSettingsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (id: string) => {
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/settings" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">文件範本</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 報價單範本 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">報價單範本</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.filter(t => t.type === 'quotation').map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {template.name}
                        {template.isDefault && (
                          <Badge variant="secondary">預設</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                    <FileText className="w-5 h-5 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      最後修改: {template.lastModified}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(template.id)}
                      >
                        {copiedId === template.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 採購單範本 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">採購單範本</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.filter(t => t.type === 'purchase_order').map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {template.name}
                        {template.isDefault && (
                          <Badge variant="secondary">預設</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                    <FileText className="w-5 h-5 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      最後修改: {template.lastModified}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(template.id)}
                      >
                        {copiedId === template.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 說明 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-700">
              <strong>提示：</strong>範本設定將套用到所有新建立的文件。您可以在建立文件時選擇要使用的範本。
              預設範本會自動套用，除非您手動選擇其他範本。
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
