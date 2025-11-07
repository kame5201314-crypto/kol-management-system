import { KOL, Collaboration, SalesTracking } from '../types/kol';

// 模擬 KOL 資料
export const mockKOLs: KOL[] = [
  {
    id: 1,
    name: '王美麗',
    nickname: '美麗說',
    email: 'meili@example.com',
    phone: '0912-345-678',
    category: ['美妝', '時尚', '生活'],
    tags: ['高互動', '專業', '穩定'],
    rating: 'A',
    note: '合作態度良好，內容品質高',
    socialPlatforms: [
      {
        platform: 'youtube',
        handle: '@meili_beauty',
        url: 'https://youtube.com/@meili_beauty',
        followers: 280000,
        engagement: 8.5,
        avgViews: 45000,
        lastUpdated: '2025-10-28'
      },
      {
        platform: 'instagram',
        handle: '@meili_style',
        url: 'https://instagram.com/meili_style',
        followers: 450000,
        engagement: 12.3,
        lastUpdated: '2025-10-28'
      },
      {
        platform: 'facebook',
        handle: '美麗說',
        url: 'https://facebook.com/meili.says',
        followers: 120000,
        engagement: 6.2,
        lastUpdated: '2025-10-28'
      }
    ],
    createdAt: '2024-01-15',
    updatedAt: '2025-10-28'
  },
  {
    id: 2,
    name: '林科技',
    nickname: 'Tech林',
    email: 'techlin@example.com',
    phone: '0923-456-789',
    category: ['3C', '科技', '開箱'],
    tags: ['專業評測', '深度分析', '值得信賴'],
    rating: 'S',
    note: '3C 領域專業 KOL，粉絲黏著度高',
    socialPlatforms: [
      {
        platform: 'youtube',
        handle: '@techlin_review',
        url: 'https://youtube.com/@techlin_review',
        followers: 520000,
        engagement: 9.8,
        avgViews: 85000,
        lastUpdated: '2025-10-29'
      },
      {
        platform: 'instagram',
        handle: '@tech_lin',
        url: 'https://instagram.com/tech_lin',
        followers: 180000,
        engagement: 7.5,
        lastUpdated: '2025-10-29'
      }
    ],
    createdAt: '2024-02-20',
    updatedAt: '2025-10-29'
  },
  {
    id: 3,
    name: '陳美食',
    nickname: '食在好吃',
    email: 'foodchen@example.com',
    phone: '0934-567-890',
    category: ['美食', '旅遊', '生活'],
    tags: ['美食探店', '高品質照片', '地方特色'],
    rating: 'B',
    note: '中部美食 KOL，擅長發掘在地特色',
    socialPlatforms: [
      {
        platform: 'instagram',
        handle: '@food_chen',
        url: 'https://instagram.com/food_chen',
        followers: 320000,
        engagement: 11.2,
        lastUpdated: '2025-10-30'
      },
      {
        platform: 'facebook',
        handle: '食在好吃',
        url: 'https://facebook.com/foodchen',
        followers: 250000,
        engagement: 8.9,
        lastUpdated: '2025-10-30'
      },
      {
        platform: 'tiktok',
        handle: '@foodchen_tiktok',
        url: 'https://tiktok.com/@foodchen_tiktok',
        followers: 150000,
        engagement: 15.6,
        lastUpdated: '2025-10-30'
      }
    ],
    createdAt: '2024-03-10',
    updatedAt: '2025-10-30'
  },
  {
    id: 4,
    name: '張遊戲',
    nickname: 'GamerZhang',
    email: 'gamerzhang@example.com',
    phone: '0945-678-901',
    category: ['遊戲', '電競', '娛樂'],
    tags: ['實況主', '高人氣', '年輕族群'],
    rating: 'A',
    note: '遊戲實況主，年輕粉絲多',
    socialPlatforms: [
      {
        platform: 'youtube',
        handle: '@gamerzhang',
        url: 'https://youtube.com/@gamerzhang',
        followers: 680000,
        engagement: 13.5,
        avgViews: 120000,
        lastUpdated: '2025-10-31'
      },
      {
        platform: 'tiktok',
        handle: '@gamerzhang_clips',
        url: 'https://tiktok.com/@gamerzhang_clips',
        followers: 420000,
        engagement: 18.3,
        lastUpdated: '2025-10-31'
      },
      {
        platform: 'instagram',
        handle: '@gamerzhang_ig',
        url: 'https://instagram.com/gamerzhang_ig',
        followers: 210000,
        engagement: 9.8,
        lastUpdated: '2025-10-31'
      }
    ],
    createdAt: '2024-04-05',
    updatedAt: '2025-10-31'
  },
  {
    id: 5,
    name: '李健身',
    nickname: 'FitLee',
    email: 'fitlee@example.com',
    phone: '0956-789-012',
    category: ['運動', '健身', '健康'],
    tags: ['專業教練', '正能量', '實用內容'],
    rating: 'S',
    note: '健身教練背景，內容專業實用',
    socialPlatforms: [
      {
        platform: 'youtube',
        handle: '@fitlee_workout',
        url: 'https://youtube.com/@fitlee_workout',
        followers: 380000,
        engagement: 10.2,
        avgViews: 55000,
        lastUpdated: '2025-11-01'
      },
      {
        platform: 'instagram',
        handle: '@fit_lee',
        url: 'https://instagram.com/fit_lee',
        followers: 520000,
        engagement: 14.5,
        lastUpdated: '2025-11-01'
      }
    ],
    createdAt: '2024-05-12',
    updatedAt: '2025-11-01'
  }
];

