/**
 * 自動生成聯盟推薦連結腳本
 * 將 products.json 中的原始 iherb_link 轉換為聯盟推薦連結
 */

const fs = require('fs');
const path = require('path');

// 聯盟配置
const AFFILIATE_CONFIG = {
    baseUrl: 'https://vbshoptrax.com/track/clicks/4032/c627c2bc980422d6fd8dec23d62e9647266f4ddf2aabebf00763b013210652aa8272f4',
    shortUrl: 'https://tinyurl.com/24d9swe3',
    defaultPromoCode: 'GOLD60'
};

/**
 * 將原始 iHerb 連結轉換為聯盟推薦連結
 * @param {string} originalLink - 原始 iHerb 產品連結
 * @param {string} productId - 產品 ID
 * @returns {string} 聯盟推薦連結
 */
function convertToAffiliateLink(originalLink, productId) {
    if (!originalLink || !originalLink.includes('iherb.com/pr/')) {
        return AFFILIATE_CONFIG.shortUrl;
    }
    
    // 提取產品 slug 和 ID
    const matches = originalLink.match(/\/pr\/([^\/]+)\/(\d+)/);
    if (matches) {
        const [, productSlug, iherbId] = matches;
        
        // 生成聯盟連結，包含產品資訊
        return `${AFFILIATE_CONFIG.shortUrl}?pid=${iherbId}&slug=${productSlug}&ref=${productId}`;
    }
    
    return AFFILIATE_CONFIG.shortUrl;
}

/**
 * 處理產品數據並生成聯盟連結
 */
function processProducts() {
    try {
        // 讀取產品數據
        const productsPath = path.join(__dirname, '../data/products/products.json');
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        
        let processedCount = 0;
        let affiliateLinksGenerated = [];
        
        // 處理每個產品
        productsData.products.forEach(product => {
            if (product.iherb_link) {
                // 生成聯盟連結
                const affiliateLink = convertToAffiliateLink(product.iherb_link, product.id);
                
                // 添加聯盟連結欄位
                product.affiliate_link = affiliateLink;
                
                // 記錄處理結果
                affiliateLinksGenerated.push({
                    id: product.id,
                    name: product.name.split(',')[0],
                    brand: product.brand,
                    original_link: product.iherb_link,
                    affiliate_link: affiliateLink
                });
                
                processedCount++;
            }
        });
        
        // 保存更新後的產品數據
        fs.writeFileSync(productsPath, JSON.stringify(productsData, null, 2), 'utf8');
        
        // 生成報告
        const reportPath = path.join(__dirname, '../data/affiliate-links-report.json');
        const report = {
            generated_at: new Date().toISOString(),
            total_products: productsData.products.length,
            processed_products: processedCount,
            affiliate_config: AFFILIATE_CONFIG,
            links: affiliateLinksGenerated
        };
        
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
        
        console.log('✅ 聯盟連結生成完成！');
        console.log(`📊 處理統計：`);
        console.log(`   - 總產品數：${productsData.products.length}`);
        console.log(`   - 已處理：${processedCount}`);
        console.log(`   - 報告文件：${reportPath}`);
        
        return report;
        
    } catch (error) {
        console.error('❌ 處理產品數據時出錯：', error);
        throw error;
    }
}

/**
 * 生成 HTML 預覽頁面
 */
function generatePreviewPage(report) {
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>聯盟連結生成報告 - NutriPal</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: white; padding: 15px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; color: #007bff; }
        .product-list { background: white; border-radius: 8px; overflow: hidden; }
        .product-item { padding: 15px; border-bottom: 1px solid #eee; }
        .product-item:last-child { border-bottom: none; }
        .product-name { font-weight: bold; margin-bottom: 5px; }
        .product-brand { color: #666; font-size: 0.9em; margin-bottom: 10px; }
        .links { display: grid; gap: 10px; }
        .link-row { display: flex; align-items: center; gap: 10px; }
        .link-label { min-width: 80px; font-weight: bold; color: #333; }
        .link { color: #007bff; text-decoration: none; word-break: break-all; }
        .link:hover { text-decoration: underline; }
        .success { color: #28a745; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 NutriPal 聯盟連結生成報告</h1>
        <p>生成時間：${new Date(report.generated_at).toLocaleString('zh-TW')}</p>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <div class="stat-number">${report.total_products}</div>
            <div>總產品數</div>
        </div>
        <div class="stat-card">
            <div class="stat-number success">${report.processed_products}</div>
            <div>已生成連結</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${Math.round(report.processed_products/report.total_products*100)}%</div>
            <div>完成率</div>
        </div>
    </div>
    
    <div class="product-list">
        ${report.links.map(product => `
            <div class="product-item">
                <div class="product-name">${product.name}</div>
                <div class="product-brand">${product.brand} (${product.id})</div>
                <div class="links">
                    <div class="link-row">
                        <span class="link-label">原始：</span>
                        <a href="${product.original_link}" target="_blank" class="link">${product.original_link}</a>
                    </div>
                    <div class="link-row">
                        <span class="link-label">聯盟：</span>
                        <a href="${product.affiliate_link}" target="_blank" class="link">${product.affiliate_link}</a>
                    </div>
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;
    
    const htmlPath = path.join(__dirname, '../affiliate-links-preview.html');
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log(`📄 預覽頁面已生成：${htmlPath}`);
}

// 執行主程序
if (require.main === module) {
    try {
        const report = processProducts();
        generatePreviewPage(report);
        console.log('🎉 所有任務完成！');
    } catch (error) {
        console.error('💥 執行失敗：', error.message);
        process.exit(1);
    }
}

module.exports = { convertToAffiliateLink, processProducts }; 