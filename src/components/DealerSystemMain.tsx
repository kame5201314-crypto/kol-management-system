import React, { useState, useEffect } from 'react';
import { Home, Users, Package, Search, FileText, DollarSign } from 'lucide-react';
import DealerManagementSystem from '../dealer_management_system';
import PriceInquiry from './PriceInquiry';
import QuotationManagement from './QuotationManagement';
import { Dealer, Product, PriceRule, Quotation, QuotationItem } from '../types/dealer';
import { mockProducts, mockPriceRules } from '../data/productData';

const DealerSystemMain = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [products] = useState<Product[]>(mockProducts);
  const [priceRules] = useState<PriceRule[]>(mockPriceRules);
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  // 從 localStorage 載入經銷商資料
  useEffect(() => {
    const getInitialDealers = () => {
      const saved = localStorage.getItem('dealers');
      if (saved) {
        try {
          const dealersData = JSON.parse(saved);
          // 確保每個經銷商都有 dealerLevel
          return dealersData.map((d: Dealer) => ({
            ...d,
            dealerLevel: d.dealerLevel || 'C'
          }));
        } catch (e) {
          console.error('Failed to parse saved dealers:', e);
        }
      }
      return [
        {
          id: 1,
          name: '台北經銷商',
          contact: '王小明',
          phone: '02-1234-5678',
          email: 'taipei@example.com',
          address: '台北市信義區信義路100號',
          salesAmount: 850000,
          orderAmount: 320000,
          paymentDate: '2025-10-15',
          creditLimit: 1000000,
          commissionRate: 15,
          dealerLevel: 'VIP'
        },
        {
          id: 2,
          name: '高雄經銷商',
          contact: '林美華',
          phone: '07-8765-4321',
          email: 'kaohsiung@example.com',
          address: '高雄市前鎮區中山路200號',
          salesAmount: 650000,
          orderAmount: 180000,
          paymentDate: '2025-10-20',
          creditLimit: 800000,
          commissionRate: 12,
          dealerLevel: 'A'
        }
      ];
    };
    setDealers(getInitialDealers());
  }, []);

  // 從 localStorage 載入報價單資料
  useEffect(() => {
    const saved = localStorage.getItem('quotations');
    if (saved) {
      try {
        setQuotations(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved quotations:', e);
      }
    }
  }, []);

  // 儲存報價單到 localStorage
  useEffect(() => {
    if (quotations.length > 0) {
      localStorage.setItem('quotations', JSON.stringify(quotations));
    }
  }, [quotations]);

  // 監聽經銷商資料變化
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('dealers');
      if (saved) {
        try {
          const dealersData = JSON.parse(saved);
          setDealers(dealersData.map((d: Dealer) => ({
            ...d,
            dealerLevel: d.dealerLevel || 'C'
          })));
        } catch (e) {
          console.error('Failed to parse dealers:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // 定期檢查 localStorage 變化
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // 生成報價單號
  const generateQuotationNo = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const seq = String(quotations.length + 1).padStart(4, '0');
    return `Q${year}${month}${day}-${seq}`;
  };

  // 從查價工具建立報價單
  const handleCreateQuotationFromInquiry = (items: QuotationItem[]) => {
    if (items.length === 0) {
      alert('請至少選擇一個產品');
      return;
    }

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const discountAmount = 0;
    const taxAmount = Math.round((subtotal - discountAmount) * 0.05);
    const totalAmount = subtotal - discountAmount + taxAmount;

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    const newQuotation: Quotation = {
      id: quotations.length + 1,
      quotationNo: generateQuotationNo(),
      dealerId: 0,
      dealerName: '待選擇經銷商',
      items: items.map((item, index) => ({
        ...item,
        id: index + 1
      })),
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      status: 'draft',
      validUntil: validUntil.toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setQuotations([...quotations, newQuotation]);
    setCurrentPage('quotations');
    alert('報價單已建立！請選擇經銷商並完成報價單資訊。');
  };

  // 刪除報價單
  const handleDeleteQuotation = (id: number) => {
    setQuotations(quotations.filter(q => q.id !== id));
  };

  // 更新報價單狀態
  const handleUpdateQuotationStatus = (id: number, status: Quotation['status']) => {
    setQuotations(quotations.map(q =>
      q.id === id ? { ...q, status } : q
    ));
  };

  // 導航菜單
  const navItems = [
    { id: 'dashboard', label: '儀表板', icon: Home },
    { id: 'dealers', label: '經銷商管理', icon: Users },
    { id: 'inquiry', label: '查價工具', icon: Search },
    { id: 'quotations', label: '報價單管理', icon: FileText },
  ];

  // 統計資料
  const stats = {
    dealers: dealers.length,
    products: products.length,
    quotations: quotations.length,
    totalQuotationAmount: quotations
      .filter(q => q.status === 'confirmed')
      .reduce((sum, q) => sum + q.totalAmount, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <DollarSign className="text-blue-600" size={32} />
              <h1 className="text-xl font-bold text-gray-800">經銷商管理系統</h1>
            </div>

            <div className="flex gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      currentPage === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容區 */}
      <div>
        {currentPage === 'dashboard' && (
          <div className="max-w-7xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">系統儀表板</h2>

            {/* 統計卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Users size={32} />
                  <span className="text-lg">經銷商</span>
                </div>
                <p className="text-4xl font-bold">{stats.dealers}</p>
                <p className="text-blue-100 text-sm mt-1">家經銷商</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Package size={32} />
                  <span className="text-lg">產品</span>
                </div>
                <p className="text-4xl font-bold">{stats.products}</p>
                <p className="text-green-100 text-sm mt-1">項產品</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <FileText size={32} />
                  <span className="text-lg">報價單</span>
                </div>
                <p className="text-4xl font-bold">{stats.quotations}</p>
                <p className="text-purple-100 text-sm mt-1">筆報價單</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign size={32} />
                  <span className="text-lg">確認金額</span>
                </div>
                <p className="text-3xl font-bold">
                  NT$ {(stats.totalQuotationAmount / 10000).toFixed(0)}萬
                </p>
                <p className="text-orange-100 text-sm mt-1">已確認報價</p>
              </div>
            </div>

            {/* 快速操作 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">快速操作</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setCurrentPage('inquiry')}
                  className="p-6 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                >
                  <Search className="text-blue-600 mb-3" size={32} />
                  <h4 className="font-semibold text-gray-800 mb-1">快速查價</h4>
                  <p className="text-sm text-gray-600">查詢產品價格並建立報價單</p>
                </button>

                <button
                  onClick={() => setCurrentPage('quotations')}
                  className="p-6 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-left"
                >
                  <FileText className="text-green-600 mb-3" size={32} />
                  <h4 className="font-semibold text-gray-800 mb-1">管理報價單</h4>
                  <p className="text-sm text-gray-600">查看和管理所有報價單</p>
                </button>

                <button
                  onClick={() => setCurrentPage('dealers')}
                  className="p-6 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
                >
                  <Users className="text-purple-600 mb-3" size={32} />
                  <h4 className="font-semibold text-gray-800 mb-1">經銷商管理</h4>
                  <p className="text-sm text-gray-600">管理經銷商資料和信用額度</p>
                </button>
              </div>
            </div>

            {/* 最近報價單 */}
            {quotations.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">最近報價單</h3>
                <div className="space-y-3">
                  {quotations.slice(0, 5).map(q => (
                    <div key={q.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{q.quotationNo}</div>
                        <div className="text-sm text-gray-600">{q.dealerName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-blue-600">
                          NT$ {q.totalAmount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">{q.createdAt}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentPage === 'dealers' && <DealerManagementSystem />}

        {currentPage === 'inquiry' && (
          <PriceInquiry
            products={products}
            priceRules={priceRules}
            dealers={dealers}
            onAddToQuotation={handleCreateQuotationFromInquiry}
          />
        )}

        {currentPage === 'quotations' && (
          <QuotationManagement
            quotations={quotations}
            dealers={dealers}
            onCreateQuotation={() => setCurrentPage('inquiry')}
            onEditQuotation={(id) => {
              alert('編輯功能開發中...');
            }}
            onDeleteQuotation={handleDeleteQuotation}
            onUpdateStatus={handleUpdateQuotationStatus}
          />
        )}
      </div>
    </div>
  );
};

export default DealerSystemMain;
