/**
 * DevOpsChat UI Script (A) - With Advanced Tracing Integration
 * Example showing how to integrate the tracing system
 * Version: 5.2.0 (with tracing)
 */

// ==UserScript==
// @name         DevOpsChat UI (A) — Vue 3 + Beer CSS Edition [WITH TRACING]
// @namespace    https://github.com/dingemoe/script/
// @version      5.2.0
// @description  Advanced DevOpsChat interface with comprehensive tracing and debugging
// @author       DevOpsChat Team
// @match        *://*/*
// @grant        none
// @require      https://raw.githack.com/dingemoe/script/main/tracing/tracing.js
// @require      https://raw.githack.com/dingemoe/script/main/tracing/integration.js
// @downloadURL  https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-UI-A-traced.user.js
// @updateURL    https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-UI-A-traced.user.js
// ==/UserScript==

(function() {
    'use strict';

    // =====================
    // TRACING INITIALIZATION
    // =====================
    
    // Initialize tracing system first thing
    const tracer = window.DevOpsChatTrace.init('DevOpsChat UI (A)', {
        logLevel: 'info',
        debugMode: window.location.hash.includes('debug'),
        autoDebugPanel: true,
        monitorVue: true,
        monitorRPC: true,
        monitorCDN: true
    });

    // Script constants with tracing
    const SCRIPT_VERSION = '5.2.0';
    const MODIFIED_DATE = new Date('2025-09-17T22:30:00Z');
    
    tracer.scriptStarted('DevOpsChat UI (A)', SCRIPT_VERSION);

    // =====================
    // ENHANCED ERROR HANDLING
    // =====================

    // Wrap main execution in safe function
    window.DevOpsChatTrace.safe(() => {
        main();
    }, 'main_execution');

    async function main() {
        try {
            // Log startup information with relative time
            const timeAgo = getRelativeTimeString(MODIFIED_DATE);
            tracer.info(`🔧 DevOpsChat UI (A) — Vue 3 + Beer CSS Edition v${SCRIPT_VERSION}`);
            tracer.info(`📅 Modified: ${MODIFIED_DATE.toLocaleString('no')} (${timeAgo})`);

            // Check session hash
            if (!window.location.hash.includes('dc_session=')) {
                tracer.warn('No session hash found in URL');
                return;
            }

            // Start performance monitoring
            tracer.startTimer('total_initialization');
            
            // Wait for Vue with tracing
            await loadVueWithTracing();
            
            // Create shadow DOM container with tracing
            const container = await createShadowDOMContainer();
            
            // Load CSS resources with tracing
            await loadCSSResources(container.shadowRoot);
            
            // Initialize render system with tracing
            await initializeRenderSystem(container);
            
            tracer.endTimer('total_initialization');
            tracer.scriptReady('DevOpsChat UI (A)');
            
            // Set global marker
            window.__DEVOPSCHAT_UI_A__ = {
                version: SCRIPT_VERSION,
                initialized: true,
                tracer: tracer,
                container: container
            };

            // Monitor ongoing performance
            monitorOngoingPerformance();

        } catch (error) {
            tracer.captureError(error, { phase: 'main_initialization' });
            throw error;
        }
    }

    // =====================
    // VUE LOADING WITH TRACING
    // =====================

    async function loadVueWithTracing() {
        tracer.startTimer('vue_loading_total');
        
        try {
            // Check if Vue is already available
            if (window.Vue) {
                tracer.info('✅ Vue already available at script start!', {
                    version: window.Vue.version
                });
                tracer.endTimer('vue_loading_total');
                return;
            }

            tracer.info('⏳ Waiting for Vue to be available...');
            
            // Use the integrated Vue monitoring
            await window.DevOpsChatTrace.tracer.monitorVueLoading(30000);
            
            tracer.endTimer('vue_loading_total');
            
        } catch (error) {
            tracer.error('❌ Vue loading failed', { error: error.message });
            
            // Try fallback loading
            await loadVueFallback();
        }
    }

    async function loadVueFallback() {
        tracer.info('🔄 Attempting Vue fallback loading...');
        tracer.startTimer('vue_fallback');

        const fallbackUrls = [
            'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js',
            'https://unpkg.com/vue@3/dist/vue.global.prod.js',
            'https://cdnjs.cloudflare.com/ajax/libs/vue/3.3.4/vue.global.prod.min.js'
        ];

        for (let i = 0; i < fallbackUrls.length; i++) {
            const url = fallbackUrls[i];
            tracer.info(`🔄 Fallback ${i + 1}: Loading Vue from ${url}`);
            
            try {
                await loadScriptWithTimeout(url, 10000);
                
                if (window.Vue) {
                    tracer.info(`✅ Vue loaded successfully from fallback ${i + 1}`, {
                        url,
                        version: window.Vue.version
                    });
                    tracer.endTimer('vue_fallback');
                    return;
                }
            } catch (error) {
                tracer.warn(`❌ Fallback ${i + 1} failed: ${error.message}`);
            }
        }

        tracer.endTimer('vue_fallback');
        throw new Error('All Vue fallback attempts failed');
    }

    // =====================
    // SHADOW DOM WITH TRACING
    // =====================

    async function createShadowDOMContainer() {
        return window.DevOpsChatTrace.safe(() => {
            tracer.info('🌑 Creating shadow DOM container...');
            tracer.startTimer('shadow_dom_creation');

            const shadowHost = document.createElement('div');
            shadowHost.style.cssText = `
                position: fixed !important;
                top: 50px !important;
                left: 50px !important;
                width: 800px !important;
                height: 600px !important;
                z-index: 999999 !important;
                border: 2px solid #333 !important;
                border-radius: 8px !important;
                background: white !important;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
                pointer-events: auto !important;
            `;

            document.body.appendChild(shadowHost);
            const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

            tracer.endTimer('shadow_dom_creation');
            tracer.info('✅ Shadow DOM container created successfully');

            return { shadowHost, shadowRoot };

        }, 'create_shadow_dom');
    }

    // =====================
    // CSS LOADING WITH TRACING
    // =====================

    async function loadCSSResources(shadowRoot) {
        tracer.startTimer('css_loading');
        
        const cssUrls = [
            'https://cdn.jsdelivr.net/npm/beercss@3.7.11/dist/cdn/beer.min.css',
            'https://fonts.googleapis.com/icon?family=Material+Icons'
        ];

        try {
            const cssPromises = cssUrls.map(url => loadCSSWithTracing(shadowRoot, url));
            await Promise.all(cssPromises);
            
            tracer.endTimer('css_loading');
            tracer.info('✅ CSS resources loaded in isolated shadow DOM');
            
        } catch (error) {
            tracer.error('❌ CSS loading failed', { error: error.message });
            throw error;
        }
    }

    async function loadCSSWithTracing(shadowRoot, url) {
        tracer.debug(`📦 Loading CSS: ${url}`);
        tracer.startTimer(`css_${url.split('/').pop()}`);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const cssText = await response.text();
            const style = document.createElement('style');
            style.textContent = cssText;
            shadowRoot.appendChild(style);

            tracer.endTimer(`css_${url.split('/').pop()}`);
            tracer.debug(`✅ CSS loaded: ${url}`);

        } catch (error) {
            tracer.endTimer(`css_${url.split('/').pop()}`);
            tracer.warn(`❌ CSS failed: ${url}`, { error: error.message });
            throw error;
        }
    }

    // =====================
    // RENDER SYSTEM WITH TRACING
    // =====================

    async function initializeRenderSystem(container) {
        tracer.startTimer('render_system_init');

        try {
            // Create Vue app with error handling
            const { createApp } = window.Vue;
            const app = createApp({
                template: `
                    <div class="medium-space padding">
                        <h3>🔧 DevOpsChat Debug Interface</h3>
                        <div class="row">
                            <div class="col s6">
                                <h5>System Status</h5>
                                <div class="card">
                                    <div class="card-content">
                                        <p><strong>Version:</strong> {{ version }}</p>
                                        <p><strong>Session:</strong> {{ sessionId }}</p>
                                        <p><strong>Vue:</strong> {{ vueVersion }}</p>
                                        <p><strong>Uptime:</strong> {{ uptime }}min</p>
                                        <p><strong>Errors:</strong> {{ errorCount }}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col s6">
                                <h5>Quick Actions</h5>
                                <button @click="testRPC" class="button primary">Test RPC</button>
                                <button @click="checkCDN" class="button secondary">Check CDN</button>
                                <button @click="debugState" class="button">Debug State</button>
                                <button @click="exportLogs" class="button">Export Logs</button>
                            </div>
                        </div>
                        <div v-if="debugOutput" class="card">
                            <div class="card-content">
                                <h6>Debug Output</h6>
                                <pre>{{ debugOutput }}</pre>
                            </div>
                        </div>
                    </div>
                `,
                data() {
                    return {
                        version: SCRIPT_VERSION,
                        sessionId: tracer.getSessionId(),
                        vueVersion: window.Vue.version,
                        uptime: 0,
                        errorCount: 0,
                        debugOutput: ''
                    };
                },
                methods: {
                    testRPC() {
                        this.debugOutput = 'Testing RPC communication...';
                        window.DevOpsChatTrace.testRPC();
                    },
                    async checkCDN() {
                        this.debugOutput = 'Checking CDN health...';
                        const health = await window.DevOpsChatTrace.checkCDNHealth();
                        this.debugOutput = JSON.stringify(health, null, 2);
                    },
                    debugState() {
                        const state = window.DevOpsChatTrace.debugState();
                        this.debugOutput = JSON.stringify(state, null, 2);
                    },
                    exportLogs() {
                        tracer.exportLogs();
                        this.debugOutput = 'Logs exported successfully!';
                    }
                },
                mounted() {
                    // Update metrics every second
                    setInterval(() => {
                        const metrics = tracer.getMetrics();
                        this.uptime = ((Date.now() - metrics.startTime) / 1000 / 60).toFixed(1);
                        this.errorCount = metrics.errors;
                    }, 1000);
                }
            });

            // Enhanced Vue error handler with tracing
            app.config.errorHandler = (err, instance, info) => {
                tracer.captureError(err, {
                    type: 'vue_error',
                    componentInfo: info,
                    componentName: instance?.$options?.name || 'Unknown'
                });
            };

            // Mount the app
            const appDiv = document.createElement('div');
            container.shadowRoot.appendChild(appDiv);
            app.mount(appDiv);

            tracer.endTimer('render_system_init');
            tracer.info('✅ Render system initialized successfully');

        } catch (error) {
            tracer.endTimer('render_system_init');
            tracer.captureError(error, { phase: 'render_system_initialization' });
            throw error;
        }
    }

    // =====================
    // PERFORMANCE MONITORING
    // =====================

    function monitorOngoingPerformance() {
        // Monitor memory usage every 30 seconds
        setInterval(() => {
            window.DevOpsChatTrace.getMemoryUsage();
        }, 30000);

        // Monitor DOM mutations
        let mutationCount = 0;
        const observer = new MutationObserver((mutations) => {
            mutationCount += mutations.length;
            
            if (mutationCount % 50 === 0) {
                tracer.debug('🔄 DOM activity', { totalMutations: mutationCount });
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributeFilter: ['class', 'style']
        });

        // Performance snapshot every 5 minutes
        setInterval(() => {
            window.DevOpsChatTrace.getPerformanceSnapshot();
        }, 300000);
    }

    // =====================
    // UTILITY FUNCTIONS WITH TRACING
    // =====================

    function loadScriptWithTimeout(src, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.crossOrigin = 'anonymous';

            const timeoutId = setTimeout(() => {
                document.head.removeChild(script);
                reject(new Error(`Script loading timeout: ${src}`));
            }, timeout);

            script.onload = () => {
                clearTimeout(timeoutId);
                resolve();
            };

            script.onerror = () => {
                clearTimeout(timeoutId);
                if (script.parentNode) {
                    document.head.removeChild(script);
                }
                reject(new Error(`Script loading failed: ${src}`));
            };

            document.head.appendChild(script);
        });
    }

    function getRelativeTimeString(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'akkurat nå';
        if (diffMins < 60) return `${diffMins}min siden`;
        if (diffHours < 24) return `${diffHours}t siden`;
        return `${diffDays}d siden`;
    }

    // =====================
    // DEBUGGING INTERFACE
    // =====================

    // Add keyboard shortcuts for debugging
    document.addEventListener('keydown', (event) => {
        // Ctrl+Shift+D for debug panel
        if (event.ctrlKey && event.shiftKey && event.code === 'KeyD') {
            event.preventDefault();
            if (document.getElementById('devopschat-debug-panel')) {
                document.getElementById('devopschat-debug-panel').remove();
            } else {
                tracer.createDebugPanel();
            }
        }
        
        // Ctrl+Shift+T for trace state
        if (event.ctrlKey && event.shiftKey && event.code === 'KeyT') {
            event.preventDefault();
            window.DevOpsChatTrace.debugState();
        }
        
        // Ctrl+Shift+R for RPC test
        if (event.ctrlKey && event.shiftKey && event.code === 'KeyR') {
            event.preventDefault();
            window.DevOpsChatTrace.testRPC();
        }
    });

    tracer.info('🎯 Keyboard shortcuts enabled:', {
        'Ctrl+Shift+D': 'Toggle debug panel',
        'Ctrl+Shift+T': 'Trace current state',
        'Ctrl+Shift+R': 'Test RPC communication'
    });

})();