// 模擬合作專案資料
export const mockCollaborations: Collaboration[] = [
  {
    id: 1,
    kolId: 1,
    projectName: '秋冬彩妝系列推廣',
    brand: 'Beauty Brand A',
    status: 'in_progress',
    startDate: '2025-10-15',
    endDate: '2025-11-30',
    budget: 180000,
    actualCost: 180000,
    deliverables: ['YouTube 開箱影片 1 支', 'Instagram 貼文 3 則', 'IG 限時動態 5 則'],
    platforms: ['youtube', 'instagram'],
    note: '需要在 11/15 前完成主要影片',
    createdAt: '2025-09-20',
    updatedAt: '2025-10-28'
  },
  {
    id: 2,
    kolId: 2,
    projectName: '新款筆電評測',
    brand: 'Tech Company B',
    status: 'completed',
    startDate: '2025-09-01',
    endDate: '2025-09-30',
    budget: 250000,
    actualCost: 250000,
    deliverables: ['YouTube 完整評測影片 1 支', 'Instagram 快速開箱 1 則'],
    platforms: ['youtube', 'instagram'],
    contractUrl: 'https://example.com/contract/2.pdf',
    note: '合作順利，成效優異',
    createdAt: '2025-08-15',
    updatedAt: '2025-10-01'
  },
  {
    id: 3,
    kolId: 3,
    projectName: '餐廳開幕宣傳',
    brand: 'Restaurant C',
    status: 'completed',
    startDate: '2025-10-01',
    endDate: '2025-10-15',
    budget: 80000,
    actualCost: 80000,
    deliverables: ['Instagram 貼文 2 則', 'IG 限時動態 3 則', 'Facebook 貼文 1 則'],
    platforms: ['instagram', 'facebook'],
    note: '餐廳評價很好，合作愉快',
    createdAt: '2025-09-10',
    updatedAt: '2025-10-16'
  },
  {
    id: 4,
    kolId: 4,
    projectName: '手遊推廣活動',
    brand: 'Game Studio D',
    status: 'in_progress',
    startDate: '2025-10-20',
    endDate: '2025-11-20',
    budget: 350000,
    actualCost: 350000,
    deliverables: ['YouTube 實況 3 場', 'TikTok 短影片 5 支', 'Instagram 貼文 2 則'],
    platforms: ['youtube', 'tiktok', 'instagram'],
    note: '長期合作對象',
    createdAt: '2025-09-25',
    updatedAt: '2025-10-31'
  },
  {
    id: 5,
    kolId: 5,
    projectName: '運動品牌代言',
    brand: 'Sports Brand E',
    status: 'confirmed',
    startDate: '2025-11-05',
    endDate: '2025-12-31',
    budget: 500000,
    actualCost: 500000,
    deliverables: ['YouTube 訓練影片 4 支', 'Instagram 貼文 8 則', 'IG Reels 6 支'],
    platforms: ['youtube', 'instagram'],
    contractUrl: 'https://example.com/contract/5.pdf',
    note: '品牌形象契合度高',
    createdAt: '2025-10-10',
    updatedAt: '2025-10-25'
  }
];

// 模擬銷售追蹤資料
export const mockSalesTracking: SalesTracking[] = [
  {
    id: 1,
    collaborationId: 1,
    kolId: 1,
    discountCode: 'MEILI20',
    affiliateLink: 'https://example.com/aff/meili',
    clicks: 12500,
    conversions: 856,
    revenue: 428000,
    commission: 64200,
    commissionRate: 15,
    trackingStartDate: '2025-10-15',
    trackingEndDate: '2025-11-30',
    createdAt: '2025-10-15',
    updatedAt: '2025-10-31'
  },
  {
    id: 2,
    collaborationId: 2,
    kolId: 2,
    discountCode: 'TECHLIN15',
    affiliateLink: 'https://example.com/aff/techlin',
    clicks: 28000,
    conversions: 1250,
    revenue: 1875000,
    commission: 281250,
    commissionRate: 15,
    trackingStartDate: '2025-09-01',
    trackingEndDate: '2025-09-30',
    createdAt: '2025-09-01',
    updatedAt: '2025-10-01'
  },
  {
    id: 3,
    collaborationId: 3,
    kolId: 3,
    discountCode: 'FOODCHEN10',
    clicks: 8500,
    conversions: 420,
    revenue: 126000,
    commission: 12600,
    commissionRate: 10,
    trackingStartDate: '2025-10-01',
    trackingEndDate: '2025-10-15',
    createdAt: '2025-10-01',
    updatedAt: '2025-10-16'
  },
  {
    id: 4,
    collaborationId: 4,
    kolId: 4,
    affiliateLink: 'https://example.com/aff/gamerzhang',
    clicks: 45000,
    conversions: 2800,
    revenue: 840000,
    commission: 168000,
    commissionRate: 20,
    trackingStartDate: '2025-10-20',
    trackingEndDate: '2025-11-20',
    createdAt: '2025-10-20',
    updatedAt: '2025-10-31'
  }
];
