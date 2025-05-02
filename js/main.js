/**
 * NutriPal 主JavaScript文件
 * 處理用戶互動和資訊整理流程
 */

document.addEventListener('DOMContentLoaded', function() {
    // 用戶選擇的資料
    const userSelections = {
        healthNeed: '',
        lifestyle: '',
        budget: 0
    };
    
    // 初始化頁面事件監聽器
    initEventListeners();
    
    /**
     * 初始化事件監聽器
     */
    function initEventListeners() {
        // 綁定健康需求選項按鈕
        bindOptionButtons('button[data-type="health-need"]', 'healthNeed', handleHealthNeedSelection);
        
        // 綁定生活型態選項按鈕
        bindOptionButtons('button[data-type="lifestyle"]', 'lifestyle', handleLifestyleSelection);
        
        // 綁定預算範圍選項
        bindOptionButtons('button[data-type="budget"]', 'budget', handleBudgetSelection);
        
        // 如果存在提交按鈕，綁定提交事件
        const submitButton = document.getElementById('submit-selections');
        if (submitButton) {
            submitButton.addEventListener('click', processUserSelections);
        }
    }
    
    /**
     * 綁定選項按鈕事件
     * @param {string} selector 按鈕選擇器
     * @param {string} dataKey 數據鍵名
     * @param {Function} callback 回調函數
     */
    function bindOptionButtons(selector, dataKey, callback) {
        const buttons = document.querySelectorAll(selector);
        
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                // 移除其他按鈕的選中狀態
                buttons.forEach(btn => btn.classList.remove('selected'));
                
                // 添加當前按鈕的選中狀態
                this.classList.add('selected');
                
                // 存儲用戶選擇
                userSelections[dataKey] = this.dataset.value;
                
                // 如果是預算，轉換為數字
                if (dataKey === 'budget') {
                    userSelections[dataKey] = parseInt(this.dataset.value, 10);
                }
                
                // 執行回調
                if (typeof callback === 'function') {
                    callback(this.dataset.value);
                }
                
                // 在測試環境中輸出用戶選擇
                console.log('用戶選擇更新:', userSelections);
            });
        });
    }
    
    /**
     * 處理健康需求選擇
     * @param {string} healthNeed 選擇的健康需求
     */
    function handleHealthNeedSelection(healthNeed) {
        // 存儲到sessionStorage
        sessionStorage.setItem('healthNeed', healthNeed);
        
        // 更新顯示
        const selectedNeedSpan = document.querySelector('.selected-health-need');
        if (selectedNeedSpan) {
            selectedNeedSpan.textContent = healthNeed;
        }
        
        // 更新反饋文本
        const feedbackSpan = document.querySelector('.health-need-feedback');
        if (feedbackSpan) {
            // 依據不同的健康需求給出不同反饋
            const feedbacks = {
                '改善睡眠品質': '良好的睡眠對健康很重要呢。',
                '增強免疫力': '保持良好的免疫系統對健康很重要。',
                '提升腦力與專注': '腦力和專注力對日常生活和工作都很重要。',
                '心臟健康': '心臟健康是整體健康的關鍵。',
                '骨骼與關節健康': '保持骨骼和關節健康能讓活動更輕鬆。',
                '視力保健': '保護視力在現代數位生活中尤為重要。',
                '肝臟保健': '肝臟是身體重要的解毒器官。',
                '女性保健': '女性健康需要特別的照顧和關注。',
                '消化系統保健': '健康的消化系統是整體健康的基礎。',
                '體重管理': '健康的體重管理對整體健康很重要。'
            };
            
            feedbackSpan.textContent = feedbacks[healthNeed] || '了解您的健康需求了。';
        }
        
        // 顯示健康需求回應
        const healthNeedResponse = document.getElementById('health-need-response');
        if (healthNeedResponse) {
            healthNeedResponse.style.display = 'block';
            healthNeedResponse.classList.add('fade-in');
        }
        
        // 顯示生活型態選項
        setTimeout(() => {
            const lifestyleOptions = document.getElementById('lifestyle-options');
            if (lifestyleOptions) {
                lifestyleOptions.style.display = 'block';
                lifestyleOptions.classList.add('fade-in');
                lifestyleOptions.scrollIntoView({ behavior: 'smooth' });
            }
        }, 800);
    }
    
    /**
     * 處理生活型態選擇
     * @param {string} lifestyle 選擇的生活型態
     */
    function handleLifestyleSelection(lifestyle) {
        // 存儲到sessionStorage
        sessionStorage.setItem('lifestyle', lifestyle);
        
        // 更新顯示
        const selectedLifestyleSpan = document.querySelector('.selected-lifestyle');
        if (selectedLifestyleSpan) {
            selectedLifestyleSpan.textContent = lifestyle;
        }
        
        // 顯示生活型態回應
        const lifestyleResponse = document.getElementById('lifestyle-response');
        if (lifestyleResponse) {
            lifestyleResponse.style.display = 'block';
            lifestyleResponse.classList.add('fade-in');
        }
        
        // 顯示預算選項
        setTimeout(() => {
            const budgetOptions = document.getElementById('budget-options');
            if (budgetOptions) {
                budgetOptions.style.display = 'block';
                budgetOptions.classList.add('fade-in');
                budgetOptions.scrollIntoView({ behavior: 'smooth' });
            }
        }, 800);
    }
    
    /**
     * 處理預算選擇
     * @param {string} budget 選擇的預算
     */
    function handleBudgetSelection(budget) {
        // 存儲到sessionStorage
        sessionStorage.setItem('budget', budget);
        
        // 更新顯示
        const selectedBudgetSpan = document.querySelector('.selected-budget');
        if (selectedBudgetSpan) {
            // 依據預算值顯示不同的文本
            let budgetText = '';
            switch (budget) {
                case '500':
                    budgetText = '經濟實惠型（500元以下）';
                    break;
                case '1000':
                    budgetText = '中等預算（500-1000元）';
                    break;
                case '2000':
                    budgetText = '高品質型（1000元以上）';
                    break;
                case '0':
                default:
                    budgetText = '無預算限制';
                    break;
            }
            selectedBudgetSpan.textContent = budgetText;
        }
        
        // 顯示預算回應
        const budgetResponse = document.getElementById('budget-response');
        if (budgetResponse) {
            budgetResponse.style.display = 'block';
            budgetResponse.classList.add('fade-in');
        }
        
        // 顯示提交按鈕
        setTimeout(() => {
            const submitContainer = document.getElementById('submit-container');
            if (submitContainer) {
                submitContainer.style.display = 'block';
                submitContainer.classList.add('fade-in');
                submitContainer.scrollIntoView({ behavior: 'smooth' });
            }
        }, 800);
    }
    
    /**
     * 處理用戶選擇，獲取推薦結果
     */
    async function processUserSelections() {
        try {
            // 檢查是否做出了必要的選擇
            if (!userSelections.healthNeed) {
                alert('請選擇您的健康需求');
                return;
            }
            
            // 顯示加載狀態
            showLoadingState();
            
            // 獲取推薦
            let recommendedProducts;
            
            // 如果有預算限制，使用預算相關推薦
            if (userSelections.budget > 0) {
                recommendedProducts = await window.NutriPalRecommender.recommendWithinBudget(
                    userSelections.healthNeed,
                    userSelections.lifestyle,
                    userSelections.budget
                );
            } else {
                // 默認推薦
                recommendedProducts = await window.NutriPalRecommender.recommendProducts(
                    userSelections.healthNeed,
                    userSelections.lifestyle
                );
            }
            
            // 處理推薦結果
            if (recommendedProducts.length > 0) {
                // 存儲推薦結果到 sessionStorage
                sessionStorage.setItem('recommendedProducts', JSON.stringify(recommendedProducts));
                
                // 獲取相關產品
                if (recommendedProducts[0]) {
                    const relatedProducts = await window.NutriPalRecommender.getRelatedProducts(
                        recommendedProducts[0],
                        2
                    );
                    
                    if (relatedProducts.length > 0) {
                        sessionStorage.setItem('relatedProducts', JSON.stringify(relatedProducts));
                    }
                }
                
                // 導航到結果頁面
                window.location.href = 'results.html';
            } else {
                alert('抱歉，沒有找到符合您需求的保健品。請嘗試調整您的選擇。');
                hideLoadingState();
            }
        } catch (error) {
            console.error('處理用戶選擇時出錯:', error);
            alert('發生錯誤，請重試。');
            hideLoadingState();
        }
    }
    
    /**
     * 顯示加載狀態
     */
    function showLoadingState() {
        // 如果存在加載指示器，顯示它
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }
        
        // 如果有提交按鈕，禁用它
        const submitButton = document.getElementById('submit-selections');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '正在整理資料...';
        }
    }
    
    /**
     * 隱藏加載狀態
     */
    function hideLoadingState() {
        // 如果存在加載指示器，隱藏它
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
        // 如果有提交按鈕，啟用它
        const submitButton = document.getElementById('submit-selections');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = '獲取推薦';
        }
    }
});

