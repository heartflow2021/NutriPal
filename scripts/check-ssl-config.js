#!/usr/bin/env node

/**
 * 🔍 NutriPal SSL 配置檢查工具
 * 檢查網站的 SSL/TLS 配置並提供優化建議
 */

const https = require('https');
const tls = require('tls');

const DOMAIN = 'nutripal.top';
const TIMEOUT = 10000; // 10秒超時

console.log('🔍 正在檢查 SSL/TLS 配置...\n');

/**
 * 檢查 SSL 證書信息
 */
function checkSSLCertificate() {
    return new Promise((resolve, reject) => {
        const options = {
            host: DOMAIN,
            port: 443,
            method: 'GET',
            timeout: TIMEOUT,
            rejectUnauthorized: false // 允許檢查無效證書
        };
        
        const req = https.request(options, (res) => {
            const cert = res.socket.getPeerCertificate();
            
            if (!cert || Object.keys(cert).length === 0) {
                reject(new Error('無法獲取 SSL 證書信息'));
                return;
            }
            
            const now = new Date();
            const validFrom = new Date(cert.valid_from);
            const validTo = new Date(cert.valid_to);
            const daysUntilExpiry = Math.ceil((validTo - now) / (1000 * 60 * 60 * 24));
            
            resolve({
                subject: cert.subject,
                issuer: cert.issuer,
                validFrom: validFrom.toISOString(),
                validTo: validTo.toISOString(),
                daysUntilExpiry,
                serialNumber: cert.serialNumber,
                fingerprint: cert.fingerprint,
                isValid: now >= validFrom && now <= validTo
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('連接超時'));
        });
        
        req.setTimeout(TIMEOUT);
        req.end();
    });
}

/**
 * 檢查支援的 TLS 版本
 */
function checkTLSVersions() {
    return new Promise((resolve, reject) => {
        const versions = ['TLSv1', 'TLSv1.1', 'TLSv1.2', 'TLSv1.3'];
        const results = {};
        let completed = 0;
        
        versions.forEach(version => {
            const socket = tls.connect({
                host: DOMAIN,
                port: 443,
                secureProtocol: version.replace('.', '_') + '_method',
                rejectUnauthorized: false,
                timeout: 5000
            });
            
            socket.on('secureConnect', () => {
                results[version] = {
                    supported: true,
                    protocol: socket.getProtocol(),
                    cipher: socket.getCipher()
                };
                socket.end();
                completed++;
                if (completed === versions.length) {
                    resolve(results);
                }
            });
            
            socket.on('error', (error) => {
                results[version] = {
                    supported: false,
                    error: error.message
                };
                completed++;
                if (completed === versions.length) {
                    resolve(results);
                }
            });
            
            socket.on('timeout', () => {
                results[version] = {
                    supported: false,
                    error: '連接超時'
                };
                socket.destroy();
                completed++;
                if (completed === versions.length) {
                    resolve(results);
                }
            });
        });
    });
}

/**
 * 檢查 HTTP 到 HTTPS 重定向
 */
function checkHTTPSRedirect() {
    return new Promise((resolve, reject) => {
        const http = require('http');
        
        const options = {
            host: DOMAIN,
            port: 80,
            path: '/',
            method: 'GET',
            timeout: TIMEOUT
        };
        
        const req = http.request(options, (res) => {
            resolve({
                statusCode: res.statusCode,
                location: res.headers.location,
                hasRedirect: res.statusCode >= 300 && res.statusCode < 400,
                redirectsToHTTPS: res.headers.location && res.headers.location.startsWith('https://')
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('HTTP 重定向檢查超時'));
        });
        
        req.setTimeout(TIMEOUT);
        req.end();
    });
}

/**
 * 主檢查函數
 */
async function runSSLCheck() {
    try {
        console.log('📋 SSL/TLS 配置檢查報告');
        console.log('='.repeat(50));
        
        // 檢查 SSL 證書
        console.log('\n🔒 SSL 證書檢查:');
        try {
            const certInfo = await checkSSLCertificate();
            console.log(`✅ 證書有效: ${certInfo.isValid ? '是' : '否'}`);
            console.log(`📅 有效期: ${certInfo.validFrom.split('T')[0]} 至 ${certInfo.validTo.split('T')[0]}`);
            console.log(`⏰ 距離過期: ${certInfo.daysUntilExpiry} 天`);
            console.log(`🏢 發行者: ${certInfo.issuer.O || certInfo.issuer.CN}`);
            console.log(`🔢 序列號: ${certInfo.serialNumber}`);
            
            if (certInfo.daysUntilExpiry < 30) {
                console.log('⚠️  警告: SSL 證書即將在 30 天內過期！');
            }
        } catch (error) {
            console.log(`❌ SSL 證書檢查失敗: ${error.message}`);
        }
        
        // 檢查 TLS 版本支援
        console.log('\n🔐 TLS 版本支援檢查:');
        try {
            const tlsVersions = await checkTLSVersions();
            Object.entries(tlsVersions).forEach(([version, info]) => {
                if (info.supported) {
                    console.log(`✅ ${version}: 支援 (${info.protocol}, ${info.cipher?.name || 'N/A'})`);
                } else {
                    console.log(`❌ ${version}: 不支援 (${info.error})`);
                }
            });
            
            // 安全性建議
            if (tlsVersions['TLSv1'] && tlsVersions['TLSv1'].supported) {
                console.log('⚠️  建議: 停用 TLS 1.0 以提高安全性');
            }
            if (tlsVersions['TLSv1.1'] && tlsVersions['TLSv1.1'].supported) {
                console.log('⚠️  建議: 停用 TLS 1.1 以提高安全性');
            }
        } catch (error) {
            console.log(`❌ TLS 版本檢查失敗: ${error.message}`);
        }
        
        // 檢查 HTTPS 重定向
        console.log('\n🔄 HTTPS 重定向檢查:');
        try {
            const redirectInfo = await checkHTTPSRedirect();
            console.log(`📊 HTTP 狀態碼: ${redirectInfo.statusCode}`);
            console.log(`🔀 是否重定向: ${redirectInfo.hasRedirect ? '是' : '否'}`);
            console.log(`🔒 重定向到 HTTPS: ${redirectInfo.redirectsToHTTPS ? '是' : '否'}`);
            
            if (!redirectInfo.redirectsToHTTPS) {
                console.log('⚠️  建議: 設定 HTTP 自動重定向到 HTTPS');
            }
        } catch (error) {
            console.log(`❌ HTTPS 重定向檢查失敗: ${error.message}`);
        }
        
        // 提供 525 錯誤的解決建議
        console.log('\n🛠️  525 錯誤解決建議:');
        console.log('1. 確認 Cloudflare SSL/TLS 模式設為 "Full" 或 "Full (strict)"');
        console.log('2. 檢查源服務器是否安裝有效的 SSL 證書');
        console.log('3. 確保端口 443 在源服務器上開放');
        console.log('4. 驗證源服務器支援 TLS 1.2 或更高版本');
        console.log('5. 檢查 Cloudflare IP 是否被源服務器防火牆阻擋');
        console.log('6. 考慮使用 Cloudflare Origin CA 證書');
        
        console.log('\n✅ 檢查完成！');
        
    } catch (error) {
        console.error('❌ 檢查過程中發生錯誤:', error.message);
        process.exit(1);
    }
}

// 執行檢查
runSSLCheck();
