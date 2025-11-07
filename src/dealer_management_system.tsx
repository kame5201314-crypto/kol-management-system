import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, DollarSign, Package, Edit2, Trash2, FileText } from 'lucide-react';

const DealerManagementSystem = () => {
  // 從 localStorage 載入資料，如果沒有則使用預設資料
  const getInitialDealers = () => {
    const saved = localStorage.getItem('dealers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved dealers:', e);
      }
    }
    // 預設資料
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
        commissionRate: 15
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
        commissionRate: 12
      }
    ];
  };

  const [dealers, setDealers] = useState(getInitialDealers);

  // 當 dealers 改變時，自動儲存到 localStorage
  useEffect(() => {
    localStorage.setItem('dealers', JSON.stringify(dealers));
  }, [dealers]);

  const [currentView, setCurrentView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
    salesAmount: 0,
    orderAmount: 0,
    paymentDate: '',
    creditLimit: 0,
    commissionRate: 0
  });

  const filteredDealers = dealers.filter(dealer =>
    dealer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dealer.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDealer = () => {
    setFormData({
      name: '',
      contact: '',
      phone: '',
      email: '',
      address: '',
      salesAmount: 0,
      orderAmount: 0,
      paymentDate: '',
      creditLimit: 0,
      commissionRate: 0
    });
    setSelectedDealer(null);
    setShowForm(true);
  };

  const handleEditDealer = (dealer) => {
    setFormData(dealer);
    setSelectedDealer(dealer);
    setShowForm(true);
  };

  const handleDeleteDealer = (id) => {
    if (confirm('確定要刪除此經銷商嗎？')) {
      setDealers(dealers.filter(d => d.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedDealer) {
      setDealers(dealers.map(d => d.id === selectedDealer.id ? { ...formData, id: d.id } : d));
    } else {
      const newDealer = {
        ...formData,
        id: Math.max(...dealers.map(d => d.id), 0) + 1
      };
      setDealers([...dealers, newDealer]);
    }
    setShowForm(false);
  };

  const calculateCommission = (salesAmount, rate) => {
    return (salesAmount * rate / 100).toFixed(0);
  };

  const calculateRemainingCredit = (creditLimit, orderAmount) => {
    return creditLimit - orderAmount;
  };

  const getDaysUntilPayment = (paymentDate) => {
    const today = new Date();
    const payment = new Date(paymentDate);
    const diffTime = payment - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalSales = dealers.reduce((sum, d) => sum + d.salesAmount, 0);
  const totalOrders = dealers.reduce((sum, d) => sum + d.orderAmount, 0);

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {selectedDealer ? '編輯經銷商' : '新增經銷商'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">經銷商名稱</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">聯絡人</label>
                <input
                  type="text"
                  required
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">電話</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">銷售金額 (NT$)</label>
                <input
                  type="number"
                  required
                  value={formData.salesAmount}
                  onChange={(e) => setFormData({...formData, salesAmount: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">叫貨金額 (NT$)</label>
                <input
                  type="number"
                  required
                  value={formData.orderAmount}
                  onChange={(e) => setFormData({...formData, orderAmount: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">請款日期</label>
                <input
                  type="date"
                  required
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">信用額度 (NT$)</label>
                <input
                  type="number"
                  required
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({...formData, creditLimit: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">佣金比例 (%)</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({...formData, commissionRate: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                {selectedDealer ? '更新' : '新增'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">經銷商管理系統</h1>
            <button
              onClick={handleAddDealer}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              新增經銷商
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="text-blue-600" size={24} />
                <span className="text-gray-600">總銷售額</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">NT$ {totalSales.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Package className="text-green-600" size={24} />
                <span className="text-gray-600">總叫貨金額</span>
              </div>
              <p className="text-2xl font-bold text-green-600">NT$ {totalOrders.toLocaleString()}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="text-purple-600" size={24} />
                <span className="text-gray-600">經銷商數量</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{dealers.length} 家</p>
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="搜尋經銷商或聯絡人..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">經銷商</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">聯絡資訊</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">銷售金額</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">叫貨金額</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">佣金</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">請款日期</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">剩餘額度</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDealers.map((dealer) => {
                  const daysUntilPayment = getDaysUntilPayment(dealer.paymentDate);
                  const remainingCredit = calculateRemainingCredit(dealer.creditLimit, dealer.orderAmount);
                  const commission = calculateCommission(dealer.salesAmount, dealer.commissionRate);
                  
                  return (
                    <tr key={dealer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{dealer.name}</div>
                        <div className="text-sm text-gray-500">{dealer.address}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{dealer.contact}</div>
                        <div className="text-sm text-gray-500">{dealer.phone}</div>
                        <div className="text-sm text-gray-500">{dealer.email}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-medium text-gray-900">NT$ {dealer.salesAmount.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-medium text-gray-900">NT$ {dealer.orderAmount.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm text-green-600 font-medium">NT$ {parseInt(commission).toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{dealer.commissionRate}%</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm text-gray-900">{dealer.paymentDate}</div>
                        <div className={`text-xs font-medium ${daysUntilPayment < 0 ? 'text-red-600' : daysUntilPayment <= 7 ? 'text-orange-600' : 'text-gray-500'}`}>
                          {daysUntilPayment < 0 ? `逾期 ${Math.abs(daysUntilPayment)} 天` : `還有 ${daysUntilPayment} 天`}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className={`font-medium ${remainingCredit < dealer.creditLimit * 0.2 ? 'text-red-600' : 'text-gray-900'}`}>
                          NT$ {remainingCredit.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          額度: {dealer.creditLimit.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditDealer(dealer)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="編輯"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteDealer(dealer.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="刪除"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerManagementSystem;