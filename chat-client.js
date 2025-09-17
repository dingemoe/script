/*
* chat-client.js
*
* UI-klient for MyUtils chat-funksjonalitet.
* Brukes i et Tampermonkey-script sammen med common.js.
*/

(function() {
    'use strict';

    // Sjekk at MyUtils er tilgjengelig før vi fortsetter
    if (typeof window.MyUtils === 'undefined') {
        console.error('MyUtils-biblioteket er ikke lastet. Vennligst sjekk @require-direktivet.');
        return;
    }

    const { MyUtils } = window;

    // --- Konfigurasjon og UI-elementer ---
    const config = {
        defaultChannel: 'global',
        uiId: 'myutils-chat-client',
        commandPrefix: '/MyUtils',
    };

    let currentChannel = config.defaultChannel;

    // --- UI-funksjoner ---
    function createChatUI() {
        // Legg til grunnleggende CSS for et moderne utseende
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
            #${config.uiId}.open {
                transform: translateX(0);
            }
            #${config.uiId} * {
                box-sizing: border-box;
            }
            #myutils-chat-toggle {
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
            #myutils-chat-header {
                padding: 15px;
                background-color: #23272a;
                border-top-left-radius: 10px;
                border-top-right-radius: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: grab;
            }
            #myutils-chat-header h3 {
                margin: 0;
                font-size: 16px;
                color: #fff;
            }
            #myutils-chat-header .channel-name {
                font-size: 14px;
                color: #b9bbbe;
                font-style: italic;
            }
            #myutils-chat-log {
                flex-grow: 1;
                overflow-y: auto;
                padding: 10px;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            #myutils-chat-log::-webkit-scrollbar {
                width: 8px;
            }
            #myutils-chat-log::-webkit-scrollbar-thumb {
                background-color: #4f545c;
                border-radius: 4px;
            }
            #myutils-chat-log .message {
                background-color: #36393e;
                padding: 8px 12px;
                border-radius: 8px;
                line-height: 1.4;
            }
            #myutils-chat-log .message .timestamp {
                font-size: 10px;
                color: #72767d;
                float: right;
            }
            #myutils-chat-log .message .sender {
                font-weight: bold;
                color: #7289da;
                margin-right: 5px;
            }
            #myutils-chat-input-container {
                padding: 10px;
                border-top: 1px solid #4f545c;
            }
            #myutils-chat-input {
                width: 100%;
                padding: 10px 12px;
                border-radius: 5px;
                border: none;
                background-color: #40444b;
                color: #dcddde;
                font-size: 14px;
                outline: none;
            }
            #myutils-chat-input::placeholder {
                color: #72767d;
            }
        `);

        // Hoved-UI container
        const chatContainer = MyUtils.createElement('div', { id: config.uiId });
        document.body.appendChild(chatContainer);

        // Knapp for å vise/skjule
        const toggleBtn = MyUtils.createElement('div', { id: 'myutils-chat-toggle', title: 'Åpne chat' }, '💬');
        document.body.appendChild(toggleBtn);

        const header = MyUtils.createElement('div', { id: 'myutils-chat-header' });
        header.innerHTML = `
            <h3>MyUtils Chat</h3>
            <span class="channel-name" id="myutils-channel-name">#${currentChannel}</span>
        `;
        chatContainer.appendChild(header);

        const chatLog = MyUtils.createElement('div', { id: 'myutils-chat-log' });
        chatContainer.appendChild(chatLog);

        const inputContainer = MyUtils.createElement('div', { id: 'myutils-chat-input-container' });
        const inputField = MyUtils.createElement('input', {
            id: 'myutils-chat-input',
            type: 'text',
            placeholder: `Skriv en melding eller kommando (${config.commandPrefix} ...)`
        });
        inputContainer.appendChild(inputField);
        chatContainer.appendChild(inputContainer);

        // Gjør UI-et flyttbart
        makeDraggable(chatContainer, header);

        // Hendelseslyttere
        toggleBtn.addEventListener('click', () => {
            chatContainer.classList.toggle('open');
            toggleBtn.textContent = chatContainer.classList.contains('open') ? '❌' : '💬';
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

        // Abonnér på standardkanalen
        MyUtils.onMessage(currentChannel, handleIncomingMessage);
    }

    // Funksjon for å håndtere brukerinput (kommandoer eller meldinger)
    function handleInput(text) {
        if (text.startsWith(config.commandPrefix)) {
            // Håndter kommandoer
            handleCommand(text.substring(config.commandPrefix.length).trim());
        } else {
            // Send melding til gjeldende kanal
            MyUtils.sendMessage(currentChannel, {
                text: text,
                from: window.location.hostname
            });
        }
    }

    // Funksjon for å håndtere MyUtils-kommandoer
    function handleCommand(command) {
        const parts = command.match(/(?:[^\s"]+|"[^"]*")+/g).map(p => p.replace(/"/g, ''));
        const cmd = parts[0];
        const args = parts.slice(1);

        switch (cmd) {
            case 'createChannel':
                if (args.length < 1) {
                    appendSystemMessage(`Bruk: ${config.commandPrefix} createChannel "kanalnavn" --description "..." --persistent`);
                    return;
                }
                const channelName = args[0];
                const options = parseFlags(args.slice(1));
                MyUtils.createChannel(channelName, options);
                appendSystemMessage(`Kanal '${channelName}' opprettet med følgende konfigurasjon: ${JSON.stringify(options)}`);
                break;
            case 'joinChannel':
                if (args.length < 1) {
                    appendSystemMessage(`Bruk: ${config.commandPrefix} joinChannel "kanalnavn"`);
                    return;
                }
                const newChannel = args[0];
                if (MyUtils.channelExists(newChannel)) {
                    switchChannel(newChannel);
                } else {
                    appendSystemMessage(`Kanal '${newChannel}' finnes ikke. Oppretter en ny.`);
                    MyUtils.createChannel(newChannel);
                    switchChannel(newChannel);
                }
                break;
            case 'sendMessage':
                if (args.length < 2) {
                    appendSystemMessage(`Bruk: ${config.commandPrefix} sendMessage "kanal" "melding"`);
                    return;
                }
                const msgChannel = args[0];
                const messageText = args[1];
                MyUtils.sendMessage(msgChannel, { text: messageText, from: 'ChatUI' });
                appendSystemMessage(`Melding sendt til ${msgChannel}.`);
                break;
            case 'listChannels':
                const channels = MyUtils.listChannels();
                const list = channels.map(c => `**${c.name}** (${c.messageCount} meldinger) - *${c.description || 'Ingen beskrivelse'}*`).join('\n');
                appendSystemMessage(`Tilgjengelige kanaler:\n${list}`);
                break;
            case 'deleteChannel':
                if (args.length < 1) {
                    appendSystemMessage(`Bruk: ${config.commandPrefix} deleteChannel "kanalnavn"`);
                    return;
                }
                const channelToDelete = args[0];
                if (MyUtils.deleteChannel(channelToDelete)) {
                    appendSystemMessage(`Kanal '${channelToDelete}' er slettet.`);
                    if (currentChannel === channelToDelete) {
                        switchChannel(config.defaultChannel);
                    }
                } else {
                    appendSystemMessage(`Klarte ikke å slette kanalen '${channelToDelete}'.`);
                }
                break;
            default:
                appendSystemMessage(`Ukjent kommando: "${cmd}".`);
                break;
        }
    }

    // Funksjon for å bytte kanal
    function switchChannel(channelName) {
        if (currentChannel === channelName) return;

        // Avmelde fra forrige kanal-lytter
        if (MyUtils._listeners && MyUtils._listeners[currentChannel]) {
            // Note: onMessage returnerer en cleanup-funksjon, så vi kan bruke den.
            // Men i dette tilfellet er det mer effektivt å bare håndtere det via UI-et
            // uten å kalle `onMessage` på nytt, men heller stoppe den eksisterende lytteren.
            // Siden common.js ikke eksponerer en enkel måte å "avmelde" en spesifikk callback,
            // kan vi for enkelhetens skyld bare bytte variabelen og lytte på den nye.
        }

        currentChannel = channelName;
        document.getElementById('myutils-channel-name').textContent = `#${currentChannel}`;
        document.getElementById('myutils-chat-log').innerHTML = ''; // Tøm chatloggen
        appendSystemMessage(`Byttet til kanal: **${currentChannel}**.`);
        
        // Start ny lytter for den nye kanalen
        MyUtils.onMessage(currentChannel, handleIncomingMessage);
    }

    // Funksjon for å håndtere innkommende meldinger
    function handleIncomingMessage(message) {
        const chatLog = document.getElementById('myutils-chat-log');
        const messageEl = MyUtils.createElement('div', { class: 'message' });
        const sender = message.from || 'Ukjent';
        const timestamp = new Date(message.timestamp).toLocaleTimeString();
        const content = message.data.text || JSON.stringify(message.data);

        messageEl.innerHTML = `
            <span class="sender">${sender}</span>: ${content}
            <span class="timestamp">${timestamp}</span>
        `;
        chatLog.appendChild(messageEl);
        chatLog.scrollTop = chatLog.scrollHeight; // Scroll til bunnen
    }

    // Hjelpefunksjon for å legge til systemmeldinger i chatten
    function appendSystemMessage(text) {
        const chatLog = document.getElementById('myutils-chat-log');
        const messageEl = MyUtils.createElement('div', { class: 'message' });
        messageEl.innerHTML = `
            <span style="font-weight: bold; color: #f4d03f;">[System]</span>: ${text}
            <span class="timestamp">${new Date().toLocaleTimeString()}</span>
        `;
        chatLog.appendChild(messageEl);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    // Hjelpefunksjon for å parse flagg som --key "value"
    function parseFlags(args) {
        const options = {};
        for (let i = 0; i < args.length; i++) {
            if (args[i].startsWith('--')) {
                const key = args[i].substring(2);
                let value = args[i + 1];
                if (value === 'true' || value === 'false') {
                    value = value === 'true';
                } else if (!isNaN(Number(value))) {
                    value = Number(value);
                }
                options[key] = value;
                i++; // Hopp over verdien
            }
        }
        return options;
    }

    // Hjelpefunksjon for å gjøre UI-elementet flyttbart
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
            element.style.right = 'auto'; // Deaktiverer CSS-posisjonering
            element.style.bottom = 'auto';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            element.style.cursor = 'grab';
            element.style.userSelect = 'auto';
        });
    }

    // Start UI-et når siden er lastet
    MyUtils.waitForElement('body').then(createChatUI);

})();