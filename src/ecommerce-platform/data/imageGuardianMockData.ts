/**
 * AI 自動檢舉系統 (Image Guardian) - 資料存儲
 *
 * 注意：所有資料從空白開始，只顯示用戶實際上傳的內容
 */

import {
  DigitalAsset,
  WhitelistEntry,
  ScanTask,
  Violation,
  InfringerProfile,
  LegalCase,
  CaseEvent,
  WarningLetter,
  OfficialReport,
  WarningLetterTemplate,
  ReportTemplate,
  ImageGuardianStats
} from '../types/imageGuardian';

// ==================== 數位資產 - 空白開始 ====================
export const mockDigitalAssets: DigitalAsset[] = [];

// ==================== 白名單 - 空白開始 ====================
export const mockWhitelist: WhitelistEntry[] = [];

// ==================== 掃描任務 - 空白開始 ====================
export const mockScanTasks: ScanTask[] = [];

// ==================== 侵權記錄 - 空白開始 ====================
export const mockViolations: Violation[] = [];

// ==================== 盜圖者畫像 - 空白開始 ====================
export const mockInfringers: InfringerProfile[] = [];

// ==================== 維權案件 - 空白開始 ====================
export const mockCaseEvents: CaseEvent[] = [];
export const mockWarningLetters: WarningLetter[] = [];
export const mockOfficialReports: OfficialReport[] = [];
export const mockLegalCases: LegalCase[] = [];

// ==================== 警告信模板 (保留) ====================
export const mockWarningLetterTemplates: WarningLetterTemplate[] = [
  {
    id: 'template-friendly',
    name: '友善提醒',
    level: 'friendly',
    subject: '關於商品圖片使用事宜',
    content: `您好，

我們發現貴賣場的以下商品可能使用了我們公司的產品圖片：
- 商品名稱：{{productTitle}}
- 商品連結：{{productUrl}}

這些圖片為我司擁有著作權的攝影著作，未經授權不得使用。

希望您能在 7 天內移除相關圖片或與我們聯繫取得授權。

感謝您的配合！

{{companyName}}
{{contactEmail}}`,
    variables: ['productTitle', 'productUrl', 'companyName', 'contactEmail'],
    description: '適用於首次發現侵權的友善提醒',
    isDefault: true
  },
  {
    id: 'template-formal',
    name: '正式警告函',
    level: 'formal',
    subject: '著作權侵權警告通知',
    content: `敬啟者：

茲就貴賣場（{{sellerName}}）之商品（{{productTitle}}）未經授權使用本公司擁有著作權之攝影著作一事，特此函告。

一、侵權事實
貴賣場於 {{platformName}} 平台銷售之商品頁面，使用了本公司之產品圖片，經比對確認相似度達 {{similarityScore}}%，已構成著作權侵害。

二、法律依據
依據著作權法第91條及第92條，擅自重製或公開傳輸他人著作者，最高可處三年以下有期徒刑，並得併科新台幣七十五萬元以下罰金。

三、要求事項
請於收到本函後 5 個工作日內：
1. 移除所有侵權圖片
2. 以書面確認已完成移除

若未於期限內改正，本公司將採取進一步法律行動，包括但不限於向平台檢舉及提起民事、刑事訴訟。

此致
{{sellerName}}

{{companyName}}
{{companyAddress}}
{{contactPerson}}
聯絡電話：{{contactPhone}}
電子郵件：{{contactEmail}}
日期：{{currentDate}}`,
    variables: [
      'sellerName', 'productTitle', 'platformName', 'similarityScore',
      'companyName', 'companyAddress', 'contactPerson', 'contactPhone',
      'contactEmail', 'currentDate'
    ],
    description: '適用於未回應友善提醒的正式法律警告',
    isDefault: true
  },
  {
    id: 'template-legal',
    name: '律師函',
    level: 'legal',
    subject: '律師函 - 著作權侵害案',
    content: `律 師 函

受文者：{{sellerName}}
發文日期：{{currentDate}}
案件編號：{{caseNumber}}

一、事由
本律師受 {{companyName}}（以下稱「委託人」）委託，就貴方侵害委託人著作權一事，特此函告。

二、侵權事實
經查，貴方於 {{platformName}} 平台經營之賣場，銷售之商品（{{productTitle}}）頁面中，未經授權使用委託人之攝影著作，經數位指紋比對，相似度高達 {{similarityScore}}%，顯已構成著作權侵害。

三、法律分析
按著作權法第10條規定，著作人於著作完成時享有著作權。貴方之行為已違反：
1. 著作權法第22條（重製權）
2. 著作權法第26條之1（公開傳輸權）
依同法第88條，侵害他人著作財產權者，負損害賠償責任。

四、要求事項
請於收函後 3 日內：
1. 立即移除所有侵權圖片
2. 以書面聲明不再侵權
3. 賠償委託人損失新台幣 {{compensationAmount}} 元整

五、保留權利
若貴方未於期限內履行上述要求，委託人將依法提起民事訴訟求償，並向檢察機關提出刑事告訴，届時貴方將面臨更高額之賠償及刑事責任，請審慎處理。

此致
{{sellerName}}

{{lawFirmName}}
{{lawyerName}} 律師
聯絡電話：{{lawyerPhone}}
電子郵件：{{lawyerEmail}}`,
    variables: [
      'sellerName', 'currentDate', 'caseNumber', 'companyName',
      'platformName', 'productTitle', 'similarityScore', 'compensationAmount',
      'lawFirmName', 'lawyerName', 'lawyerPhone', 'lawyerEmail'
    ],
    description: '適用於嚴重侵權或多次警告無效的情況',
    isDefault: true
  }
];

