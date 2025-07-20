/**
 * NutriPal 主JavaScript文件
 * 處理用戶互動和資訊整理流程
 */

// 用戶選擇的資料 - 移到全局作用域
const userSelections = {
    healthNeed: '',
    lifestyle: '',
    budget: 0
};

// 頁面載入後的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('【診斷】頁面載入完成');
    
    // 檢查當前頁面並執行對應初始化
    if (window.location.href.toLowerCase().includes('chat.html')) {
        console.log('【診斷】在聊天頁面，初始化聊天相關功能');
        
        // 初始化對話框動畫
        initChatMessageAnimation();
        
        // 初始化頁面事件監聽器
        initEventListeners();
        
        // 確保提交按鈕綁定了事件
        const submitButton = document.getElementById('submit-selections');
        if (submitButton) {
            console.log('【診斷】重新綁定提交按鈕事件');
            submitButton.addEventListener('click', function(e) {
                e.preventDefault();
                try {
                    processUserSelectionsAndSubmitForm();
                } catch (err) {
                    console.error('【診斷】提交處理出錯:', err);
                    alert('發生錯誤，請重試: ' + err.message);
                }
            });
        }
    } else if (window.location.href.toLowerCase().includes('results.html')) {
        console.log('【診斷】在結果頁面，初始化產品顯示');
        
        try {
            // 顯示推薦產品
            displayRecommendedProducts();
            
            // 顯示相關產品
            displayRelatedProducts();
            
            // 生成使用時間表
            generateUsageTimeline();
            
            // 生成注意事項列表
            generateCautionsList();
            
            // 更新頁面上的選擇摘要
            updateSelectionSummary();
            
            console.log('結果頁面渲染完成');
        } catch (error) {
            console.error('結果頁面處理錯誤:', error);
            displayError('處理結果頁面時發生錯誤: ' + error.message);
        }
    } else {
        console.log('【診斷】在其他頁面，執行通用初始化');
        // 在其他頁面只初始化對話框動畫
        initChatMessageAnimation();
    }
});

/**
 * 初始化事件監聽器（僅用於聊天頁面）
 */
function initEventListeners() {
    // 只在聊天頁面執行
    if (!window.location.href.toLowerCase().includes('chat.html')) {
        console.log('【調試】非聊天頁面，跳過事件監聽器初始化');
        return;
    }
    
    try {
        console.log('【調試】開始初始化聊天頁面事件監聽器');
        
        // 綁定健康需求選項按鈕
        console.log('【調試】初始化健康需求按鈕');
        bindOptionButtons('button[data-type="health-need"]', 'healthNeed', handleHealthNeedSelection);
        
        // 綁定生活型態選項按鈕
        console.log('【調試】初始化生活型態按鈕');
        bindOptionButtons('button[data-type="lifestyle"]', 'lifestyle', handleLifestyleSelection);
        
        // 綁定預算範圍選項
        console.log('【調試】初始化預算按鈕');
        bindOptionButtons('button[data-type="budget"]', 'budget', handleBudgetSelection);
        
        // 確保提交按鈕被綁定
        const submitButton = document.getElementById('submit-selections');
        if (submitButton) {
            console.log('【調試】初始化提交按鈕');
            
            // 移除任何已存在的事件處理器
            const clonedSubmitBtn = submitButton.cloneNode(true);
            submitButton.parentNode.replaceChild(clonedSubmitBtn, submitButton);
            
            // 綁定新的事件處理器
            clonedSubmitBtn.addEventListener('click', function(e) {
                console.log('【調試】點擊了提交按鈕');
                e.preventDefault();
                try {
                    processUserSelectionsAndSubmitForm();
                } catch (err) {
                    console.error('【錯誤】提交處理出錯:', err);
                    alert('發生錯誤，請重試: ' + err.message);
                }
            });
            
            console.log('【調試】完成提交按鈕初始化');
        } else {
            console.warn('【警告】找不到提交按鈕元素 (#submit-selections)');
        }
        
        // 檢查手動跳轉鏈接是否存在
        const manualRedirect = document.getElementById('manual-redirect');
        if (manualRedirect) {
            console.log('【調試】找到手動跳轉按鈕');
        } else {
            console.warn('【警告】找不到手動跳轉按鈕元素 (#manual-redirect)');
        }
        
        console.log('【調試】聊天頁面事件監聽器初始化完成');
    } catch (error) {
        console.error('【錯誤】初始化事件監聽器時發生錯誤:', error);
    }
}

/**
 * 綁定選項按鈕事件
 * @param {string} selector 按鈕選擇器
 * @param {string} dataKey 數據鍵名
 * @param {Function} callback 回調函數
 */
function bindOptionButtons(selector, dataKey, callback) {
    // 使用更清晰的日誌格式便於調試
    console.log(`【調試】開始綁定 ${selector} 按鈕...`);
    
    const buttons = document.querySelectorAll(selector);
    console.log(`【調試】找到 ${buttons.length} 個 ${selector} 按鈕`);
    
    if (buttons.length === 0) {
        console.warn(`【警告】沒有找到符合 ${selector} 的按鈕元素`);
        return;
    }
    
    buttons.forEach((button, index) => {
        console.log(`【調試】處理第 ${index+1} 個按鈕: ${button.dataset.value}`);
        
        // 移除任何已存在的事件處理器以避免重複綁定
        const newButton = button.cloneNode(true);
        console.log(`【調試】創建按鈕複製: ${newButton.dataset.value}`);
        
        // 確保使用父節點替換原始按鈕
        if (button.parentNode) {
            console.log(`【調試】替換按鈕: ${button.dataset.value}`);
            button.parentNode.replaceChild(newButton, button);
            
            // 直接在這裡綁定點擊事件，確保正確的傳參
            newButton.onclick = function(event) {
                event.preventDefault(); // 防止任何默認行為
                console.log(`【調試】按鈕點擊事件觸發: ${this.dataset.value}, 類型: ${dataKey}`);
                
                // 移除其他按鈕的選中狀態
                document.querySelectorAll(`button[data-type="${dataKey}"]`).forEach(btn => {
                    btn.classList.remove('selected');
                });
                
                // 添加當前按鈕的選中狀態
                this.classList.add('selected');
                
                // 存儲用戶選擇
                const value = this.dataset.value;
                userSelections[dataKey] = value;
                
                // 如果是預算，轉換為數字
                if (dataKey === 'budget') {
                    userSelections[dataKey] = parseInt(value, 10);
                }
                
                console.log(`【調試】用戶選擇已更新: ${dataKey} = ${value}`);
                console.log('【調試】當前所有選擇:', userSelections);
                
                // 執行回調
                if (typeof callback === 'function') {
                    console.log(`【調試】執行回調函數: ${callback.name}`);
                    callback(value);
                } else {
                    console.warn(`【警告】${dataKey} 沒有提供回調函數`);
                }
            };
            
            console.log(`【調試】成功綁定按鈕點擊事件: ${newButton.dataset.value}`);
        } else {
            console.error(`【錯誤】按鈕 ${button.dataset.value} 沒有父節點，無法替換`);
        }
    });
    
    // 在綁定後再檢查一次，確保事件綁定成功
    console.log(`【調試】完成 ${selector} 按鈕綁定，總計 ${buttons.length} 個按鈕`);
}

