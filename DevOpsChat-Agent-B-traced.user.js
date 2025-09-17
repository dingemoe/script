// ==UserScript==
// @name         DevOpsChat Agent (B) + jQuery [WITH TRACING]
// @namespace    https://github.com/dingemoe/script
// @match        *://*/*
// @version      2.2.1
// @description  RPC Agent på målsiden + Smart Tracing System
// @author       dingemoe
// @downloadURL  https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-Agent-B-traced.user.js
// @updateURL    https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-Agent-B-traced.user.js
// @supportURL   https://github.com/dingemoe/script/issues
// @grant        none
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @require      https://raw.githack.com/dingemoe/script/main/tracing/tracing.js
// @require      https://raw.githack.com/dingemoe/script/main/tracing/integration.js
// @noframes
// ==/UserScript==

(() => {
  if (window.top !== window.self) return;
  if (window.__DEVOPSCHAT_AGENT_B__) return;
  window.__DEVOPSCHAT_AGENT_B__ = true;

  // =====================
  // TRACING INITIALIZATION - FØRST!
  // =====================
  
  const tracer = window.DevOpsChatTrace.init('DevOpsChat Agent (B)', {
    logLevel: 'info',
    debugMode: window.location.hash.includes('debug'),
    autoDebugPanel: false, // Ikke vis panel på Agent side
    monitorVue: false,    // Agent bruker ikke Vue
    monitorRPC: true,     // Viktig for Agent
    monitorCDN: false,    // Ikke nødvendig for Agent
    monitorDOM: true      // Overvåk DOM manipulering
  });

  // Script info med tracing
  const SCRIPT_NAME = 'DevOpsChat Agent (B) + jQuery [TRACED]';
  const SCRIPT_VERSION = '2.2.1';
  const MODIFIED_DATE = new Date('2025-09-17T23:15:00Z'); // ✅ Modification tracking
  
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
  
  tracer.info(`🤖 ${SCRIPT_NAME} v${SCRIPT_VERSION}`);
  tracer.info(`📅 Modified: ${MODIFIED_DATE.toLocaleDateString('nb-NO')} ${MODIFIED_DATE.toLocaleTimeString('nb-NO')} (${getRelativeTime(MODIFIED_DATE)})`);

  // =====================
  // JQUERY MONITORING MED TRACING
  // =====================
  
  tracer.startTimer('jquery_availability_check');
  
  if (window.jQuery || window.$) {
    tracer.endTimer('jquery_availability_check');
    tracer.info('✅ jQuery already available at script start!', {
      version: window.jQuery?.fn?.jquery || 'unknown',
      loadTime: 'immediate'
    });
  } else {
    tracer.info('⏳ jQuery not immediately available, starting monitoring...');
    
    // Use the smart jQuery monitoring from integration
    window.DevOpsChatTrace.monitorJQueryLoading();
  }

  // =====================
  // RPC MESSAGE HANDLER MED ENHANCED TRACING
  // =====================
  
  const handleRPCMessage = window.DevOpsChatTrace.safe((event) => {
    // Safety check for event and event.data
    if (!event || !event.data) {
      return;
    }
    
    const message = event.data;
    
    // Filtrer kun DevOpsChat RPC meldinger
    if (!message || !message.kind || !message.kind.includes('rpc_call')) {
      return;
    }

    tracer.info('📡 RPC message received', {
      method: message.method,
      kind: message.kind,
      origin: event.origin,
      dataPresent: !!message.data,
      timestamp: new Date().toISOString()
    });

    try {
      let result = null;
      let error = null;

      // Handle different RPC methods med tracing
      switch (message.method) {
        case 'ping':
          tracer.debug('🏓 Handling ping request');
          result = { 
            status: 'pong', 
            timestamp: Date.now(),
            agentVersion: SCRIPT_VERSION,
            jqueryAvailable: !!(window.jQuery || window.$)
          };
          break;

        case 'executeJS':
          tracer.info('🔧 Executing JavaScript code', { 
            codeLength: message.data?.code?.length || 0
          });
          tracer.startTimer('js_execution');
          
          try {
            result = eval(message.data.code);
            tracer.endTimer('js_execution');
            tracer.info('✅ JavaScript execution successful', { 
              resultType: typeof result,
              hasResult: result !== undefined
            });
          } catch (execError) {
            tracer.endTimer('js_execution');
            tracer.error('❌ JavaScript execution failed', { 
              error: execError.message,
              code: message.data.code
            });
            error = execError.message;
          }
          break;

        case 'manipulateDOM':
          tracer.info('🎯 DOM manipulation request', {
            selector: message.data?.selector,
            action: message.data?.action
          });
          
          try {
            const $ = window.jQuery || window.$;
            if (!$) {
              throw new Error('jQuery not available for DOM manipulation');
            }

            const element = $(message.data.selector);
            tracer.debug('🔍 Element selection', {
              selector: message.data.selector,
              found: element.length,
              action: message.data.action
            });

            switch (message.data.action) {
              case 'click':
                element.click();
                result = `Clicked ${element.length} element(s)`;
                break;
              case 'text':
                result = element.text();
                break;
              case 'val':
                if (message.data.value !== undefined) {
                  element.val(message.data.value);
                  result = `Set value to: ${message.data.value}`;
                } else {
                  result = element.val();
                }
                break;
              case 'attr':
                if (message.data.value !== undefined) {
                  element.attr(message.data.attribute, message.data.value);
                  result = `Set ${message.data.attribute} to: ${message.data.value}`;
                } else {
                  result = element.attr(message.data.attribute);
                }
                break;
              case 'css':
                if (message.data.value !== undefined) {
                  element.css(message.data.property, message.data.value);
                  result = `Set CSS ${message.data.property} to: ${message.data.value}`;
                } else {
                  result = element.css(message.data.property);
                }
                break;
              default:
                throw new Error(`Unknown DOM action: ${message.data.action}`);
            }

            tracer.info('✅ DOM manipulation successful', {
              action: message.data.action,
              result: typeof result === 'string' ? result.substring(0, 100) : result
            });

          } catch (domError) {
            tracer.error('❌ DOM manipulation failed', {
              error: domError.message,
              selector: message.data?.selector,
              action: message.data?.action
            });
            error = domError.message;
          }
          break;

        case 'getSystemInfo':
          tracer.info('📊 System info request');
          result = {
            userAgent: navigator.userAgent,
            url: window.location.href,
            title: document.title,
            jqueryVersion: window.jQuery?.fn?.jquery || 'not available',
            agentVersion: SCRIPT_VERSION,
            tracingEnabled: true,
            memoryUsage: window.DevOpsChatTrace.getMemoryUsage(),
            tracingSession: tracer.getSessionId()
          };
          break;

        default:
          tracer.warn('❓ Unknown RPC method', { method: message.method });
          error = `Unknown method: ${message.method}`;
      }

      // Send response back med tracing
      const response = {
        kind: 'rpc_response',
        method: message.method,
        requestId: message.requestId,
        success: !error,
        result: result,
        error: error,
        timestamp: Date.now(),
        agentVersion: SCRIPT_VERSION
      };

      tracer.debug('📤 Sending RPC response', {
        method: message.method,
        success: !error,
        hasResult: result !== undefined,
        hasError: !!error
      });

      event.source.postMessage(response, event.origin);

    } catch (handlerError) {
      tracer.error('💥 Critical RPC handler error', {
        error: handlerError.message,
        method: message.method,
        stack: handlerError.stack
      });

      // Send error response
      const errorResponse = {
        kind: 'rpc_response',
        method: message.method,
        requestId: message.requestId,
        success: false,
        error: `Handler error: ${handlerError.message}`,
        timestamp: Date.now(),
        agentVersion: SCRIPT_VERSION
      };

      try {
        event.source.postMessage(errorResponse, event.origin);
      } catch (postError) {
        tracer.error('💥 Failed to send error response', { error: postError.message });
      }
    }
  }, 'rpc_message_handler');

  // =====================
  // RPC COMMUNICATION SETUP
  // =====================
  
  tracer.info('📡 Setting up RPC communication listener...');
  window.addEventListener('message', handleRPCMessage);
  
  // Auto-enable RPC monitoring
  tracer.monitorRPCCommunication();

  // =====================
  // DOM MONITORING SETUP
  // =====================
  
  let domModificationCount = 0;
  const domObserver = new MutationObserver((mutations) => {
    domModificationCount += mutations.length;
    
    // Log significant DOM changes (batch to avoid spam)
    if (domModificationCount % 25 === 0) {
      tracer.debug('🔄 DOM activity detected', {
        totalModifications: domModificationCount,
        recentBatch: mutations.length,
        url: window.location.href
      });
    }
  });

  domObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style', 'id']
  });

  tracer.info('👁️ DOM monitoring enabled');

  // =====================
  // PERFORMANCE MONITORING
  // =====================
  
  // Memory monitoring every minute
  setInterval(() => {
    const memory = window.DevOpsChatTrace.getMemoryUsage();
    if (memory && memory.used > 50) { // Over 50MB on agent side is concerning
      tracer.warn('💾 High memory usage on Agent', memory);
    }
  }, 60000);

  // =====================
  // ERROR TESTING FUNCTIONS (for debugging)
  // =====================
  
  // Expose testing functions globally for debugging
  window.DevOpsChatAgentTest = {
    testRPC: () => {
      tracer.info('🧪 Testing RPC communication from Agent side');
      window.postMessage({
        kind: 'rpc_call',
        method: 'ping',
        data: { test: true, from: 'agent' },
        requestId: 'test_' + Date.now()
      }, '*');
    },
    
    testJavaScriptExecution: () => {
      tracer.info('🧪 Testing JavaScript execution');
      window.postMessage({
        kind: 'rpc_call',
        method: 'executeJS',
        data: { code: 'console.log("Test from Agent"); return "OK";' },
        requestId: 'js_test_' + Date.now()
      }, '*');
    },
    
    testDOMManipulation: () => {
      tracer.info('🧪 Testing DOM manipulation');
      // Create a test element first
      if (!document.getElementById('agent-test-element')) {
        const testEl = document.createElement('div');
        testEl.id = 'agent-test-element';
        testEl.textContent = 'Agent Test Element';
        testEl.style.cssText = 'position: fixed; top: 10px; right: 10px; background: yellow; padding: 5px; z-index: 9999;';
        document.body.appendChild(testEl);
      }
      
      window.postMessage({
        kind: 'rpc_call',
        method: 'manipulateDOM',
        data: { 
          selector: '#agent-test-element',
          action: 'css',
          property: 'background-color',
          value: 'lime'
        },
        requestId: 'dom_test_' + Date.now()
      }, '*');
    },
    
    getDebugInfo: () => {
      return window.DevOpsChatTrace.debugState();
    },
    
    exportLogs: () => {
      tracer.exportLogs();
    }
  };

  // =====================
  // FINAL SETUP
  // =====================
  
  tracer.info(`🎉 Script fully initialized: ${SCRIPT_NAME}`);
  tracer.info('🎉 DevOpsChat Agent (B) with Smart Tracing fully initialized!', {
    version: SCRIPT_VERSION,
    jqueryVersion: window.jQuery?.fn?.jquery || 'not available',
    tracingEnabled: true,
    debugMode: window.location.hash.includes('debug'),
    url: window.location.href
  });

  // Set global markers
  window.__DEVOPSCHAT_AGENT_B__ = {
    version: SCRIPT_VERSION,
    initialized: true,
    withTracing: true,
    tracer: tracer,
    testFunctions: window.DevOpsChatAgentTest
  };

  tracer.info('🧪 Agent test functions available via window.DevOpsChatAgentTest:', {
    testRPC: 'Test RPC ping',
    testJavaScriptExecution: 'Test JS execution',
    testDOMManipulation: 'Test DOM manipulation',
    getDebugInfo: 'Get current debug state',
    exportLogs: 'Export tracing logs'
  });

})();