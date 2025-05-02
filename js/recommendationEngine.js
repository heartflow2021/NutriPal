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

/**
 * 根據複合健康需求篩選產品
 * @param {Array} products 產品數據陣列
 * @param {Array} healthNeeds 健康需求陣列
 * @param {Object} options 篩選選項
 * @param {boolean} options.matchAll 是否需要滿足所有健康需求，默認false
 * @param {boolean} options.includePartial 是否包含部分匹配，默認true
 * @param {number} options.minMatchScore 最低匹配分數，默認0
 * @returns {Array} 符合健康需求的產品，帶有匹配分數
 */
function filterByMultipleHealthNeeds(products, healthNeeds, options = {}) {
    // 設置默認選項
    const {
        matchAll = false,
        includePartial = true,
        minMatchScore = 0
    } = options;
    
    // 如果沒有提供健康需求或提供的是空陣列，則返回原始產品列表
    if (!healthNeeds || !Array.isArray(healthNeeds) || healthNeeds.length === 0) {
        return products.map(product => ({ ...product, matchScore: 0 }));
    }
    
    // 為每個產品計算匹配分數
    const scoredProducts = products.map(product => {
        if (!product.health_needs || !Array.isArray(product.health_needs)) {
            return { ...product, matchScore: 0 };
        }
        
        // 計算匹配的健康需求數量
        const matchedNeeds = healthNeeds.filter(need => 
            product.health_needs.includes(need)
        );
        
        // 計算匹配分數：匹配需求數 / 總需求數
        const matchScore = matchedNeeds.length / healthNeeds.length;
        
        return { ...product, matchScore, matchedNeeds };
    });
    
    // 根據選項篩選產品
    let filteredProducts;
    
    if (matchAll) {
        // 只保留滿足所有健康需求的產品
        filteredProducts = scoredProducts.filter(product => 
            product.matchScore === 1
        );
    } else if (includePartial) {
        // 保留部分匹配的產品，但必須達到最低匹配分數
        filteredProducts = scoredProducts.filter(product => 
            product.matchScore >= minMatchScore
        );
    } else {
        // 只保留至少匹配一個健康需求的產品
        filteredProducts = scoredProducts.filter(product => 
            product.matchScore > 0
        );
    }
    
    // 按匹配分數降序排序
    return filteredProducts.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * 根據禁忌成分過濾產品
 * @param {Array} products 產品數據陣列
 * @param {Array} forbiddenIngredients 禁忌成分陣列
 * @returns {Array} 不含禁忌成分的產品
 */
function filterByForbiddenIngredients(products, forbiddenIngredients) {
    if (!forbiddenIngredients || !Array.isArray(forbiddenIngredients) || forbiddenIngredients.length === 0) {
        return products;
    }
    
    return products.filter(product => {
        if (!product.ingredients) return true;
        
        // 將產品成分轉換為小寫，便於比較
        const lowercaseIngredients = product.ingredients.toLowerCase();
        
        // 檢查是否包含任何禁忌成分
        return !forbiddenIngredients.some(ingredient => 
            lowercaseIngredients.includes(ingredient.toLowerCase())
        );
    });
}

/**
 * 根據季節調整產品推薦權重
 * @param {Array} products 產品數據陣列
 * @param {string} season 當前季節 ('spring', 'summer', 'autumn', 'winter')
 * @returns {Array} 帶有季節調整權重的產品
 */
function adjustBySeasonality(products, season) {
    const seasonalWeights = {
        spring: {
            '增強免疫力': 1.2,
            '消化系統保健': 1.3,
            '過敏緩解': 1.5,
            '肝臟保健': 1.4,
            '女性保健': 1.2
        },
        summer: {
            '消化系統保健': 1.3,
            '電解質平衡': 1.4,
            '皮膚保健': 1.5,
            '視力保健': 1.2,
            '體重管理': 1.3
        },
        autumn: {
            '增強免疫力': 1.4,
            '骨骼與關節健康': 1.2,
            '呼吸系統保健': 1.3,
            '情緒平衡': 1.2,
            '睡眠品質': 1.1
        },
        winter: {
            '增強免疫力': 1.5,
            '心臟健康': 1.2,
            '關節保健': 1.3,
            '改善睡眠品質': 1.3,
            '情緒支持': 1.4
        }
    };
    
    // 如果沒有提供有效季節或沒有該季節的權重配置，直接返回原始產品
    if (!season || !seasonalWeights[season]) {
        return products;
    }
    
    const currentSeasonWeights = seasonalWeights[season];
    
    return products.map(product => {
        // 默認季節權重為1.0
        let seasonalWeight = 1.0;
        
        // 如果產品有健康需求標籤，計算季節相關性
        if (product.health_needs && Array.isArray(product.health_needs)) {
            for (const need of product.health_needs) {
                if (currentSeasonWeights[need]) {
                    // 使用最高的季節權重
                    seasonalWeight = Math.max(seasonalWeight, currentSeasonWeights[need]);
                }
            }
        }
        
        return { ...product, seasonalWeight };
    });
}

/**
 * 增強型推薦主函數 - 支持多種高級篩選和排序功能
 * @param {Object} params 推薦參數對象
 * @param {string|Array} params.healthNeeds 健康需求或健康需求陣列
 * @param {string} params.lifestyle 生活型態
 * @param {number} params.budget 預算上限
 * @param {Array} params.forbiddenIngredients 禁忌成分陣列
 * @param {string} params.season 當前季節
 * @param {string} params.ageGroup 年齡組別 ('child', 'adult', 'senior')
 * @param {Object} params.sortCriteria 排序標準和權重
 * @param {number} params.resultCount 結果數量
 * @returns {Promise<Array>} 推薦的產品
 */
async function advancedRecommendProducts(params) {
    try {
        const {
            healthNeeds,
            lifestyle,
            budget = 0,
            forbiddenIngredients = [],
            season = null,
            ageGroup = 'adult',
            sortCriteria = {},
            resultCount = 3
        } = params;
        
        console.log('開始進階推薦，參數:', params);
        
        // 1. 獲取所有產品
        const allProducts = await getProducts();
        
        // 2. 按健康需求篩選
        let filteredProducts;
        
        // 處理單一健康需求或多個健康需求
        if (typeof healthNeeds === 'string') {
            // 單一健康需求
            filteredProducts = filterByHealthNeed(allProducts, healthNeeds);
        } else if (Array.isArray(healthNeeds)) {
            // 多個健康需求
            filteredProducts = filterByMultipleHealthNeeds(allProducts, healthNeeds, {
                matchAll: false,
                includePartial: true,
                minMatchScore: 0.5 // 至少需要匹配一半的健康需求
            });
        } else {
            // 沒有指定健康需求
            filteredProducts = allProducts;
        }
        
        // 3. 排除禁忌成分
        if (forbiddenIngredients.length > 0) {
            filteredProducts = filterByForbiddenIngredients(filteredProducts, forbiddenIngredients);
        }
        
        // 4. 按生活型態篩選
        if (lifestyle) {
            filteredProducts = filterByLifestyle(filteredProducts, lifestyle);
        }
        
        // 5. 季節性調整
        if (season) {
            filteredProducts = adjustBySeasonality(filteredProducts, season);
            
            // 更新排序標準，考慮季節權重
            sortCriteria.seasonalWeight = sortCriteria.seasonalWeight || 0.2;
        }
        
        // 6. 根據預算篩選
        let budgetFilteredProducts = filteredProducts;
        if (budget > 0) {
            budgetFilteredProducts = filteredProducts.filter(product => product.price <= budget);
            
            // 如果按預算篩選後沒有產品，放寬條件，允許略微超出預算
            if (budgetFilteredProducts.length === 0) {
                const flexibleBudget = budget * 1.2; // 允許超出20%
                budgetFilteredProducts = filteredProducts.filter(product => product.price <= flexibleBudget);
            }
        }
        
        // 如果沒有符合預算的產品，使用原始篩選結果
        if (budgetFilteredProducts.length === 0) {
            budgetFilteredProducts = filteredProducts;
        }
        
        // 7. 排序產品 - 使用增強的排序標準
        const sortedProducts = enhancedSortProducts(budgetFilteredProducts, sortCriteria);
        
        // 8. 獲取最佳組合
        const recommendations = getBestCombination(sortedProducts, resultCount);
        
        console.log(`推薦完成，找到 ${recommendations.length} 個產品`);
        return recommendations;
    } catch (error) {
        console.error('高級推薦過程出錯:', error);
        return [];
    }
}

/**
 * 增強型產品排序 - 支持更多排序標準和權重
 * @param {Array} products 產品陣列
 * @param {Object} criteria 排序標準和權重
 * @returns {Array} 排序後的產品
 */
function enhancedSortProducts(products, criteria = {}) {
    const {
        ratingWeight = 0.3,       // 評分權重
        priceWeight = 0.2,        // 價格權重
        relevanceWeight = 0.4,    // 相關性權重（如果產品帶有matchScore）
        seasonalWeight = 0.0,     // 季節性權重（如果產品帶有seasonalWeight）
        popularityWeight = 0.1    // 熱門度權重（未來可以添加）
    } = criteria;
    
    return [...products].sort((a, b) => {
        // 計算多維度的總分
        let scoreA = 0;
        let scoreB = 0;
        
        // 評分維度（0-5分轉換為0-1的比例）
        const ratingA = a.rating !== undefined ? a.rating / 5 : 0.5;
        const ratingB = b.rating !== undefined ? b.rating / 5 : 0.5;
        scoreA += ratingA * ratingWeight;
        scoreB += ratingB * ratingWeight;
        
        // 價格維度（越便宜越好，使用倒數）
        if (a.price && b.price) {
            const maxPrice = Math.max(a.price, b.price);
            const priceScoreA = 1 - (a.price / maxPrice);
            const priceScoreB = 1 - (b.price / maxPrice);
            scoreA += priceScoreA * priceWeight;
            scoreB += priceScoreB * priceWeight;
        }
        
        // 相關性維度（如果有matchScore）
        if (a.matchScore !== undefined && b.matchScore !== undefined) {
            scoreA += a.matchScore * relevanceWeight;
            scoreB += b.matchScore * relevanceWeight;
        }
        
        // 季節性維度（如果有seasonalWeight）
        if (a.seasonalWeight !== undefined && b.seasonalWeight !== undefined) {
            scoreA += a.seasonalWeight * seasonalWeight;
            scoreB += b.seasonalWeight * seasonalWeight;
        }
        
        // 返回總分差，得分高的排前面
        return scoreB - scoreA;
    });
}

// 更新導出模組功能，添加新函數
window.NutriPalRecommender = {
    recommendProducts,
    getRelatedProducts,
    recommendWithinBudget,
    getPopularByCategory,
    advancedRecommendProducts,
    filterByMultipleHealthNeeds,
    filterByForbiddenIngredients,
    adjustBySeasonality,
    enhancedSortProducts
}; 