/**
 * 處理健康需求選擇
 * @param {string} healthNeed 選擇的健康需求
 */
function handleHealthNeedSelection(healthNeed) {
    console.log(`【調試】處理健康需求選擇: ${healthNeed}`);
    
    // 存儲到sessionStorage
    sessionStorage.setItem('healthNeed', healthNeed);
    
    try {
        // 更新顯示
        const selectedNeedSpan = document.querySelector('.selected-health-need');
        if (selectedNeedSpan) {
            console.log(`【調試】更新顯示健康需求: ${healthNeed}`);
            selectedNeedSpan.textContent = healthNeed;
        } else {
            console.warn('【警告】找不到健康需求顯示元素 (.selected-health-need)');
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
            
            const feedbackText = feedbacks[healthNeed] || '了解您的健康需求了。';
            console.log(`【調試】更新健康需求反饋: ${feedbackText}`);
            feedbackSpan.textContent = feedbackText;
        } else {
            console.warn('【警告】找不到健康需求反饋元素 (.health-need-feedback)');
        }
        
        // 顯示健康需求回應
        const healthNeedResponse = document.getElementById('health-need-response');
        if (healthNeedResponse) {
            console.log('【調試】顯示健康需求回應元素');
            healthNeedResponse.style.display = 'block';
            healthNeedResponse.classList.add('fade-in');
        } else {
            console.warn('【警告】找不到健康需求回應元素 (#health-need-response)');
        }
        
        // 延遲顯示生活型態選項
        console.log('【調試】延遲800ms顯示生活型態選項');
        setTimeout(() => {
            const lifestyleOptions = document.getElementById('lifestyle-options');
            if (lifestyleOptions) {
                console.log('【調試】顯示生活型態選項');
                lifestyleOptions.style.display = 'block';
                lifestyleOptions.classList.add('fade-in');
                
                // 確保滾動到可見區域
                try {
                    lifestyleOptions.scrollIntoView({ behavior: 'smooth' });
                } catch (scrollError) {
                    console.warn('【警告】滾動到生活型態選項出錯:', scrollError);
                    // 使用備用滾動方法
                    window.scrollBy(0, 200);
                }
            } else {
                console.warn('【警告】找不到生活型態選項元素 (#lifestyle-options)');
            }
        }, 800);
        
        console.log('【調試】健康需求選擇處理完成');
    } catch (error) {
        console.error('【錯誤】處理健康需求選擇時發生錯誤:', error);
        // 嘗試恢復
        try {
            // 顯示簡化版的回應
            const healthNeedResponse = document.getElementById('health-need-response');
            if (healthNeedResponse) {
                healthNeedResponse.style.display = 'block';
            }
            
            // 直接顯示生活型態選項
            const lifestyleOptions = document.getElementById('lifestyle-options');
            if (lifestyleOptions) {
                lifestyleOptions.style.display = 'block';
            }
        } catch (recoveryError) {
            console.error('【錯誤】嘗試恢復時發生錯誤:', recoveryError);
        }
    }
}

/**
 * 處理生活型態選擇
 * @param {string} lifestyle 選擇的生活型態
 */
function handleLifestyleSelection(lifestyle) {
    console.log(`【調試】處理生活型態選擇: ${lifestyle}`);
    
    // 存儲到sessionStorage
    sessionStorage.setItem('lifestyle', lifestyle);
    
    try {
        // 更新顯示
        const selectedLifestyleSpan = document.querySelector('.selected-lifestyle');
        if (selectedLifestyleSpan) {
            console.log(`【調試】更新顯示生活型態: ${lifestyle}`);
            selectedLifestyleSpan.textContent = lifestyle;
        } else {
            console.warn('【警告】找不到生活型態顯示元素 (.selected-lifestyle)');
        }
        
        // 顯示生活型態回應
        const lifestyleResponse = document.getElementById('lifestyle-response');
        if (lifestyleResponse) {
            console.log('【調試】顯示生活型態回應元素');
            lifestyleResponse.style.display = 'block';
            lifestyleResponse.classList.add('fade-in');
        } else {
            console.warn('【警告】找不到生活型態回應元素 (#lifestyle-response)');
        }
        
        // 延遲顯示預算選項
        console.log('【調試】延遲800ms顯示預算選項');
        setTimeout(() => {
            const budgetOptions = document.getElementById('budget-options');
            if (budgetOptions) {
                console.log('【調試】顯示預算選項');
                budgetOptions.style.display = 'block';
                budgetOptions.classList.add('fade-in');
                budgetOptions.scrollIntoView({ behavior: 'smooth' });
            } else {
                console.warn('【警告】找不到預算選項元素 (#budget-options)');
            }
        }, 800);
    } catch (error) {
        console.error('【錯誤】處理生活型態選擇時發生錯誤:', error);
    }
}

/**
 * 處理預算選擇
 * @param {string} budget 選擇的預算
 */
function handleBudgetSelection(budget) {
    console.log(`【調試】處理預算選擇: ${budget}`);
    
    // 存儲到sessionStorage
    sessionStorage.setItem('budget', budget);
    
    try {
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
            console.log(`【調試】更新顯示預算: ${budgetText}`);
            selectedBudgetSpan.textContent = budgetText;
        } else {
            console.warn('【警告】找不到預算顯示元素 (.selected-budget)');
        }
        
        // 顯示預算回應
        const budgetResponse = document.getElementById('budget-response');
        if (budgetResponse) {
            console.log('【調試】顯示預算回應元素');
            budgetResponse.style.display = 'block';
            budgetResponse.classList.add('fade-in');
        } else {
            console.warn('【警告】找不到預算回應元素 (#budget-response)');
        }
        
        // 延遲顯示提交按鈕
        console.log('【調試】延遲800ms顯示提交按鈕');
        setTimeout(() => {
            const submitContainer = document.getElementById('submit-container');
            if (submitContainer) {
                console.log('【調試】顯示提交按鈕');
                submitContainer.style.display = 'block';
                submitContainer.classList.add('fade-in');
                submitContainer.scrollIntoView({ behavior: 'smooth' });
            } else {
                console.warn('【警告】找不到提交按鈕容器 (#submit-container)');
            }
        }, 800);
    } catch (error) {
        console.error('【錯誤】處理預算選擇時發生錯誤:', error);
    }
}

