// 合約範本
export interface ContractTemplate {
  id: number;
  name: string; // 範本名稱
  content: string; // 合約內容（支援變數替換）
  createdAt: string;
  updatedAt: string;
}

// 合約變數
export interface ContractVariables {
  // KOL 資訊
  kolName: string; // KOL 姓名
  kolNickname: string; // KOL 暱稱
  kolEmail: string; // KOL Email
  kolPhone: string; // KOL 電話
  kolIdNumber: string; // 身分證字號/統一編號
  kolAddress: string; // 通訊地址
  kolBankInfo: string; // 匯款資料

  // 公司資訊
  companyName: string; // 公司名稱
  companyRep: string; // 負責人
  companyId: string; // 統一編號
  companyContact: string; // 聯繫窗口
  companyPhone: string; // 公司電話
  companyEmail: string; // 公司 Email
  companyAddress: string; // 公司地址

  // 合作內容
  projectName: string; // 專案名稱
  productName: string; // 合作商品
  deliveryDate: string; // 約定交稿日
  startDate: string; // 贈購開始日期
  endDate: string; // 贈購結束日期

  // 分潤資訊
  profitPeriod: string; // 分潤週期
  salesAmount: string; // 銷售金額
  profitShareRate: string; // 分潤比例
  bonusAmount: string; // 額外獎金

  // 其他
  budget: string; // 合作預算
  paymentTerms: string; // 付款條件
  deliverables: string; // 交付內容
  socialPlatforms: string; // 社群平台
  additionalTerms: string; // 其他條款
  signDate: string; // 簽約日期
}
