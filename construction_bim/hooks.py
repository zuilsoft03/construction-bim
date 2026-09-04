app_name = "construction_bim"
app_title = "Project Studio Bim"
app_publisher = "zuilsoft03"
app_description = "BIM module for ERPNext: IFC import, 3D model viewer, element-to-BOQ links, PDF takeoff."
app_email = "zuilsoft03@gmail.com"
app_license = "AGPL-3.0"
app_icon = "octicon octicon-git-branch"
app_color = "grey"
app_home = "/app/project-studio"

add_to_apps_screen = [
	{
		"name": "construction_bim",
		"logo": "/assets/construction_bim/images/bim-logo.svg",
		"title": "Project Studio Bim",
		"route": "/app/project-studio",
	}
]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/construction_bim/css/construction_bim.css"
app_include_js = "/assets/construction_bim/js/construction_bim.js"

# include js, css files in header of web template
# web_include_css = "/assets/construction_bim/css/construction_bim.css"
# web_include_js = "/assets/construction_bim/js/construction_bim.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "construction_bim/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "construction_bim/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "construction_bim.utils.jinja_methods",
# 	"filters": "construction_bim.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "construction_bim.install.before_install"
# after_install = "construction_bim.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "construction_bim.uninstall.before_uninstall"
# after_uninstall = "construction_bim.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps.
# Name of the app being installed is available as __app__

# before_app_install = "construction_bim.utils.before_app_install"
# after_app_install = "construction_bim.utils.after_app_install"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps.
# Name of the app being installed is available as __app__

# before_app_install = "construction_bim.utils.before_app_install"
# after_app_install = "construction_bim.utils.after_app_install"

# Every time you declare a method override, it will be called of the doctype
# being overridden.
# -------------------
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "construction_bim.event.get_events"
# }
# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"construction_bim.tasks.all"
# 	],
# 	"daily": [
# 		"construction_bim.tasks.daily"
# 	],
# 	"hourly": [
# 		"construction_bim.tasks.hourly"
# 	],
# 	"weekly": [
# 		"construction_bim.tasks.weekly"
# 	],
# 	"monthly": [
# 		"construction_bim.tasks.monthly"
# 	]
# }

# Testing
# -------

# before_tests = "construction_bim.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "construction_bim.event.get_events"
# }
#
# each overriding function signature:
# (original_method, *args, **kwargs)
#
# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# linked-doc events
# ---------------------------
doc_events = {
	"Task": {
		"on_update": "construction_bim.bim.bcf.task_sync.sync_task_to_bcf_topic"
	}
}

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"daily": [
# 		"construction_bim.tasks.daily"
# 	]
# }

# Permissions
# -----------

# DocType JS
# ----------
doctype_js = {
	"Project": "public/js/project.js",
}
# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class Overrides
# -----------------------
# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# fixtures = ["Custom Field"]
