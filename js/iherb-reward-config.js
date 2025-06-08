/**
 * iHerb 獎勵連結配置
 * 用於將所有產品連結轉換為獎勵連結，為 NutriPal 帶來收益
 */
const IHERB_REWARD_CONFIG = {
    // 你的 iHerb Rewards 推薦連結（通用連結，會跟蹤訪客 7 天內的所有購買）
    rewardLink: 'https://iherb.co/UT5tXTvq',
    
    // 是否啟用獎勵連結（可用於開關功能）
    enabled: true,
    
    // 備用連結（當原始連結不存在時，導向 iHerb 首頁）
    fallbackUrl: 'https://tw.iherb.com'
};

/**
 * 重新設計的獎勵連結策略
 * 
 * 由於您使用的是 iHerb Rewards 系統（而非 Affiliate 系統），
 * 該系統的工作原理是：
 * 1. 使用者先點擊您的獎勵連結（在 iHerb 設置 7 天 cookie）
 * 2. 然後使用者可以瀏覽和購買任何產品，都會歸功於您
 * 
 * 為了平衡使用者體驗和獎勵追蹤，我們採用以下策略：
 * - 保持產品連結直接指向產品頁（良好的使用者體驗）
 * - 在頁面上添加明顯的「啟動 iHerb 獎勵」按鈕
 * - 當使用者點擊任何購買按鈕時，先在背景中載入獎勵連結
 * 
 * @param {string} originalLink - 原始的 iHerb 產品連結
 * @returns {string} 保持原始產品連結，但會觸發獎勵追蹤
 */
function convertToRewardLink(originalLink) {
    if (!IHERB_REWARD_CONFIG.enabled) {
        return originalLink || IHERB_REWARD_CONFIG.fallbackUrl;
    }

    // 保持原始產品連結，因為 iHerb Rewards 系統的追蹤是全局的
    return originalLink || IHERB_REWARD_CONFIG.fallbackUrl;
}

/**
 * 新增：在背景中載入獎勵連結以啟動追蹤
 * 這個函數會在使用者點擊購買按鈕時被調用
 */
function activateRewardTracking() {
    // 檢查是否已經激活過獎勵追蹤（避免重複）
    if (sessionStorage.getItem('nutripal_reward_activated')) {
        console.log('🎁 獎勵追蹤已激活');
        return Promise.resolve();
    }

    console.log('🎁 啟動 iHerb 獎勵追蹤...');
    
    return new Promise((resolve) => {
        // 創建隱藏的 iframe 來載入獎勵連結
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        iframe.src = IHERB_REWARD_CONFIG.rewardLink;
        
        iframe.onload = () => {
            console.log('✅ iHerb 獎勵追蹤已啟動');
            sessionStorage.setItem('nutripal_reward_activated', 'true');
            
            // 2 秒後移除 iframe
            setTimeout(() => {
                if (iframe.parentNode) {
                    iframe.parentNode.removeChild(iframe);
                }
            }, 2000);
            
            resolve();
        };
        
        iframe.onerror = () => {
            console.warn('⚠️ 獎勵追蹤啟動失敗，但不影響購買');
            resolve();
        };
        
        document.body.appendChild(iframe);
    });
}

/**
 * 創建帶有獎勵追蹤的產品購買連結 HTML
 * @param {Object} product - 產品對象
 * @returns {string} 完整的購買連結 HTML 字符串
 */
function createPurchaseLink(product) {
    const productLink = product.iherb_link || IHERB_REWARD_CONFIG.fallbackUrl;
    
    return `<a href="${productLink}" 
               target="_blank" 
               rel="noopener noreferrer"
               class="btn-secondary product-purchase-btn" 
               onclick="handlePurchaseClick('${product.id || 'unknown'}', '${(product.name || '').replace(/'/g, '\\\'')}')"
               style="display: inline-block; text-decoration: none; text-align: center;">
               <i class="fas fa-shopping-cart"></i> 前往購買
            </a>`;
}

/**
 * 處理購買點擊 - 先啟動獎勵追蹤，然後打開產品頁
 * @param {string} productId - 產品 ID
 * @param {string} productName - 產品名稱
 */
function handlePurchaseClick(productId, productName) {
    console.log(`🛒 使用者準備購買: ${productName} (ID: ${productId})`);
    
    // 啟動獎勵追蹤
    activateRewardTracking().then(() => {
        console.log('🎯 獎勵追蹤啟動完成，使用者可以正常購買');
    });
    
    // 追蹤點擊統計
    if (window.trackPurchaseClick) {
        window.trackPurchaseClick(productId, productName);
    }
    
    // 正常的連結點擊會自動處理導航，無需額外操作
}

/**
 * 追蹤購買點擊（用於分析和優化）
 * @param {string} productId - 產品 ID
 * @param {string} productName - 產品名稱
 */
function trackPurchaseClick(productId, productName) {
    console.log(`📊 使用者點擊購買: ${productName} (ID: ${productId})`);
    
    // Google Analytics 追蹤（如果有設置）
    if (typeof gtag !== 'undefined') {
        gtag('event', 'purchase_click', {
            'product_id': productId,
            'product_name': productName,
            'referral_source': 'nutripal'
        });
    }
    
    // Facebook Pixel 追蹤（如果有設置）
    if (typeof fbq !== 'undefined') {
        fbq('track', 'InitiateCheckout', {
            content_name: productName,
            content_ids: [productId],
            content_type: 'product'
        });
    }
    
    // 本地統計（可選）
    try {
        const clickStats = JSON.parse(localStorage.getItem('nutripal_click_stats') || '{}');
        const today = new Date().toISOString().split('T')[0];
        
        if (!clickStats[today]) {
            clickStats[today] = 0;
        }
        clickStats[today]++;
        
        localStorage.setItem('nutripal_click_stats', JSON.stringify(clickStats));
    } catch (e) {
        console.warn('無法保存點擊統計:', e);
    }
}

/**
 * 獲取點擊統計（用於後台分析）
 * @returns {Object} 點擊統計數據
 */
function getClickStats() {
    try {
        return JSON.parse(localStorage.getItem('nutripal_click_stats') || '{}');
    } catch (e) {
        return {};
    }
}

/**
 * 顯示獎勵連結信息（調試用）
 */
function showRewardInfo() {
    console.log('🎁 NutriPal iHerb 獎勵連結配置:');
    console.log('- 獎勵連結 (Rewards):', IHERB_REWARD_CONFIG.rewardLink);
    console.log('- 功能狀態:', IHERB_REWARD_CONFIG.enabled ? '✅ 已啟用' : '❌ 已停用');
    console.log('- 獎勵追蹤狀態:', sessionStorage.getItem('nutripal_reward_activated') ? '✅ 已啟動' : '❌ 未啟動');
    console.log('- 點擊統計:', getClickStats());
}

// 將配置和函數掛載到全域對象，供其他腳本使用
window.IHERB_REWARD_CONFIG = IHERB_REWARD_CONFIG;
window.convertToRewardLink = convertToRewardLink;
window.activateRewardTracking = activateRewardTracking;
window.createPurchaseLink = createPurchaseLink;
window.handlePurchaseClick = handlePurchaseClick;
window.trackPurchaseClick = trackPurchaseClick;
window.getClickStats = getClickStats;
window.showRewardInfo = showRewardInfo;

// 啟動時顯示配置信息
console.log('🚀 iHerb 獎勵連結系統已載入 (Rewards 模式)');
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // 只在非本地環境顯示詳細信息
    showRewardInfo();
} 