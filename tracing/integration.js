/**
 * DevOpsChat Tracing Integration Helper
 * Easy integration methods for DevOpsChat userscripts
 * Version: 1.0.0
 */

// =====================
// EASY INTEGRATION FOR USERSCRIPTS
// =====================

class DevOpsChatTracingIntegration {
    constructor() {
        this.tracer = null;
        this.initialized = false;
    }

    // Quick setup method for userscripts
    init(scriptName, options = {}) {
        if (this.initialized) return this.tracer;

        const defaultOptions = {
            scriptName,
            logLevel: 'info',
            debugMode: window.location.hash.includes('debug') || window.location.search.includes('trace=true'),
            autoDebugPanel: true,
            monitorVue: true,
            monitorRPC: true,
            monitorCDN: true,
            ...options
        };

        this.tracer = new DevOpsChatTracing(defaultOptions);
        this.initialized = true;

        // Auto-setup based on script type
        if (scriptName.includes('UI') || scriptName.includes('A')) {
            this.setupUIScriptMonitoring();
        } else if (scriptName.includes('Agent') || scriptName.includes('B')) {
            this.setupAgentScriptMonitoring();
        }

        // Create debug panel if requested
        if (defaultOptions.autoDebugPanel && defaultOptions.debugMode) {
            this.createDebugPanel();
        }

        this.tracer.info(`🚀 ${scriptName} tracing initialized`, defaultOptions);
        return this.tracer;
    }

    // Setup monitoring specific to UI script (A)
    setupUIScriptMonitoring() {
        if (!this.tracer) return;

        // Monitor Vue loading
        this.tracer.monitorVueLoading();
        
        // Monitor shadow DOM creation
        this.monitorShadowDOMCreation();
        
        // Monitor CSS loading
        this.monitorCSSLoading();
        
        // Monitor render system
        this.monitorRenderSystem();
    }

    // Setup monitoring specific to Agent script (B)
    setupAgentScriptMonitoring() {
        if (!this.tracer) return;

        // Monitor RPC communication
        this.tracer.monitorRPCCommunication();
        
        // Monitor jQuery availability
        this.monitorJQueryLoading();
        
        // Monitor DOM modifications
        this.monitorDOMModifications();
    }

    monitorShadowDOMCreation() {
        const originalAttachShadow = Element.prototype.attachShadow;
        Element.prototype.attachShadow = function(...args) {
            const result = originalAttachShadow.apply(this, args);
            this.tracer?.info('🌑 Shadow DOM created', {
                host: this.tagName,
                mode: args[0]?.mode,
                delegatesFocus: args[0]?.delegatesFocus
            });
            return result;
        }.bind(this);
    }

