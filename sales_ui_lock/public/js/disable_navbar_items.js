$(document).on('app_ready', function() {
    // Remove 'User Settings' from the internal navbar settings list
    if (frappe.boot.navbar_settings && frappe.boot.navbar_settings.settings_dropdown) {
        frappe.boot.navbar_settings.settings_dropdown = frappe.boot.navbar_settings.settings_dropdown.filter(
            item => item.item_label !== 'User Settings'
        );
    }
});
