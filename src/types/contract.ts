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
  kolName: string; // KOL 姓名
  kolNickname: string; // KOL 暱稱
  kolEmail: string; // KOL Email
  kolPhone: string; // KOL 電話
  companyName: string; // 公司名稱
  projectName: string; // 專案名稱
  startDate: string; // 合作開始日期
  endDate: string; // 合作結束日期
  budget: string; // 合作預算
  profitShareRate: string; // 分潤比例
  paymentTerms: string; // 付款條件
  deliverables: string; // 交付內容
  additionalTerms: string; // 其他條款
  signDate: string; // 簽約日期
}
