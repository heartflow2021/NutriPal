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
    
    // 初始化頁面事件監聽器
    initEventListeners();
    
    // 如果在聊天頁面，添加隱藏的表單來幫助導航
    if (window.location.href.toLowerCase().includes('chat.html')) {
        console.log('【診斷】在聊天頁面添加輔助表單');
        
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
        // 結果頁面處理
        console.log('【診斷】在結果頁面初始化產品顯示');
        
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
    }
});

/**
 * 初始化事件監聽器
 */
function initEventListeners() {
    console.log('【調試】開始初始化頁面事件監聽器');
    
    try {
        console.log('【調試】DOM元素檢查: 健康需求按鈕', !!document.querySelector('button[data-type="health-need"]'));
        console.log('【調試】DOM元素檢查: 生活型態按鈕', !!document.querySelector('button[data-type="lifestyle"]'));
        console.log('【調試】DOM元素檢查: 預算按鈕', !!document.querySelector('button[data-type="budget"]'));
        
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
        
        console.log('【調試】所有事件監聽器初始化完成');
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
                    lifestyle_match: ["長時間工作"]
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
        script.src = 'js/recommendationEngine.js';
        
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
            
            // 檢查推薦產品是否存在
            let recommendedProductsJson = sessionStorage.getItem('recommendedProducts');
            
            // 如果 sessionStorage 中沒有數據，創建一些測試數據
            if (!recommendedProductsJson) {
                console.log('【診斷】結果頁面沒有找到推薦產品數據，創建測試數據');
                
                // 添加一些測試數據
                const testProducts = [
                    {
                        id: "result-test1",
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
                        lifestyle_match: ["經常熬夜", "長時間工作"]
                    },
                    {
                        id: "result-test2",
                        name: "複合鎂補充劑",
                        brand: "營養均衡",
                        description: "含多種形式鎂的複合配方，幫助放鬆肌肉，改善睡眠，緩解壓力。",
                        price: 420,
                        rating: 4.5,
                        image_url: "https://via.placeholder.com/150",
                        benefits: ["肌肉放鬆", "改善睡眠", "減輕壓力"],
                        usage: "每日1-2粒，晚餐時服用",
                        caution: "某些形式的鎂可能有輕微腹瀉作用",
                        ingredients: "甘氨酸鎂、檸檬酸鎂、氧化鎂",
                        health_needs: ["改善睡眠品質", "骨骼與關節健康"],
                        lifestyle_match: ["長時間工作", "經常熬夜"]
                    },
                    {
                        id: "result-test3",
                        name: "舒壓草本茶",
                        brand: "自然療法",
                        description: "特調草本茶配方，含纈草根、洋甘菊和薰衣草，幫助放鬆和改善睡眠。",
                        price: 280,
                        rating: 4.3,
                        image_url: "https://via.placeholder.com/150",
                        benefits: ["天然舒緩", "幫助放鬆", "促進睡眠"],
                        usage: "睡前30-60分鐘沖泡一杯",
                        caution: "孕婦應諮詢醫生後使用",
                        ingredients: "纈草根、洋甘菊花、薰衣草、檸檬香蜂草",
                        health_needs: ["改善睡眠品質"],
                        lifestyle_match: ["長時間工作", "壓力大"]
                    }
                ];
                
                // 儲存到 sessionStorage
                recommendedProductsJson = JSON.stringify(testProducts);
                sessionStorage.setItem('recommendedProducts', recommendedProductsJson);
                
                // 設置其他必要數據
                if (!sessionStorage.getItem('userHealthNeed')) {
                    sessionStorage.setItem('userHealthNeed', '改善睡眠品質');
                }
                
                if (!sessionStorage.getItem('userLifestyle')) {
                    sessionStorage.setItem('userLifestyle', '長時間工作');
                }
            }
            
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
                    lifestyle_match: ["經常熬夜", "長時間工作"]
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
                    lifestyle_match: ["長時間工作", "經常熬夜"]
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
        
        // 添加產品卡點擊事件
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.addEventListener('click', function(e) {
                // 如果點擊的不是詳情按鈕，則整個卡片也可以點擊
                if (!e.target.classList.contains('product-detail-btn')) {
                    const productId = this.getAttribute('data-product-id');
                    if (productId) {
                        showProductDetail(productId);
                    }
                }
            });
        });
        
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
        
        // 使用預設圖片如果沒有提供
        const imageUrl = product.image_url || 'https://via.placeholder.com/150?text=產品圖片';
        
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
        
        // 設置卡片HTML
        card.innerHTML = `
            <div class="product-image">
                <img src="${imageUrl}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-details">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-brand">${product.brand || '未知品牌'}</p>
                <div class="product-rating">${ratingStars}</div>
                <div class="product-price">${priceDisplay}</div>
                <div class="product-tags">${tagsHtml}</div>
                <p class="product-description">${product.description || '無產品說明'}</p>
                ${benefitsHtml}
                <button class="btn-secondary product-detail-btn" onclick="showProductDetail('${product.id}')">
                    查看詳情
                </button>
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
function displayRelatedProducts() {
    try {
        // 獲取相關產品容器
        const productsContainer = document.getElementById('related-products');
        if (!productsContainer) return;
        
        // 從 sessionStorage 獲取已推薦的產品
        const recommendedProductsJson = sessionStorage.getItem('recommendedProducts');
        if (!recommendedProductsJson) return;
        
        const recommendedProducts = JSON.parse(recommendedProductsJson);
        if (!recommendedProducts || recommendedProducts.length === 0) return;
        
        // 創建相關產品測試數據
        // 在實際應用中，這應該由一個更復雜的相關產品推薦算法來提供
        const relatedProducts = [
            {
                id: "related1",
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
                lifestyle_match: ["長時間工作", "壓力大"]
            },
            {
                id: "related2",
                name: "複合B群加強配方",
                brand: "活力源",
                description: "高劑量B群配方，特別添加B5和B6，幫助緩解工作壓力和疲勞。",
                price: 450,
                rating: 4.3,
                image_url: "https://via.placeholder.com/150",
                benefits: ["提升精力", "緩解壓力", "支持神經系統"],
                usage: "早餐後服用1粒",
                caution: "如有特殊疾病請先諮詢醫生",
                ingredients: "維生素B1、B2、B3、B5、B6、B12、葉酸、生物素",
                health_needs: ["提升能量", "緩解疲勞"],
                lifestyle_match: ["長時間工作", "經常熬夜"]
            }
        ];
        
        // 清空容器
        productsContainer.innerHTML = '';
        
        // 添加相關產品卡片
        relatedProducts.forEach(product => {
            const productCard = createProductCard(product);
            productsContainer.appendChild(productCard);
        });
        
        // 如果沒有相關產品，隱藏相關產品部分
        if (relatedProducts.length === 0) {
            const relatedSection = document.querySelector('h2:contains("延伸相關選擇")');
            if (relatedSection) {
                relatedSection.style.display = 'none';
            }
            productsContainer.style.display = 'none';
        }
        
    } catch (error) {
        console.error('顯示相關產品時出錯:', error);
        // 如果出錯，隱藏相關產品部分
        const productsContainer = document.getElementById('related-products');
        if (productsContainer) {
            productsContainer.style.display = 'none';
        }
    }
}

/**
 * 生成保健品使用時間表
 */
function generateUsageTimeline() {
    try {
        const timelineContainer = document.getElementById('usage-timeline');
        if (!timelineContainer) return;
        
        // 從 sessionStorage 獲取推薦產品
        const recommendedProductsJson = sessionStorage.getItem('recommendedProducts');
        if (!recommendedProductsJson) return;
        
        const recommendedProducts = JSON.parse(recommendedProductsJson);
        if (!recommendedProducts || recommendedProducts.length === 0) return;
        
        // 清空容器
        timelineContainer.innerHTML = '';
        
        // 創建時間點
        const timePoints = [
            { id: 'morning', label: '早晨', icon: 'fa-sun', time: '06:00 - 09:00' },
            { id: 'noon', label: '中午', icon: 'fa-mug-hot', time: '11:30 - 13:30' },
            { id: 'evening', label: '晚上', icon: 'fa-moon', time: '18:00 - 20:00' },
            { id: 'before-sleep', label: '睡前', icon: 'fa-bed', time: '21:00 - 23:00' }
        ];
        
        // 為每個時間點分配產品
        timePoints.forEach(point => {
            // 創建時間點容器
            const timePoint = document.createElement('div');
            timePoint.className = 'time-point';
            
            // 根據產品使用說明決定在哪個時間點顯示
            const productsForThisTime = recommendedProducts.filter(product => {
                const usage = (product.usage || '').toLowerCase();
                
                switch (point.id) {
                    case 'morning': 
                        return usage.includes('早上') || 
                               usage.includes('早晨') || 
                               usage.includes('早餐');
                    case 'noon': 
                        return usage.includes('中午') || 
                               usage.includes('午餐') || 
                               usage.includes('午');
                    case 'evening': 
                        return usage.includes('晚上') || 
                               usage.includes('晚餐') || 
                               usage.includes('晚');
                    case 'before-sleep': 
                        return usage.includes('睡前') || 
                               usage.includes('就寢') || 
                               usage.includes('睡覺');
                    default: 
                        return false;
                }
            });
            
            // 如果這個時間點沒有產品，使用簡單格式
            if (productsForThisTime.length === 0) {
                timePoint.innerHTML = `
                    <div class="time-header">
                        <i class="fas ${point.icon}"></i>
                        <div class="time-info">
                            <h4>${point.label}</h4>
                            <p class="time">${point.time}</p>
                        </div>
                    </div>
                    <div class="time-products empty">
                        <p>此時段無需服用保健品</p>
                    </div>
                `;
            } else {
                // 創建產品列表
                const productsList = productsForThisTime.map(product => `
                    <div class="timeline-product">
                        <div class="product-icon">
                            <img src="${product.image_url || 'https://via.placeholder.com/40'}" alt="${product.name}">
                        </div>
                        <div class="product-info">
                            <h5>${product.name}</h5>
                            <p>${product.usage || '每日服用一次'}</p>
                        </div>
                    </div>
                `).join('');
                
                timePoint.innerHTML = `
                    <div class="time-header">
                        <i class="fas ${point.icon}"></i>
                        <div class="time-info">
                            <h4>${point.label}</h4>
                            <p class="time">${point.time}</p>
                        </div>
                    </div>
                    <div class="time-products">
                        ${productsList}
                    </div>
                `;
            }
            
            timelineContainer.appendChild(timePoint);
        });
        
    } catch (error) {
        console.error('生成使用時間表時出錯:', error);
    }
}

/**
 * 生成保健品注意事項列表
 */
function generateCautionsList() {
    try {
        const cautionsContainer = document.getElementById('product-cautions');
        if (!cautionsContainer) return;
        
        // 從 sessionStorage 獲取推薦產品
        const recommendedProductsJson = sessionStorage.getItem('recommendedProducts');
        if (!recommendedProductsJson) return;
        
        const recommendedProducts = JSON.parse(recommendedProductsJson);
        if (!recommendedProducts || recommendedProducts.length === 0) return;
        
        // 清空容器
        cautionsContainer.innerHTML = '';
        
        // 標題
        const title = document.createElement('h3');
        title.textContent = '服用注意事項';
        cautionsContainer.appendChild(title);
        
        // 創建注意事項列表
        const cautionsList = document.createElement('ul');
        cautionsList.className = 'cautions-list';
        
        // 添加每個產品的注意事項
        recommendedProducts.forEach(product => {
            if (product.caution) {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <span class="product-name">${product.name}:</span> 
                    ${product.caution}
                `;
                cautionsList.appendChild(listItem);
            }
        });
        
        // 如果沒有注意事項，顯示預設消息
        if (cautionsList.children.length === 0) {
            const defaultMsg = document.createElement('p');
            defaultMsg.textContent = '選擇的產品沒有特別的注意事項。一般建議遵循產品包裝上的指示使用。';
            cautionsContainer.appendChild(defaultMsg);
        } else {
            cautionsContainer.appendChild(cautionsList);
        }
        
    } catch (error) {
        console.error('生成注意事項列表時出錯:', error);
    }
}

