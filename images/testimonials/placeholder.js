/**
 * 用戶見證照片佔位處理
 * 
 * 當實際照片未能成功加載時，此腳本將提供替代方案：
 * 1. 可以生成包含用戶姓氏首字的圓形頭像
 * 2. 或使用預設佔位圖像
 * 
 * 注意：實際部署時，請替換為真實的華人照片
 */

// 頭像佔位處理
function handleAvatarError(img) {
  // 從alt屬性中提取名稱
  const name = img.alt || '用戶';
  const initial = name.charAt(0);
  
  // 創建一個canvas元素來生成文字頭像
  const canvas = document.createElement('canvas');
  canvas.width = 40;
  canvas.height = 40;
  
  const ctx = canvas.getContext('2d');
  
  // 背景色，從一組預定義的顏色中隨機選擇
  const colors = [
    '#4D6849', '#A8D5BA', '#F9ECD9', '#F5B17B'
  ];
  const bgColor = colors[Math.floor(Math.random() * colors.length)];
  
  // 繪製圓形背景
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.arc(20, 20, 20, 0, Math.PI * 2);
  ctx.fill();
  
  // 繪製文字
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initial, 20, 20);
  
  // 將canvas轉換為圖片URL
  img.src = canvas.toDataURL('image/png');
}

// 處理照片載入錯誤
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.testimonial-avatar').forEach(img => {
    img.onerror = function() {
      handleAvatarError(this);
    };
  });
}); 