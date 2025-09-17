/**
 * Panel2: Dev Tools Controller  
 * Handles development tools, code execution, and debugging features
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

export class DevPanelController {
  constructor() {
    this.devContent = '';
    this.isExpanded = true;
    this.vue = null;
  }

  initialize() {
    this.vue = getVue();
    return this.createComponent();
  }

  createComponent() {
    const { ref, computed } = this.vue;

    return {
      name: 'Panel2Component',
      props: {
        globalState: Object
      },
      emits: ['update-global', 'dispatch-event'],
      
      setup(props, { emit }) {
        // Local state
        const devContent = ref('');
        const isExpanded = ref(true);
        const activeTab = ref('console');
        const executionHistory = ref([]);

        // Computed properties
        const hasActiveSession = computed(() => 
          props.globalState.currentSession !== null
        );

        const canExecute = computed(() => 
          hasActiveSession.value && devContent.value.trim().length > 0
        );

        // Methods
        const toggleExpanded = () => {
          isExpanded.value = !isExpanded.value;
        };

        const executeCode = async () => {
          if (!canExecute.value) return;
          
          const code = devContent.value.trim();
          const timestamp = new Date().toLocaleTimeString();
          
          // Add to history
          executionHistory.value.push({
            id: Date.now(),
            code,
            timestamp,
            session: props.globalState.currentSession,
            status: 'executing'
          });

          // Execute via RPC
          if (code.startsWith('/')) {
            // Command execution
            emit('dispatch-event', 'devops-command', { command: code });
          } else {
            // JavaScript execution
            emit('dispatch-event', 'devops-execute-js', { 
              code, 
              session: props.globalState.currentSession 
            });
          }
          
          // Clear input
          devContent.value = '';
        };

        const clearHistory = () => {
          executionHistory.value = [];
        };

        const insertTemplate = (template) => {
          const templates = {
            dom: "// Get DOM element\nconst el = document.querySelector('#element-id');\nconsole.log(el);",
            jquery: "// jQuery example\n$('#element-id').css('color', 'red');",
            fetch: "// Fetch API example\nfetch('/api/endpoint')\n  .then(r => r.json())\n  .then(data => console.log(data));",
            console: "// Console logging\nconsole.log('Debug message:', variable);"
          };
          
          devContent.value = templates[template] || '';
        };

        const switchTab = (tab) => {
          activeTab.value = tab;
        };

        return {
          devContent,
          isExpanded,
          activeTab,
          executionHistory,
          hasActiveSession,
          canExecute,
          toggleExpanded,
          executeCode,
          clearHistory,
          insertTemplate,
          switchTab
        };
      },

      template: `
        <article class="surface-container border round small-margin panel2-container">
          <!-- Header -->
          <div class="padding small-space border-bottom">
            <div class="row middle-align">
              <h6 class="bold no-margin">⚙️ Dev Tools</h6>
              <div class="max"></div>
              <span v-if="!hasActiveSession" class="chip tiny red white-text">No Session</span>
              <span v-else class="chip tiny green white-text">{{ globalState.currentSession }}</span>
              <button @click="toggleExpanded" class="circle transparent">
                <i>{{ isExpanded ? 'expand_less' : 'expand_more' }}</i>
              </button>
            </div>
          </div>

          <!-- Content (Collapsible) -->
          <div v-show="isExpanded">
            <!-- Tabs -->
            <div class="padding small-space border-bottom">
              <div class="row">
                <button 
                  @click="switchTab('console')"
                  :class="['small', activeTab === 'console' ? 'primary' : 'secondary']">
                  Console
                </button>
                <button 
                  @click="switchTab('templates')"
                  :class="['small', activeTab === 'templates' ? 'primary' : 'secondary']">
                  Templates
                </button>
                <button 
                  @click="switchTab('history')"
                  :class="['small', activeTab === 'history' ? 'primary' : 'secondary']">
                  History
                </button>
              </div>
            </div>

            <!-- Console Tab -->
            <div v-show="activeTab === 'console'" class="padding small-space">
              <p class="small-text grey-text">Execute JavaScript or DevOpsChat commands</p>
              
              <div class="field border">
                <textarea 
                  v-model="devContent" 
                  placeholder="Enter JavaScript code or /commands..."
                  rows="8"
                  class="transparent dev-textarea"
                  @keydown.ctrl.enter="executeCode"
                  @keydown.meta.enter="executeCode"></textarea>
              </div>
              
              <div class="row small-margin-top">
                <button @click="devContent = ''" class="small grey">Clear</button>
                <div class="max"></div>
                <span v-if="!hasActiveSession" class="small-text red-text">Connect to session first</span>
                <button 
                  @click="executeCode" 
                  :disabled="!canExecute"
                  class="small primary">
                  Execute (Ctrl+Enter)
                </button>
              </div>
            </div>

            <!-- Templates Tab -->
            <div v-show="activeTab === 'templates'" class="padding small-space">
              <p class="small-text grey-text">Quick code templates</p>
              
              <div class="grid">
                <button @click="insertTemplate('dom')" class="small-margin small secondary">
                  DOM Query
                </button>
                <button @click="insertTemplate('jquery')" class="small-margin small secondary">
                  jQuery
                </button>
                <button @click="insertTemplate('fetch')" class="small-margin small secondary">
                  Fetch API
                </button>
                <button @click="insertTemplate('console')" class="small-margin small secondary">
                  Console Log
                </button>
              </div>
            </div>

            <!-- History Tab -->
            <div v-show="activeTab === 'history'" class="padding small-space">
              <div class="row middle-align small-margin-bottom">
                <p class="small-text grey-text no-margin">Execution history</p>
                <div class="max"></div>
                <button @click="clearHistory" class="small grey">Clear</button>
              </div>
              
              <div class="dev-history" style="max-height: 200px; overflow-y: auto;">
                <div v-if="executionHistory.length === 0" class="center-align grey-text small-text">
                  No execution history yet
                </div>
                
                <div v-for="item in executionHistory" :key="item.id" 
                     class="small-margin-bottom padding small-space surface border round">
                  <div class="row middle-align">
                    <small class="grey-text">{{ item.timestamp }}</small>
                    <div class="max"></div>
                    <span class="chip tiny">{{ item.session }}</span>
                  </div>
                  <pre class="small-text small-margin-top"><code>{{ item.code }}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </article>
      `
    };
  }

  // External API
  addToHistory(code, result, error = null) {
    // This will be connected to the component instance
    if (this.componentInstance) {
      this.componentInstance.addToHistory(code, result, error);
    }
  }

  setContent(content) {
    if (this.componentInstance) {
      this.componentInstance.devContent = content;
    }
  }
}

// Vue component registration
export const Panel2Component = {
  async register() {
    const controller = new DevPanelController();
    return controller.createComponent();
  }
};

export default { DevPanelController, Panel2Component };