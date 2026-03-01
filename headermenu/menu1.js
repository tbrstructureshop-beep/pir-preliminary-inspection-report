/**
 * menu1.js - Inline Header Info Version
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
            body { margin: 0; padding-top: var(--header-h); background-color: #f4f7f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            
            /* Header */
            .main-header { position: fixed; top: 0; left: 0; right: 0; height: var(--header-h); background: var(--primary); color: white; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; z-index: 1000; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
            .header-left { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
            .menu-btn { background: none; border: none; color: white; cursor: pointer; font-size: 24px; display: flex; align-items: center; padding: 5px; border-radius: 4px; }
            
            .brand-name { font-weight: 700; font-size: 16px; letter-spacing: 0.5px; }

            /* Inline Info Area */
            .header-right { display: flex; align-items: center; gap: 12px; cursor: pointer; height: 100%; }
            
            .info-reveal-container { 
                display: flex; 
                flex-direction: column; 
                align-items: flex-end; 
                text-align: right; 
                overflow: hidden; 
                max-width: 0; 
                opacity: 0; 
                transition: max-width 0.4s ease, opacity 0.3s ease, margin 0.3s ease;
                pointer-events: none;
            }

            /* When Avatar is clicked, this class is added to header-right */
            .header-right.active .info-reveal-container { 
                max-width: 400px; 
                opacity: 1; 
                margin-right: 8px;
                pointer-events: auto;
            }

            /* Text Styling inside Header */
            .header-name-row { font-size: 14px; font-weight: 600; white-space: nowrap; }
            .header-id-tag { font-size: 11px; opacity: 0.7; font-family: monospace; margin-left: 5px; font-weight: normal; }
            .header-detail-row { font-size: 11px; opacity: 0.8; white-space: nowrap; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }
            .header-sep { margin: 0 4px; opacity: 0.5; }

            .header-avatar { 
                width: 38px; height: 38px; border-radius: 50%; 
                border: 2px solid rgba(255,255,255,0.4); 
                transition: 0.3s; object-fit: cover; flex-shrink: 0;
            }
            .header-right:hover .header-avatar { border-color: #fff; }

            /* Sidebar */
            .sidebar { position: fixed; top: 0; left: -270px; width: var(--side-w); height: 100%; background: #fff; z-index: 1002; transition: 0.3s ease-in-out; box-shadow: 4px 0 15px rgba(0,0,0,0.1); color: #333; }
            .sidebar.active { left: 0; }
            .sidebar-header { padding: 30px 20px; background: #f8f9fa; border-bottom: 1px solid #eee; text-align: center; }
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
                    <span class="brand-name">TC MOBILE PIR</span>
                </div>
                
                <div class="header-right" id="headerRight" onclick="PIR_MENU.toggleInfo()">
                    <!-- Hidden Info that slides out -->
                    <div class="info-reveal-container">
                        <div class="header-name-row">
                            <span id="h_name">User Name</span>
                            <span class="header-id-tag" id="h_id">(0000)</span>
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
        
        // Populate Data
        document.getElementById('h_name').textContent = user.name || "User";
        document.getElementById('h_id').textContent = `(${user.userId || 'N/A'})`;
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
        document.getElementById('headerRight').classList.toggle('active');
    },

    closeAll() {
        document.getElementById('p_sidebar').classList.remove('active');
        document.getElementById('p_overlay').classList.remove('active');
        // Optional: close info if overlay is clicked
        document.getElementById('headerRight').classList.remove('active');
    },

    logout() {
        if (confirm("Are you sure you want to sign out?")) {
            sessionStorage.clear();
            window.location.replace(this.paths.login);
        }
    }
};

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PIR_MENU.init());
} else {
    PIR_MENU.init();
}
