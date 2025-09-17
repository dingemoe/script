/**
 * DevOpsChat Smart Tracing System
 * Comprehensive error tracking, performance monitoring, and debugging for userscripts
 * Version: 1.0.0
 * Author: DevOpsChat Team
 */

class DevOpsChatTracing {
    constructor(options = {}) {
        this.config = {
            enabled: true,
            logLevel: 'info', // trace, debug, info, warn, error
            maxLogs: 1000,
            storageKey: 'devopschat_trace_logs',
            autoFlush: true,
            performance: true,
            errorCapture: true,
            networkMonitoring: false,
            debugMode: window.location.hash.includes('debug'),
            ...options
        };

        this.logs = [];
        this.errors = [];
        this.metrics = {
            startTime: Date.now(),
            errors: 0,
            warnings: 0,
            info: 0,
            debug: 0,
            performance: {}
        };

        this.timers = new Map();
        this.watchers = new Map();
        this.sessionId = this.generateSessionId();

        this.init();
    }

    init() {
        if (!this.config.enabled) return;

        // Load existing logs from storage
        this.loadFromStorage();

        // Setup global error handlers
        if (this.config.errorCapture) {
            this.setupErrorHandlers();
        }

        // Setup performance monitoring
        if (this.config.performance) {
            this.setupPerformanceMonitoring();
        }

        // Auto-flush logs periodically
        if (this.config.autoFlush) {
            setInterval(() => this.flush(), 30000); // Every 30 seconds
        }

        this.info('🔧 DevOpsChat Tracing System initialized', {
            sessionId: this.sessionId,
            config: this.config,
            userAgent: navigator.userAgent
        });
    }

