/**
 * iHerb 獎勵連結配置
 * 用於將所有產品連結轉換為獎勵連結，為 NutriPal 帶來收益
 */
const IHERB_REWARD_CONFIG = {
    // 你的 iHerb 推薦代碼 (從獎勵連結 https://iherb.co/UT5tXTvq 推斷)
    // 這是附加到產品 URL 後の關鍵代碼
    rewardCode: 'UT5tXTvq',
    
    // 是否啟用獎勵連結（可用於開關功能）
    enabled: true,
    
    // 備用連結（當原始連結不存在時，導向 iHerb 首頁）
    fallbackUrl: 'https://tw.iherb.com'
};

/**
 * 將產品連結轉換為帶有獎勵代碼的直連產品頁連結
 * @param {string} originalLink - 原始的 iHerb 產品連結
 * @returns {string} 包含獎勵代碼的產品連結，或在無效時返回備用連結
 */
function convertToRewardLink(originalLink) {
    if (!IHERB_REWARD_CONFIG.enabled) {
        // 如果功能停用，返回原始連結或備用連結
        return originalLink || IHERB_REWARD_CONFIG.fallbackUrl;
    }

    if (!originalLink) {
        // 如果沒有提供原始連結，則使用帶有獎勵代碼的 iHerb 首頁
        return `${IHERB_REWARD_CONFIG.fallbackUrl}?rcode=${IHERB_REWARD_CONFIG.rewardCode}`;
    }

    try {
        // 創建一個 URL 對象來處理參數
        const url = new URL(originalLink);

        // 檢查是否已經存在 rcode，如果存在則不重複添加
        if (url.searchParams.has('rcode')) {
            return originalLink;
        }

        // 添加或更新 rcode 參數
        url.searchParams.set('rcode', IHERB_REWARD_CONFIG.rewardCode);

        // 返回包含獎勵代碼的完整產品 URL
        return url.toString();

    } catch (e) {
        console.error('無效的原始產品連結:', originalLink, e);
        // 如果 URL 無效，則回退到帶有獎勵代碼的 iHerb 首頁
        return `${IHERB_REWARD_CONFIG.fallbackUrl}?rcode=${IHERB_REWARD_CONFIG.rewardCode}`;
    }
}

/**
 * 創建帶有獎勵追蹤的產品購買連結 HTML
 * @param {Object} product - 產品對象
 * @returns {string} 完整的購買連結 HTML 字符串
 */
function createPurchaseLink(product) {
    const rewardLink = convertToRewardLink(product.iherb_link);
    
    return `<a href="${rewardLink}" 
               target="_blank" 
               rel="noopener noreferrer"
               class="btn-secondary product-purchase-btn" 
               onclick="trackPurchaseClick('${product.id || 'unknown'}', '${(product.name || '').replace(/'/g, '\\\'')}')"
               style="display: inline-block; text-decoration: none; text-align: center;">
               <i class="fas fa-shopping-cart"></i> 前往 iHerb 購買
            </a>`;
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
    console.log('- 推薦代碼 (rcode):', IHERB_REWARD_CONFIG.rewardCode);
    console.log('- 功能狀態:', IHERB_REWARD_CONFIG.enabled ? '✅ 已啟用' : '❌ 已停用');
    console.log('- 點擊統計:', getClickStats());
}

// 將配置和函數掛載到全域對象，供其他腳本使用
window.IHERB_REWARD_CONFIG = IHERB_REWARD_CONFIG;
window.convertToRewardLink = convertToRewardLink;
window.createPurchaseLink = createPurchaseLink;
window.trackPurchaseClick = trackPurchaseClick;
window.getClickStats = getClickStats;
window.showRewardInfo = showRewardInfo;

// 啟動時顯示配置信息
console.log('🚀 iHerb 獎勵連結系統已載入');
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // 只在非本地環境顯示詳細信息
    showRewardInfo();
} 