// ==================== 檢舉模板 (保留) ====================
export const mockReportTemplates: ReportTemplate[] = [
  {
    id: 'report-shopee-copyright',
    platform: 'shopee',
    reportType: 'copyright',
    name: '蝦皮著作權檢舉',
    content: `檢舉類型：著作權侵權

被檢舉商品資訊：
- 商品連結：{{productUrl}}
- 賣家帳號：{{sellerName}}
- 商品名稱：{{productTitle}}

侵權描述：
該商品使用了本公司（{{companyName}}）擁有著作權的產品攝影圖片，未經授權即進行商業使用。

著作權證明：
1. 原圖創作日期：{{originalDate}}
2. 原圖儲存位置：{{originalUrl}}
3. 數位指紋比對相似度：{{similarityScore}}%

聯絡資訊：
公司名稱：{{companyName}}
統一編號：{{taxId}}
聯絡人：{{contactPerson}}
電話：{{contactPhone}}
Email：{{contactEmail}}

附件清單：
1. 原圖檔案
2. 侵權頁面截圖
3. 相似度比對報告`,
    requiredFields: [
      'productUrl', 'sellerName', 'productTitle', 'companyName',
      'originalDate', 'originalUrl', 'similarityScore',
      'taxId', 'contactPerson', 'contactPhone', 'contactEmail'
    ],
    instructions: '請準備好原圖檔案、侵權截圖和公司證明文件後提交'
  },
  {
    id: 'report-ruten-copyright',
    platform: 'ruten',
    reportType: 'copyright',
    name: '露天著作權檢舉',
    content: `智慧財產權侵害申訴表

申訴人資料：
公司名稱：{{companyName}}
統一編號：{{taxId}}
聯絡人：{{contactPerson}}
聯絡電話：{{contactPhone}}
電子郵件：{{contactEmail}}

被申訴商品：
商品編號：{{listingId}}
商品標題：{{productTitle}}
商品網址：{{productUrl}}
賣家帳號：{{sellerName}}

申訴說明：
上述商品頁面使用之圖片為申訴人擁有著作權之攝影著作，未經授權使用已構成侵權。

檢附資料：
□ 原創作品證明
□ 侵權商品截圖
□ 相似度比對報告（相似度：{{similarityScore}}%）
□ 公司登記證明`,
    requiredFields: [
      'companyName', 'taxId', 'contactPerson', 'contactPhone', 'contactEmail',
      'listingId', 'productTitle', 'productUrl', 'sellerName', 'similarityScore'
    ],
    instructions: '露天需透過官方表單提交，請備妥所有必要文件'
  }
];

// ==================== 儀表板統計 - 動態計算 ====================
export const mockImageGuardianStats: ImageGuardianStats = {
  assets: {
    total: 0,
    monitoring: 0,
    archived: 0,
    newThisMonth: 0
  },
  scans: {
    totalScans: 0,
    scansThisMonth: 0,
    lastScanAt: undefined,
    averageScanTime: 0,
    successRate: 0
  },
  violations: {
    total: 0,
    newThisWeek: 0,
    newThisMonth: 0,
    byPlatform: {
      shopee: 0,
      ruten: 0,
      yahoo: 0,
      other: 0
    },
    bySimilarity: {
      exact: 0,
      high: 0,
      medium: 0,
      low: 0
    }
  },
  cases: {
    total: 0,
    active: 0,
    resolved: 0,
    warningsSent: 0,
    reportsField: 0,
    resolutionRate: 0
  },
  topInfringers: [],
  recentActivity: []
};

// ==================== 輔助函數 ====================

/** 根據資產 ID 獲取資產 */
export function getAssetById(id: string): DigitalAsset | undefined {
  return mockDigitalAssets.find(a => a.id === id);
}

/** 根據案件 ID 獲取案件 */
export function getCaseById(id: string): LegalCase | undefined {
  return mockLegalCases.find(c => c.id === id);
}

/** 根據侵權者 ID 獲取畫像 */
export function getInfringerBySellerId(sellerId: string): InfringerProfile | undefined {
  return mockInfringers.find(i => i.sellerId === sellerId);
}

/** 獲取資產的白名單 */
export function getWhitelistByAssetId(assetId: string): WhitelistEntry[] {
  return mockWhitelist.filter(w => w.assetId === assetId);
}

/** 獲取資產的侵權記錄 */
export function getViolationsByAssetId(assetId: string): Violation[] {
  return mockViolations.filter(v => v.assetId === assetId);
}
