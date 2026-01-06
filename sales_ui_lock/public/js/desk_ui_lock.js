(function () {
    // ==========================
    // CONFIGURATION
    // ==========================
    const ROLE_RULES = {
        "Sales User": {
            landing: "selling",
            dropdown_allow: [
                "Reload",
                "Toggle Full Width",
                "Toggle Theme"
            ]
        }
        // Future roles go here:
        // "Procurement User": { ... }
    };
    const ADMIN_ROLES = ["System Manager"];

    // ==========================
    // HELPERS
    // ==========================
    function hasRole(role) {
        return frappe.user_roles.includes(role);
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
    // FORCE LANDING MODULE
    // ==========================
    function enforceLanding(rule) {
        if (!rule?.landing) return;
        setTimeout(() => {
            const path = window.location.pathname;
            const target = `/app/${rule.landing}`;
            if (!path.startsWith(target)) {
                frappe.set_route(rule.landing);
            }
        }, 300);
    }

    // ==========================
    // FILTER SIDEBAR DROPDOWN
    // ==========================
    function filterDropdown(rule) {
        if (!rule?.dropdown_allow) return;
        const allow = rule.dropdown_allow.map(i => i.toLowerCase());
        
        // Target the specific Frappe v16 dropdown structure
        document.querySelectorAll('.dropdown-menu-item').forEach(item => {
            // Get text from the menu-item-title span
            const titleSpan = item.querySelector('.menu-item-title');
            const text = titleSpan?.innerText?.trim().toLowerCase();
            
            if (!text) return;
            
            // Skip if already processed
            if (item.dataset.uiLocked) return;
            
            if (!allow.includes(text)) {
                item.dataset.uiLocked = "true";
                item.remove();
            }
        });
    }

    // ==========================
    // INTERCEPT DROPDOWN CLICKS
    // ==========================
    function interceptDropdownClick() {
        // Find the sidebar dropdown toggle button (the three dots menu)
        const dropdownToggles = document.querySelectorAll('[data-toggle="dropdown"], .dropdown-toggle');
        
        dropdownToggles.forEach(toggle => {
            if (toggle.dataset.intercepted) return;
            toggle.dataset.intercepted = "true";
            
            toggle.addEventListener('click', () => {
                const rule = getActiveRule();
                if (!rule) return;
                
                // Filter dropdown items after short delays to ensure DOM is ready
                setTimeout(() => filterDropdown(rule), 50);
                setTimeout(() => filterDropdown(rule), 150);
                setTimeout(() => filterDropdown(rule), 300);
            });
        });
    }

    // ==========================
    // ENFORCE UI LOCK
    // ==========================
    function enforce() {
        if (isAdmin()) return;
        const rule = getActiveRule();
        if (!rule) return;

        enforceLanding(rule);
        filterDropdown(rule);
        interceptDropdownClick();
    }

    // ==========================
    // INITIALIZE
    // ==========================
    frappe.after_ajax(enforce);
    frappe.router.on("change", enforce);
    
    // Run on initial load
    $(document).ready(enforce);
    
    // Watch for DOM changes
    new MutationObserver(enforce).observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Also run periodically for the first few seconds
    let attempts = 0;
    const interval = setInterval(() => {
        enforce();
        attempts++;
        if (attempts > 10) clearInterval(interval);
    }, 500);
})();
