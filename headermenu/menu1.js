// menu.js - Reusable Header & Sidebar Component
const menuComponent = {
    // Configuration: Change these if your folders are named differently
    config: {
        homePath: '/home/index.html', // Absolute path to your home page
        loginPath: '/index.html',     // Absolute path to your login page
        logoPath: '/assets/logo.png',
        defaultAvatar: '/assets/default-avatar.png'
    },

    init() {
        this.injectCSS();
        this.injectHTML();
        this.setupLogic();
    },

    injectCSS() {
        const css = `
            :root { --primary: #0f5361; --header-h: 60px; --side-w: 260px; }
            body { margin: 0; padding-top: var(--header-h); background: #f4f7f8; font-family: sans-serif; }
            .main-header { position: fixed; top: 0; left: 0; right: 0; height: var(--header-h); background: var(--primary); color: white; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; z-index: 1000; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
            .header-left, .header-right { display: flex; align-items: center; gap: 12px; }
            .menu-btn { background: none; border: none; color: white; cursor: pointer; font-size: 24px; display: flex; }
            .brand-name { font-family: 'Montserrat', sans-serif; font-size: 18px; font-weight: bold; }
            .user-info { text-align: right; line-height: 1.2; }
            #navUserName { font-size: 14px; font-weight: 600; display: block; }
            #navUserRole { font-size: 11px; opacity: 0.8; }
            .header-avatar { width: 36px; height: 36px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); object-fit: cover; }
            .sidebar { position: fixed; top: 0; left: -260px; width: var(--side-w); height: 100%; background: white; z-index: 1002; transition: 0.3s; box-shadow: 4px 0 15px rgba(0,0,0,0.1); }
            .sidebar.active { left: 0; }
            .sidebar-header { padding: 24px 20px; background: #f8f9fa; text-align: center; border-bottom: 1px solid #eee; }
            .sidebar-logo { width: 60px; margin-bottom: 8px; }
            .nav-links { list-style: none; padding: 15px 0; margin: 0; }
            .nav-links li a { display: flex; align-items: center; gap: 15px; padding: 14px 25px; text-decoration: none; color: #444; font-weight: 500; }
            .nav-links li a:hover { background: #f0f7f8; color: var(--primary); }
            .nav-links hr { border: 0; border-top: 1px solid #eee; margin: 10px 0; }
            .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: none; z-index: 1001; backdrop-filter: blur(2px); }
            .overlay.active { display: block; }
        `;
        const styleSheet = document.createElement("style");
        styleSheet.innerText = css;
        document.head.appendChild(styleSheet);
    },

    injectHTML() {
        const html = `
            <header class="main-header">
                <div class="header-left">
                    <button class="menu-btn" onclick="menuComponent.toggleMenu()">
                        <span class="material-icons">menu</span>
                    </button>
                    <span class="brand-name">TC PIR</span>
                </div>
                <div class="header-right">
                    <div class="user-info">
                        <span id="navUserName">User</span>
                        <small id="navUserRole">Role</small>
                    </div>
                    <img id="navUserProfile" src="${this.config.defaultAvatar}" class="header-avatar">
                </div>
            </header>
            <div class="overlay" id="menuOverlay" onclick="menuComponent.toggleMenu()"></div>
            <nav class="sidebar" id="menuSidebar">
                <div class="sidebar-header">
                    <img src="${this.config.logoPath}" class="sidebar-logo">
                    <div style="font-weight:700; color:var(--primary); font-size:12px;">INSPECTION DASHBOARD</div>
                </div>
                <ul class="nav-links">
                    <li><a href="${this.config.homePath}"><span class="material-icons">home</span>Back Home</a></li>
                    <li><a href="/home/new-inspection.html"><span class="material-icons">add_circle_outline</span>New Inspection</a></li>
                    <li><a href="/home/reports.html"><span class="material-icons">description</span>History</a></li>
                    <hr>
                    <li><a href="#" onclick="menuComponent.logout()"><span class="material-icons">logout</span>Sign Out</a></li>
                </ul>
            </nav>
        `;
        document.body.insertAdjacentHTML('afterbegin', html);
    },

    toggleMenu() {
        document.getElementById('menuSidebar').classList.toggle('active');
        document.getElementById('menuOverlay').classList.toggle('active');
    },

    setupLogic() {
        const user = JSON.parse(sessionStorage.getItem("user"));
        if (!user) {
            window.location.replace(this.config.loginPath);
            return;
        }
        document.getElementById('navUserName').textContent = user.name;
        document.getElementById('navUserRole').textContent = user.jobTitle;
        if (user.profile) document.getElementById('navUserProfile').src = user.profile;
    },

    logout() {
        if (confirm("Sign out?")) {
            sessionStorage.clear();
            window.location.replace(this.config.loginPath);
        }
    }
};

// Initialize when script loads
window.addEventListener('DOMContentLoaded', () => menuComponent.init());
