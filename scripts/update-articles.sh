#!/bin/bash

# 提示開始
echo "開始處理文章頁面樣式優化..."

# 遍歷文章目錄下的所有HTML文件
for file in articles/*.html; do
  # 忽略已處理的文件和模板文件
  if [[ "$file" == "articles/cardiovascular-office-risk.html" || "$file" == "templates/article-template.html" ]]; then
    echo "跳過已處理文件: $file"
    continue
  fi
  
  echo "處理文件: $file"
  
  # 1. 添加 article.css 引用
  sed -i '' 's/<link rel="stylesheet" href="..\/styles.css">/<link rel="stylesheet" href="..\/styles.css">\n    <link rel="stylesheet" href="..\/css\/article.css">/' "$file"
  
  # 2. 移除 <style>...</style> 代碼段
  sed -i '' '/<style>/,/<\/style>/d' "$file"
  
  # 3. 替換頂部導航內聯樣式為類名
  sed -i '' 's/<a href="..\/knowledge.html" style="color: var(--text-primary); margin-right: 12px;">/<a href="..\/knowledge.html" class="article-nav-back">/' "$file"
  sed -i '' 's/<h1 style="flex: 1; text-align: center; font-weight: 600; font-size: 18px; margin: 0;">/<h1 class="article-nav-title">/' "$file"
  sed -i '' 's/<a href="#" onclick="shareArticle()" style="margin-left: 12px; color: var(--text-primary);" aria-label="分享">/<a href="#" onclick="shareArticle()" class="article-nav-share" aria-label="分享">/' "$file"
  
  # 4. 替換麵包屑導航內聯樣式為類名
  sed -i '' 's/<nav aria-label="麵包屑" class="breadcrumb" style="margin-bottom: 16px; font-size: 12px;">/<nav aria-label="麵包屑" class="breadcrumb">/' "$file"
  sed -i '' 's/<ol style="display: flex; list-style: none; padding: 0; margin: 0;">/<ol>/' "$file"
  
  # 5. 簡化麵包屑導航項目樣式
  sed -i '' 's/<li style="margin-right: 4px;"><a href="..\/index.html" style="color: var(--text-secondary);">/<li><a href="..\/index.html">/' "$file"
  sed -i '' 's/<li style="margin-right: 4px; margin-left: 4px;"><span style="color: var(--text-secondary);">/<li><span>/' "$file"
  sed -i '' 's/<li style="margin-right: 4px; margin-left: 4px;"><a href="..\/knowledge.html" style="color: var(--text-secondary);">/<li><a href="..\/knowledge.html">/' "$file"
  sed -i '' 's/<li style="margin-left: 4px; color: var(--text-primary); font-weight: 600;">/<li>/' "$file"
  
  echo "✅ 已完成: $file"
done

echo "所有文章頁面樣式優化完成！" 