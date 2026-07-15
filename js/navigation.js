// --- Navigation Functions ---

window.toggleMobileMenu = function() {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    
    if (mobileMenu) {
        mobileMenu.classList.toggle('active');
        const isActive = mobileMenu.classList.contains('active');
        
        if (menuIcon) {
            menuIcon.classList.toggle('hidden', isActive);
        }
        if (closeIcon) {
            closeIcon.classList.toggle('hidden', !isActive);
        }
    }
};