// 結果頁面處理
if (window.location.pathname.includes('results.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        displayRecommendedProducts();
        displayRelatedProducts();
        generateUsageTimeline();
        generateCautionsList();
    });
}

/**
 * 在結果頁面顯示推薦產品
 */
function displayRecommendedProducts() {
    try {
        // 從 sessionStorage 獲取推薦產品
        const recommendedProductsJson = sessionStorage.getItem('recommendedProducts');
        
        if (!recommendedProductsJson) {
            console.error('沒有找到推薦產品數據');
            displayError('無法加載推薦產品。請返回並重新選擇您的偏好。');
            return;
        }
        
        const recommendedProducts = JSON.parse(recommendedProductsJson);
        
        // 獲取產品容器
        const productsContainer = document.querySelector('.product-list') || document.getElementById('recommended-products');
        
        if (!productsContainer) {
            console.error('找不到產品容器元素');
            return;
        }
        
        // 清空容器
        productsContainer.innerHTML = '';
        
        // 添加每個產品卡片
        recommendedProducts.forEach(product => {
            const productCard = createProductCard(product);
            productsContainer.appendChild(productCard);
        });
        
        // 更新用戶選擇的健康需求和生活型態顯示
        updateSelectionDisplay();
        
    } catch (error) {
        console.error('顯示推薦產品時出錯:', error);
        displayError('處理推薦時發生錯誤。請重試。');
    }
}

