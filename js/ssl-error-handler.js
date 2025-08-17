/**
 * 🛡️ NutriPal SSL 錯誤處理器
 * 專門處理 525 SSL Handshake Failed 錯誤
 * 提供用戶友好的錯誤提示和自動重試機制
 */

(function() {
    'use strict';
    
    // 525 錯誤處理配置
    const SSL_ERROR_CONFIG = {
        retryDelay: 5000,      // 5秒後自動重試
        maxRetries: 3,         // 最大重試次數
        retryCount: 0,         // 當前重試次數
        isHandling: false      // 防止重複處理
    };
    
    /**
     * 顯示 525 SSL 錯誤通知
     */
    function show525ErrorNotice() {
        if (SSL_ERROR_CONFIG.isHandling) return;
        SSL_ERROR_CONFIG.isHandling = true;
        
        console.error('🔥 檢測到 525 SSL 握手失敗錯誤');
        
        // 移除已存在的錯誤通知
        const existingNotice = document.getElementById('ssl-error-notice');
        if (existingNotice) {
            existingNotice.remove();
        }
        
        // 創建錯誤通知元素
        const errorNotice = document.createElement('div');
        errorNotice.id = 'ssl-error-notice';
        errorNotice.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #FF6B6B, #FF8E53);
            color: white;
            padding: 16px;
            z-index: 99999;
            font-size: 14px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            animation: slideDown 0.3s ease-out;
        `;
        
        // 添加滑動動畫
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateY(-100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        const currentRetry = SSL_ERROR_CONFIG.retryCount + 1;
        const maxRetries = SSL_ERROR_CONFIG.maxRetries;
        
        errorNotice.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-shield-alt" style="animation: pulse 2s infinite;"></i>
                    <span><strong>SSL 連接問題</strong> - 正在優化連接安全性</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 12px; opacity: 0.9;">重試 ${currentRetry}/${maxRetries}</span>
                    <button onclick="location.reload()" 
                            style="background: rgba(255,255,255,0.2); 
                                   border: 1px solid rgba(255,255,255,0.4); 
                                   color: white; 
                                   padding: 6px 12px; 
                                   border-radius: 6px; 
                                   cursor: pointer; 
                                   font-size: 12px;
                                   transition: all 0.2s ease;">
                        立即重試
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorNotice);
        
        // 添加按鈕懸停效果
        const button = errorNotice.querySelector('button');
        button.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(255,255,255,0.3)';
        });
        button.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(255,255,255,0.2)';
        });
        
        // 自動重試邏輯
        if (SSL_ERROR_CONFIG.retryCount < SSL_ERROR_CONFIG.maxRetries) {
            SSL_ERROR_CONFIG.retryCount++;
            
            const countdown = SSL_ERROR_CONFIG.retryDelay / 1000;
            let remaining = countdown;
            
            const countdownSpan = document.createElement('span');
            countdownSpan.style.cssText = 'font-size: 12px; opacity: 0.8; margin-left: 8px;';
            countdownSpan.textContent = `(${remaining}秒後自動重試)`;
            errorNotice.querySelector('div').appendChild(countdownSpan);
            
            const countdownTimer = setInterval(() => {
                remaining--;
                countdownSpan.textContent = `(${remaining}秒後自動重試)`;
                if (remaining <= 0) {
                    clearInterval(countdownTimer);
                }
            }, 1000);
            
            setTimeout(() => {
                console.log(`🔄 第 ${SSL_ERROR_CONFIG.retryCount} 次自動重試...`);
                location.reload();
            }, SSL_ERROR_CONFIG.retryDelay);
        } else {
            // 超過最大重試次數，顯示聯繫信息
            errorNotice.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 12px; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span><strong>連接問題持續</strong> - 請稍後再試或聯繫客服</span>
                    </div>
                    <div style="font-size: 12px; opacity: 0.9;">
                        如果問題持續，請清除瀏覽器快取或嘗試使用無痕模式
                    </div>
                </div>
            `;
        }
    }
    
    /**
     * 檢測 525 錯誤的多種方式
     */
    function detect525Error() {
        // 方法1: 檢查頁面標題
        if (document.title && (document.title.includes('525') || document.title.includes('SSL handshake failed'))) {
            return true;
        }
        
        // 方法2: 檢查頁面內容
        const bodyText = document.body ? document.body.textContent : '';
        if (bodyText.includes('SSL handshake failed') || 
            bodyText.includes('Error 525') || 
            bodyText.includes('cloudflare.com')) {
            return true;
        }
        
        // 方法3: 檢查特定的 Cloudflare 錯誤元素
        const errorElements = document.querySelectorAll('[class*="error"], [id*="error"], .cf-error-details');
        for (let element of errorElements) {
            if (element.textContent.includes('525') || element.textContent.includes('SSL handshake failed')) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 初始化 SSL 錯誤處理
     */
    function initSSLErrorHandler() {
        // 立即檢查是否為 525 錯誤頁面
        if (detect525Error()) {
            show525ErrorNotice();
            return;
        }
        
        // 監聽全域錯誤事件
        window.addEventListener('error', function(event) {
            if (event.message && (event.message.includes('525') || event.message.includes('SSL'))) {
                show525Error();
            }
        });
        
        // 監聽未處理的 Promise 拒絕
        window.addEventListener('unhandledrejection', function(event) {
            if (event.reason && event.reason.toString().includes('525')) {
                show525ErrorNotice();
            }
        });
        
        // 監聽 fetch 錯誤
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            return originalFetch.apply(this, args).catch(error => {
                if (error.message && error.message.includes('525')) {
                    show525ErrorNotice();
                }
                throw error;
            });
        };
        
        console.log('✅ SSL 錯誤處理器已初始化');
    }
    
    // DOM 載入完成後初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSSLErrorHandler);
    } else {
        initSSLErrorHandler();
    }
    
    // 導出到全域作用域（供其他腳本使用）
    window.NutriPalSSLHandler = {
        show525ErrorNotice,
        detect525Error,
        config: SSL_ERROR_CONFIG
    };
    
})();