/**
 * 處理用戶選擇並提交表單
 */
async function processUserSelectionsAndSubmitForm() {
    try {
        console.log('【診斷】處理用戶選擇並提交表單');
        console.log('【診斷】當前用戶選擇:', JSON.stringify(userSelections));
        
        // 檢查必要選擇
        if (!userSelections.healthNeed) {
            alert('請選擇您的健康需求');
            return;
        }
        
        // 顯示加載狀態
        showLoadingState();
        
        // 確保推薦引擎已載入
        if (!window.NutriPalRecommender) {
            console.log('【診斷】推薦引擎未載入，嘗試載入...');
            const engineLoaded = await loadRecommendationEngine();
            if (!engineLoaded) {
                throw new Error('無法載入推薦引擎');
            }
        }
        
        // 獲取推薦產品
        let recommendedProducts = [];
        try {
            console.log('【診斷】嘗試取得推薦產品');
            if (userSelections.budget > 0) {
                recommendedProducts = await window.NutriPalRecommender.recommendWithinBudget(
                    userSelections.healthNeed,
                    userSelections.lifestyle,
                    userSelections.budget
                );
            } else {
                recommendedProducts = await window.NutriPalRecommender.recommendProducts(
                    userSelections.healthNeed,
                    userSelections.lifestyle
                );
            }
            console.log('【診斷】成功獲取推薦產品數:', recommendedProducts.length);
        } catch (recError) {
            console.error('【診斷】獲取推薦出錯:', recError);
            // 如果獲取推薦出錯，使用備用測試數據
            recommendedProducts = [
                {
                    id: "test1",
                    name: "備用產品1",
                    brand: "備用品牌",
                    description: "在獲取推薦失敗時使用的備用產品。",
                    price: 350,
                    rating: 4.6,
                    image_url: "https://via.placeholder.com/150",
                    benefits: ["備用功效1", "備用功效2"],
                    usage: "每日1粒，飯後服用",
                    caution: "備用注意事項",
                    ingredients: "備用成分",
                    health_needs: ["改善睡眠品質"],
                    lifestyle_match: ["長時間工作"],
                    iherb_link: "https://tw.iherb.com"
                }
            ];
        }
        
        // 處理推薦結果
        if (recommendedProducts && recommendedProducts.length > 0) {
            console.log('【診斷】準備儲存資料並跳轉頁面');
            
            // 儲存數據到 sessionStorage
            sessionStorage.setItem('recommendedProducts', JSON.stringify(recommendedProducts));
            sessionStorage.setItem('userHealthNeed', userSelections.healthNeed);
            sessionStorage.setItem('userLifestyle', userSelections.lifestyle);
            sessionStorage.setItem('userBudget', userSelections.budget);
            
            console.log('【診斷】嘗試導航到結果頁面');
            
            // 獲取或創建表單
            let form = document.getElementById('navigation-form');
            if (!form) {
                console.log('【診斷】創建新的導航表單');
                form = document.createElement('form');
                form.id = 'navigation-form';
                form.method = 'get';
                form.action = 'results.html';
                form.style.display = 'none';
                document.body.appendChild(form);
            } else {
                console.log('【診斷】使用現有導航表單');
                // 清空現有表單
                form.innerHTML = '';
            }
            
            // 創建並添加表單欄位
            const fields = {
                'health': userSelections.healthNeed || '',
                'lifestyle': userSelections.lifestyle || '',
                'budget': userSelections.budget || 0,
                'time': new Date().getTime()
            };
            
            console.log('【診斷】添加表單欄位:', fields);
            
            // 添加每個欄位到表單
            for (const [name, value] of Object.entries(fields)) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = name;
                input.value = value;
                form.appendChild(input);
            }
            
            try {
                // 提交表單
                console.log('【診斷】提交表單');
                form.submit();
                
                // 如果 3 秒後還在同一頁面，嘗試其他方法
                setTimeout(() => {
                    if (window.location.href.indexOf('results.html') === -1) {
                        console.log('【診斷】導航可能失敗，嘗試替代方法');
                        
                        // 顯示手動跳轉按鈕
                        const manualRedirect = document.getElementById('manual-redirect');
                        if (manualRedirect) {
                            manualRedirect.style.display = 'block';
                            hideLoadingState();
                        }
                        
                        // 再次嘗試直接跳轉
                        setTimeout(() => {
                            console.log('【診斷】嘗試直接跳轉');
                            window.location.href = 'results.html';
                        }, 2000);
                    }
                }, 3000);
            } catch (formError) {
                console.error('【診斷】表單提交出錯，嘗試直接跳轉:', formError);
                window.location.href = 'results.html';
            }
        } else {
            console.warn('【診斷】沒有找到符合條件的產品');
            alert('抱歉，沒有找到符合您需求的保健品。請嘗試調整您的選擇。');
            hideLoadingState();
        }
    } catch (error) {
        console.error('【診斷】處理用戶選擇時出錯:', error);
        alert('發生錯誤，請重試: ' + error.message);
        hideLoadingState();
    }
}

/**
 * 確保推薦引擎已加載
 */
