/*
* chat-client.js
*
* UI-klient for MyUtils chat-funksjonalitet med forbedret sesjonsstyring.
* Henter userscript-signatur fra window.myChatSignature.
*/

(function() {
    'use strict';

    if (typeof window.MyUtils === 'undefined') {
        console.error('MyUtils-biblioteket er ikke lastet.');
        return;
    }

    // Henter den unike signaturen fra userscriptet
    const SCRIPT_NAME = window.myChatSignature || 'default_chat_client';
    const CLIENT_ID = SCRIPT_NAME.replace(/\s/g, '_').toLowerCase();

    const { MyUtils } = window;

    // --- Konfigurasjon og tilstand ---
    const config = {
        defaultChannel: 'global',
        uiId: `myutils-chat-client-${CLIENT_ID}`,
        commandPrefix: '/',
    };

    let state = {
        currentChannel: MyUtils.get(`state_channel_${CLIENT_ID}`, config.defaultChannel),
        currentMode: 'chat', // 'chat', 'menu', 'param-input', 'channel-select', 'agent-select'
        currentMenu: null,
        currentAgent: MyUtils.get(`state_agent_${CLIENT_ID}`, null), // Nytt: valgt agent
    };
    const activeListeners = {};
    
    // --- Hjelpefunksjoner for tilstandsbevaring ---
    function saveState() {
        MyUtils.set(`state_channel_${CLIENT_ID}`, state.currentChannel);
    }
    window.addEventListener('beforeunload', saveState);

    // --- UI-funksjoner ---
    function createChatUI() {
        MyUtils.addCSS(`
            #${config.uiId} {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 350px;
                height: 450px;
                background-color: #2c2f33;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
                display: flex;
                flex-direction: column;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                color: #dcddde;
                z-index: 99999;
                transition: transform 0.3s ease-in-out;
                transform: translateX(calc(100% + 10px));
            }
            #${config.uiId}.open { transform: translateX(0); }
            #myutils-chat-toggle-${CLIENT_ID} {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                background-color: #7289da;
                border-radius: 50%;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
                color: white;
                font-size: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 100000;
            }
            #myutils-chat-header-${CLIENT_ID} {
                padding: 15px;
                background-color: #23272a;
                border-top-left-radius: 10px;
                border-top-right-radius: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: grab;
            }
            #myutils-chat-header-${CLIENT_ID} h3 { margin: 0; font-size: 16px; color: #fff; }
            #myutils-chat-header-${CLIENT_ID} .channel-name { font-size: 14px; color: #b9bbbe; font-style: italic; }
            #myutils-chat-log-${CLIENT_ID} {
                flex-grow: 1;
                overflow-y: auto;
                padding: 10px;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            #myutils-chat-log-${CLIENT_ID} .message { background-color: #36393e; padding: 8px 12px; border-radius: 8px; line-height: 1.4; }
            #myutils-chat-log-${CLIENT_ID} .message .timestamp { font-size: 10px; color: #72767d; float: right; }
            #myutils-chat-log-${CLIENT_ID} .message .sender { font-weight: bold; color: #7289da; margin-right: 5px; }
            #myutils-chat-log-${CLIENT_ID} .system { color: #f4d03f; font-weight: bold; }
            #myutils-chat-input-container-${CLIENT_ID} { padding: 10px; border-top: 1px solid #4f545c; }
            #myutils-chat-input-${CLIENT_ID} {
                width: 100%;
                padding: 10px 12px;
                border-radius: 5px;
                border: none;
                background-color: #40444b;
                color: #dcddde;
                font-size: 14px;
                outline: none;
            }
        `);

        const chatContainer = MyUtils.createElement('div', { id: config.uiId });
        document.body.appendChild(chatContainer);
        const toggleBtn = MyUtils.createElement('div', { id: `myutils-chat-toggle-${CLIENT_ID}`, title: 'Åpne chat' }, '💬');
        document.body.appendChild(toggleBtn);

        const header = MyUtils.createElement('div', { id: `myutils-chat-header-${CLIENT_ID}` });
        header.innerHTML = `<h3>MyUtils Chat</h3><span class="channel-name" id="myutils-channel-name-${CLIENT_ID}">#${state.currentChannel}</span>`;
        chatContainer.appendChild(header);

        const chatLog = MyUtils.createElement('div', { id: `myutils-chat-log-${CLIENT_ID}` });
        chatContainer.appendChild(chatLog);

        const inputContainer = MyUtils.createElement('div', { id: `myutils-chat-input-container-${CLIENT_ID}` });
        const inputField = MyUtils.createElement('input', {
            id: `myutils-chat-input-${CLIENT_ID}`,
            type: 'text',
            placeholder: `Skriv en melding eller kommando (${config.commandPrefix}menu for meny)`
        });
        inputContainer.appendChild(inputField);
        chatContainer.appendChild(inputContainer);

        makeDraggable(chatContainer, header);

        toggleBtn.addEventListener('click', () => {
            chatContainer.classList.toggle('open');
            toggleBtn.textContent = chatContainer.classList.contains('open') ? '❌' : '💬';
            if (chatContainer.classList.contains('open')) {
                inputField.focus();
            }
        });

        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const text = inputField.value.trim();
                if (text) {
                    handleInput(text);
                    inputField.value = '';
                }
            }
        });

        // Abonnér på standardkanalen ved start
        switchChannel(state.currentChannel);
    }
    
    // Kommandomapping for snarveier
    const commandMap = {
        'create': { cmd: 'createChannel', description: 'Lag ny kanal', flags: { '-d': 'description', '-m': 'maxMessages', '-p': 'persistent' }, params: ['channelName'] },
        'join': { cmd: 'joinChannel', description: 'Koble til kanal', params: ['channelName'] },
        'list': { cmd: 'listChannels', description: 'Vis alle kanaler' },
        'delete': { cmd: 'deleteChannel', description: 'Slett kanal', params: ['channelName'] },
        'switch': { cmd: 'switchActiveChannel', description: 'Bytt aktiv kanal' },
        'agents': { cmd: 'listAgents', description: 'Vis tilgjengelige agenter' }
    };
    
    // --- Hovedlogikk for input og kommandoer ---
    function handleInput(text) {
        if (state.currentMode === 'channel-select') {
            handleChannelSelection(text);
        } else if (state.currentMode === 'param-input') {
            handleParamInput(text);
        } else if (state.currentMode === 'agent-select') {
            handleAgentSelection(text);
        } else if (state.currentMode === 'menu') {
            handleMenuSelection(text);
        } else if (text.startsWith(config.commandPrefix)) {
            handleCommand(text.substring(config.commandPrefix.length).trim());
        } else {
            // Hvis agent er valgt, send til agentens kanal, ellers til currentChannel
            const targetChannel = state.currentAgent ? `agent_${state.currentAgent}` : state.currentChannel;
            MyUtils.sendMessage(targetChannel, {
                text: text,
                from: SCRIPT_NAME,
                messageId: MyUtils.getAndIncrement(`message_counter_${CLIENT_ID}`)
            });
        }
    }
    
    function handleCommand(command) {
        if (command === 'menu') {
            displayMenu();
            return;
        }
        const parts = command.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
        const cmd = parts[0];
        const args = parts.slice(1).map(p => p.replace(/"/g, ''));
        const commandInfo = commandMap[cmd];
        if (!commandInfo) {
            appendSystemMessage(`Ukjent kommando: "${cmd}". Skriv /menu for å se alternativer.`, '❓');
            return;
        }
        if (commandInfo.cmd === 'listAgents') {
            displayAgentList();
        } else if (commandInfo.cmd === 'switchActiveChannel') {
            displayChannelSelectionMenu();
        } else if (commandInfo.params || commandInfo.flags) {
            handleParamCommand(commandInfo, args);
        } else {
            executeCommand(commandInfo.cmd);
        }
    }
    
    function handleParamCommand(commandInfo, args) {
        const flags = args.filter(arg => arg.startsWith('-'));
        const params = args.filter(arg => !arg.startsWith('-'));
        const parsedFlags = parseFlags(flags, commandInfo.flags);
        if (commandInfo.params && params.length < commandInfo.params.length) {
            let promptText = `Mangler parametere for **${commandInfo.cmd}**.`;
            promptText += `<br>Bruk: ${commandInfo.params.join(', ')}`;
            if (commandInfo.flags) {
                const flagList = Object.keys(commandInfo.flags).map(key => `${key} (${commandInfo.flags[key]})`).join(', ');
                promptText += `<br>Valg: ${flagList}`;
            }
            appendSystemMessage(promptText, '⚠️');
            return;
        }
        executeCommand(commandInfo.cmd, params, parsedFlags);
    }
    
    function executeCommand(cmd, params = [], flags = {}) {
        switch (cmd) {
            case 'createChannel':
                MyUtils.createChannel(params[0], flags);
                appendSystemMessage(`Kanal '${params[0]}' opprettet.`, '✅');
                break;
            case 'joinChannel':
                if (params.length < 1) {
                    appendSystemMessage(`Bruk: ${config.commandPrefix}join "kanalnavn"`, '⚠️');
                    return;
                }
                switchChannel(params[0]);
                break;
            case 'listChannels':
                const channels = MyUtils.listChannels();
                const list = channels.map(c => `**${c.name}** (${c.messageCount} meldinger) - *${c.description || 'Ingen beskrivelse'}*`).join('<br>');
                appendSystemMessage(`Tilgjengelige kanaler:<br>${list}`);
                break;
            case 'deleteChannel':
                if (params.length < 1) {
                    appendSystemMessage(`Bruk: ${config.commandPrefix}delete "kanalnavn"`, '⚠️');
                    return;
                }
                const channelToDelete = params[0];
                if (MyUtils.deleteChannel(channelToDelete)) {
                    appendSystemMessage(`Kanal '${channelToDelete}' er slettet.`, '🗑️');
                    if (state.currentChannel === channelToDelete) {
                        switchChannel(config.defaultChannel);
                    }
                } else {
                    appendSystemMessage(`Klarte ikke å slette kanalen '${channelToDelete}'.`, '❌');
                }
                break;
            case 'switchActiveChannel':
                displayChannelSelectionMenu();
                break;
            default:
                appendSystemMessage(`Ukjent kommando: "${cmd}".`, '❓');
                break;
        }
    }

    // --- Menylogikk ---
    function displayMenu() {
        const menuOptions = Object.keys(commandMap).map((key, index) => {
            const command = commandMap[key];
            return `${index + 1}. **${command.cmd}** - ${command.description}`;
        });

        state.currentMenu = Object.keys(commandMap);
        state.currentMode = 'menu';
        appendSystemMessage(`**Meny**<br>${menuOptions.join('<br>')}<br>Skriv nummeret på valget ditt.`, '📝');
    }

    function handleMenuSelection(selection) {
        const index = parseInt(selection, 10) - 1;
        if (isNaN(index) || index < 0 || index >= state.currentMenu.length) {
            appendSystemMessage('Ugyldig valg. Vennligst skriv et nummer fra menyen.', '❌');
            return;
        }

        const commandKey = state.currentMenu[index];
        const commandInfo = commandMap[commandKey];
        if (commandInfo.cmd === 'switchActiveChannel') {
            displayChannelSelectionMenu();
            state.currentMode = 'chat';
        } else if (commandInfo.params || commandInfo.flags) {
            let promptText = `Skriv inn parametere for **${commandInfo.cmd}**`;
            if (commandInfo.params) {
                promptText += `: ${commandInfo.params.join(', ')}`;
            }
            if (commandInfo.flags) {
                const flagList = Object.keys(commandInfo.flags).map(key => `${key} (${commandInfo.flags[key]})`).join(', ');
                promptText += `<br>Valg: ${flagList}`;
            }
            appendSystemMessage(promptText, '👉');
            document.getElementById(`myutils-chat-input-${CLIENT_ID}`).placeholder = `Skriv inn verdier for ${commandInfo.cmd}...`;

            state.currentMode = 'param-input';
            state.currentMenu = commandInfo.cmd;
        } else {
            // Kall handleCommand direkte for kommandoer uten parametre
            handleCommand(commandKey);
            state.currentMode = 'chat';
        }
    }

    function handleParamInput(text) {
        const cmd = state.currentMenu;
        const commandInfo = commandMap[Object.keys(commandMap).find(key => commandMap[key].cmd === cmd)];
        const parts = text.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
        const args = parts.map(p => p.replace(/"/g, ''));
        
        state.currentMode = 'chat';
        document.getElementById(`myutils-chat-input-${CLIENT_ID}`).placeholder = `Skriv en melding eller kommando (${config.commandPrefix}menu for meny)`;

        const params = args.filter(arg => !arg.startsWith('-'));
        const flags = args.filter(arg => arg.startsWith('-'));
        const parsedFlags = parseFlags(flags, commandInfo.flags);
        
        executeCommand(cmd, params, parsedFlags);
    }
    
    // --- Kanal-valg logikk ---
    function displayChannelSelectionMenu() {
        const channels = MyUtils.listChannels();
        const menuOptions = channels.map((c, index) => {
            const activeTag = c.name === state.currentChannel ? ' **(Aktiv)**' : '';
            return `${index + 1}. **${c.name}** - *${c.description || 'Ingen beskrivelse'}*${activeTag}`;
        });
        
        state.currentMode = 'channel-select';
        state.currentMenu = channels.map(c => c.name);
        appendSystemMessage(`**Bytt til kanal**<br>${menuOptions.join('<br>')}<br>Skriv nummeret på kanalen du vil bytte til.`, '🔄');
    }

    function handleChannelSelection(selection) {
        const index = parseInt(selection, 10) - 1;
        if (isNaN(index) || index < 0 || index >= state.currentMenu.length) {
            appendSystemMessage('Ugyldig valg. Vennligst skriv et nummer fra listen.', '❌');
            return;
        }

        const channelName = state.currentMenu[index];
        state.currentMode = 'chat';
        document.getElementById(`myutils-chat-input-${CLIENT_ID}`).placeholder = `Skriv en melding eller kommando (${config.commandPrefix}menu for meny)`;
        switchChannel(channelName);
    }

    // --- Agent presence: abonner på global og oppdater lastActivity ---
    let mySubscriberId = null;
    function subscribePresence() {
        mySubscriberId = MyUtils.subscribeToChannel('global', { signature: SCRIPT_NAME });
        setInterval(() => {
            MyUtils.subscribeToChannel('global', { signature: SCRIPT_NAME }); // Oppdater lastActivity
        }, 30000);
    }

    // --- Hjelpefunksjoner ---
    function switchChannel(channelName) {
        state.currentAgent = null;
        MyUtils.set(`state_agent_${CLIENT_ID}`, null);
        if (state.currentChannel === channelName) {
            appendSystemMessage(`Du er allerede i kanalen **${state.currentChannel}**.`);
            return;
        }
        if (activeListeners[state.currentChannel]) {
            activeListeners[state.currentChannel]();
            delete activeListeners[state.currentChannel];
        }
        state.currentChannel = channelName;
        document.getElementById(`myutils-channel-name-${CLIENT_ID}`).textContent = `#${state.currentChannel}`;
        document.getElementById(`myutils-chat-log-${CLIENT_ID}`).innerHTML = '';
        appendSystemMessage(`Byttet til kanal: **${state.currentChannel}**.`);
        activeListeners[state.currentChannel] = MyUtils.onMessage(state.currentChannel, handleIncomingMessage);
        saveState();
    }

    function handleIncomingMessage(message) {
        if (message.from === SCRIPT_NAME && message.messageId) {
            const lastMessageId = MyUtils.get(`last_message_id_${CLIENT_ID}`, -1);
            if (message.messageId <= lastMessageId) {
                return;
            }
            MyUtils.set(`last_message_id_${CLIENT_ID}`, message.messageId);
        }
        
        const chatLog = document.getElementById(`myutils-chat-log-${CLIENT_ID}`);
        const messageEl = MyUtils.createElement('div', { class: 'message' });
        const sender = message.from || 'Ukjent';
        const timestamp = new Date(message.timestamp).toLocaleTimeString();
        const content = message.data.text || JSON.stringify(message.data);
        messageEl.innerHTML = `<span class="sender">${sender}</span>: ${content}<span class="timestamp">${timestamp}</span>`;
        chatLog.appendChild(messageEl);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    function appendSystemMessage(text, emoji = 'ℹ️') {
        const chatLog = document.getElementById(`myutils-chat-log-${CLIENT_ID}`);
        const messageEl = MyUtils.createElement('div', { class: 'message' });
        messageEl.innerHTML = `<span class="system">${emoji} [System]</span>: ${text}<span class="timestamp">${new Date().toLocaleTimeString()}</span>`;
        chatLog.appendChild(messageEl);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    function parseFlags(args, flagMapping) {
        const options = {};
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg.startsWith('-')) {
                const fullFlag = flagMapping[arg];
                if (fullFlag) {
                    let value = args[i + 1];
                    if (value) {
                        if (value === 'true' || value === 'false') {
                            options[fullFlag] = value === 'true';
                        } else if (!isNaN(Number(value))) {
                            options[fullFlag] = Number(value);
                        } else {
                            options[fullFlag] = value;
                        }
                        i++;
                    } else {
                        options[fullFlag] = true;
                    }
                }
            }
        }
        return options;
    }

    function makeDraggable(element, handle) {
        let isDragging = false;
        let offset = { x: 0, y: 0 };
        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            offset.x = e.clientX - element.getBoundingClientRect().left;
            offset.y = e.clientY - element.getBoundingClientRect().top;
            element.style.cursor = 'grabbing';
            element.style.userSelect = 'none';
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            element.style.left = `${e.clientX - offset.x}px`;
            element.style.top = `${e.clientY - offset.y}px`;
            element.style.right = 'auto';
            element.style.bottom = 'auto';
        });
        document.addEventListener('mouseup', () => {
            isDragging = false;
            element.style.cursor = 'grab';
            element.style.userSelect = 'auto';
        });
    }

    MyUtils.waitForElement('body').then(() => {
        subscribePresence();
        createChatUI();
    });
})();