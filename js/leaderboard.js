// Leaderboard Data (Mock Data - Replace with real data from backend)
window.leaderboardData = [
    {
        id: 1,
        name: "Vijay Sharma",
        location: "Hisar, Haryana",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Rahul&backgroundColor=d91e27",
        amount: 100,
        title: "King of Sharm"
    },
    {
        id: 2,
        name: "Priya Patel",
        location: "Mumbai, India",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Priya&backgroundColor=d91e27",
        amount: 55,
        title: ""
    },
    {
        id: 3,
        name: "Amit Singh",
        location: "Bangalore, India",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Amit&backgroundColor=d91e27",
        amount: 49,
        title: ""
    },
    {
        id: 4,
        name: "Neha Gupta",
        location: "Pune, India",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Neha&backgroundColor=d91e27",
        amount: 30,
        title: ""
    },
    {
        id: 5,
        name: "Vikram Mehta",
        location: "Ahmedabad, India",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Vikram&backgroundColor=d91e27",
        amount: 30,
        title: ""
    },
    {
        id: 6,
        name: "Sneha Verma",
        location: "Jaipur, India",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Sneha&backgroundColor=d91e27",
        amount: 10,
        title: ""
    }
];

// Track if small popup has been shown
let smallPopupShown = false;

// Check if we're on the full leaderboard page
function isFullLeaderboardPage() {
    return window.location.pathname.includes('leaderboard.html');
}

// Render Full Leaderboard Page
function renderFullLeaderboardPage() {
    const sortedData = [...window.leaderboardData].sort((a, b) => b.amount - a.amount);
    
    // Top Donor Highlight
    const topDonorContainer = document.getElementById('leaderboard-top-donor');
    if (topDonorContainer && sortedData.length > 0) {
        const topDonor = sortedData[0];
        topDonorContainer.innerHTML = `
            <div class="top-donor-card" style="max-width: 600px; margin: 0 auto;">
                <div class="top-donor-title">${topDonor.title || "Top Donor"}</div>
                <h4 class="top-donor-name">${topDonor.name}</h4>
                <p class="text-sm opacity-80 mb-2">${topDonor.location}</p>
                <div class="top-donor-amount">₹${topDonor.amount.toLocaleString('en-IN')}</div>
            </div>
        `;
    }
    
    // Full Leaderboard List
    const fullListContainer = document.getElementById('full-leaderboard-list');
    if (fullListContainer) {
        fullListContainer.innerHTML = '';
        sortedData.forEach((donor, index) => {
            const rank = index + 1;
            let rankClass = 'rank-default';
            if (rank === 1) rankClass = 'rank-1';
            if (rank === 2) rankClass = 'rank-2';
            if (rank === 3) rankClass = 'rank-3';
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'leaderboard-item';
            itemDiv.style.maxWidth = '600px';
            itemDiv.style.margin = '0 auto';
            itemDiv.innerHTML = `
                <div class="leaderboard-rank ${rankClass}" style="flex-shrink: 0;">${rank}</div>
                <div class="leaderboard-info" style="flex-grow: 1; margin-left: 1rem;">
                    <div class="leaderboard-name">${donor.name}</div>
                    <div class="leaderboard-location">${donor.location}</div>
                </div>
                <div class="leaderboard-amount" style="flex-shrink: 0;">₹${donor.amount.toLocaleString('en-IN')}</div>
            `;
            fullListContainer.appendChild(itemDiv);
        });
    }
}

// Render Small Leaderboard Popup
function renderSmallLeaderboardPopup() {
    const sortedData = [...window.leaderboardData].sort((a, b) => b.amount - a.amount);
    const topDonor = sortedData[0];
    
    const popupHTML = `
        <div id="small-leaderboard-modal" class="modal-overlay">
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <button onclick="closeSmallLeaderboardPopup()" style="position: absolute; top: 1.25rem; right: 1.25rem; background: transparent; border: none; color: white; cursor: pointer;">
                        <i data-lucide="x" style="width: 1.25rem; height: 1.25rem;"></i>
                    </button>
                <h3 style="font-size: 1.25rem; font-weight: 700;">
                    <i data-lucide="trophy" style="color: var(--primary-yellow); width: 1.25rem; height: 1.25rem; vertical-align: middle; margin-right: 0.5rem;"></i>
                        Top Donor
                </h3>
            </div>
            <div class="p-6 text-center">
                <h4 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem;">${topDonor.name}</h4>
                <p style="color: var(--slate-500); font-size: 0.875rem; margin-bottom: 1rem;">${topDonor.location}</p>
                <p style="font-size: 1.5rem; font-weight: 800; color: var(--primary-red); margin-bottom: 1rem;">₹${topDonor.amount.toLocaleString('en-IN')}</p>
                ${topDonor.title ? `<p style="background: var(--primary-yellow); color: var(--slate-900); padding: 0.25rem 1rem; border-radius: 9999px; display: inline-block; font-size: 0.75rem; font-weight: 700;">${topDonor.title}</p>` : ''}
                <div class="flex gap-3 mt-6">
                    <button onclick="closeSmallLeaderboardPopup()" class="btn-primary" style="flex: 1; background: var(--slate-200); color: var(--slate-800);">Close</button>
                    <a href="leaderboard.html" class="btn-primary" style="flex: 1; text-decoration: none;">View Full Leaderboard</a>
                </div>
            </div>
        </div>
    `;
    
    // Insert popup before end of body
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Open Small Leaderboard Popup
window.openSmallLeaderboardPopup = function() {
    const modal = document.getElementById('small-leaderboard-modal');
    if (modal) {
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }
}

// Close Small Leaderboard Popup
window.closeSmallLeaderboardPopup = function() {
    const modal = document.getElementById('small-leaderboard-modal');
    if (modal) {
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
    }
}

// Render Floating Donor Box
function renderFloatingDonorBox() {
    const sortedData = [...window.leaderboardData].sort((a, b) => b.amount - a.amount);
    const topDonor = sortedData[0];
    
    const floatingBoxHTML = `
        <div id="floating-donor-box" class="floating-donor-box">
            <div class="floating-donor-box-inner">
                <div class="floating-donor-box-header">
                    <i data-lucide="trophy" style="color: var(--primary-yellow); width: 1.25rem; height: 1.25rem;"></i>
                    <span class="font-bold text-sm">Top Donor</span>
                </div>
                <div class="floating-donor-info" style="text-align: center;">
                    <div class="font-bold text-sm">${topDonor.name}</div>
                    <div class="text-xs text-slate-500">₹${topDonor.amount.toLocaleString('en-IN')}</div>
                </div>
                <a href="leaderboard.html" class="floating-donor-link">
                    <i data-lucide="external-link" style="width: 1rem; height: 1rem;"></i>
                </a>
            </div>
        </div>
    `;
    
    // Insert floating box before end of body
    document.body.insertAdjacentHTML('beforeend', floatingBoxHTML);
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Initialize
function initLeaderboard() {
    console.log("Leaderboard initialized!");
    
    // Check if we're on full leaderboard page
    if (isFullLeaderboardPage()) {
        renderFullLeaderboardPage();
    } else {
        // Render floating box
        renderFloatingDonorBox();
        
        // Show small popup after 5 seconds
        setTimeout(() => {
            if (!smallPopupShown) {
                renderSmallLeaderboardPopup();
                openSmallLeaderboardPopup();
                smallPopupShown = true;
            }
        }, 5000);
    }
}

// Run initialization when DOM is ready
if (document.readyState !== 'loading') {
    initLeaderboard();
} else {
    document.addEventListener('DOMContentLoaded', initLeaderboard);
}