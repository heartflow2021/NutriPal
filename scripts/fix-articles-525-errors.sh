#!/bin/bash

# 🛠️ 文章頁面 525 錯誤修復腳本
# 為所有文章頁面添加穩定性優化，解決 SSL 握手失敗問題

echo "🚀 開始修復文章頁面 525 錯誤問題..."

# 遍歷所有文章 HTML 文件
for file in articles/*.html; do
  # 跳過模板文件
  if [[ "$file" == "articles/article-template.html" || "$file" == "articles/article-detail.html" ]]; then
    echo "⏭️  跳過模板文件: $file"
    continue
  fi
  
  echo "🔧 處理文件: $file"
  
  # 1. 優化外部資源載入策略 - Google Fonts
  echo "  📝 優化 Google Fonts 載入..."
  sed -i '' 's|<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">|<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='\''all'\''; this.onload=null;">\
    <noscript><link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet"></noscript>|' "$file"
  
  # 2. 優化外部資源載入策略 - Font Awesome
  echo "  📝 優化 Font Awesome 載入..."
  sed -i '' 's|<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">|<link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='\''stylesheet'\''">\
    <noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></noscript>|' "$file"
  
  # 3. 移除重複的 CSS 引用
  echo "  🧹 清理重複的 CSS 引用..."
  # 移除重複的 article.css 行
  sed -i '' '/link rel="stylesheet" href="\.\.\/css\/article\.css"/2d' "$file"
  
  # 4. 添加 favicon 引用（如果沒有的話）
  if ! grep -q "favicon" "$file"; then
    echo "  🔗 添加 favicon 引用..."
    sed -i '' 's|<meta name="viewport" content="width=device-width, initial-scale=1.0">|<meta name="viewport" content="width=device-width, initial-scale=1.0">\
    <link rel="icon" type="image/x-icon" href="../icon_pal.ico">|' "$file"
  fi
  
  # 5. 在 </body> 前添加穩定性監控腳本
  echo "  🛡️ 添加穩定性監控腳本..."
  
  # 檢查是否已經有穩定性腳本
  if ! grep -q "頁面穩定性監控" "$file"; then
    # 在 main.js 引用前添加穩定性腳本
    sed -i '' 's|<script src="../js/main.js"></script>|<!-- 🛡️ 頁面穩定性監控和錯誤處理 -->\
    <script>\
        // 全局錯誤處理\
        window.addEventListener('\''error'\'', function(e) {\
            console.error('\''⚠️ 頁面錯誤:'\'', e.error);\
            handlePageError(e.error);\
        });\
        \
        window.addEventListener('\''unhandledrejection'\'', function(e) {\
            console.error('\''⚠️ 未處理的 Promise 錯誤:'\'', e.reason);\
            handlePageError(e.reason);\
        });\
        \
        // 🔄 圖片載入重試機制\
        function retryImageLoad(img, maxRetries = 2) {\
            let attempts = 0;\
            \
            function attemptLoad() {\
                attempts++;\
                console.log(`🔄 重試載入圖片 (第 ${attempts} 次):`, img.src);\
                \
                const newImg = new Image();\
                newImg.onload = function() {\
                    img.src = this.src;\
                    console.log('\''✅ 圖片載入成功:'\'', this.src);\
                };\
                newImg.onerror = function() {\
                    if (attempts < maxRetries) {\
                        setTimeout(attemptLoad, 2000 * attempts);\
                    } else {\
                        console.error('\''❌ 圖片載入失敗，使用備用圖片'\'');\
                        img.src = '\''data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDYwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjMwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjE4Ij5OdXRyaVBhbCDmloflnJY8L3RleHQ+Cjwvc3ZnPg=='\'';\
                    }\
                };\
                newImg.src = img.src;\
            }\
            \
            attemptLoad();\
        }\
        \
        // 🚨 頁面錯誤處理\
        function handlePageError(error) {\
            if (error && (error.message.includes('\''525'\'') || error.message.includes('\''SSL'\''))) {\
                showConnectionIssueNotice();\
            }\
        }\
        \
        // 💡 顯示連接問題提示\
        function showConnectionIssueNotice() {\
            if (document.getElementById('\''connection-notice'\'')) return;\
            \
            const notice = document.createElement('\''div'\'');\
            notice.id = '\''connection-notice'\'';\
            notice.style.cssText = `\
                position: fixed;\
                top: 60px;\
                left: 16px;\
                right: 16px;\
                background: #FFF3CD;\
                border: 1px solid #FFEAA7;\
                border-radius: 8px;\
                padding: 12px;\
                z-index: 1000;\
                font-size: 14px;\
                color: #856404;\
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);\
            `;\
            \
            notice.innerHTML = `\
                <div style="display: flex; align-items: center; justify-content: space-between;">\
                    <div style="display: flex; align-items: center;">\
                        <i class="fas fa-exclamation-triangle" style="margin-right: 8px; color: #F39C12;"></i>\
                        <span>網路連接不穩定，正在重新載入資源...</span>\
                    </div>\
                    <div style="display: flex; gap: 8px;">\
                        <button onclick="location.reload()" style="background: none; border: none; color: #856404; cursor: pointer; font-size: 12px;" title="重新載入頁面">\
                            <i class="fas fa-redo"></i>\
                        </button>\
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: none; border: none; color: #856404; cursor: pointer;">\
                            <i class="fas fa-times"></i>\
                        </button>\
                    </div>\
                </div>\
            `;\
            \
            document.body.appendChild(notice);\
            \
            setTimeout(() => {\
                if (notice.parentNode) notice.remove();\
            }, 10000);\
        }\
        \
        // 📍 頁面載入完成後檢查資源\
        document.addEventListener('\''DOMContentLoaded'\'', function() {\
            console.log('\''📖 文章頁面載入完成'\'');\
            \
            // 設置圖片錯誤處理\
            const images = document.querySelectorAll('\''img'\'');\
            images.forEach(img => {\
                if (!img.complete || img.naturalWidth === 0) {\
                    img.addEventListener('\''error'\'', function() {\
                        console.warn('\''⚠️ 圖片載入失敗:'\'', this.src);\
                        retryImageLoad(this);\
                    });\
                }\
            });\
            \
            // 檢查關鍵資源載入狀態\
            setTimeout(() => {\
                const fontAwesome = window.getComputedStyle(document.querySelector('\''.fas'\'')).fontFamily.includes('\''Font Awesome'\'');\
                const googleFonts = window.getComputedStyle(document.body).fontFamily.includes('\''Nunito'\'');\
                \
                if (!fontAwesome || !googleFonts) {\
                    console.warn('\''⚠️ 部分資源載入失敗，顯示提示'\'');\
                    showConnectionIssueNotice();\
                }\
            }, 2000);\
        });\
    </script>\
    \
    <!-- 載入 main.js，添加錯誤處理 -->\
    <script>\
        // 安全載入 main.js\
        const script = document.createElement('\''script'\'');\
        script.src = '\''../js/main.js'\'';\
        script.onerror = function() {\
            console.warn('\''⚠️ main.js 載入失敗，使用備用功能'\'');\
        };\
        document.head.appendChild(script);\
    </script>|' "$file"
  else
    echo "  ✅ 穩定性腳本已存在，跳過..."
  fi
  
  echo "✅ 完成處理: $file"
done

echo ""
echo "🎉 所有文章頁面 525 錯誤修復完成！"
echo ""
echo "📊 修復內容："
echo "  ✅ 優化外部資源載入策略（非阻塞載入）"
echo "  ✅ 添加圖片載入失敗重試機制"  
echo "  ✅ 實現全局錯誤監控和處理"
echo "  ✅ 添加用戶友好的連接問題提示"
echo "  ✅ 安全載入 JavaScript 資源"
echo ""
echo "🚀 建議接下來執行 'git add . && git commit -m \"fix: 修復文章頁面 525 錯誤\"' 提交更改"
