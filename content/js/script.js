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
 * Eye Care Settings Modal
 * Toggled via "/eye" command in search bar.
 */
(function () {
    let settings = JSON.parse(localStorage.getItem('night_light_settings') || '{"active":false,"brightness":80,"auto":false,"start":"20:00","end":"07:00"}');

    const updateOverlay = () => {
        let overlay = document.getElementById('night-light-overlay');
        if (!settings.active) {
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 800);
            }
            return;
        }

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'night-light-overlay';
            overlay.style.cssText = `
                position: fixed;
                inset: 0;
                pointer-events: none;
                z-index: 2147483647;
                transition: opacity 0.8s ease, backdrop-filter 0.3s ease;
                opacity: 0;
            `;
            document.body.appendChild(overlay);
            overlay.offsetHeight; // force reflow
        }

        const b = settings.brightness / 100;
        const s = 0.3 + (100 - settings.brightness) / 100 * 0.2;
        overlay.style.background = `rgba(255, 120, 0, ${0.04 + (1-b) * 0.08})`;
        overlay.style.backdropFilter = `brightness(${b}) sepia(${s})`;
        overlay.style.webkitBackdropFilter = `brightness(${b}) sepia(${s})`;
        overlay.style.opacity = '1';
    };

    let lastAutoState = null;
    const checkAutomation = () => {
        if (!settings.auto) {
            lastAutoState = null;
            return;
        }
        const now = new Date();
        const time = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');

        let shouldBeActive = false;
        if (settings.start <= settings.end) {
            shouldBeActive = time >= settings.start && time < settings.end;
        } else {
            // Over midnight
            shouldBeActive = time >= settings.start || time < settings.end;
        }

        // Only trigger if the automation state has changed to avoid fighting manual toggles
        if (lastAutoState !== null && shouldBeActive !== lastAutoState) {
            settings.active = shouldBeActive;
            localStorage.setItem('night_light_settings', JSON.stringify(settings));
            updateOverlay();
        }
        lastAutoState = shouldBeActive;
    };

    window.toggleNightLight = function () {
        if (document.getElementById('eye-care-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'eye-care-modal';
        // Use a lower z-index than the overlay (2147483647) so the overlay covers the modal
        modal.className = 'fixed inset-0 z-[2147483640] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm';
        modal.innerHTML = `
            <div class="bg-white p-6 max-w-[320px] w-full rounded-[24px] shadow-2xl border border-black transform scale-95 transition-all duration-300 opacity-0" id="eye-care-content" style="font-family:'Inter', sans-serif;">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-sm font-bold tracking-tight text-gray-900">Eye Care Settings</h3>
                    <button id="close-eye-care" class="text-gray-300 hover:text-black transition-colors"><i class="bi bi-x-lg"></i></button>
                </div>
                
                <div class="space-y-6">
                    <!-- Quick Toggle -->
                    <div class="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <span class="text-xs font-semibold text-gray-700">Night Light Mode</span>
                        <button id="modal-night-light-toggle" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${settings.active ? 'bg-black' : 'bg-gray-200'}">
                            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${settings.active ? 'translate-x-6' : 'translate-x-1'}"></span>
                        </button>
                    </div>

                    <!-- Brightness Control -->
                    <div class="space-y-3 px-1">
                        <div class="flex justify-between items-center">
                            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Adjustment</span>
                            <span class="text-[10px] font-mono text-gray-600 font-bold">${settings.brightness}%</span>
                        </div>
                        <input type="range" id="brightness-slider" min="30" max="100" value="${settings.brightness}" 
                            class="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black border border-gray-50">
                    </div>

                    <!-- Schedule Task -->
                    <div class="space-y-4 pt-4 px-1">
                        <div class="flex justify-between items-center">
                            <span class="text-xs font-semibold text-gray-700">Auto-Schedule</span>
                            <input type="checkbox" id="auto-toggle" ${settings.auto ? 'checked' : ''} class="w-4 h-4 accent-black cursor-pointer rounded">
                        </div>
                        
                        <div id="time-inputs" class="flex gap-3 ${settings.auto ? '' : 'opacity-10 pointer-events-none'} transition-all duration-300">
                            <div class="flex-1">
                                <label class="block text-[8px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Start Time</label>
                                <input type="time" id="start-time" value="${settings.start}" class="w-full bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-black/5">
                            </div>
                            <div class="flex-1">
                                <label class="block text-[8px] font-bold text-gray-400 uppercase mb-2 tracking-widest">End Time</label>
                                <input type="time" id="end-time" value="${settings.end}" class="w-full bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-black/5">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-8">
                    <button id="save-eye-care" class="w-full bg-black text-white py-3.5 rounded-2xl text-xs font-bold hover:bg-gray-900 transition-all active:scale-[0.98] shadow-lg shadow-black/10">
                        Update Preferences
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        const content = document.getElementById('eye-care-content');
        setTimeout(() => content.classList.remove('scale-95', 'opacity-0'), 10);

        // Bind events
        const close = () => {
            content.classList.add('scale-95', 'opacity-0');
            setTimeout(() => modal.remove(), 300);
        };
        document.getElementById('close-eye-care').onclick = close;
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });

        document.addEventListener('keydown', function esc(e) {
            if (e.key === 'Escape' && document.getElementById('eye-care-modal')) {
                close();
                document.removeEventListener('keydown', esc);
            }
        });

        const toggleBtn = document.getElementById('modal-night-light-toggle');
        const autoCheck = document.getElementById('auto-toggle');
        const slider = document.getElementById('brightness-slider');

        toggleBtn.onclick = () => {
            settings.active = !settings.active;
            const dot = toggleBtn.querySelector('span');
            toggleBtn.className = `relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${settings.active ? 'bg-black' : 'bg-gray-200'}`;
            dot.className = `inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${settings.active ? 'translate-x-6' : 'translate-x-1'}`;
            localStorage.setItem('night_light_settings', JSON.stringify(settings));
            updateOverlay();
        };

        autoCheck.onchange = (e) => {
            settings.auto = e.target.checked;
            document.getElementById('time-inputs').classList.toggle('opacity-10', !settings.auto);
            document.getElementById('time-inputs').classList.toggle('pointer-events-none', !settings.auto);
        };

        slider.oninput = (e) => {
            settings.brightness = e.target.value;
            // Update percentage text display
            const label = el => el.parentElement.querySelector('span:last-child');
            if (slider.parentElement.querySelector('span:last-child')) {
                slider.parentElement.querySelector('span:last-child').textContent = `${settings.brightness}%`;
            }
            if (settings.active) updateOverlay();
        };

        document.getElementById('save-eye-care').onclick = () => {
            settings.start = document.getElementById('start-time').value;
            settings.end = document.getElementById('end-time').value;
            localStorage.setItem('night_light_settings', JSON.stringify(settings));
            updateOverlay();
            close();
        };
    };

    window.quickToggleNightLight = function () {
        settings.active = !settings.active;
        localStorage.setItem('night_light_settings', JSON.stringify(settings));
        updateOverlay();
        // Sync modal if open
        const toggleBtn = document.getElementById('modal-night-light-toggle');
        if (toggleBtn) {
            toggleBtn.className = `relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${settings.active ? 'bg-black' : 'bg-gray-200'}`;
            const dot = toggleBtn.querySelector('span');
            if (dot) dot.className = `inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${settings.active ? 'translate-x-6' : 'translate-x-1'}`;
        }
        return settings.active;
    };

    // Auto-apply on load
    if (settings.active) {
        if (document.body) updateOverlay();
        else document.addEventListener('DOMContentLoaded', updateOverlay);
    }
    
    // Start automation checker
    setInterval(checkAutomation, 60000);
    checkAutomation();
})();

/**
 * Serif Mode Toggle
 * Toggled via "/serif" command in search bar.
 */
(function () {
    let serifActive = localStorage.getItem('serif_mode') === 'true';

    const applySerif = () => {
        if (serifActive) {
            document.documentElement.classList.add('serif-mode');
        } else {
            document.documentElement.classList.remove('serif-mode');
        }
    };

    // Inject Serif Styles
    const style = document.createElement('style');
    style.innerHTML = `
        /* Premium Serif Stacking */
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&display=swap');
        
        .serif-mode, .serif-mode body {
            font-family: 'Lora', 'Charter', 'Georgia', serif !important;
        }
        
        .serif-mode h1, .serif-mode h2, .serif-mode h3, .serif-mode h4, .serif-mode h5, .serif-mode h6 {
            font-family: 'Lora', 'Charter', 'Georgia', serif !important;
            letter-spacing: -0.01em !important;
        }

        .serif-mode .mono, .serif-mode pre, .serif-mode code {
            font-family: 'JetBrains Mono', 'Roboto Mono', monospace !important;
        }
    `;
    document.head.appendChild(style);

    window.toggleSerifMode = function() {
        serifActive = !serifActive;
        localStorage.setItem('serif_mode', serifActive);
        applySerif();
        
        // Visual Feedback (optional toast or message)
        console.log(`[System] Serif Mode: ${serifActive ? 'ON' : 'OFF'}`);
        return serifActive;
    };

    // Initial Apply
    if (serifActive) {
        if (document.documentElement) applySerif();
        else document.addEventListener('DOMContentLoaded', applySerif);
    }
})();

/**
 * Global System Lockdown Check
 */
(function () {
    window.showBanOverlay = function () {
        if (document.getElementById('stuck-ban-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'stuck-ban-overlay';
        overlay.innerHTML = `
            <div style="position:fixed;inset:0;background:black;z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;font-family:'Outfit',sans-serif;text-align:center;padding:24px;box-sizing:border-box;">
                <div style="font-size:min(15vw, 72px);margin-bottom:15px;">🛑</div>
                <h1 style="font-size:clamp(20px, 8vw, 32px);font-weight:900;text-transform:uppercase;margin-bottom:12px;letter-spacing:-1px;line-height:1.1;">Access Revoked</h1>
                <p style="font-weight:700;color:#666;text-transform:uppercase;font-size:clamp(8px, 3vw, 11px);letter-spacing:2px;margin-bottom:24px;">System Lockdown Protocol: Active</p>
                <div style="background:#111;border:1px solid #333;padding:clamp(16px, 5vw, 24px);border-radius:12px;margin-bottom:32px;max-width:320px;width:100%;box-sizing:border-box;">
                    <p style="font-size:clamp(11px, 3.5vw, 13.5px);line-height:1.6;color:#ccc;margin:0;">Repeated violations of the mission conduct have been detected. Your access to the entire platform has been suspended.</p>
                </div>
                <div id="ban-timer" style="font-size:clamp(24px, 10vw, 42px);font-family:'JetBrains Mono',monospace;font-weight:bold;color:#ff4d4d;margin-bottom:32px;letter-spacing:-2px;">05:00</div>
                <p style="font-size:min(2.5vw, 10px);color:#444;text-transform:uppercase;letter-spacing:1px;">Unauthorized navigation attempts are currently disabled.</p>
            </div>
        `;
        document.body.appendChild(overlay);

        const timerEl = document.getElementById('ban-timer');
        const updateTimer = () => {
            const banTime = localStorage.getItem('mr_stuck_ban_until');
            if (!banTime) return;

            const remaining = parseInt(banTime) - Date.now();
            if (remaining <= 0) {
                localStorage.removeItem('mr_stuck_ban_until');
                location.reload();
            } else {
                const mins = Math.floor(remaining / 60000);
                const secs = Math.floor((remaining % 60000) / 1000);
                timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                setTimeout(updateTimer, 1000);
            }
        };
        updateTimer();
    };

    const banUntil = localStorage.getItem('mr_stuck_ban_until');
    if (banUntil && Date.now() < parseInt(banUntil)) {
        if (document.body) window.showBanOverlay();
        else document.addEventListener('DOMContentLoaded', window.showBanOverlay);
    }
})();

/**
 * "Resume Learning" Tracker
 * Saves the current content page path to localStorage so the index page
 * can show a "Resume Learning" badge on the last-visited card.
 */
(function () {
    const path = window.location.pathname.replace(/\.html$/, '');
    // Only track actual content pages (not index, labs, flashcards)
    if (path.includes('/content/') && !path.includes('flashcards')) {
        localStorage.setItem('undrlib_last_page', path);
    }
})();

/**
 * Global Page Loading Animation
 * Creates a white overlay with a logo that splits to reveal "Undrstanding"
 */
(function () {
    const path = window.location.pathname;

    // Pages where loader should be hidden / logic should not run
    const isIndex = path.endsWith('index') || path === '/' || path.endsWith('/');
    const isFlashcards = path.includes('flashcards');

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
        window.location.pathname.includes('highlights') ||
        window.location.pathname.includes('/labs/')) return;

    // 1. Create Widget UI
    const widget = document.createElement('div');
    widget.id = 'floating-search';
    widget.className = 'fixed bottom-6 right-6 z-[80] flex flex-col items-end font-sans';

    // HTML Structure
    widget.innerHTML = `
        <div id="search-bar" class="hidden fixed bottom-12 left-1/2 transform -translate-x-1/2 z-[85] flex items-center bg-white/80 backdrop-blur-md shadow-2xl border-2 border-black rounded-full px-4 sm:px-5 py-2.5 sm:py-3 mb-0 transition-all origin-bottom scale-90 opacity-0 w-[92vw] sm:w-auto max-w-lg">
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
    let isAtTop = false;

    // --- Search-to-Top Toggle Logic ---
    const transformFAB = (toTop) => {
        isAtTop = toTop;
        if (toTop) {
            fab.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
                </svg>
            `;
            fab.title = "Back to Top";
        } else {
            fab.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            `;
            fab.title = "Search Page";
        }
    };

    // Intersection Observer for Terminal Sections (Footer/Quiz/Cert)
    const endObserver = new IntersectionObserver((entries) => {
        const isEndVisible = entries.some(entry => entry.isIntersecting);
        if (!isOpen) transformFAB(isEndVisible);
    }, { threshold: 0.1 });

    // Target common bottom elements
    ['footer', '#certificate', '#quiz', '[id*="quiz-final"]'].forEach(selector => {
        const el = document.querySelector(selector);
        if (el) endObserver.observe(el);
    });

    fab.addEventListener('click', () => {
        if (isAtTop) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
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
        const term = e.target.value.toLowerCase().trim();

        // --- Custom Command: /serif ---
        if (term === '/serif') {
            if (window.toggleSerifMode) {
                window.toggleSerifMode();
                e.target.value = '';
                closeSearch();
                return;
            }
        }

        // --- Custom Command: /eye ---
        if (term === '/eye') {
            if (window.quickToggleNightLight) {
                window.quickToggleNightLight();
                e.target.value = '';
                closeSearch();
                return;
            }
        }

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


// ========================================================
// Highlight System
// Lets users highlight text on content pages and view
// the highlights on the index page.
// ========================================================
(function initHighlightSystem() {
    const STORAGE_KEY = 'undrlib_highlights';

    // Only run on content pages (not index, not labs, not highlights/flashcards)
    if (document.getElementById('site-search') ||
        window.location.pathname.includes('flashcards') ||
        window.location.pathname.includes('highlights') ||
        window.location.pathname.includes('/labs/')) return;

    // Re-enable text selection on content areas so the highlight tooltip can work.
    // The copy/cut event listeners (set by Content Protection) stay active — users
    // still cannot copy text, but they CAN select it to trigger the Highlight button.
    const selStyle = document.createElement('style');
    selStyle.innerHTML = `
        main, article, section, p, li, h1, h2, h3, h4, h5, h6,
        .content, [class*="section"], [class*="content"] {
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
            user-select: text !important;
        }
    `;
    document.head.appendChild(selStyle);

    function getHighlights() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    }
    function saveHighlights(arr) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    }
    function getPageName() {
        return document.title.split('|')[0].trim();
    }

    // Get the nearest section heading above the selection
    function getSectionAbove(range) {
        const rect = range.getBoundingClientRect();
        // Filter out the tooltip itself and its children from being detected as a "Section"
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, section[id], div[id]'))
            .filter(el => !el.closest('#highlight-tooltip'));
        let best = null, bestDist = Infinity;
        headings.forEach(h => {
            const hRect = h.getBoundingClientRect();
            const dist = (rect.top + window.scrollY) - (hRect.bottom + window.scrollY);
            if (dist >= 0 && dist < bestDist) {
                bestDist = dist;
                best = h;
            }
        });
        if (!best) return { name: '', id: '' };
        const name = (best.textContent || '').trim().replace(/\s+/g, ' ').substring(0, 60);
        const id = best.id || best.closest('[id]')?.id || '';
        return { name, id };
    }

    // -- Floating Tooltip Button (premium glass card) --
    // -- Floating Tooltip Button (minimalist premium card) --
    const tooltip = document.createElement('div');
    tooltip.id = 'highlight-tooltip';
    tooltip.style.cssText = `
        position: absolute;
        display: none;
        z-index: 9999;
        transform: translateX(-50%) translateY(4px);
        pointer-events: auto;
        transition: opacity 0.15s ease, transform 0.15s ease;
        opacity: 0;
    `;
    tooltip.innerHTML = `
        <div id="highlight-pill" style="
            display: flex; align-items: center; 
            background: #000000; 
            border: 1px solid rgba(255,255,255,0.15); 
            border-radius: 99px; 
            padding: 4px; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
            gap: 2px;
        ">
            <button id="highlight-btn" class="hl-tooltip-btn" style="
                display: flex; align-items: center; justify-content: center;
                background: transparent;
                color: #ffffff;
                border: none;
                width: 32px; height: 32px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s;
            " title="Highlight Selection">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
            </button>
            <div id="hl-divider" style="width: 1px; height: 16px; background: rgba(255,255,255,0.15);"></div>
            <button id="note-toggle-btn" class="hl-tooltip-btn" style="
                display: flex; align-items: center; justify-content: center;
                background: transparent;
                color: #ffffff;
                border: none;
                width: 32px; height: 32px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s;
            " title="Add Note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            </button>
            <div id="hl-divider-2" style="width: 1px; height: 16px; background: rgba(255,255,255,0.15);"></div>
            <button id="delete-hl-btn" class="hl-tooltip-btn" style="
                display: flex; align-items: center; justify-content: center;
                background: transparent;
                color: #ff4d4d;
                border: none;
                width: 32px; height: 32px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s;
            " title="Delete Highlight">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
        <div id="note-panel" class="hl-note-panel" style="
            display: none;
            flex-direction: column;
            background: #000000;
            border: 1px solid rgba(255,255,255,0.15);
            padding: 12px;
            border-radius: 16px;
            width: 200px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
            margin-top: 8px;
            overflow: hidden;
            transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
            opacity: 0;
            transform: translateY(-24px) scale(0.92);
            transform-origin: top center;
            max-height: 0;
        ">
            <textarea id="note-input" placeholder="Write a quick note..." style="
                background: transparent;
                border: none;
                color: white;
                font-family: 'Inter', sans-serif;
                font-size: 0.75rem;
                resize: none;
                width: 100%;
                height: 60px;
                outline: none;
                margin-bottom: 4px;
            "></textarea>
            <div id="word-count" style="font-size: 0.6rem; color: rgba(255,255,255,0.4); margin-bottom: 8px; font-family: 'JetBrains Mono', monospace;">0/50 words</div>
            <button id="save-with-note-btn" style="
                background: #ffffff;
                color: #000000;
                border: none;
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 0.6rem;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                cursor: pointer;
                font-family: 'JetBrains Mono', monospace;
                transition: opacity 0.2s;
            ">Save Highlight & Note</button>
        </div>
    `;
    document.body.appendChild(tooltip);

    // Inject Tooltip-specific styles once
    const tooltipStyle = document.createElement('style');
    tooltipStyle.textContent = `
        .hl-tooltip-btn:hover {
            background: rgba(255,255,255,0.1) !important;
        }
        .hl-tooltip-btn:active {
            transform: scale(0.95);
        }
        .hl-note-panel.open {
            opacity: 1 !important;
            transform: translateY(0) scale(1) !important;
            max-height: 240px !important;
            margin-top: 14px !important;
        }
    `;
    document.head.appendChild(tooltipStyle);

    let savedRange = null;
    let hideTimer = null; // tracks pending hide timeout so mouseup can cancel it

    function showTooltip(rect, isDeleteMode = false, hid = null) {
        // Cancel any pending hide from a prior mousedown
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }

        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const scrollX = window.scrollX || document.documentElement.scrollLeft;

        // Toggle visibility based on mode
        const highlightBtn = document.getElementById('highlight-btn');
        const noteBtn = document.getElementById('note-toggle-btn');
        const deleteBtn = document.getElementById('delete-hl-btn');

        const setBtnState = (btn, enabled, dataHid = null) => {
            btn.disabled = !enabled;
            btn.style.opacity = enabled ? '1' : '0.25';
            btn.style.filter = enabled ? 'none' : 'grayscale(100%)';
            btn.style.pointerEvents = enabled ? 'auto' : 'none';
            btn.style.cursor = enabled ? 'pointer' : 'default';
            if (dataHid) btn.dataset.hid = dataHid;
        };

        if (isDeleteMode) {
            setBtnState(highlightBtn, false);
            setBtnState(noteBtn, false);
            setBtnState(deleteBtn, true, hid);
        } else {
            setBtnState(highlightBtn, true);
            setBtnState(noteBtn, true);
            setBtnState(deleteBtn, false);
        }

        // Reset to invisible-but-placed state first
        tooltip.style.transition = 'none';
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateX(-50%) translateY(6px)';
        tooltip.style.left = (rect.left + scrollX + rect.width / 2) + 'px';
        tooltip.style.top = (rect.top + scrollY - 52) + 'px';
        tooltip.style.display = 'block';

        // Double-rAF: first frame registers display:block, second frame transitions
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                tooltip.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translateX(-50%) translateY(0)';
            });
        });
    }

    function hideTooltip(animate = true) {
        if (animate) {
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateX(-50%) translateY(6px)';
            hideTimer = setTimeout(() => {
                // If tooltip is still opacity 0 (wasn't cancelled), hide it
                if (tooltip.style.opacity === '0') {
                    tooltip.style.display = 'none';
                    // Reset panel state only when fully hiding
                    const panel = document.getElementById('note-panel');
                    panel.classList.remove('open');
                    panel.style.display = 'none';
                    document.getElementById('note-input').value = '';
                    document.getElementById('word-count').textContent = '0/50 words';
                    document.getElementById('word-count').style.color = 'rgba(255,255,255,0.4)';
                    document.getElementById('save-with-note-btn').disabled = false;
                    document.getElementById('save-with-note-btn').style.opacity = '1';
                }
                hideTimer = null;
            }, 180);
        } else {
            if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
            tooltip.style.display = 'none';
            tooltip.style.opacity = '0';
            const panel = document.getElementById('note-panel');
            panel.classList.remove('open');
            panel.style.display = 'none';
            document.getElementById('note-input').value = '';
            document.getElementById('word-count').textContent = '0/50 words';
            document.getElementById('word-count').style.color = 'rgba(255,255,255,0.4)';
            document.getElementById('save-with-note-btn').disabled = false;
            document.getElementById('save-with-note-btn').style.opacity = '1';
        }
    }

    // Right-click support: show highlight tooltip if text is selected
    // Note: this overrides the global contextmenu suppression only when selection exists.
    document.addEventListener('contextmenu', (e) => {
        if (window.__DISABLE_HIGHLIGHT_TOOLTIP) return;
        const sel = window.getSelection();
        const text = sel?.toString().trim();
        if (text && text.length >= 3) {
            e.preventDefault();
            savedRange = sel.getRangeAt(0).cloneRange();
            showTooltip(savedRange.getBoundingClientRect());
        }
    });

    document.addEventListener('mouseup', (e) => {
        if (window.__DISABLE_HIGHLIGHT_TOOLTIP) return;
        if (tooltip.contains(e.target)) return; // Don't reset if clicking inside tooltip

        setTimeout(() => {
            const sel = window.getSelection();
            const text = sel?.toString().trim();
            if (!text || text.length < 3) { 
                // If valid text selection is gone and we're not inside tooltip, hide
                if (!tooltip.contains(document.activeElement)) {
                    hideTooltip(false); 
                }
                return; 
            }
            if (tooltip.contains(sel.anchorNode)) return;
            savedRange = sel.getRangeAt(0).cloneRange();
            showTooltip(savedRange.getBoundingClientRect());
        }, 10);
    });

    // Hide tooltip when clicking elsewhere
    document.addEventListener('mousedown', (e) => {
        if (!tooltip.contains(e.target)) {
            hideTooltip(true);
        }
    });

    function saveHighlightWithPossibleNote(noteText = '') {
        const sel = window.getSelection();
        const textToSave = (sel?.toString().trim()) || (savedRange ? savedRange.toString().trim() : '');
        if (!textToSave || !savedRange) return;

        const section = getSectionAbove(savedRange);
        const pageName = getPageName();
        const pageUrl = window.location.pathname.replace(/^\//, '').replace(/\.html$/, '');

        const highlight = {
            id: Date.now().toString(),
            text: textToSave.substring(0, 400),
            note: noteText.trim(),
            pageName,
            pageUrl,
            sectionName: section.name,
            sectionId: section.id,
            timestamp: Date.now()
        };

        const highlights = getHighlights();
        const colorIndex = highlights.length % 6;
        highlights.unshift({ ...highlight, colorIndex });
        saveHighlights(highlights.slice(0, 60));

        applyHighlightMark(savedRange, highlight.id, colorIndex);

        tooltip.style.display = 'none';
        hideTooltip(false);
        sel.removeAllRanges();
    }

    document.getElementById('highlight-btn').addEventListener('click', () => {
        saveHighlightWithPossibleNote();
    });

    document.getElementById('note-toggle-btn').addEventListener('click', () => {
        const panel = document.getElementById('note-panel');
        const isOpening = !panel.classList.contains('open');
        
        if (isOpening) {
            panel.style.display = 'flex';
            // Force reflow
            panel.offsetHeight;
            panel.classList.add('open');
            setTimeout(() => document.getElementById('note-input').focus(), 100);
        } else {
            panel.classList.remove('open');
            setTimeout(() => {
                if (!panel.classList.contains('open')) {
                    panel.style.display = 'none';
                }
            }, 400); // Wait for transition
        }
    });

    document.getElementById('save-with-note-btn').addEventListener('click', () => {
        const noteInput = document.getElementById('note-input');
        const noteText = noteInput.value.trim();
        const words = noteText ? noteText.split(/\s+/).length : 0;
        
        if (words > 50) return; // Shouldn't happen as we'll disable button but for safety
        saveHighlightWithPossibleNote(noteText);
    });

    document.getElementById('note-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const noteInput = document.getElementById('note-input');
            const noteText = noteInput.value.trim();
            const words = noteText ? noteText.split(/\s+/).length : 0;
            if (words > 0 && words <= 50) {
                saveHighlightWithPossibleNote(noteText);
            }
        }
    });

    document.getElementById('note-input').addEventListener('input', (e) => {
        const text = e.target.value.trim();
        const words = text ? text.split(/\s+/).length : 0;
        const countDisplay = document.getElementById('word-count');
        const saveBtn = document.getElementById('save-with-note-btn');
        
        countDisplay.textContent = `${words}/50 words`;
        
        if (words > 50) {
            countDisplay.style.color = '#ff4d4d';
            saveBtn.disabled = true;
            saveBtn.style.opacity = '0.3';
            saveBtn.style.cursor = 'not-allowed';
        } else {
            countDisplay.style.color = 'rgba(255,255,255,0.4)';
            saveBtn.disabled = false;
            saveBtn.style.opacity = '1';
            saveBtn.style.cursor = 'pointer';
        }
    });

    document.getElementById('delete-hl-btn').addEventListener('click', (e) => {
        const hid = e.currentTarget.dataset.hid;
        if (!hid) return;

        const highlights = getHighlights();
        const newList = highlights.filter(h => h.id !== hid);
        saveHighlights(newList);

        // Remove from UI
        const marks = document.querySelectorAll(`.undr-highlight[data-hid="${hid}"]`);
        marks.forEach(m => {
            const parent = m.parentNode;
            parent.replaceChild(document.createTextNode(m.textContent), m);
            parent.normalize();
        });

        hideTooltip(false);
    });

    // Detect click on existing highlight
    document.addEventListener('click', (e) => {
        const mark = e.target.closest('.undr-highlight');
        if (mark) {
            const hid = mark.dataset.hid;
            const rect = mark.getBoundingClientRect();
            // Wait slightly for any click handling / selection to resolve
            setTimeout(() => {
                showTooltip(rect, true, hid);
            }, 50);
        }
    });

    // Pastel palette — updated to remove bright yellow, using premium soft tones
    const PASTEL_COLORS = [
        '#E3F2FD', // ice blue
        '#FFEBEE', // blush
        '#F3E5F5', // lavender
        '#E8F5E9', // mint
        '#FFF9C4', // gold (replaces the confusing grey)
        '#FBE9E7', // coral
    ];

    // ── Style keyframes ──────────────────────────────────────────
    const hlStyle = document.createElement('style');
    hlStyle.textContent = `
        @keyframes undrWipe {
            from { background-size: 0% 100%; }
            to { background-size: 100% 100%; }
        }
        @keyframes undrFlashWhite {
            0%   { outline: 3px solid transparent; outline-offset: 3px; }
            20%  { outline: 3px solid rgba(255,255,255,0.9); outline-offset: 3px; }
            60%  { outline: 3px solid rgba(255,255,240,0.5); outline-offset: 5px; }
            100% { outline: 3px solid transparent; outline-offset: 3px; }
        }
        .undr-highlight {
            background-color: transparent !important; /* overrides browser default yellow <mark> */
            background-repeat: no-repeat;
            background-position: left center;
            background-size: 0% 100%;
            animation: undrWipe 0.45s cubic-bezier(0.19, 1, 0.22, 1) forwards;
            padding: 0 1px;
            margin: 0 -1px;
            border-radius: 2px;
            display: inline;
        }
        .undr-flash-anim {
            animation: undrFlashWhite 1.4s ease-out forwards !important;
        }
    `;
    document.head.appendChild(hlStyle);

    // ── Highlight helpers ──────────────────────────────────────────────────

    // Build a <mark> element with the highlight style and wipe animation.
    function makeMarkEl(id, bg) {
        const m = document.createElement('mark');
        m.className = 'undr-highlight';
        m.dataset.hid = id;
        m.style.backgroundImage = `linear-gradient(${bg}, ${bg})`;
        return m;
    }

    // Surgical Normalisation: pushes boundaries into text nodes without crossing block boundaries.
    function normaliseToTextNodes(range) {
        const r = range.cloneRange();

        // Helper to find the first/last text node in/near a node
        const getEdgeTextNode = (node, start) => {
            if (node.nodeType === Node.TEXT_NODE) return node;
            const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
            let n, last = null;
            while ((n = walker.nextNode())) { if (start) return n; last = n; }
            return last;
        };

        // Normalise Start
        if (r.startContainer.nodeType !== Node.TEXT_NODE) {
            const child = r.startContainer.childNodes[r.startOffset];
            if (child) {
                const t = getEdgeTextNode(child, true);
                if (t) r.setStart(t, 0);
            } else {
                // At the end of an element, find the next text node
                const next = getEdgeTextNode(r.startContainer, true);
                if (next) r.setStart(next, 0);
            }
        }

        // Normalise End
        if (r.endContainer.nodeType !== Node.TEXT_NODE) {
            let node = r.endContainer, offset = r.endOffset;

            // If offset is 0, we are at the START of an element. 
            // We should back out into the PREVIOUS element's content.
            if (offset === 0) {
                let prev = node.previousSibling;
                while (prev && !getEdgeTextNode(prev, false)) prev = prev.previousSibling;
                if (prev) {
                    const t = getEdgeTextNode(prev, false);
                    if (t) r.setEnd(t, t.length);
                } else if (node.parentNode) {
                    r.setEndBefore(node);
                    return normaliseToTextNodes(r);
                }
            } else {
                const child = node.childNodes[offset - 1];
                if (child) {
                    const t = getEdgeTextNode(child, false);
                    if (t) r.setEnd(t, t.length);
                }
            }
        }

        return r;
    }

    // Collect text nodes that are actually within the range
    // Collect ONLY the text nodes that fall within the selection range.
    function getTextNodesInRange(range) {
        const nodes = [];
        const iter = document.createNodeIterator(range.commonAncestorContainer, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = iter.nextNode())) {
            // Check if node overlaps at ALL with the range
            if (range.intersectsNode(n)) {
                // Verify the specifically selected segment of this node is non-whitespace
                const s = (n === range.startContainer) ? range.startOffset : 0;
                const e = (n === range.endContainer) ? range.endOffset : n.nodeValue.length;
                if (e > s && n.nodeValue.substring(s, e).trim()) {
                    nodes.push(n);
                }
            }
        }
        return nodes;
    }

    // Wrap a selection in <mark> elements.
    function applyHighlightMark(range, id, colorIndex = 0) {
        if (!range || range.collapsed) return null;

        // Surgical trim: move boundaries to exclude leading/trailing spaces
        const trim = (r) => {
            while (!r.collapsed && r.startContainer.nodeType === Node.TEXT_NODE && /\s/.test(r.startContainer.nodeValue[r.startOffset])) {
                r.setStart(r.startContainer, r.startOffset + 1);
            }
            while (!r.collapsed && r.endContainer.nodeType === Node.TEXT_NODE && /\s/.test(r.endContainer.nodeValue[r.endOffset - 1])) {
                r.setEnd(r.endContainer, r.endOffset - 1);
            }
            return r;
        };

        const nr = trim(normaliseToTextNodes(range));
        if (nr.collapsed) return null;

        const bg = PASTEL_COLORS[colorIndex % PASTEL_COLORS.length];
        const textNodes = getTextNodesInRange(nr);

        let firstMark = null;
        textNodes.forEach(node => {
            const s = (node === nr.startContainer) ? nr.startOffset : 0;
            const e = (node === nr.endContainer) ? nr.endOffset : node.length;
            if (s >= e) return;

            const sub = document.createRange();
            sub.setStart(node, s);
            sub.setEnd(node, e);
            if (!sub.toString().trim()) return;

            const mark = makeMarkEl(id, bg);
            try {
                sub.surroundContents(mark);
                if (!firstMark) firstMark = mark;
            } catch (err) { /* fails on half-formed ranges or partial tags */ }
        });
        return firstMark;
    }

    // Robust text-node search: finds matches even across multiple elements and
    // handles varied whitespace/indentation between save and restoration.
    function findTextRange(searchText) {
        if (!searchText) return null;
        const normalize = s => s.replace(/\s+/g, ' ').trim();
        const target = normalize(searchText);
        if (!target) return null;

        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                if (node.parentElement?.closest('.undr-highlight, nav, aside')) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        const positions = []; let cumulative = ''; let node;
        while ((node = walker.nextNode())) {
            positions.push({ node, start: cumulative.length });
            cumulative += node.nodeValue;
        }

        const startToken = searchText.substring(0, 15);
        let currentPos = -1;

        while ((currentPos = cumulative.indexOf(startToken, currentPos + 1)) !== -1) {
            // Found candidate. Walk cumulative string to find the literal matchEnd.
            let building = ''; let literalEnd = currentPos;
            for (let i = currentPos; i < cumulative.length; i++) {
                const char = cumulative[i];
                if (/\s/.test(char)) {
                    if (building.length > 0 && building[building.length - 1] !== ' ') building += ' ';
                } else building += char;

                if (normalize(building).includes(target)) {
                    literalEnd = i + 1;
                    break;
                }
                if (building.length > target.length + 300) break;
            }

            if (normalize(cumulative.substring(currentPos, literalEnd)).includes(target)) {
                const startInfo = positions.findLast(p => p.start <= currentPos);
                const endInfo = positions.findLast(p => p.start < literalEnd);
                if (startInfo && endInfo) {
                    const r = document.createRange();
                    r.setStart(startInfo.node, currentPos - startInfo.start);
                    r.setEnd(endInfo.node, Math.min(endInfo.node.length, literalEnd - endInfo.start));
                    return r;
                }
            }
        }
        return null;
    }

    // ── Scroll + flash ─────────────────────────────────────────────────────

    function flashScrollTo(markId, retry = 0) {
        const el = document.querySelector(`mark[data-hid="${markId}"]`);
        if (!el) {
            if (retry < 15) setTimeout(() => flashScrollTo(markId, retry + 1), 200);
            return;
        }

        // Center on the mark smoothly
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(() => {
            el.classList.add('undr-flash-anim');
            setTimeout(() => el.classList.remove('undr-flash-anim'), 1600);

            // Final micro-adjustment (smooth) to account for layout settling
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 800);
    }

    // ── Restore on page load ────────────────────────────────────────────────

    function restoreHighlights() {
        const pageUrl = window.location.pathname.replace(/^\//, '').replace(/\.html$/, '');
        const highlights = getHighlights().filter(h => h.pageUrl === pageUrl);

        const hashId = window.location.hash.startsWith('#highlight-')
            ? window.location.hash.slice('#highlight-'.length) : null;

        highlights.forEach((h, idx) => {
            const range = findTextRange(h.text);
            if (!range) return;
            applyHighlightMark(range, h.id, h.colorIndex ?? idx);
        });

        return hashId;
    }

    function init() {
        const hashId = restoreHighlights();

        if (hashId) {
            const runScroll = () => setTimeout(() => flashScrollTo(hashId), 1450);
            if (document.readyState === 'complete') runScroll();
            else window.addEventListener('load', runScroll, { once: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
