/**
 * NutriPal 保健品推薦引擎 (無模組版)
 * 基於用戶的健康需求和生活型態，推薦最適合的保健品組合
 */

// 產品數據緩存
let productsCache = null;

// 全域變數版本，不使用 import/export
// 如果無法通過全域變數獲取，使用備用方法
let backupGetTagsForHealthNeed = function(healthNeed) {
    // 備用映射表
    const backupMapping = {
        '增強免疫力': ['增強免疫力', '免疫', '抗氧化', '維生素C', '維生素D'],
        '骨骼與關節健康': ['骨骼健康', '關節健康', '維生素D', '鈣', '膠原蛋白'],
        '心臟健康': ['心臟健康', '心血管健康', '魚油', 'Omega-3'],
        '改善睡眠品質': ['睡眠品質', '褪黑激素', '鎂', 'GABA', '放鬆', '助眠'],
        '體重管理': ['體重管理', '減重', '新陳代謝', '飽足感'],
    };
    return backupMapping[healthNeed] || [];
};

// 確保 getTagsForHealthNeed 可用
if (typeof window.getTagsForHealthNeed !== 'function') {
    console.warn('使用備用 getTagsForHealthNeed 函數');
    window.getTagsForHealthNeed = backupGetTagsForHealthNeed;
}

/**
 * 生成星級評分 HTML
 * @param {number} rating - 評分 (0-5)
 * @returns {string} 星級評分的 HTML 字符串
 */
function generateRatingStarsHTML(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }
    if (halfStar) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star"></i>';
    }
    
    return starsHtml;
}

/**
 * 創建單個產品卡片的 HTML
 * @param {Object} product - 產品對象
 * @returns {string} 產品卡片的 HTML 字符串
 */
function createProductCardHTML(product) {
    const ratingStars = generateRatingStarsHTML(product.rating || 4.0);
    const benefitBadges = (product.benefits || []).map(benefit => 
        `<span class="badge">${benefit}</span>`
    ).join('');
    
    // 備用圖片 URL
    const fallbackImgUrl = "https://images.pexels.com/photos/4046316/pexels-photo-4046316.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260";
    
    // 確保價格是數字且格式化
    const price = typeof product.price === 'number' ? product.price : 0;

    // 添加 console.log 來調試圖片 URL
    console.log(`[createProductCardHTML] Product: ${product.name}, Image URL: ${product.image_url}`);

    return `
        <div class="product-card">
            <img src="${product.image_url || fallbackImgUrl}" alt="${product.name || '產品圖片'}" 
                 onerror="console.error('Image load error for:', this.src); this.onerror=null; this.src='${fallbackImgUrl}';">
            <div class="product-info">
                <div class="product-header">
                    <div class="product-title-section">
                        <h3 class="product-title">${product.name || '未知產品'}</h3>
                        <p class="product-brand">${product.brand || ''}</p>
                    </div>
                    <div class="product-price-section">
                        <p class="product-price">NT$ ${price}</p>
                        <div class="product-rating">${ratingStars}</div>
                    </div>
                </div>
                <p class="product-description">${product.description || '無產品描述'}</p>
                <div class="product-tags">
                    ${benefitBadges}
                </div>
                <div class="product-action">
                    <a href="${product.iherb_link || 'https://tw.iherb.com'}" target="_blank" class="btn-secondary" style="display: inline-block; text-decoration: none; text-align: center;">查看詳情</a>
                </div>
            </div>
        </div>
    `;
}

/**
 * 獲取產品數據 (修改後：失敗時拋出錯誤)
 * @returns {Promise<Array>} 產品數據陣列
 */
