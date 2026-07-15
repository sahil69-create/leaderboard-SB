// --- Initialization ---

// reveal content immediately
document.body.classList.add('loaded');

// Initialize Lucide icons
function initLucide() {
    if (window.lucide) {
        lucide.createIcons();
    } else {
        // Retry after a short delay if lucide isn't loaded yet
        setTimeout(initLucide, 100);
    }
}

// Start initialization
'requestIdleCallback' in window ? requestIdleCallback(() => setTimeout(initLucide, 100)) : setTimeout(initLucide, 300);
