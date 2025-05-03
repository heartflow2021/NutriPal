/**
 * ProductExample.js
 * 展示如何使用 Product 類的示例文件
 */

import Product from './Product.js';

// 示例：如何載入產品數據
async function loadProducts() {
  try {
    const response = await fetch('/data/products/products.json');
    const data = await response.json();
    
    // 將所有產品數據轉換為 Product 實例
    const products = Product.fromArray(data.products);
    console.log(`成功載入 ${products.length} 個產品`);
    return products;
  } catch (error) {
    console.error('載入產品數據時出錯：', error);
    return [];
  }
}

// 示例：基於健康需求篩選產品
function filterByHealthNeed(products, healthNeed) {
  return products.filter(product => product.supportsHealthNeed(healthNeed));
}

// 示例：基於預算範圍篩選產品
function filterByBudgetRange(products, minPrice, maxPrice) {
  return products.filter(product => product.isInPriceRange(minPrice, maxPrice));
}

// 示例：基於成分篩選產品
function filterByIngredient(products, ingredient) {
  return products.filter(product => product.containsIngredient(ingredient));
}

// 示例：尋找相似產品
function findSimilarProducts(products, targetProduct, limit = 5) {
  // 計算所有產品與目標產品的相似度
  const productsWithSimilarity = products
    .filter(product => product.id !== targetProduct.id) // 排除目標產品自身
    .map(product => ({
      product,
      similarity: product.calculateSimilarityScore(targetProduct)
    }));
  
  // 根據相似度排序並返回前 N 個結果
  return productsWithSimilarity
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(item => item.product);
}

// 示例：產品使用案例
async function showProductUsageExample() {
  // 1. 載入產品資料
  const products = await loadProducts();
  if (products.length === 0) return;
  
  // 2. 篩選支持免疫系統的產品
  const immuneProducts = filterByHealthNeed(products, '增強免疫力');
  console.log(`找到 ${immuneProducts.length} 個支持免疫系統的產品`);
  
  // 3. 在免疫產品中篩選預算範圍內的產品
  const affordableImmuneProducts = filterByBudgetRange(immuneProducts, 0, 500);
  console.log(`找到 ${affordableImmuneProducts.length} 個價格在 0-500 範圍內的免疫產品`);
  
  // 4. 查找含有維生素 C 的產品
  const vitaminCProducts = filterByIngredient(products, '維生素 C');
  console.log(`找到 ${vitaminCProducts.length} 個含有維生素 C 的產品`);
  
  // 5. 顯示第一個產品的詳細資訊
  if (products.length > 0) {
    const firstProduct = products[0];
    console.log('產品詳細資訊：', firstProduct.toJSON());
    
    // 6. 顯示與第一個產品相似的產品
    const similarProducts = findSimilarProducts(products, firstProduct, 3);
    console.log('相似產品：', similarProducts.map(p => p.name));
  }
}

// 導出示例函數
export {
  loadProducts,
  filterByHealthNeed,
  filterByBudgetRange,
  filterByIngredient,
  findSimilarProducts,
  showProductUsageExample
}; 