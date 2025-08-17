# 模板文件目錄

此目錄包含開發時使用的樣式參考模板和靜態文章範例，**不應在實際網站中被引用**。

## 文件說明

### `article-template.html`
- **用途**: 新文章開發時的樣式參考模板
- **狀態**: 僅供開發參考，不應被任何頁面引用
- **包含**: 基本的文章結構、樣式類別、JavaScript 模板

### `melatonin-article.html`
- **用途**: 褪黑激素主題的靜態文章範例
- **狀態**: 僅供樣式參考，不應被任何頁面引用
- **原文件名**: `article-detail.html`（已重新命名以避免混淆）

## ⚠️ 重要提醒

1. **不要在實際頁面中引用此目錄的文件**
2. **不要將此目錄的文件加入到 `knowledge.html` 的跳轉邏輯中**
3. **新增文章時，請直接在 `articles/` 目錄中創建新文件**
4. **使用這些模板時，請複製內容到新文件，而非直接引用**

## 正確的文章引用

實際的文章應該放在 `articles/` 目錄中，例如：
- `articles/stress-sleep.html`
- `articles/brain-focus.html`
- `articles/immune-cold.html`
- 等等...

這些文件可以在 `knowledge.html` 和其他文章的相關文章區塊中被正常引用。
