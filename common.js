// common.js - host på GitHub eller egen server
(function() {
    'use strict';
    
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
        
        // Kanal-administrasjon
        createChannel: function(channelName, options = {}) {
            const defaults = {
                persistent: true,
                maxMessages: 100,
                ttl: 300000, // 5 minutter
                autoCleanup: true,
                description: '',
                subscribers: []
            };
            
            const config = Object.assign(defaults, options, { 
                name: channelName,
                created: Date.now(),
                lastActivity: Date.now()
            });
            
            // Lagre kanal-konfigurasjonen
            if (typeof GM_setValue !== 'undefined') {
                GM_setValue(`channel_config_${channelName}`, JSON.stringify(config));
            }
            
            MyUtils.log(`Kanal opprettet: ${channelName}`, config);
            return channelName;
        },
        
        deleteChannel: function(channelName) {
            if (typeof GM_deleteValue === 'undefined') return false;
            
            try {
                // Slett kanal-konfigurasjonen
                GM_deleteValue(`channel_config_${channelName}`);
                
                // Slett alle meldinger i kanalen
                if (typeof GM_listValues !== 'undefined') {
                    const keys = GM_listValues().filter(key => 
                        key.startsWith(`msg_${channelName}_`) || 
                        key.startsWith(`channel_${channelName}_`)
                    );
                    keys.forEach(key => GM_deleteValue(key));
                }
                
                // Lukk aktive listeners
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
                    const config = JSON.parse(GM_getValue(key, '{}'));
                    const channelName = key.replace('channel_config_', '');
                    
                    // Räkna meddelanden i kanalen
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
                const configData = GM_getValue(`channel_config_${channelName}`, '{}');
                const config = JSON.parse(configData);
                
                const subscriber = {
                    id: Math.random().toString(36).substr(2, 9),
                    hostname: window.location.hostname,
                    pathname: window.location.pathname,
                    userAgent: navigator.userAgent.substring(0, 100),
                    subscribed: Date.now(),
                    ...subscriberInfo
                };
                
                config.subscribers = config.subscribers || [];
                // Fjern gamle subscribers fra samme side
                config.subscribers = config.subscribers.filter(s => 
                    s.hostname !== subscriber.hostname || s.pathname !== subscriber.pathname
                );
                config.subscribers.push(subscriber);
                config.lastActivity = Date.now();
                
                GM_setValue(`channel_config_${channelName}`, JSON.stringify(config));
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
                const configData = GM_getValue(`channel_config_${channelName}`, '{}');
                const config = JSON.parse(configData);
                
                config.subscribers = (config.subscribers || []).filter(s => s.id !== subscriberId);
                config.lastActivity = Date.now();
                
                GM_setValue(`channel_config_${channelName}`, JSON.stringify(config));
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
                const configData = GM_getValue(`channel_config_${channelName}`, '{}');
                const config = JSON.parse(configData);
                
                // Räkna meddelanden
                const messageKeys = GM_listValues().filter(key => key.startsWith(`msg_${channelName}_`));
                
                return {
                    ...config,
                    messageCount: messageKeys.length,
                    isActive: (Date.now() - config.lastActivity) < 60000 // Aktiv inom 1 minut
                };
            } catch (error) {
                console.error('Feil ved henting av kanalinformasjon:', error);
                return null;
            }
        },
        
        // Kommunikasjonsfunksjoner
        sendMessage: function(channel, data) {
            // Opprett kanal automatisk hvis den ikke finnes
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
                // Hämta kanal-konfiguration
                const channelInfo = this.getChannelInfo(channel);
                if (channelInfo && channelInfo.maxMessages) {
                    // Begränsa antal meddelanden per kanal
                    const messageKeys = GM_listValues().filter(key => key.startsWith(`msg_${channel}_`));
                    if (messageKeys.length >= channelInfo.maxMessages) {
                        // Ta bort äldsta meddelanden
                        const messages = messageKeys.map(key => {
                            const msg = JSON.parse(GM_getValue(key, '{}'));
                            return { key, timestamp: msg.timestamp };
                        }).sort((a, b) => a.timestamp - b.timestamp);
                        
                        // Ta bort äldsta meddelanden
                        const toDelete = messages.slice(0, Math.max(1, messageKeys.length - channelInfo.maxMessages + 1));
                        toDelete.forEach(item => GM_deleteValue(item.key));
                    }
                }
                
                // Primær: GM_setValue for cross-tab kommunikasjon
                if (typeof GM_setValue !== 'undefined') {
                    GM_setValue(`msg_${channel}_${message.id}`, JSON.stringify(message));
                    
                    // Oppdater kanal-aktivitet
                    const configData = GM_getValue(`channel_config_${channel}`, '{}');
                    const config = JSON.parse(configData);
                    config.lastActivity = Date.now();
                    GM_setValue(`channel_config_${channel}`, JSON.stringify(config));
                    
                    // Rydd opp gamle meldinger
                    this.cleanupOldMessages(channel);
                }
                
                // Sekundær: BroadcastChannel for live tabs
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
                
                // BroadcastChannel listener
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
                
                // GM storage polling
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
            
            // Returner cleanup funksjon
            return () => {
                const index = listeners[channel].indexOf(callback);
                if (index > -1) {
                    listeners[channel].splice(index, 1);
                }
                
                // Rydd opp hvis ingen lyttere igjen
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
                            // Ugyldig JSON, slett
                            GM_deleteValue(key);
                        }
                    }
                });
            } catch (error) {
                console.error('Feil ved opprydding av gamle meldinger:', error);
            }
        },
        
        // Hjelpefunksjoner
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
        
        // Logging med timestamp
        log: function(...args) {
            console.log(`[${new Date().toISOString()}] [MyUtils]`, ...args);
        }
    };
    
    // Predefiner noen vanlige kanaler med konfigurasjoner
    window.channels = {
        GLOBAL: 'global',
        NAVIGATION: 'navigation', 
        DATA_SYNC: 'data_sync',
        USER_ACTION: 'user_action',
        
        // Hjelpefunksjoner for kanaler
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
    
    // Automatisk opprettelse av standard-kanaler ved oppstart
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
    
    // Automatisk opprydding ved page unload
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