// common.js - host på GitHub eller egen server
(function() {
    'use strict';

    console.log("hei2");
    
    window.MyUtils = {
        // Eksisterende funksjoner
        waitForElement: function(selector, timeout = 10000) {
            return new Promise((resolve, reject) => {
                const el = document.querySelector(selector);
                if (el) return resolve(el);
                
                const observer = new MutationObserver(() => {
                    const el = document.querySelector(selector);
                    if (el) {
                        observer.disconnect();
                        resolve(el);
                    }
                });
                
                observer.observe(document.body, { childList: true, subtree: true });
                setTimeout(() => {
                    observer.disconnect();
                    reject(new Error('Timeout'));
                }, timeout);
            });
        },
        
        addCSS: function(css) {
            const style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);
        },
        
        // --- Hjelpefunksjoner for lagring ---
        set: function(key, value) {
            if (typeof GM_setValue !== 'undefined') {
                try {
                    GM_setValue(key, JSON.stringify(value));
                } catch (e) {
                    console.error('MyUtils: Feil ved lagring av verdi', e);
                }
            }
        },

        get: function(key, defaultValue) {
            if (typeof GM_getValue === 'undefined') {
                return defaultValue;
            }
            try {
                const value = GM_getValue(key, null);
                return value !== null ? JSON.parse(value) : defaultValue;
            } catch (e) {
                console.error('MyUtils: Feil ved henting av lagret verdi', e);
                return defaultValue;
            }
        },
        
        getAndIncrement: function(key) {
            const currentValue = this.get(key, 0);
            this.set(key, currentValue + 1);
            return currentValue;
        },
        
        // Kanal-administrasjon
        createChannel: function(channelName, options = {}) {
            const defaults = {
                persistent: true,
                maxMessages: 100,
                ttl: 300000,
                autoCleanup: true,
                description: '',
                subscribers: []
            };
            
            const config = Object.assign(defaults, options, { 
                name: channelName,
                created: Date.now(),
                lastActivity: Date.now()
            });
            
            if (typeof GM_setValue !== 'undefined') {
                this.set(`channel_config_${channelName}`, config);
            }
            
            MyUtils.log(`Kanal opprettet: ${channelName}`, config);
            return channelName;
        },
        
        deleteChannel: function(channelName) {
            if (typeof GM_deleteValue === 'undefined') return false;
            
            try {
                GM_deleteValue(`channel_config_${channelName}`);
                
                if (typeof GM_listValues !== 'undefined') {
                    const keys = GM_listValues().filter(key => 
                        key.startsWith(`msg_${channelName}_`) || 
                        key.startsWith(`channel_${channelName}_`)
                    );
                    keys.forEach(key => GM_deleteValue(key));
                }
                
                if (window.MyUtils._listeners && window.MyUtils._listeners[channelName]) {
                    const listener = window.MyUtils._listeners[channelName];
                    if (listener._bc) listener._bc.close();
                    if (listener._pollInterval) clearInterval(listener._pollInterval);
                    delete window.MyUtils._listeners[channelName];
                }
                
                MyUtils.log(`Kanal slettet: ${channelName}`);
                return true;
            } catch (error) {
                console.error('Feil ved sletting av kanal:', error);
                return false;
            }
        },
        
        listChannels: function() {
            if (typeof GM_listValues === 'undefined') return [];
            
            try {
                const channelKeys = GM_listValues().filter(key => key.startsWith('channel_config_'));
                return channelKeys.map(key => {
                    const config = this.get(key, {});
                    const channelName = key.replace('channel_config_', '');
                    
                    const messageKeys = GM_listValues().filter(k => k.startsWith(`msg_${channelName}_`));
                    
                    return {
                        name: channelName,
                        messageCount: messageKeys.length,
                        ...config
                    };
                });
            } catch (error) {
                console.error('Feil ved listing av kanaler:', error);
                return [];
            }
        },
        
        channelExists: function(channelName) {
            if (typeof GM_getValue === 'undefined') return false;
            return GM_getValue(`channel_config_${channelName}`, null) !== null;
        },
        
        subscribeToChannel: function(channelName, subscriberInfo = {}) {
            if (!this.channelExists(channelName)) {
                this.createChannel(channelName);
            }
            
            try {
                const config = this.get(`channel_config_${channelName}`, {});
                
                const subscriber = {
                    id: Math.random().toString(36).substr(2, 9),
                    hostname: window.location.hostname,
                    pathname: window.location.pathname,
                    userAgent: navigator.userAgent.substring(0, 100),
                    subscribed: Date.now(),
                    ...subscriberInfo
                };
                
                config.subscribers = config.subscribers || [];
                config.subscribers = config.subscribers.filter(s => 
                    s.hostname !== subscriber.hostname || s.pathname !== subscriber.pathname
                );
                config.subscribers.push(subscriber);
                config.lastActivity = Date.now();
                
                this.set(`channel_config_${channelName}`, config);
                MyUtils.log(`Abonnert på kanal: ${channelName}`, subscriber);
                
                return subscriber.id;
            } catch (error) {
                console.error('Feil ved abonnering på kanal:', error);
                return null;
            }
        },
        
        unsubscribeFromChannel: function(channelName, subscriberId) {
            if (!this.channelExists(channelName)) return false;
            
            try {
                const config = this.get(`channel_config_${channelName}`, {});
                
                config.subscribers = (config.subscribers || []).filter(s => s.id !== subscriberId);
                config.lastActivity = Date.now();
                
                this.set(`channel_config_${channelName}`, config);
                MyUtils.log(`Avmeldt fra kanal: ${channelName}`);
                
                return true;
            } catch (error) {
                console.error('Feil ved avmelding fra kanal:', error);
                return false;
            }
        },
        
        getChannelInfo: function(channelName) {
            if (!this.channelExists(channelName)) return null;
            
            try {
                const config = this.get(`channel_config_${channelName}`, {});
                
                const messageKeys = GM_listValues().filter(key => key.startsWith(`msg_${channelName}_`));
                
                return {
                    ...config,
                    messageCount: messageKeys.length,
                    isActive: (Date.now() - config.lastActivity) < 60000
                };
            } catch (error) {
                console.error('Feil ved henting av kanalinformasjon:', error);
                return null;
            }
        },
        
        // Kommunikasjonsfunksjoner
        sendMessage: function(channel, data) {
            if (!this.channelExists(channel)) {
                this.createChannel(channel);
            }
            
            const message = {
                data: data,
                timestamp: Date.now(),
                id: Math.random().toString(36).substr(2, 9),
                from: window.location.hostname,
                channel: channel
            };
            
            try {
                const channelInfo = this.getChannelInfo(channel);
                if (channelInfo && channelInfo.maxMessages) {
                    const messageKeys = GM_listValues().filter(key => key.startsWith(`msg_${channel}_`));
                    if (messageKeys.length >= channelInfo.maxMessages) {
                        const messages = messageKeys.map(key => {
                            const msg = JSON.parse(GM_getValue(key, '{}'));
                            return { key, timestamp: msg.timestamp };
                        }).sort((a, b) => a.timestamp - b.timestamp);
                        
                        const toDelete = messages.slice(0, Math.max(1, messageKeys.length - channelInfo.maxMessages + 1));
                        toDelete.forEach(item => GM_deleteValue(item.key));
                    }
                }
                
                if (typeof GM_setValue !== 'undefined') {
                    this.set(`msg_${channel}_${message.id}`, message);
                    
                    const config = this.get(`channel_config_${channel}`, {});
                    config.lastActivity = Date.now();
                    this.set(`channel_config_${channel}`, config);
                    
                    this.cleanupOldMessages(channel);
                }
                
                if (typeof BroadcastChannel !== 'undefined') {
                    const bc = new BroadcastChannel(channel);
                    bc.postMessage(message);
                    bc.close();
                }
                
                return message.id;
            } catch (error) {
                console.error('Feil ved sending av melding:', error);
                return null;
            }
        },
        
        onMessage: function(channel, callback) {
            const listeners = window.MyUtils._listeners || (window.MyUtils._listeners = {});
            
            if (!listeners[channel]) {
                listeners[channel] = [];
                
                if (typeof BroadcastChannel !== 'undefined') {
                    const bc = new BroadcastChannel(channel);
                    bc.onmessage = (event) => {
                        listeners[channel].forEach(cb => {
                            try {
                                cb(event.data);
                            } catch (e) {
                                console.error('Feil i message callback:', e);
                            }
                        });
                    };
                    listeners[channel]._bc = bc;
                }
                
                if (typeof GM_listValues !== 'undefined') {
                    const pollInterval = setInterval(() => {
                        try {
                            const keys = GM_listValues().filter(key => key.startsWith(`msg_${channel}_`));
                            keys.forEach(key => {
                                const messageData = GM_getValue(key, null);
                                if (messageData) {
                                    const message = JSON.parse(messageData);
                                    GM_deleteValue(key);
                                    
                                    listeners[channel].forEach(cb => {
                                        try {
                                            cb(message);
                                        } catch (e) {
                                            console.error('Feil i message callback:', e);
                                        }
                                    });
                                }
                            });
                        } catch (e) {
                            console.error('Feil ved polling av meldinger:', e);
                        }
                    }, 1000);
                    
                    listeners[channel]._pollInterval = pollInterval;
                }
            }
            
            listeners[channel].push(callback);
            
            return () => {
                const index = listeners[channel].indexOf(callback);
                if (index > -1) {
                    listeners[channel].splice(index, 1);
                }
                
                if (listeners[channel].length === 0) {
                    if (listeners[channel]._bc) {
                        listeners[channel]._bc.close();
                    }
                    if (listeners[channel]._pollInterval) {
                        clearInterval(listeners[channel]._pollInterval);
                    }
                    delete listeners[channel];
                }
            };
        },
        
        cleanupOldMessages: function(channel) {
            if (typeof GM_listValues === 'undefined') return;
            
            try {
                const now = Date.now();
                const fiveMinutesAgo = now - (5 * 60 * 1000);
                const keys = GM_listValues().filter(key => key.startsWith(`msg_${channel}_`));
                
                keys.forEach(key => {
                    const messageData = GM_getValue(key, null);
                    if (messageData) {
                        try {
                            const message = JSON.parse(messageData);
                            if (message.timestamp < fiveMinutesAgo) {
                                GM_deleteValue(key);
                            }
                        } catch (e) {
                            GM_deleteValue(key);
                        }
                    }
                });
            } catch (error) {
                console.error('Feil ved opprydding av gamle meldinger:', error);
            }
        },
        
        createElement: function(tag, attributes = {}, textContent = '') {
            const element = document.createElement(tag);
            
            Object.keys(attributes).forEach(key => {
                if (key === 'style' && typeof attributes[key] === 'object') {
                    Object.assign(element.style, attributes[key]);
                } else {
                    element.setAttribute(key, attributes[key]);
                }
            });
            
            if (textContent) {
                element.textContent = textContent;
            }
            
            return element;
        },
        
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        log: function(...args) {
            console.log(`[${new Date().toISOString()}] [MyUtils]`, ...args);
        }
    };
    
    window.channels = {
        GLOBAL: 'global',
        NAVIGATION: 'navigation', 
        DATA_SYNC: 'data_sync',
        USER_ACTION: 'user_action',
        
        create: function(name, options) {
            return window.MyUtils.createChannel(name, options);
        },
        
        list: function() {
            return window.MyUtils.listChannels();
        },
        
        info: function(name) {
            return window.MyUtils.getChannelInfo(name);
        }
    };
    
    if (typeof GM_setValue !== 'undefined') {
        setTimeout(() => {
            const standardChannels = {
                [window.channels.GLOBAL]: { 
                    description: 'Global kommunikasjon mellom alle scripts',
                    maxMessages: 50,
                    ttl: 300000
                },
                [window.channels.NAVIGATION]: { 
                    description: 'Navigasjons-relaterte meldinger',
                    maxMessages: 20,
                    ttl: 60000
                },
                [window.channels.DATA_SYNC]: { 
                    description: 'Data-synkronisering mellom scripts',
                    maxMessages: 100,
                    ttl: 600000
                },
                [window.channels.USER_ACTION]: { 
                    description: 'Bruker-aksjoner og events',
                    maxMessages: 30,
                    ttl: 120000
                }
            };
            
            Object.keys(standardChannels).forEach(channelName => {
                if (!window.MyUtils.channelExists(channelName)) {
                    window.MyUtils.createChannel(channelName, standardChannels[channelName]);
                }
            });
        }, 100);
    }
    
    window.addEventListener('beforeunload', () => {
        if (window.MyUtils._listeners) {
            Object.keys(window.MyUtils._listeners).forEach(channel => {
                const listener = window.MyUtils._listeners[channel];
                if (listener._bc) listener._bc.close();
                if (listener._pollInterval) clearInterval(listener._pollInterval);
            });
        }
    });
    
})();