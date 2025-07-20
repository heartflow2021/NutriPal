#!/usr/bin/env python3
"""
自動生成聯盟推薦連結腳本
將 products.json 中的原始 iherb_link 轉換為聯盟推薦連結
"""

import json
import os
import re
from datetime import datetime
from urllib.parse import urlparse, parse_qs

# 聯盟配置
AFFILIATE_CONFIG = {
    'baseUrl': 'https://vbshoptrax.com/track/clicks/4032/c627c2bc980422d6fd8dec23d62e9647266f4ddf2aabebf00763b013210652aa8272f4',
    'shortUrl': 'https://tinyurl.com/24d9swe3',
    'defaultPromoCode': 'GOLD60'
}

def convert_to_affiliate_link(original_link, product_id):
    """
    將原始 iHerb 連結轉換為聯盟推薦連結
    """
    if not original_link or 'iherb.com/pr/' not in original_link:
        return AFFILIATE_CONFIG['shortUrl']
    
    # 提取產品 slug 和 ID
    match = re.search(r'/pr/([^/]+)/(\d+)', original_link)
    if match:
        product_slug, iherb_id = match.groups()
        # 生成聯盟連結，包含產品資訊
        return f"{AFFILIATE_CONFIG['shortUrl']}?pid={iherb_id}&slug={product_slug}&ref={product_id}"
    
    return AFFILIATE_CONFIG['shortUrl']

def process_products():
    """
    處理產品數據並生成聯盟連結
    """
    try:
        # 讀取產品數據
        script_dir = os.path.dirname(os.path.abspath(__file__))
        products_path = os.path.join(script_dir, '../data/products/products.json')
        
        with open(products_path, 'r', encoding='utf-8') as f:
            products_data = json.load(f)
        
        processed_count = 0
        affiliate_links_generated = []
        
        # 處理每個產品
        for product in products_data['products']:
            if product.get('iherb_link'):
                # 生成聯盟連結
                affiliate_link = convert_to_affiliate_link(product['iherb_link'], product['id'])
                
                # 添加聯盟連結欄位
                product['affiliate_link'] = affiliate_link
                
                # 記錄處理結果
                affiliate_links_generated.append({
                    'id': product['id'],
                    'name': product['name'].split(',')[0],
                    'brand': product['brand'],
                    'original_link': product['iherb_link'],
                    'affiliate_link': affiliate_link
                })
                
                processed_count += 1
        
        # 保存更新後的產品數據
        with open(products_path, 'w', encoding='utf-8') as f:
            json.dump(products_data, f, ensure_ascii=False, indent=2)
        
        # 生成報告
        report_path = os.path.join(script_dir, '../data/affiliate-links-report.json')
        report = {
            'generated_at': datetime.now().isoformat(),
            'total_products': len(products_data['products']),
            'processed_products': processed_count,
            'affiliate_config': AFFILIATE_CONFIG,
            'links': affiliate_links_generated
        }
        
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        print('✅ 聯盟連結生成完成！')
        print(f'📊 處理統計：')
        print(f'   - 總產品數：{len(products_data["products"])}')
        print(f'   - 已處理：{processed_count}')
        print(f'   - 報告文件：{report_path}')
        
        return report
        
    except Exception as error:
        print(f'❌ 處理產品數據時出錯：{error}')
        raise error

def generate_preview_page(report):
    """
    生成 HTML 預覽頁面
    """
    completion_rate = round(report['processed_products'] / report['total_products'] * 100)
    
    product_items = []
    for product in report['links']:
        product_items.append(f'''
            <div class="product-item">
                <div class="product-name">{product['name']}</div>
                <div class="product-brand">{product['brand']} ({product['id']})</div>
                <div class="links">
                    <div class="link-row">
                        <span class="link-label">原始：</span>
                        <a href="{product['original_link']}" target="_blank" class="link">{product['original_link']}</a>
                    </div>
                    <div class="link-row">
                        <span class="link-label">聯盟：</span>
                        <a href="{product['affiliate_link']}" target="_blank" class="link">{product['affiliate_link']}</a>
                    </div>
                </div>
            </div>
        ''')
    
    html_content = f'''
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>聯盟連結生成報告 - NutriPal</title>
    <style>
        body {{ font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }}
        .header {{ background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }}
        .stats {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }}
        .stat-card {{ background: white; padding: 15px; border-radius: 8px; text-align: center; }}
        .stat-number {{ font-size: 2em; font-weight: bold; color: #007bff; }}
        .product-list {{ background: white; border-radius: 8px; overflow: hidden; }}
        .product-item {{ padding: 15px; border-bottom: 1px solid #eee; }}
        .product-item:last-child {{ border-bottom: none; }}
        .product-name {{ font-weight: bold; margin-bottom: 5px; }}
        .product-brand {{ color: #666; font-size: 0.9em; margin-bottom: 10px; }}
        .links {{ display: grid; gap: 10px; }}
        .link-row {{ display: flex; align-items: center; gap: 10px; }}
        .link-label {{ min-width: 80px; font-weight: bold; color: #333; }}
        .link {{ color: #007bff; text-decoration: none; word-break: break-all; }}
        .link:hover {{ text-decoration: underline; }}
        .success {{ color: #28a745; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 NutriPal 聯盟連結生成報告</h1>
        <p>生成時間：{datetime.fromisoformat(report['generated_at']).strftime('%Y-%m-%d %H:%M:%S')}</p>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <div class="stat-number">{report['total_products']}</div>
            <div>總產品數</div>
        </div>
        <div class="stat-card">
            <div class="stat-number success">{report['processed_products']}</div>
            <div>已生成連結</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">{completion_rate}%</div>
            <div>完成率</div>
        </div>
    </div>
    
    <div class="product-list">
        {''.join(product_items)}
    </div>
</body>
</html>'''
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    html_path = os.path.join(script_dir, '../affiliate-links-preview.html')
    
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f'📄 預覽頁面已生成：{html_path}')

def main():
    """
    主程序
    """
    try:
        report = process_products()
        generate_preview_page(report)
        print('🎉 所有任務完成！')
    except Exception as error:
        print(f'💥 執行失敗：{error}')
        return 1
    return 0

if __name__ == '__main__':
    exit(main()) 