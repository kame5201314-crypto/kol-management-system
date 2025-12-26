import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface PlatformLayoutProps {
  children: React.ReactNode;
}

export default function PlatformLayout({ children }: PlatformLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mock user data - 之後可以從 Context 或 props 取得
  const user = {
    name: '王小明',
    email: 'xiaoming@example.com'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72">
        {/* Header */}
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          user={user}
        />

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