/**
 * 顯示相關產品
 */
function displayRelatedProducts() {
    try {
        // 從sessionStorage獲取相關產品
        const relatedProductsJson = sessionStorage.getItem('relatedProducts');
        
        if (!relatedProductsJson) {
            // 嘗試獲取推薦產品的第一個，並獲取相關產品
            const recommendedProductsJson = sessionStorage.getItem('recommendedProducts');
            if (recommendedProductsJson) {
                const recommendedProducts = JSON.parse(recommendedProductsJson);
                if (recommendedProducts.length > 0) {
                    // 異步獲取相關產品
                    window.NutriPalRecommender.getRelatedProducts(recommendedProducts[0], 2)
                        .then(relatedProducts => {
                            if (relatedProducts.length > 0) {
                                sessionStorage.setItem('relatedProducts', JSON.stringify(relatedProducts));
                                renderRelatedProducts(relatedProducts);
                            }
                        });
                    return;
                }
            }
            
            // 如果無法獲取相關產品，隱藏相關產品區域
            const relatedTitle = document.querySelector('h2:contains("延伸相關選擇")');
            if (relatedTitle) {
                relatedTitle.style.display = 'none';
            }
            return;
        }
        
        const relatedProducts = JSON.parse(relatedProductsJson);
        renderRelatedProducts(relatedProducts);
        
    } catch (error) {
        console.error('顯示相關產品時出錯:', error);
        // 錯誤時隱藏相關產品區域
        const relatedTitle = document.querySelector('h2:contains("延伸相關選擇")');
        if (relatedTitle) {
            relatedTitle.style.display = 'none';
        }
    }
}

/**
 * 渲染相關產品
 * @param {Array} relatedProducts 相關產品數組
 */
