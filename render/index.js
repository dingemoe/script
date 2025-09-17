/**
 * DevOpsChat Render System Controller
 * Coordinates all panels and provides unified API
 */

// Dynamic imports for Vue access - support shadow DOM context
const getVue = (vueInstance = null) => {
  // If Vue instance is provided directly, use it
  if (vueInstance) {
    return vueInstance;
  }
  
  // Try to get from window (for non-shadow DOM contexts)
  if (typeof window !== 'undefined' && window.Vue) {
    return window.Vue;
  }
  
  // Try global Vue (fallback)
  if (typeof Vue !== 'undefined') {
    return Vue;
  }
  
  throw new Error('Vue is not loaded yet. Make sure Vue 3 is available globally or pass Vue instance.');
};

// Import panel controllers
export const importPanelControllers = async () => {
  const GH_USER = 'dingemoe';
  const GH_REPO = 'script';
  const CDN = (...p) => `https://raw.githack.com/${GH_USER}/${GH_REPO}/main/${p.join('/')}`;
  
  const pick = async (candidates) => {
    for (const url of candidates) {
      try { 
        const response = await fetch(url, { method: 'HEAD' }); 
        if (response.ok) return url; 
      } catch {} 
    }
    return candidates[0];
  };

  const panel1Url = await pick([
    CDN('render', 'panel1', 'index.js'),
    CDN('render', 'panel1', 'controller.js')
  ]);
  
  const panel2Url = await pick([
    CDN('render', 'panel2', 'index.js'), 
    CDN('render', 'panel2', 'controller.js')
  ]);

  const [Panel1, Panel2] = await Promise.all([
    import(panel1Url),
    import(panel2Url)
  ]);

  return { Panel1, Panel2 };
};

// Main render controller class
export class RenderController {
  constructor(options = {}) {
    this.shadowRoot = options.shadowRoot;
    this.appInstance = null;
    this.panels = {};
    this.vue = null;
    this.panels = {};
    this.appInstance = null;
    this.container = null;
  }

  async initialize(containerElement, vueInstance = null) {
    try {
      this.vue = getVue(vueInstance);
      this.container = containerElement;
      
      // Import panel controllers
      const { Panel1, Panel2 } = await importPanelControllers();
      
      // Initialize panels
      this.panels.panel1 = new Panel1.ChatPanelController();
      this.panels.panel2 = new Panel2.DevPanelController();
      
      // Create unified Vue app
      const appConfig = await this.createAppConfig();
      this.appInstance = this.vue.createApp(appConfig).mount(containerElement);
      
      console.log('✅ RenderController: All panels initialized successfully');
      return this.appInstance;
      
    } catch (error) {
      console.error('❌ RenderController: Initialization failed:', error);
      throw error;
    }
  }

  async createAppConfig() {
    const { ref, computed } = this.vue;
    
    return {
      setup() {
        // Global state
        const globalState = ref({
          sessions: {},
          currentSession: null,
          status: 'No session',
          isConnected: false
        });

        // Panel visibility
        const showPanel1 = ref(true);
        const showPanel2 = ref(true);

        // Global methods
        const updateGlobalState = (newState) => {
          Object.assign(globalState.value, newState);
        };

        const togglePanel = (panelName) => {
          if (panelName === 'panel1') showPanel1.value = !showPanel1.value;
          if (panelName === 'panel2') showPanel2.value = !showPanel2.value;
        };

        const dispatchEvent = (eventName, data) => {
          window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
        };

        return {
          globalState,
          showPanel1,
          showPanel2,
          updateGlobalState,
          togglePanel,
          dispatchEvent
        };
      },

      template: `
        <div class="fixed top right medium-width devops-render-container">
          <!-- Panel 1: Chat UI -->
          <panel1-component 
            v-show="showPanel1"
            :global-state="globalState"
            @update-global="updateGlobalState"
            @dispatch-event="dispatchEvent">
          </panel1-component>

          <!-- Panel 2: Dev Tools -->  
          <panel2-component
            v-show="showPanel2"
            :global-state="globalState"
            @update-global="updateGlobalState"
            @dispatch-event="dispatchEvent">
          </panel2-component>
        </div>
      `
    };
  }

  // Public API methods
  addLog(text, type = 'normal') {
    if (this.panels.panel1) {
      this.panels.panel1.addLog(text, type);
    }
  }

  setStatus(text, isConnected = false) {
    if (this.appInstance) {
      this.appInstance.updateGlobalState({
        status: text,
        isConnected
      });
    }
  }

  updateSessions(sessionsData) {
    if (this.appInstance) {
      this.appInstance.updateGlobalState({
        sessions: { ...sessionsData }
      });
    }
  }

  setCurrentSession(sessionName) {
    if (this.appInstance) {
      this.appInstance.updateGlobalState({
        currentSession: sessionName
      });
    }
  }

  togglePanel(panelName) {
    if (this.appInstance) {
      this.appInstance.togglePanel(panelName);
    }
  }

  destroy() {
    if (this.appInstance && this.container) {
      this.appInstance.$el.remove();
      this.appInstance = null;
    }
  }
}

// Legacy compatibility wrapper
export const VueRenderer = {
  async createApp(container, options = {}) {
    const controller = new RenderController(options);
    await controller.initialize(container);
    return controller;
  },

  addLog(controller, text, type = 'normal') {
    controller.addLog(text, type);
  },

  setStatus(controller, text, connected = false) {
    controller.setStatus(text, connected);
  },

  updateSessions(controller, sessionsData) {
    controller.updateSessions(sessionsData);
  },

  setCurrentSession(controller, sessionName) {
    controller.setCurrentSession(sessionName);
  }
};

export default { RenderController, VueRenderer, importPanelControllers };