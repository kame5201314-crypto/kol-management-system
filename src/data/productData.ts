import { Product, PriceRule } from '../types/dealer';

// 產品範例資料
export const mockProducts: Product[] = [
  {
    id: 1,
    code: 'P001',
    name: '筆記型電腦 - 商務款',
    category: '電腦設備',
    specification: 'Intel i7, 16GB RAM, 512GB SSD',
    unit: '台',
    costPrice: 25000,
    listPrice: 35000,
    stockQty: 50
  },
  {
    id: 2,
    code: 'P002',
    name: '無線滑鼠',
    category: '周邊設備',
    specification: '2.4GHz 無線, 1600DPI',
    unit: '個',
    costPrice: 200,
    listPrice: 350,
    stockQty: 200
  },
  {
    id: 3,
    code: 'P003',
    name: '機械式鍵盤',
    category: '周邊設備',
    specification: '青軸, RGB背光',
    unit: '個',
    costPrice: 1200,
    listPrice: 2000,
    stockQty: 80
  },
  {
    id: 4,
    code: 'P004',
    name: '27吋 4K 顯示器',
    category: '顯示設備',
    specification: '3840x2160, IPS面板, HDR',
    unit: '台',
    costPrice: 8000,
    listPrice: 12000,
    stockQty: 30
  },
  {
    id: 5,
    code: 'P005',
    name: '無線印表機',
    category: '辦公設備',
    specification: '彩色噴墨, WiFi, 自動雙面列印',
    unit: '台',
    costPrice: 3500,
    listPrice: 5500,
    stockQty: 25
  },
  {
    id: 6,
    code: 'P006',
    name: 'USB-C 集線器',
    category: '周邊設備',
    specification: '7合1, HDMI, USB 3.0 x3, SD讀卡機',
    unit: '個',
    costPrice: 500,
    listPrice: 800,
    stockQty: 150
  },
  {
    id: 7,
    code: 'P007',
    name: '外接硬碟 2TB',
    category: '儲存設備',
    specification: '2TB, USB 3.0, 2.5吋',
    unit: '個',
    costPrice: 1800,
    listPrice: 2800,
    stockQty: 100
  },
  {
    id: 8,
    code: 'P008',
    name: '網路攝影機',
    category: '視訊設備',
    specification: '1080P, 自動對焦, 內建麥克風',
    unit: '個',
    costPrice: 800,
    listPrice: 1500,
    stockQty: 60
  }
];

// 價格規則（依經銷商等級）
export const mockPriceRules: PriceRule[] = [
  // 筆記型電腦
  { id: 1, productId: 1, dealerLevel: 'VIP', price: 30000 },
  { id: 2, productId: 1, dealerLevel: 'A', price: 31000 },
  { id: 3, productId: 1, dealerLevel: 'B', price: 32000 },
  { id: 4, productId: 1, dealerLevel: 'C', price: 33000 },

  // 無線滑鼠
  { id: 5, productId: 2, dealerLevel: 'VIP', price: 280 },
  { id: 6, productId: 2, dealerLevel: 'A', price: 300 },
  { id: 7, productId: 2, dealerLevel: 'B', price: 320 },
  { id: 8, productId: 2, dealerLevel: 'C', price: 335 },

  // 機械式鍵盤
  { id: 9, productId: 3, dealerLevel: 'VIP', price: 1600 },
  { id: 10, productId: 3, dealerLevel: 'A', price: 1700 },
  { id: 11, productId: 3, dealerLevel: 'B', price: 1800 },
  { id: 12, productId: 3, dealerLevel: 'C', price: 1900 },

  // 27吋顯示器
  { id: 13, productId: 4, dealerLevel: 'VIP', price: 10000 },
  { id: 14, productId: 4, dealerLevel: 'A', price: 10500 },
  { id: 15, productId: 4, dealerLevel: 'B', price: 11000 },
  { id: 16, productId: 4, dealerLevel: 'C', price: 11500 },

  // 無線印表機
  { id: 17, productId: 5, dealerLevel: 'VIP', price: 4500 },
  { id: 18, productId: 5, dealerLevel: 'A', price: 4800 },
  { id: 19, productId: 5, dealerLevel: 'B', price: 5000 },
  { id: 20, productId: 5, dealerLevel: 'C', price: 5200 },

  // USB-C 集線器
  { id: 21, productId: 6, dealerLevel: 'VIP', price: 650 },
  { id: 22, productId: 6, dealerLevel: 'A', price: 680 },
  { id: 23, productId: 6, dealerLevel: 'B', price: 720 },
  { id: 24, productId: 6, dealerLevel: 'C', price: 760 },

  // 外接硬碟
  { id: 25, productId: 7, dealerLevel: 'VIP', price: 2300 },
  { id: 26, productId: 7, dealerLevel: 'A', price: 2400 },
  { id: 27, productId: 7, dealerLevel: 'B', price: 2500 },
  { id: 28, productId: 7, dealerLevel: 'C', price: 2650 },

  // 網路攝影機
  { id: 29, productId: 8, dealerLevel: 'VIP', price: 1200 },
  { id: 30, productId: 8, dealerLevel: 'A', price: 1300 },
  { id: 31, productId: 8, dealerLevel: 'B', price: 1400 },
  { id: 32, productId: 8, dealerLevel: 'C', price: 1450 },
];
