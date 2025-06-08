/**
 * iHerb 獎勵連結配置
 * 
 * ⚠️ 重要說明 ⚠️
 * 當前使用 iHerb Rewards 系統，因為 iHerb Affiliate 申請尚未審核通過
 * 未來 Affiliate 審核通過後，會切換到 Affiliate 系統以獲得更高佣金
 * 
 * 系統類型比較：
 * - Rewards: 4% 佣金，通用追蹤連結，適合個人推薦
 * - Affiliate: 5-10%+ 佣金，可深度連結，適合商業網站
 */
const IHERB_REWARD_CONFIG = {
    // 當前模式：'rewards' 或 'affiliate'
    mode: 'rewards', // 🔄 未來切換為 'affiliate'
    
    // Rewards 系統配置（當前使用）
    rewards: {
        // 你的 iHerb Rewards 推薦連結（通用連結，會跟蹤訪客 7 天內的所有購買）
        rewardLink: 'https://iherb.co/UT5tXTvq',
        commissionRate: '4%'
    },
    
    // Affiliate 系統配置（未來使用，審核通過後啟用）
    affiliate: {
        // 🔮 未來 Affiliate 審核通過後，在此填入 Affiliate 連結或代碼
        affiliateCode: 'YOUR_AFFILIATE_CODE', // 審核通過後更新
        baseUrl: 'https://tw.iherb.com',
        commissionRate: '5-10%+'
    },
    
    // 通用設定
    enabled: true,
    fallbackUrl: 'https://tw.iherb.com'
};

/**
 * 根據當前模式獲取正確的連結生成策略
 */
function getCurrentConfig() {
    return IHERB_REWARD_CONFIG.mode === 'affiliate' 
        ? IHERB_REWARD_CONFIG.affiliate 
        : IHERB_REWARD_CONFIG.rewards;
}

/**
 * 智能獎勵連結轉換 - 支援 Rewards 和 Affiliate 兩種模式
 * 
 * @param {string} originalLink - 原始的 iHerb 產品連結
 * @returns {string} 根據當前模式轉換的連結
 */
function convertToRewardLink(originalLink) {
    if (!IHERB_REWARD_CONFIG.enabled) {
        return originalLink || IHERB_REWARD_CONFIG.fallbackUrl;
    }

    const config = getCurrentConfig();
    
    if (IHERB_REWARD_CONFIG.mode === 'affiliate') {
        // 🔮 未來 Affiliate 模式：將 affiliate code 附加到產品 URL
        if (!originalLink) {
            return `${config.baseUrl}?aff=${config.affiliateCode}`;
        }
        
        try {
            const url = new URL(originalLink);
            if (!url.searchParams.has('aff')) {
                url.searchParams.set('aff', config.affiliateCode);
            }
            return url.toString();
        } catch (e) {
            console.error('無效的產品連結:', originalLink, e);
            return `${config.baseUrl}?aff=${config.affiliateCode}`;
        }
    } else {
        // 當前 Rewards 模式：保持原始產品連結，在背景啟動追蹤
        return originalLink || IHERB_REWARD_CONFIG.fallbackUrl;
    }
}

/**
 * 在背景中載入獎勵連結以啟動追蹤
 * 這個函數會在使用者點擊購買按鈕時被調用
 */
