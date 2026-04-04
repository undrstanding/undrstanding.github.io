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
            background: #1e1e1e;
            color: #fff;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.9em;
        }

        .stuck-msg code:not(.inline-code) {
            display: block;
            padding: 10px;
            border-radius: 8px;
            margin: 8px 0;
            font-size: 11px;
            word-break: break-all;
            white-space: pre-wrap;
        }

        .stuck-msg code.inline-code {
            display: inline;
            background: rgba(0,0,0,0.05);
            color: #000;
            border: 1px solid #eee;
            margin: 0 2px;
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
    const intentPatterns = {
        greeting: /\b(hi|hello|hey|yo|sup|good morning|good afternoon|good evening|greetings|morning|afternoon|evening)\b/i,
        thanks: /\b(thank|thanks|thx|appreciate|grateful|helpful|ty)\b/i,
        positive: /\b(awesome|great|nice|cool|love|wow|amazing|sweet|brilliant)\b/i,
        bye: /\b(bye|goodbye|see ya|later|exit|quit|stop|done)\b/i,
        step: /\b(step|phase|doing|about|currently|current|what's up|mission|goal|task|objective|situation|status)\b/i,
        why: /\b(why|purpose|reason|concept|understand|philosophy|background|meaning|logic|thinking)\b/i,
        how: /\b(how|instruction|guide|way|method|process|syntax|command|code|terminal|shell|write|type|paste)\b/i,
        pro_tip: /\b(tip|pro|advice|suggestion|secret|trick|hack|advanced|extra|insider)\b/i,
        negative: /\b(stupid|dumb|idiot|suck|hate|useless|boring|trash|garbage|worst|fail|broken|mistake|error|fix)\b/i,
        identity: /\b(who are you|what are you|your name|identity|who made you|mr stuck)\b/i,
        next: /\b(next|coming up|future|after this|following|move on)\b/i,
        joke: /\b(joke|funny|laugh|humor)\b/i,
        mistake: /\b(mistake|error|wrong|bug|incorrect|issue|problem|fix|fault)\b/i
    };

    // Advanced Text Processing
    function cleanTaskText(text) {
        if (!text) return "working through the requirements";
        let t = text.trim();
        // Remove noise
        t = t.replace(/^[0-9\s.]+/, '');
        t = t.replace(/^(step|phase|task|mission|goal|objective)\s*([0-9:]*)\s*/i, '');
        t = t.replace(/^(welcome to|in this lab|we'll|we will|now let's|let's|in this session|this part involves|the goal is to|this is about)\s*/i, '');
        t = t.replace(/^(creating|building|designing|implementing|testing|adding)\s/i, (m) => m.slice(0, -3) + " "); 
        return t.charAt(0).toLowerCase() + t.slice(1).replace(/\.$/, '');
    }

    const universalWisdom = {
        'git-essentials': {
            core: "Git isn't just about saving files; it's about building a bulletproof history of your logic.",
            logic: "We're focusing on atomic operations here. Small, clear changes make for a clean repository later.",
            pro: "Try running `git log --oneline` after this step to see how professional your history is looking!"
        },
        'budget-tracker': {
            core: "State management is the heart of every financial app. If the data isn't clean, the charts are useless.",
            logic: "We're ensuring data persistence here so the user never loses their progress, even after a refresh.",
            pro: "Check the 'Application' tab in DevTools to see exactly how your data is being mapped into LocalStorage."
        },
        'weather-app': {
            core: "Async operations are the bridge between your code and the real world.",
            logic: "We're setting up a robust fetch cycle to handle network latency and potential API errors gracefully.",
            pro: "Open the 'Network' tab to see the JSON handshake between your app and the weather servers!"
        },
        'quick-tab-closer': {
            core: "Extensions give you control over the entire browser ecosystem.",
            logic: "We're leveraging the Chrome API to perform actions that a standard website simply isn't allowed to do.",
            pro: "Load your extension in 'Developer Mode' to see how background scripts keep running even when the popup is closed."
        },
        'html-blog-article': {
            core: "Semantics are the difference between a 'page' and an 'application'.",
            logic: "We're using descriptive tags so that search engines and screen readers can truly 'understand' your content.",
            pro: "Inspect your page and check the 'Accessibility' tree—see how your tags create a structured outline for the browser."
        }
    };

    function getContextFromPage(query) {
        const activeStep = document.querySelector('.step-content.active');
        if (!activeStep) return "I'm checking the coordinates... 🧭 Try selecting a lab step so I can get a lock on your current location!";

        const q = query.toLowerCase();
        const wisdom = universalWisdom[fileName] || { core: "Development is about building reliable systems, one step at a time.", logic: "We are focusing on core functionality here.", pro: "Keep your code clean and your logic transparent!" };

        // 1. Precise Data Harvesting
        const titleEl = activeStep.querySelector('h1, h2, .text-2xl, .text-xl');
        const phaseTitle = titleEl ? titleEl.textContent.trim().replace(/\s\s+/g, ' ') : "this stage";

        const descEl = activeStep.querySelector('p');
        const mission = cleanTaskText(descEl?.textContent);

        const actions = Array.from(activeStep.querySelectorAll('li'))
            .map(li => cleanTaskText(li.querySelector('span')?.textContent || li.textContent))
            .filter(t => t.length > 5);

        const codeBlocks = Array.from(activeStep.querySelectorAll('code, pre'))
            .map(c => c.textContent.trim())
            .filter(c => c.length > 2);

        // 2. Expert Synthesis Logic
        if (intentPatterns.step.test(q)) {
            const analyticalResponses = [
                `Looking at our progress in **${phaseTitle}**, we are primarily tasked to ${mission}. It's a vital step because ${wisdom.logic.toLowerCase()}`,
                `We've moved into **${phaseTitle}**. The core objective here is to ${mission}. Essentially, ${wisdom.core}`,
                `Scanning the requirements for **${phaseTitle}**... 🔍 We need to focus on ${mission}. This builds the necessary foundation for the more complex parts later!`
            ];
            
            let response = analyticalResponses[Math.floor(Math.random() * analyticalResponses.length)];
            
            if (actions.length > 0) {
                response += `\n\nTo move forward, ensure you focus on **${actions[0]}** and correctly **${actions[1] || 'implement the remaining logic'}**.`;
            }
            return response;
        }

        if (intentPatterns.why.test(q)) {
            const whyText = activeStep.querySelector('.why-box p, .why-box')?.textContent;
            let explainer = wisdom.core;
            if (whyText) explainer = whyText.replace(/Why this.*?\?/, '').trim();

            return `**Strategic Insight:**\n${explainer}\n\nBy mastering **${phaseTitle}**, you're learning how to build systems that are ${['scalable', 'robust', 'maintainable', 'efficient'][Math.floor(Math.random()*4)]}. ✨`;
        }

        if (intentPatterns.how.test(q)) {
            if (codeBlocks.length > 0) {
                return `The technical path for **${phaseTitle}** involves executing this command:\n\n\`\`\`\n${codeBlocks[0]}\n\`\`\`\n\nThis is the specific instruction the machine needs to ${mission}. ⌨️`;
            }
            if (actions.length > 0) {
                return `For **${phaseTitle}**, our approach should be systematic:\n\nFirst, we'll ${actions[0]}, then we proceed to ${actions[1] || 'finalize the stage'}. This ensures nothing gets missed! 🧭`;
            }
            return `Generally, ${wisdom.logic} Just take it step-by-step!`;
        }

        if (intentPatterns.pro_tip.test(q)) {
            return `**Lab Pro-Tip:**\n${wisdom.pro} 🚀\n\nSmall optimizations like this are what define a senior-level developer experience.`;
        }

        return null;
    }

    function handleChat(text) {
        if (isTyping) return;
        text = text.trim();
        if (!text) return;
        addMessage(text, 'user');

        setTimeout(() => {
            const q = text.toLowerCase();
            let response;
            const contextResponse = getContextFromPage(text);

            // Intent Handling
            if (intentPatterns.identity.test(q)) {
                response = "I'm **Mr. Stuck**, your strategic lab partner! 🧭 I analyze your project state in real-time to provide high-level insights, structural logic, and pro-level debugging tips. I'm here to ensure you don't just 'follow' the lab, but actually master it.";
            } else if (intentPatterns.negative.test(q)) {
                setSuspicious(true);
                setTimeout(() => setSuspicious(false), 2000);
                const politeSupport = [
                    "I hear you—development can be taxing! Let's strip away the noise and look at the core logic for **${document.querySelector('.step-content.active h1,h2')?.textContent || 'this step'}** together. 🧭",
                    "Feeling the pressure? That's just the 'Learning Curve' in action! 📈 Let's simplify and get back to the basics.",
                    "If something isn't clicking, it's my job to help bridge that gap. Let's redirect our focus and solve this logically! 🤝"
                ];
                response = politeSupport[Math.floor(Math.random() * politeSupport.length)];
            } else if (intentPatterns.greeting.test(q)) {
                response = `Happy ${getGreeting()} Developer! 🧭 Mr. Stuck here, ready to provide context, commands, and structural analysis for your current project. What's on your mind?`;
            } else if (intentPatterns.thanks.test(q)) {
                response = "Glad I could help! Seeing the logic align is the best part of the build. What's our next objective? 📚✨";
            } else if (intentPatterns.positive.test(q)) {
                response = "Exactly! 🚀 Once you master the underlying principles, everything starts to feel like second nature. Let's keep building!";
            } else if (intentPatterns.joke.test(q)) {
                const wholesomeJokes = [
                    "Why did the developer go broke? Because he used up all his cache! 💰",
                    "What's a programmer's favorite place to hang out? The Foo Bar! 🍹",
                    "How many developers does it take to fix a bug? None, that's just a new feature! 💡"
                ];
                response = wholesomeJokes[Math.floor(Math.random() * wholesomeJokes.length)];
            } else if (intentPatterns.next.test(q)) {
                response = "We're close to a major milestone! 🏁 Stay focused on the current structural requirements, and you'll be perfectly set up for the next phase.";
            } else if (intentPatterns.mistake.test(q)) {
                response = "Spotted an inconsistency? 🐛 I strive for peak precision, but technology moves fast. Please use the **'Report a mistake'** button below to let our team maintain the lab's quality!";
            } else if (q.length === 1) {
                response = "A bit concise, aren't we? 😉 Provide a bit more context so I can analyze the right part of the project for you!";
            } else {
                response = contextResponse || "I'm synthesizing a response... 🧭 Currently, it looks like we're focused on high-level project structure. Can I provide a 'Why', a 'Pro Tip', or a specific 'Command' for this part?";
            }

            addMessage(response, 'ai');
        }, 300);
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
                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                            .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
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
                window.location.href = `mailto:project.undrstanding@gmail.com?subject=${mailSubject}&body=${mailBody}`;
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
