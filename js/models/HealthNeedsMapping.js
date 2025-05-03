/**
 * 健康需求與產品標籤的對應關係表
 * 用於將用戶選擇的健康需求映射到相關的產品標籤
 */

export const healthNeedsMapping = {
  // 免疫系統相關
  '增強免疫力': ['增強免疫力', '免疫', '抗氧化', '維生素C', '維生素D', '益生菌', '蜂膠', '抗菌抗病毒'],
  
  // 骨骼與關節健康
  '骨骼與關節健康': ['骨骼健康', '關節健康', '維生素D', '鈣', '膠原蛋白', '葡萄糖胺', '軟骨素', '姜黃素', '關節不適', '骨質疏鬆', 'MSM'],
  
  // 心臟健康 
  '心臟健康': ['心臟健康', '心血管健康', '魚油', 'Omega-3', '輔酶Q10', '血壓健康', '膽固醇', '血液循環'],
  
  // 腦部與認知
  '提升腦力與專注': ['腦部功能', '認知健康', '專注力', '記憶力', 'Omega-3', '銀杏', '輔酶Q10', 'DHA', 'EPA'],
  
  // 視力保健
  '視力保健': ['視力保健', '眼睛健康', '葉黃素', '玉米黃質', '藍莓萃取物', '抗氧化', '保護視網膜'],
  
  // 消化系統
  '消化系統保健': ['消化健康', '腸道健康', '益生菌', '益生元', '酵素', '腸胃舒適', '膳食纖維'],
  
  // 肝臟健康
  '肝臟保健': ['肝臟健康', '肝臟解毒', '奶薊', '薑黃', '蒲公英', '解毒'],
  
  // 睡眠品質
  '改善睡眠品質': ['睡眠品質', '褪黑激素', '鎂', 'GABA', '纈草根', '放鬆', '助眠'],
  
  // 女性健康
  '女性保健': ['女性健康', '荷爾蒙平衡', '經期不適', '更年期', '黑升麻', '葉酸', '鐵', '鈣'],
  
  // 男性健康
  '男性保健': ['男性健康', '前列腺健康', '鋸棕櫚', '精胺酸', '鋅', '睪固酮平衡'],
  
  // 皮膚、頭髮和指甲
  '美容保養': ['皮膚健康', '頭髮健康', '指甲健康', '膠原蛋白', '生物素', '維生素E', '透明質酸', '抗氧化']
};

/**
 * 獲取與健康需求相關的產品標籤
 * @param {String} healthNeed - 健康需求
 * @return {Array} 相關產品標籤陣列
 */
export function getTagsForHealthNeed(healthNeed) {
  return healthNeedsMapping[healthNeed] || [];
}

/**
 * 獲取所有支援的健康需求列表
 * @return {Array} 健康需求陣列
 */
export function getAllHealthNeeds() {
  return Object.keys(healthNeedsMapping);
}

/**
 * 檢查產品是否與特定健康需求相關
 * @param {Object} product - 產品對象
 * @param {String} healthNeed - 健康需求
 * @return {Boolean} 是否相關
 */
export function isProductRelevantToHealthNeed(product, healthNeed) {
  if (!product || !product.tags || !product.health_needs) {
    return false;
  }
  
  // 直接檢查產品的health_needs是否包含該健康需求
  if (product.health_needs.includes(healthNeed)) {
    return true;
  }
  
  // 檢查產品的標籤是否與該健康需求的相關標籤匹配
  const relevantTags = healthNeedsMapping[healthNeed] || [];
  return product.tags.some(tag => relevantTags.includes(tag));
} 