// Vendor Learning Service (供應商學習服務)
// 核心差異化功能：自動從供應商名稱推斷發票分類

import {
  InvoiceCategory,
  VendorRule,
  VendorRulesData,
  VendorLookupResult,
  VendorStats,
  INVOICE_CATEGORY_LABELS
} from '../types/invoiceFlow';

// 載入預設供應商規則
import defaultVendorRules from '../data/vendorRules.json';

// localStorage Key
const STORAGE_KEY = 'ecommerce_vendor_rules';

/**
 * 供應商學習服務
 *
 * 功能說明：
 * 1. 載入並管理供應商規則（從 localStorage 或預設 JSON）
 * 2. 根據供應商名稱查詢對應的預設類別
 * 3. 支援精確匹配、別名匹配、模糊匹配
 * 4. 允許新增/更新/刪除供應商規則
 * 5. 追蹤使用統計以優化匹配
 */
export const vendorLearningService = {

  // ============================================
  // 讀取與儲存
  // ============================================

  /**
   * 取得所有供應商規則
   */
  getRules: (): VendorRulesData => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        console.warn('Failed to parse vendor rules from localStorage, using defaults');
      }
    }
    // 初始化預設規則到 localStorage
    const defaults = defaultVendorRules as VendorRulesData;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  },

  /**
   * 儲存供應商規則
   */
  saveRules: (data: VendorRulesData): void => {
    data._lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  /**
   * 匯出規則為 JSON 字串（方便使用者下載編輯）
   */
  exportRulesAsJSON: (): string => {
    const rules = vendorLearningService.getRules();
    return JSON.stringify(rules, null, 2);
  },

  /**
   * 從 JSON 字串匯入規則
   */
  importRulesFromJSON: (jsonString: string): { success: boolean; error?: string; imported?: number } => {
    try {
      const data = JSON.parse(jsonString) as VendorRulesData;
      if (!data.rules || typeof data.rules !== 'object') {
        return { success: false, error: '無效的規則格式：缺少 rules 物件' };
      }
      vendorLearningService.saveRules(data);
      return { success: true, imported: Object.keys(data.rules).length };
    } catch (e) {
      return { success: false, error: `JSON 解析錯誤: ${e}` };
    }
  },

  /**
   * 重置為預設規則
   */
  resetToDefaults: (): void => {
    localStorage.removeItem(STORAGE_KEY);
    vendorLearningService.getRules(); // 重新載入預設值
  },

  // ============================================
  // 核心查詢功能
  // ============================================

  /**
   * 根據供應商名稱查詢分類（核心功能）
   *
   * 查詢順序：
   * 1. 精確匹配供應商名稱
   * 2. 精確匹配別名
   * 3. 模糊匹配（包含關係）
   * 4. 找不到則返回 "Uncategorized"
   */
  lookupVendor: (vendorName: string): VendorLookupResult => {
    if (!vendorName || vendorName.trim() === '') {
      return {
        found: false,
        vendorName: '',
        suggestedCategory: 'other',
        suggestedCategoryLabel: '未分類 (Uncategorized)',
        confidence: 0
      };
    }

    const query = vendorName.trim();
    const queryLower = query.toLowerCase();
    const rules = vendorLearningService.getRules();

    // 1. 精確匹配供應商名稱
    if (rules.rules[query]) {
      const rule = rules.rules[query];
      vendorLearningService.recordUsage(query);
      return {
        found: true,
        vendorName: query,
        matchedBy: 'exact',
        originalQuery: query,
        rule,
        suggestedCategory: rule.category,
        suggestedCategoryLabel: rule.categoryLabel,
        confidence: rule.confidence
      };
    }

    // 2. 精確匹配別名
    for (const [vendorKey, rule] of Object.entries(rules.rules)) {
      if (rule.aliases) {
        const aliasMatch = rule.aliases.find(
          alias => alias.toLowerCase() === queryLower
        );
        if (aliasMatch) {
          vendorLearningService.recordUsage(vendorKey);
          return {
            found: true,
            vendorName: vendorKey,
            matchedBy: 'alias',
            originalQuery: query,
            rule,
            suggestedCategory: rule.category,
            suggestedCategoryLabel: rule.categoryLabel,
            confidence: rule.confidence * 0.95 // 別名匹配稍微降低信心度
          };
        }
      }
    }

    // 3. 模糊匹配（供應商名稱包含查詢字串，或查詢字串包含供應商名稱）
    for (const [vendorKey, rule] of Object.entries(rules.rules)) {
      const vendorLower = vendorKey.toLowerCase();
      if (vendorLower.includes(queryLower) || queryLower.includes(vendorLower)) {
        vendorLearningService.recordUsage(vendorKey);
        return {
          found: true,
          vendorName: vendorKey,
          matchedBy: 'fuzzy',
          originalQuery: query,
          rule,
          suggestedCategory: rule.category,
          suggestedCategoryLabel: rule.categoryLabel,
          confidence: rule.confidence * 0.8 // 模糊匹配大幅降低信心度
        };
      }

      // 也檢查別名的模糊匹配
      if (rule.aliases) {
        const fuzzyAliasMatch = rule.aliases.find(alias => {
          const aliasLower = alias.toLowerCase();
          return aliasLower.includes(queryLower) || queryLower.includes(aliasLower);
        });
        if (fuzzyAliasMatch) {
          vendorLearningService.recordUsage(vendorKey);
          return {
            found: true,
            vendorName: vendorKey,
            matchedBy: 'fuzzy',
            originalQuery: query,
            rule,
            suggestedCategory: rule.category,
            suggestedCategoryLabel: rule.categoryLabel,
            confidence: rule.confidence * 0.7 // 別名模糊匹配信心度最低
          };
        }
      }
    }

    // 4. 找不到 - 返回 Uncategorized
    return {
      found: false,
      vendorName: query,
      originalQuery: query,
      suggestedCategory: 'other',
      suggestedCategoryLabel: '未分類 (Uncategorized)',
      confidence: 0
    };
  },

  /**
   * 記錄供應商使用次數（用於統計和優化）
   */
  recordUsage: (vendorName: string): void => {
    const rules = vendorLearningService.getRules();
    if (rules.rules[vendorName]) {
      rules.rules[vendorName].lastUsed = new Date().toISOString();
      rules.rules[vendorName].usageCount = (rules.rules[vendorName].usageCount || 0) + 1;
      vendorLearningService.saveRules(rules);
    }
  },

  // ============================================
  // 規則管理 CRUD
  // ============================================

  /**
   * 新增供應商規則
   */
  addRule: (
    vendorName: string,
    category: InvoiceCategory,
    options?: {
      aliases?: string[];
      confidence?: number;
      notes?: string;
    }
  ): VendorRule => {
    const rules = vendorLearningService.getRules();

    const newRule: VendorRule = {
      category,
      categoryLabel: INVOICE_CATEGORY_LABELS[category],
      confidence: options?.confidence ?? 0.8,
      aliases: options?.aliases ?? [],
      notes: options?.notes,
      usageCount: 0
    };

    rules.rules[vendorName] = newRule;
    vendorLearningService.saveRules(rules);

    return newRule;
  },

  /**
   * 更新供應商規則
   */
  updateRule: (
    vendorName: string,
    updates: Partial<VendorRule>
  ): VendorRule | null => {
    const rules = vendorLearningService.getRules();

    if (!rules.rules[vendorName]) {
      return null;
    }

    // 如果更新類別，同時更新類別標籤
    if (updates.category) {
      updates.categoryLabel = INVOICE_CATEGORY_LABELS[updates.category];
    }

    rules.rules[vendorName] = {
      ...rules.rules[vendorName],
      ...updates
    };

    vendorLearningService.saveRules(rules);
    return rules.rules[vendorName];
  },

  /**
   * 刪除供應商規則
   */
  deleteRule: (vendorName: string): boolean => {
    const rules = vendorLearningService.getRules();

    if (!rules.rules[vendorName]) {
      return false;
    }

    delete rules.rules[vendorName];
    vendorLearningService.saveRules(rules);
    return true;
  },

  /**
   * 新增別名到現有供應商
   */
  addAlias: (vendorName: string, alias: string): boolean => {
    const rules = vendorLearningService.getRules();

    if (!rules.rules[vendorName]) {
      return false;
    }

    if (!rules.rules[vendorName].aliases) {
      rules.rules[vendorName].aliases = [];
    }

    if (!rules.rules[vendorName].aliases.includes(alias)) {
      rules.rules[vendorName].aliases.push(alias);
      vendorLearningService.saveRules(rules);
    }

    return true;
  },

  /**
   * 從未分類的發票「學習」新規則
   * 當使用者手動分類一張未分類發票時呼叫此方法
   */
  learnFromInvoice: (
    vendorName: string,
    category: InvoiceCategory,
    notes?: string
  ): VendorRule => {
    const existingLookup = vendorLearningService.lookupVendor(vendorName);

    if (existingLookup.found) {
      // 已存在規則，增加使用次數但不改變分類
      // 如果使用者選擇的分類與建議不同，可能需要確認
      vendorLearningService.recordUsage(existingLookup.vendorName);
      return existingLookup.rule!;
    }

    // 新供應商，建立新規則
    return vendorLearningService.addRule(vendorName, category, {
      confidence: 0.75, // 從發票學習的初始信心度
      notes: notes || '從發票自動學習'
    });
  },

  // ============================================
  // 統計與分析
  // ============================================

  /**
   * 取得供應商規則統計
   */
  getStats: (): VendorStats => {
    const rules = vendorLearningService.getRules();
    const ruleEntries = Object.entries(rules.rules);

    // 按類別統計
    const categoryMap = new Map<InvoiceCategory, number>();
    ruleEntries.forEach(([_, rule]) => {
      categoryMap.set(rule.category, (categoryMap.get(rule.category) || 0) + 1);
    });

    // 按使用次數排序取 Top 10
    const topVendors = ruleEntries
      .filter(([_, rule]) => rule.usageCount && rule.usageCount > 0)
      .sort((a, b) => (b[1].usageCount || 0) - (a[1].usageCount || 0))
      .slice(0, 10)
      .map(([name, rule]) => ({
        name,
        usageCount: rule.usageCount || 0,
        category: rule.category
      }));

    return {
      totalVendors: ruleEntries.length,
      totalRules: ruleEntries.length + ruleEntries.reduce(
        (sum, [_, rule]) => sum + (rule.aliases?.length || 0), 0
      ),
      categoryCoverage: Array.from(categoryMap.entries()).map(([category, vendorCount]) => ({
        category,
        vendorCount
      })),
      topVendors,
      uncategorizedCount: 0 // 預設規則不會有未分類
    };
  },

  /**
   * 搜尋供應商規則
   */
  searchRules: (query: string): { vendorName: string; rule: VendorRule }[] => {
    const rules = vendorLearningService.getRules();
    const queryLower = query.toLowerCase();

    return Object.entries(rules.rules)
      .filter(([vendorName, rule]) => {
        // 搜尋供應商名稱
        if (vendorName.toLowerCase().includes(queryLower)) return true;
        // 搜尋別名
        if (rule.aliases?.some(a => a.toLowerCase().includes(queryLower))) return true;
        // 搜尋分類標籤
        if (rule.categoryLabel.includes(query)) return true;
        // 搜尋備註
        if (rule.notes?.toLowerCase().includes(queryLower)) return true;
        return false;
      })
      .map(([vendorName, rule]) => ({ vendorName, rule }));
  },

  /**
   * 取得特定類別的所有供應商
   */
  getVendorsByCategory: (category: InvoiceCategory): { vendorName: string; rule: VendorRule }[] => {
    const rules = vendorLearningService.getRules();

    return Object.entries(rules.rules)
      .filter(([_, rule]) => rule.category === category)
      .map(([vendorName, rule]) => ({ vendorName, rule }));
  }
};

export default vendorLearningService;
