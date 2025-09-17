// common.js - host på GitHub eller egen server
(function() {
    'use strict';
    
    window.MyUtils = {
        waitForElement: function(selector, timeout = 10000) {
            return new Promise((resolve, reject) => {
                const el = document.querySelector(selector);
                if (el) return resolve(el);
                
                const observer = new MutationObserver(() => {
                    const el = document.querySelector(selector);
                    if (el) {
                        observer.disconnect();
                        resolve(el);
                    }
                });
                
                observer.observe(document.body, { childList: true, subtree: true });
                setTimeout(() => {
                    observer.disconnect();
                    reject(new Error('Timeout'));
                }, timeout);
            });
        },
        
        addCSS: function(css) {
            const style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);
        }
    };
})();