    generateSessionId() {
        return 'trace_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // =====================
    // LOGGING METHODS
    // =====================

    trace(message, data = {}, context = {}) {
        this.log('trace', message, data, context);
    }

    debug(message, data = {}, context = {}) {
        this.log('debug', message, data, context);
    }

    info(message, data = {}, context = {}) {
        this.log('info', message, data, context);
    }

    warn(message, data = {}, context = {}) {
        this.log('warn', message, data, context);
    }

    error(message, data = {}, context = {}) {
        this.log('error', message, data, context);
        this.metrics.errors++;
    }

    log(level, message, data = {}, context = {}) {
        if (!this.shouldLog(level)) return;

        const logEntry = {
            id: this.generateLogId(),
            timestamp: new Date().toISOString(),
            level,
            message,
            data: this.sanitizeData(data),
            context: {
                url: window.location.href,
                userAgent: navigator.userAgent,
                sessionId: this.sessionId,
                ...context
            },
            stack: level === 'error' ? new Error().stack : undefined
        };

        this.logs.push(logEntry);
        this.metrics[level]++;

        // Console output with styling
        this.outputToConsole(logEntry);

        // Maintain log size limit
        if (this.logs.length > this.config.maxLogs) {
            this.logs = this.logs.slice(-this.config.maxLogs);
        }

        // Auto-save to storage
        this.saveToStorage();
    }

    // =====================
    // ERROR HANDLING
    // =====================

    setupErrorHandlers() {
        // Global JavaScript errors
        window.addEventListener('error', (event) => {
            this.captureError(event.error || new Error(event.message), {
                type: 'javascript_error',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.captureError(event.reason, {
                type: 'unhandled_rejection',
                promise: event.promise
            });
        });

        // Vue error handler (if Vue is available)
        if (window.Vue && typeof window.Vue.config === 'object') {
            const originalErrorHandler = window.Vue.config.errorHandler;
            window.Vue.config.errorHandler = (err, instance, info) => {
                this.captureError(err, {
                    type: 'vue_error',
                    componentInfo: info,
                    componentInstance: instance?.$options?.name || 'Unknown'
                });
                if (originalErrorHandler) {
                    originalErrorHandler(err, instance, info);
                }
            };
        }
    }

    captureError(error, context = {}) {
        const errorEntry = {
            id: this.generateLogId(),
            timestamp: new Date().toISOString(),
            message: error.message || String(error),
            stack: error.stack,
            name: error.name,
            context,
            sessionId: this.sessionId
        };

        this.errors.push(errorEntry);
        this.error('❌ Error captured', errorEntry);

        // Store error separately
        this.saveErrorToStorage(errorEntry);

        return errorEntry;
    }

    // =====================
    // PERFORMANCE MONITORING
    // =====================

    setupPerformanceMonitoring() {
        // Monitor page load performance
        if (document.readyState === 'complete') {
            this.capturePageLoadMetrics();
        } else {
            window.addEventListener('load', () => this.capturePageLoadMetrics());
        }

        // Monitor resource loading
        this.monitorResourceLoading();

        // Monitor CDN availability
        this.monitorCDNHealth();
    }

    capturePageLoadMetrics() {
        if (!performance.timing) return;

        const timing = performance.timing;
        const metrics = {
            pageLoadTime: timing.loadEventEnd - timing.navigationStart,
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            domInteractive: timing.domInteractive - timing.navigationStart,
            firstPaint: this.getFirstPaint(),
            resourceCount: performance.getEntriesByType('resource').length
        };

        this.metrics.performance.pageLoad = metrics;
        this.info('📊 Page load metrics captured', metrics);
    }

    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? firstPaint.startTime : null;
    }

    monitorResourceLoading() {
        // Monitor script loading times
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name.includes('vue') || entry.name.includes('jquery') || 
                    entry.name.includes('devopschat') || entry.name.includes('cdn')) {
                    this.debug('📦 Resource loaded', {
                        name: entry.name,
                        duration: entry.duration,
                        size: entry.transferSize,
                        type: entry.initiatorType
                    });
                }
            }
        });

        try {
            observer.observe({ entryTypes: ['resource'] });
        } catch (e) {
            this.debug('Resource monitoring not available');
        }
    }

    monitorCDNHealth() {
        const cdnUrls = [
            'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js',
            'https://unpkg.com/vue@3/dist/vue.global.prod.js',
            'https://code.jquery.com/jquery-3.6.0.min.js',
            'https://cdn.jsdelivr.net/npm/beercss@3.7.11/dist/cdn/beer.min.css'
        ];

        cdnUrls.forEach(url => {
            this.checkUrlAvailability(url).then(available => {
                this.debug(`🌐 CDN Health: ${url}`, { available, url });
            });
        });
    }

    async checkUrlAvailability(url) {
        try {
            const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
            return true;
        } catch (error) {
            this.warn(`CDN unavailable: ${url}`, { error: error.message });
            return false;
        }
    }

    // =====================
    // TIMING UTILITIES
    // =====================

    startTimer(name) {
        this.timers.set(name, {
            start: performance.now(),
            timestamp: new Date().toISOString()
        });
        this.debug(`⏱️ Timer started: ${name}`);
    }

    endTimer(name) {
        const timer = this.timers.get(name);
        if (!timer) {
            this.warn(`Timer '${name}' not found`);
            return null;
        }

        const duration = performance.now() - timer.start;
        this.timers.delete(name);

        this.info(`⏱️ Timer completed: ${name}`, {
            duration: `${duration.toFixed(2)}ms`,
            started: timer.timestamp
        });

        return duration;
    }

    // =====================
    // USERSCRIPT-SPECIFIC MONITORING
    // =====================

    monitorVueLoading(timeout = 30000) {
        this.startTimer('vue_loading');
        
        const checkVue = () => {
            if (window.Vue) {
                this.endTimer('vue_loading');
                this.info('✅ Vue loaded successfully', {
                    version: window.Vue.version,
                    loadTime: this.timers.get('vue_loading')?.duration
                });
                return true;
            }
            return false;
        };

        if (checkVue()) return Promise.resolve();

        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                if (checkVue()) {
                    clearInterval(interval);
                    clearTimeout(timeoutId);
                    resolve();
                }
            }, 100);

            const timeoutId = setTimeout(() => {
                clearInterval(interval);
                this.error('❌ Vue loading timeout', { timeout });
                reject(new Error('Vue loading timeout'));
            }, timeout);
        });
    }

    monitorRPCCommunication() {
        const originalPostMessage = window.postMessage;
        window.postMessage = (...args) => {
            const [message] = args;
            if (message && message.kind && message.kind.includes('rpc')) {
                this.debug('📡 RPC Message', {
                    type: 'outgoing',
                    kind: message.kind,
                    method: message.method,
                    data: message.data
                });
            }
            return originalPostMessage.apply(window, args);
        };

        window.addEventListener('message', (event) => {
            const message = event.data;
            if (message && message.kind && message.kind.includes('rpc')) {
                this.debug('📡 RPC Message', {
                    type: 'incoming',
                    kind: message.kind,
                    method: message.method,
                    data: message.data,
                    origin: event.origin
                });
            }
        });
    }

    // =====================
    // DEBUGGING INTERFACE
    // =====================

    createDebugPanel() {
        if (document.getElementById('devopschat-debug-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'devopschat-debug-panel';
        panel.innerHTML = this.getDebugPanelHTML();
        
        // Apply styles
        const style = document.createElement('style');
        style.textContent = this.getDebugPanelCSS();
        document.head.appendChild(style);
        
        document.body.appendChild(panel);
        
        this.setupDebugPanelEvents(panel);
        this.updateDebugPanel();
        
        // Auto-update every 5 seconds
        setInterval(() => this.updateDebugPanel(), 5000);
    }

    getDebugPanelHTML() {
        return `
            <div class="debug-header">
                <h3>🔧 DevOpsChat Tracing</h3>
                <button class="debug-toggle">−</button>
                <button class="debug-clear">Clear</button>
                <button class="debug-export">Export</button>
            </div>
            <div class="debug-content">
                <div class="debug-metrics"></div>
                <div class="debug-logs"></div>
            </div>
        `;
    }

    getDebugPanelCSS() {
        return `
            #devopschat-debug-panel {
                position: fixed;
                top: 10px;
                right: 10px;
                width: 400px;
                max-height: 600px;
                background: #1a1a1a;
                color: #fff;
                border: 1px solid #333;
                border-radius: 8px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                z-index: 999999;
                box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            }
            .debug-header {
                background: #333;
                padding: 10px;
                border-radius: 8px 8px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .debug-header h3 {
                margin: 0;
                font-size: 14px;
            }
            .debug-header button {
                background: #555;
                color: #fff;
                border: none;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                margin-left: 5px;
            }
            .debug-content {
                padding: 10px;
                max-height: 500px;
                overflow-y: auto;
            }
            .debug-metrics {
                background: #2a2a2a;
                padding: 8px;
                border-radius: 4px;
                margin-bottom: 10px;
            }
            .debug-logs {
                background: #2a2a2a;
                padding: 8px;
                border-radius: 4px;
                max-height: 300px;
                overflow-y: auto;
            }
            .log-entry {
                margin: 2px 0;
                padding: 2px 4px;
                border-radius: 2px;
            }
            .log-trace { color: #888; }
            .log-debug { color: #0af; }
            .log-info { color: #0f0; }
            .log-warn { color: #fa0; }
            .log-error { color: #f44; background: rgba(255,68,68,0.1); }
        `;
    }

    setupDebugPanelEvents(panel) {
        const toggleBtn = panel.querySelector('.debug-toggle');
        const clearBtn = panel.querySelector('.debug-clear');
        const exportBtn = panel.querySelector('.debug-export');
        const content = panel.querySelector('.debug-content');

        toggleBtn.addEventListener('click', () => {
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? 'block' : 'none';
            toggleBtn.textContent = isHidden ? '−' : '+';
        });

        clearBtn.addEventListener('click', () => {
            this.clearLogs();
            this.updateDebugPanel();
        });

        exportBtn.addEventListener('click', () => {
            this.exportLogs();
        });
    }

    updateDebugPanel() {
        const panel = document.getElementById('devopschat-debug-panel');
        if (!panel) return;

        const metricsDiv = panel.querySelector('.debug-metrics');
        const logsDiv = panel.querySelector('.debug-logs');

        // Update metrics
        const uptime = ((Date.now() - this.metrics.startTime) / 1000 / 60).toFixed(1);
        metricsDiv.innerHTML = `
            <div><strong>Session:</strong> ${this.sessionId}</div>
            <div><strong>Uptime:</strong> ${uptime}min</div>
            <div><strong>Errors:</strong> ${this.metrics.errors} | <strong>Warnings:</strong> ${this.metrics.warnings}</div>
            <div><strong>Total Logs:</strong> ${this.logs.length}</div>
        `;

        // Update logs (last 20)
        const recentLogs = this.logs.slice(-20);
        logsDiv.innerHTML = recentLogs.map(log => 
            `<div class="log-entry log-${log.level}">
                [${new Date(log.timestamp).toLocaleTimeString()}] ${log.message}
            </div>`
        ).join('');

        // Auto-scroll to bottom
        logsDiv.scrollTop = logsDiv.scrollHeight;
    }

    // =====================
    // UTILITY METHODS
    // =====================

    shouldLog(level) {
        const levels = ['trace', 'debug', 'info', 'warn', 'error'];
        const configLevel = levels.indexOf(this.config.logLevel);
        const messageLevel = levels.indexOf(level);
        return messageLevel >= configLevel;
    }

    generateLogId() {
        return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    sanitizeData(data) {
        try {
            return JSON.parse(JSON.stringify(data, (key, value) => {
                if (typeof value === 'function') return '[Function]';
                if (value instanceof Error) return { name: value.name, message: value.message, stack: value.stack };
                if (typeof value === 'object' && value !== null && value.nodeType) return '[DOM Element]';
                return value;
            }));
        } catch (e) {
            return { _sanitizeError: e.message, _original: String(data) };
        }
    }

    outputToConsole(logEntry) {
        if (!this.config.debugMode && logEntry.level === 'trace') return;

        const styles = {
            trace: 'color: #888',
            debug: 'color: #0af',
            info: 'color: #0f0',
            warn: 'color: #fa0',
            error: 'color: #f44; font-weight: bold'
        };

        const style = styles[logEntry.level] || '';
        const prefix = `[${logEntry.level.toUpperCase()}] ${logEntry.message}`;

        if (Object.keys(logEntry.data).length > 0 || Object.keys(logEntry.context).length > 1) {
            console.groupCollapsed(`%c${prefix}`, style);
            if (Object.keys(logEntry.data).length > 0) {
                console.log('Data:', logEntry.data);
            }
            console.log('Context:', logEntry.context);
            if (logEntry.stack) {
                console.log('Stack:', logEntry.stack);
            }
            console.groupEnd();
        } else {
            console.log(`%c${prefix}`, style);
        }
    }

    // =====================
    // STORAGE METHODS
    // =====================

    saveToStorage() {
        try {
            const data = {
                logs: this.logs.slice(-100), // Keep last 100 logs
                metrics: this.metrics,
                sessionId: this.sessionId,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(this.config.storageKey, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save logs to storage:', e);
        }
    }

    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.config.storageKey);
            if (data) {
                const parsed = JSON.parse(data);
                this.logs = parsed.logs || [];
                // Don't restore metrics as they should start fresh
            }
        } catch (e) {
            console.warn('Failed to load logs from storage:', e);
        }
    }

    saveErrorToStorage(errorEntry) {
        try {
            const key = `${this.config.storageKey}_errors`;
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            existing.push(errorEntry);
            
            // Keep only last 50 errors
            const trimmed = existing.slice(-50);
            localStorage.setItem(key, JSON.stringify(trimmed));
        } catch (e) {
            console.warn('Failed to save error to storage:', e);
        }
    }

    clearLogs() {
        this.logs = [];
        this.errors = [];
        this.metrics.errors = 0;
        this.metrics.warnings = 0;
        this.metrics.info = 0;
        this.metrics.debug = 0;
        this.saveToStorage();
        this.info('📝 Logs cleared');
    }

    exportLogs() {
        const exportData = {
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            logs: this.logs,
            errors: this.errors,
            metrics: this.metrics,
            config: this.config,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `devopschat-trace-${this.sessionId}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.info('📋 Logs exported', { fileName: a.download });
    }

    flush() {
        this.saveToStorage();
        // Here you could also send logs to a remote server
        this.debug('💾 Logs flushed to storage');
    }

    // =====================
    // INTEGRATION HELPERS
    // =====================

    wrapFunction(fn, name = 'Anonymous') {
        return (...args) => {
            this.startTimer(`function_${name}`);
            try {
                const result = fn.apply(this, args);
                this.endTimer(`function_${name}`);
                return result;
            } catch (error) {
                this.endTimer(`function_${name}`);
                this.captureError(error, { functionName: name, arguments: args });
                throw error;
            }
        };
    }

    wrapAsyncFunction(fn, name = 'AsyncAnonymous') {
        return async (...args) => {
            this.startTimer(`async_${name}`);
            try {
                const result = await fn.apply(this, args);
                this.endTimer(`async_${name}`);
                return result;
            } catch (error) {
                this.endTimer(`async_${name}`);
                this.captureError(error, { functionName: name, arguments: args });
                throw error;
            }
        };
    }

    // =====================
    // PUBLIC API
    // =====================

    getSessionId() {
        return this.sessionId;
    }

    getMetrics() {
        return { ...this.metrics };
    }

    getLogs(level = null) {
        return level ? this.logs.filter(log => log.level === level) : [...this.logs];
    }

    getErrors() {
        return [...this.errors];
    }

    setLogLevel(level) {
        this.config.logLevel = level;
        this.info(`Log level changed to: ${level}`);
    }

    enable() {
        this.config.enabled = true;
        this.info('🔧 Tracing enabled');
    }

    disable() {
        this.config.enabled = false;
        console.log('🔧 DevOpsChat Tracing disabled');
    }
}

// =====================
// GLOBAL INTEGRATION
// =====================

// Create global instance if in browser environment
if (typeof window !== 'undefined') {
    window.DevOpsChatTracing = DevOpsChatTracing;
    
    // Auto-initialize if debug mode is enabled
    if (window.location.hash.includes('debug') || window.location.search.includes('trace=true')) {
        window.DevOpsChatTrace = new DevOpsChatTracing({
            debugMode: true,
            logLevel: 'debug'
        });
        
        // Create debug panel
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.DevOpsChatTrace.createDebugPanel();
            });
        } else {
            window.DevOpsChatTrace.createDebugPanel();
        }
    }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DevOpsChatTracing;
}