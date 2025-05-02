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
        console.log('使用緩存的產品數據');
        return productsCache;
    }
    
    console.log('開始加載產品數據...');
    try {
        // 嘗試多種路徑格式來適應不同的部署環境
        const possiblePaths = [
            'data/products/products.json',  // 相對於當前頁面的路徑
            '/data/products/products.json', // 相對於網站根目錄的路徑
            './data/products/products.json', // 明確的相對路徑
            '../data/products/products.json' // 上一級目錄
        ];
        
        let response = null;
        let error = null;
        
        // 嘗試每個可能的路徑
        for (const path of possiblePaths) {
            try {
                console.log(`嘗試從 ${path} 加載數據...`);
                const resp = await fetch(path);
                if (resp.ok) {
                    response = resp;
                    console.log(`成功從 ${path} 加載數據`);
                    break;
                }
            } catch (e) {
                error = e;
                console.warn(`從 ${path} 加載失敗:`, e);
                continue;
            }
        }
        
        // 如果所有路徑都失敗
        if (!response) {
            throw error || new Error('所有路徑加載失敗');
        }
        
        const data = await response.json();
        
        // 添加數據驗證
        if (!data || !data.products || !Array.isArray(data.products)) {
            console.error('產品數據格式不正確:', data);
            // 返回一些默認產品，以便系統繼續運行
            return getFallbackProducts();
        }
        
        console.log(`成功加載 ${data.products.length} 個產品`);
        productsCache = data.products;
        return productsCache;
    } catch (error) {
        console.error('加載產品數據時出錯:', error);
        // 在出錯時返回一些默認產品
        return getFallbackProducts();
    }
}

/**
 * 提供默認產品數據，當API請求失敗時使用
 * @returns {Array} 默認產品數據
 */
function getFallbackProducts() {
    console.log('使用備用產品數據');
    return [
        {
            id: "fallback1",
            name: "維生素D3滴劑",
            brand: "健康品牌",
            description: "維生素D3對於骨骼健康、免疫系統功能和情緒調節至關重要。",
            price: 280,
            rating: 4.8,
            image_url: "https://via.placeholder.com/150",
            benefits: ["增強免疫力", "促進鈣吸收", "維持骨骼健康"],
            usage: "每日1滴，可與食物一起服用",
            caution: "請勿超過建議劑量",
            ingredients: "MCT油、維生素D3",
            health_needs: ["增強免疫力", "骨骼與關節健康"],
            lifestyle_match: ["久坐少動", "長時間工作"]
        },
        {
            id: "fallback2",
            name: "綜合維他命B群",
            brand: "營養選擇",
            description: "全面的B族維生素配方，支持能量產生和壓力管理。",
            price: 520,
            rating: 4.7,
            image_url: "https://via.placeholder.com/150",
            benefits: ["提升能量", "支持神經系統", "改善壓力應對"],
            usage: "每日1粒，早餐時服用",
            caution: "可能使尿液變成亮黃色，屬正常現象",
            ingredients: "維生素B1、B2、B3、B5、B6、B7、B9、B12",
            health_needs: ["提升腦力與專注", "增強免疫力"],
            lifestyle_match: ["壓力大", "長時間工作"]
        },
        {
            id: "fallback3",
            name: "褪黑激素3mg",
            brand: "睡眠專家",
            description: "促進自然睡眠的褪黑激素補充劑，改善入睡時間和睡眠品質。",
            price: 350,
            rating: 4.6,
            image_url: "https://via.placeholder.com/150",
            benefits: ["改善睡眠質量", "縮短入睡時間", "調節生理時鐘"],
            usage: "睡前30分鐘服用1粒",
            caution: "白天避免服用，可能導致嗜睡",
            ingredients: "褪黑激素、植物性膠囊",
            health_needs: ["改善睡眠品質"],
            lifestyle_match: ["經常熬夜", "使用電子產品到深夜"]
        }
    ];
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