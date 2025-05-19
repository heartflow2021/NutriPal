#!/bin/bash

# 提示開始
echo "開始清理所有文章中的小帕提醒對話框內聯樣式..."

# 遍歷文章目錄下的所有HTML文件
for file in articles/*.html; do
  # 跳過模板文件
  if [[ "$file" == "articles/article-template.html" ]]; then
    echo "跳過模板文件: $file"
    continue
  fi
  
  echo "處理文件: $file"
  
  # 1. 更新小帕提醒對話框樣式
  sed -i '' 's/<div class="chat-message" style="opacity: 1;">/<div class="chat-message">/' "$file"
  sed -i '' 's/<div class="avatar" style="background-color: transparent; padding: 0; display: flex; justify-content: center; align-items: center; overflow: hidden;">/<div class="avatar">/' "$file"
  sed -i '' 's/<p style="margin: 0 0 8px; font-weight: 600;">小帕 PalPal<\/p>/<p>小帕 PalPal<\/p>/' "$file"
  sed -i '' 's/<p style="margin: 0;">/<p>/' "$file"
  
  echo "✅ 已完成: $file"
done

echo "所有文章的小帕提醒對話框樣式已清理完成！" 