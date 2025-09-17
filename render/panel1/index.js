/**
 * Panel1: Chat UI Controller
 * Handles chat interface, sessions, and command input
 */

const getVue = () => {
  if (typeof Vue === 'undefined') {
    throw new Error('Vue is not loaded yet. Make sure Vue 3 is available globally.');
  }
  return Vue;
};

export class ChatPanelController {
  constructor() {
    this.logs = [];
    this.inputValue = '';
    this.vue = null;
  }

  initialize() {
    this.vue = getVue();
    return this.createComponent();
  }

  createComponent() {
    const { ref, computed, watch } = this.vue;

    return {
      name: 'Panel1Component',
      props: {
        globalState: Object
      },
      emits: ['update-global', 'dispatch-event'],
      
      setup(props, { emit }) {
        // Local state
        const logs = ref([]);
        const inputValue = ref('');

        // Computed properties
        const statusClass = computed(() => 
          props.globalState.isConnected ? 'green white-text' : 'amber black-text'
        );

        const sessionsList = computed(() => 
          Object.keys(props.globalState.sessions).map(name => ({
            name,
            ...props.globalState.sessions[name],
            active: name === props.globalState.currentSession
          }))
        );

        // Methods
        const addLog = (text, type = 'normal') => {
          logs.value.push({
            id: Date.now() + Math.random(),
            text,
            type,
            timestamp: new Date().toLocaleTimeString()
          });
          
          // Auto scroll to bottom
          setTimeout(() => {
            const logContainer = document.querySelector('.panel1-log-container');
            if (logContainer) {
              logContainer.scrollTop = logContainer.scrollHeight;
            }
          }, 10);
        };

        const handleCommand = (command) => {
          if (!command.trim()) return;
          
          addLog(`> ${command}`, 'command');
          inputValue.value = '';
          
          // Emit to parent
          emit('dispatch-event', 'devops-command', { command });
        };

        const openSession = () => {
          if (!props.globalState.currentSession) {
            addLog('Ingen aktiv session.', 'error');
            return;
          }
          
          emit('update-global', { 
            status: `${props.globalState.currentSession} — Connecting…` 
          });
          
          emit('dispatch-event', 'devops-open-session', { 
            session: props.globalState.currentSession 
          });
        };

        const clearLogs = () => {
          logs.value = [];
        };

        // Expose methods for external access
        const instance = {
          addLog,
          clearLogs,
          logs,
          inputValue,
          statusClass,
          sessionsList,
          handleCommand,
          openSession
        };

        return instance;
      },

      template: `
        <article class="surface-container border round small-margin panel1-container">
          <!-- Header -->
          <div class="padding small-space">
            <div class="row middle-align">
              <h6 class="bold no-margin">💬 DevOpsChat</h6>
              <div class="max"></div>
              <span class="chip small" :class="statusClass">
                {{ globalState.status }}
              </span>
              <button @click="openSession" class="circle transparent" title="Open Session">
                <i>open_in_new</i>
              </button>
            </div>
          </div>

          <!-- Session Info -->
          <div v-if="globalState.currentSession" class="padding small-space border-bottom">
            <div class="row middle-align">
              <span class="small-text">Active: {{ globalState.currentSession }}</span>
              <div class="max"></div>
              <span class="chip tiny secondary">{{ sessionsList.length }} sessions</span>
            </div>
          </div>

          <!-- Log Area -->
          <div class="padding small-space panel1-log-container" style="height: 260px; overflow-y: auto;">
            <div v-if="logs.length === 0" class="center-align grey-text small-text">
              <p>No messages yet. Type a command below to get started.</p>
              <p><code>/session &lt;name&gt; &lt;url&gt;</code> to create a session</p>
            </div>
            
            <div v-for="log in logs" :key="log.id" class="log-entry" :class="'log-' + log.type">
              <small class="grey-text">{{ log.timestamp }}</small>
              <span class="margin-left">{{ log.text }}</span>
            </div>
          </div>

          <!-- Input Area -->
          <div class="padding small-space border-top">
            <div class="field border">
              <input 
                v-model="inputValue" 
                @keyup.enter="handleCommand(inputValue)"
                placeholder="/session <navn> <url> | / | /<navn> | /dom [sel] | /js ..."
                class="transparent"
                type="text">
            </div>
            
            <!-- Quick Actions -->
            <div class="row small-margin-top">
              <button @click="handleCommand('/')" class="small secondary">Sessions</button>
              <button @click="clearLogs" class="small grey">Clear</button>
              <div class="max"></div>
              <button @click="handleCommand('/open')" class="small primary" 
                      :disabled="!globalState.currentSession">
                Open Active
              </button>
            </div>
          </div>
        </article>
      `
    };
  }

  // External API
  addLog(text, type = 'normal') {
    // This will be connected to the component instance
    if (this.componentInstance) {
      this.componentInstance.addLog(text, type);
    }
  }
}

// Vue component registration
export const Panel1Component = {
  async register() {
    const controller = new ChatPanelController();
    return controller.createComponent();
  }
};

export default { ChatPanelController, Panel1Component };