/* Mr. Stuck - Interactive Aid for Labs */
(function () {
    // 1. Inject Styles
    const style = document.createElement('style');
    style.innerHTML = `
        .stuck-container {
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 1000;
            font-family: 'Outfit', sans-serif;
            pointer-events: none;
        }

        .stuck-container * {
            box-sizing: border-box;
            pointer-events: none;
        }

        #mr-stuck-button {
            width: 54px;
            height: 54px;
            background: #ffffff;
            border: 2px solid #000000;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            box-shadow: 0 4px 10px rgba(0,0,0,0.03);
            pointer-events: all;
        }

        #mr-stuck-button:hover {
            transform: scale(1.08);
            background: #fdfdfd;
        }

        /* Expressions */
        .stuck-blush {
            position: absolute;
            width: 10px;
            height: 10px;
            background: #ffb6c1;
            border-radius: 50%;
            opacity: 0;
            transition: opacity 0.3s;
            bottom: 12px;
            filter: blur(2px);
        }
        .stuck-blush.left { left: 10px; }
        .stuck-blush.right { right: 10px; }
        #mr-stuck-button.blushing .stuck-blush { opacity: 0.6; }

        .stuck-eyebrow {
            position: absolute;
            width: 10px;
            height: 2px;
            background: #000;
            top: 14px;
            opacity: 0;
            transition: all 0.2s;
        }
        .stuck-eyebrow.left { left: 12px; }
        .stuck-eyebrow.right { right: 12px; }
        
        #mr-stuck-button.angry .stuck-eyebrow { opacity: 1; background: #ff4d4d; }
        #mr-stuck-button.angry .stuck-eyebrow.left { transform: rotate(25deg); top: 16px; }
        #mr-stuck-button.angry .stuck-eyebrow.right { transform: rotate(-25deg); top: 16px; }
        #mr-stuck-button.angry { border-color: #ff4d4d; animation: shake 0.2s infinite; }

        /* Suspicious State (Curious Typing) */
        #mr-stuck-button.suspicious .stuck-eye { height: 6px; border-radius: 3px; }

        @keyframes shake {
            0% { transform: translate(1px, 1px) rotate(0deg) scale(1.08); }
            20% { transform: translate(-1px, -1px) rotate(-1deg) scale(1.08); }
            40% { transform: translate(-1px, 1px) rotate(1deg) scale(1.08); }
            60% { transform: translate(1px, -1px) rotate(-1deg) scale(1.08); }
            80% { transform: translate(-1px, 1px) rotate(1deg) scale(1.08); }
            100% { transform: translate(1px, 1px) rotate(0deg) scale(1.08); }
        }

        /* Eyes */
        .stuck-eye-socket {
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .stuck-eye {
            width: 11px;
            height: 11px;
            background: #000000;
            border-radius: 50%;
            transition: transform 0.05s linear, background 0.3s, height 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.4s ease;
        }
        #mr-stuck-button.angry .stuck-eye { background: #ff4d4d; }

        /* Sleeping State */
        #mr-stuck-button.sleeping .stuck-eye {
            height: 2px;
            width: 10px;
            border-radius: 2px;
            transform: translateY(2px) !important;
        }

        .stuck-zzz-container {
            position: absolute;
            top: -12px;
            right: -5px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s;
        }

        #mr-stuck-button.sleeping .stuck-zzz-container {
            opacity: 1;
        }

        .stuck-zzz {
            position: absolute;
            font-size: 14px;
            font-weight: 900;
            color: #6d28d9;
            opacity: 0;
            animation: zzz-fly 3s infinite;
        }

        .stuck-zzz:nth-child(2) { animation-delay: 1s; font-size: 10px; }
        .stuck-zzz:nth-child(3) { animation-delay: 2s; font-size: 18px; }

        @keyframes zzz-fly {
            0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 0.8; }
            100% { transform: translate(12px, -25px) scale(1.1); opacity: 0; }
        }

        /* Speech Bubble */
        #stuck-speech-bubble {
            position: absolute;
            bottom: 70px;
            right: 0;
            background: #ffffff;
            border: 1px solid #000000;
            padding: 8px 14px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            pointer-events: none;
        }

        #stuck-speech-bubble.active {
            opacity: 1;
            transform: translateY(0);
        }

        #stuck-speech-bubble::after {
            content: '';
            position: absolute;
            bottom: -6px;
            right: 22px;
            width: 10px;
            height: 10px;
            background: #ffffff;
            border-right: 1px solid #000000;
            border-bottom: 1px solid #000000;
            transform: rotate(45deg);
        }

        /* Chat Window */
        #mr-stuck-chat {
            position: absolute;
            bottom: 75px;
            right: 0;
            width: 330px;
            max-width: calc(100vw - 60px);
            height: auto;
            max-height: calc(100vh - 110px);
            background: #ffffff;
            border: 1px solid #000000;
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 15px 40px rgba(0,0,0,0.08);
            opacity: 0;
            transform: translateY(15px) scale(0.97);
            transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
            pointer-events: none;
        }

        #mr-stuck-chat.active {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: all;
        }

        #mr-stuck-chat.active * {
            pointer-events: all;
        }

        .stuck-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: #ffffff;
            scrollbar-width: none;
            -ms-overflow-style: none;
            min-height: 100px;
        }

        .stuck-messages::-webkit-scrollbar {
            display: none;
        }

        .stuck-msg {
            max-width: 85%;
            padding: 10px 14px;
            font-size: 13.5px;
            line-height: 1.5;
            border-radius: 12px;
            word-wrap: break-word;
        }

        .stuck-msg.ai {
            background: #f9f9f9;
            color: #000;
            align-self: flex-start;
            border-bottom-left-radius: 2px;
            border: 1px solid #f0f0f0;
        }

        .stuck-msg code {
            display: block;
            background: #1e1e1e;
            color: #fff;
            padding: 10px;
            border-radius: 8px;
            margin: 8px 0;
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            word-break: break-all;
            white-space: pre-wrap;
        }

        .stuck-msg.user {
            background: #000;
            color: #fff;
            align-self: flex-end;
            border-bottom-right-radius: 2px;
        }

        .stuck-options-container {
            padding: 15px 20px 15px;
            background: #ffffff;
            border-top: 1px solid #f9f9f9;
        }

        .stuck-options-label {
            font-size: 9px;
            color: #bbb;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            font-weight: 800;
            margin-bottom: 10px;
            display: block;
        }

        .stuck-options {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }

        .stuck-option-btn {
            background: #ffffff;
            border: 1px solid #eeeeee;
            padding: 6px 14px;
            border-radius: 99px;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.2s;
            color: #555;
            font-weight: 500;
        }

        .stuck-option-btn:hover {
            border-color: #000;
            color: #000;
            background: #fafafa;
        }

        .stuck-input-area {
            padding: 15px 20px;
            border-top: 1px solid #f5f5f5;
            display: flex;
            gap: 8px;
            background: #ffffff;
            width: 100%;
        }

        .stuck-input-wrapper {
            position: relative;
            flex: 1;
            display: flex;
            min-width: 0;
        }

        .stuck-input-area input {
            width: 100%;
            border: 1px solid #f0f0f0;
            border-radius: 10px;
            padding: 10px 38px 10px 14px;
            font-size: 13px;
            outline: none;
            background: #fcfcfc;
            transition: all 0.2s;
            font-family: inherit;
        }

        .stuck-input-area input:focus {
            border-color: #000;
            background: #fff;
        }

        .stuck-voice-btn {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            width: 24px;
            height: 24px;
            background: transparent;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            color: #888;
            z-index: 5;
            padding: 0;
        }

        .stuck-voice-btn:hover {
            color: #000;
        }

        .stuck-voice-btn.recording {
            color: #ff4d4d;
            animation: breathe 1.5s infinite;
        }

        .stuck-voice-btn svg {
            width: 16px;
            height: 16px;
        }

        @keyframes breathe {
            0% { transform: translateY(-50%) scale(1); opacity: 0.7; }
            50% { transform: translateY(-50%) scale(1.2); opacity: 1; }
            100% { transform: translateY(-50%) scale(1); opacity: 0.7; }
        }

        .stuck-send-btn {
            background: #000;
            color: #fff;
            border: none;
            border-radius: 10px;
            padding: 0 16px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            flex-shrink: 0;
        }

        .stuck-send-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .stuck-send-btn:disabled {
            background: #eee;
            color: #ccc;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        input:disabled {
            background: #fafafa !important;
            color: #ccc;
        }

        .stuck-option-btn.disabled {
            opacity: 0.5;
            cursor: not-allowed;
            border-color: #eee;
        }

        .stuck-floating-close {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 22px;
            height: 22px;
            background: #ffffff;
            border: 1px solid #f0f0f0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 14px;
            line-height: 1;
            color: #ddd;
            z-index: 100;
            transition: all 0.2s;
        }

        .stuck-floating-close:hover {
            color: #000;
            border-color: #000;
        }

        @media (max-width: 480px) {
            .stuck-container {
                bottom: 15px;
                right: 15px;
            }
            #mr-stuck-button {
                width: 44px;
                height: 44px;
            }
            #mr-stuck-chat {
                width: calc(100vw - 30px);
                max-height: calc(100vh - 80px);
                bottom: 55px;
                right: 0;
                border-radius: 12px;
            }
            #stuck-speech-bubble {
                right: 0;
                bottom: 55px;
                font-size: 11px;
                padding: 6px 10px;
            }
            .stuck-messages {
                padding: 12px;
            }
            .stuck-msg {
                font-size: 12.5px;
                max-width: 90%;
            }
            .stuck-input-area {
                padding: 10px;
                gap: 6px;
            }
            .stuck-send-btn {
                padding: 0 12px;
                font-size: 11px;
            }
            .stuck-options-container {
                padding: 10px 12px;
            }
            .stuck-option-btn {
                padding: 4px 10px;
                font-size: 10px;
            }
        }

        /* Anti-Speedrun Styles */
        .nav-btn-next.timer-active {
            opacity: 0.6 !important;
            cursor: not-allowed !important;
            filter: grayscale(0.5);
            pointer-events: auto !important; /* Allow click to trigger warning */
        }
    `;
    document.head.appendChild(style);

    // 2. Data & Supportive Logic
    const fileName = window.location.pathname.split('/').pop().replace('.html', '');

    const supportivePrefixes = [
        "Take a deep breath! ",
        "Basically, ",
        "So, here's the deal: ",
        "Don't worry, it's simpler than it looks! ",
        "Imagine it like this: ",
        "Here's the key takeaway: "
    ];

    const getPrefix = () => supportivePrefixes[Math.floor(Math.random() * supportivePrefixes.length)];

    const explanatoryWisdom = {
        'git-essentials': {
            name: 'Git Essentials',
            tip: "Think of your commits as **Save Points** in a video game! 🎮 You should save often so you can always go back if something breaks. Every commit tells a tiny part of your story.",
            command: "The command `git status` is like checking your compass—it tells you exactly where you are and what's happened in your project since your last save.",
            why: "Imagine you're writing a huge group paper and everyone is editing different parts. Git is the glue that keeps all those pieces together without losing anyone's hard work! 🏗️"
        },
        'budget-tracker': {
            name: 'Budget Tracker',
            tip: "Consistent categorization makes your charts much more meaningful! 💰 Think of it as sorting your laundry—it's way easier to find what you need when everything's in its place.",
            command: "Browsing the **DevTools Console** is like looking under the hood of a car. If your transactions aren't saving, that's where the engine will 'beep' at us! 💾",
            why: "Understanding how to save data in the browser (LocalStorage) is like giving your application a long-term memory. It remembers you even after you turn the screen off! 🌐"
        },
        'weather-app': {
            name: 'Weather App',
            tip: "Always check if the API is 'talking back' before you try to read its message! ☁️ Otherwise, your app might try to read an empty letter and get confused.",
            command: "Using the **Network** tab in your browser is like watching the postman deliver your weather data. You can see exactly what OpenWeather is sending us! 🔌",
            why: "Working with remote APIs is how 90% of modern apps (like Maps or News) get their information. You're learning to talk to the rest of the internet! 🌡️"
        },
        'quick-tab-closer': {
            name: 'Chrome Extension Lab',
            tip: "Think of your background logic as a silent observer! 🕵️‍♂️ It's always ready to react when you trigger its magic button.",
            command: "The `chrome.tabs` API is like a master control panel for your browser. It gives you the power to see, move, or even close any tab with just a few lines of code! 🔧",
            why: "Chrome Extensions are the ultimate way to customize your web experience. You're not just using the browser anymore; you're building its features! 🌐"
        },
        'html-blog-article': {
            name: 'Semantic Blog Lab',
            tip: "Semantic tags are like labels on moving boxes! 📦 Using `<article>` instead of just a generic `<div>` tells Google exactly what's inside. It's the secret to great SEO.",
            command: "The `<aside>` element is perfect for sidebars or pull quotes. It tells the browser: 'This is related, but not the main story!' 🗞️",
            why: "Building with semantics makes the web accessible to everyone, including people using screen readers. You're not just coding; you're making the internet more inclusive! 🌐"
        }
    };

    const currentLabMeta = explanatoryWisdom[fileName] || {
        name: 'this lab',
        tip: 'Follow the steps one by one, and it will all click soon!',
        command: 'Each command is a specific instruction to the machine to help us build.',
        why: 'We are building your developer muscle by turning complex theories into something you can actually touch!'
    };

    // 3. Intelligence Engine Logic
    function getContextFromPage(query) {
        const activeStep = document.querySelector('.step-content.active');
        if (!activeStep) return "I'm having a little trouble seeing exactly where you are. Try clicking any lab step, and I'll be able to guide you better! 🧭";

        const q = query.toLowerCase();

        // Robust Title Extraction (Skip "Step 1" headers, look for the actual title)
        const primaryTitle = activeStep.querySelector('.text-2xl, .text-xl, h1')?.textContent?.trim();
        const secondaryTitle = activeStep.querySelector('h2')?.textContent?.trim();
        const stepTitle = (primaryTitle && primaryTitle.length > 2) ? primaryTitle : (secondaryTitle || 'the current phase');

        // A. Supportive Status Check
        if (q.includes('what') || q.includes('doing') || q.includes('about') || q.includes('current')) {
            const firstPara = activeStep.querySelector('p')?.textContent?.trim().replace(/\n/g, ' ') || '';
            const listItems = Array.from(activeStep.querySelectorAll('li')).slice(0, 2).map(li => {
                const text = li.querySelector('span')?.textContent || li.textContent;
                return text.trim().replace(/^[0-9\s.]+/, ''); // Strip leading numbers
            });

            // Analyze the content to find a specific "mission"
            let mission = "progressing through the lesson";
            if (firstPara.toLowerCase().includes('create') || firstPara.toLowerCase().includes('build')) mission = "building out the core skeleton";
            else if (firstPara.toLowerCase().includes('understand') || firstPara.toLowerCase().includes('learn')) mission = "understanding how this component works";
            else if (firstPara.toLowerCase().includes('test') || firstPara.toLowerCase().includes('verify')) mission = "verifying and testing the logic";

            let responses = [
                `Scanning the blueprint... 🔍 We are currently focused on **${stepTitle}**. The main mission here is ${mission}.`,
                `${getPrefix()} We're right in the middle of **${stepTitle}**. We need to focus on ${mission} to make sure everything stays robust!`,
                `You're on the right track! 🧭 This part is all about **${stepTitle}**. We're basically ${mission} before moving forward.`
            ];

            let response = responses[Math.floor(Math.random() * responses.length)];

            // Append specific actions if found in lists
            if (listItems.length > 0) {
                response += `\n\nSpecifically, you'll ${listItems[0].toLowerCase().replace(/\./g, '')} and making sure it fits the overall structure!`;
            } else if (firstPara.length > 20) {
                const distilled = firstPara.split('.')[0] + '.';
                response += `\n\nTo keep it simple: ${distilled}`;
            }

            return response;
        }

        // B. Explanatory Concepts
        if (q.includes('why') || q.includes('purpose') || q.includes('concept') || q.includes('understand')) {
            const whyText = activeStep.querySelector('.why-box p')?.textContent;
            if (whyText) return `**Let's understand why we do this:**\n${whyText}\n\nThink of it as the 'logic' behind the magic! ✨`;
            return `**A bit of context:**\n${currentLabMeta.why}`;
        }

        // C. Helpful Technical Guidance
        if (q.includes('code') || q.includes('command') || q.includes('how') || q.includes('syntax') || q.includes('terminal')) {
            const code = activeStep.querySelector('code')?.textContent;
            if (code) return `**Here is the command you need:**\n\n\`\`\`\n${code.trim()}\n\`\`\`\n\nThis tells the machine exactly how to execute our goal for this step! ⌨️`;
            return `**A quick pointer on commands:**\n${currentLabMeta.command}`;
        }

        // D. Encouraging Pro Tips
        if (q.includes('tip') || q.includes('pro') || q.includes('help') || q.includes('advice')) {
            const tips = Array.from(activeStep.querySelectorAll('.why-title'))
                .filter(el => el.textContent.toLowerCase().includes('tip'))
                .map(el => el.nextElementSibling.textContent);
            if (tips.length > 0) return `${getPrefix()}Here is a special trick for this step:\n\n**${tips[0]}** 💡`;
            return `**A Pro Tip from me:**\n${currentLabMeta.tip}`;
        }

        return null;
    }

    // 4. Create Elements
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Morning";
        if (hour < 17) return "Afternoon";
        if (hour < 20) return "Evening";
        return "Night";
    };

    const container = document.createElement('div');
    container.className = 'stuck-container';
    container.innerHTML = `
        <div id="stuck-speech-bubble">Hello!</div>
        <div id="mr-stuck-button">
            <div class="stuck-eyebrow left"></div>
            <div class="stuck-eyebrow right"></div>
            <div class="stuck-eye-socket">
                <div class="stuck-eye"></div>
            </div>
            <div class="stuck-eye-socket">
                <div class="stuck-eye"></div>
            </div>
            <div class="stuck-blush left"></div>
            <div class="stuck-blush right"></div>
            <div class="stuck-zzz-container">
                <span class="stuck-zzz">Z</span>
                <span class="stuck-zzz">Z</span>
                <span class="stuck-zzz">Z</span>
            </div>
        </div>
        <div id="mr-stuck-chat">
            <button class="stuck-floating-close" aria-label="Close Chat">&times;</button>
            <div class="stuck-messages"></div>
            <div class="stuck-options-container">
                <span class="stuck-options-label">Contextual Help</span>
                <div class="stuck-options" id="stuck-options"></div>
            </div>
            <div class="stuck-input-area">
                <div class="stuck-input-wrapper">
                    <input type="text" id="stuck-input" placeholder="What's this step about?">
                    <button id="stuck-voice" class="stuck-voice-btn" title="Voice Typing">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </button>
                </div>
                <button id="stuck-send" class="stuck-send-btn">Send</button>
            </div>
        </div>
    `;
    document.body.appendChild(container);

    // 5. Variables & Elements
    const button = document.getElementById('mr-stuck-button');
    const chat = document.getElementById('mr-stuck-chat');
    const bubble = document.getElementById('stuck-speech-bubble');
    const input = document.getElementById('stuck-input');
    const sendBtn = document.getElementById('stuck-send');
    const voiceBtn = document.getElementById('stuck-voice');
    const messagesEl = container.querySelector('.stuck-messages');
    const optionsEl = document.getElementById('stuck-options');
    const closeBtn = container.querySelector('.stuck-floating-close');
    let isTyping = false;
    let sleepTimer;
    let isSleeping = false;
    let suspiciousTimer;
    let rudeCount = 0;

    function showBanOverlay() {
        // Feature removed per request
    }

    function setSuspicious(active) {
        if (active) {
            button.classList.add('suspicious');
        } else {
            button.classList.remove('suspicious');
        }
    }

    function wakeUp() {
        if (!isSleeping) return;
        isSleeping = false;
        button.classList.remove('sleeping');
        resetSleepTimer();
    }

    function goToSleep() {
        if (isSleeping || isTyping) return;
        isSleeping = true;
        button.classList.add('sleeping');
        showBubble("Zzz... 😴", 2000);
    }

    function resetSleepTimer() {
        clearTimeout(sleepTimer);
        // Only sleep if chat is open or user started typing but stopped
        if (chat.classList.contains('active')) {
            sleepTimer = setTimeout(goToSleep, 10000);
        }
    }

    // 6. Speech Bubble Logic
    let bubbleTimeout;
    function showBubble(text, duration = 3000) {
        if (chat.classList.contains('active')) return;
        bubble.textContent = text;
        bubble.classList.add('active');
        clearTimeout(bubbleTimeout);
        bubbleTimeout = setTimeout(() => {
            bubble.classList.remove('active');
        }, duration);
    }

    // 7. Anti-Speedrun Logic
    let nextTimer;
    let maxSeenStep = 1;
    function startNextTimer() {
        clearTimeout(nextTimer);
        const nextBtn = document.querySelector('.nav-btn-next');
        const stepNumEl = document.getElementById('current-step-num');
        const stepNum = stepNumEl ? parseInt(stepNumEl.textContent) : 1;
        if (!nextBtn) return;

        // Disable timer for "About the Lab" (Step 1) OR already seen steps
        if (stepNum <= maxSeenStep) {
            nextBtn.classList.remove('timer-active');
            const targetText = nextBtn.textContent.includes('Next') || nextBtn.textContent.includes('Complete')
                ? nextBtn.textContent
                : (stepNum === 1 ? "Next Phase" : nextBtn.textContent);

            // Clean up any remaining timer text if it somehow persisted
            if (nextBtn.textContent.includes('(')) {
                // Try to guess from total steps if possible, or just default to common lab terms
                nextBtn.textContent = (document.getElementById('step-' + (stepNum + 1)) ? "Next Phase" : "Complete Lab");
            }
            return;
        }

        // It's a brand new step! We don't update maxSeenStep until the timer finishes.

        // Capture the target text to restore (e.g., "Next Phase" or "Complete Lab")
        const targetText = nextBtn.textContent.includes('Next') || nextBtn.textContent.includes('Complete')
            ? nextBtn.textContent
            : "Next Phase";

        let timeLeft = 10;
        nextBtn.classList.add('timer-active');

        const update = () => {
            if (timeLeft > 0) {
                nextBtn.textContent = `Next (${timeLeft}s)`;
                timeLeft--;
                nextTimer = setTimeout(update, 1000);
            } else {
                nextBtn.textContent = targetText;
                nextBtn.classList.remove('timer-active');
                // Timer COMPLETED. Mark this step as "passed".
                if (stepNum > maxSeenStep) maxSeenStep = stepNum;
            }
        };
        update();
    }

    // Initial Trigger
    document.addEventListener('contextmenu', () => showBubble("Don't Copy! 🚫 Just learn & type."));
    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('button, a');
        if (target && target.getAttribute('href') === '../' && target.textContent.includes("Repository")) showBubble("Bye! Come back soon. 👋");
    });

    setTimeout(() => {
        showBubble(`Happy ${getGreeting()} Human! 🧭`, 5000);
    }, 4000);

    // Initial check for step 1
    startNextTimer();

    setTimeout(() => showBubble("Did you complete the assignments? 📝", 4000), 20000);

    // 8. Interaction Logic
    button.onmouseenter = () => { button.classList.add('blushing'); showBubble("Need help? Click me! 🧭", 5000); };
    button.onmouseleave = () => { button.classList.remove('blushing'); if (bubble.textContent.includes("Need help")) bubble.classList.remove('active'); };

    let clickCount = 0;
    let clickTimer;
    let isFirstOpen = true;
    button.onclick = () => {
        wakeUp();
        clickCount++;
        clearTimeout(clickTimer);
        if (clickCount >= 6) {
            button.classList.add('angry');
            showBubble("HEY! Stop that! 💢", 3000);
            setTimeout(() => { button.classList.remove('angry'); clickCount = 0; }, 3000);
        } else {
            chat.classList.toggle('active');
            bubble.classList.remove('active');
            if (chat.classList.contains('active')) {
                input.focus();
                if (isFirstOpen) {
                    setTimeout(() => {
                        addMessage(`Happy ${getGreeting()} Human! I'm Mr. Stuck. I'm dynamically reading the lab content as you progress. Ask me about the **current step**, **why** we are doing this, or for the **command syntax**! 🧭`, 'ai');
                    }, 300); // Small delay after opening for smoothness
                    isFirstOpen = false;
                }
            }
        }
        clickTimer = setTimeout(() => { clickCount = 0; }, 2000);
    };

    closeBtn.onclick = (e) => {
        e.stopPropagation();
        chat.classList.remove('active');
        wakeUp();
        clearTimeout(sleepTimer); // Don't sleep if chat is closed
    };

    // Navigation Listener
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, a');
        if (!target) return;

        // Block Next Phase 
        if (target.classList.contains('nav-btn-next') && target.classList.contains('timer-active')) {
            e.preventDefault();
            e.stopPropagation();
            showBubble("Don't rush to finish, read to learn! 📚", 4000);
            return;
        }

        // Normal Navigation
        // Reset timer on moving (if allowed)
        if (target.classList.contains('nav-btn-next') || target.classList.contains('nav-btn-prev')) {
            if (target.classList.contains('nav-btn-prev')) showBubble("Going back to re-check? Good idea! 🔍");
            setTimeout(startNextTimer, 500);
        }
    }, true);

    document.addEventListener('mousemove', (e) => {
        const eyes = document.querySelectorAll('.stuck-eye');
        eyes.forEach(eye => {
            const rect = eye.parentElement.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            const dx = e.clientX - x;
            const dy = e.clientY - y;
            const angle = Math.atan2(dy, dx);
            const distance = Math.min(5, Math.sqrt(dx * dx + dy * dy) / 40);
            eye.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
        });
    });

    // 9. Voice Typing Logic
    let recognition;
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            voiceBtn.classList.add('recording');
            input.placeholder = "Listening...";
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            input.value = transcript;
            input.placeholder = "What's this step about?";
            voiceBtn.classList.remove('recording');
        };

        recognition.onerror = () => {
            voiceBtn.classList.remove('recording');
            input.placeholder = "Try again...";
            setTimeout(() => { input.placeholder = "What's this step about?"; }, 2000);
        };

        recognition.onend = () => {
            voiceBtn.classList.remove('recording');
            input.placeholder = "What's this step about?";
        };

        voiceBtn.onclick = () => {
            if (voiceBtn.classList.contains('recording')) {
                recognition.stop();
            } else {
                recognition.start();
            }
        };
    } else {
        voiceBtn.style.display = 'none';
    }

    // 10. Chat Core
    const smartQuestions = ["What's this step about?", "Why are we doing this?", "Give me a pro tip", "Report a mistake"];

    function addMessage(text, type = 'ai') {
        const msg = document.createElement('div');
        msg.className = `stuck-msg ${type}`;
        messagesEl.appendChild(msg);

        if (type === 'ai') {
            isTyping = true;
            sendBtn.disabled = true;
            document.querySelectorAll('.stuck-option-btn').forEach(b => b.classList.add('disabled'));

            msg.innerHTML = '...'; // Indicator while "thinking"
            // Real chatbot feel: 0.5s delay before typing starts
            setTimeout(() => {
                msg.innerHTML = ''; // Clear indicator
                let i = 0;
                const typingSpeed = 10; // Fast and snappy

                function type() {
                    if (i < text.length) {
                        const currentText = text.substring(0, i + 1);
                        // Process markdown-like syntax while typing
                        let formatted = currentText
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\n\n/g, '<br><br>')
                            .replace(/\n/g, '<br>')
                            .replace(/```([\s\S]*?)```/g, '<code>$1</code>');

                        msg.innerHTML = formatted;
                        i++;
                        messagesEl.scrollTop = messagesEl.scrollHeight;
                        setTimeout(type, typingSpeed);
                    } else {
                        isTyping = false;
                        sendBtn.disabled = false;
                        document.querySelectorAll('.stuck-option-btn').forEach(b => b.classList.remove('disabled'));
                    }
                }
                type();
            }, 500);
        } else {
            msg.textContent = text;
            messagesEl.scrollTop = messagesEl.scrollHeight;
        }
    }

    function handleChat(text) {
        if (isTyping) return;
        text = text.trim();
        if (!text) return;
        addMessage(text, 'user');

        setTimeout(() => {
            const q = text.toLowerCase();
            let response;

            if (q.length === 1) {
                const witty = [
                    "A bit brief, don't you think? 😉",
                    "I've got a lot to say, how about you use some more words? ⌨️",
                    "One letter? Is that a secret code? 🕵️‍♂️",
                    "I need a few more clues than that, Human! 🧭",
                    "Is that the start of a very long sentence? I'll wait... ⏳"
                ];
                response = witty[Math.floor(Math.random() * witty.length)];
            } else if (text.length > 15 && !text.includes(' ')) {
                response = "Is that a secret encryption key or did you just sit on the keyboard? I'm guessing both. 👽";
            } else if (/\b(stupid|dumb|idiot|suck|hate|useless|boring|trash|garbage)\b/i.test(q)) {


                clearTimeout(suspiciousTimer);
                button.classList.add('suspicious');
                setTimeout(() => button.classList.remove('suspicious'), 2000);
                const defensive = [
                    "I'm rubber and you're glue! 🛡️ Let's stay focused on the code, shall we?",
                    "Ouch! My virtual feelings aren't hurt, but my logic is disappointed. 🤖💔",
                    "Is that a bug in your manners? 🐛 Let's debug those emotions and get back to learning.",
                    "Negative input detected. ⚠️ I'll ignore that and wait for something more constructive! 🧭"
                ];
                response = defensive[Math.floor(Math.random() * defensive.length)];
            } else if (/\b(hi|hello|hey|yo|sup)\b/i.test(q)) {
                response = "Hello there, Human! I'm Mr. Stuck. Ready to dive back into the learning journey? I'm here to make sure every concept sticks! 🧠🧭";
            } else if (/\b(thank|thanks|thx|appreciate)\b/i.test(q)) {
                response = "You're very welcome! My favorite thing is seeing that 'Aha!' moment. What else are we exploring today? 📚✨";
            } else if (/\b(bye|goodbye|see ya|later)\b/i.test(q)) {
                response = "Farewell! Keep that curious mind active. I'll be right here whenever you're ready to learn something new. 🎓👋";
            } else if (/\b(how|what|about|doing|tip|why|goal|mission)\b/i.test(q)) {
                response = getContextFromPage(text) || "I'm here to simplify! 🎓 I can explain the **purpose** of this step, the **command syntax**, or even give you a **pro-tip**. What part of the current phase is giving you trouble?";
            } else if (/\b(cool|awesome|great|nice)\b/i.test(q)) {
                response = "Right?! 🚀 Learning is the superpower. Let's keep this momentum going and see what else we can build!";
            } else if (q.includes('joke')) {
                response = "**Error 404**: Better joke not found than your existence. 💀 Just kidding! Let's get back to mastering this lab.";
            } else {
                response = getContextFromPage(text) || "I'm not exactly sure about that, but let's take it step by step! 🧭 Try asking me about the 'Why', 'Pro Tip', or the 'Command' for this phase.";
            }
            addMessage(response, 'ai');
        }, 100);
    }

    smartQuestions.forEach(q => {
        const btn = document.createElement('button');
        btn.className = 'stuck-option-btn';
        btn.textContent = q;
        
        if (q === "Report a mistake") {
            btn.style.borderColor = "#ff4d4d";
            btn.style.color = "#ff4d4d";
            btn.onmouseenter = () => { 
                btn.style.background = "#ff4d4d"; 
                btn.style.color = "#ffffff"; 
            };
            btn.onmouseleave = () => { 
                btn.style.background = "#ffffff"; 
                btn.style.color = "#ff4d4d"; 
            };
            btn.onclick = () => {
                const mailSubject = encodeURIComponent(`Mistake Report: Lab [${fileName.toUpperCase()}]`);
                const mailBody = encodeURIComponent(`Hello,\n\nI found a mistake in the ${fileName.toUpperCase()} lab.\n\n[Describe mistake here]\n\nDetails:\n- URL: ${window.location.href}`);
                window.location.href = `mailto:mistakes@undrstanding.example.com?subject=${mailSubject}&body=${mailBody}`;
            };
        } else {
            btn.onclick = () => handleChat(q);
        }
        optionsEl.appendChild(btn);
    });

    sendBtn.onclick = () => {
        handleChat(input.value);
        input.value = '';
        wakeUp();
    };
    input.onkeypress = (e) => {
        if (e.key === 'Enter') sendBtn.click();
        wakeUp();
    };
    input.oninput = () => {
        wakeUp();
        resetSleepTimer();

        // Show suspicious curious expression while typing
        setSuspicious(true);
        clearTimeout(suspiciousTimer);
        suspiciousTimer = setTimeout(() => setSuspicious(false), 1000);
    };
})();