/**
 * 更新選擇顯示
 */
function updateSelectionDisplay() {
    try {
        console.log('更新選擇顯示');
        
        // 尋找顯示健康需求的元素
        const healthNeedElement = document.querySelector('.health-need-display');
        const lifestyleElement = document.querySelector('.lifestyle-display');
        
        if (healthNeedElement) {
            // 從 sessionStorage 獲取健康需求
            const healthNeed = sessionStorage.getItem('userHealthNeed') || 
                              sessionStorage.getItem('healthNeed') || 
                              '改善健康';
            
            console.log('顯示健康需求:', healthNeed);
            
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
        } else {
            console.warn('找不到健康需求顯示元素');
        }
        
        if (lifestyleElement) {
            // 從 sessionStorage 獲取生活型態
            const lifestyle = sessionStorage.getItem('userLifestyle') || 
                             sessionStorage.getItem('lifestyle') || 
                             '一般生活型態';
            
            console.log('顯示生活型態:', lifestyle);
            
            // 更新顯示
            lifestyleElement.textContent = lifestyle;
        } else {
            console.warn('找不到生活型態顯示元素');
        }
    } catch (error) {
        console.error('更新選擇顯示時出錯:', error);
    }
}

/**
 * 顯示錯誤訊息
 * @param {string} message 錯誤訊息
 * @param {boolean} showReturnButton 是否顯示返回按鈕
 */
