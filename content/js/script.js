/**
 * Service Worker Registration
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW Registered'))
            .catch(err => console.log('SW Registration Failed', err));
    });
}

/**
 * Global Page Loading Animation
 * Creates a white overlay with a logo that splits to reveal "Undrstanding"
 */
(function () {
    const path = window.location.pathname;

    // Pages where loader should be hidden / logic should not run
    const isIndex = path.endsWith('index.html') || path === '/' || path.endsWith('/');
    const isFlashcards = path.endsWith('flashcards.html');

    if (isIndex || isFlashcards) {
        // Hide loader if it exists
        const loader = document.getElementById("loader"); // or your loader selector
        if (loader) loader.style.display = "none";
        return;
    }

    // 1. Create and Inject Styles
    const style = document.createElement('style');
    style.innerHTML = `
        #global-loader {
            position: fixed;
            inset: 0;
            background: #ffffff;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.6s ease-out, visibility 0.6s;
            overflow: hidden;
            pointer-events: all;
        }

        #global-loader.fade-out {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
        }

        .loader-content {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
        }

        .loader-logo {
            width: 80px;
            height: 80px;
            z-index: 2;
            transition: transform 1s cubic-bezier(0.77, 0, 0.175, 1);
            border-radius: 50%;
        }

        .loader-text {
            position: absolute;
            font-family: 'Inter', sans-serif;
            font-size: 3rem;
            font-weight: 900;
            letter-spacing: -0.04em;
            color: #000;
            opacity: 0;
            white-space: nowrap;
            z-index: 1;
            transform: translateX(0);
            transition: all 1s cubic-bezier(0.77, 0, 0.175, 1);
        }

        #global-loader.animating .loader-logo {
            transform: translateX(-140px);
        }

        #global-loader.animating .loader-text {
            opacity: 1;
            transform: translateX(70px);
        }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
            .loader-logo {
                width: 60px;
                height: 60px;
                border-radius: 50%;
            }
            .loader-text {
                font-size: 1.5rem;
            }
            #global-loader.animating .loader-logo {
                transform: translateX(-85px);
            }
            #global-loader.animating .loader-text {
                transform: translateX(45px);
            }
        }

        /* Prevent scrolling while loading */
        body.loading-active {
            overflow: hidden !important;
        }
    `;
    document.head.appendChild(style);

    // 2. Create and Inject HTML
    const loader = document.createElement('div');
    loader.id = 'global-loader';

    // Robust path detection using favicon link
    let logoPath = '../assests/undrlogo.svg'; // Default for subpages
    const iconLink = document.querySelector('link[rel="icon"]');
    if (iconLink) {
        logoPath = iconLink.getAttribute('href');
    }

    loader.innerHTML = `
        <div class="loader-content">
            <img src="${logoPath}" class="loader-logo" alt="Logo">
            <span class="loader-text">Undrstanding</span>
        </div>
    `;

    // Inject as early as possible
    if (document.body) {
        document.body.appendChild(loader);
        document.body.classList.add('loading-active');
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            document.body.appendChild(loader);
            document.body.classList.add('loading-active');
        });
    }

    // 3. Trigger Animation State with double RAF for reliability
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            loader.classList.add('animating');
        });
    });

    // 4. Handle Page Load
    let hasHidden = false;
    const startTime = window.performance?.now?.() || Date.now();

    function hideLoader() {
        if (hasHidden) return;
        hasHidden = true;

        // Minimum display time (1.2s total for animation to breathe)
        const MIN_TIME = 1200;
        const now = window.performance?.now?.() || Date.now();
        const elapsed = now - startTime;
        const remaining = Math.max(0, MIN_TIME - elapsed);

        setTimeout(() => {
            loader.classList.add('fade-out');
            document.body.classList.remove('loading-active');
            setTimeout(() => {
                if (loader.parentNode) loader.parentNode.removeChild(loader);
            }, 800);
        }, remaining);
    }

    // Failsafe: if page takes too long to load, hide anyway (reduced to 3s for better UX)
    const failsafe = setTimeout(hideLoader, 3000);

    if (document.readyState === 'complete') {
        hideLoader();
    } else {
        window.addEventListener('load', () => {
            hideLoader();
        });
    }
})();

class CertificateGenerator {
    constructor(canvasId, courseName) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.courseName = courseName;
        this.logo = new Image();
        this.logo.src = '../assests/undrlogo.svg'; // Path relative to the html file in content/
        this.logoLoaded = false;

