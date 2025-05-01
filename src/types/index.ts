// 用戶相關類型
export interface UserPreferences {
  healthNeeds: string[];
  lifestyle: string;
  budget: string;
  frequency: string;
  allergies?: string;
}

// 產品相關類型
export interface Product {
  id: string;
  name_zh: string;
  name_en: string;
  brand: string;
  category: string;
  sub_category?: string;
  image_url: string;
  iherb_url: string;
  price: number;
  discount_price?: number;
  rating: number;
  review_count: number;
  benefits: string[];
  ingredients: string;
  serving_size: string;
  usage_instruction: string;
  warning?: string;
  is_active: boolean;
}

// 健康需求類型
export interface HealthNeed {
  id: string;
  name: string;
  description: string;
  recommended_products: string[];
  priority_level: 'high' | 'medium' | 'low';
}

// 產品組合類型
export interface ProductCombination {
  id: string;
  name: string;
  description: string;
  products: Product[];
  total_price: number;
  discount_total?: number;
  health_needs: string[];
  lifestyle_match: string[];
  budget_tier: 'economy' | 'balanced' | 'premium';
}

// 用藥時間表類型
export interface MedicationSchedule {
  product_id: string;
  product_name: string;
  morning?: boolean;
  noon?: boolean;
  evening?: boolean;
  bedtime?: boolean;
  with_food?: boolean;
  notes?: string;
}

// API 響應類型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 查詢參數類型
export interface SurveyQueryParams {
  healthNeed?: string;
  lifestyle?: string;
  budget?: string;
  frequency?: string;
}

// 健康調查問卷選項
export const healthNeedOptions = [
  { id: 'energy', label: '精力提升' },
  { id: 'sleep', label: '睡眠品質' },
  { id: 'digestion', label: '腸胃健康' },
  { id: 'immunity', label: '免疫力強化' },
  { id: 'joints', label: '關節靈活度' },
  { id: 'heart', label: '心血管健康' },
  { id: 'eyes', label: '眼睛健康' },
  { id: 'stress', label: '壓力管理' },
  { id: 'other', label: '其他' },
];

export const lifestyleOptions = [
  { id: 'office', label: '辦公室工作者' },
  { id: 'active', label: '經常運動' },
  { id: 'travel', label: '經常出差' },
  { id: 'family', label: '照顧家庭' },
  { id: 'student', label: '學生' },
  { id: 'other', label: '其他' },
];

export const budgetOptions = [
  { id: 'economy', label: '經濟型（$500-1000）' },
  { id: 'balanced', label: '平衡型（$1000-2000）' },
  { id: 'premium', label: '完整型（$2000+）' },
];

export const frequencyOptions = [
  { id: 'multiple', label: '願意每日多次服用' },
  { id: 'twice', label: '僅能接受早晚一次' },
  { id: 'simple', label: '希望越簡單越好' },
]; 