async function loadRecommendationEngine() {
    return new Promise((resolve) => {
        if (window.NutriPalRecommender) {
            console.log('推薦引擎已加載');
            return resolve(true);
        }
        
        console.log('嘗試重新加載推薦引擎');
        const script = document.createElement('script');
        script.src = 'js/models/backup/recommendationEngine.js';
        
        // 添加超時處理
        const timeout = setTimeout(() => {
            console.error('加載推薦引擎超時');
            resolve(false);
        }, 5000);
        
        script.onload = () => {
            console.log('推薦引擎加載成功');
            clearTimeout(timeout);
            resolve(true);
        };
        
        script.onerror = (e) => {
            console.error('無法加載推薦引擎:', e);
            clearTimeout(timeout);
            resolve(false);
        };
        
        document.body.appendChild(script);
    });
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

// 結果頁面處理
if (window.location.pathname.includes('results.html')) {
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('結果頁面已加載');
        try {
            // 確保加載了推薦引擎
            if (!window.NutriPalRecommender) {
                console.log('結果頁面嘗試加載推薦引擎');
                await loadRecommendationEngine();
            }
            
            // ✅ 直接從 products.json 載入產品資料
            console.log('🔄 從 products.json 載入產品資料...');
            let allProducts = [];
            
            try {
                const response = await fetch('data/products/products.json');
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.products && Array.isArray(data.products)) {
                        allProducts = data.products;
                        console.log(`✅ 成功載入 ${allProducts.length} 個產品，包含聯盟連結`);
                        
                        // 檢查第一個產品是否有聯盟連結
                        if (allProducts[0] && allProducts[0].affiliate_link) {
                            console.log('✅ 確認產品包含聯盟連結:', allProducts[0].affiliate_link.substring(0, 50) + '...');
                        }
                    } else {
                        console.warn('⚠️ products.json 資料格式不正確');
                    }
                } else {
                    console.warn('⚠️ 無法載入 products.json，狀態碼:', response.status);
                }
            } catch (fetchError) {
                console.error('❌ 載入 products.json 時出錯:', fetchError);
            }
            
            // 如果無法載入產品資料，使用推薦引擎的備用資料
            if (allProducts.length === 0 && window.NutriPalRecommender) {
                console.log('🔄 嘗試使用推薦引擎載入產品資料...');
                try {
                    allProducts = await window.NutriPalRecommender.getProducts();
                    console.log(`✅ 從推薦引擎載入 ${allProducts.length} 個產品`);
                } catch (engineError) {
                    console.error('❌ 推薦引擎載入失敗:', engineError);
                }
            }
            
            // 獲取用戶選擇的健康需求和生活型態
            const userHealthNeed = sessionStorage.getItem('userHealthNeed') || '改善睡眠品質';
            const userLifestyle = sessionStorage.getItem('userLifestyle') || '長時間工作';
            
            console.log('👤 用戶選擇:', { userHealthNeed, userLifestyle });
            
            // 根據健康需求篩選產品
            let recommendedProducts = [];
            if (allProducts.length > 0) {
                // 篩選符合健康需求的產品
                recommendedProducts = allProducts.filter(product => {
                    if (!product.health_needs) return false;
                    return product.health_needs.some(need => 
                        need.includes(userHealthNeed) || userHealthNeed.includes(need)
                    );
                }).slice(0, 6); // 取前6個產品
                
                console.log(`🎯 根據健康需求篩選出 ${recommendedProducts.length} 個產品`);
                
                // 如果篩選結果太少，補充一些相關產品
                if (recommendedProducts.length < 3) {
                    const additionalProducts = allProducts
                        .filter(p => !recommendedProducts.find(rp => rp.id === p.id))
                        .slice(0, 6 - recommendedProducts.length);
                    recommendedProducts = [...recommendedProducts, ...additionalProducts];
                }
            }
            
            // 如果還是沒有產品，使用預設產品
            if (recommendedProducts.length === 0) {
                console.log('⚠️ 使用預設測試產品');
                recommendedProducts = [
                    {
                        id: "p001",
                        name: "California Gold Nutrition, LactoBif® 30 益生菌，300 億 CFU，60 粒素食膠囊",
                        brand: "California Gold Nutrition",
                        description: "包含8種活性益生菌菌株，有助於維持健康的腸道菌群，支援消化系統和免疫系統健康。",
                        price: 680,
                        rating: 4.7,
                        image_url: "https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/cgn/cgn00965/u/148.jpg",
                        benefits: ["維持腸道健康", "增強免疫力", "促進消化"],
                        usage: "每日 1 粒膠囊，隨食物與否均可。",
                        caution: "放在兒童接觸不到的地方。如果您正在懷孕、哺乳、服用方劑或有某種健康問題，請在使用前諮詢醫生。",
                        health_needs: ["消化系統健康", "增強免疫力"],
                        tags: ["益生菌", "消化健康", "免疫支持"],
                        iherb_link: "https://tw.iherb.com/pr/california-gold-nutrition-lactobif-30-probiotics-30-billion-cfu-60-veggie-capsules/64009",
                        affiliate_link: "https://tinyurl.com/24d9swe3?pid=64009&slug=california-gold-nutrition-lactobif-30-probiotics-30-billion-cfu-60-veggie-capsules&ref=p001"
                    }
                ];
            }
            
            // 儲存推薦產品到 sessionStorage
            const recommendedProductsJson = JSON.stringify(recommendedProducts);
            sessionStorage.setItem('recommendedProducts', recommendedProductsJson);
            sessionStorage.setItem('userHealthNeed', userHealthNeed);
            sessionStorage.setItem('userLifestyle', userLifestyle);
            
            // 檢查數據是否有效JSON
            try {
                JSON.parse(recommendedProductsJson);
            } catch (jsonError) {
                console.error('推薦產品數據無效:', jsonError);
                displayError('推薦產品數據損壞，請重新進行選擇。', true);
                return;
            }
            
            console.log('結果頁面找到推薦產品數據');
            
            // 顯示推薦產品
            displayRecommendedProducts();
            
            // 顯示相關產品
            displayRelatedProducts();
            
            // 生成使用時間表和注意事項
            generateUsageTimeline();
            generateCautionsList();
            
            // 更新頁面上的選擇摘要
            updateSelectionSummary();
            
            console.log('結果頁面渲染完成');
        } catch (error) {
            console.error('結果頁面處理錯誤:', error);
            displayError('處理結果頁面時發生錯誤: ' + error.message);
        }
    });
}

/**
 * 在結果頁面顯示推薦產品
 */
