// sales_ui_lock/public/js/global_ui_tweaks.js

$(document).ready(function() {
    const hideUserSettings = () => {
        // Target by data-label and by href to be safe
        $('li[data-label="User Settings"], a[href*="user-settings"]').hide();
        $('li[data-label="My Settings"]').hide();
    };

    // Run immediately
    hideUserSettings();

    // Run whenever the menu is clicked (as v16 renders some items lazily)
    $(document).on('click', '.navbar-user', function() {
        setTimeout(hideUserSettings, 10);
    });

    // Global CSS injection as a final layer
    $('<style>')
        .prop('type', 'text/css')
        .html(`
            li[data-label="User Settings"], 
            li[data-label="My Settings"], 
            a[href="/app/user-settings"] { 
                display: none !important; 
            }
        `)
        .appendTo('head');
});
