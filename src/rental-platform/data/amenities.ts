// 設備設施資料

export interface AmenityCategory {
  id: string;
  name: string;
  items: AmenityItem[];
}

export interface AmenityItem {
  id: string;
  name: string;
  icon?: string;
}

// 設備設施分類
export const AMENITY_CATEGORIES: AmenityCategory[] = [
  {
    id: 'basic',
    name: '基本設備',
    items: [
      { id: 'ac', name: '冷氣' },
      { id: 'water_heater', name: '熱水器' },
      { id: 'washing_machine', name: '洗衣機' },
      { id: 'refrigerator', name: '冰箱' },
      { id: 'tv', name: '電視' },
      { id: 'wifi', name: '網路/Wi-Fi' },
      { id: 'cable_tv', name: '第四台' },
    ]
  },
  {
    id: 'kitchen',
    name: '廚房設備',
    items: [
      { id: 'kitchen', name: '廚房' },
      { id: 'gas_stove', name: '瓦斯爐' },
      { id: 'induction_stove', name: '電磁爐' },
      { id: 'microwave', name: '微波爐' },
      { id: 'oven', name: '烤箱' },
      { id: 'dishwasher', name: '洗碗機' },
      { id: 'range_hood', name: '抽油煙機' },
    ]
  },
  {
    id: 'bathroom',
    name: '衛浴設備',
    items: [
      { id: 'private_bathroom', name: '獨立衛浴' },
      { id: 'bathtub', name: '浴缸' },
      { id: 'shower', name: '淋浴設備' },
      { id: 'toilet', name: '馬桶' },
      { id: 'bidet', name: '免治馬桶' },
    ]
  },
  {
    id: 'safety',
    name: '安全設備',
    items: [
      { id: 'security_guard', name: '管理員' },
      { id: 'cctv', name: '監視器' },
      { id: 'intercom', name: '對講機' },
      { id: 'card_access', name: '門禁卡' },
      { id: 'fire_extinguisher', name: '滅火器' },
      { id: 'smoke_detector', name: '煙霧偵測器' },
    ]
  },
  {
    id: 'building',
    name: '建築設施',
    items: [
      { id: 'elevator', name: '電梯' },
      { id: 'parking', name: '停車位' },
      { id: 'motorcycle_parking', name: '機車位' },
      { id: 'bicycle_parking', name: '腳踏車位' },
      { id: 'garbage_room', name: '垃圾集中處理' },
      { id: 'mailbox', name: '信箱' },
    ]
  },
  {
    id: 'community',
    name: '社區設施',
    items: [
      { id: 'gym', name: '健身房' },
      { id: 'pool', name: '游泳池' },
      { id: 'garden', name: '中庭花園' },
      { id: 'playground', name: '兒童遊戲區' },
      { id: 'meeting_room', name: '會議室' },
      { id: 'lounge', name: '交誼廳' },
      { id: 'rooftop', name: '頂樓空間' },
    ]
  }
];

// 傢俱清單
export const FURNITURE_ITEMS: AmenityItem[] = [
  { id: 'bed', name: '床' },
  { id: 'mattress', name: '床墊' },
  { id: 'wardrobe', name: '衣櫃' },
  { id: 'desk', name: '書桌' },
  { id: 'chair', name: '椅子' },
  { id: 'sofa', name: '沙發' },
  { id: 'coffee_table', name: '茶几' },
  { id: 'dining_table', name: '餐桌' },
  { id: 'dining_chairs', name: '餐椅' },
  { id: 'bookshelf', name: '書架' },
  { id: 'shoe_cabinet', name: '鞋櫃' },
  { id: 'tv_stand', name: '電視櫃' },
  { id: 'dresser', name: '梳妝台' },
  { id: 'nightstand', name: '床頭櫃' },
];

// 獲取所有設備 ID 列表
export const getAllAmenityIds = (): string[] => {
  return AMENITY_CATEGORIES.flatMap(cat => cat.items.map(item => item.id));
};

// 根據 ID 獲取設備名稱
export const getAmenityNameById = (id: string): string | undefined => {
  for (const category of AMENITY_CATEGORIES) {
    const item = category.items.find(i => i.id === id);
    if (item) return item.name;
  }
  return undefined;
};

// 獲取傢俱名稱
export const getFurnitureNameById = (id: string): string | undefined => {
  return FURNITURE_ITEMS.find(i => i.id === id)?.name;
};

// 快速篩選用的常見設備
export const QUICK_FILTER_AMENITIES = [
  { id: 'ac', name: '冷氣' },
  { id: 'wifi', name: '網路' },
  { id: 'washing_machine', name: '洗衣機' },
  { id: 'parking', name: '停車位' },
  { id: 'elevator', name: '電梯' },
  { id: 'private_bathroom', name: '獨立衛浴' },
];

// 租金範圍選項
export const PRICE_RANGES = [
  { min: 0, max: 5000, label: '5,000以下' },
  { min: 5000, max: 10000, label: '5,000-10,000' },
  { min: 10000, max: 15000, label: '10,000-15,000' },
  { min: 15000, max: 20000, label: '15,000-20,000' },
  { min: 20000, max: 30000, label: '20,000-30,000' },
  { min: 30000, max: 50000, label: '30,000-50,000' },
  { min: 50000, max: null, label: '50,000以上' },
];

// 坪數範圍選項
export const AREA_RANGES = [
  { min: 0, max: 10, label: '10坪以下' },
  { min: 10, max: 20, label: '10-20坪' },
  { min: 20, max: 30, label: '20-30坪' },
  { min: 30, max: 40, label: '30-40坪' },
  { min: 40, max: 50, label: '40-50坪' },
  { min: 50, max: null, label: '50坪以上' },
];

// 格局選項
export const BEDROOM_OPTIONS = [
  { value: 0, label: '不限' },
  { value: 1, label: '1房' },
  { value: 2, label: '2房' },
  { value: 3, label: '3房' },
  { value: 4, label: '4房以上' },
];