    monitorCSSLoading() {
        // Monitor when CSS is injected
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.tagName === 'STYLE' || node.tagName === 'LINK') {
                        this.tracer?.debug('🎨 CSS resource loaded', {
                            type: node.tagName,
                            content: node.textContent?.substring(0, 100),
                            href: node.href
                        });
                    }
                });
            });
        });

        observer.observe(document.head, { childList: true });
        if (document.querySelector('div[style*="border"]')?.shadowRoot) {
            observer.observe(document.querySelector('div[style*="border"]').shadowRoot, { childList: true });
        }
    }

    monitorRenderSystem() {
        // Monitor render module loading
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'render_module_loaded') {
                this.tracer?.info('📦 Render module loaded', event.data);
            }
        });
    }

    monitorJQueryLoading() {
        this.tracer?.startTimer('jquery_loading');
        
        const checkJQuery = () => {
            if (window.jQuery || window.$) {
                this.tracer?.endTimer('jquery_loading');
                this.tracer?.info('✅ jQuery loaded successfully', {
                    version: window.jQuery?.fn?.jquery || 'unknown'
                });
                return true;
            }
            return false;
        };

        if (!checkJQuery()) {
            const interval = setInterval(() => {
                if (checkJQuery()) {
                    clearInterval(interval);
                }
            }, 100);

            setTimeout(() => {
                clearInterval(interval);
                if (!window.jQuery && !window.$) {
                    this.tracer?.error('❌ jQuery loading timeout');
                }
            }, 10000);
        }
    }

    monitorDOMModifications() {
        let modificationCount = 0;
        const observer = new MutationObserver((mutations) => {
            modificationCount += mutations.length;
            
            // Batch log DOM modifications to avoid spam
            if (modificationCount % 10 === 0) {
                this.tracer?.debug('🔄 DOM modifications detected', {
                    count: modificationCount,
                    recentMutations: mutations.length
                });
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
        });
    }

    createDebugPanel() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.tracer?.createDebugPanel();
            });
        } else {
            this.tracer?.createDebugPanel();
        }
    }

    // =====================
    // HELPER METHODS FOR USERSCRIPTS
    // =====================

    // Wrapper for async operations with automatic error handling
    async safeAsync(operation, name = 'Unknown') {
        if (!this.tracer) return operation();
        
        return this.tracer.wrapAsyncFunction(operation, name)();
    }

    // Wrapper for regular functions with automatic error handling
    safe(operation, name = 'Unknown') {
        if (!this.tracer) return operation();
        
        return this.tracer.wrapFunction(operation, name)();
    }

    // Log script lifecycle events
    scriptStarted(scriptName, version) {
        this.tracer?.info(`🚀 ${scriptName} started`, {
            version,
            url: window.location.href,
            timestamp: new Date().toISOString()
        });
    }

    scriptReady(scriptName) {
        this.tracer?.info(`✅ ${scriptName} ready`, {
            loadTime: performance.now(),
            readyState: document.readyState
        });
    }

    // Monitor specific URL patterns for CDN health
    async checkCDNHealth() {
        if (!this.tracer) return;

        const cdnUrls = [
            'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js',
            'https://unpkg.com/vue@3/dist/vue.global.prod.js',
            'https://cdnjs.cloudflare.com/ajax/libs/vue/3.3.4/vue.global.prod.min.js',
            'https://code.jquery.com/jquery-3.6.0.min.js',
            'https://cdn.beercss.com/beer.min.css',
            'https://fonts.googleapis.com/icon?family=Material+Icons'
        ];

        const results = await Promise.allSettled(
            cdnUrls.map(url => this.tracer.checkUrlAvailability(url))
        );

        const healthReport = cdnUrls.map((url, index) => ({
            url,
            available: results[index].status === 'fulfilled' && results[index].value,
            status: results[index].status
        }));

        this.tracer.info('🌐 CDN Health Report', { healthReport });
        return healthReport;
    }

    // Monitor memory usage
    getMemoryUsage() {
        if (!performance.memory) return null;

        const memory = {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        };

        this.tracer?.debug('💾 Memory usage', memory);
        return memory;
    }

    // Get current performance metrics
    getPerformanceSnapshot() {
        const snapshot = {
            timing: performance.timing,
            navigation: performance.navigation,
            memory: this.getMemoryUsage(),
            resourceCount: performance.getEntriesByType('resource').length,
            timestamp: Date.now()
        };

        this.tracer?.debug('📊 Performance snapshot', snapshot);
        return snapshot;
    }

    // =====================
    // DEBUGGING UTILITIES
    // =====================

    // Log current state of important objects
    debugState() {
        if (!this.tracer) return;

        const state = {
            vue: {
                available: !!window.Vue,
                version: window.Vue?.version
            },
            jquery: {
                available: !!(window.jQuery || window.$),
                version: window.jQuery?.fn?.jquery
            },
            devops: {
                uiLoaded: !!window.__DEVOPSCHAT_UI_A__,
                agentLoaded: !!window.__DEVOPSCHAT_AGENT_B__
            },
            dom: {
                readyState: document.readyState,
                shadowRoots: document.querySelectorAll('*').length,
                stylesheets: document.styleSheets.length
            },
            url: window.location.href,
            timestamp: new Date().toISOString()
        };

        this.tracer.info('🔍 Debug State Snapshot', state);
        return state;
    }

    // Test RPC communication
    testRPC() {
        if (!this.tracer) return;

        this.tracer.info('🧪 Testing RPC communication...');
        
        window.postMessage({
            kind: 'rpc_call',
            method: 'ping',
            data: { test: true, timestamp: Date.now() }
        }, '*');

        // Listen for response
        const listener = (event) => {
            if (event.data?.kind === 'rpc_response' && event.data?.method === 'ping') {
                this.tracer.info('✅ RPC test successful', event.data);
                window.removeEventListener('message', listener);
            }
        };

        window.addEventListener('message', listener);

        // Timeout after 5 seconds
        setTimeout(() => {
            window.removeEventListener('message', listener);
            this.tracer.warn('⏰ RPC test timeout - no response received');
        }, 5000);
    }

    // Get tracer instance
    getTracer() {
        return this.tracer;
    }
}

// =====================
// GLOBAL INSTANCE
// =====================

// Create global integration instance
if (typeof window !== 'undefined') {
    window.DevOpsChatTrace = new DevOpsChatTracingIntegration();
    
    // Convenience methods for direct access
    window.trace = {
        init: (name, options) => window.DevOpsChatTrace.init(name, options),
        log: (...args) => window.DevOpsChatTrace.tracer?.info(...args),
        error: (...args) => window.DevOpsChatTrace.tracer?.error(...args),
        warn: (...args) => window.DevOpsChatTrace.tracer?.warn(...args),
        debug: (...args) => window.DevOpsChatTrace.tracer?.debug(...args),
        time: (name) => window.DevOpsChatTrace.tracer?.startTimer(name),
        timeEnd: (name) => window.DevOpsChatTrace.tracer?.endTimer(name),
        state: () => window.DevOpsChatTrace.debugState(),
        rpc: () => window.DevOpsChatTrace.testRPC(),
        safe: (fn, name) => window.DevOpsChatTrace.safe(fn, name),
        safeAsync: (fn, name) => window.DevOpsChatTrace.safeAsync(fn, name)
    };
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DevOpsChatTracingIntegration;
}