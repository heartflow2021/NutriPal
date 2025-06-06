/**
 * 健康需求與產品標籤的對應關係表 (修正版本)
 * 用於將用戶選擇的健康需求映射到相關的產品標籤
 * 不使用模組語法，確保與非模組環境兼容
 */

// 全域變數 healthNeedsMapping
window.healthNeedsMapping = {
  // 免疫系統相關
  '免疫系統知識': ['免疫系統', '免疫', '抗氧化', '維生素C', '維生素D', '益生菌', '蜂膠', '抗菌營養素'],
  
  // 骨骼與關節健康
  '骨骼與關節知識': ['骨骼健康', '關節健康', '維生素D', '鈣', '膠原蛋白', '葡萄糖胺', '軟骨素', '姜黃素', '關節營養素', '骨質營養', 'MSM'],
  
  // 心臟健康 
  '心血管系統知識': ['心臟健康', '心血管健康', '魚油', 'Omega-3', '輔酶Q10', '血壓健康', '膽固醇', '血液循環'],
  
  // 腦部與認知
  '大腦與認知知識': ['腦部功能', '認知健康', '專注力', '記憶力', 'Omega-3', '銀杏', '輔酶Q10', 'DHA', 'EPA'],
  
  // 視力保健
  '眼睛保健知識': ['視力保健', '眼睛健康', '葉黃素', '玉米黃質', '藍莓萃取物', '抗氧化', '視網膜營養素'],
  
  // 消化系統
  '消化系統知識': ['消化健康', '腸道健康', '益生菌', '益生元', '酵素', '腸胃營養素', '膳食纖維'],
  
  // 肝臟健康
  '肝臟保健知識': ['肝臟健康', '肝臟營養素', '奶薊', '薑黃', '蒲公英', '肝臟代謝'],
  
  // 睡眠品質
  '睡眠相關知識': ['睡眠品質', '褪黑激素', '鎂', 'GABA', '纈草根', '放鬆', '睡眠營養素'],
  
  // 女性健康
  '女性健康知識': ['女性健康', '荷爾蒙平衡', '經期營養素', '更年期知識', '黑升麻', '葉酸', '鐵', '大豆異黃酮'],
  
  // 男性健康
  '男性健康知識': ['男性健康', '前列腺健康', '鋅', '鋸棕櫚', '女貞子', '精氨酸', '睪固酮'],
  
  // 體重管理
  '體重管理知識': ['體重管理', '代謝知識', '新陳代謝', '脂肪代謝', '飽足感', '代餐', '血糖平衡', '魔芋', '咖啡綠原酸'],
  
  // 過敏相關
  '過敏相關知識': ['過敏知識', '組織胺', '鼻腔健康', '免疫調節', '蜂膠', '槲皮素'],
  
  // 皮膚、頭髮和指甲
  '皮膚與頭髮知識': ['膠原蛋白', '生物素', '維生素E', '抗氧化', '透明質酸', '皮膚營養素', '頭髮營養素', '指甲健康'],
  
  // 關節健康
  '關節與韌帶知識': ['葡萄糖胺', '軟骨素', 'MSM', '薑黃素', '骨膠原', '關節健康', '韌帶支持', '關節營養素'],
  
  // 壓力與放鬆
  '壓力與放鬆知識': ['放鬆', '壓力營養素', '甘草酸', '蛋白腖', 'GABA', '精神支持', '情緒平衡', '舒緩營養素'],
  
  // 能量與運動表現
  '能量與運動知識': ['能量營養素', '耐力', '運動營養', '肌肉修復', '肌肉合成', '肌酸', '支鏈氨基酸', '運動營養素', '運動後營養'],
  
  // 基礎營養
  '基礎營養知識': ['綜合維生素', '維生素', '礦物質', '多種營養素', '基礎營養', '日常保健']
};

// 全域函數 getTagsForHealthNeed
window.getTagsForHealthNeed = function(healthNeed) {
  if (!healthNeed) {
    console.warn('getTagsForHealthNeed: 未提供健康需求參數');
    return [];
  }
  
  const tags = window.healthNeedsMapping[healthNeed];
  if (!tags) {
    console.warn(`getTagsForHealthNeed: 找不到健康需求 "${healthNeed}" 的相關標籤`);
    return [];
  }
  
  console.log(`getTagsForHealthNeed: 為 "${healthNeed}" 找到 ${tags.length} 個相關標籤`);
  return tags;
};

// 為了支持關鍵字匹配，提供一個搜索所有標籤的函數
window.getAllHealthNeedsTags = function() {
  const allTags = new Set();
  
  // 遍歷所有健康需求的標籤
  Object.values(window.healthNeedsMapping).forEach(tags => {
    tags.forEach(tag => allTags.add(tag));
  });
  
  return Array.from(allTags);
};

/**
 * 獲取所有支援的健康需求列表
 * @return {Array} 健康需求陣列
 */
window.getAllHealthNeeds = function() {
  return Object.keys(window.healthNeedsMapping);
};

/**
 * 檢查產品是否與特定健康需求相關
 * @param {Object} product - 產品對象
 * @param {String} healthNeed - 健康需求
 * @return {Boolean} 是否相關
 */
window.isProductRelevantToHealthNeed = function(product, healthNeed) {
  if (!product || !product.tags || !product.health_needs) {
    return false;
  }
  
  // 直接檢查產品的health_needs是否包含該健康需求
  if (product.health_needs.includes(healthNeed)) {
    return true;
  }
  
  // 檢查產品的標籤是否與該健康需求的相關標籤匹配
  const relevantTags = window.healthNeedsMapping[healthNeed] || [];
  return product.tags.some(tag => relevantTags.includes(tag));
}; 