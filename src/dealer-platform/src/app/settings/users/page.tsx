'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Users, Mail, Shield, MoreHorizontal, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// 模擬使用者資料
const mockUsers = [
  { id: '1', name: '管理員', email: 'admin@company.com', role: 'admin', status: 'active', lastLogin: '2026-01-18' },
  { id: '2', name: '王小明', email: 'ming@company.com', role: 'manager', status: 'active', lastLogin: '2026-01-17' },
  { id: '3', name: '李小華', email: 'hua@company.com', role: 'user', status: 'active', lastLogin: '2026-01-15' },
  { id: '4', name: '張三', email: 'zhang@company.com', role: 'user', status: 'inactive', lastLogin: '2025-12-20' },
]

const roleLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' }> = {
  admin: { label: '管理員', variant: 'default' },
  manager: { label: '經理', variant: 'success' },
  user: { label: '使用者', variant: 'secondary' },
}

export default function UsersSettingsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredUsers = mockUsers.filter(user =>
    user.name.includes(searchQuery) || user.email.includes(searchQuery)
  )

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
                <Users className="w-4 h-4 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">使用者管理</h1>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新增使用者
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜尋列 */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜尋使用者名稱或 Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">總使用者</p>
                  <p className="text-2xl font-bold">{mockUsers.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">活躍使用者</p>
                  <p className="text-2xl font-bold">{mockUsers.filter(u => u.status === 'active').length}</p>
                </div>
                <Shield className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">管理員</p>
                  <p className="text-2xl font-bold">{mockUsers.filter(u => u.role === 'admin').length}</p>
                </div>
                <Shield className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 使用者列表 */}
        <Card>
          <CardHeader>
            <CardTitle>使用者列表</CardTitle>
            <CardDescription>管理系統使用者與權限</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>使用者</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>最後登入</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleLabels[user.role]?.variant || 'secondary'}>
                        {roleLabels[user.role]?.label || user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
                        {user.status === 'active' ? '活躍' : '停用'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">{user.lastLogin}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