function displayError(message, showReturnButton = true) {
    try {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-message';
        errorContainer.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
            ${showReturnButton ? '<a href="chat.html" class="btn-primary">返回選擇</a>' : ''}
        `;
        
        // 找一個合適的容器來顯示錯誤
        const container = document.querySelector('.app-content') || document.body;
        
        // 清空容器並顯示錯誤
        if (container) {
            container.innerHTML = '';
            container.appendChild(errorContainer);
            
            // 如果頁面滾動到頂部
            window.scrollTo(0, 0);
        } else {
            // 如果找不到容器，使用alert顯示錯誤
            alert('錯誤: ' + message);
        }
    } catch (e) {
        // 最後的保障：如果顯示錯誤也出錯，使用alert
        console.error('顯示錯誤訊息時失敗:', e);
        alert('發生錯誤: ' + message);
    }
}

/**
 * 更新頁面上的選擇摘要
 */
function updateSelectionSummary() {
    try {
        // 獲取用戶選擇數據
        const healthNeed = sessionStorage.getItem('userHealthNeed');
        const lifestyle = sessionStorage.getItem('userLifestyle');
        
        // 更新摘要描述區域
        const summaryElem = document.querySelector('.selection-summary') || document.querySelector('.recommendation-header');
        if (summaryElem) {
            const healthNeedText = healthNeed ? `「${healthNeed}」` : '';
            const lifestyleText = lifestyle ? `「${lifestyle}」` : '';
            
            if (healthNeedText && lifestyleText) {
                summaryElem.textContent = `根據你選擇的 ${healthNeedText} 需求，以及 ${lifestyleText} 的生活型態，以下是我整理的熱門保健品資訊。`;
            } else if (healthNeedText) {
                summaryElem.textContent = `根據你選擇的 ${healthNeedText} 需求，以下是我整理的熱門保健品資訊。`;
            } else if (lifestyleText) {
                summaryElem.textContent = `根據你 ${lifestyleText} 的生活型態，以下是我整理的熱門保健品資訊。`;
            }
        }
    } catch (error) {
        console.error('更新選擇摘要時出錯:', error);
    }
}

/**
 * 顯示產品詳情彈窗
 * @param {string} productId 產品ID
 */
function showProductDetail(productId) {
    try {
        console.log('【產品】顯示產品詳情:', productId);
        
        // 首先從sessionStorage嘗試獲取產品數據
        let allProducts = [];
        let products = [];
        
        try {
            // 嘗試從recommendedProducts獲取
            const recommendedJson = sessionStorage.getItem('recommendedProducts');
            if (recommendedJson) {
                products = JSON.parse(recommendedJson);
                allProducts = [...products];
            }
            
            // 嘗試從relatedProducts獲取
            const relatedJson = sessionStorage.getItem('relatedProducts');
            if (relatedJson) {
                const relatedProducts = JSON.parse(relatedJson);
                allProducts = [...allProducts, ...relatedProducts];
            }
        } catch (e) {
            console.error('【產品】從sessionStorage獲取產品數據時出錯:', e);
        }
        
        // 如果沒有產品數據，使用測試數據
        if (allProducts.length === 0) {
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
                    lifestyle_match: ["經常熬夜", "長時間工作"]
                }
            ];
        }
        
        // 尋找對應ID的產品
        const product = allProducts.find(p => p.id === productId);
        
        if (!product) {
            console.error('【產品】找不到產品:', productId);
            alert('找不到此產品的詳細資訊');
            return;
        }
        
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
            });
            
            // 點擊模態框外部也可關閉
            window.addEventListener('click', function(event) {
                if (event.target === modal) {
                    modal.style.display = 'none';
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
        modalBody.innerHTML = `
            <div class="product-detail-header">
                <img src="${product.image_url || 'https://via.placeholder.com/300?text=產品圖片'}" 
                     alt="${product.name}" class="product-detail-image">
                <div class="product-detail-info">
                    <h2>${product.name}</h2>
                    <p class="detail-brand">${product.brand || '未知品牌'}</p>
                    <div class="detail-rating">${ratingStars}</div>
                    <p class="detail-price">NT$ ${product.price || '---'}</p>
                    <button class="btn-primary detail-buy-btn">
                        <i class="fas fa-shopping-cart"></i> 前往購買
                    </button>
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
        
    } catch (error) {
        console.error('【產品】顯示產品詳情出錯:', error);
        alert('無法顯示產品詳情: ' + error.message);
    }
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