function displayRecommendedProducts() {
    try {
        console.log('【產品】開始顯示推薦產品');
        
        // 獲取產品容器
        const productsContainer = document.querySelector('.product-list') || document.getElementById('recommended-products');
        
        if (!productsContainer) {
            console.error('【產品】找不到產品容器元素');
            displayError('頁面載入出錯，請刷新頁面後重試。');
            return;
        }
        
        // 清空容器
        productsContainer.innerHTML = '';
        
        // 從 sessionStorage 獲取推薦產品
        let recommendedProducts = [];
        try {
            const recommendedProductsJson = sessionStorage.getItem('recommendedProducts');
            console.log('【產品】從sessionStorage獲取數據:', !!recommendedProductsJson);
            
            if (recommendedProductsJson) {
                recommendedProducts = JSON.parse(recommendedProductsJson);
            }
        } catch (e) {
            console.error('【產品】解析sessionStorage數據出錯:', e);
        }
        
        // 如果沒有獲取到數據，使用測試數據
        if (!recommendedProducts || recommendedProducts.length === 0) {
            console.warn('【產品】沒有從sessionStorage獲取到產品數據，使用測試數據');
            
            // 使用測試數據
            recommendedProducts = [
                {
                    id: "test1",
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
                    lifestyle_match: ["經常熬夜", "長時間工作"],
                    iherb_link: "https://tw.iherb.com/pr/natrol-melatonin-3-mg-240-tablets/531"
                },
                {
                    id: "test2",
                    name: "複合鎂配方",
                    brand: "放鬆舒眠",
                    description: "多種形式的鎂元素組合，幫助肌肉放鬆和神經系統平衡，促進睡眠。",
                    price: 480,
                    rating: 4.7,
                    image_url: "https://via.placeholder.com/150",
                    benefits: ["舒緩肌肉緊張", "放鬆神經系統", "幫助深度睡眠"],
                    usage: "睡前1-2小時服用2粒",
                    caution: "大劑量可能導致腹瀉，請從小劑量開始",
                    ingredients: "檸檬酸鎂、甘氨酸鎂、牛磺酸、維生素B6",
                    health_needs: ["改善睡眠品質", "緩解壓力"],
                    lifestyle_match: ["長時間工作", "經常熬夜"],
                    iherb_link: "https://tw.iherb.com/pr/doctor-s-best-high-absorption-magnesium-200-mg-240-tablets-100-mg-per-tablet/16567"
                }
            ];
        }
        
        // 添加每個產品卡片
        if (recommendedProducts.length === 0) {
            productsContainer.innerHTML = '<p class="no-results">沒有找到符合您需求的產品。請嘗試調整您的選擇條件。</p>';
            return;
        }
        
        console.log(`【產品】渲染 ${recommendedProducts.length} 個產品卡片`);
        
        // 使用標準產品卡片渲染每個產品
        recommendedProducts.forEach(product => {
            try {
                const productCard = createProductCard(product);
                productsContainer.appendChild(productCard);
            } catch (cardError) {
                console.error('【產品】創建產品卡片時出錯:', cardError, '產品:', product);
            }
        });
        
        // 暫時移除產品卡點擊事件，避免跑版問題
        /*
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.addEventListener('click', function(e) {
                // 如果點擊的不是詳情按鈕，則整個卡片也可以點擊
                if (!e.target.classList.contains('product-detail-btn') && !e.target.classList.contains('product-purchase-btn')) {
                    const productId = this.getAttribute('data-product-id');
                    if (productId) {
                        showProductDetail(productId);
                    }
                }
            });
        });
        */
        
        // 更新頁面上的選擇摘要
        updateSelectionSummary();
        
    } catch (error) {
        console.error('【產品】顯示推薦產品時出錯:', error);
        displayError('處理產品時發生錯誤: ' + error.message);
    }
}

/**
 * 創建產品卡片元素
 * @param {Object} product - 產品數據
 * @returns {HTMLElement} 產品卡片元素
 */
function createProductCard(product) {
    if (!product) return document.createElement('div');
    
    try {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-product-id', product.id);
        
        // 使用實際的產品圖片
        let imageUrl = product.image_url;
        
        // 如果沒有圖片，嘗試從 iHerb 連結提取
        if (!imageUrl || imageUrl.includes('placeholder')) {
            if (product.iherb_link && product.iherb_link.includes('iherb.com/pr/')) {
                const productSlug = product.iherb_link.split('/pr/')[1]?.split('/')[0];
                if (productSlug) {
                    imageUrl = `https://s3.images-iherb.com/prd/${productSlug}/y/1.jpg`;
                }
            } else {
                // 根據產品名稱使用不同的預設圖片
                if (product.name.includes('褪黑激素') || product.name.includes('melatonin')) {
                    imageUrl = 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=150&h=150&fit=crop&crop=center';
                } else if (product.name.includes('鎂') || product.name.includes('magnesium')) {
                    imageUrl = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&h=150&fit=crop&crop=center';
                } else if (product.name.includes('維生素') || product.name.includes('vitamin')) {
                    imageUrl = 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=150&h=150&fit=crop&crop=center';
                } else if (product.name.includes('茶') || product.name.includes('tea')) {
                    imageUrl = 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=150&h=150&fit=crop&crop=center';
                } else {
                    imageUrl = 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=150&h=150&fit=crop&crop=center';
                }
            }
        }
        
        // 產品評分星級
        const ratingStars = generateRatingStars(product.rating || 0);
        
        // 創建價格顯示
        const priceDisplay = product.price 
            ? `NT$ ${product.price}` 
            : '價格未提供';
        
        // 生成標籤
        let tagsHtml = '';
        if (product.health_needs && product.health_needs.length > 0) {
            tagsHtml += product.health_needs.map(tag => 
                `<span class="product-tag health-tag">${tag}</span>`
            ).join('');
        }
        
        if (product.lifestyle_match && product.lifestyle_match.length > 0) {
            tagsHtml += product.lifestyle_match.map(tag => 
                `<span class="product-tag lifestyle-tag">${tag}</span>`
            ).join('');
        }
        
        // 產品優點列表
        let benefitsHtml = '';
        if (product.benefits && product.benefits.length > 0) {
            benefitsHtml = '<ul class="product-benefits">' +
                product.benefits.map(benefit => `<li>${benefit}</li>`).join('') +
                '</ul>';
        }
        
        // 使用新的聯盟連結按鈕系統
        const purchaseButtonHtml = window.createPurchaseButton 
            ? window.createPurchaseButton(product, '前往購買', 'btn-secondary')
            : `<a href="${product.affiliate_link || product.iherb_link || 'https://iherb.co/UT5tXTvq'}" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 class="btn-secondary" 
                 style="display: inline-block; text-decoration: none; text-align: center;">
                 <i class="fas fa-shopping-cart"></i> 前往購買
               </a>`;
        
        // 設置卡片HTML
        card.innerHTML = `
            <div class="product-image">
                <img src="${imageUrl}" 
                     alt="${product.name}" 
                     loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&h=150&fit=crop&crop=center'; this.onerror=null;">
            </div>
            <div class="product-details">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-brand">${product.brand || '未知品牌'}</p>
                <div class="product-rating">${ratingStars}</div>
                <div class="product-price">${priceDisplay}</div>
                <div class="product-tags">${tagsHtml}</div>
                <p class="product-description">${product.description || '無產品說明'}</p>
                ${benefitsHtml}
                <div class="product-actions">
                    <div class="button-row">
                        ${purchaseButtonHtml}
                    </div>
                    <!-- 暫時隱藏查看詳情按鈕，避免跑版問題
                    <div class="button-row">
                        <button class="btn-outline product-detail-btn" onclick="showProductDetail('${product.id}')">
                            查看詳情
                        </button>
                    </div>
                    -->
                </div>
            </div>
        `;
        
        return card;
    } catch (error) {
        console.error('創建產品卡片出錯:', error, '產品數據:', product);
        const errorCard = document.createElement('div');
        errorCard.className = 'product-card error-card';
        errorCard.innerHTML = `<p>載入產品資訊時出錯</p>`;
        return errorCard;
    }
}

