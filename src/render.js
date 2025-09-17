/**
 * DevOpsChat Vue 3 + Beer CSS Render Module
 * Modern reactive UI components
 */

// Vue will be available globally after userscript loads it
const getVue = () => {
  if (typeof Vue === 'undefined') {
    throw new Error('Vue is not loaded yet. Make sure Vue 3 is available globally.');
  }
  return Vue;
};

// Main DevOpsChat Vue App Factory
export const createDevOpsChatApp = () => {
  const { createApp, ref, computed, onMounted } = getVue();

  return {
    setup() {
      // Reactive state
      const sessions = ref({});
      const currentSession = ref(null);
      const status = ref('No session');
      const isConnected = ref(false);
      const logs = ref([]);
      const inputValue = ref('');
      const devContent = ref('');
      const showDevSection = ref(true);

      // Computed properties
      const statusClass = computed(() => 
        isConnected.value ? 'green white-text' : 'amber black-text'
      );

      const sessionsList = computed(() => 
        Object.keys(sessions.value).map(name => ({
          name,
          ...sessions.value[name],
          active: name === currentSession.value
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
          const logContainer = document.querySelector('.log-container');
          if (logContainer) {
            logContainer.scrollTop = logContainer.scrollHeight;
          }
        }, 10);
      };

      const setStatus = (text, connected = false) => {
        status.value = text;
        isConnected.value = connected;
      };

      const updateSessions = (sessionsData) => {
        sessions.value = { ...sessionsData };
      };

      const setCurrentSession = (sessionName) => {
        currentSession.value = sessionName;
      };

      const handleCommand = (command) => {
        if (!command.trim()) return;
        addLog(`> ${command}`, 'command');
        inputValue.value = '';
        // Emit event for parent to handle
        window.dispatchEvent(new CustomEvent('devops-command', { 
          detail: { command } 
        }));
      };

      const toggleDevSection = () => {
        showDevSection.value = !showDevSection.value;
      };

      const openSession = () => {
        if (!currentSession.value) {
          addLog('Ingen aktiv session.', 'error');
          return;
        }
        setStatus(`${currentSession.value} — Connecting…`);
        window.dispatchEvent(new CustomEvent('devops-open-session', {
          detail: { session: currentSession.value }
        }));
      };

      // Expose methods for external access
      return {
        sessions,
        currentSession,
        status,
        isConnected,
        logs,
        inputValue,
        devContent,
        showDevSection,
        statusClass,
        sessionsList,
        addLog,
        setStatus,
        updateSessions,
        setCurrentSession,
        handleCommand,
        toggleDevSection,
        openSession
      };
    },

    template: `
      <div class="fixed top right medium-width">
        <!-- Chat Box -->
        <article class="surface-container border round small-margin">
          <!-- Header -->
          <div class="padding small-space">
            <div class="row middle-align">
              <h6 class="bold no-margin">DevOpsChat</h6>
              <div class="max"></div>
              <span class="chip small" :class="statusClass">{{ status }}</span>
              <button @click="openSession" class="circle transparent">
                <i>open_in_new</i>
              </button>
            </div>
          </div>

          <!-- Log Area -->
          <div class="padding small-space log-container" style="height: 260px; overflow-y: auto;">
            <div v-for="log in logs" :key="log.id" class="log-entry" :class="'log-' + log.type">
              <small class="grey-text">{{ log.timestamp }}</small>
              <span class="margin-left">{{ log.text }}</span>
            </div>
          </div>

          <!-- Input -->
          <div class="padding small-space border-top">
            <div class="field border">
              <input 
                v-model="inputValue" 
                @keyup.enter="handleCommand(inputValue)"
                placeholder="/session <navn> <url> | / | /<navn> | /dom [sel] | /js ..."
                class="transparent">
            </div>
          </div>
        </article>

        <!-- Dev Section -->
        <article v-show="showDevSection" class="surface-container border round small-margin">
          <!-- Dev Header -->
          <div class="padding small-space border-bottom">
            <div class="row middle-align">
              <h6 class="bold no-margin">Dev Tools</h6>
              <div class="max"></div>
              <button @click="toggleDevSection" class="circle transparent">
                <i>{{ showDevSection ? 'expand_less' : 'expand_more' }}</i>
              </button>
            </div>
          </div>

          <!-- Dev Content -->
          <div class="padding small-space">
            <p class="small-text grey-text">Development commands and tools</p>
            <div class="field border">
              <textarea 
                v-model="devContent" 
                placeholder="Enter development commands or code..."
                rows="8"
                class="transparent"></textarea>
            </div>
            <div class="row">
              <button @click="devContent = ''" class="small grey">Clear</button>
              <div class="max"></div>
              <button class="small primary">Execute</button>
            </div>
          </div>
        </article>
      </div>
    `
  };
};

// Utility functions for external use
export const VueRenderer = {
  createApp(container) {
    const { createApp } = getVue();
    const app = createApp(createDevOpsChatApp());
    const vueInstance = app.mount(container);
    
    // Return the mounted Vue instance for external access
    return vueInstance;
  },

  // Helper methods for interacting with Vue app
  addLog(app, text, type = 'normal') {
    app.addLog(text, type);
  },

  setStatus(app, text, connected = false) {
    app.setStatus(text, connected);
  },

  updateSessions(app, sessionsData) {
    app.updateSessions(sessionsData);
  },

  setCurrentSession(app, sessionName) {
    app.setCurrentSession(sessionName);
  }
};

export default { createDevOpsChatApp, VueRenderer };