        this.logo.onload = () => {
            this.logoLoaded = true;
            this.generate('');
        };
    }

    generate(userName, date) {
        // Format date as "DD / Mon / YYYY" if not provided
        if (!date) {
            const d = new Date();
            const day = d.getDate();
            const month = d.toLocaleString('default', { month: 'short' });
            const year = d.getFullYear();
            date = `${day} / ${month} / ${year}`;
        }
        if (!this.canvas) return;

        // Set canvas resolution for high quality
        const scale = 2; // Retina/High res
        this.canvas.width = 1200 * scale;
        this.canvas.height = 800 * scale;
        this.canvas.style.width = '100%';
        this.canvas.style.height = 'auto'; // Maintain aspect ratio

        this.ctx.scale(scale, scale);
        const w = 1200;
        const h = 800;

        // Clear
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(0, 0, w, h);

        // Security Pattern (Sine Wave Interference)
        this.ctx.globalAlpha = 0.5;
        this.drawWavePattern(w, h, "#e5e7eb");
        this.ctx.globalAlpha = 1.0;

        // Border
        this.ctx.lineWidth = 20;
        this.ctx.strokeStyle = "#000000";
        this.ctx.strokeRect(40, 40, w - 80, h - 80);

        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(65, 65, w - 130, h - 130);


        // Content
        this.ctx.textAlign = "center";

        // Logo
        if (this.logoLoaded) {
            // Draw logo centered at top
            const logoW = 80;
            const logoH = 80;
            this.ctx.drawImage(this.logo, w / 2 - logoW / 2, 100, logoW, logoH);
        }

        // Title
        this.ctx.fillStyle = "#000000";
        this.ctx.font = "bold 60px 'Inter', sans-serif";
        this.ctx.fillText("CERTIFICATE", w / 2, 250);

        this.ctx.font = "30px 'Inter', sans-serif";
        this.ctx.fillText("OF COMPLETION", w / 2, 290);

        // Body
        this.ctx.font = "italic 24px 'Inter', serif";
        this.ctx.fillStyle = "#666666";
        this.ctx.fillText("This is to certify that", w / 2, 360);

        // Name
        if (userName) {
            this.ctx.font = "bold 50px 'Inter', sans-serif";
            this.ctx.fillStyle = "#000000";
            this.ctx.fillText(userName, w / 2, 430);
        } else {
            // Placeholder line if no name
            this.ctx.beginPath();
            this.ctx.moveTo(w / 2 - 200, 430);
            this.ctx.lineTo(w / 2 + 200, 430);
            this.ctx.strokeStyle = "#dddddd";
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        // Underline Name
        this.ctx.beginPath();
        this.ctx.moveTo(w / 2 - 200, 445);
        this.ctx.lineTo(w / 2 + 200, 445);
        this.ctx.strokeStyle = "#000000";
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        this.ctx.font = "italic 24px 'Inter', serif";
        this.ctx.fillStyle = "#666666";
        this.ctx.fillText("has completed the interactive learning series:", w / 2, 500);

        // Course
        this.ctx.font = "bold 40px 'JetBrains Mono', 'Roboto Mono', monospace";
        this.ctx.fillStyle = "#000000";
        this.ctx.fillText(this.courseName, w / 2, 560);

        // Footer
        this.ctx.font = "bold 20px 'JetBrains Mono', 'Roboto Mono', monospace";
        this.ctx.fillStyle = "#333333";
        this.ctx.fillText("UNDRSTANDING", w / 2, 700);

        this.ctx.font = "14px 'Inter', sans-serif";
        this.ctx.fillStyle = "#666666";
        this.ctx.fillText("EDUCATIONAL REPOSITORY", w / 2, 725);

        // Date and Sig
        this.ctx.textAlign = "left";
        this.ctx.font = "18px 'Inter', sans-serif";
        this.ctx.fillText(`Date: ${date}`, 100, 650);

        // Generate a pseudo-unique ID using Timestamp (base36) + Random (base36)
        // This ensures uniqueness unless two people generate it at the exact same millisecond with the exact same random seed.

        let uniqueId;
        // Check if name has changed or if it's the first run
        if (this.lastUserName !== userName || !this.lastId) {
            uniqueId = `UNDR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
            this.lastId = uniqueId;
            this.lastUserName = userName;
        } else {
            uniqueId = this.lastId;
        }

        this.ctx.textAlign = "right";
        this.ctx.fillText(`ID: ${uniqueId}`, w - 100, 650);
    }


    /**
     * Draws a Sine Wave Interference pattern
     * Mimics banknote security textures
     */
    drawWavePattern(w, h, color) {
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = color;

        const lines = 60;
        const step = h / lines;

        for (let i = 0; i < lines; i++) {
            this.ctx.beginPath();
            let y = i * step; // Base Y position

            for (let x = 0; x <= w; x += 5) {
                // Complex wave: sum of two sines with different frequencies
                const offset = Math.sin(x * 0.02 + i * 0.1) * 20 + Math.sin(x * 0.05) * 10;

                if (x === 0) this.ctx.moveTo(x, y + offset);
                else this.ctx.lineTo(x, y + offset);
            }
            this.ctx.stroke();
        }
    }

    download(filename = 'certificate.png') {
        try {
            const dataUrl = this.canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = filename;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error("Download failed:", e);
            alert("Download failed. If you are opening this file directly from your computer (file://), browser security blocks saving images with external assets. Please view this project using a local server (e.g., Live Server in VS Code) or check the console for details.");
        }
    }
}

class BadgeGenerator {
    constructor(canvasId, seriesName, labName) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.seriesName = seriesName || "LAB SERIES";
        this.labName = labName || "UNNAMED LAB";
        this.logo = new Image();
        this.logo.src = '../assests/undrlogo.svg';
        this.logoLoaded = false;

        this.logo.onload = () => {
            this.logoLoaded = true;
            this.generate();
        };
    }

    generate() {
        if (!this.canvas) return;

        const scale = 2;
        const size = 600;
        this.canvas.width = size * scale;
        this.canvas.height = size * scale;
        this.canvas.style.width = 'min(280px, 70vw)';
        this.canvas.style.height = 'min(280px, 70vw)';

        this.ctx.scale(scale, scale);
        const center = size / 2;

        // Clear
        this.ctx.clearRect(0, 0, size, size);

        // Frame dimensions
        const radius = 64;
        const rectSize = 540;
        const x = center - rectSize / 2;
        const y = center - rectSize / 2;

        // 1. Base Rounded Square Background
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.arcTo(x + rectSize, y, x + rectSize, y + rectSize, radius);
        this.ctx.arcTo(x + rectSize, y + rectSize, x, y + rectSize, radius);
        this.ctx.arcTo(x, y + rectSize, x, y, radius);
        this.ctx.arcTo(x, y, x + rectSize, y, radius);
        this.ctx.closePath();
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fill();

        // 2. Header Color Accent (#abc2fe)
        this.ctx.save();
        // Clip to rounded square
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.arcTo(x + rectSize, y, x + rectSize, y + rectSize, radius);
        this.ctx.arcTo(x + rectSize, y + rectSize, x, y + rectSize, radius);
        this.ctx.arcTo(x, y + rectSize, x, y, radius);
        this.ctx.arcTo(x, y, x + rectSize, y, radius);
        this.ctx.closePath();
        this.ctx.clip();

        // Fill upper half (above logo area)
        // Fill upper half (above logo area)
        const headerBottom = center - 70;
        this.ctx.fillStyle = "#abc2fe";
        this.ctx.fillRect(x, y, rectSize, headerBottom - y);
        this.ctx.restore();

        // 3. Main Thinner Border
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.arcTo(x + rectSize, y, x + rectSize, y + rectSize, radius);
        this.ctx.arcTo(x + rectSize, y + rectSize, x, y + rectSize, radius);
        this.ctx.arcTo(x, y + rectSize, x, y, radius);
        this.ctx.arcTo(x, y, x + rectSize, y, radius);
        this.ctx.closePath();
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = "#000000";
        this.ctx.stroke();

        // 4. Content Area
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "#111111";

        // UNDRSTANDING (Top)
        this.ctx.font = "700 12px 'JetBrains Mono', monospace";
        this.drawTrackedText("UNDRSTANDING", center, y + 60, 6);

        // Series Name
        this.ctx.font = "500 24px 'Inter', sans-serif";
        this.drawTrackedText(this.seriesName.toUpperCase(), center, center - 110, 5);

        // Logo (Centered)
        if (this.logoLoaded) {
            const logoSize = 140;
            this.ctx.drawImage(this.logo, center - logoSize / 2, center - logoSize / 2, logoSize, logoSize);
        }

        // Lab Name
        this.ctx.font = "800 34px 'Inter', sans-serif";
        this.drawTrackedText(this.labName.toUpperCase(), center, center + 130, -1);

        // LAB COMPLETION (Bottom)
        this.ctx.font = "700 13px 'JetBrains Mono', monospace";
        this.drawTrackedText("LAB COMPLETION", center, y + rectSize - 55, 6);
    }

    drawTrackedText(text, x, y, tracking) {
        let currentX = x;
        const totalWidth = this.ctx.measureText(text).width + (text.length - 1) * tracking;
        currentX = x - totalWidth / 2;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            this.ctx.fillText(char, currentX + this.ctx.measureText(char).width / 2, y);
            currentX += this.ctx.measureText(char).width + tracking;
        }
    }

    download(filename = 'undrlib-badge.png') {
        try {
            const dataUrl = this.canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = filename;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error("Download failed:", e);
        }
    }
}

class QuizManager {
    constructor(containerId, questions, onSuccess) {
        this.container = document.getElementById(containerId);
        this.questions = questions;
        this.onSuccess = onSuccess;
        this.score = 0;
        this.isStarted = false;
        this.render();
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = '';

        if (!this.isStarted) {
            this.renderIntro();
            return;
        }

        // Animation Wrapper
        const fadeWrapper = document.createElement('div');
        fadeWrapper.className = "transition-opacity duration-700 ease-out opacity-0";

        // Header
        const header = document.createElement('div');
        header.className = "mb-8";
        header.innerHTML = `
            <h3 class="text-xl font-medium mb-2">Knowledge Check</h3>
            <p class="text-sm text-gray-600">Answer all ${this.questions.length} questions correctly to unlock your certificate. Score: <span id="quiz-score" class="font-bold">0</span>/${this.questions.length}</p>
        `;
        fadeWrapper.appendChild(header);

        // Questions
        const qList = document.createElement('div');
        qList.className = "space-y-6";

        this.questions.forEach((q, index) => {
            const qEl = document.createElement('div');
            qEl.className = "border border-gray-200 p-4 rounded bg-white hover:shadow-sm transition-shadow";
            qEl.id = `q-${index}`;

            const questionText = document.createElement('p');
            questionText.className = "font-medium text-sm mb-3";
            questionText.textContent = `${index + 1}. ${q.question}`;
            qEl.appendChild(questionText);

            const optionsDiv = document.createElement('div');
            optionsDiv.className = "space-y-2";

            q.options.forEach((opt, optIndex) => {
                const label = document.createElement('label');
                label.className = "flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 p-2 rounded";

                const input = document.createElement('input');
                input.type = "radio";
                input.name = `q-${index}`;
                input.value = optIndex;
                input.className = "accent-current"; // Uses text color or explicit accent-color style
                input.style.accentColor = "var(--accent)";

                const span = document.createElement('span');
                span.textContent = opt;

                label.appendChild(input);
                label.appendChild(span);
                optionsDiv.appendChild(label);
            });

            qEl.appendChild(optionsDiv);
            qList.appendChild(qEl);
        });

        fadeWrapper.appendChild(qList);

        // Submit Button
        const btnContainer = document.createElement('div');
        btnContainer.className = "mt-8";
        const submitBtn = document.createElement('button');
        submitBtn.textContent = "Submit Answers";
        submitBtn.className = "btn btn-primary w-full md:w-auto px-6 py-2 rounded font-medium transition-colors shadow-sm";
        submitBtn.onclick = () => this.checkAnswers();

        // Status Message
        const statusMsg = document.createElement('p');
        statusMsg.id = "quiz-status";
        statusMsg.className = "text-sm mt-4 font-bold hidden";

        btnContainer.appendChild(submitBtn);
        btnContainer.appendChild(statusMsg);
        fadeWrapper.appendChild(btnContainer);

        this.container.appendChild(fadeWrapper);

        // Trigger Fade In
        requestAnimationFrame(() => {
            fadeWrapper.classList.remove('opacity-0');
        });
    }

    renderIntro() {
        const wrapper = document.createElement('div');
        wrapper.className = "text-center py-12 px-4 transition-all duration-500 ease-in-out opacity-100 transform translate-y-0";

        const title = document.createElement('h3');
        title.className = "text-xl font-bold mb-4";
        title.textContent = "Test Your Knowledge";

        const desc = document.createElement('p');
        desc.className = "text-gray-600 text-sm mb-8 max-w-md mx-auto";
        desc.textContent = `Ready to prove your skills? Take the certification quiz. Score ${this.questions.length}/${this.questions.length} to unlock your personalized certificate of completion.`;

        const btn = document.createElement('button');
        btn.textContent = "Take Certification Quiz";
        // Removed shadow classes, removed bg-black
        btn.className = "btn btn-primary text-white px-8 py-3 rounded-full transition-all transform hover:-translate-y-1";

        // Use Accent Color
        btn.style.backgroundColor = "var(--accent, #000)";
        btn.style.borderColor = "var(--accent, #000)";

        btn.onclick = () => {
            // Animate Out
            wrapper.classList.remove('opacity-100', 'translate-y-0');
            wrapper.classList.add('opacity-0', '-translate-y-4'); // Fade up and out

            setTimeout(() => {
                this.isStarted = true;
                this.render();
            }, 500);
        };

        wrapper.appendChild(title);
        wrapper.appendChild(desc);
        wrapper.appendChild(btn);

        this.container.appendChild(wrapper);
    }

    checkAnswers() {
        let correctCount = 0;
        let allAnswered = true;

        this.questions.forEach((q, index) => {
            const selected = document.querySelector(`input[name="q-${index}"]:checked`);
            const qEl = document.getElementById(`q-${index}`);

            // Reset styles
            qEl.classList.remove('border-red-500', 'border-green-500', 'bg-red-50', 'bg-green-50');

            if (!selected) {
                allAnswered = false;
                qEl.classList.add('border-yellow-500'); // Highlight unanswered
            } else {
                if (parseInt(selected.value) === q.answer) {
                    correctCount++;
                    qEl.classList.add('border-green-500', 'bg-green-50');
                } else {
                    qEl.classList.add('border-red-500', 'bg-red-50');
                }
            }
        });

        const scoreDisplay = document.getElementById('quiz-score');
        scoreDisplay.textContent = correctCount;

        const statusMsg = document.getElementById('quiz-status');
        statusMsg.classList.remove('hidden');

        if (!allAnswered) {
            statusMsg.textContent = "Please answer all questions.";
            statusMsg.className = "text-sm mt-4 font-bold text-yellow-600";
            return;
        }

        if (correctCount === this.questions.length) {
            statusMsg.textContent = "Perfect Score! Your certificate has been unlocked below.";
            statusMsg.className = "text-sm mt-4 font-bold text-green-600";
            if (this.onSuccess) this.onSuccess();

            // Disable inputs
            const inputs = this.container.querySelectorAll('input');
            inputs.forEach(i => i.disabled = true);
            const btn = this.container.querySelector('button');
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            statusMsg.textContent = `You scored ${correctCount}/${this.questions.length}. You need a perfect score to unlock the certificate. Please try again.`;
            statusMsg.className = "text-sm mt-4 font-bold text-red-600";
        }
    }
}

class InlineQuiz {
    /**
     * @param {string} containerId - The ID of the div to render the quiz in.
     * @param {object} data - { question, options, answer, explanation }
     */
    constructor(containerId, data) {
        this.container = document.getElementById(containerId);
        this.data = data;
        this.hasAnswered = false;

        if (!this.container) {
            console.error(`InlineQuiz: Container #${containerId} not found.`);
            return;
        }

        this.init();
    }

    init() {
        // Create main card
        this.card = document.createElement('div');
        this.card.className = 'my-8 border-l-4 p-6 rounded-r-lg';
        this.card.style.borderColor = 'var(--accent, #3b82f6)';
        this.card.style.backgroundColor = 'color-mix(in srgb, var(--accent, #3b82f6), transparent 95%)';

        // Header
        const header = document.createElement('div');
        header.className = 'text-xs font-bold uppercase tracking-wider mb-2';
        header.style.color = 'var(--accent, #3b82f6)';
        header.textContent = 'Quick Check';
        this.card.appendChild(header);

        // Question
        const questionText = document.createElement('h4');
        questionText.className = 'text-lg font-medium text-gray-900 mb-4';
        questionText.textContent = this.data.question;
        this.card.appendChild(questionText);

        // Options Container
        this.optionsContainer = document.createElement('div');
        this.optionsContainer.className = 'space-y-2';

        this.data.options.forEach((opt, index) => {
            const btn = document.createElement('button');
            // Default border is light gray to be neutral, hover will be accent
            btn.className = 'w-full text-left p-3 rounded bg-white border border-gray-200 transition-colors text-sm text-gray-700';
            btn.textContent = opt;

            // Dynamic Hover Effect
            btn.onmouseenter = () => {
                if (!this.hasAnswered) {
                    btn.style.borderColor = 'var(--accent, #3b82f6)';
                    btn.style.backgroundColor = 'color-mix(in srgb, var(--accent, #3b82f6), transparent 95%)';
                }
            };
            btn.onmouseleave = () => {
                if (!this.hasAnswered) {
                    btn.style.borderColor = ''; // Revert to class
                    btn.style.backgroundColor = ''; // Revert to class
                }
            };

            btn.onclick = () => this.handleSelection(index, btn);
            this.optionsContainer.appendChild(btn);
        });
        this.card.appendChild(this.optionsContainer);

        // Feedback Container (Hidden initially)
        this.feedback = document.createElement('div');
        this.feedback.className = 'mt-4 text-sm hidden';
        this.card.appendChild(this.feedback);

        this.container.appendChild(this.card);
    }

    handleSelection(selectedIndex, clickedBtn) {
        if (this.hasAnswered) return;
        this.hasAnswered = true;

        const isCorrect = selectedIndex === this.data.answer;
        const correctBtn = this.optionsContainer.children[this.data.answer];

        // Reset any hover styles first
        Array.from(this.optionsContainer.children).forEach(btn => {
            btn.onmouseenter = null;
            btn.onmouseleave = null;
            btn.style.borderColor = '';
            btn.style.backgroundColor = '';
        });

        // Style the clicked button
        if (isCorrect) {
            clickedBtn.className = 'w-full text-left p-3 rounded bg-green-50 border border-green-500 text-green-900 font-medium flex justify-between items-center';
            clickedBtn.innerHTML += `
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>`;
        } else {
            clickedBtn.className = 'w-full text-left p-3 rounded bg-red-50 border border-red-500 text-red-900 flex justify-between items-center';
            clickedBtn.innerHTML += `
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>`;

            // Highlight correct one too
            correctBtn.className = 'w-full text-left p-3 rounded bg-green-50 border border-green-500 text-green-900 font-medium flex justify-between items-center';
            correctBtn.innerHTML += `
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>`;
        }

        // Show feedback
        this.feedback.className = `mt-4 text-sm p-3 rounded ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`;
        // For incorrect, we just use gray/neutral for the box to avoid too much red, 
        // OR we can use the accent color for a "Info" feel?
        // Let's stick to the previous logic but maybe make the "Incorrect" box use the accent color for the "Explanation" part if desired. 
        // Previously it was blue for incorrect. Let's make it Accent for incorrect (neutral info).

        if (!isCorrect) {
            this.feedback.style.backgroundColor = 'color-mix(in srgb, var(--accent, #3b82f6), transparent 90%)';
            this.feedback.style.color = 'var(--text-main)';
            // We can also set border if we want
        }

        const feedbackTitle = isCorrect ? 'Correct!' : 'Incorrect.';
        this.feedback.innerHTML = `<strong>${feedbackTitle}</strong> ${this.data.explanation}`;
        this.feedback.classList.remove('hidden');
    }
}

