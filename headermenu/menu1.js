/**
 * menu1.js - Fixed Mobile Info Reveal Clipping
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
            :root { 
                --primary: #0f5361; 
                --primary-soft: #1b6f7a;
                --primary-light: #4f8f97;
                --bg-gradient: linear-gradient(135deg, #0f2f36, #1f535c);
                --card-bg: #ffffff;
                --text-dark: #0e2a30;
                --text-muted: #6b8b91;
                --header-h: 60px; 
                --side-w: 260px; 
            }
            
            body { 
                margin: 0; 
                padding-top: calc(var(--header-h) + 40px); /* Space for fixed header */
                padding-bottom: 40px;
                background: var(--bg-gradient); 
                min-height: 100vh;
                font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
            }

            /* --- HEADER NAVIGATION (Already in your script) --- */
            .main-header { 
                position: fixed; top: 0; left: 0; right: 0; height: var(--header-h); 
                background: var(--primary); color: white; display: flex; 
                align-items: center; justify-content: space-between; padding: 0 16px; 
                z-index: 1000; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            }
            /* ... keep existing .header-left, .brand-name, etc. from your script here ... */

            /* --- GLOBAL DASHBOARD LAYOUT (The part you want to centralize) --- */
            .container {
                max-width: 960px;
                width: 95%;
                margin: 0 auto;
            }

            .page-title-section {
                text-align: center;
                color: #fff;
                margin-bottom: 32px;
            }

            .page-title-section h1 { margin: 0; font-size: 1.8rem; letter-spacing: .5px; }
            .page-title-section p { margin-top: 8px; opacity: .85; font-size: .95rem; }

            .menu-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                gap: 20px;
            }

            .menu-card {
                background: var(--card-bg);
                border-radius: 18px;
                padding: 24px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.25);
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                transition: transform .25s ease, box-shadow .25s ease;
            }

            .menu-card:hover {
                transform: translateY(-6px);
                box-shadow: 0 28px 55px rgba(0,0,0,0.35);
            }

            .menu-top { display: flex; align-items: center; gap: 14px; }

            .menu-icon {
                width: 54px; height: 54px; border-radius: 14px;
                background: linear-gradient(135deg, var(--primary-soft), var(--primary-light));
                display: flex; align-items: center; justify-content: center; font-size: 26px;
            }

            .menu-title { font-size: 1.15rem; font-weight: 600; color: var(--text-dark); }
            .menu-desc { margin-top: 14px; color: var(--text-muted); font-size: .9rem; line-height: 1.5; }

            .menu-action { margin-top: 22px; }
            .menu-action button {
                width: 100%; border: none; border-radius: 14px; padding: 12px 14px;
                background: var(--primary); color: #fff; font-size: .95rem;
                font-weight: 500; cursor: pointer; transition: background .25s ease;
            }

            .menu-action button:hover { background: var(--primary-soft); }

            @media (max-width: 480px) {
                .page-title-section h1 { font-size: 1.5rem; }
            }
            
            /* Sidebar and Overlay CSS (keep your existing sidebar code here) */
            .sidebar { ... }
            .menu-overlay { ... }
        `;
        const styleTag = document.createElement("style");
        styleTag.innerHTML = css;
        document.head.appendChild(styleTag);
    },

    renderUI() {
        const html = `
            <header class="main-header" id="p_header">
                <div class="header-left">
                    <button class="menu-btn" onclick="PIR_MENU.toggleSidebar()">
                        <span class="material-icons">menu</span>
                    </button>
                    <span class="brand-name">TC MOBILE PIR</span>
                </div>
                
                <div class="header-right" id="headerRight" onclick="PIR_MENU.toggleInfo()">
                    <div class="info-reveal-container">
                        <div class="header-name-row">
                            <span id="h_name">...</span>
                            <span class="header-id-tag" id="h_id"></span>
                        </div>
                        <div class="header-detail-row">
                            <span id="h_unit">Unit</span>
                            <span class="header-sep">│</span>
                            <span id="h_job">Job Title</span>
                        </div>
                    </div>
                    <img id="h_avatar" src="" class="header-avatar" alt="User">
                </div>
            </header>

            <div class="menu-overlay" id="p_overlay" onclick="PIR_MENU.closeAll()"></div>

            <nav class="sidebar" id="p_sidebar">
                <div class="sidebar-header">
                    <img src="${this.paths.logo}" alt="Logo" class="sidebar-logo">
                    <div style="font-weight:700; color:var(--primary); font-size:13px;">TC MOBILE PIR SYSTEM</div>
                </div>
                <ul class="nav-links">
                    <li><a href="${this.paths.home}"><span class="material-icons">home</span>Home</a></li>
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
        document.getElementById('h_name').textContent = user.name || "User";
        document.getElementById('h_id').textContent = user.userId ? `(${user.userId})` : "";
        document.getElementById('h_unit').textContent = user.unit || "N/A";
        document.getElementById('h_job').textContent = user.jobTitle || "Employee";
        
        const avatar = document.getElementById('h_avatar');
        avatar.src = (user.profile && user.profile !== "") 
            ? user.profile 
            : this.paths.defaultAvatar + encodeURIComponent(user.name);
    },

    toggleSidebar() {
        document.getElementById('p_sidebar').classList.toggle('active');
        document.getElementById('p_overlay').classList.toggle('active');
    },

    toggleInfo() {
        const header = document.getElementById('p_header');
        const rightSide = document.getElementById('headerRight');
        rightSide.classList.toggle('active');
        header.classList.toggle('info-open');
    },

    closeAll() {
        document.getElementById('p_sidebar').classList.remove('active');
        document.getElementById('p_overlay').classList.remove('active');
        document.getElementById('headerRight').classList.remove('active');
        document.getElementById('p_header').classList.remove('info-open');
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