function activateRewardTracking() {
    // 檢查是否已經激活過獎勵追蹤（避免重複）
    if (sessionStorage.getItem('nutripal_reward_activated')) {
        console.log('🎁 獎勵追蹤已激活');
        return Promise.resolve();
    }

    const config = getCurrentConfig();
    
    if (IHERB_REWARD_CONFIG.mode === 'affiliate') {
        // Affiliate 模式不需要背景追蹤，直接返回
        console.log('🎯 Affiliate 模式：無需背景追蹤');
        return Promise.resolve();
    }

    // Rewards 模式：使用 iframe 背景載入
    console.log('🎁 啟動 iHerb 獎勵追蹤 (Rewards 模式)...');
    
    return new Promise((resolve) => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        iframe.src = config.rewardLink;
        
        iframe.onload = () => {
            console.log('✅ iHerb 獎勵追蹤已啟動');
            sessionStorage.setItem('nutripal_reward_activated', 'true');
            
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
    const productLink = convertToRewardLink(product.iherb_link);
    
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
 * 處理購買點擊 - 根據模式執行不同的追蹤策略
 * @param {string} productId - 產品 ID
 * @param {string} productName - 產品名稱
 */
function handlePurchaseClick(productId, productName) {
    console.log(`🛒 使用者準備購買: ${productName} (ID: ${productId})`);
    
    // 只在 Rewards 模式下需要背景啟動追蹤
    if (IHERB_REWARD_CONFIG.mode === 'rewards') {
        activateRewardTracking().then(() => {
            console.log('🎯 獎勵追蹤啟動完成，使用者可以正常購買');
        });
    }
    
    // 追蹤點擊統計
    if (window.trackPurchaseClick) {
        window.trackPurchaseClick(productId, productName);
    }
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
    const config = getCurrentConfig();
    const mode = IHERB_REWARD_CONFIG.mode;
    
    console.log('🎁 NutriPal iHerb 獎勵系統配置:');
    console.log(`- 當前模式: ${mode === 'rewards' ? '🟡 Rewards (暫時)' : '🟢 Affiliate (正式)'}`);
    console.log(`- 佣金率: ${config.commissionRate}`);
    
    if (mode === 'rewards') {
        console.log('- 獎勵連結:', config.rewardLink);
        console.log('- 追蹤狀態:', sessionStorage.getItem('nutripal_reward_activated') ? '✅ 已啟動' : '❌ 未啟動');
        console.log('- ⚠️ 注意: 等待 Affiliate 審核通過後將切換到更高佣金');
    } else {
        console.log('- Affiliate 代碼:', config.affiliateCode);
        console.log('- 基礎 URL:', config.baseUrl);
    }
    
    console.log('- 功能狀態:', IHERB_REWARD_CONFIG.enabled ? '✅ 已啟用' : '❌ 已停用');
    console.log('- 點擊統計:', getClickStats());
}

/**
 * 🔄 未來切換到 Affiliate 模式的快速函數
 * @param {string} affiliateCode - Affiliate 審核通過後獲得的代碼
 */
function switchToAffiliateMode(affiliateCode) {
    IHERB_REWARD_CONFIG.mode = 'affiliate';
    IHERB_REWARD_CONFIG.affiliate.affiliateCode = affiliateCode;
    
    console.log('🎉 已切換到 Affiliate 模式！');
    console.log('- 新的 Affiliate 代碼:', affiliateCode);
    console.log('- 預期佣金率提升至:', IHERB_REWARD_CONFIG.affiliate.commissionRate);
    
    // 清除 Rewards 追蹤狀態
    sessionStorage.removeItem('nutripal_reward_activated');
    
    showRewardInfo();
}

// 將配置和函數掛載到全域對象，供其他腳本使用
window.IHERB_REWARD_CONFIG = IHERB_REWARD_CONFIG;
window.getCurrentConfig = getCurrentConfig;
window.convertToRewardLink = convertToRewardLink;
window.activateRewardTracking = activateRewardTracking;
window.createPurchaseLink = createPurchaseLink;
window.handlePurchaseClick = handlePurchaseClick;
window.trackPurchaseClick = trackPurchaseClick;
window.getClickStats = getClickStats;
window.showRewardInfo = showRewardInfo;
window.switchToAffiliateMode = switchToAffiliateMode;

// 啟動時顯示配置信息
console.log('🚀 iHerb 獎勵連結系統已載入 (Rewards 模式)');
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // 只在非本地環境顯示詳細信息
    showRewardInfo();
} 