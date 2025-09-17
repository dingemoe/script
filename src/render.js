/**
 * DevOpsChat Render Module
 * Handles all UI rendering and HTML template generation
 */

export const Templates = {
  /**
   * Creates the main chat box HTML
   */
  chatBox() {
    return `
      <div class="dc-header">
        <strong>DevOpsChat</strong>
        <span id="dc-status" class="dc-status">No session</span>
        <button id="dc-open" title="Åpne/bytt til aktiv session">Open</button>
      </div>
      <div id="dc-log" class="dc-log"></div>
      <div class="dc-input-section">
        <input id="dc-input" class="dc-input" placeholder="/session <navn> <url> | / | /<navn> | /<navn> -d | /<navn> -n nytt | /<navn> -u url | /dom [sel] | /js ...">
      </div>`;
  },

  /**
   * Creates the dev section HTML
   */
  devSection() {
    return `
      <div class="dc-dev-header">
        <strong>Dev Tools</strong>
        <button class="dc-dev-toggle" title="Toggle dev tools">⚙️</button>
      </div>
      <div class="dc-dev-content">
        <div>Dev Section - Ready for content</div>
        <textarea class="dc-dev-textarea" placeholder="Enter development commands or code..."></textarea>
      </div>`;
  },

  /**
   * Creates a log entry element
   */
  logEntry(text, type = 'normal') {
    return `<div class="dc-log-entry dc-log-${type}">${text}</div>`;
  }
};

export const Renderer = {
  /**
   * Creates the complete UI structure
   */
  createUI() {
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'dc-wrapper';
    
    // Create chat box
    const chatBox = document.createElement('div');
    chatBox.className = 'dc-chat-box';
    chatBox.innerHTML = Templates.chatBox();
    
    // Create dev section
    const devSection = document.createElement('div');
    devSection.className = 'dc-dev';
    devSection.innerHTML = Templates.devSection();
    
    // Assemble structure
    wrapper.appendChild(chatBox);
    wrapper.appendChild(devSection);
    
    return {
      wrapper,
      chatBox,
      devSection,
      elements: {
        logEl: chatBox.querySelector('#dc-log'),
        input: chatBox.querySelector('#dc-input'),
        status: chatBox.querySelector('#dc-status'),
        openBtn: chatBox.querySelector('#dc-open'),
        devContent: devSection.querySelector('.dc-dev-content'),
        devTextarea: devSection.querySelector('.dc-dev-textarea'),
        devToggle: devSection.querySelector('.dc-dev-toggle')
      }
    };
  },

  /**
   * Updates status with proper styling
   */
  setStatus(statusEl, text, isConnected = false) {
    statusEl.textContent = text;
    statusEl.className = isConnected ? 'dc-status connected' : 'dc-status';
  },

  /**
   * Adds a log entry to the log element
   */
  addLogEntry(logEl, text, type = 'normal') {
    const entry = document.createElement('div');
    entry.className = `dc-log-entry dc-log-${type}`;
    entry.textContent = text;
    logEl.appendChild(entry);
    logEl.scrollTop = logEl.scrollHeight;
  },

  /**
   * Toggles dev section visibility
   */
  toggleDevSection(devSection) {
    const isHidden = devSection.style.display === 'none';
    devSection.style.display = isHidden ? 'block' : 'none';
    return !isHidden;
  }
};

export default { Templates, Renderer };