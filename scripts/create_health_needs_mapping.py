#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
from collections import defaultdict

def create_health_needs_mapping():
    """
    從產品資料中生成健康需求到產品名稱的映射關係
    """
    # 讀取產品資料
    with open('data/products/products.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 創建映射字典
    health_needs_mapping = defaultdict(list)
    
    # 遍歷所有產品
    for product in data['products']:
        product_name = product['name']
        
        # 有些產品可能沒有健康需求分類
        if 'health_needs' in product and product['health_needs']:
            for need in product['health_needs']:
                # 將產品名稱添加到對應的健康需求分類中
                health_needs_mapping[need].append(product_name)
    
    # 將defaultdict轉換為普通dict
    mapping_dict = dict(health_needs_mapping)
    
    # 創建英文鍵名映射
    english_key_mapping = {
        "增強免疫力": "immune_support",
        "骨骼與關節健康": "bone_joint_health",
        "心血管健康": "cardiovascular_health",
        "消化系統健康": "digestive_health",
        "睡眠與放鬆": "sleep_relaxation",
        "大腦與認知": "brain_cognitive",
        "美容養顏": "beauty_skincare",
        "基礎營養": "basic_nutrition",
        "能量與活力": "energy_vitality",
        "肌肉支持": "muscle_support",
        "皮膚、頭髮和指甲健康": "hair_skin_nails",
        "頭髮、皮膚與指甲健康": "hair_skin_nails",
        "關節與骨骼健康": "bone_joint_health",
        "神經系統健康": "nervous_system",
        "抗氧化": "antioxidant_support",
        "抗氧化支持": "antioxidant_support",
        "壓力與睡眠": "stress_sleep",
        "眼睛健康": "eye_health",
        "男性健康": "mens_health",
        "女性健康": "womens_health",
        "血糖健康": "blood_sugar",
        "體重管理": "weight_management",
        "情緒與精神健康": "mood_mental_health",
        "甲狀腺健康": "thyroid_health",
        "綜合維生素": "multivitamin",
        "綜合維他命": "multivitamin",
        "腸道菌群平衡": "gut_microbiome",
        "日常保健": "daily_wellness",
        "抗發炎": "anti_inflammatory",
        "抗發炎需求": "anti_inflammatory",
        "健康老化": "healthy_aging",
        "腦部與認知功能": "brain_cognitive",
        "大腦與認知健康": "brain_cognitive",
        "大腦與認知功能": "brain_cognitive",
        "電解質補充": "electrolyte_balance",
        "嬰幼兒營養": "infant_nutrition",
        "骨骼發育": "bone_development",
        "免疫系統": "immune_support",
        "免疫系統健康": "immune_support",
        "神經系統支持": "nervous_system",
        "運動與恢復": "exercise_recovery",
        "睡眠品質": "sleep_relaxation",
        "睡眠與壓力管理": "stress_sleep",
        "能量代謝": "energy_metabolism",
        "腸胃消化": "digestive_health",
        "特殊腸道需求": "gut_special_needs",
        "皮膚健康": "skin_health",
        "關節健康": "joint_health",
    }
    
    # 建立英文鍵名的映射
    english_mapping = {}
    for zh_key, products in mapping_dict.items():
        en_key = english_key_mapping.get(zh_key, zh_key.lower().replace(' ', '_'))
        
        # 如果英文鍵已存在，合併產品列表
        if en_key in english_mapping:
            english_mapping[en_key].extend(products)
            # 移除重複項
            english_mapping[en_key] = list(set(english_mapping[en_key]))
        else:
            english_mapping[en_key] = products
    
    # 保存映射結果到JSON文件
    output_dir = 'data/mappings'
    os.makedirs(output_dir, exist_ok=True)
    
    # 保存中文鍵名的映射
    with open(f'{output_dir}/health_needs_mapping_zh.json', 'w', encoding='utf-8') as f:
        json.dump(mapping_dict, f, ensure_ascii=False, indent=2)
    
    # 保存英文鍵名的映射
    with open(f'{output_dir}/health_needs_mapping.json', 'w', encoding='utf-8') as f:
        json.dump(english_mapping, f, ensure_ascii=False, indent=2)
    
    print(f"健康需求映射已生成：\n1. {output_dir}/health_needs_mapping.json\n2. {output_dir}/health_needs_mapping_zh.json")
    
    return english_mapping

if __name__ == "__main__":
    create_health_needs_mapping() 