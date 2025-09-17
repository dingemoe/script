// ==UserScript==
// @name         DevOpsChat UI (React) — React 18 + DaisyUI Edition [WITH TRACING]
// @namespace    https://github.com/dingemoe/script
// @match        *://*/*
// @version      6.0.0
// @description  Modern reactive UI med React 18 og DaisyUI + Smart Tracing System
// @author       dingemoe
// @downloadURL  https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-UI-React-traced.user.js
// @updateURL    https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-UI-React-traced.user.js
// @supportURL   https://github.com/dingemoe/script/issues
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @resource     daisyui-css https://cdn.jsdelivr.net/npm/daisyui@4.12.10/dist/full.min.css
// @resource     tailwindcss https://cdn.jsdelivr.net/npm/tailwindcss@3.4.10/dist/tailwind.min.css
// @resource     devopschat-style https://raw.githack.com/dingemoe/script/main/style/style.css
// @require      https://unpkg.com/react@18/umd/react.production.min.js
// @require      https://unpkg.com/react-dom@18/umd/react-dom.production.min.js
// @require      https://raw.githack.com/dingemoe/script/main/tracing/tracing.js
// @require      https://raw.githack.com/dingemoe/script/main/tracing/integration.js
// @noframes
// ==/UserScript==

(async () => {
  if (window.top !== window.self) return;
  if (window.__DEVOPSCHAT_UI_REACT__) return;
  window.__DEVOPSCHAT_UI_REACT__ = true;

  // =====================
  // TRACING INITIALIZATION - FØRST!
  // =====================
  
  const tracer = window.DevOpsChatTrace.init('DevOpsChat UI (React)', {
    logLevel: 'info',
    debugMode: window.location.hash.includes('debug'),
    autoDebugPanel: true,
    monitorVue: false,    // Vi bruker ikke Vue lenger
    monitorReact: true,   // Overvåk React loading
    monitorRPC: true,
    monitorCDN: true
  });

  // Script info med tracing
  const SCRIPT_NAME = 'DevOpsChat UI (React) — React 18 + DaisyUI Edition [TRACED]';
  const SCRIPT_VERSION = '6.0.0';
  const MODIFIED_DATE = new Date('2025-09-17T23:25:00Z'); // ✅ New React version with DaisyUI
  
  tracer.info(`🚀 Script started: ${SCRIPT_NAME} v${SCRIPT_VERSION}`);
  
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
  
  tracer.info(`⚛️ ${SCRIPT_NAME} v${SCRIPT_VERSION}`);
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
  // REACT LOADING MED SMART TRACING
  // =====================
  
  tracer.startTimer('react_availability_check');
  
  // Sjekk om React allerede er tilgjengelig
  if (window.React && window.ReactDOM) {
    tracer.endTimer('react_availability_check');
    tracer.info('✅ React already available at script start!', { 
      reactVersion: window.React.version,
      loadTime: 'immediate'
    });
  } else {
    tracer.info('⏳ React not immediately available, starting monitoring...');
    
    try {
      // Overvåk React loading
      await window.DevOpsChatTrace.safeAsync(async () => {
        let attempts = 0;
        const maxAttempts = 60; // 30 sekunder
        
        while ((!window.React || !window.ReactDOM) && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
          
          if (attempts % 10 === 0) {
            tracer.debug(`⏳ React loading check ${attempts}/${maxAttempts}`, {
              reactAvailable: !!window.React,
              reactDOMAvailable: !!window.ReactDOM
            });
          }
        }
        
        if (!window.React || !window.ReactDOM) {
          throw new Error('React loading timeout after 30 seconds');
        }
        
        tracer.endTimer('react_availability_check');
        tracer.info('✅ React successfully loaded via monitoring system', {
          reactVersion: window.React.version,
          attempts: attempts
        });
      }, 'react_loading_monitor');
      
    } catch (error) {
      tracer.endTimer('react_availability_check');
      tracer.error('❌ React loading failed completely', { error: error.message });
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
      width: 900px !important;
      height: 700px !important;
      z-index: 999999 !important;
      border: 2px solid #333 !important;
      border-radius: 12px !important;
      background: white !important;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important;
      pointer-events: auto !important;
      overflow: hidden !important;
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
    
    // TailwindCSS
    tracer.startTimer('tailwind_css_loading');
    try {
      const tailwindCSS = GM_getResourceText('tailwindcss');
      const styleEl1 = document.createElement('style');
      styleEl1.textContent = tailwindCSS;
      shadowContainer.shadowRoot.appendChild(styleEl1);
      tracer.endTimer('tailwind_css_loading');
      tracer.debug('✅ TailwindCSS loaded into shadow DOM');
    } catch (error) {
      tracer.endTimer('tailwind_css_loading');
      tracer.error('❌ TailwindCSS loading failed', { error: error.message });
    }

    // DaisyUI
    tracer.startTimer('daisyui_css_loading');
    try {
      const daisyUICSS = GM_getResourceText('daisyui-css');
      const styleEl2 = document.createElement('style');
      styleEl2.textContent = daisyUICSS;
      shadowContainer.shadowRoot.appendChild(styleEl2);
      tracer.endTimer('daisyui_css_loading');
      tracer.debug('✅ DaisyUI loaded into shadow DOM');
    } catch (error) {
      tracer.endTimer('daisyui_css_loading');
      tracer.warn('⚠️ DaisyUI loading failed', { error: error.message });
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
  // REACT APP COMPONENT DEFINITION
  // =====================
  
  const { useState, useEffect } = React;
  
  const DevOpsChatApp = () => {
    const [systemStatus, setSystemStatus] = useState({
      version: SCRIPT_VERSION,
      sessionId: sessionId,
      reactVersion: React.version,
      uptime: 0,
      errorCount: 0,
      cdnStatus: `${availableCDNs}/${totalCDNs}`,
      memoryUsage: 'Calculating...'
    });
    
    const [debugOutput, setDebugOutput] = useState('');
    
    useEffect(() => {
      tracer.info('⚛️ React component mounted successfully');
      
      // Update metrics every 5 seconds
      const interval = setInterval(() => {
        const metrics = tracer.getMetrics();
        const uptime = ((Date.now() - metrics.startTime) / 1000 / 60).toFixed(1);
        
        // Update memory usage
        const memory = window.DevOpsChatTrace.getMemoryUsage();
        const memoryUsage = memory ? `${memory.used}MB/${memory.total}MB` : 'Unknown';
        
        setSystemStatus(prev => ({
          ...prev,
          uptime: uptime,
          errorCount: metrics.errors,
          memoryUsage: memoryUsage
        }));
      }, 5000);
      
      return () => clearInterval(interval);
    }, []);
    
    const testRPC = () => {
      tracer.info('🧪 User initiated RPC test');
      setDebugOutput('Testing RPC communication...');
      window.DevOpsChatTrace.testRPC();
      setTimeout(() => {
        setDebugOutput('RPC test completed. Check debug panel for details.');
      }, 2000);
    };
    
    const checkCDN = async () => {
      tracer.info('🧪 User initiated CDN health check');
      setDebugOutput('Checking CDN health...');
      const health = await window.DevOpsChatTrace.checkCDNHealth();
      const available = health.filter(h => h.available).length;
      setSystemStatus(prev => ({ ...prev, cdnStatus: `${available}/${health.length}` }));
      setDebugOutput(JSON.stringify(health, null, 2));
    };
    
    const debugState = () => {
      tracer.info('🧪 User requested debug state');
      const state = window.DevOpsChatTrace.debugState();
      setDebugOutput(JSON.stringify(state, null, 2));
    };
    
    const exportLogs = () => {
      tracer.info('🧪 User exported logs');
      tracer.exportLogs();
      setDebugOutput('Logs exported successfully! Check your downloads.');
    };
    
    return React.createElement('div', { className: 'p-6 min-h-full bg-base-100' }, 
      // Header
      React.createElement('div', { className: 'mb-6' },
        React.createElement('h1', { className: 'text-3xl font-bold text-primary mb-2' }, '⚛️ DevOpsChat React Interface'),
        React.createElement('p', { className: 'text-sm text-base-content/70' }, 
          `Version ${systemStatus.version} - Session: ${systemStatus.sessionId}`
        )
      ),
      
      // Stats Cards
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6' },
        React.createElement('div', { className: 'stat bg-base-200 rounded-box' },
          React.createElement('div', { className: 'stat-title' }, 'React Version'),
          React.createElement('div', { className: 'stat-value text-lg' }, systemStatus.reactVersion),
          React.createElement('div', { className: 'stat-desc' }, 'Framework')
        ),
        React.createElement('div', { className: 'stat bg-base-200 rounded-box' },
          React.createElement('div', { className: 'stat-title' }, 'Uptime'),
          React.createElement('div', { className: 'stat-value text-lg' }, `${systemStatus.uptime}min`),
          React.createElement('div', { className: 'stat-desc' }, 'Running time')
        ),
        React.createElement('div', { className: 'stat bg-base-200 rounded-box' },
          React.createElement('div', { className: 'stat-title' }, 'Errors'),
          React.createElement('div', { className: 'stat-value text-lg' }, systemStatus.errorCount),
          React.createElement('div', { className: 'stat-desc' }, 'Captured')
        ),
        React.createElement('div', { className: 'stat bg-base-200 rounded-box' },
          React.createElement('div', { className: 'stat-title' }, 'CDN Health'),
          React.createElement('div', { className: 'stat-value text-lg' }, systemStatus.cdnStatus),
          React.createElement('div', { className: 'stat-desc' }, 'Available')
        )
      ),
      
      // Action Cards
      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6' },
        // System Status Card
        React.createElement('div', { className: 'card bg-base-200 shadow-xl' },
          React.createElement('div', { className: 'card-body' },
            React.createElement('h2', { className: 'card-title' }, '📊 System Status'),
            React.createElement('div', { className: 'space-y-2' },
              React.createElement('p', null, React.createElement('strong', null, 'Memory: '), systemStatus.memoryUsage),
              React.createElement('p', null, React.createElement('strong', null, 'Tracing: '), 'Active'),
              React.createElement('p', null, React.createElement('strong', null, 'Debug Mode: '), window.location.hash.includes('debug') ? 'ON' : 'OFF')
            )
          )
        ),
        
        // Debug Actions Card
        React.createElement('div', { className: 'card bg-base-200 shadow-xl' },
          React.createElement('div', { className: 'card-body' },
            React.createElement('h2', { className: 'card-title' }, '🧪 Debug Actions'),
            React.createElement('div', { className: 'grid grid-cols-2 gap-2' },
              React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: testRPC }, 'Test RPC'),
              React.createElement('button', { className: 'btn btn-secondary btn-sm', onClick: checkCDN }, 'Check CDN'),
              React.createElement('button', { className: 'btn btn-accent btn-sm', onClick: debugState }, 'Debug State'),
              React.createElement('button', { className: 'btn btn-neutral btn-sm', onClick: exportLogs }, 'Export Logs')
            )
          )
        )
      ),
      
      // Debug Output
      debugOutput && React.createElement('div', { className: 'card bg-base-200 shadow-xl' },
        React.createElement('div', { className: 'card-body' },
          React.createElement('h2', { className: 'card-title' }, '📋 Debug Output'),
          React.createElement('pre', { className: 'text-xs bg-base-300 p-4 rounded-lg overflow-auto max-h-64' }, debugOutput)
        )
      )
    );
  };

  // =====================
  // REACT APP RENDERING MED TRACING
  // =====================
  
  window.DevOpsChatTrace.safe(() => {
    tracer.startTimer('react_app_mounting');
    tracer.info('⚛️ Mounting React application to shadow DOM...');
    
    const appContainer = document.createElement('div');
    appContainer.style.cssText = 'width: 100%; height: 100%; overflow: auto;';
    shadowContainer.shadowRoot.appendChild(appContainer);
    
    // Enhanced React error boundary
    const ErrorBoundary = class extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }
      
      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }
      
      componentDidCatch(error, errorInfo) {
        tracer.captureError(error, {
          type: 'react_component_error',
          errorInfo: errorInfo,
          componentStack: errorInfo.componentStack
        });
      }
      
      render() {
        if (this.state.hasError) {
          return React.createElement('div', { className: 'alert alert-error' },
            React.createElement('h3', null, 'Something went wrong!'),
            React.createElement('p', null, this.state.error?.message || 'Unknown error')
          );
        }
        
        return this.props.children;
      }
    };
    
    const AppWithErrorBoundary = React.createElement(ErrorBoundary, null,
      React.createElement(DevOpsChatApp)
    );
    
    ReactDOM.render(AppWithErrorBoundary, appContainer);
    
    tracer.endTimer('react_app_mounting');
    tracer.info('✅ React application mounted successfully');
    
  }, 'react_app_mounting');

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
  
  tracer.info(`🎉 Script fully initialized: ${SCRIPT_NAME}`);
  tracer.info('🎉 DevOpsChat React UI with Smart Tracing fully initialized!', {
    version: SCRIPT_VERSION,
    sessionId: sessionId,
    reactVersion: React.version,
    tracingEnabled: true,
    debugMode: window.location.hash.includes('debug')
  });

  // Set global markers
  window.__DEVOPSCHAT_UI_REACT__ = {
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
  console.error('🚨 Critical error in DevOpsChat React UI with Tracing:', error);
  if (window.DevOpsChatTrace?.tracer) {
    window.DevOpsChatTrace.tracer.captureError(error, { 
      phase: 'script_initialization',
      critical: true 
    });
  }
});