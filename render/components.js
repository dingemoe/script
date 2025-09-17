/**
 * Shared Vue Components and Utilities
 * Common components used across panels
 */

const getVue = () => {
  if (typeof Vue === 'undefined') {
    throw new Error('Vue is not loaded yet. Make sure Vue 3 is available globally.');
  }
  return Vue;
};

// Status Badge Component
export const StatusBadge = {
  name: 'StatusBadge',
  props: {
    status: String,
    isConnected: Boolean,
    size: {
      type: String,
      default: 'small'
    }
  },
  computed: {
    badgeClass() {
      const base = `chip ${this.size}`;
      const color = this.isConnected ? 'green white-text' : 'amber black-text';
      return `${base} ${color}`;
    }
  },
  template: `
    <span :class="badgeClass">{{ status }}</span>
  `
};

// Session Selector Component
export const SessionSelector = {
  name: 'SessionSelector',
  props: {
    sessions: Object,
    currentSession: String
  },
  emits: ['session-selected'],
  computed: {
    sessionsList() {
      return Object.keys(this.sessions).map(name => ({
        name,
        ...this.sessions[name],
        active: name === this.currentSession
      }));
    }
  },
  methods: {
    selectSession(sessionName) {
      this.$emit('session-selected', sessionName);
    }
  },
  template: `
    <div class="session-selector">
      <div v-if="sessionsList.length === 0" class="small-text grey-text">
        No sessions available
      </div>
      <div v-else>
        <div v-for="session in sessionsList" :key="session.name"
             @click="selectSession(session.name)"
             :class="['session-item', 'padding', 'small-space', 'cursor-pointer', 
                      session.active ? 'primary-container' : 'surface-variant']">
          <div class="row middle-align">
            <strong>{{ session.name }}</strong>
            <div class="max"></div>
            <span v-if="session.active" class="chip tiny primary">Active</span>
          </div>
          <small class="grey-text">{{ session.url }}</small>
        </div>
      </div>
    </div>
  `
};

// Code Editor Component
export const CodeEditor = {
  name: 'CodeEditor',
  props: {
    modelValue: String,
    placeholder: {
      type: String,
      default: 'Enter code...'
    },
    rows: {
      type: Number,
      default: 8
    },
    language: {
      type: String,
      default: 'javascript'
    }
  },
  emits: ['update:modelValue', 'execute'],
  methods: {
    updateValue(event) {
      this.$emit('update:modelValue', event.target.value);
    },
    handleKeydown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        this.$emit('execute', this.modelValue);
      }
    }
  },
  template: `
    <div class="code-editor">
      <textarea 
        :value="modelValue"
        @input="updateValue"
        @keydown="handleKeydown"
        :placeholder="placeholder"
        :rows="rows"
        class="transparent dev-textarea"
        style="font-family: 'Courier New', monospace; font-size: 12px;">
      </textarea>
    </div>
  `
};

// Log Viewer Component
export const LogViewer = {
  name: 'LogViewer',
  props: {
    logs: Array,
    height: {
      type: String,
      default: '260px'
    }
  },
  emits: ['clear-logs'],
  methods: {
    clearLogs() {
      this.$emit('clear-logs');
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.logContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  },
  watch: {
    logs() {
      this.scrollToBottom();
    }
  },
  template: `
    <div class="log-viewer">
      <div class="row middle-align small-margin-bottom">
        <span class="small-text grey-text">{{ logs.length }} messages</span>
        <div class="max"></div>
        <button @click="clearLogs" class="small grey">Clear</button>
      </div>
      
      <div ref="logContainer" class="log-container" :style="{ height }">
        <div v-if="logs.length === 0" class="center-align grey-text small-text">
          No messages yet
        </div>
        
        <div v-for="log in logs" :key="log.id" 
             :class="['log-entry', 'log-' + log.type]">
          <small class="grey-text">{{ log.timestamp }}</small>
          <span class="margin-left">{{ log.text }}</span>
        </div>
      </div>
    </div>
  `
};

// Panel Header Component
export const PanelHeader = {
  name: 'PanelHeader',
  props: {
    title: String,
    icon: String,
    collapsible: {
      type: Boolean,
      default: true
    },
    collapsed: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle-collapse'],
  methods: {
    toggleCollapse() {
      if (this.collapsible) {
        this.$emit('toggle-collapse');
      }
    }
  },
  template: `
    <div class="panel-header padding small-space border-bottom">
      <div class="row middle-align">
        <h6 class="bold no-margin">
          <span v-if="icon">{{ icon }} </span>{{ title }}
        </h6>
        <div class="max"></div>
        <slot name="actions"></slot>
        <button v-if="collapsible" @click="toggleCollapse" class="circle transparent">
          <i>{{ collapsed ? 'expand_more' : 'expand_less' }}</i>
        </button>
      </div>
    </div>
  `
};

// Register all components globally
export const registerSharedComponents = (app) => {
  app.component('StatusBadge', StatusBadge);
  app.component('SessionSelector', SessionSelector);
  app.component('CodeEditor', CodeEditor);
  app.component('LogViewer', LogViewer);
  app.component('PanelHeader', PanelHeader);
};

export default {
  StatusBadge,
  SessionSelector,
  CodeEditor,
  LogViewer,
  PanelHeader,
  registerSharedComponents
};