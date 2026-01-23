# Copyright (c) 2025, SurgiShop and Contributors
# License: MIT. See license.txt

import frappe
import json
import os


def after_install():
	"""
	Run after the app is installed.
	Ensures workspace and sidebar are set up.
	"""
	ensure_workspace_exists()
	cleanup_old_workspaces()


def ensure_workspace_exists():
	"""
	Ensure the "Sales User" workspace exists by importing it from the JSON fixture.
	"""
	workspace_name = "Sales User"
	
	if frappe.db.exists("Workspace", workspace_name):
		print(f">>> Sales UI Lock: Workspace '{workspace_name}' already exists")
		return
	
	print(f">>> Sales UI Lock: Creating workspace '{workspace_name}'...")
	
	try:
		# Get the path to the workspace JSON file
		app_path = frappe.get_app_path("sales_ui_lock")
		workspace_json_path = os.path.join(
			app_path,
			"sales_ui_lock",
			"workspaces",
			"sales_user",
			"sales_user.json"
		)
		
		if not os.path.exists(workspace_json_path):
			print(f">>> Sales UI Lock: ERROR - Workspace JSON not found at {workspace_json_path}")
			return
		
		# Read and parse the JSON file
		with open(workspace_json_path, 'r') as f:
			workspace_data = json.load(f)
		
		# Extract child table data
		links = workspace_data.pop('links', [])
		shortcuts = workspace_data.pop('shortcuts', [])
		roles = workspace_data.pop('roles', [])
		
		# Remove doctype field if present (not needed for import)
		if 'doctype' in workspace_data:
			del workspace_data['doctype']
		
		# Create the workspace document
		workspace = frappe.get_doc(workspace_data)
		
		# Add child table entries
		for link in links:
			workspace.append('links', link)
		
		for shortcut in shortcuts:
			workspace.append('shortcuts', shortcut)
		
		for role in roles:
			workspace.append('roles', role)
		
		workspace.flags.ignore_permissions = True
		workspace.insert()
		frappe.db.commit()
		frappe.clear_cache(doctype='Workspace')
		frappe.clear_cache()
		
		print(f">>> Sales UI Lock: Successfully created workspace '{workspace_name}'")
		
	except Exception as e:
		print(f">>> Sales UI Lock: ERROR creating workspace - {str(e)}")
		frappe.log_error(
			title="Sales UI Lock Workspace Creation - ERROR",
			message=frappe.get_traceback(),
		)


def ensure_sales_user_sidebar():
	"""
	Ensure the "Sales User" workspace has a matching Workspace Sidebar.
	This is required for the workspace to appear properly.
	"""
	sidebar_name = "Sales User"
	workspace_name = "Sales User"
	
	print(f"\n>>> Sales UI Lock: Ensuring Workspace Sidebar for '{sidebar_name}'...")
	
	try:
		if frappe.db.exists("Workspace Sidebar", sidebar_name):
			print(f">>> Sales UI Lock: Workspace Sidebar '{sidebar_name}' already exists")
			return
		
		print(f">>> Sales UI Lock: Creating Workspace Sidebar '{sidebar_name}'...")
		
		sidebar = frappe.get_doc({
			"doctype": "Workspace Sidebar",
			"name": sidebar_name,
			"title": "Sales User",
			"module": "Sales UI Lock",
			"header_icon": "sales-upsell",
			"items": [
				{
					"type": "Link",
					"label": "Home",
					"link_to": workspace_name,
					"link_type": "Workspace",
					"icon": "home",
					"child": 0,
					"collapsible": 1,
					"indent": 0,
					"keep_closed": 0,
					"show_arrow": 0,
				},
				{
					"type": "Link",
					"label": "Customer",
					"link_to": "Customer",
					"link_type": "DocType",
					"icon": "users",
					"child": 0,
					"collapsible": 1,
					"indent": 0,
					"keep_closed": 0,
					"show_arrow": 0,
				},
				{
					"type": "Link",
					"label": "Quotation",
					"link_to": "Quotation",
					"link_type": "DocType",
					"icon": "clipboard",
					"child": 0,
					"collapsible": 1,
					"indent": 0,
					"keep_closed": 0,
					"show_arrow": 0,
				},
				{
					"type": "Link",
					"label": "Sales Order",
					"link_to": "Sales Order",
					"link_type": "DocType",
					"icon": "clipboard",
					"child": 0,
					"collapsible": 1,
					"indent": 0,
					"keep_closed": 0,
					"show_arrow": 0,
				},
			]
		})
		
		sidebar.flags.ignore_permissions = True
		sidebar.insert()
		frappe.db.commit()
		frappe.clear_cache(doctype="Workspace Sidebar")
		frappe.clear_cache()
		print(f">>> Sales UI Lock: Successfully created Workspace Sidebar '{sidebar_name}'")
		
	except Exception as e:
		print(f">>> Sales UI Lock: ERROR creating Workspace Sidebar - {str(e)}")
		frappe.log_error(
			title="Sales UI Lock Workspace Sidebar Creation - ERROR",
			message=frappe.get_traceback(),
		)


def cleanup_old_workspaces():
	"""
	Remove old/renamed workspaces to prevent duplicates.
	Called after install and can be called after migrate.
	"""
	# Add any old workspace names here if you rename workspaces in the future
	old_workspaces = []

	for ws_name in old_workspaces:
		if frappe.db.exists("Workspace", ws_name):
			try:
				frappe.delete_doc("Workspace", ws_name, force=True, ignore_permissions=True)
				frappe.db.commit()
				print(f"Deleted old workspace: {ws_name}")
			except Exception as e:
				print(f"Could not delete workspace {ws_name}: {e}")


def fix_settings_defaults():
	"""
	Fix default values for settings fields if needed.
	Currently a placeholder for future settings.
	"""
	pass
