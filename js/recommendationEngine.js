/**
 * NutriPal 保健品推薦引擎
 * 基於用戶的健康需求和生活型態，推薦最適合的保健品組合
 */

// 產品數據緩存
let productsCache = null;

/**
 * 獲取產品數據
 * @returns {Promise<Array>} 產品數據陣列
 */
async function getProducts() {
    if (productsCache) {
        return productsCache;
    }
    
    try {
        const response = await fetch('data/products/products.json');
        const data = await response.json();
        productsCache = data.products;
        return productsCache;
    } catch (error) {
        console.error('無法加載產品數據:', error);
        return [];
    }
}

/**
 * 根據健康需求篩選產品
 * @param {Array} products 產品數據陣列
 * @param {string} healthNeed 健康需求
 * @returns {Array} 符合健康需求的產品
 */
function filterByHealthNeed(products, healthNeed) {
    return products.filter(product => 
        product.health_needs && product.health_needs.includes(healthNeed)
    );
}

/**
 * 根據生活型態進一步過濾產品
 * @param {Array} products 產品數據陣列
 * @param {string} lifestyle 生活型態
 * @returns {Array} 符合生活型態的產品
 */
function filterByLifestyle(products, lifestyle) {
    // 如果未指定生活型態，返回原始列表
    if (!lifestyle) return products;
    
    return products.filter(product => 
        product.lifestyle_match && product.lifestyle_match.includes(lifestyle)
    );
}

/**
 * 根據多重標準對產品進行排序
 * @param {Array} products 產品陣列
 * @param {Object} criteria 排序標準和權重
 * @returns {Array} 排序後的產品
 */
function sortProducts(products, criteria = {}) {
    const {
        ratingWeight = 0.5,
        priceWeight = 0.3,
        // 可以添加更多權重，例如熱門程度等
    } = criteria;
    
    return [...products].sort((a, b) => {
        // 根據評分排序（評分越高越好）
        const ratingScore = (b.rating - a.rating) * ratingWeight;
        
        // 根據價格排序（價格越低越好，使用倒數）
        const priceScore = (a.price === b.price) ? 0 : 
            ((a.price > b.price) ? -1 : 1) * priceWeight;
        
        // 總分（可以加入更多維度）
        return ratingScore + priceScore;
    });
}

/**
 * 獲取最適合的產品組合
 * @param {Array} products 排序後的產品
 * @param {number} count 需要的產品數量
 * @returns {Array} 最適合的產品組合
 */
function getBestCombination(products, count = 3) {
    // 確保不超過產品總數
    const actualCount = Math.min(count, products.length);
    return products.slice(0, actualCount);
}

/**
 * 推薦主函數 - 基於用戶輸入推薦產品
 * @param {string} healthNeed 健康需求
 * @param {string} lifestyle 生活型態
 * @param {Object} sortCriteria 排序標準
 * @param {number} resultCount 結果數量
 * @returns {Promise<Array>} 推薦的產品
 */
async function recommendProducts(healthNeed, lifestyle, sortCriteria = {}, resultCount = 3) {
    try {
        // 1. 獲取所有產品
        const allProducts = await getProducts();
        
        // 2. 按健康需求篩選
        const productsByHealth = filterByHealthNeed(allProducts, healthNeed);
        
        // 3. 按生活型態篩選
        const filteredProducts = filterByLifestyle(productsByHealth, lifestyle);
        
        // 4. 排序產品
        const sortedProducts = sortProducts(filteredProducts, sortCriteria);
        
        // 5. 獲取最佳組合
        return getBestCombination(sortedProducts, resultCount);
    } catch (error) {
        console.error('推薦過程出錯:', error);
        return [];
    }
}

/**
 * 獲取相關產品 - 基於已選產品推薦相關產品
 * @param {Object} selectedProduct 已選產品
 * @param {number} count 推薦數量
 * @returns {Promise<Array>} 相關產品
 */
async function getRelatedProducts(selectedProduct, count = 2) {
    try {
        const allProducts = await getProducts();
        
        // 排除已選產品
        const otherProducts = allProducts.filter(p => p.id !== selectedProduct.id);
        
        // 計算相關性分數
        const productsWithScore = otherProducts.map(product => {
            let score = 0;
            
            // 相同健康需求增加分數
            if (product.health_needs && selectedProduct.health_needs) {
                score += product.health_needs.filter(need => 
                    selectedProduct.health_needs.includes(need)
                ).length * 3;
            }
            
            // 相同生活型態增加分數
            if (product.lifestyle_match && selectedProduct.lifestyle_match) {
                score += product.lifestyle_match.filter(style => 
                    selectedProduct.lifestyle_match.includes(style)
                ).length * 2;
            }
            
            // 相同品牌增加分數
            if (product.brand === selectedProduct.brand) {
                score += 1;
            }
            
            return { ...product, relevanceScore: score };
        });
        
        // 按相關性分數排序
        const sortedRelated = productsWithScore.sort((a, b) => 
            b.relevanceScore - a.relevanceScore
        );
        
        return sortedRelated.slice(0, count);
    } catch (error) {
        console.error('獲取相關產品出錯:', error);
        return [];
    }
}

/**
 * 根據預算進行產品推薦
 * @param {string} healthNeed 健康需求
 * @param {string} lifestyle 生活型態
 * @param {number} budget 預算上限
 * @returns {Promise<Array>} 符合預算的產品組合
 */
async function recommendWithinBudget(healthNeed, lifestyle, budget) {
    try {
        // 1. 獲取按健康需求和生活型態篩選的產品
        const allProducts = await getProducts();
        const productsByHealth = filterByHealthNeed(allProducts, healthNeed);
        const filteredProducts = filterByLifestyle(productsByHealth, lifestyle);
        
        // 2. 按價格排序（從低到高）
        const sortedByPrice = [...filteredProducts].sort((a, b) => a.price - b.price);
        
        // 3. 貪婪算法選擇符合預算的產品
        const selectedProducts = [];
        let totalCost = 0;
        
        for (const product of sortedByPrice) {
            if (totalCost + product.price <= budget) {
                selectedProducts.push(product);
                totalCost += product.price;
            }
            
            // 如果已經選了3個產品或者預算已經接近上限，就停止
            if (selectedProducts.length >= 3 || (budget - totalCost) < sortedByPrice[0].price) {
                break;
            }
        }
        
        return selectedProducts;
    } catch (error) {
        console.error('基於預算推薦出錯:', error);
        return [];
    }
}

/**
 * 按類別獲取熱門產品
 * @param {string} category 健康類別
 * @param {number} count 產品數量
 * @returns {Promise<Array>} 熱門產品
 */
async function getPopularByCategory(category, count = 5) {
    try {
        const allProducts = await getProducts();
        
        // 按類別篩選
        const categoryProducts = filterByHealthNeed(allProducts, category);
        
        // 按評分排序
        const sortedProducts = [...categoryProducts].sort((a, b) => b.rating - a.rating);
        
        return sortedProducts.slice(0, count);
    } catch (error) {
        console.error('獲取熱門產品出錯:', error);
        return [];
    }
}

// 導出模組功能
window.NutriPalRecommender = {
    recommendProducts,
    getRelatedProducts,
    recommendWithinBudget,
    getPopularByCategory
}; 