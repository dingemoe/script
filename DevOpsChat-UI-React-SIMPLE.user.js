// ==UserScript==
// @name         DevOpsChat UI (React) — Simple Working Version
// @namespace    https://github.com/dingemoe/script
// @match        *://*/*
// @version      1.0.1
// @description  Enkel React UI uten tracing - bare for å vise at det fungerer
// @author       dingemoe
// @downloadURL  https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-UI-React-SIMPLE.user.js
// @updateURL    https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-UI-React-SIMPLE.user.js
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM_getResourceText
// @require      https://unpkg.com/react@18/umd/react.production.min.js
// @require      https://unpkg.com/react-dom@18/umd/react-dom.production.min.js
// @resource     daisyui-css https://cdn.jsdelivr.net/npm/daisyui@4.12.10/dist/full.min.css
// @resource     tailwindcss https://cdn.jsdelivr.net/npm/tailwindcss@3.4.10/dist/tailwind.min.css
// @noframes
// ==/UserScript==

(function() {
    'use strict';
    
    // Prevent multiple instances
    if (window.top !== window.self) return;
    if (window.__DEVOPSCHAT_SIMPLE__) return;
    window.__DEVOPSCHAT_SIMPLE__ = true;
    
    console.log('🚀 DevOpsChat Simple React UI starting...');
    
    // Wait for React to be available
    const waitForReact = () => {
        return new Promise((resolve) => {
            if (window.React && window.ReactDOM) {
                resolve();
                return;
            }
            
            let attempts = 0;
            const checkInterval = setInterval(() => {
                attempts++;
                if (window.React && window.ReactDOM) {
                    clearInterval(checkInterval);
                    resolve();
                } else if (attempts > 60) { // 30 seconds timeout
                    clearInterval(checkInterval);
                    console.error('❌ React loading timeout');
                    resolve(); // Continue anyway
                }
            }, 500);
        });
    };
    
    // Main initialization
    waitForReact().then(() => {
        console.log('✅ React available, creating UI...');
        createUI();
    });
    
    function createUI() {
        // Create shadow DOM container
        const shadowHost = document.createElement('div');
        shadowHost.style.cssText = `
            position: fixed !important;
            top: 50px !important;
            right: 50px !important;
            width: 800px !important;
            height: 600px !important;
            z-index: 999999 !important;
            border: 2px solid #333 !important;
            border-radius: 12px !important;
            background: white !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important;
            overflow: hidden !important;
        `;
        
        document.body.appendChild(shadowHost);
        const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
        
        // Load CSS
        try {
            const tailwindCSS = GM_getResourceText('tailwindcss');
            const daisyCSS = GM_getResourceText('daisyui-css');
            
            const styleEl = document.createElement('style');
            styleEl.textContent = tailwindCSS + '\n' + daisyCSS;
            shadowRoot.appendChild(styleEl);
            
            console.log('✅ CSS loaded');
        } catch (error) {
            console.warn('⚠️ CSS loading failed:', error);
        }
        
        // Create app container
        const appContainer = document.createElement('div');
        appContainer.style.cssText = 'width: 100%; height: 100%; overflow: auto;';
        shadowRoot.appendChild(appContainer);
        
        // React App Component
        const { useState, useEffect } = React;
        
        const DevOpsChatApp = () => {
            const [counter, setCounter] = useState(0);
            const [message, setMessage] = useState('Velkommen til DevOpsChat!');
            
            const handleClick = () => {
                setCounter(c => c + 1);
                setMessage(`Button clicked ${counter + 1} times! 🎉`);
            };
            
            const testData = [
                { name: 'React Version', value: React.version },
                { name: 'Current Time', value: new Date().toLocaleTimeString() },
                { name: 'Counter', value: counter },
                { name: 'Status', value: 'Working!' }
            ];
            
            return React.createElement('div', { 
                className: 'p-6 min-h-full bg-gradient-to-br from-blue-50 to-indigo-100' 
            },
                // Header
                React.createElement('div', { className: 'text-center mb-8' },
                    React.createElement('h1', { 
                        className: 'text-4xl font-bold text-blue-600 mb-2' 
                    }, '🚀 DevOpsChat React UI'),
                    React.createElement('p', { 
                        className: 'text-lg text-gray-600' 
                    }, 'Enkel fungerende versjon - ingen tracing, bare UI!')
                ),
                
                // Status Message
                React.createElement('div', { 
                    className: 'alert alert-success mb-6 shadow-lg' 
                },
                    React.createElement('div', null,
                        React.createElement('svg', {
                            className: 'stroke-current flex-shrink-0 h-6 w-6',
                            fill: 'none',
                            viewBox: '0 0 24 24'
                        },
                            React.createElement('path', {
                                strokeLinecap: 'round',
                                strokeLinejoin: 'round',
                                strokeWidth: '2',
                                d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                            })
                        ),
                        React.createElement('span', null, message)
                    )
                ),
                
                // Stats Grid
                React.createElement('div', { 
                    className: 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-6' 
                },
                    ...testData.map((item, index) =>
                        React.createElement('div', {
                            key: index,
                            className: 'stat bg-white shadow-lg rounded-lg p-4'
                        },
                            React.createElement('div', { 
                                className: 'stat-title text-gray-500' 
                            }, item.name),
                            React.createElement('div', { 
                                className: 'stat-value text-2xl text-blue-600' 
                            }, item.value),
                            React.createElement('div', { 
                                className: 'stat-desc text-green-600' 
                            }, '✅ Active')
                        )
                    )
                ),
                
                // Action Buttons
                React.createElement('div', { 
                    className: 'flex flex-wrap gap-4 justify-center mb-6' 
                },
                    React.createElement('button', {
                        className: 'btn btn-primary btn-lg',
                        onClick: handleClick
                    }, `🎯 Click Me! (${counter})`),
                    
                    React.createElement('button', {
                        className: 'btn btn-secondary',
                        onClick: () => setMessage('Secondary button clicked! 🎨')
                    }, '🎨 Change Message'),
                    
                    React.createElement('button', {
                        className: 'btn btn-accent',
                        onClick: () => {
                            const time = new Date().toLocaleTimeString();
                            setMessage(`Current time: ${time} ⏰`);
                        }
                    }, '⏰ Show Time'),
                    
                    React.createElement('button', {
                        className: 'btn btn-success',
                        onClick: () => {
                            setCounter(0);
                            setMessage('Counter reset! 🔄');
                        }
                    }, '🔄 Reset')
                ),
                
                // Feature Demo
                React.createElement('div', { 
                    className: 'card bg-white shadow-xl' 
                },
                    React.createElement('div', { className: 'card-body' },
                        React.createElement('h2', { 
                            className: 'card-title text-green-600' 
                        }, '✅ What\'s Working'),
                        React.createElement('div', { className: 'space-y-2' },
                            React.createElement('p', null, '🎨 DaisyUI + TailwindCSS styling'),
                            React.createElement('p', null, '⚛️ React 18 components and hooks'),
                            React.createElement('p', null, '🌙 Shadow DOM isolation'),
                            React.createElement('p', null, '📱 Responsive design'),
                            React.createElement('p', null, '🎯 Interactive buttons and state'),
                            React.createElement('p', null, '🚀 Fast loading without tracing overhead')
                        )
                    )
                ),
                
                // Footer
                React.createElement('div', { 
                    className: 'text-center mt-8 text-sm text-gray-500' 
                },
                    React.createElement('p', null, 
                        '🎉 DevOpsChat Simple UI v1.0.0 - ',
                        React.createElement('strong', null, 'It works!')
                    )
                )
            );
        };
        
        // Render the app
        try {
            ReactDOM.render(
                React.createElement(DevOpsChatApp),
                appContainer
            );
            console.log('✅ React app rendered successfully!');
        } catch (error) {
            console.error('❌ React rendering failed:', error);
            appContainer.innerHTML = `
                <div style="padding: 20px; text-align: center; color: red;">
                    <h2>❌ React Rendering Failed</h2>
                    <p>Error: ${error.message}</p>
                    <p>But hey, the shadow DOM and CSS worked! 🎉</p>
                </div>
            `;
        }
    }
    
    console.log('🎯 DevOpsChat Simple UI loaded - should show in top-right corner!');
    
})();