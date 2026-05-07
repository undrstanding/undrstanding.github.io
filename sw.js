const CACHE_NAME = 'undrstanding-offline';
const OFFLINE_URL = 'offline';

const CORE_ASSETS = [
    '/',
    'index',
    'offline',
    'manifest.json',
    'highlights',
    'assests/undrlogo.svg',
    'content/js/script.js',
    'content/js/mrstuck.js',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/lucide@latest',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css',
    'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js',
    'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.46.0/min/vs/loader.min.js',
    'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js',
    'https://fonts.googleapis.com/css2?family=Glilda+Display&display=swap',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@300;400;500;600;700;800;900&family=Fira+Code:wght@700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Montserrat:wght@400;700&family=Pacifico&display=swap',
    // Content Pages
    'content/ai',
    'content/algo',
    'content/ds',
    'content/networks',
    'content/dbms',
    'content/os',
    'content/software',
    'content/system',
    'content/computation',
    'content/uiux',
    'content/react',
    'content/git',
    'content/android',
    'content/bigdata',
    'content/crypto',
    'content/linux',
    'content/pigeon',
    'content/quanta',
    'content/oops',
    'content/design',
    'content/html',
    'content/js',
    'content/flashcards',
    'content/quickwiki',
    // Labs
    'labs/whiteboard',
    'labs/ds-visualiser',
    'labs/algo-visualiser',
    'labs/web-visualiser',
    'labs/budget-tracker',
    'labs/quick-tab-closer',
    'labs/weather-app',
    'labs/git-essentials',
    'labs/html-blog-article',
    // Prep
    'prep/CUTE',
    'prep/verbal',
    'prep/roadmap',
    // Games
    'games/hangman',
    'games/algocards',
    'games/chess',
    'games/correctcrash',
    'games/montyhall',
    'games/towerstack',
    'games/wumpus'
];

// Install: Pre-cache core assets
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Pre-caching core assets');
            return Promise.all(
                CORE_ASSETS.map(url => {
                    let fetchUrl = url;
                    if (url !== '/' && !url.includes('.') && !url.startsWith('http')) {
                        fetchUrl = url + '.html';
                    }
                    return fetch(fetchUrl, { mode: url.startsWith('http') ? 'cors' : 'same-origin' })
                        .then(response => {
                            if (response.ok) {
                                return cache.put(url, response);
                            }
                            console.warn(`[SW] Failed to cache: ${fetchUrl}`);
                        })
                        .catch(err => console.warn(`[SW] Cache error for ${fetchUrl}:`, err));
                })
            );
        })
    );
});

// Activate: Clean up old caches and claim clients
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            self.clients.claim()
        ])
    );
});

// Fetch: Strategy based on request type
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Navigation (HTML pages): Network First, Fallback to Cache
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                        return response;
                    }

                    // If 404, try .html version
                    if (response.status === 404 && !url.pathname.includes('.') && url.origin === self.location.origin) {
                        const htmlUrl = event.request.url + '.html';
                        return fetch(htmlUrl).then(htmlRes => {
                            if (htmlRes.ok) {
                                const copy = htmlRes.clone();
                                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                                return htmlRes;
                            }
                            return response;
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Offline: Try to find in cache
                    return caches.match(event.request).then((cachedResponse) => {
                        if (cachedResponse) return cachedResponse;

                        let path = url.pathname;
                        if (path.startsWith('/')) path = path.slice(1);
                        if (!path) path = 'index';

                        const htmlPath = path.endsWith('.html') ? path : path + '.html';
                        const cleanPath = path.endsWith('.html') ? path.slice(0, -5) : path;

                        return caches.match(cleanPath).then(res => {
                            return res || caches.match(htmlPath).then(htmlRes => {
                                return htmlRes || caches.match(OFFLINE_URL) || caches.match('/');
                            });
                        });
                    });
                })
        );
        return;
    }

    // Assets: Cache First, then Network
    event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;

            return fetch(event.request).then((response) => {
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                // Cache all successful GET requests for assets
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                return response;
            }).catch(() => {
                // If offline and not in cache, and it's a critical asset, we might want to return a fallback
                // But for now, returning null/fail is standard.
                return null;
            });
        })
    );
});