/**
 * 生成評分星星
 * @param {number} rating - 產品評分 (0-5)
 * @returns {string} 星星HTML
 */
function generateRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let starsHtml = '';
    
    // 全星
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }
    
    // 半星
    if (halfStar) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // 空星
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star"></i>';
    }
    
    return `<span class="stars">${starsHtml}</span> <span class="rating-value">${rating.toFixed(1)}</span>`;
}

/**
 * 顯示相關產品
 */
async function displayRelatedProducts() {
    try {
        // 獲取相關產品容器
        const productsContainer = document.getElementById('related-products');
        if (!productsContainer) return;
        
        // 清空容器
        productsContainer.innerHTML = '';
        
        // 從 products.json 載入所有產品
        let allProducts = [];
        try {
            const response = await fetch('data/products/products.json');
            if (response.ok) {
                const data = await response.json();
                if (data && data.products && Array.isArray(data.products)) {
                    allProducts = data.products;
                    console.log(`✅ 延伸資訊載入 ${allProducts.length} 個產品`);
                }
            }
        } catch (fetchError) {
            console.error('❌ 載入延伸產品資料時出錯:', fetchError);
        }
        
        // 如果無法載入產品資料，使用備用資料
        if (allProducts.length === 0) {
            console.warn('⚠️ 使用備用延伸產品資料');
            allProducts = [
                {
                    id: "backup1",
                    name: "GABA 腦鎂寧",
                    brand: "健腦寶",
                    description: "GABA（γ-氨基丁酸）和鎂的複合配方，有助於放鬆神經和改善睡眠質量。",
                    price: 580,
                    rating: 4.6,
                    image_url: "https://via.placeholder.com/150",
                    benefits: ["改善睡眠質量", "舒緩焦慮", "促進大腦放鬆"],
                    usage: "睡前30分鐘服用1-2粒",
                    caution: "孕婦和18歲以下青少年應諮詢醫生後使用",
                    ingredients: "GABA、甘氨酸鎂、維生素B6",
                    health_needs: ["改善睡眠品質", "情緒支持"],
                    lifestyle_match: ["長時間工作", "壓力大"],
                    iherb_link: "https://tw.iherb.com/pr/now-foods-gaba-750-mg-100-veg-capsules/832",
                    affiliate_link: "https://tinyurl.com/backup1"
                }
            ];
        }
        
        // 從 sessionStorage 獲取已推薦的產品ID，避免重複
        const recommendedProductsJson = sessionStorage.getItem('recommendedProducts');
        let recommendedProductIds = [];
        if (recommendedProductsJson) {
            try {
                const recommendedProducts = JSON.parse(recommendedProductsJson);
                recommendedProductIds = recommendedProducts.map(p => p.id);
            } catch (e) {
                console.warn('解析推薦產品ID失敗:', e);
            }
        }
        
        // 獲取用戶的健康需求和生活型態
        const userHealthNeed = sessionStorage.getItem('userHealthNeed') || '';
        const userLifestyle = sessionStorage.getItem('userLifestyle') || '';
        
        // 篩選相關產品（排除已推薦的產品）
        let relatedProducts = allProducts.filter(product => {
            // 排除已推薦的產品
            if (recommendedProductIds.includes(product.id)) {
                return false;
            }
            
            // 檢查是否與用戶需求相關
            let isRelevant = false;
            
            // 檢查健康需求匹配
            if (product.health_needs && userHealthNeed) {
                isRelevant = product.health_needs.some(need => 
                    need.includes(userHealthNeed) || userHealthNeed.includes(need)
                );
            }
            
            // 檢查生活型態匹配
            if (!isRelevant && product.lifestyle_match && userLifestyle) {
                isRelevant = product.lifestyle_match.some(style => 
                    style.includes(userLifestyle) || userLifestyle.includes(style)
                );
            }
            
            return isRelevant;
        });
        
        // 如果相關產品太少，補充一些其他產品
        if (relatedProducts.length < 2) {
            const additionalProducts = allProducts
                .filter(p => !recommendedProductIds.includes(p.id) && 
                           !relatedProducts.find(rp => rp.id === p.id))
                .slice(0, 2 - relatedProducts.length);
            relatedProducts = [...relatedProducts, ...additionalProducts];
        }
        
        // 限制顯示數量
        relatedProducts = relatedProducts.slice(0, 3);
        
        console.log(`🔗 顯示 ${relatedProducts.length} 個延伸產品`);
        
        // 保存延伸產品到全局變量，供詳情查看使用
        window.currentRelatedProducts = relatedProducts;
        
        // 添加相關產品卡片
        relatedProducts.forEach(product => {
            try {
                const productCard = createProductCard(product);
                productsContainer.appendChild(productCard);
            } catch (cardError) {
                console.error('創建延伸產品卡片時出錯:', cardError, '產品:', product);
            }
        });
        
        // 如果沒有相關產品，顯示提示
        if (relatedProducts.length === 0) {
            productsContainer.innerHTML = '<p class="no-results">暫無相關延伸產品資訊</p>';
        }
        
    } catch (error) {
        console.error('顯示相關產品時出錯:', error);
        // 如果出錯，隱藏相關產品部分
        const productsContainer = document.getElementById('related-products');
        if (productsContainer) {
            productsContainer.innerHTML = '<p class="error-message">載入延伸產品時發生錯誤</p>';
        }
    }
}

/**
 * 生成使用時間表
 */
