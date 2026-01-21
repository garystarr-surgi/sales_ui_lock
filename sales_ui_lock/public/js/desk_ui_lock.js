(function () {
    // ==========================
    // CONFIGURATION
    // ==========================
    const ROLE_RULES = {
        "Sales User": {
            landing: "selling",
            dropdown_block: [
                "Desktop",
                "Edit Sidebar",
                "Website",
                "Help",
                "Session Defaults"
            ]
        }
    };

    const ADMIN_ROLES = ["System Manager"];

    // ==========================
    // HELPERS
    // ==========================
    function hasRole(role) {
        return frappe?.user_roles?.includes(role) || false;
    }

    function isAdmin() {
        return ADMIN_ROLES.some(hasRole);
    }

    function getActiveRule() {
        for (const role in ROLE_RULES) {
            if (hasRole(role)) return ROLE_RULES[role];
        }
        return null;
    }

    // ==========================
    // FORCE LANDING WORKSPACE
    // ==========================
    function enforceLanding(rule) {
        if (!rule?.landing || !frappe?.set_route) return;

        const target = `/app/${rule.landing}`;
        if (!window.location.pathname.startsWith(target)) {
            frappe.set_route(rule.landing);
        }
    }

    // ==========================
    // DISABLE USER DROPDOWN ITEMS
    // ==========================
    function disableMenuItems(rule) {
        if (!rule?.dropdown_block) return;

        const block = rule.dropdown_block.map(i => i.toLowerCase());

        document.querySelectorAll('.dropdown-menu-item').forEach(item => {
            const text = item
                .querySelector('.menu-item-title')
                ?.innerText?.trim().toLowerCase();

            if (!text || !block.includes(text)) return;
            if (item.dataset.disabled) return;

            item.dataset.disabled = "true";
            item.style.opacity = "0.4";
            item.style.pointerEvents = "none";
        });
    }

    // ==========================
    // HARD REMOVE WORKSPACE SIDEBAR (v16)
    // ==========================
    function removeWorkspaceSidebar() {
        // 1. Force desk layout into no-sidebar mode
        const desk = document.querySelector('.desk-container, .layout-main');
        if (desk) {
            desk.setAttribute('data-sidebar', 'false');
            desk.classList.add('no-sidebar');
        }

        // 2. Kill the grid column used by workspace sidebar
        document.querySelectorAll(
            '.layout-side-section, .desk-sidebar, .workspace-sidebar'
        ).forEach(el => {
            el.style.display = 'none';
            el.style.width = '0';
            el.style.minWidth = '0';
            el.style.maxWidth = '0';
        });

        // 3. Expand main content area
        document.querySelectorAll(
            '.layout-main-section, .desk-page'
        ).forEach(el => {
            el.style.marginLeft = '0';
            el.style.width = '100%';
            el.style.maxWidth = '100%';
        });

        // 4. Inject CSS that Vue cannot undo
        if (!document.getElementById('sales-ui-lock-css')) {
            const style = document.createElement('style');
            style.id = 'sales-ui-lock-css';
            style.innerHTML = `
                .layout-side-section,
                .desk-sidebar,
                .workspace-sidebar,
                .sidebar-column {
                    display: none !important;
                    width: 0 !important;
                }

                .layout-main-section,
                .desk-page {
                    margin-left: 0 !important;
                    width: 100% !important;
                    max-width: 100% !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ==========================
    // MAIN ENFORCEMENT
    // ==========================
    function enforce() {
        if (!frappe?.user_roles || isAdmin()) return;

        const rule = getActiveRule();
        if (!rule) return;

        enforceLanding(rule);
        disableMenuItems(rule);
        removeWorkspaceSidebar();
    }

    // ==========================
    // INIT
    // ==========================
    function init() {
        if (!frappe?.user_roles) {
            setTimeout(init, 200);
            return;
        }

        if (isAdmin()) return;

        // v16 requires constant enforcement
        setInterval(enforce, 250);

        // Vue rerenders → observe DOM
        const observer = new MutationObserver(enforce);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Route changes
        if (frappe.router) {
            frappe.router.on("change", enforce);
        }

        enforce();
    }

    init();
})();
