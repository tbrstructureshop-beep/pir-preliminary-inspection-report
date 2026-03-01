/**
 * menu1.js - Standalone Header & Sidebar Component (User Detail Dropdown Version)
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
            .main-header { position: fixed; top: 0; left: 0; right: 0; height: var(--header-h); background: var(--primary); color: white; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; z-index: 1000; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
            .header-left { display: flex; align-items: center; gap: 12px; }
            .menu-btn { background: none; border: none; color: white; cursor: pointer; font-size: 24px; display: flex; align-items: center; }
            
            .brand-wrapper { display: flex; flex-direction: column; line-height: 1.1; }
            .brand-name { font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 0.5px; }
            
            /* Profile Container */
            .header-right { position: relative; }
            .profile-trigger { display: flex; align-items: center; cursor: pointer; padding: 5px; border-radius: 30px; transition: 0.2s; }
            .profile-trigger:hover { background: rgba(255,255,255,0.1); }
            .header-avatar { width: 38px; height: 38px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.5); object-fit: cover; }

            /* User Dropdown Card */
            .user-dropdown { 
                position: absolute; top: 55px; right: 0; width: 280px; 
                background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); 
                display: none; flex-direction: column; overflow: hidden; z-index: 1010; color: #333;
                animation: fadeInDown 0.2s ease-out;
            }
            .user-dropdown.active { display: flex; }
            @keyframes fadeInDown {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .dropdown-header { padding: 20px; background: #f8f9fa; text-align: center; border-bottom: 1px solid #eee; }
            .dropdown-avatar { width: 60px; height: 60px; border-radius: 50%; margin-bottom: 10px; border: 3px solid var(--primary); }
            .info-name { font-weight: 700; font-size: 15px; color: #111; margin-bottom: 2px; }
            .info-id { font-size: 12px; color: #666; font-family: monospace; }
            .info-detail { margin-top: 10px; font-size: 13px; color: #444; display: flex; justify-content: center; align-items: center; gap: 8px; }
            .detail-divider { color: #ccc; font-weight: 300; }

            .dropdown-footer { padding: 10px; background: white; }
            .logout-btn { 
                width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; 
                padding: 10px; border: none; background: #fff1f0; color: #d32f2f; 
                border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s;
            }
            .logout-btn:hover { background: #ffccc7; }

            /* Sidebar */
            .sidebar { position: fixed; top: 0; left: -270px; width: var(--side-w); height: 100%; background: #fff; z-index: 1002; transition: 0.3s ease-in-out; box-shadow: 4px 0 15px rgba(0,0,0,0.1); font-family: sans-serif; }
            .sidebar.active { left: 0; }
            .sidebar-header { padding: 25px 20px; background: #f8f9fa; border-bottom: 1px solid #eee; text-align: center; }
            .sidebar-logo { width: 60px; margin-bottom: 10px; }

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
                    <div class="brand-wrapper">
                        <span class="brand-name">TC MOBILE PIR</span>
                    </div>
                </div>
                
                <div class="header-right">
                    <div class="profile-trigger" id="profileTrigger" onclick="PIR_MENU.toggleDropdown(event)">
                        <img id="navUserProfile" src="" class="header-avatar" alt="User">
                    </div>

                    <!-- User Detail Dropdown -->
                    <div class="user-dropdown" id="userDropdown">
                        <div class="dropdown-header">
                            <img id="dropAvatar" src="" class="dropdown-avatar">
                            <div class="info-name" id="dropName">Name</div>
                            <div class="info-id" id="dropId">(UserID)</div>
                            <div class="info-detail">
                                <span id="dropUnit">Unit</span>
                                <span class="detail-divider">│</span>
                                <span id="dropJob">Job Title</span>
                            </div>
                        </div>
                        <div class="dropdown-footer">
                            <button class="logout-btn" onclick="PIR_MENU.logout()">
                                <span class="material-icons" style="font-size:18px">logout</span> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div class="menu-overlay" id="p_overlay" onclick="PIR_MENU.closeAll()"></div>

            <nav class="sidebar" id="p_sidebar">
                <div class="sidebar-header">
                    <img src="${this.paths.logo}" alt="Logo" class="sidebar-logo">
                    <div style="font-weight:700; color:var(--primary); font-size:13px;">TC MOBILE PIR SYSTEM</div>
                    <small style="opacity:0.7; font-size:10px;">MANPOWER VERSION</small>
                </div>
                <ul class="nav-links">
                    <li><a href="${this.paths.home}"><span class="material-icons">home</span>Back Home</a></li>
                    <hr>
                    <li><a href="javascript:void(0)" onclick="PIR_MENU.logout()"><span class="material-icons">logout</span>Sign Out</a></li>
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
        
        // Profile Images
        const avatarUrl = (user.profile && user.profile !== "") 
            ? user.profile 
            : this.paths.defaultAvatar + encodeURIComponent(user.name);
        
        document.getElementById('navUserProfile').src = avatarUrl;
        document.getElementById('dropAvatar').src = avatarUrl;

        // User Details
        document.getElementById('dropName').textContent = user.name || "User";
        document.getElementById('dropId').textContent = `(${user.userId || 'N/A'})`;
        document.getElementById('dropUnit').textContent = user.unit || "General";
        document.getElementById('dropJob').textContent = user.jobTitle || "Employee";
    },

    setupEventListeners() {
        // Close dropdown when clicking outside
        window.addEventListener('click', (e) => {
            const dropdown = document.getElementById('userDropdown');
            const trigger = document.getElementById('profileTrigger');
            if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    },

    toggleSidebar() {
        document.getElementById('p_sidebar').classList.toggle('active');
        document.getElementById('p_overlay').classList.toggle('active');
    },

    toggleDropdown(event) {
        event.stopPropagation();
        document.getElementById('userDropdown').classList.toggle('active');
    },

    closeAll() {
        document.getElementById('p_sidebar').classList.remove('active');
        document.getElementById('p_overlay').classList.remove('active');
        document.getElementById('userDropdown').classList.remove('active');
    },

    logout() {
        if (confirm("Are you sure you want to sign out?")) {
            sessionStorage.clear();
            window.location.replace(this.paths.login);
        }
    }
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PIR_MENU.init());
} else {
    PIR_MENU.init();
}