function generateUsageTimeline() {
    console.log('生成使用時間表');
    const timelineContainer = document.getElementById('usage-timeline');
    if (!timelineContainer) return;
    
    timelineContainer.innerHTML = `
        <div class="time-point">
            <i class="fas fa-sun"></i>
            <div>
                <div class="time-header">
                    <div class="time-info">
                        <h4>早晨</h4>
                        <p class="time">06:00 - 09:00</p>
                    </div>
                </div>
                <div class="time-products">
                    <p>建議服用維生素或能量相關補充品</p>
                </div>
            </div>
        </div>
        <div class="time-point">
            <i class="fas fa-utensils"></i>
            <div>
                <div class="time-header">
                    <div class="time-info">
                        <h4>隨餐</h4>
                        <p class="time">用餐時</p>
                    </div>
                </div>
                <div class="time-products">
                    <p>多數補充品可隨餐服用以提高吸收</p>
                </div>
            </div>
        </div>
        <div class="time-point">
            <i class="fas fa-moon"></i>
            <div>
                <div class="time-header">
                    <div class="time-info">
                        <h4>睡前</h4>
                        <p class="time">21:00 - 23:00</p>
                    </div>
                </div>
                <div class="time-products">
                    <p>建議服用幫助睡眠或放鬆的補充品</p>
                </div>
            </div>
        </div>
    `;
}

/**
 * 生成注意事項列表
 */
function generateCautionsList() {
    console.log('生成注意事項列表');
    const cautionsContainer = document.getElementById('product-cautions');
    if (!cautionsContainer) return;
    
    cautionsContainer.innerHTML = `
        <div class="caution-item">
            <i class="fas fa-exclamation-triangle"></i>
            <div>
                <h4>服用前諮詢</h4>
                <p>孕婦、哺乳期婦女或有慢性疾病者，服用前請諮詢醫師</p>
            </div>
        </div>
        <div class="caution-item">
            <i class="fas fa-pills"></i>
            <div>
                <h4>藥物交互作用</h4>
                <p>如正在服用處方藥物，請確認是否有交互作用</p>
            </div>
        </div>
        <div class="caution-item">
            <i class="fas fa-clock"></i>
            <div>
                <h4>按時服用</h4>
                <p>請依照建議劑量和時間服用，避免過量</p>
            </div>
        </div>
    `;
}

/**
 * 更新選擇摘要
 */
function updateSelectionSummary() {
    const healthNeed = sessionStorage.getItem('userHealthNeed') || '改善睡眠品質';
    const lifestyle = sessionStorage.getItem('userLifestyle') || '長時間工作';
    
    const healthNeedElement = document.getElementById('user-health-need');
    const lifestyleElement = document.getElementById('user-lifestyle');
    
    if (healthNeedElement) {
        healthNeedElement.textContent = healthNeed;
    }
    
    if (lifestyleElement) {
        lifestyleElement.textContent = lifestyle;
    }
}

/**
 * 顯示錯誤訊息
 */
