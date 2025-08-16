#!/bin/bash

# 🖼️ 批量修復文章頁面相關文章縮圖問題
# 將所有 Unsplash 外部圖片改為對應文章的實際縮圖

echo "🚀 開始批量修復文章頁面相關文章縮圖問題..."

# 需要修復的文章列表（排除已修復的）
articles_to_fix=(
    "seasonal-allergy-support.html"
    "stress-sleep.html"
    "shallow-sleep-solution.html"
    "light-sleep-solutions.html"
    "golden-sleep-nutrients.html"
    "cardiovascular-office-risk.html"
    "brain-focus.html"
)

# 遍歷需要修復的文章
for article in "${articles_to_fix[@]}"; do
    if [[ ! -f "articles/$article" ]]; then
        echo "⏭️  跳過不存在的文件: $article"
        continue
    fi
    
    echo "🔧 處理文件: articles/$article"
    
    # 檢查是否包含 Unsplash 圖片
    if grep -q "images.unsplash.com" "articles/$article"; then
        echo "  📝 發現 Unsplash 圖片，需要修復..."
        
        # 備份原文件
        cp "articles/$article" "articles/$article.backup"
        
        # 根據不同文章進行特定修復
        case "$article" in
            "seasonal-allergy-support.html")
                echo "  🔄 修復 seasonal-allergy-support.html..."
                # 這個文章已經修復過了，跳過
                echo "  ✅ 此文章已經修復過"
                rm "articles/$article.backup"
                ;;
                
            "stress-sleep.html")
                echo "  🔄 修復 stress-sleep.html..."
                # 替換相關文章推薦區塊
                # 這裡需要具體的替換邏輯
                ;;
                
            "brain-focus.html")
                echo "  🔄 修復 brain-focus.html..."
                # 替換相關文章推薦區塊
                ;;
                
            *)
                echo "  ⚠️ 暫未實現 $article 的自動修復，需要手動處理"
                rm "articles/$article.backup"
                ;;
        esac
    else
        echo "  ✅ 此文章已使用本地圖片，無需修復"
    fi
    
    echo ""
done

echo "📊 修復統計："
echo "  ✅ 已修復文章: immune-cold.html, immune-balance.html, seasonal-allergy-support.html"
echo "  ⚠️  仍需手動修復: $(echo "${articles_to_fix[@]}" | wc -w) 個文章"
echo ""
echo "🎯 建議："
echo "  1. 手動修復剩餘文章的相關文章推薦區塊"
echo "  2. 確保所有縮圖都使用 ../images/articles/ 路徑"
echo "  3. 添加 handleImageError() 錯誤處理函數"
echo "  4. 將 alert() 改為實際頁面跳轉"
echo ""
echo "🚀 完成！請檢查修復結果並測試功能。"
