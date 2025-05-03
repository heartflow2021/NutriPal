/**
 * filterByHealthNeed 函數的測試文件
 * 
 * 測試類型：
 * 1. 單元測試：使用模擬產品資料測試篩選結果
 * 2. 邊界測試：測試空產品列表、無匹配項、健康需求不存在等情況
 * 3. 整合測試：測試與其他推薦函數的組合使用
 */

// 導入要測試的函數
// 注意：在實際運行測試時，請根據項目結構調整導入路徑
// import { filterByHealthNeed } from '../recommendationEngine.js';

// 模擬產品數據
const mockProducts = [
    {
        id: "p001",
        name: "維生素D3滴劑",
        brand: "California Gold Nutrition",
        description: "維生素D3對於骨骼健康、免疫系統功能和情緒調節至關重要。",
        price: 280,
        rating: 4.8,
        tags: ["維生素D", "骨骼健康", "免疫"],
        benefits: ["增強免疫力", "促進鈣吸收", "維持骨骼健康"],
        health_needs: ["增強免疫力", "骨骼與關節健康"]
    },
    {
        id: "p002",
        name: "魚油軟膠囊1000mg",
        brand: "Now Foods",
        description: "高品質魚油補充劑，含豐富的EPA和DHA，有助於心血管健康、大腦功能和減輕發炎反應。",
        price: 650,
        rating: 4.7,
        tags: ["魚油", "Omega-3", "心臟健康", "腦部功能"],
        benefits: ["促進心臟健康", "支持腦部功能", "減輕發炎反應"],
        health_needs: ["心臟健康", "提升腦力與專注", "骨骼與關節健康"]
    },
    {
        id: "p003",
        name: "褪黑激素3mg",
        brand: "Life Extension",
        description: "促進自然睡眠的褪黑激素補充劑，改善入睡時間和睡眠品質。",
        price: 350,
        rating: 4.6,
        tags: ["褪黑激素", "睡眠品質", "助眠"],
        benefits: ["改善睡眠質量", "縮短入睡時間", "調節生理時鐘"],
        health_needs: ["改善睡眠品質"]
    },
    {
        id: "p004",
        name: "綜合維他命B群",
        brand: "Thorne Research",
        description: "全面的B族維生素配方，支持能量產生、神經系統健康和壓力管理。",
        price: 520,
        rating: 4.7,
        tags: ["維生素B群", "能量", "神經系統"],
        benefits: ["提升能量", "支持神經系統", "改善壓力應對"],
        health_needs: ["提升腦力與專注", "增強免疫力"]
    }
];

// 空產品列表
const emptyProducts = [];

// 無相關健康需求的產品列表
const irrelevantProducts = [
    {
        id: "p999",
        name: "不相關產品",
        description: "這個產品與任何健康需求都無關",
        price: 100,
        rating: 3.0,
        tags: ["其他"],
        health_needs: ["未分類"]
    }
];

/**
 * 單元測試：測試基本篩選功能
 */
function testBasicFiltering() {
    console.log("=== 測試基本篩選功能 ===");
    
    // 測試單一健康需求篩選
    const result1 = filterByHealthNeed(mockProducts, "增強免疫力");
    console.log(`健康需求「增強免疫力」找到 ${result1.length} 個產品:`);
    result1.forEach(p => console.log(` - ${p.name} (相關度: ${p.relevanceScore.toFixed(2)})`));
    
    // 檢查結果是否包含相關產品
    const hasVitaminD = result1.some(p => p.id === "p001");
    const hasVitaminB = result1.some(p => p.id === "p004");
    console.log(`結果包含維生素D3: ${hasVitaminD}`);
    console.log(`結果包含維生素B群: ${hasVitaminB}`);
    
    // 檢查相關度排序
    const isCorrectlySorted = result1.every((item, i) => 
        i === 0 || item.relevanceScore <= result1[i-1].relevanceScore
    );
    console.log(`結果按相關度正確排序: ${isCorrectlySorted}`);
    
    console.log("");
}

/**
 * 測試多健康需求篩選
 */
function testMultipleNeeds() {
    console.log("=== 測試多健康需求篩選 ===");
    
    // 測試多個健康需求篩選
    const result = filterByHealthNeed(mockProducts, ["骨骼與關節健康", "心臟健康"]);
    console.log(`健康需求「骨骼與關節健康+心臟健康」找到 ${result.length} 個產品:`);
    result.forEach(p => console.log(` - ${p.name} (相關度: ${p.relevanceScore.toFixed(2)})`));
    
    // 檢查是否包含魚油（同時滿足兩個需求）
    const hasFishOil = result.some(p => p.id === "p002");
    console.log(`結果包含魚油: ${hasFishOil}`);
    
    // 如果魚油在結果中，檢查它是否排在前面（應該有較高的相關度）
    if (hasFishOil) {
        const fishOilIndex = result.findIndex(p => p.id === "p002");
        console.log(`魚油的排名: ${fishOilIndex + 1}/${result.length}`);
    }
    
    console.log("");
}

/**
 * 邊界測試：測試特殊情況
 */
