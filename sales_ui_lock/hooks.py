app_name = "sales_ui_lock"
app_title = "Sales UI Lock"
app_publisher = "SurgiShop"
app_description = "Force roles to their specific module and eliminate access to desktop"
app_email = "gary.starr@surgishop.com"
app_license = "MIT"
required_apps = ["frappe/erpnext"]
required_frappe_version = ">=16.0.0"
app_logo_url = "/assets/sales_ui_lock/sales_ui_lock/sales-ui-lock-icon.svg"

app_include_js = [
    "/assets/sales_ui_lock/js/desk_ui_lock.js"
]

fixtures = [
    {
        "dt": "Workspace",
        "filters": [["name", "=", "Sales User"]]
    }
]

add_to_apps_screen = [
	{
		"name": "sales_ui_lock",
		"logo": "/assets/sales_ui_lock/sales_ui_lock/sales-ui-lock-icon.svg",
		"title": "Sales User",
		"route": "/app/Sales User",
		"has_permission": "erpnext.check_app_permission",
	}
]

# before_install = "sales_ui_lock.install.before_install"
after_install = "sales_ui_lock.sales_ui_lock.install.after_install"

# Ensure workspace sidebar is set up after migrations
after_migrate = [
	"sales_ui_lock.sales_ui_lock.install.ensure_workspace_exists",
	"sales_ui_lock.sales_ui_lock.install.ensure_sales_user_sidebar",
	"sales_ui_lock.sales_ui_lock.install.cleanup_old_workspaces",
	"sales_ui_lock.sales_ui_lock.install.fix_settings_defaults",
	"sales_ui_lock.sales_ui_lock.workspace_sidebar.ensure_sales_sidebar"
]
