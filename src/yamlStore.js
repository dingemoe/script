// src/yamlStore.js
// Types-only documentation for the adapter expected by initDevPanel().
// This file is informational; the userscript provides the actual implementation.

/**
 * @typedef {Object} Session
 * @property {string} name
 * @property {string} id
 * @property {string} url
 * @property {boolean} active
 */

/**
 * @typedef {Object} Adapter
 * @property {() => Promise<Session[]>} listSessions
 * @property {() => Promise<Session|null>} getActiveSession
 * @property {(name:string) => Promise<string>} getSessionYaml
 * @property {(name:string, yaml:string) => Promise<void>} setSessionYaml
 * @property {(name:string) => Promise<void>} setActiveSession
 */