/**
 * Eye Care Reminder System (20-20-20 Rule)
 * 
 * Logic:
 * - Tracks cumulative time across pages using localStorage.
 * - Every 20 minutes (20 * 60 * 1000 ms), triggers a modal.
 * - Modal enforces a 20-second break with a countdown.
 */

(function () {
    // Configuration
    const STORAGE_KEY = 'undrlib_eye_care_start_time';
    const INTERVAL_MS = 20 * 60 * 1000; // 20 minutes
    const DURATION_SEC = 20; // 20 seconds duration

    // State
    let timerInterval = null;

    // --- Core Logic ---

    function initEyeCare() {
        // Initialize start time if not present
        if (!sessionStorage.getItem(STORAGE_KEY)) {
            resetTimer();
        }

        // Check time every second
        setInterval(checkTime, 1000);
    }

    function checkTime() {
        // If modal is already open, don't check
        if (document.getElementById('eye-care-modal')) return;

        const startTime = parseInt(sessionStorage.getItem(STORAGE_KEY) || Date.now());
        const elapsed = Date.now() - startTime;

        if (elapsed >= INTERVAL_MS) {
            showModal();
        }
    }

    function resetTimer() {
        sessionStorage.setItem(STORAGE_KEY, Date.now().toString());
    }

    // --- UI Construction ---

    function showModal() {
        // Prevent multiple modals
        if (document.getElementById('eye-care-modal')) return;

        // Play a subtle notification sound (optional, but good for accessibility)
        // const audio = new Audio('path/to/notification.mp3'); // omitted for now to keep it simple

        // Create Modal HTML
        const modal = document.createElement('div');
        modal.id = 'eye-care-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(0, 0, 0, 0.95);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(5px);
            opacity: 0;
            transition: opacity 0.5s ease;
        `;

        modal.innerHTML = `
            <div class="text-center text-white px-4 max-w-md animate-fade-in-up">
                <div class="mb-6 flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </div>
                <h2 class="text-3xl font-bold mb-2 tracking-tight">Time to Rest Your Eyes</h2>
                <p class="text-gray-300 text-lg mb-8 font-light">
                    Follow the <strong>20-20-20 Rule</strong>:<br>
                    Every 20 minutes, look at something 20 feet away for 20 seconds.
                </p>
                
                <div class="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center">
                    <svg class="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="60" stroke="currentColor" stroke-width="4" fill="transparent" class="text-gray-700" />
                        <circle id="eye-timer-circle" cx="64" cy="64" r="60" stroke="currentColor" stroke-width="4" fill="transparent" class="text-green-500 transition-all duration-1000 ease-linear" stroke-dasharray="377" stroke-dashoffset="0" />
                    </svg>
                    <span id="eye-timer-text" class="absolute text-4xl font-mono font-bold">20</span>
                </div>

                <div class="space-y-3">
                    <p id="eye-care-status" class="text-sm text-gray-400 uppercase tracking-widest animate-pulse">Relaxing...</p>
                    <button id="eye-care-dismiss" class="hidden px-8 py-3 bg-white text-black font-bold uppercase text-xs tracking-widest hover:bg-gray-200 transition-colors rounded-sm">
                        I'm Ready to Continue
                    </button>
                    <!-- Early dismiss link if needed -->
                    <button id="eye-care-skip" class="block w-full text-[10px] text-gray-600 hover:text-gray-400 uppercase tracking-widest mt-8 transition-colors">
                        Skip Break
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Animate In
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
        });

        // Start Countdown
        let remaining = DURATION_SEC;
        const timerText = document.getElementById('eye-timer-text');
        const timerCircle = document.getElementById('eye-timer-circle');
        const dismissBtn = document.getElementById('eye-care-dismiss');
        const skipBtn = document.getElementById('eye-care-skip');
        const statusText = document.getElementById('eye-care-status');
        const fullDiff = 2 * Math.PI * 60; // r=60

        // Handle Skip
        skipBtn.addEventListener('click', () => {
            closeModal();
            // Reset but maybe snooze? For now just standard reset.
            resetTimer();
        });

        // Handle Dismiss (only available after timer)
        dismissBtn.addEventListener('click', () => {
            closeModal();
            resetTimer();
        });

        timerInterval = setInterval(() => {
            remaining--;
            timerText.textContent = remaining;

            // Update Circle (Progress bar)
            const offset = fullDiff - (remaining / DURATION_SEC) * fullDiff;
            timerCircle.style.strokeDashoffset = offset;

            if (remaining <= 0) {
                clearInterval(timerInterval);
                timerText.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`; // SVG Checkmark
                statusText.textContent = "Great job!";
                statusText.classList.remove('animate-pulse');
                dismissBtn.classList.remove('hidden');
                skipBtn.classList.add('hidden');

                // Play pleasant chime? (omitted)
            }
        }, 1000);
    }

    function closeModal() {
        const modal = document.getElementById('eye-care-modal');
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                if (modal.parentNode) modal.parentNode.removeChild(modal);
            }, 500);
        }
        if (timerInterval) clearInterval(timerInterval);
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEyeCare);
    } else {
        initEyeCare();
    }

})();

/**
 * Content Protection
 * Disables text selection, copying, and context menu.
 */
(function () {
    // 1. Disable Selection via CSS injection
    const style = document.createElement('style');
    style.innerHTML = `
        /* Disable selection globally */
        body {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }

        /* Allow selection in inputs and textareas so users can type */
        input, textarea {
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
        }
    `;
    document.head.appendChild(style);

    // 2. Disable Copy/Cut/Paste/Drag events
    ['copy', 'cut', 'dragstart'].forEach(event => {
        document.addEventListener(event, (e) => {
            e.preventDefault();
        });
    });

    // 3. Disable Context Menu
    document.addEventListener('contextmenu', (e) => e.preventDefault());
})();

// Sidebar Highlighting Logic
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('aside .nav-link');

    // Create an intersection observer to track active sections
    // rootMargin: '-20% 0px -60% 0px' creates a "focus area" near the top of the viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Get the ID of the section coming into view
                const id = entry.target.getAttribute('id');

                // Find matching link
                const activeLink = document.querySelector(`aside .nav-link[href="#${id}"]`);

                if (activeLink) {
                    // Remove active classes from all links
                    navLinks.forEach(link => {
                        link.classList.remove('active', 'text-black', 'font-medium');
                        // Re-add muted text if it was there by default (usually implicit or class)
                        link.classList.add('text-gray-500'); // Assuming default is text-muted/gray-500
                    });

                    // Add active styling
                    activeLink.classList.add('active', 'text-black', 'font-medium');
                    activeLink.classList.remove('text-gray-500');
                }
            }
        });
    }, {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    });

    // Observe all sections targeted by sidebar links
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            const section = document.getElementById(href.substring(1));
            if (section) {
                observer.observe(section);
            }
        }
    });
});


// Dynamic Floating Search Widget
document.addEventListener('DOMContentLoaded', () => {
    // Exclude index page, flashcards page, and all lab pages
    if (document.getElementById('site-search') ||
        document.getElementById('stack-container') ||
        window.location.pathname.includes('/labs/')) return;

    // 1. Create Widget UI
    const widget = document.createElement('div');
    widget.id = 'floating-search';
    widget.className = 'fixed bottom-6 right-6 z-[100] flex flex-col items-end font-sans';

    // HTML Structure
    widget.innerHTML = `
        <div id="search-bar" class="hidden fixed bottom-12 left-1/2 transform -translate-x-1/2 z-[101] flex items-center bg-white/80 backdrop-blur-md shadow-2xl border-2 border-black rounded-full px-4 sm:px-5 py-2.5 sm:py-3 mb-0 transition-all origin-bottom scale-90 opacity-0 w-[92vw] sm:w-auto max-w-lg">
            <input type="text" id="global-search-input" placeholder="Search page..." 
                class="flex-1 min-w-0 text-sm outline-none bg-transparent placeholder-gray-400 text-gray-700 font-medium">
            <span id="match-counter" class="text-xs text-gray-400 font-mono mx-3 w-12 text-center hidden">0/0</span>
            <div class="flex items-center gap-1 border-l border-gray-200 pl-3">
                <button id="prev-match" class="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 disabled:opacity-30 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" /></svg>
                </button>
                <button id="next-match" class="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 disabled:opacity-30 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <button id="close-search" class="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-full text-gray-400 ml-2 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>
        <button id="fab-search" class="bg-black hover:bg-gray-800 text-white rounded-full w-12 h-12 shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center border border-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </button>
    `;

    document.body.appendChild(widget);

    // 2. Logic Variables
    const fab = document.getElementById('fab-search');
    const bar = document.getElementById('search-bar');
    const input = document.getElementById('global-search-input');
    const counter = document.getElementById('match-counter');
    const closeBtn = document.getElementById('close-search');
    const nextBtn = document.getElementById('next-match');
    const prevBtn = document.getElementById('prev-match');

    let matches = [];
    let currentMatchIndex = -1;
    let isOpen = false;

    // 3. Event Listeners
    fab.addEventListener('click', () => {
        isOpen = true;
        fab.classList.add('hidden');
        bar.classList.remove('hidden');
        // Small delay to allow display change to register before animating
        setTimeout(() => {
            bar.classList.remove('scale-90', 'opacity-0');
            bar.classList.add('scale-100', 'opacity-100');
        }, 10);
        input.focus();
    });

    closeBtn.addEventListener('click', closeSearch);

    // Close on Escape, Next on Enter
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSearch();
        if (e.key === 'Enter') {
            if (e.shiftKey) navigate(-1);
            else navigate(1);
        }
    });

    // Real-time Search
    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();

        // Clear previous
        removeHighlights();
        matches = [];
        currentMatchIndex = -1;
        updateUI();

        if (!term || term.length < 2) return;

        // Find matches in valid text nodes
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                const tag = node.parentElement.tagName.toLowerCase();
                if (['script', 'style', 'noscript', 'input', 'textarea'].includes(tag)) return NodeFilter.FILTER_REJECT;
                if (node.parentElement.closest('#floating-search')) return NodeFilter.FILTER_REJECT;
                if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        let node;
        let foundNodes = [];

        while (node = walker.nextNode()) {
            if (node.nodeValue.toLowerCase().includes(term)) foundNodes.push(node);
        }

        // Highlight
        foundNodes.forEach(textNode => {
            const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
            const parent = textNode.parentNode;
            const frag = document.createDocumentFragment();
            let lastIdx = 0;
            const text = textNode.nodeValue;

            // Check for multiple matches in one node
            text.replace(regex, (match, p1, offset) => {
                frag.appendChild(document.createTextNode(text.substring(lastIdx, offset)));

                const mark = document.createElement('mark');
                mark.className = 'bg-yellow-200 text-black px-0.5 rounded-sm search-match transition-colors duration-200';
                mark.textContent = match;
                frag.appendChild(mark);
                matches.push(mark); // Store reference

                lastIdx = offset + match.length;
            });
            frag.appendChild(document.createTextNode(text.substring(lastIdx)));
            parent.replaceChild(frag, textNode);
        });

        updateUI();
        if (matches.length > 0) navigate(1); // Go to first match
    });

    nextBtn.addEventListener('click', () => navigate(1));
    prevBtn.addEventListener('click', () => navigate(-1));

    // 4. Helper Functions
    function closeSearch() {
        isOpen = false;

        // Animate out
        bar.classList.remove('scale-100', 'opacity-100');
        bar.classList.add('scale-90', 'opacity-0');

        setTimeout(() => {
            bar.classList.add('hidden');
            fab.classList.remove('hidden');
            input.value = '';
            removeHighlights();
            matches = [];
            currentMatchIndex = -1;
        }, 200); // Wait for transition
    }

    function navigate(direction) {
        if (matches.length === 0) return;

        // Remove style from current
        if (currentMatchIndex >= 0 && matches[currentMatchIndex]) {
            matches[currentMatchIndex].className = 'bg-yellow-200 text-black px-0.5 rounded-sm search-match transition-colors duration-200';
        }

        // Update index
        currentMatchIndex += direction;
        if (currentMatchIndex >= matches.length) currentMatchIndex = 0; // Loop
        if (currentMatchIndex < 0) currentMatchIndex = matches.length - 1; // Loop back

        // Style new current
        const current = matches[currentMatchIndex];
        current.className = 'bg-indigo-500 text-white px-0.5 rounded-sm search-match shadow-md transform scale-110';

        // Scroll into view
        current.scrollIntoView({ behavior: 'smooth', block: 'center' });

        updateUI();
    }

    function updateUI() {
        counter.classList.toggle('hidden', matches.length === 0);
        counter.textContent = matches.length > 0 ? `${currentMatchIndex + 1}/${matches.length}` : '0/0';

        nextBtn.disabled = matches.length === 0;
        prevBtn.disabled = matches.length === 0;
    }

    function removeHighlights() {
        const marks = document.querySelectorAll('mark.search-match');
        marks.forEach(mark => {
            const parent = mark.parentNode;
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
            parent.normalize();
        });
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
});


