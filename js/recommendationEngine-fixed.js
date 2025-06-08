                <a href="${finalLink}" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   class="btn-secondary" 
                   onclick="window.trackPurchaseClick && window.trackPurchaseClick('${product.id || 'unknown'}', '${(product.name || '').replace(/'/g, '\\\'')}')"
                   style="display: inline-block; text-decoration: none; text-align: center;">
                   <i class="fas fa-shopping-cart"></i> 前往購買
                </a> 