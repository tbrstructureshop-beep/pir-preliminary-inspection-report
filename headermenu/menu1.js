/**
 * menu1.js - Clean Avatar-only Header with Info Dropdown
 */

const PIR_MENU = {
    paths: {
        home: "/home/index.html",
        login: "/index.html",
        logo: "/assets/logo.png",
        defaultAvatar: "https://ui-avatars.com/api/?background=0f5361&color=fff&name=" 
    },

    init() {
        this.injectStyles();
        this.renderUI();
        this.loadUserSession();
        this.setupEventListeners();
    },

    injectStyles() {
        const css = `
            :root { --primary: #0f5361; --header-h: 60px; --side-w: 260px; }
            body { margin: 0; padding-top: var(--header-h); background-color: #f4f7f8; }
            
            /* Header */
            .main-header { position: fixed; top: 0; left: 0; right: 0; height: var(--header-h); background: var(--primary); color: white; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; z-index: 1000; box-shadow: 0 2px 8px rgba(0,0,0,0.15); font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
            .header-left { display: flex; align-items: center; gap: 12px; }
            .menu-btn { background: none; border: none; color: white; cursor: pointer; font-size: 24px; display: flex; align-items: center; padding: 8px; border-radius: 50%; }
            .menu-btn:hover { background: rgba(255,255,255,0.1); }
            
            .brand-name { font-weight: 700; font-size: 16px; letter-spacing: 0.5px; }
            
            /* Profile Section */
            .header-right { position: relative; }
            .avatar-container { cursor: pointer; position: relative; display: flex; align-items: center; }
            .header-avatar { width: 38px; height: 38px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.6); transition: 0.2s; object-fit: cover; }
            .avatar-container:hover .header-avatar { border-color: #fff; transform: scale(1.05); }

            /* Info Dropdown Card */
            .user-info-card { 
                position: absolute; top: 52px; right: 0; width: auto; min-width: 220px;
                background: white; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); 
                display: none; flex-direction: column; padding: 16px; z-index: 1010;
                white-space: nowrap; border: 1px solid rgba(0,0,0,0.05);
                animation: slideFade 0.25s ease-out;
            }
            .user-info-card.active { display: flex; }
            @keyframes slideFade {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* Nice Text Formatting */
            .info-line-top { color: #1a1a1a; font-size: 15px; font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
            .info-userid { color: #777; font-weight: 400; font-size: 13px; font-family: 'Courier New', monospace; }
            .info-line-bottom { color: #555; font-size: 12px; font-weight: 500; display: flex; align-items: center; gap: 8px; border-top: 1px solid #eee; margin-top: 8px; padding-top: 8px; }
            .info-sep { color: #ccc; font-weight: 300; font-size: 14px; }

            /* Sidebar */
            .sidebar { position: fixed; top: 0; left: -270px; width: var(--side-w); height: 100%; background: #fff; z-index: 1002; transition: 0.3s ease-in-out; box-shadow: 4px 0 15px rgba(0,0,0,0.1); font-family: sans-serif; }
            .sidebar.active { left: 0; }
            .sidebar-header { padding: 30px 20px; background: #f8f9fa; border-bottom: 1px solid #eee; text-align: center; }
            .sidebar-logo { width: 70px; margin-bottom: 12px; }
            .nav-links { list-style: none; padding: 15px 0; margin: 0; }
            .nav-links li a { display: flex; align-items: center; gap: 15px; padding: 14px 25px; text-decoration: none; color: #444; font-weight: 500; transition: 0.2s; }
            .nav-links li a:hover { background: #f0f7f8; color: var(--primary); }
            .nav-links hr { border: 0; border-top: 1px solid #eee; margin: 10px 0; }
            .menu-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: none; z-index: 1001; backdrop-filter: blur(2px); }
            .menu-overlay.active { display: block; }
        `;
        const styleTag = document.createElement("style");
        styleTag.innerHTML = css;
        document.head.appendChild(styleTag);
    },

    renderUI() {
        const html = `
            <header class="main-header">
                <div class="header-left">
                    <button class="menu-btn" onclick="PIR_MENU.toggleSidebar()">
                        <span class="material-icons">menu</span>
                    </button>
                    <span class="brand-name">TC MOBILE PIR</span>
                </div>
                
                <div class="header-right">
                    <div class="avatar-container" id="profileToggle" onclick="PIR_MENU.toggleDropdown(event)">
                        <img id="navUserProfile" src="" class="header-avatar" alt="User">
                        
                        <!-- The Information Dropdown (No buttons, just info) -->
                        <div class="user-info-card" id="userInfoCard">
                            <div class="info-line-top">
                                <span id="infoName">User Name</span>
                                <span class="info-userid" id="infoId">(ID000)</span>
                            </div>
                            <div class="info-line-bottom">
                                <span id="infoUnit">Unit Name</span>
                                <span class="info-sep">│</span>
                                <span id="infoJob">Job Title</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div class="menu-overlay" id="p_overlay" onclick="PIR_MENU.closeAll()"></div>

            <nav class="sidebar" id="p_sidebar">
                <div class="sidebar-header">
                    <img src="${this.paths.logo}" alt="Logo" class="sidebar-logo">
                    <div style="font-weight:700; color:var(--primary); font-size:14px;">TC MOBILE PIR SYSTEM</div>
                    <div style="font-size:10px; opacity:0.6; margin-top:4px; letter-spacing:1px;">MANPOWER</div>
                </div>
                <ul class="nav-links">
                    <li><a href="${this.paths.home}"><span class="material-icons">home</span>Dashboard</a></li>
                    <hr>
                    <li><a href="javascript:void(0)" onclick="PIR_MENU.logout()" style="color:#d32f2f;">
                        <span class="material-icons">logout</span>Sign Out
                    </a></li>
                </ul>
            </nav>
        `;
        document.body.insertAdjacentHTML('afterbegin', html);
    },

    loadUserSession() {
        const userData = sessionStorage.getItem("user");
        if (!userData) {
            window.location.replace(this.paths.login);
            return;
        }
        const user = JSON.parse(userData);
        
        // Update Avatar
        const profileImg = document.getElementById('navUserProfile');
        profileImg.src = (user.profile && user.profile !== "") 
            ? user.profile 
            : this.paths.defaultAvatar + encodeURIComponent(user.name);

        // Update Text Info
        document.getElementById('infoName').textContent = user.name || "User";
        document.getElementById('infoId').textContent = `(${user.userId || 'N/A'})`;
        document.getElementById('infoUnit').textContent = user.unit || "General Unit";
        document.getElementById('infoJob').textContent = user.jobTitle || "Employee";
    },

    setupEventListeners() {
        // Close dropdown when clicking outside the profile container
        window.addEventListener('click', (e) => {
            const card = document.getElementById('userInfoCard');
            const toggle = document.getElementById('profileToggle');
            if (!toggle.contains(e.target)) {
                card.classList.remove('active');
            }
        });
    },

    toggleSidebar() {
        document.getElementById('p_sidebar').classList.toggle('active');
        document.getElementById('p_overlay').classList.toggle('active');
    },

    toggleDropdown(event) {
        event.stopPropagation();
        document.getElementById('userInfoCard').classList.toggle('active');
    },

    closeAll() {
        document.getElementById('p_sidebar').classList.remove('active');
        document.getElementById('p_overlay').classList.remove('active');
        document.getElementById('userInfoCard').classList.remove('active');
    },

    logout() {
        if (confirm("Are you sure you want to sign out?")) {
            sessionStorage.clear();
            window.location.replace(this.paths.login);
        }
    }
};

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PIR_MENU.init());
} else {
    PIR_MENU.init();
}