function testEdgeCases() {
    console.log("=== 測試邊界情況 ===");
    
    // 測試空產品列表
    const result1 = filterByHealthNeed(emptyProducts, "增強免疫力");
    console.log(`空產品列表測試: 返回 ${result1.length} 個結果`);
    
    // 測試不存在的健康需求
    const result2 = filterByHealthNeed(mockProducts, "不存在的健康需求");
    console.log(`不存在健康需求測試: 返回 ${result2.length} 個結果`);
    
    // 測試無相關產品
    const result3 = filterByHealthNeed(irrelevantProducts, "增強免疫力");
    console.log(`無相關產品測試: 返回 ${result3.length} 個結果`);
    
    // 測試null健康需求
    const result4 = filterByHealthNeed(mockProducts, null);
    console.log(`Null健康需求測試: 返回 ${result4.length} 個結果`);
    
    // 測試空健康需求陣列
    const result5 = filterByHealthNeed(mockProducts, []);
    console.log(`空健康需求陣列測試: 返回 ${result5.length} 個結果`);
    
    console.log("");
}

/**
 * 測試結果數量限制和閾值篩選
 */
function testOptionsParameters() {
    console.log("=== 測試可選參數 ===");
    
    // 測試maxResults參數
    const result1 = filterByHealthNeed(mockProducts, "增強免疫力", { maxResults: 1 });
    console.log(`限制結果數量為1: 返回 ${result1.length} 個結果`);
    
    // 測試高閾值（應該減少結果數量）
    const result2 = filterByHealthNeed(mockProducts, "增強免疫力", { scoreThreshold: 0.8 });
    console.log(`高閾值測試(0.8): 返回 ${result2.length} 個結果`);
    
    // 測試低閾值（應該增加結果數量）
    const result3 = filterByHealthNeed(mockProducts, "增強免疫力", { scoreThreshold: 0.1 });
    console.log(`低閾值測試(0.1): 返回 ${result3.length} 個結果`);
    
    console.log("");
}

/**
 * 整合測試：與其他函數結合使用
 */
function testIntegration() {
    console.log("=== 測試與其他函數的整合 ===");
    
    // 首先按健康需求篩選
    const healthNeedFiltered = filterByHealthNeed(mockProducts, "增強免疫力");
    console.log(`健康需求篩選後: ${healthNeedFiltered.length} 個結果`);
    
    // 模擬filterByLifestyle函數（簡化版）
    function filterByLifestyle(products, lifestyle) {
        if (!lifestyle) return products;
        return products.filter(p => 
            p.lifestyle_match && p.lifestyle_match.includes(lifestyle)
        );
    }
    
    // 模擬排序函數（簡化版）
    function sortProducts(products, criteria) {
        return [...products].sort((a, b) => a.price - b.price);
    }
    
    // 然後按生活型態進一步篩選
    const lifestyleFiltered = filterByLifestyle(healthNeedFiltered, "長時間工作");
    console.log(`生活型態篩選後: ${lifestyleFiltered.length} 個結果`);
    
    // 最後按價格排序
    const sorted = sortProducts(lifestyleFiltered);
    console.log(`排序後的產品:`);
    sorted.forEach(p => console.log(` - ${p.name}, 價格: ${p.price}`));
    
    console.log("");
}

/**
 * 運行所有測試
 */
function runAllTests() {
    // 在這裡實現filterByHealthNeed函數的簡化版本，用於測試
    // 在實際環境中，應該導入真正的函數
    function filterByHealthNeed(products, healthNeeds, options = {}) {
        const { maxResults = 20, scoreThreshold = 0.2 } = options;
        
        if (!products || !products.length) {
            return [];
        }
        
        if (!healthNeeds) {
            return products;
        }
        
        const needsArray = Array.isArray(healthNeeds) ? healthNeeds : [healthNeeds];
        
        if (needsArray.length === 0) {
            return products;
        }
        
        const scoredProducts = products.map(product => {
            let relevanceScore = 0;
            
            // 簡化的評分計算，僅用於測試
            if (product.health_needs) {
                needsArray.forEach(need => {
                    if (product.health_needs.includes(need)) {
                        relevanceScore += 0.5;
                    }
                });
            }
            
            if (product.tags) {
                product.tags.forEach(tag => {
                    if (tag.toLowerCase().includes("免疫") && needsArray.includes("增強免疫力")) {
                        relevanceScore += 0.3;
                    }
                    if (tag.toLowerCase().includes("骨骼") && needsArray.includes("骨骼與關節健康")) {
                        relevanceScore += 0.3;
                    }
                    if (tag.toLowerCase().includes("心臟") && needsArray.includes("心臟健康")) {
                        relevanceScore += 0.3;
                    }
                });
            }
            
            // 應用產品評分加權
            if (product.rating) {
                relevanceScore *= (1 + (product.rating - 3) * 0.1);
            }
            
            return { ...product, relevanceScore };
        });
        
        const filteredProducts = scoredProducts.filter(product => 
            product.relevanceScore >= scoreThreshold
        );
        
        const sortedProducts = filteredProducts.sort((a, b) => 
            b.relevanceScore - a.relevanceScore
        );
        
        return sortedProducts.slice(0, maxResults);
    }
    
    console.log("開始運行 filterByHealthNeed 函數測試");
    console.log("====================================");
    
    testBasicFiltering();
    testMultipleNeeds();
    testEdgeCases();
    testOptionsParameters();
    testIntegration();
    
    console.log("測試完成");
}

// 運行所有測試
runAllTests(); 