function displayError(message, redirectToHome = false) {
    console.error('顯示錯誤:', message);
    
    // 隱藏備用內容
    const fallbackContent = document.getElementById('fallback-content');
    if (fallbackContent) {
        fallbackContent.style.display = 'none';
    }
    
    // 可以在頁面上顯示錯誤訊息
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #ff4444;
        color: white;
        padding: 20px;
        border-radius: 8px;
        z-index: 9999;
        text-align: center;
        max-width: 80%;
    `;
    errorDiv.innerHTML = `
        <h3>發生錯誤</h3>
        <p>${message}</p>
        ${redirectToHome ? '<p><a href="index.html" style="color: white; text-decoration: underline;">返回首頁</a></p>' : ''}
        <button onclick="this.parentNode.remove()" style="background: transparent; border: 1px solid white; color: white; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-top: 10px;">關閉</button>
    `;
    
    document.body.appendChild(errorDiv);
}

/**
 * 顯示產品詳情彈窗
 * @param {string} productId 產品ID
 */
async function showProductDetail(productId) {
    try {
        console.log('【產品】顯示產品詳情:', productId);
        
        let allProducts = [];
        
        // 1. 首先從 products.json 載入完整產品數據
        try {
            const response = await fetch('data/products/products.json');
            if (response.ok) {
                const data = await response.json();
                if (data && data.products && Array.isArray(data.products)) {
                    allProducts = data.products;
                    console.log(`✅ 從 products.json 載入 ${allProducts.length} 個產品用於詳情顯示`);
                }
            }
        } catch (fetchError) {
            console.warn('❌ 載入 products.json 失敗:', fetchError);
        }
        
        // 2. 如果無法從 products.json 載入，嘗試從 sessionStorage 獲取
        if (allProducts.length === 0) {
            console.log('⚠️ 從 sessionStorage 獲取產品數據');
            try {
                // 嘗試從recommendedProducts獲取
                const recommendedJson = sessionStorage.getItem('recommendedProducts');
                if (recommendedJson) {
                    const products = JSON.parse(recommendedJson);
                    allProducts = [...allProducts, ...products];
                }
                
                // 嘗試從全局變量獲取（延伸產品）
                if (window.currentRelatedProducts && Array.isArray(window.currentRelatedProducts)) {
                    allProducts = [...allProducts, ...window.currentRelatedProducts];
                }
            } catch (e) {
                console.error('【產品】從sessionStorage獲取產品數據時出錯:', e);
            }
        }
        
        // 3. 如果還是沒有數據，使用備用測試數據
        if (allProducts.length === 0) {
            console.warn('⚠️ 使用備用測試產品數據');
            allProducts = [
                {
                    id: "test1",
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
                    lifestyle_match: ["經常熬夜", "長時間工作"],
                    iherb_link: "https://tw.iherb.com/pr/natrol-melatonin-3-mg-240-tablets/531",
                    affiliate_link: "https://tinyurl.com/test1"
                }
            ];
        }
        
        console.log(`🔍 在 ${allProducts.length} 個產品中查找 ID: ${productId}`);
        console.log('🔍 可用產品ID:', allProducts.map(p => p.id).join(', '));
        
        // 尋找對應ID的產品
        const product = allProducts.find(p => p.id === productId);
        
        if (!product) {
            console.error('【產品】找不到產品:', productId, '可用ID:', allProducts.map(p => p.id));
            alert('找不到此產品的詳細資訊');
            return;
        }
        
        console.log('✅ 找到產品:', product.name);
        
        // 創建模態彈窗
        let modal = document.getElementById('product-detail-modal');
        
        // 如果模態框不存在，創建它
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'product-detail-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <div class="modal-body">
                        <!-- 產品詳情將在這裡動態生成 -->
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // 添加關閉按鈕事件
            const closeBtn = modal.querySelector('.close-modal');
            closeBtn.addEventListener('click', function() {
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
            });
            
            // 點擊模態框外部也可關閉
            window.addEventListener('click', function(event) {
                if (event.target === modal) {
                    modal.style.display = 'none';
                    document.body.classList.remove('modal-open');
                }
            });
        }
        
        // 生成產品評分星星
        const ratingStars = generateRatingStars(product.rating || 0);
        
        // 生成使用方法和注意事項
        const usageHtml = product.usage ? `<div class="detail-section">
            <h4>使用方法</h4>
            <p>${product.usage}</p>
        </div>` : '';
        

        
        const cautionHtml = product.caution ? `<div class="detail-section">
            <h4>注意事項</h4>
            <p>${product.caution}</p>
        </div>` : '';
        
        const ingredientsHtml = product.ingredients ? `<div class="detail-section">
            <h4>成分</h4>
            <p>${product.ingredients}</p>
        </div>` : '';
        
        // 生成產品功效列表
        let benefitsHtml = '';
        if (product.benefits && product.benefits.length > 0) {
            benefitsHtml = `<div class="detail-section">
                <h4>主要功效</h4>
                <ul>
                    ${product.benefits.map(b => `<li>${b}</li>`).join('')}
                </ul>
            </div>`;
        }
        
        // 生成健康需求和生活型態標籤
        let tagsHtml = '';
        if ((product.health_needs && product.health_needs.length > 0) || 
            (product.lifestyle_match && product.lifestyle_match.length > 0)) {
            
            tagsHtml = `<div class="detail-section">
                <h4>適用於</h4>
                <div class="product-tags detail-tags">`;
            
            if (product.health_needs) {
                tagsHtml += product.health_needs.map(tag => 
                    `<span class="product-tag health-tag">${tag}</span>`
                ).join('');
            }
            
            if (product.lifestyle_match) {
                tagsHtml += product.lifestyle_match.map(tag => 
                    `<span class="product-tag lifestyle-tag">${tag}</span>`
                ).join('');
            }
            
            tagsHtml += `</div></div>`;
        }
        

        
        // 填充模態框內容
        const modalBody = modal.querySelector('.modal-body');
        
        // 清空之前的內容，防止內容累積
        modalBody.innerHTML = '';
        
        // 使用與產品卡片相同的圖片邏輯
        let modalImageUrl = product.image_url;
        if (!modalImageUrl || modalImageUrl.includes('placeholder')) {
            if (product.iherb_link && product.iherb_link.includes('iherb.com/pr/')) {
                const productSlug = product.iherb_link.split('/pr/')[1]?.split('/')[0];
                if (productSlug) {
                    modalImageUrl = `https://s3.images-iherb.com/prd/${productSlug}/y/1.jpg`;
                }
            } else {
                // 根據產品名稱使用不同的預設圖片（高解析度版本）
                if (product.name.includes('褪黑激素') || product.name.includes('melatonin')) {
                    modalImageUrl = 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=center';
                } else if (product.name.includes('鎂') || product.name.includes('magnesium')) {
                    modalImageUrl = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center';
                } else if (product.name.includes('維生素') || product.name.includes('vitamin')) {
                    modalImageUrl = 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=300&h=300&fit=crop&crop=center';
                } else if (product.name.includes('茶') || product.name.includes('tea')) {
                    modalImageUrl = 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=300&h=300&fit=crop&crop=center';
                } else {
                    modalImageUrl = 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=300&fit=crop&crop=center';
                }
            }
        }
        
        modalBody.innerHTML = `
            <div class="product-detail-header">
                <img src="${modalImageUrl}" 
                     alt="${product.name}" 
                     class="product-detail-image"
                     onerror="this.src='https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=300&fit=crop&crop=center'; this.onerror=null;">
                <div class="product-detail-info">
                    <h2>${product.name}</h2>
                    <p class="detail-brand">${product.brand || '未知品牌'}</p>
                    <div class="detail-rating">${ratingStars}</div>
                    <p class="detail-price">NT$ ${product.price || '---'}</p>
                    <div class="detail-purchase-section">
                        ${window.createPurchaseButton 
                            ? window.createPurchaseButton(product, '立即購買', 'btn-primary')
                            : `<a href="${product.iherb_link || 'https://iherb.co/UT5tXTvq'}" 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 class="btn-primary detail-buy-btn" 
                                 style="display: inline-block; text-decoration: none; text-align: center;">
                                 <i class="fas fa-shopping-cart"></i> 立即購買
                               </a>`
                        }
                    </div>
                </div>
            </div>
            <div class="product-detail-description">
                <p>${product.description || '無產品說明'}</p>
            </div>
            ${benefitsHtml}
            ${tagsHtml}
            ${usageHtml}
            ${cautionHtml}
            ${ingredientsHtml}
        `;
        
        // 顯示模態框
        modal.style.display = 'block';
        
        // 防止背景滾動
        document.body.classList.add('modal-open');
        
    } catch (error) {
        console.error('【產品】顯示產品詳情出錯:', error);
        alert('無法顯示產品詳情: ' + error.message);
    }
}

// 折疊/展開頂部免責聲明
function toggleDisclaimer(button) {
    const disclaimer = button.closest('.top-disclaimer');
    disclaimer.classList.toggle('expanded');
    
    // 更新icon
    const icon = button.querySelector('i');
    if (disclaimer.classList.contains('expanded')) {
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    } else {
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    }
}

// 儲存免責聲明顯示狀態到localStorage（未來可添加此功能）
function saveDisclaimerState(isShown) {
    localStorage.setItem('disclaimerShown', isShown);
}

// 頁面載入時檢查免責聲明顯示狀態（未來可添加此功能）
function checkDisclaimerState() {
    const disclaimerShown = localStorage.getItem('disclaimerShown');
    if (disclaimerShown === 'false') {
        document.querySelector('.top-disclaimer').style.display = 'none';
    }
}

/**
 * 初始化對話框漸入動畫
 */
function initChatMessageAnimation() {
    // 只選取需要動畫效果的對話框
    const chatMessages = document.querySelectorAll('.chat-message-animated');
    
    // 使用 setTimeout 添加延遲，使動畫效果更明顯
    chatMessages.forEach((message, index) => {
        setTimeout(() => {
            message.style.opacity = '1';
        }, 100 * (index + 1)); // 每個對話框依序顯示
    });
}