function renderRelatedProducts(relatedProducts) {
    // 獲取相關產品容器
    const relatedContainer = document.getElementById('related-products');
    
    if (!relatedContainer) {
        console.error('找不到相關產品容器元素');
        return;
    }
    
    // 清空容器
    relatedContainer.innerHTML = '';
    
    // 添加每個相關產品卡片
    relatedProducts.forEach(product => {
        const productCard = createProductCard(product);
        relatedContainer.appendChild(productCard);
    });
}

/**
 * 創建產品卡片 DOM 元素
 * @param {Object} product 產品數據
 * @returns {HTMLElement} 產品卡片元素
 */
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
        <img src="${product.image_url}" alt="${product.name}產品圖片">
        <div class="product-info">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="flex: 1;">
                    <p class="product-title">${product.brand} ${product.name}</p>
                    <p class="product-desc">${product.description.substring(0, 80)}...</p>
                </div>
                <div class="price">$${product.price}</div>
            </div>
            
            <div style="display: flex; flex-wrap: wrap; margin-bottom: 12px;">
                ${product.benefits.map(benefit => `<span class="badge">${benefit}</span>`).join('')}
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center;">
                    <i class="fas fa-clock" style="color: var(--primary); margin-right: 4px;"></i>
                    <span style="font-size: 12px;">${product.usage}</span>
                </div>
                <a href="https://tw.iherb.com/search?kw=${encodeURIComponent(product.brand + ' ' + product.name)}" 
                   class="btn-primary" 
                   style="font-size: 14px; padding: 8px 12px;"
                   target="_blank">
                    <i class="fas fa-shopping-cart"></i> 購買
                </a>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * 生成使用時間表
 */
