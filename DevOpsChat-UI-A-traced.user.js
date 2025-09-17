// ==UserScript==
// @name         DevOpsChat UI (A) — Vue 3 + Beer CSS Edition [WITH TRACING]
// @namespace    https://github.com/dingemoe/script
// @match        *://*/*
// @version      5.2.0
// @description  Modern reactive UI med Vue 3 og Beer CSS + Smart Tracing System
// @author       dingemoe
// @downloadURL  https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-UI-A-traced.user.js
// @updateURL    https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-UI-A-traced.user.js
// @supportURL   https://github.com/dingemoe/script/issues
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @resource     devopschat-style https://raw.githack.com/dingemoe/script/main/style/style.css
// @resource     beer-css https://cdn.jsdelivr.net/npm/beercss@3.7.11/dist/cdn/beer.min.css
// @resource     material-icons https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200
// @require      https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js
// @require      https://raw.githack.com/dingemoe/script/main/tracing/tracing.js
// @require      https://raw.githack.com/dingemoe/script/main/tracing/integration.js
// @noframes
// ==/UserScript==

(async () => {
  if (window.top !== window.self) return;
  if (window.__DEVOPSCHAT_UI_A__) return;
  window.__DEVOPSCHAT_UI_A__ = true;

  // =====================
  // TRACING INITIALIZATION - FØRST!
  // =====================
  
  const tracer = window.DevOpsChatTrace.init('DevOpsChat UI (A)', {
    logLevel: 'info',
    debugMode: window.location.hash.includes('debug'),
    autoDebugPanel: true,
    monitorVue: true,
    monitorRPC: true,
    monitorCDN: true
  });

  // Script info med tracing
  const SCRIPT_NAME = 'DevOpsChat UI (A) — Vue 3 + Beer CSS Edition [TRACED]';
  const SCRIPT_VERSION = '5.2.0';
  const MODIFIED_DATE = new Date('2025-09-17T23:00:00Z');
  
  tracer.scriptStarted(SCRIPT_NAME, SCRIPT_VERSION);
  
  const getRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return `${diffSec}s siden`;
    if (diffMin < 60) return `${diffMin}min siden`;
    if (diffHour < 24) return `${diffHour}t siden`;
    return `${diffDay}d siden`;
  };
  
  tracer.info(`🔧 ${SCRIPT_NAME} v${SCRIPT_VERSION}`);
  tracer.info(`📅 Modified: ${MODIFIED_DATE.toLocaleDateString('nb-NO')} ${MODIFIED_DATE.toLocaleTimeString('nb-NO')} (${getRelativeTime(MODIFIED_DATE)})`);

  // =====================
  // SESSION CHECK MED TRACING
  // =====================
  
  const sessionHash = window.location.hash;
  tracer.debug('🔍 Checking session hash', { hash: sessionHash });
  
  if (!sessionHash.includes('dc_session=')) {
    tracer.warn('⚠️ No DevOpsChat session detected in URL hash', {
      currentHash: sessionHash,
      expectedPattern: 'dc_session=*'
    });
    return;
  }

  const sessionId = sessionHash.split('dc_session=')[1]?.split('&')[0];
  tracer.info('✅ DevOpsChat session detected', { sessionId });

  // =====================
  // VUE LOADING MED SMART TRACING
  // =====================
  
  tracer.startTimer('vue_availability_check');
  
  // Sjekk om Vue allerede er tilgjengelig
  if (window.Vue) {
    tracer.endTimer('vue_availability_check');
    tracer.info('✅ Vue already available at script start!', { 
      version: window.Vue.version,
      loadTime: 'immediate'
    });
  } else {
    tracer.info('⏳ Vue not immediately available, starting monitoring...');
    
    try {
      // Bruk det smarte Vue monitoring systemet
      await tracer.monitorVueLoading(30000);
      tracer.endTimer('vue_availability_check');
      tracer.info('✅ Vue successfully loaded via monitoring system', {
        version: window.Vue.version
      });
    } catch (error) {
      tracer.endTimer('vue_availability_check');
      tracer.error('❌ Vue loading failed completely', { error: error.message });
      return;
    }
  }

  // =====================
  // CDN HEALTH CHECK
  // =====================
  
  tracer.info('🌐 Performing CDN health check...');
  const cdnHealth = await window.DevOpsChatTrace.checkCDNHealth();
  const availableCDNs = cdnHealth.filter(cdn => cdn.available).length;
  const totalCDNs = cdnHealth.length;
  
  tracer.info(`🌐 CDN Health Report: ${availableCDNs}/${totalCDNs} available`, { 
    healthReport: cdnHealth 
  });

  // =====================
  // SHADOW DOM CREATION MED TRACING
  // =====================
  
  const shadowContainer = window.DevOpsChatTrace.safe(() => {
    tracer.startTimer('shadow_dom_creation');
    tracer.info('🌑 Creating isolated shadow DOM container...');
    
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
  }, 'shadow_dom_creation');

  // =====================
  // CSS LOADING MED DETALJERT TRACING
  // =====================
  
  await window.DevOpsChatTrace.safeAsync(async () => {
    tracer.startTimer('css_resources_loading');
    tracer.info('🎨 Loading CSS resources into shadow DOM...');
    
    // Beer CSS
    tracer.startTimer('beer_css_loading');
    try {
      const beerCSS = GM_getResourceText('beer-css');
      const styleEl1 = document.createElement('style');
      styleEl1.textContent = beerCSS;
      shadowContainer.shadowRoot.appendChild(styleEl1);
      tracer.endTimer('beer_css_loading');
      tracer.debug('✅ Beer CSS loaded into shadow DOM');
    } catch (error) {
      tracer.endTimer('beer_css_loading');
      tracer.error('❌ Beer CSS loading failed', { error: error.message });
    }

    // Material Icons
    tracer.startTimer('material_icons_loading');
    try {
      const materialIcons = GM_getResourceText('material-icons');
      const styleEl2 = document.createElement('style');
      styleEl2.textContent = materialIcons;
      shadowContainer.shadowRoot.appendChild(styleEl2);
      tracer.endTimer('material_icons_loading');
      tracer.debug('✅ Material Icons loaded into shadow DOM');
    } catch (error) {
      tracer.endTimer('material_icons_loading');
      tracer.warn('⚠️ Material Icons loading failed', { error: error.message });
    }

    // DevOpsChat custom styles
    tracer.startTimer('devopschat_styles_loading');
    try {
      const customCSS = GM_getResourceText('devopschat-style');
      const styleEl3 = document.createElement('style');
      styleEl3.textContent = customCSS;
      shadowContainer.shadowRoot.appendChild(styleEl3);
      tracer.endTimer('devopschat_styles_loading');
      tracer.debug('✅ DevOpsChat styles loaded into shadow DOM');
    } catch (error) {
      tracer.endTimer('devopschat_styles_loading');
      tracer.warn('⚠️ DevOpsChat styles loading failed', { error: error.message });
    }

    tracer.endTimer('css_resources_loading');
    tracer.info('✅ CSS resources loaded in isolated shadow DOM');
    
  }, 'css_loading_process');

  // =====================
  // VUE APP INITIALIZATION MED ENHANCED ERROR HANDLING
  // =====================
  
  const vueApp = window.DevOpsChatTrace.safe(() => {
    tracer.startTimer('vue_app_creation');
    tracer.info('🚀 Initializing Vue application...');
    
    const { createApp } = window.Vue;
    
    const app = createApp({
      template: `
        <div class="medium-space padding">
          <div class="row">
            <div class="col s12">
              <h3>🔧 DevOpsChat Traced Interface</h3>
              <p><small>Version {{ version }} - Session: {{ sessionId }}</small></p>
            </div>
          </div>
          
          <div class="row">
            <div class="col s6">
              <div class="card">
                <div class="card-content">
                  <h5>📊 System Status</h5>
                  <p><strong>Vue Version:</strong> {{ vueVersion }}</p>
                  <p><strong>Uptime:</strong> {{ uptime }}min</p>
                  <p><strong>Errors:</strong> {{ errorCount }}</p>
                  <p><strong>CDN Health:</strong> {{ cdnStatus }}</p>
                  <p><strong>Memory:</strong> {{ memoryUsage }}</p>
                </div>
              </div>
            </div>
            
            <div class="col s6">
              <div class="card">
                <div class="card-content">
                  <h5>🧪 Debug Actions</h5>
                  <div class="space"></div>
                  <button @click="testRPC" class="button primary">
                    <i class="material-symbols-outlined">wifi</i>
                    <span>Test RPC</span>
                  </button>
                  <div class="small-space"></div>
                  <button @click="checkCDN" class="button secondary">
                    <i class="material-symbols-outlined">cloud</i>
                    <span>Check CDN</span>
                  </button>
                  <div class="small-space"></div>
                  <button @click="debugState" class="button">
                    <i class="material-symbols-outlined">bug_report</i>
                    <span>Debug State</span>
                  </button>
                  <div class="small-space"></div>
                  <button @click="exportLogs" class="button">
                    <i class="material-symbols-outlined">download</i>
                    <span>Export Logs</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="debugOutput" class="row">
            <div class="col s12">
              <div class="card">
                <div class="card-content">
                  <h6>📋 Debug Output</h6>
                  <pre class="code">{{ debugOutput }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
      data() {
        return {
          version: SCRIPT_VERSION,
          sessionId: sessionId,
          vueVersion: window.Vue.version,
          uptime: 0,
          errorCount: 0,
          cdnStatus: '${availableCDNs}/${totalCDNs}',
          memoryUsage: 'Calculating...',
          debugOutput: ''
        };
      },
      methods: {
        testRPC() {
          tracer.info('🧪 User initiated RPC test');
          this.debugOutput = 'Testing RPC communication...';
          window.DevOpsChatTrace.testRPC();
          setTimeout(() => {
            this.debugOutput = 'RPC test completed. Check debug panel for details.';
          }, 2000);
        },
        async checkCDN() {
          tracer.info('🧪 User initiated CDN health check');
          this.debugOutput = 'Checking CDN health...';
          const health = await window.DevOpsChatTrace.checkCDNHealth();
          const available = health.filter(h => h.available).length;
          this.cdnStatus = \`\${available}/\${health.length}\`;
          this.debugOutput = JSON.stringify(health, null, 2);
        },
        debugState() {
          tracer.info('🧪 User requested debug state');
          const state = window.DevOpsChatTrace.debugState();
          this.debugOutput = JSON.stringify(state, null, 2);
        },
        exportLogs() {
          tracer.info('🧪 User exported logs');
          tracer.exportLogs();
          this.debugOutput = 'Logs exported successfully! Check your downloads.';
        }
      },
      mounted() {
        tracer.info('🎯 Vue component mounted successfully');
        
        // Update metrics every 5 seconds
        setInterval(() => {
          const metrics = tracer.getMetrics();
          this.uptime = ((Date.now() - metrics.startTime) / 1000 / 60).toFixed(1);
          this.errorCount = metrics.errors;
          
          // Update memory usage
          const memory = window.DevOpsChatTrace.getMemoryUsage();
          if (memory) {
            this.memoryUsage = \`\${memory.used}MB/\${memory.total}MB\`;
          }
        }, 5000);
      }
    });

    // Enhanced Vue error handler med tracing
    app.config.errorHandler = (err, instance, info) => {
      tracer.captureError(err, {
        type: 'vue_component_error',
        componentInfo: info,
        componentName: instance?.$options?.name || 'Unknown Component'
      });
    };

    tracer.endTimer('vue_app_creation');
    return app;
    
  }, 'vue_app_initialization');

  // =====================
  // MOUNT VUE APP MED TRACING
  // =====================
  
  window.DevOpsChatTrace.safe(() => {
    tracer.startTimer('vue_app_mounting');
    tracer.info('🎯 Mounting Vue application to shadow DOM...');
    
    const appContainer = document.createElement('div');
    shadowContainer.shadowRoot.appendChild(appContainer);
    
    vueApp.mount(appContainer);
    
    tracer.endTimer('vue_app_mounting');
    tracer.info('✅ Vue application mounted successfully');
    
  }, 'vue_app_mounting');

  // =====================
  // RPC MONITORING SETUP
  // =====================
  
  tracer.info('📡 Setting up RPC communication monitoring...');
  tracer.monitorRPCCommunication();

  // =====================
  // PERFORMANCE MONITORING
  // =====================
  
  // Kontinuerlig memory monitoring
  setInterval(() => {
    const memory = window.DevOpsChatTrace.getMemoryUsage();
    if (memory && memory.used > 100) { // Over 100MB
      tracer.warn('💾 High memory usage detected', memory);
    }
  }, 30000);

  // Performance snapshot hver 5. minutt
  setInterval(() => {
    window.DevOpsChatTrace.getPerformanceSnapshot();
  }, 300000);

  // =====================
  // KEYBOARD SHORTCUTS MED TRACING
  // =====================
  
  document.addEventListener('keydown', (event) => {
    // Ctrl+Shift+D for debug panel
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyD') {
      event.preventDefault();
      tracer.info('⌨️ Debug panel toggle shortcut activated');
      if (document.getElementById('devopschat-debug-panel')) {
        document.getElementById('devopschat-debug-panel').remove();
        tracer.info('🔧 Debug panel closed');
      } else {
        tracer.createDebugPanel();
        tracer.info('🔧 Debug panel opened');
      }
    }
    
    // Ctrl+Shift+T for trace state
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyT') {
      event.preventDefault();
      tracer.info('⌨️ Debug state shortcut activated');
      window.DevOpsChatTrace.debugState();
    }
    
    // Ctrl+Shift+R for RPC test
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyR') {
      event.preventDefault();
      tracer.info('⌨️ RPC test shortcut activated');
      window.DevOpsChatTrace.testRPC();
    }
  });

  // =====================
  // FINAL SETUP
  // =====================
  
  tracer.scriptReady(SCRIPT_NAME);
  tracer.info('🎉 DevOpsChat UI (A) with Smart Tracing fully initialized!', {
    version: SCRIPT_VERSION,
    sessionId: sessionId,
    vueVersion: window.Vue.version,
    tracingEnabled: true,
    debugMode: window.location.hash.includes('debug')
  });

  // Set global markers
  window.__DEVOPSCHAT_UI_A__ = {
    version: SCRIPT_VERSION,
    initialized: true,
    withTracing: true,
    tracer: tracer,
    container: shadowContainer
  };

  tracer.info('🎯 Keyboard shortcuts available:', {
    'Ctrl+Shift+D': 'Toggle debug panel',
    'Ctrl+Shift+T': 'Show system state',
    'Ctrl+Shift+R': 'Test RPC communication'
  });

})().catch(error => {
  // Final error fallback
  console.error('🚨 Critical error in DevOpsChat UI (A) with Tracing:', error);
  if (window.DevOpsChatTrace?.tracer) {
    window.DevOpsChatTrace.tracer.captureError(error, { 
      phase: 'script_initialization',
      critical: true 
    });
  }
});