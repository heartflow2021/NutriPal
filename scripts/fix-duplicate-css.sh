#!/bin/bash

# 提示開始
echo "開始修復文章頁面中重複的CSS引用..."

# 遍歷文章目錄下的所有HTML文件
for file in articles/*.html; do
  echo "檢查文件: $file"
  
  # 直接編輯文件，移除重複的CSS引用行
  if grep -q "article.css.*article.css" "$file"; then
    # 使用 awk 移除重複的 article.css 引用
    awk '!/<link rel="stylesheet" href="..\/css\/article.css">/ || !seen[$0]++' "$file" > "$file.tmp"
    mv "$file.tmp" "$file"
    echo "🔧 修復了重複的CSS引用: $file"
  else
    echo "✅ 無需修復: $file"
  fi
done

echo "所有文章頁面的重複CSS引用已修復完成！" 