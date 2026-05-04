/**
 * Service Worker Registration & Offline Robustness
 * This script is included in the head of all pages to ensure the 
 * Service Worker is activated as early as possible.
 */
(function() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
                .then(function(reg) {
                    // Check if the page is currently controlled
                    if (!navigator.serviceWorker.controller) {
                        console.log('[SW] Service worker registered but not yet controlling this page.');
                        
                        // If we are offline and not controlled, the layout is likely broken.
                        // We force a refresh once to let the SW take control.
                        if (!navigator.onLine && !sessionStorage.getItem('sw_offline_fix')) {
                            sessionStorage.setItem('sw_offline_fix', 'true');
                            console.log('[SW] Offline and uncontrolled - forcing refresh.');
                            location.reload();
                        }
                    }
                })
                .catch(function(err) {
                    console.warn('[SW] Registration failed:', err);
                });
        });
    }
})();