async function getProducts() {
    if (productsCache) {
        console.log('使用緩存的產品數據');
        return productsCache;
    }
    
    console.log('開始加載產品數據...');
    
    // 首先嘗試直接從固定路徑加載
    try {
        console.log('嘗試從固定路徑加載...');
        const resp = await fetch('data/products/products.json', {
            cache: 'no-store', 
            headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (resp.ok) {
            console.log('從固定路徑成功加載數據');
            const data = await resp.json();
            
            if (data && data.products && Array.isArray(data.products)) {
                console.log(`成功加載 ${data.products.length} 個產品`);
                productsCache = data.products;
                return productsCache;
            } else {
                console.warn('固定路徑加載的數據格式不正確');
            }
        } else {
            console.warn(`固定路徑加載失敗: 狀態碼 ${resp.status}`);
        }
    } catch (e) {
        console.warn('從固定路徑加載時發生錯誤:', e.message);
    }
    
    // 如果固定路徑失敗，嘗試其他可能的路徑
    const possiblePaths = [
        './data/products/products.json',
        '../data/products/products.json',
        '../../data/products/products.json',
        '/data/products/products.json',
        'products.json'
    ];
    
    console.log('嘗試其他可能的路徑:', possiblePaths);
    
    for (const path of possiblePaths) {
        try {
            console.log(`嘗試從 ${path} 加載數據...`);
            const resp = await fetch(path, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' }
            });
            
            if (resp.ok) {
                console.log(`從 ${path} 成功加載數據`);
                const data = await resp.json();
                
                if (data && data.products && Array.isArray(data.products)) {
                    console.log(`成功加載 ${data.products.length} 個產品`);
                    productsCache = data.products;
                    return productsCache;
                } else {
                    console.warn(`${path} 加載的數據格式不正確`);
                }
            } else {
                console.warn(`從 ${path} 加載失敗: 狀態碼 ${resp.status}`);
            }
        } catch (e) {
            console.warn(`從 ${path} 加載時發生錯誤:`, e.message);
        }
    }
    
    // 如果仍然找不到，使用備用方案 - 手動創建一些測試數據
    console.error('無法從任何路徑加載產品數據，使用備用測試數據');
    
    // 創建一些測試數據
    const backupProducts = [
        {
            id: "test001",
            name: "測試產品 - 優質鎂片",
            brand: "測試品牌",
            description: "這是一個測試產品，用於在無法加載實際數據時顯示。含有高生物利用度的鎂，支持睡眠和放鬆。",
            price: 350,
            rating: 4.5,
            image_url: "https://images.pexels.com/photos/4046316/pexels-photo-4046316.jpeg",
            benefits: ["改善睡眠", "肌肉放鬆", "神經系統支持"],
            health_needs: ["改善睡眠品質", "骨骼與關節健康"],
            tags: ["鎂", "睡眠品質", "放鬆", "高吸收"]
        },
        {
            id: "test002",
            name: "測試產品 - 褪黑激素",
            brand: "測試品牌",
            description: "這是一個測試產品，用於在無法加載實際數據時顯示。含有3毫克褪黑激素，幫助調節睡眠周期。",
            price: 280,
            rating: 4.7,
            image_url: "https://images.pexels.com/photos/4046316/pexels-photo-4046316.jpeg",
            benefits: ["改善睡眠", "調節生理時鐘", "抗氧化"],
            health_needs: ["改善睡眠品質"],
            tags: ["褪黑激素", "睡眠品質", "助眠"]
        },
        {
            id: "test003",
            name: "測試產品 - 綜合維生素",
            brand: "測試品牌",
            description: "這是一個測試產品，用於在無法加載實際數據時顯示。含有全面的維生素和礦物質。",
            price: 450,
            rating: 4.6,
            image_url: "https://images.pexels.com/photos/4046316/pexels-photo-4046316.jpeg",
            benefits: ["日常營養補充", "免疫支持", "能量代謝"],
            health_needs: ["基礎營養", "增強免疫力"],
            tags: ["維生素", "礦物質", "綜合維生素"]
        }
    ];
    
    productsCache = backupProducts;
    return backupProducts;
}

/**
 * 根據健康需求篩選產品，並計算相關性分數
 * @param {Array} products - 產品數據陣列
 * @param {string|Array} healthNeeds - 健康需求或健康需求陣列
 * @param {Object} options - 可選參數 {maxResults: 20, scoreThreshold: 0.2}
 * @returns {Array} 符合健康需求的產品，按相關度排序
 */
function filterByHealthNeed(products, healthNeeds, options = {}) {
    // 設定默認參數
    const { maxResults = 20, scoreThreshold = 0.2 } = options;
    
    // 參數檢查
    if (!products || !products.length) {
        console.log('[filterByHealthNeed] 產品列表為空');
        return [];
    }
    
    if (!healthNeeds) {
        console.log('[filterByHealthNeed] 未指定健康需求');
        return products; // 或者返回空陣列，取決於期望行為
    }
    
    // 將單一健康需求轉為陣列以統一處理
    const needsArray = Array.isArray(healthNeeds) ? healthNeeds.filter(n => n) : [healthNeeds];
    
    // 如果沒有有效的健康需求
    if (needsArray.length === 0) {
        console.log('[filterByHealthNeed] 沒有有效的健康需求');
        return products; // 或者返回空陣列
    }
    
    console.log(`[filterByHealthNeed] 篩選需求: ${needsArray.join(', ')}`);
    
    // 確保使用全域的 getTagsForHealthNeed 函數
    const getTagsFn = typeof window.getTagsForHealthNeed === 'function' ? 
                        window.getTagsForHealthNeed : 
                        backupGetTagsForHealthNeed;
    
    // 收集所有相關標籤
    const allRelevantTags = new Set();
    needsArray.forEach(need => {
        const tagsForNeed = getTagsFn(need); // 使用可用的函數
        if (Array.isArray(tagsForNeed)) {
            tagsForNeed.forEach(tag => allRelevantTags.add(tag));
        }
    });
    console.log(`[filterByHealthNeed] 相關標籤:`, Array.from(allRelevantTags));
    
    // 為每個產品計算相關性分數
    const scoredProducts = products.map(product => {
        let relevanceScore = 0;
        let matchDetails = [];
        
        // 檢查產品是否直接匹配健康需求
        if (product.health_needs && Array.isArray(product.health_needs)) {
            const directMatches = needsArray.filter(need => 
                product.health_needs.includes(need)
            );
            
            if (directMatches.length > 0) {
                relevanceScore += directMatches.length * 0.6; // 直接匹配權重高
                matchDetails.push(`直接匹配需求: ${directMatches.join(', ')}`);
            }
        }
        
        // 檢查產品標籤與相關標籤的匹配程度
        if (product.tags && Array.isArray(product.tags) && allRelevantTags.size > 0) {
            const tagMatches = product.tags.filter(tag => 
                allRelevantTags.has(tag)
            );
            
            if (tagMatches.length > 0) {
                const tagMatchScore = tagMatches.length / Math.sqrt(allRelevantTags.size); // 使用平方根緩和標籤數量的影響
                relevanceScore += tagMatchScore * 0.3; // 標籤匹配權重中等
                matchDetails.push(`標籤匹配: ${tagMatches.join(', ')}`);
            }
        }
        
        // 檢查產品描述和益處是否含有相關關鍵詞 (健康需求本身或相關標籤)
        if (product.description || (product.benefits && Array.isArray(product.benefits))) {
            const description = (product.description || '').toLowerCase();
            const benefitsText = Array.isArray(product.benefits) ? product.benefits.join(' ').toLowerCase() : '';
            const combinedText = description + ' ' + benefitsText;
            
            const textMatchNeeds = needsArray.filter(need => combinedText.includes(need.toLowerCase()));
            const textMatchTags = Array.from(allRelevantTags).filter(tag => combinedText.includes(tag.toLowerCase()));
            
            const uniqueTextMatches = new Set([...textMatchNeeds, ...textMatchTags]);

            if (uniqueTextMatches.size > 0) {
                 // 文本匹配權重較低
                relevanceScore += uniqueTextMatches.size * 0.1 / (needsArray.length + allRelevantTags.size || 1) ;
                matchDetails.push(`描述/益處匹配: ${uniqueTextMatches.size}個關鍵詞`);
            }
        }
        
        // 根據產品評分調整分數 (可選)
        if (product.rating && typeof product.rating === 'number' && product.rating > 0) {
            relevanceScore *= (1 + (product.rating - 4.0) * 0.05); // 以4.0為基準調整
        }

        // 根據評論數調整分數 (可選，使用對數避免影響過大)
        if (product.review_count && typeof product.review_count === 'number' && product.review_count > 0) {
             relevanceScore *= (1 + Math.log10(product.review_count + 1) * 0.01);
        }
        
        return {
            ...product,
            relevanceScore,
            matchDetails // 用於調試
        };
    });
    
    // 過濾出相關性分數超過閾值的產品
    const filteredProducts = scoredProducts.filter(product => 
        product.relevanceScore >= scoreThreshold
    );
     console.log(`[filterByHealthNeed] 篩選後 ${filteredProducts.length} 個產品 (閾值: ${scoreThreshold})`);

     // 調試：打印每個產品的分數
     filteredProducts.forEach(p => console.log(`[Score] ${p.name || p.id}: ${p.relevanceScore.toFixed(3)}`, p.matchDetails));
    
    // 根據相關性分數排序
    const sortedProducts = filteredProducts.sort((a, b) => 
        b.relevanceScore - a.relevanceScore
    );
    
    // 限制結果數量
    return sortedProducts.slice(0, maxResults);
}

/**
 * 根據生活型態篩選產品 (簡單實現，待擴充)
 * @param {Array} products 產品數據陣列
 * @param {string} lifestyle 生活型態
 * @returns {Array} 符合生活型態的產品
 */
function filterByLifestyle(products, lifestyle) {
    console.log(`[filterByLifestyle] 篩選生活型態: ${lifestyle}`);
    if (!lifestyle) return products; // 如果沒有指定，返回所有

    // 這裡需要更複雜的邏輯來判斷匹配度，目前僅作示例
    // 可以檢查產品的 tags 或 description 是否包含 lifestyle 關鍵字
    // 或者建立一個生活型態到產品特性的映射
    return products.filter(product => {
        // 簡單示例：如果產品標籤包含生活型態關鍵字
        if (product.tags && product.tags.some(tag => tag.includes(lifestyle))) {
            return true;
        }
        // 簡單示例：如果產品描述包含生活型態關鍵字
        if (product.description && product.description.includes(lifestyle)) {
             return true;
        }
        // 默認不篩選掉，除非有明確的不匹配規則
        return true; 
    });
}

/**
 * 根據預算篩選產品 (簡單實現)
 * @param {Array} products 產品列表
 * @param {number} budget 預算上限
 * @returns {Array} 符合預算的產品列表
 */
function filterByBudget(products, budget) {
    console.log(`[filterByBudget] 篩選預算: <= ${budget}`);
    if (typeof budget !== 'number' || budget <= 0) {
        return products; // 無有效預算，返回所有
    }
    return products.filter(product => typeof product.price === 'number' && product.price <= budget);
}

/**
 * 初始化推薦頁面：獲取數據、篩選、渲染結果
 * @param {string} healthNeed - 用戶選擇的健康需求
 * @param {string} lifestyle - 用戶選擇的生活型態
 * @param {number} budget - 用戶設定的預算
 */
window.initializeRecommendations = async function(healthNeed, lifestyle, budget) {
    const recommendedContainer = document.getElementById('recommended-products');
    const relatedContainer = document.getElementById('related-products');
    const timelineContainer = document.getElementById('usage-timeline');
    const cautionsContainer = document.getElementById('product-cautions');

    try {
        // 1. 獲取所有產品數據
        const allProducts = await getProducts();
        console.log(`[initializeRecommendations] 獲取到 ${allProducts.length} 個產品`);

        // 2. 根據健康需求篩選主要推薦產品
        let recommendedProducts = filterByHealthNeed(allProducts, healthNeed, { maxResults: 10, scoreThreshold: 0.1 });
        console.log(`[initializeRecommendations] 健康需求篩選後: ${recommendedProducts.length} 個`);

        // 3. (可選) 根據生活型態進一步篩選或調整排序
        // recommendedProducts = filterByLifestyle(recommendedProducts, lifestyle);
        // console.log(`[initializeRecommendations] 生活型態篩選後: ${recommendedProducts.length} 個`);
        
        // 4. 根據預算篩選 (應用在主要推薦上)
        recommendedProducts = filterByBudget(recommendedProducts, budget);
        console.log(`[initializeRecommendations] 預算篩選後: ${recommendedProducts.length} 個`);


        // 5. 渲染主要推薦產品列表
        if (recommendedContainer) {
            if (recommendedProducts.length > 0) {
                recommendedContainer.innerHTML = recommendedProducts.map(createProductCardHTML).join('');
            } else {
                recommendedContainer.innerHTML = '<p class="text-center">抱歉，根據您的選擇，目前沒有找到合適的產品推薦。</p>';
            }
        } else {
             console.error('找不到 ID 為 "recommended-products" 的容器');
        }

        // 6. (可選) 生成並渲染相關產品 (簡單示例：隨機選幾個)
        if (relatedContainer) {
            const relatedProducts = allProducts
                .filter(p => !recommendedProducts.some(rec => rec.id === p.id)) // 過濾掉已推薦的
                .sort(() => 0.5 - Math.random()) // 隨機排序
                .slice(0, 2); // 取前2個
             if (relatedProducts.length > 0) {
                 relatedContainer.innerHTML = relatedProducts.map(createProductCardHTML).join('');
             } else {
                 relatedContainer.innerHTML = ''; // 或顯示提示
             }
        } else {
             console.error('找不到 ID 為 "related-products" 的容器');
        }

        // 7. (可選) 更新時間線 (使用固定內容作為示例)
        if (timelineContainer) {
            updateTimelineHTML(timelineContainer, recommendedProducts); // 傳入產品以供未來擴展
        } else {
             console.error('找不到 ID 為 "usage-timeline" 的容器');
        }

        // 8. (可選) 更新注意事項 (使用固定內容作為示例)
        if (cautionsContainer) {
             updateCautionsHTML(cautionsContainer, recommendedProducts); // 傳入產品以供未來擴展
        } else {
             console.error('找不到 ID 為 "product-cautions" 的容器');
        }

    } catch (error) {
        console.error('[initializeRecommendations] 處理推薦時發生錯誤:', error);
        if (recommendedContainer) {
            recommendedContainer.innerHTML = `<p class="text-center" style="color: red;">加載推薦失敗：${error.message}</p>`;
        }
        // 可以考慮也清空或顯示錯誤訊息給其他部分
        if (relatedContainer) relatedContainer.innerHTML = '';
        if (timelineContainer) timelineContainer.innerHTML = '';
        if (cautionsContainer) cautionsContainer.innerHTML = '<h3 style="font-size: 16px; margin: 0 0 12px;">無法加載注意事項</h3>';
    }
}

/**
 * 更新時間線顯示 (示例)
 * @param {HTMLElement} container - 時間線容器元素
 * @param {Array} products - 推薦的產品列表 (未來可能用於生成動態時間線)
 */
function updateTimelineHTML(container, products) {
    // 新的現代化時間線設計
    container.innerHTML = `
        <div class="timeline-track">
            <div class="timeline-line"></div>
        </div>
        
        <div class="time-point-wrapper">
            <div class="time-point">
                <div class="time-icon" style="background-color: #FFD686;">
                    <i class="fas fa-sun"></i>
                </div>
                <div class="time-content">
                    <div class="time-header">
                        <h4>早晨</h4>
                        <span class="time-badge">06:00 - 09:00</span>
                    </div>
                    <div class="time-description">
                        <p>早晨是補充維生素和能量相關營養素的理想時間，可幫助您開始一天的活動。</p>
                        <div class="time-tips">
                            <i class="fas fa-lightbulb" style="color: #F5B17B;"></i>
                            <span>建議飯後服用，可提高部分營養素的吸收率</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="time-point">
                <div class="time-icon" style="background-color: #A8D5BA;">
                    <i class="fas fa-utensils"></i>
                </div>
                <div class="time-content">
                    <div class="time-header">
                        <h4>隨餐</h4>
                        <span class="time-badge">用餐時</span>
                    </div>
                    <div class="time-description">
                        <p>多數營養補充品隨餐服用可以減少對胃部的刺激，並提高某些脂溶性營養素的吸收效率。</p>
                        <div class="time-tips">
                            <i class="fas fa-lightbulb" style="color: #F5B17B;"></i>
                            <span>礦物質和B族維生素類營養補充品特別適合在餐中或餐後服用</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="time-point">
                <div class="time-icon" style="background-color: #AEC6CF;">
                    <i class="fas fa-moon"></i>
                </div>
                <div class="time-content">
                    <div class="time-header">
                        <h4>睡前</h4>
                        <span class="time-badge">21:00 - 23:00</span>
                    </div>
                    <div class="time-description">
                        <p>睡前是服用某些特定營養補充品的理想時間，特別是與放鬆和睡眠品質相關的成分。</p>
                        <div class="time-tips">
                            <i class="fas fa-lightbulb" style="color: #F5B17B;"></i>
                            <span>鎂、褪黑激素等成分在睡前30-60分鐘服用效果較佳</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 添加CSS樣式到頁面
    if (!document.getElementById('timeline-custom-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'timeline-custom-styles';
        styleSheet.textContent = `
            .timeline-track {
                position: absolute;
                left: 20px;
                top: 25px;
                bottom: 25px;
                width: 2px;
            }
            
            .timeline-line {
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 2px;
                background: linear-gradient(to bottom, #FFD686, #A8D5BA, #AEC6CF);
            }
            
            .time-point-wrapper {
                position: relative;
                padding-left: 15px;
            }
            
            .time-point {
                position: relative;
                display: flex;
                margin-bottom: 28px;
                padding-left: 30px;
                z-index: 1;
            }
            
            .time-icon {
                position: absolute;
                left: -15px;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 16px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                z-index: 2;
            }
            
            .time-content {
                flex: 1;
                background-color: white;
                border-radius: 12px;
                box-shadow: 0 3px 10px rgba(0,0,0,0.08);
                overflow: hidden;
                transition: transform 0.3s ease;
            }
            
            .time-content:hover {
                transform: translateY(-2px);
            }
            
            .time-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                background-color: #f9f9f9;
                border-bottom: 1px solid #eee;
            }
            
            .time-header h4 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: var(--text-primary);
            }
            
            .time-badge {
                background-color: var(--primary-light, #A8D5BA);
                color: var(--text-primary);
                font-size: 12px;
                padding: 2px 8px;
                border-radius: 12px;
                font-weight: 500;
            }
            
            .time-description {
                padding: 12px 16px;
            }
            
            .time-description p {
                margin: 0 0 12px;
                font-size: 14px;
                line-height: 1.5;
                color: var(--text-secondary);
            }
            
            .time-tips {
                display: flex;
                align-items: flex-start;
                padding: 8px 12px;
                background-color: #fff9f0;
                border-radius: 6px;
                border-left: 3px solid #F5B17B;
            }
            
            .time-tips i {
                margin-right: 8px;
                margin-top: 3px;
            }
            
            .time-tips span {
                font-size: 12px;
                line-height: 1.4;
                color: var(--text-secondary);
            }
            
            /* 確保容器有正確的定位和間距 */
            .timeline-container {
                position: relative;
                padding: 10px 0;
                margin-top: 10px;
            }
        `;
        document.head.appendChild(styleSheet);
    }
}

/**
 * 更新注意事項顯示 (示例)
 * @param {HTMLElement} container - 注意事項容器元素
 * @param {Array} products - 推薦的產品列表 (未來可提取產品特定注意事項)
 */
function updateCautionsHTML(container, products) {
    // 從推薦產品中提取注意事項 (未來擴展)
    let specificCautions = [];
    if (products && products.length > 0) {
        products.forEach(p => {
            if (p.caution) {
                specificCautions.push({
                    product: p.name,
                    caution: p.caution
                });
            }
        });
    }
    
    // 重新設計的注意事項UI
    container.innerHTML = `
        <div class="cautions-header">
            <div class="cautions-icon">
                <i class="fas fa-shield-alt"></i>
            </div>
            <h3>使用須知與參考建議</h3>
        </div>
        
        <div class="cautions-content">
            <div class="cautions-card general-cautions">
                <div class="cautions-card-header">
                    <i class="fas fa-exclamation-circle"></i>
                    <h4>一般使用須知</h4>
                </div>
                <ul class="cautions-list">
                    <li>
                        <div class="caution-item">
                            <i class="fas fa-check-circle"></i>
                            <span>在開始任何新的營養補充方案前，建議先諮詢您的醫療專業人員</span>
                        </div>
                    </li>
                    <li>
                        <div class="caution-item">
                            <i class="fas fa-check-circle"></i>
                            <span>如正在懷孕、哺乳或有慢性健康問題，應特別諮詢醫師建議</span>
                        </div>
                    </li>
                    <li>
                        <div class="caution-item">
                            <i class="fas fa-check-circle"></i>
                            <span>請嚴格遵循產品標籤上的建議使用量，避免過量使用</span>
                        </div>
                    </li>
                    <li>
                        <div class="caution-item">
                            <i class="fas fa-check-circle"></i>
                            <span>將所有營養補充品存放在兒童無法觸及的地方</span>
                        </div>
                    </li>
                </ul>
            </div>
            
            ${specificCautions.length > 0 ? `
            <div class="cautions-card specific-cautions">
                <div class="cautions-card-header">
                    <i class="fas fa-flask"></i>
                    <h4>產品特定注意事項</h4>
                </div>
                <ul class="cautions-list">
                    ${specificCautions.slice(0, 3).map(item => `
                        <li>
                            <div class="caution-item">
                                <span class="product-name">${item.product.substring(0, 15)}${item.product.length > 15 ? '...' : ''}</span>
                                <span class="caution-text">${item.caution.substring(0, 80)}${item.caution.length > 80 ? '...' : ''}</span>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            </div>
            ` : ''}
            
            <div class="cautions-card interactions-cautions">
                <div class="cautions-card-header">
                    <i class="fas fa-random"></i>
                    <h4>注意可能的交互作用</h4>
                </div>
                <div class="caution-item special-note">
                    <i class="fas fa-info-circle"></i>
                    <span>某些營養補充品可能與處方藥物產生交互作用。如您正在服用任何藥物，請在使用營養補充品前諮詢醫療專業人員。</span>
                </div>
            </div>
            
            <div class="cautions-disclaimer">
                <i class="fas fa-heart"></i>
                <p>小帕不提供任何醫療建議，所有資訊僅供參考。健康決策請諮詢專業醫師～</p>
            </div>
        </div>
    `;
    
    // 添加CSS樣式到頁面
    if (!document.getElementById('cautions-custom-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'cautions-custom-styles';
        styleSheet.textContent = `
            .cautions-header {
                display: flex;
                align-items: center;
                margin-bottom: 16px;
            }
            
            .cautions-icon {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background-color: #F5B17B;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 12px;
                color: white;
                font-size: 16px;
                box-shadow: 0 2px 8px rgba(245, 177, 123, 0.3);
            }
            
            .cautions-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: var(--text-primary);
            }
            
            .cautions-content {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .cautions-card {
                background-color: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                transition: transform 0.2s ease;
            }
            
            .cautions-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            }
            
            .cautions-card-header {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                background-color: #f9f9f9;
                border-bottom: 1px solid #eee;
            }
            
            .cautions-card-header i {
                margin-right: 8px;
                color: var(--primary);
                font-size: 16px;
            }
            
            .cautions-card-header h4 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: var(--text-primary);
            }
            
            .cautions-list {
                margin: 0;
                padding: 12px 0;
                list-style-type: none;
            }
            
            .cautions-list li {
                padding: 6px 16px;
            }
            
            .caution-item {
                display: flex;
                align-items: flex-start;
                font-size: 14px;
                color: var(--text-secondary);
                line-height: 1.5;
            }
            
            .caution-item i {
                margin-right: 8px;
                color: var(--primary);
                margin-top: 3px;
                flex-shrink: 0;
            }
            
            .general-cautions .caution-item i {
                color: #A8D5BA;
            }
            
            .product-name {
                font-weight: 600;
                margin-right: 6px;
                color: var(--text-primary);
                flex-shrink: 0;
            }
            
            .caution-text {
                flex: 1;
            }
            
            .special-note {
                padding: 12px 16px;
                background-color: #f7f8fc;
            }
            
            .special-note i {
                color: #7B91D3;
                margin-right: 8px;
                margin-top: 3px;
                flex-shrink: 0;
            }
            
            .cautions-disclaimer {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 12px;
                background-color: #fff9f0;
                border-radius: 8px;
                margin-top: 8px;
            }
            
            .cautions-disclaimer i {
                color: #F5B17B;
                margin-right: 8px;
                font-size: 14px;
            }
            
            .cautions-disclaimer p {
                margin: 0;
                font-size: 12px;
                color: var(--text-secondary);
                text-align: center;
            }
            
            .interactions-cautions .cautions-card-header i {
                color: #7B91D3;
            }
            
            .specific-cautions .cautions-card-header i {
                color: #F5B17B;
            }
        `;
        document.head.appendChild(styleSheet);
    }
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
        const ratingA = a.rating !== undefined ? a.rating / 5 : 0.5;
        const ratingB = b.rating !== undefined ? b.rating / 5 : 0.5;
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