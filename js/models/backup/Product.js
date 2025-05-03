/**
 * Product.js 
 * 標準化產品資料模型，用於 NutriPal 應用程式
 */

class Product {
  /**
   * 建立新的 Product 實例
   * @param {Object} productData - 原始產品資料
   */
  constructor(productData) {
    // 必要屬性
    this.id = productData.id || '';
    this.name = productData.name || '';
    this.brand = productData.brand || '';
    this.description = productData.description || '';
    this.price = productData.price || 0;
    this.image_url = productData.image_url || '';
    
    // 價格相關屬性
    this.original_price = productData.original_price || this.price;
    this.discount_percentage = productData.discount_percentage || 0;
    
    // 評價相關屬性
    this.rating = productData.rating || 0;
    this.review_count = productData.review_count || 0;
    
    // 產品詳細資訊
    this.benefits = productData.benefits || [];
    this.usage = productData.usage || '';
    this.caution = productData.caution || '';
    this.ingredients = productData.ingredients || '';
    this.supplement_facts = productData.supplement_facts || {};
    
    // 分類與標籤
    this.health_needs = productData.health_needs || [];
    this.tags = productData.tags || [];
    
    // 外部連結
    this.iherb_link = productData.iherb_link || '';
  }

  /**
   * 獲取產品折扣金額
   * @return {number} 折扣金額
   */
  getDiscountAmount() {
    return this.original_price - this.price;
  }

  /**
   * 檢查產品是否支援特定健康需求
   * @param {string} healthNeed - 健康需求名稱
   * @return {boolean} 是否支援該健康需求
   */
  supportsHealthNeed(healthNeed) {
    return this.health_needs.includes(healthNeed);
  }

  /**
   * 檢查產品是否含有特定標籤
   * @param {string} tag - 標籤名稱
   * @return {boolean} 是否含有該標籤
   */
  hasTag(tag) {
    return this.tags.includes(tag);
  }

  /**
   * 檢查產品是否含有特定成分
   * @param {string} ingredient - 成分名稱
   * @return {boolean} 是否含有該成分
   */
  containsIngredient(ingredient) {
    return this.ingredients.toLowerCase().includes(ingredient.toLowerCase());
  }

  /**
   * 檢查產品是否在特定價格範圍內
   * @param {number} minPrice - 最低價格
   * @param {number} maxPrice - 最高價格
   * @return {boolean} 是否在價格範圍內
   */
  isInPriceRange(minPrice, maxPrice) {
    return this.price >= minPrice && this.price <= maxPrice;
  }

  /**
   * 計算與另一產品的相似度分數
   * @param {Product} otherProduct - 要比較的另一產品
   * @return {number} 相似度分數 (0-1)
   */
  calculateSimilarityScore(otherProduct) {
    let score = 0;
    let factors = 0;
    
    // 計算相同健康需求的數量
    const commonHealthNeeds = this.health_needs.filter(need => 
      otherProduct.health_needs.includes(need)
    );
    
    if (this.health_needs.length > 0 && otherProduct.health_needs.length > 0) {
      score += commonHealthNeeds.length / Math.max(this.health_needs.length, otherProduct.health_needs.length);
      factors++;
    }
    
    // 計算相同標籤的數量
    const commonTags = this.tags.filter(tag => 
      otherProduct.tags.includes(tag)
    );
    
    if (this.tags.length > 0 && otherProduct.tags.length > 0) {
      score += commonTags.length / Math.max(this.tags.length, otherProduct.tags.length);
      factors++;
    }
    
    // 比較品牌相似度
    if (this.brand && otherProduct.brand) {
      score += this.brand === otherProduct.brand ? 1 : 0;
      factors++;
    }
    
    // 避免除以零
    return factors > 0 ? score / factors : 0;
  }

  /**
   * 將產品轉換為 JSON 格式
   * @return {Object} JSON 格式的產品資料
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      brand: this.brand,
      description: this.description,
      price: this.price,
      original_price: this.original_price,
      discount_percentage: this.discount_percentage,
      rating: this.rating,
      review_count: this.review_count,
      image_url: this.image_url,
      benefits: this.benefits,
      usage: this.usage,
      caution: this.caution,
      ingredients: this.ingredients,
      supplement_facts: this.supplement_facts,
      health_needs: this.health_needs,
      tags: this.tags,
      iherb_link: this.iherb_link
    };
  }

  /**
   * 從 JSON 資料創建 Product 物件
   * @param {Object} json - JSON 格式的產品資料
   * @return {Product} 產品實例
   */
  static fromJSON(json) {
    return new Product(json);
  }

  /**
   * 從產品數組創建 Product 物件數組
   * @param {Array} productsArray - 產品資料數組
   * @return {Array<Product>} Product 實例數組
   */
  static fromArray(productsArray) {
    return productsArray.map(productData => new Product(productData));
  }
}

// 導出 Product 類以供其他模組使用
export default Product; 