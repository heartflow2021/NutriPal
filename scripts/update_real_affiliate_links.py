#!/usr/bin/env python3
"""
更新真實聯盟連結腳本
基於用戶提供的真實 iHerb 聯盟後台格式更新產品連結
"""

import json
import os
import urllib.parse
from datetime import datetime

# 真實的聯盟配置（基於用戶提供的資料）
REAL_AFFILIATE_CONFIG = {
    'tracking_domains': [
        'https://vbtrax.com/track/clicks/4032/c627c2bc980422d6fd8dec23d62e9647266f4ddf2aabebf00763b013210652aa8272f4',
        'https://abzcoupon.com/track/clicks/4032/c627c2bc980422d6fd8dec23d62e9647266f4ddf2aabebf00763b013210652aa8272f4'
    ],
    'known_short_links': {
        'p001': 'https://tinyurl.com/2xpolt8s',  # California Gold Nutrition LactoBif
        'p002': 'https://tinyurl.com/2cjjj9wp'   # California Gold Nutrition CollagenUP
    }
}

def generate_affiliate_link(original_link, product_id, use_domain_index=0):
    """
    生成真實的聯盟追蹤連結
    """
    if not original_link or 'iherb.com' not in original_link:
        return None
    
    # 檢查是否已有預設的短連結
    if product_id in REAL_AFFILIATE_CONFIG['known_short_links']:
        return REAL_AFFILIATE_CONFIG['known_short_links'][product_id]
    
    # 使用指定的追蹤域名
    tracking_domain = REAL_AFFILIATE_CONFIG['tracking_domains'][use_domain_index % len(REAL_AFFILIATE_CONFIG['tracking_domains'])]
    
    # URL 編碼原始連結
    encoded_target = urllib.parse.quote(original_link, safe='')
    
    # 生成完整的聯盟連結
    affiliate_link = f"{tracking_domain}?t={encoded_target}"
    
    return affiliate_link

def update_products_with_real_affiliate_links():
    """
    更新產品資料中的聯盟連結
    """
    try:
        # 讀取產品資料
        script_dir = os.path.dirname(os.path.abspath(__file__))
        products_path = os.path.join(script_dir, '../data/products/products.json')
        
        with open(products_path, 'r', encoding='utf-8') as f:
            products_data = json.load(f)
        
        updated_count = 0
        real_links_count = 0
        generated_links_count = 0
        
        # 更新每個產品
        for i, product in enumerate(products_data['products']):
            if product.get('iherb_link'):
                product_id = product['id']
                
                # 檢查是否已有真實的短連結
                if product_id in REAL_AFFILIATE_CONFIG['known_short_links']:
                    product['affiliate_link'] = REAL_AFFILIATE_CONFIG['known_short_links'][product_id]
                    real_links_count += 1
                    print(f"✅ {product_id}: 使用真實短連結")
                else:
                    # 生成聯盟連結，輪流使用不同的追蹤域名
                    affiliate_link = generate_affiliate_link(
                        product['iherb_link'], 
                        product_id, 
                        use_domain_index=i
                    )
                    if affiliate_link:
                        product['affiliate_link'] = affiliate_link
                        generated_links_count += 1
                        print(f"🔗 {product_id}: 生成聯盟連結")
                
                updated_count += 1
        
        # 保存更新後的產品資料
        with open(products_path, 'w', encoding='utf-8') as f:
            json.dump(products_data, f, ensure_ascii=False, indent=2)
        
        # 生成報告
        report = {
            'updated_at': datetime.now().isoformat(),
            'total_products': len(products_data['products']),
            'updated_products': updated_count,
            'real_short_links': real_links_count,
            'generated_links': generated_links_count,
            'affiliate_config': REAL_AFFILIATE_CONFIG
        }
        
        report_path = os.path.join(script_dir, '../data/real-affiliate-update-report.json')
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        print('\n' + '='*50)
        print('✅ 真實聯盟連結更新完成！')
        print(f'📊 處理統計：')
        print(f'   - 總產品數：{len(products_data["products"])}')
        print(f'   - 已更新：{updated_count}')
        print(f'   - 真實短連結：{real_links_count}')
        print(f'   - 生成連結：{generated_links_count}')
        print(f'   - 報告文件：{report_path}')
        
        return report
        
    except Exception as error:
        print(f'❌ 更新聯盟連結時出錯：{error}')
        raise error

def generate_link_template():
    """
    生成連結模板，方便用戶填入更多真實短連結
    """
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        products_path = os.path.join(script_dir, '../data/products/products.json')
        
        with open(products_path, 'r', encoding='utf-8') as f:
            products_data = json.load(f)
        
        template_lines = [
            "# iHerb 聯盟連結模板",
            "# 請在 iHerb 聯盟後台為以下產品生成短連結，然後更新此腳本",
            "",
            "REAL_AFFILIATE_CONFIG = {",
            "    'known_short_links': {"
        ]
        
        # 已有的短連結
        for product_id, short_link in REAL_AFFILIATE_CONFIG['known_short_links'].items():
            product = next((p for p in products_data['products'] if p['id'] == product_id), None)
            if product:
                template_lines.append(f"        '{product_id}': '{short_link}',  # {product['name'].split(',')[0]}")
        
        template_lines.append("")
        template_lines.append("        # 待新增的產品連結：")
        
        # 需要新增的產品
        for product in products_data['products'][:10]:  # 只顯示前10個作為範例
            if product['id'] not in REAL_AFFILIATE_CONFIG['known_short_links']:
                template_lines.append(f"        # '{product['id']}': 'https://tinyurl.com/XXXXXX',  # {product['name'].split(',')[0]}")
        
        template_lines.extend([
            "    }",
            "}"
        ])
        
        template_path = os.path.join(script_dir, '../AFFILIATE_LINKS_TEMPLATE.py')
        with open(template_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(template_lines))
        
        print(f"📝 連結模板已生成：{template_path}")
        
    except Exception as error:
        print(f'❌ 生成模板時出錯：{error}')

def main():
    """
    主程序
    """
    try:
        print("🔄 開始更新真實聯盟連結...")
        report = update_products_with_real_affiliate_links()
        
        print("\n📝 生成連結模板...")
        generate_link_template()
        
        print('\n🎉 所有任務完成！')
        
        # 顯示前幾個產品的更新結果
        script_dir = os.path.dirname(os.path.abspath(__file__))
        products_path = os.path.join(script_dir, '../data/products/products.json')
        
        with open(products_path, 'r', encoding='utf-8') as f:
            products_data = json.load(f)
        
        print("\n📦 前3個產品的連結狀態：")
        for i, product in enumerate(products_data['products'][:3]):
            print(f"{i+1}. {product['name'].split(',')[0]}")
            print(f"   ID: {product['id']}")
            print(f"   聯盟連結: {product.get('affiliate_link', '無')}")
            print()
        
    except Exception as error:
        print(f'💥 執行失敗：{error}')
        return 1
    return 0

if __name__ == '__main__':
    exit(main()) 