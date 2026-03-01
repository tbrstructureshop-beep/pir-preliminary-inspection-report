/**
 * menu1.js - Standalone Header & Sidebar Component (Man Power Version)
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
    },

    injectStyles() {
        const css = `
            :root { --primary: #0f5361; --header-h: 60px; --side-w: 260px; }
            body { margin: 0; padding-top: var(--header-h); background-color: #f4f7f8; }
            
            /* Header */
            .main-header { position: fixed; top: 0; left: 0; right: 0; height: var(--header-h); background: var(--primary); color: white; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; z-index: 1000; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
            .header-left, .header-right { display: flex; align-items: center; gap: 12px; }
            .menu-btn { background: none; border: none; color: white; cursor: pointer; font-size: 24px; display: flex; align-items: center; }
            
            /* Brand Styling with Subtitle */
            .brand-wrapper { display: flex; flex-direction: column; line-height: 1.1; }
            .brand-name { font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 0.5px; }
            .brand-sub { font-size: 10px; font-weight: 400; text-transform: uppercase; opacity: 0.8; letter-spacing: 1px; }
            
            /* User Meta */
            .user-info { text-align: right; line-height: 1.2; font-family: sans-serif; }
            #navUserName { font-size: 14px; font-weight: 600; display: block; }
            #navUserRole { font-size: 11px; opacity: 0.8; }
            .header-avatar { width: 36px; height: 36px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); object-fit: cover; }

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
                    <button class="menu-btn" onclick="PIR_MENU.toggle()">
                        <span class="material-icons">menu</span>
                    </button>
                    <div class="brand-wrapper">
                        <span class="brand-name">TC MOBILE PIR</span>
                        <span class="brand-sub">Manpower</span>
                    </div>
                </div>
                <div class="header-right">
                    <div class="user-info">
                        <span id="navUserName">Loading...</span>
                        <small id="navUserRole">Please wait</small>
                    </div>
                    <img id="navUserProfile" src="" class="header-avatar" alt="User">
                </div>
            </header>

            <div class="menu-overlay" id="p_overlay" onclick="PIR_MENU.toggle()"></div>

            <nav class="sidebar" id="p_sidebar">
                <div class="sidebar-header">
                    <img src="${this.paths.logo}" alt="Logo" class="sidebar-logo">
                    <div style="font-weight:700; color:var(--primary); font-size:13px;">TC MOBILE SYSTEM</div>
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
        document.getElementById('navUserName').textContent = user.name || "User";
        document.getElementById('navUserRole').textContent = user.jobTitle || "Employee";
        
        const profileImg = document.getElementById('navUserProfile');
        if (user.profile && user.profile !== "") {
            profileImg.src = user.profile;
        } else {
            profileImg.src = this.paths.defaultAvatar + encodeURIComponent(user.name);
        }
    },

    toggle() {
        document.getElementById('p_sidebar').classList.toggle('active');
        document.getElementById('p_overlay').classList.toggle('active');
    },

    logout() {
        if (confirm("Are you sure you want to sign out?")) {
            sessionStorage.clear();
            window.location.replace(this.paths.login);
        }
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PIR_MENU.init());
} else {
    PIR_MENU.init();
}
