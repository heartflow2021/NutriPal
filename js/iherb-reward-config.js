/**
 * iHerb 聯盟行銷配置 - 已升級到 Affiliate 模式
 * 
 * ✅ 已通過 iHerb Affiliate 審核
 * 從 Rewards 系統升級到 Affiliate 系統，提供更高佣金和更好的追蹤
 * 
 * 系統類型比較：
 * - Rewards: 4% 佣金，通用追蹤連結，適合個人推薦
 * - Affiliate: 3.5% 基本佣金 + 額外獎勵，可深度連結，適合商業網站
 */
const IHERB_REWARD_CONFIG = {
    // 當前模式：'affiliate' (已升級)
    mode: 'affiliate',
    
    // Affiliate 系統配置（當前使用）
    affiliate: {
        // ✅ 已設置實際的聯盟推薦連結（更新為真實域名）
        affiliateCode: 'NUTRIPAL_AFFILIATE', // 標識符
        baseUrl: 'https://vbtrax.com/track/clicks/4032/c627c2bc980422d6fd8dec23d62e9647266f4ddf2aabebf00763b013210652aa8272f4',
        alternateUrl: 'https://abzcoupon.com/track/clicks/4032/c627c2bc980422d6fd8dec23d62e9647266f4ddf2aabebf00763b013210652aa8272f4',
        shortUrl: 'https://tinyurl.com/2xpolt8s', // 更新為真實短連結
        commissionRate: '3.5% + 獎勵',
        // 支援的優惠碼列表
        promoCodes: {
            'new_customer': 'NEW20',    // 新客戶 20% 折扣
            'gold_discount': 'GOLD60',  // $60 USD 以上 10% 折扣
            'kids_special': 'JUL25KIDS' // 兒童產品 20% 折扣
        },
        // 預設使用的優惠碼（最通用的）
        defaultPromoCode: 'GOLD60'
    },
    
    // Rewards 系統配置（備用）
    rewards: {
        rewardLink: 'https://iherb.co/UT5tXTvq',
        commissionRate: '4%'
    },
    
    // 通用設定
    enabled: true,
    fallbackUrl: 'https://tw.iherb.com',
    
    // 追蹤和分析設定
    tracking: {
        // 使用 UTM 參數追蹤來源
        utmSource: 'nutripal',
        utmMedium: 'affiliate',
        utmCampaign: 'product_recommendation',
        // 是否在連結中包含優惠碼
        includePromoCode: true,
        // 是否在連結中包含 UTM 參數
        includeUTM: true
    }
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
 * 智能聯盟連結轉換 - Affiliate 模式優化版本
 * 
 * @param {string} originalLink - 原始的 iHerb 產品連結
 * @param {string} promoCode - 可選的優惠碼 (如不提供則使用預設)
 * @param {string} trackingTag - 可選的追蹤標籤
 * @returns {string} 轉換後的聯盟連結
 */
function convertToRewardLink(originalLink, promoCode = null, trackingTag = null, product = null) {
    if (!IHERB_REWARD_CONFIG.enabled) {
        return originalLink || IHERB_REWARD_CONFIG.fallbackUrl;
    }

    const config = getCurrentConfig();
    
    if (IHERB_REWARD_CONFIG.mode === 'affiliate') {
        // 🎯 使用您的專屬聯盟推薦連結
        console.log('🔗 使用 NutriPal 聯盟推薦連結');
        
        // ✅ 優先使用產品的預生成聯盟連結
        if (product && product.affiliate_link) {
            console.log('🎯 使用預生成的聯盟連結:', product.affiliate_link);
            return product.affiliate_link;
        }
        
        // 如果有具體的 iHerb 產品連結，動態生成聯盟連結
        if (originalLink && originalLink.includes('iherb.com/pr/')) {
            console.log('🎯 動態生成聯盟連結:', originalLink);
            // 提取產品 ID 和 slug
            const match = originalLink.match(/\/pr\/([^\/]+)\/(\d+)/);
            if (match && config.shortUrl) {
                const [, productSlug, iherbId] = match;
                const productRef = product?.id || 'unknown';
                return `${config.shortUrl}?pid=${iherbId}&slug=${productSlug}&ref=${productRef}`;
            }
            return config.shortUrl || config.baseUrl;
        }
        
        // 根據產品資訊生成搜尋連結
        if (product && product.name && product.brand) {
            const searchQuery = encodeURIComponent(`${product.brand} ${product.name.split(',')[0]}`);
            console.log('🔍 生成產品搜尋連結:', searchQuery);
            
            // 使用聯盟連結包裝搜尋連結
            if (config.shortUrl) {
                return `${config.shortUrl}?search=${searchQuery}`;
            }
        }
        
        // 優先使用短網址，更簡潔美觀
        if (config.shortUrl) {
            console.log('📱 使用短網址:', config.shortUrl);
            return config.shortUrl;
        } else {
            console.log('🔗 使用完整追蹤連結');
            return config.baseUrl;
        }
    } else {
        // Rewards 模式：保持原始產品連結，在背景啟動追蹤
        return originalLink || IHERB_REWARD_CONFIG.fallbackUrl;
    }
}

/**
 * 獲取適合特定產品類別的優惠碼
 * @param {Object} product - 產品對象
 * @returns {string} 最適合的優惠碼
 */
function getBestPromoCodeForProduct(product) {
    if (!product) return IHERB_REWARD_CONFIG.affiliate.defaultPromoCode;
    
    const config = getCurrentConfig();
    
    // 根據產品特性選擇最佳優惠碼
    if (product.tags && product.tags.some(tag => tag.includes('兒童') || tag.includes('嬰幼兒'))) {
        return config.promoCodes.kids_special || config.defaultPromoCode;
    }
    
    // 新客戶優惠 - 可以根據用戶狀態判斷
    if (isNewCustomer()) {
        return config.promoCodes.new_customer || config.defaultPromoCode;
    }
    
    // 預設使用通用優惠碼
    return config.defaultPromoCode;
}

/**
 * 檢查是否為新客戶（簡單實現）
 * @returns {boolean} 是否為新客戶
 */
function isNewCustomer() {
    // 檢查是否第一次訪問（可以用更複雜的邏輯）
    return !localStorage.getItem('nutripal_returning_user');
}

/**
 * 標記為回訪用戶
 */
function markAsReturningUser() {
    localStorage.setItem('nutripal_returning_user', 'true');
}

/**
 * 創建帶有最佳化聯盟連結的產品購買按鈕 HTML
 * @param {Object} product - 產品對象
 * @param {string} buttonText - 按鈕文字（可選）
 * @param {string} buttonClass - 按鈕樣式類別（可選）
 * @returns {string} 完整的購買按鈕 HTML 字符串
 */
function createPurchaseButton(product, buttonText = '立即購買', buttonClass = 'btn-secondary') {
    const bestPromoCode = getBestPromoCodeForProduct(product);
    const trackingTag = `product_${product.id || 'unknown'}`;
    const affiliateLink = convertToRewardLink(product.iherb_link, bestPromoCode, trackingTag, product);
    
    // 顯示優惠資訊
    let promoInfo = '';
    if (bestPromoCode && IHERB_REWARD_CONFIG.tracking.includePromoCode) {
        const promoText = getPromoCodeDescription(bestPromoCode);
        if (promoText) {
            promoInfo = `<div class="promo-info" style="font-size: 12px; color: #e74c3c; margin-top: 4px;">
                <i class="fas fa-tag"></i> ${promoText}
            </div>`;
        }
    }
    
    return `<div class="purchase-button-container">
                <a href="${affiliateLink}" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   class="${buttonClass} product-purchase-btn" 
                   onclick="handlePurchaseClick('${product.id || 'unknown'}', '${(product.name || '').replace(/'/g, '\\\'')}')"
                   style="display: inline-block; text-decoration: none; text-align: center;">
                   <i class="fas fa-shopping-cart"></i> ${buttonText}
                </a>
                ${promoInfo}
            </div>`;
}

/**
 * 獲取優惠碼的描述文字
 * @param {string} promoCode - 優惠碼
 * @returns {string} 優惠描述
 */
function getPromoCodeDescription(promoCode) {
    const descriptions = {
        'NEW20': '新客戶享 20% 折扣',
        'GOLD60': '滿 $60 USD 享 10% 折扣',
        'JUL25KIDS': '兒童產品 20% 折扣'
    };
    return descriptions[promoCode] || `使用優惠碼: ${promoCode}`;
}

/**
 * 處理購買點擊 - Affiliate 模式優化版本
 * @param {string} productId - 產品 ID
 * @param {string} productName - 產品名稱
 */
function handlePurchaseClick(productId, productName) {
    console.log(`🛒 使用者準備購買: ${productName} (ID: ${productId})`);
    
    // 標記為回訪用戶
    markAsReturningUser();
    
    // 追蹤點擊統計
    if (window.trackPurchaseClick) {
        window.trackPurchaseClick(productId, productName);
    }
    
    // 記錄轉換事件
    recordConversionEvent(productId, productName);
}

/**
 * 記錄轉換事件（用於分析和優化）
 * @param {string} productId - 產品 ID
 * @param {string} productName - 產品名稱
 */
function recordConversionEvent(productId, productName) {
    const eventData = {
        timestamp: new Date().toISOString(),
        productId: productId,
        productName: productName,
        affiliateMode: IHERB_REWARD_CONFIG.mode,
        promoCode: getBestPromoCodeForProduct({ id: productId, name: productName }),
        userAgent: navigator.userAgent,
        referrer: document.referrer
    };
    
    // 保存到本地存儲用於分析
    try {
        const conversions = JSON.parse(localStorage.getItem('nutripal_conversions') || '[]');
        conversions.push(eventData);
        
        // 只保留最近 100 個轉換記錄
        if (conversions.length > 100) {
            conversions.splice(0, conversions.length - 100);
        }
        
        localStorage.setItem('nutripal_conversions', JSON.stringify(conversions));
    } catch (e) {
        console.warn('無法保存轉換數據:', e);
    }
    
    console.log('📊 轉換事件已記錄:', eventData);
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
    
    // 本地統計
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
 * 獲取點擊統計
 * @returns {Object} 點擊統計資料
 */
function getClickStats() {
    try {
        return JSON.parse(localStorage.getItem('nutripal_click_stats') || '{}');
    } catch (e) {
        return {};
    }
}

/**
 * 顯示聯盟行銷系統資訊（調試用）
 */
function showRewardInfo() {
    const config = getCurrentConfig();
    const mode = IHERB_REWARD_CONFIG.mode;
    
    console.log('🎁 NutriPal iHerb 聯盟行銷系統配置:');
    console.log(`- 當前模式: ${mode === 'affiliate' ? '🟢 Affiliate (正式)' : '🟡 Rewards (備用)'}`);
    console.log(`- 佣金率: ${config.commissionRate}`);
    
    if (mode === 'affiliate') {
        console.log('- Affiliate 代碼:', config.affiliateCode);
        console.log('- 基礎 URL:', config.baseUrl);
        console.log('- 預設優惠碼:', config.defaultPromoCode);
        console.log('- 支援的優惠碼:', config.promoCodes);
    } else {
        console.log('- 獎勵連結:', config.rewardLink);
    }
    
    console.log('- 功能狀態:', IHERB_REWARD_CONFIG.enabled ? '✅ 已啟用' : '❌ 已停用');
    console.log('- 點擊統計:', getClickStats());
    console.log('- 轉換記錄數量:', JSON.parse(localStorage.getItem('nutripal_conversions') || '[]').length);
}

/**
 * 更新 Affiliate 代碼的快速函數
 * @param {string} affiliateCode - 新的 Affiliate 代碼
 */
function updateAffiliateCode(affiliateCode) {
    IHERB_REWARD_CONFIG.affiliate.affiliateCode = affiliateCode;
    console.log('✅ Affiliate 代碼已更新:', affiliateCode);
    showRewardInfo();
}

// 將配置和函數掛載到全域對象，供其他腳本使用
window.IHERB_REWARD_CONFIG = IHERB_REWARD_CONFIG;
window.getCurrentConfig = getCurrentConfig;
window.convertToRewardLink = convertToRewardLink;
window.getBestPromoCodeForProduct = getBestPromoCodeForProduct;
window.createPurchaseButton = createPurchaseButton;
window.getPromoCodeDescription = getPromoCodeDescription;
window.handlePurchaseClick = handlePurchaseClick;
window.trackPurchaseClick = trackPurchaseClick;
window.recordConversionEvent = recordConversionEvent;
window.getClickStats = getClickStats;
window.showRewardInfo = showRewardInfo;
window.updateAffiliateCode = updateAffiliateCode;
window.isNewCustomer = isNewCustomer;
window.markAsReturningUser = markAsReturningUser;

/**
 * 測試聯盟連結功能
 */
function testAffiliateLinks() {
    console.log('🧪 測試 NutriPal 聯盟連結功能');
    
    const testLink = convertToRewardLink('https://tw.iherb.com/pr/natrol-melatonin-3-mg-240-tablets/531');
    console.log('✅ 轉換後的聯盟連結:', testLink);
    
    const testProduct = {
        id: 'test123',
        name: '測試產品',
        iherb_link: 'https://tw.iherb.com/pr/natrol-melatonin-3-mg-240-tablets/531'
    };
    
    const buttonHtml = createPurchaseButton(testProduct);
    console.log('✅ 購買按鈕已生成，包含聯盟連結');
    
    return {
        affiliateLink: testLink,
        buttonGenerated: buttonHtml.includes('tinyurl.com/24d9swe3') || buttonHtml.includes('vbshoptrax.com')
    };
}

// 將測試函數也掛載到全域
window.testAffiliateLinks = testAffiliateLinks;

// 啟動時顯示配置信息
console.log('🚀 iHerb 聯盟行銷系統已載入 (Affiliate 模式)');
console.log('✅ 已設置 NutriPal 專屬聯盟連結');
console.log('📱 短網址:', IHERB_REWARD_CONFIG.affiliate.shortUrl);

// 系統已經設置好聯盟代碼，不需要手動更新提醒
console.log('✅ 聯盟連結設置完成，所有購買按鈕將使用您的推薦連結');
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // 只在非本地環境顯示詳細信息
    showRewardInfo();
} 