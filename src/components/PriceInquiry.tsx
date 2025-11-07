import React, { useState } from 'react';
import { Search, ShoppingCart, Package, AlertCircle, CheckCircle } from 'lucide-react';
import { Product, PriceRule, Dealer } from '../types/dealer';

interface PriceInquiryProps {
  products: Product[];
  priceRules: PriceRule[];
  dealers: Dealer[];
  onAddToQuotation: (items: any[]) => void;
}

const PriceInquiry: React.FC<PriceInquiryProps> = ({
  products,
  priceRules,
  dealers,
  onAddToQuotation
}) => {
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  // 獲取所有產品分類
  const categories = ['全部', ...Array.from(new Set(products.map(p => p.category)))];

  // 根據經銷商等級獲取價格
  const getPrice = (productId: number, dealerLevel: string = 'C'): number => {
    const rule = priceRules.find(
      r => r.productId === productId && r.dealerLevel === dealerLevel
    );

    if (rule) return rule.price;

    // 如果沒有找到特定等級價格，使用牌價
    const product = products.find(p => p.id === productId);
    return product?.listPrice || 0;
  };

  // 篩選產品
  const filteredProducts = products.filter(product => {
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === '全部' || product.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  // 加入選購清單
  const addToSelection = (product: Product, quantity: number = 1) => {
    const dealerLevel = selectedDealer?.dealerLevel || 'C';
    const price = getPrice(product.id, dealerLevel);

    const existingIndex = selectedProducts.findIndex(p => p.productId === product.id);

    if (existingIndex >= 0) {
      const updated = [...selectedProducts];
      updated[existingIndex].quantity += quantity;
      updated[existingIndex].lineTotal = updated[existingIndex].quantity * price;
      setSelectedProducts(updated);
    } else {
      setSelectedProducts([
        ...selectedProducts,
        {
          productId: product.id,
          productCode: product.code,
          productName: product.name,
          specification: product.specification,
          unit: product.unit,
          quantity: quantity,
          unitPrice: price,
          discountRate: 0,
          lineTotal: price * quantity
        }
      ]);
    }
  };

  // 更新數量
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setSelectedProducts(selectedProducts.filter(p => p.productId !== productId));
      return;
    }

    const updated = selectedProducts.map(p => {
      if (p.productId === productId) {
        return {
          ...p,
          quantity,
          lineTotal: quantity * p.unitPrice
        };
      }
      return p;
    });
    setSelectedProducts(updated);
  };

  // 移除產品
  const removeProduct = (productId: number) => {
    setSelectedProducts(selectedProducts.filter(p => p.productId !== productId));
  };

  // 計算總金額
  const totalAmount = selectedProducts.reduce((sum, item) => sum + item.lineTotal, 0);

  // 庫存狀態
  const getStockStatus = (qty: number) => {
    if (qty <= 0) return { text: '無庫存', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (qty < 10) return { text: '庫存不足', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    return { text: '庫存充足', color: 'text-green-600', bgColor: 'bg-green-50' };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 標題 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">查價工具</h1>
          <p className="text-gray-600">快速查詢產品價格並建立報價單</p>
        </div>

        {/* 經銷商選擇 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">選擇經銷商</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                經銷商
              </label>
              <select
                value={selectedDealer?.id || ''}
                onChange={(e) => {
                  const dealer = dealers.find(d => d.id === parseInt(e.target.value));
                  setSelectedDealer(dealer || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選擇經銷商（使用標準價格）</option>
                {dealers.map(dealer => (
                  <option key={dealer.id} value={dealer.id}>
                    {dealer.name} - {dealer.dealerLevel || 'C'} 級
                  </option>
                ))}
              </select>
            </div>
            {selectedDealer && (
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="text-sm text-gray-600">選擇的經銷商</div>
                <div className="font-semibold text-gray-800">{selectedDealer.name}</div>
                <div className="text-sm text-gray-600">
                  等級: <span className="font-medium text-blue-600">{selectedDealer.dealerLevel || 'C'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 產品列表 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">產品列表</h2>

              {/* 搜尋和篩選 */}
              <div className="mb-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="搜尋產品名稱或編號..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1 rounded-full text-sm transition-colors ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 產品卡片 */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredProducts.map(product => {
                  const dealerLevel = selectedDealer?.dealerLevel || 'C';
                  const price = getPrice(product.id, dealerLevel);
                  const stockStatus = getStockStatus(product.stockQty);

                  return (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                              <Package className="text-gray-400" size={24} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {product.code}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{product.specification}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm text-gray-500">單位: {product.unit}</span>
                                <span className={`text-xs px-2 py-1 rounded ${stockStatus.bgColor} ${stockStatus.color}`}>
                                  {stockStatus.text} ({product.stockQty})
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-right ml-4">
                          <div className="text-sm text-gray-500 line-through">
                            牌價 NT$ {product.listPrice.toLocaleString()}
                          </div>
                          <div className="text-xl font-bold text-blue-600">
                            NT$ {price.toLocaleString()}
                          </div>
                          {selectedDealer && (
                            <div className="text-xs text-green-600">
                              省 NT$ {(product.listPrice - price).toLocaleString()}
                            </div>
                          )}
                          <button
                            onClick={() => addToSelection(product)}
                            disabled={product.stockQty <= 0}
                            className="mt-2 bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            <ShoppingCart className="inline mr-1" size={14} />
                            加入
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <AlertCircle className="mx-auto mb-2" size={48} />
                    <p>找不到符合條件的產品</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 已選產品 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                已選產品 ({selectedProducts.length})
              </h2>

              {selectedProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingCart className="mx-auto mb-2" size={48} />
                  <p className="text-sm">尚未選擇產品</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
                    {selectedProducts.map(item => (
                      <div key={item.productId} className="border-b border-gray-200 pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.productName}</div>
                            <div className="text-xs text-gray-500">{item.productCode}</div>
                          </div>
                          <button
                            onClick={() => removeProduct(item.productId)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            移除
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="text-xs text-gray-500">× NT$ {item.unitPrice.toLocaleString()}</span>
                        </div>
                        <div className="text-right text-sm font-semibold text-gray-800 mt-2">
                          NT$ {item.lineTotal.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-300 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">總計</span>
                      <span className="text-2xl font-bold text-blue-600">
                        NT$ {totalAmount.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (selectedProducts.length > 0) {
                          onAddToQuotation(selectedProducts);
                        }
                      }}
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      <CheckCircle className="inline mr-2" size={20} />
                      建立報價單
                    </button>

                    <button
                      onClick={() => setSelectedProducts([])}
                      className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      清空
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceInquiry;
