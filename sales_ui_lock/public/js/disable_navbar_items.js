/**
 * Global UI Tweaks: Force Hide User Settings
 * This version uses a MutationObserver to ensure the item stays hidden
 * even if Frappe re-renders the navbar dynamically.
 */

(function() {
    const targetLabel = "User Settings"; // Or "My Settings" depending on your translation

    const hideItem = () => {
        // Hide by data-label (standard) and by href (fallback)
        const selector = `li[data-label="${targetLabel}"], a[href*="user-settings"]`;
        const $el = $(selector);
        
        if ($el.length) {
            $el.hide();
            // Also hide the parent list item if we found the anchor link
            $el.closest('li').css('display', 'none !important');
        }
    };

    // 1. Run immediately
    $(document).ready(hideItem);

    // 2. Run whenever the navbar dropdown is clicked
    $(document).on('click', '.navbar-user', function() {
        setTimeout(hideItem, 1);
        setTimeout(hideItem, 50); // Second pass for slower renders
    });

    // 3. Persistent Watchdog (Mutation Observer)
    const observer = new MutationObserver((mutations) => {
        hideItem();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 4. CSS Safety Net (The "Nuclear" option)
    $('<style>')
        .prop('type', 'text/css')
        .html(`
            li[data-label="${targetLabel}"], 
            a[href*="user-settings"] { 
                display: none !important; 
            }
        `)
        .appendTo('head');
})();