function generateUsageTimeline() {
    try {
        // 從sessionStorage獲取推薦產品
        const recommendedProductsJson = sessionStorage.getItem('recommendedProducts');
        if (!recommendedProductsJson) return;
        
        const recommendedProducts = JSON.parse(recommendedProductsJson);
        if (!recommendedProducts.length) return;
        
        // 獲取時間表容器
        const timelineContainer = document.getElementById('usage-timeline');
        if (!timelineContainer) return;
        
        // 清空容器
        timelineContainer.innerHTML = '';
        
        // 模擬時間順序排列，基於使用說明
        const usageTimes = {
            '早餐時': [],
            '早餐後': [],
            '午餐時': [],
            '午餐後': [],
            '晚餐時': [],
            '晚餐後': [],
            '睡前': []
        };
        
        // 解析產品使用時間
        recommendedProducts.forEach(product => {
            let usageTime = '睡前';
            const usage = product.usage.toLowerCase();
            
            if (usage.includes('早餐')) {
                usageTime = usage.includes('後') ? '早餐後' : '早餐時';
            } else if (usage.includes('午餐')) {
                usageTime = usage.includes('後') ? '午餐後' : '午餐時';
            } else if (usage.includes('晚餐')) {
                usageTime = usage.includes('後') ? '晚餐後' : '晚餐時';
            } else if (usage.includes('睡前')) {
                usageTime = '睡前';
            }
            
            // 將產品添加到對應時間
            if (usageTimes[usageTime]) {
                usageTimes[usageTime].push(product);
            } else {
                // 如果沒有明確匹配，默認添加到晚餐後
                usageTimes['晚餐後'].push(product);
            }
        });
        
        // 生成時間表
        Object.keys(usageTimes).forEach(time => {
            const products = usageTimes[time];
            if (products.length === 0) return;
            
            products.forEach(product => {
                const timelineItem = document.createElement('div');
                timelineItem.className = 'timeline-item';
                
                timelineItem.innerHTML = `
                    <div class="timeline-time">${time}</div>
                    <div class="timeline-content">
                        <div style="font-weight: 600; margin-bottom: 4px;">${product.name}</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">${product.usage}</div>
                    </div>
                `;
                
                timelineContainer.appendChild(timelineItem);
            });
        });
        
        // 如果沒有任何時間表項目，添加默認提示
        if (timelineContainer.children.length === 0) {
            timelineContainer.innerHTML = `
                <div class="timeline-item">
                    <div class="timeline-time">一般建議</div>
                    <div class="timeline-content">
                        <div style="font-weight: 600; margin-bottom: 4px;">請根據產品說明使用</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">請參考每個產品的具體使用說明</div>
                    </div>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('生成使用時間表時出錯:', error);
    }
}

/**
 * 生成注意事項列表
 */
function generateCautionsList() {
    try {
        // 從sessionStorage獲取推薦產品
        const recommendedProductsJson = sessionStorage.getItem('recommendedProducts');
        if (!recommendedProductsJson) return;
        
        const recommendedProducts = JSON.parse(recommendedProductsJson);
        if (!recommendedProducts.length) return;
        
        // 獲取注意事項容器
        const cautionsContainer = document.getElementById('cautions-list');
        if (!cautionsContainer) return;
        
        // 清空容器
        cautionsContainer.innerHTML = '';
        
        // 收集所有產品的注意事項
        const allCautions = new Set();
        recommendedProducts.forEach(product => {
            if (product.caution) {
                // 分解複合的注意事項
                const cautions = product.caution.split(/；|;|，|,|\.|。/).filter(Boolean);
                cautions.forEach(caution => {
                    const trimmedCaution = caution.trim();
                    if (trimmedCaution) {
                        allCautions.add(trimmedCaution);
                    }
                });
            }
        });
        
        // 將注意事項添加到列表中
        Array.from(allCautions).forEach(caution => {
            const cautionItem = document.createElement('li');
            cautionItem.style.marginBottom = '8px';
            cautionItem.textContent = caution;
            cautionsContainer.appendChild(cautionItem);
        });
        
        // 添加一些通用的注意事項
        const generalCautions = [
            '若正在服用處方藥物，請先諮詢醫生',
            '若有任何健康問題，建議尋求專業醫療諮詢',
            '保持規律作息，加強保健效果'
        ];
        
        generalCautions.forEach(caution => {
            // 避免重複添加
            if (!Array.from(allCautions).some(c => c.includes(caution))) {
                const cautionItem = document.createElement('li');
                cautionItem.style.marginBottom = '8px';
                cautionItem.textContent = caution;
                cautionsContainer.appendChild(cautionItem);
            }
        });
        
    } catch (error) {
        console.error('生成注意事項列表時出錯:', error);
    }
}

/**
 * 更新選擇顯示
 */
function updateSelectionDisplay() {
    // 尋找顯示健康需求的元素
    const healthNeedElement = document.querySelector('.health-need-display');
    const lifestyleElement = document.querySelector('.lifestyle-display');
    
    if (healthNeedElement) {
        // 從 sessionStorage 獲取健康需求
        const healthNeed = sessionStorage.getItem('healthNeed') || '改善健康';
        
        // 更新顯示
        healthNeedElement.textContent = healthNeed;
        
        // 更新結果分類標籤
        const categoryBadge = document.querySelector('.badge.result-category');
        if (categoryBadge) {
            // 基於健康需求設置適當的類別
            const categories = {
                '改善睡眠品質': '睡眠相關',
                '增強免疫力': '免疫相關',
                '提升腦力與專注': '腦力相關',
                '心臟健康': '心臟相關',
                '骨骼與關節健康': '骨關節相關',
                '視力保健': '視力相關',
                '肝臟保健': '肝臟相關',
                '女性保健': '女性保健',
                '消化系統保健': '消化相關',
                '體重管理': '體重管理'
            };
            
            categoryBadge.textContent = categories[healthNeed] || '保健相關';
        }
    }
    
    if (lifestyleElement) {
        // 從 sessionStorage 獲取生活型態
        const lifestyle = sessionStorage.getItem('lifestyle') || '一般生活型態';
        
        // 更新顯示
        lifestyleElement.textContent = lifestyle;
    }
}

/**
 * 顯示錯誤訊息
 * @param {string} message 錯誤訊息
 */
function displayError(message) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
        <a href="chat.html" class="btn-primary">返回選擇</a>
    `;
    
    // 找一個合適的容器來顯示錯誤
    const container = document.querySelector('.app-content') || document.body;
    
    // 清空容器並顯示錯誤
    container.innerHTML = '';
    container.appendChild(errorContainer);
} 