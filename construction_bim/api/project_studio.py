# Copyright (c) 2026, zuilsoft03 and contributors
# For license information, please see license.txt

import os
import json
import frappe
from frappe import _
from frappe.utils import flt, cint, nowdate, get_datetime, now_datetime


def _doctype_exists(doctype):
	"""Checks whether a DocType exists in schema or mock test tables."""
	if frappe.db.exists("DocType", doctype):
		return True
	if hasattr(frappe.db, "_tables") and doctype in frappe.db._tables:
		return True
	return not frappe.db.exists("DocType", "DocType")


@frappe.whitelist()
def list_projects(include_archived=0, search_query=None):
	"""Returns all projects with hierarchical structure, health status, favorites, and storage stats."""
	include_archived = cint(include_archived)
	
	filters = {}
	if not include_archived:
		filters["is_active"] = "Yes"

	projects = frappe.get_all(
		"Project",
		filters=filters,
		fields=[
			"name",
			"project_name",
			"status",
			"is_active",
			"percent_complete_method",
			"percent_complete",
			"expected_start_date",
			"expected_end_date",
			"creation",
			"modified",
		],
		order_by="modified desc",
		limit_page_length=500,
	)

	result = []
	for p in projects:
		# Retrieve custom fields safely
		doc = frappe.get_doc("Project", p.name)
		
		# Hierarchy / parent
		parent_project = getattr(doc, "parent_project", None)
		is_favorite = cint(getattr(doc, "is_favorite", 0))
		is_template = cint(getattr(doc, "is_template", 0))
		health_status = getattr(doc, "health_status", None) or ("On Track" if doc.status == "Open" else doc.status)
		status_narrative = getattr(doc, "status_narrative", "") or ""

		# Calculate subproject count
		subprojects_count = frappe.db.count("Project", {"parent_project": p.name}) if hasattr(doc, "parent_project") else 0

		# Calculate file storage utilization
		files = frappe.get_all(
			"File",
			filters={"attached_to_doctype": "Project", "attached_to_name": p.name},
			fields=["file_size"]
		)
		disk_usage_bytes = sum([flt(f.file_size) for f in files if f.file_size])

		# Model count
		model_count = frappe.db.count("BIM Model", {"project": p.name}) if _doctype_exists("BIM Model") else 0

		# Work package counts
		wp_count = frappe.db.count("Task", {"project": p.name})

		if search_query:
			q = search_query.lower()
			if q not in p.name.lower() and q not in (p.project_name or "").lower():
				continue

		result.append({
			"name": p.name,
			"project_name": p.project_name or p.name,
			"status": p.status,
			"health_status": health_status,
			"status_narrative": status_narrative,
			"percent_complete": flt(p.percent_complete),
			"parent_project": parent_project,
			"is_favorite": is_favorite,
			"is_template": is_template,
			"is_active": p.is_active,
			"created_on": str(p.creation).split(" ")[0],
			"latest_activity_at": str(p.modified).split(" ")[0],
			"disk_usage_bytes": disk_usage_bytes,
			"disk_usage_formatted": _format_bytes(disk_usage_bytes),
			"subprojects_count": subprojects_count,
			"model_count": model_count,
			"work_package_count": wp_count,
		})

	return result


@frappe.whitelist()
def get_project_overview(project):
	"""Returns the 7-widget dashboard metrics matching OpenProject BIM Project Home."""
	if not frappe.db.exists("Project", project):
		frappe.throw(_("Project {0} not found.").format(project))

	doc = frappe.get_doc("Project", project)

	# 1. Summary details
	summary = {
		"name": doc.name,
		"project_name": doc.project_name or doc.name,
		"description": getattr(doc, "notes", "") or getattr(doc, "description", "") or _("No description provided."),
		"expected_start_date": doc.expected_start_date,
		"expected_end_date": doc.expected_end_date,
		"percent_complete": flt(doc.percent_complete),
		"status": doc.status,
		"health_status": getattr(doc, "health_status", None) or "On Track",
		"status_narrative": getattr(doc, "status_narrative", None) or _("All tasks and sub-projects are progressing according to baseline schedule."),
		"is_favorite": cint(getattr(doc, "is_favorite", 0)),
		"is_template": cint(getattr(doc, "is_template", 0)),
	}

	# 2. Timeline Milestones (Diamonds)
	milestones = []
	# Gather from native Task milestones
	tasks = frappe.get_all(
		"Task",
		filters={"project": project},
		fields=["name", "subject", "exp_end_date", "status", "is_milestone", "work_package_type"],
		order_by="exp_end_date asc",
		limit_page_length=200
	)
	for t in tasks:
		if getattr(t, "is_milestone", 0) or str(getattr(t, "work_package_type", "")).lower() == "milestone":
			milestones.append({
				"id": t.name,
				"title": t.subject,
				"due_date": str(t.exp_end_date) if t.exp_end_date else None,
				"status": t.status,
				"completed": 1 if t.status in ["Completed", "Closed"] else 0
			})

	# Also gather from Construction Contract Milestones if contract linked
	contract_name = getattr(doc, "construction_contract", None)
	if contract_name and frappe.db.exists("Construction Contract", contract_name):
		contract_doc = frappe.get_doc("Construction Contract", contract_name)
		for cm in getattr(contract_doc, "milestones", []):
			milestones.append({
				"id": f"{contract_name}-{cm.idx}",
				"title": cm.milestone_name,
				"due_date": str(cm.due_date) if cm.due_date else None,
				"status": "In Progress",
				"completed": 0
			})

	# Sort milestones by due date
	milestones.sort(key=lambda m: m["due_date"] or "9999-99-99")

	# 3. Subprojects
	subprojects = []
	sub_docs = frappe.get_all(
		"Project",
		filters={"parent_project": project},
		fields=["name", "project_name", "status", "percent_complete"],
		limit_page_length=50
	)
	for s in sub_docs:
		sub_doc = frappe.get_doc("Project", s.name)
		subprojects.append({
			"name": s.name,
			"project_name": s.project_name or s.name,
			"status": getattr(sub_doc, "health_status", None) or s.status or "On Track",
			"percent_complete": flt(s.percent_complete)
		})

	# 4. Meetings & Daily Toolbox Talks
	meetings = []
	if _doctype_exists("Toolbox Talk"):
		fields = ["name", "date", "attendee_count"]
		meta_fields = [f.fieldname for f in frappe.get_meta("Toolbox Talk").fields] if hasattr(frappe, "get_meta") else []
		if "topic" in meta_fields:
			fields.append("topic")
		elif "topic_category" in meta_fields:
			fields.append("topic_category")
		else:
			fields.append("topic")

		if "conducted_by" in meta_fields:
			fields.append("conducted_by")
		elif "conductor_name" in meta_fields:
			fields.append("conductor_name")

		tbts = frappe.get_all(
			"Toolbox Talk",
			filters={"project": project},
			fields=fields,
			order_by="date desc",
			limit_page_length=5
		)
		for tb in tbts:
			meetings.append({
				"type": "Toolbox Talk",
				"name": tb.name,
				"title": getattr(tb, "topic", None) or getattr(tb, "topic_category", None) or tb.name,
				"date": str(tb.date),
				"host": getattr(tb, "conducted_by", None) or getattr(tb, "conductor_name", None) or "Safety Officer",
				"participants": getattr(tb, "attendee_count", 0)
			})

	# Native Event / Meetings
	if _doctype_exists("Event"):
		events = frappe.get_all(
			"Event",
			filters={"starts_on": [">=", nowdate()]},
			fields=["name", "subject", "starts_on"],
			limit_page_length=5
		)
		for ev in events:
			meetings.append({
				"type": "Meeting",
				"name": ev.name,
				"title": ev.subject,
				"date": str(ev.starts_on).split(" ")[0],
				"host": "Coordination Lead",
				"participants": 0
			})

	# 5. Members & Roles
	members = []
	if hasattr(doc, "users") and doc.users:
		for u in doc.users:
			user_info = frappe.db.get_value("User", u.user, ["full_name", "user_image"], as_dict=True) or {}
			members.append({
				"user": u.user,
				"full_name": user_info.get("full_name") or u.user,
				"user_image": user_info.get("user_image"),
				"role": "Project Member"
			})
	else:
		# Fallback to project owner
		user_info = frappe.db.get_value("User", doc.owner, ["full_name", "user_image"], as_dict=True) or {}
		members.append({
			"user": doc.owner,
			"full_name": user_info.get("full_name") or doc.owner,
			"user_image": user_info.get("user_image"),
			"role": "Project Admin"
		})

	# 6. News & Bulletins
	news = [
		{
			"title": _("Welcome to {0}").format(doc.project_name or doc.name),
			"date": str(doc.creation).split(" ")[0],
			"author": "OpenProject Admin",
			"content": _("Project initialized. BIM coordination, PM² governance, and task management enabled.")
		}
	]

	# Check for recent OSH Incidents or Variations as news bulletins
	if _doctype_exists("OSH Incident Report"):
		incidents = frappe.get_all(
			"OSH Incident Report",
			filters={"project": project},
			fields=["name", "incident_type", "incident_date", "root_cause"],
			order_by="incident_date desc",
			limit_page_length=2
		)
		for inc in incidents:
			news.append({
				"title": f"Safety Alert: {inc.incident_type}",
				"date": str(inc.incident_date).split(" ")[0],
				"author": "Safety Officer",
				"content": inc.root_cause or _("CAPA in progress.")
			})

	return {
		"summary": summary,
		"milestones": milestones,
		"subprojects": subprojects,
		"meetings": meetings,
		"members": members,
		"news": news
	}


@frappe.whitelist()
def list_work_packages(project, filter_key=None, type_filter=None, search=None):
	"""Returns hierarchical work packages with color-coded type pills, status, assignees, and filters."""
	if not frappe.db.exists("Project", project):
		frappe.throw(_("Project {0} not found.").format(project))

	filters = {"project": project}

	if filter_key == "all_open":
		filters["status"] = ["not in", ["Completed", "Cancelled", "Closed"]]
	elif filter_key == "overdue":
		filters["exp_end_date"] = ["<", nowdate()]
		filters["status"] = ["not in", ["Completed", "Cancelled", "Closed"]]
	elif filter_key == "assigned_to_me":
		filters["_assign"] = ["like", f"%{frappe.session.user}%"]
	elif filter_key == "created_by_me":
		filters["owner"] = frappe.session.user

	tasks = frappe.get_all(
		"Task",
		filters=filters,
		fields=[
			"name",
			"subject",
			"type",
			"status",
			"priority",
			"parent_task",
			"exp_start_date",
			"exp_end_date",
			"progress",
			"creation",
			"modified",
			"owner"
		],
		order_by="creation desc",
		limit_page_length=500
	)

	VALID_WP_TYPES = ["Task", "Milestone", "Phase", "Issue", "Remark", "Request", "Clash"]
	WP_TYPE_MAP = {t.lower(): t for t in VALID_WP_TYPES}

	items = []
	for t in tasks:
		doc = frappe.get_doc("Task", t.name)
		raw_type = getattr(doc, "work_package_type", None) or t.type or "Task"
		wp_type = WP_TYPE_MAP.get(str(raw_type).strip().lower(), "Task")
		
		# Type filter check
		if type_filter and type_filter.lower() != "all" and wp_type.lower() != type_filter.lower():
			continue

		if search:
			q = search.lower()
			if q not in t.name.lower() and q not in (t.subject or "").lower():
				continue

		# Assignee
		assignee = None
		assignee_name = None
		if callable(getattr(doc, "get_assigned_users", None)):
			assignees = doc.get_assigned_users()
			if assignees:
				assignee = list(assignees)[0]
				assignee_name = frappe.db.get_value("User", assignee, "full_name") or assignee

		items.append({
			"id": t.name,
			"subject": t.subject or t.name,
			"type": wp_type,
			"status": t.status,
			"priority": t.priority or "Normal",
			"parent_task": t.parent_task,
			"exp_start_date": str(t.exp_start_date) if t.exp_start_date else None,
			"exp_end_date": str(t.exp_end_date) if t.exp_end_date else None,
			"progress": flt(t.progress),
			"assignee": assignee,
			"assignee_name": assignee_name,
			"bcf_topic": getattr(doc, "bcf_topic", None),
			"rfi_link": getattr(doc, "rfi_link", None),
		})

	return items


@frappe.whitelist()
def quick_create_work_package(project, wp_type, subject, description=None, priority="Normal", assignee=None, due_date=None, parent_wp=None):
	"""Polymorphically creates a work package (Task, Milestone, Phase, Issue, Remark, Request, Clash)."""
	if not frappe.db.exists("Project", project):
		frappe.throw(_("Project {0} not found.").format(project))

	VALID_WP_TYPES = ["Task", "Milestone", "Phase", "Issue", "Remark", "Request", "Clash"]
	WP_TYPE_MAP = {t.lower(): t for t in VALID_WP_TYPES}
	normalized_type = WP_TYPE_MAP.get(str(wp_type).strip().lower(), "Task")

	task = frappe.new_doc("Task")
	task.project = project
	task.subject = subject
	task.description = description or subject
	task.priority = priority or "Normal"
	task.status = "Open"
	task.exp_end_date = due_date
	task.parent_task = parent_wp
	task.work_package_type = normalized_type

	if normalized_type == "Milestone":
		task.is_milestone = 1

	task.insert(ignore_permissions=True)

	# Assignee setup
	if assignee and frappe.db.exists("User", assignee) and callable(getattr(task, "add_assign", None)):
		task.add_assign(assignee)

	# Polymorphic domain link creation
	linked_doc_name = None
	if wp_type.lower() == "clash" and _doctype_exists("BCF Topic"):
		topic = frappe.new_doc("BCF Topic")
		topic.project = project
		topic.title = subject
		topic.topic_type = "Clash"
		topic.priority = priority
		topic.description = description
		topic.insert(ignore_permissions=True)
		task.bcf_topic = topic.name
		task.save(ignore_permissions=True)
		linked_doc_name = topic.name

	elif wp_type.lower() == "request" and _doctype_exists("RFI"):
		rfi = frappe.new_doc("RFI")
		rfi.project = project
		rfi.rfi_title = subject
		rfi.question = description or subject
		rfi.status = "Open"
		rfi.insert(ignore_permissions=True)
		task.rfi_link = rfi.name
		task.save(ignore_permissions=True)
		linked_doc_name = rfi.name

	elif wp_type.lower() == "issue" and _doctype_exists("Issue"):
		issue = frappe.new_doc("Issue")
		issue.subject = subject
		issue.project = project
		issue.description = description
		issue.insert(ignore_permissions=True)
		linked_doc_name = issue.name

	return {
		"id": task.name,
		"subject": task.subject,
		"type": normalized_type,
		"status": task.status,
		"linked_doc": linked_doc_name
	}


@frappe.whitelist()
def get_kanban_board_data(project, group_by="status"):
	"""Returns kanban columns and cards grouped by status, priority, or assignee."""
	items = list_work_packages(project, filter_key="all_open")

	if group_by == "priority":
		columns = [
			{"id": "Low", "title": _("Low"), "cards": []},
			{"id": "Normal", "title": _("Normal"), "cards": []},
			{"id": "High", "title": _("High"), "cards": []},
			{"id": "Urgent", "title": _("Urgent"), "cards": []}
		]
		col_map = {c["id"]: c for c in columns}
		for it in items:
			p = it.get("priority") or "Normal"
			if p in col_map:
				col_map[p]["cards"].append(it)
			else:
				col_map["Normal"]["cards"].append(it)

	elif group_by == "assignee":
		columns = [
			{"id": "unassigned", "title": _("Unassigned"), "cards": []}
		]
		col_map = {"unassigned": columns[0]}
		for it in items:
			a = it.get("assignee")
			if not a:
				col_map["unassigned"]["cards"].append(it)
			else:
				if a not in col_map:
					new_col = {"id": a, "title": it.get("assignee_name") or a, "cards": []}
					columns.append(new_col)
					col_map[a] = new_col
				col_map[a]["cards"].append(it)

	else:  # Default: status
		columns = [
			{"id": "Open", "title": _("New / Open"), "cards": []},
			{"id": "Working", "title": _("In Progress"), "cards": []},
			{"id": "Pending Review", "title": _("Resolved / Review"), "cards": []},
			{"id": "Completed", "title": _("Closed"), "cards": []}
		]
		col_map = {c["id"]: c for c in columns}
		for it in items:
			s = it.get("status") or "Open"
			if s in col_map:
				col_map[s]["cards"].append(it)
			elif s in ["In Progress", "Working"]:
				col_map["Working"]["cards"].append(it)
			elif s in ["Closed", "Completed"]:
				col_map["Completed"]["cards"].append(it)
			else:
				col_map["Open"]["cards"].append(it)

	return {"group_by": group_by, "columns": columns}


@frappe.whitelist()
def update_work_package_status(task_name, new_column, group_by="status"):
	"""Updates task property on Kanban drag-and-drop."""
	if not frappe.db.exists("Task", task_name):
		frappe.throw(_("Task {0} not found.").format(task_name))

	task = frappe.get_doc("Task", task_name)
	if group_by == "status":
		task.status = new_column
	elif group_by == "priority":
		task.priority = new_column
	elif group_by == "assignee":
		if new_column != "unassigned" and callable(getattr(task, "add_assign", None)):
			task.add_assign(new_column)

	task.save(ignore_permissions=True)
	return {"status": "success", "task": task.name, "new_value": new_column}


@frappe.whitelist()
def get_bcf_coordination_data(project):
	"""Returns BIM models and BCF topics associated with the project."""
	models = []
	if _doctype_exists("BIM Model"):
		m_list = frappe.get_all(
			"BIM Model",
			filters={"project": project},
			fields=["name", "model_name", "original_file", "geometry_file", "discipline"],
			limit_page_length=50
		)
		for m in m_list:
			models.append({
				"name": m.name,
				"model_name": m.model_name or m.name,
				"file_url": getattr(m, "original_file", None) or getattr(m, "geometry_file", None),
				"discipline": getattr(m, "discipline", "Architecture")
			})

	topics = []
	if _doctype_exists("BCF Topic"):
		bcf_projs = frappe.get_all("BCF Project", filters={"erpnext_project": project}, pluck="name") if _doctype_exists("BCF Project") else []
		topic_filters = {}
		if bcf_projs:
			topic_filters["bcf_project"] = ["in", bcf_projs]

		t_list = frappe.get_all(
			"BCF Topic",
			filters=topic_filters if bcf_projs else None,
			fields=["name", "title", "topic_type", "priority", "topic_status", "creation", "assigned_to"],
			limit_page_length=50
		)
		for t in t_list:
			topics.append({
				"name": t.name,
				"title": t.title,
				"topic_type": t.topic_type or "Clash",
				"priority": t.priority or "Normal",
				"status": getattr(t, "topic_status", "Open"),
				"creation": str(t.creation),
				"assigned_to": t.assigned_to
			})

	return {"models": models, "topics": topics}


@frappe.whitelist()
def get_project_document_tree(project):
	"""Returns the 5-folder project taxonomy with auto-launchers for BIM, CAD, and PDF."""
	if not frappe.db.exists("Project", project):
		frappe.throw(_("Project {0} not found.").format(project))

	folders = [
		{"folder_name": "01 Contracts & NTP", "icon": "fa fa-file-text-o", "files": []},
		{"folder_name": "02 Drawings & Specs", "icon": "fa fa-pencil-square-o", "files": []},
		{"folder_name": "03 BIM Models", "icon": "fa fa-cube", "files": []},
		{"folder_name": "04 BOQ & Estimates", "icon": "fa fa-table", "files": []},
		{"folder_name": "05 Site Media", "icon": "fa fa-camera", "files": []},
	]
	folder_map = {f["folder_name"]: f for f in folders}

	# Retrieve all attached files for Project and its sub-records
	attached_files = frappe.get_all(
		"File",
		filters={"attached_to_doctype": "Project", "attached_to_name": project},
		fields=["name", "file_name", "file_url", "file_size", "creation"],
		order_by="creation desc"
	)

	# Also gather BIM Models
	seen_ifc_urls = set()
	if _doctype_exists("BIM Model"):
		models = frappe.get_all("BIM Model", filters={"project": project}, fields=["name", "model_name", "original_file", "geometry_file"])
		for m in models:
			file_url = getattr(m, "original_file", None) or getattr(m, "geometry_file", None)
			if file_url:
				seen_ifc_urls.add(file_url)
				folder_map["03 BIM Models"]["files"].append({
					"id": m.name,
					"model_id": m.name,
					"file_name": m.model_name or os.path.basename(file_url),
					"file_url": file_url,
					"file_size": 0,
					"extension": "ifc",
					"route_target": "bim",
					"badge": "3D IFC"
				})

	# Categorize project files
	for f in attached_files:
		ext = (f.file_name or "").split(".")[-1].lower()
		target_route = "default"
		target_folder = "01 Contracts & NTP"
		badge = ext.upper()

		if ext in ["ifc"]:
			if f.file_url in seen_ifc_urls:
				continue
			model_id = None
			if _doctype_exists("BIM Model"):
				existing = frappe.db.get_value("BIM Model", {"original_file": f.file_url}, "name")
				if not existing:
					try:
						from construction_bim.bim.api import create_model_from_ifc
						res = create_model_from_ifc(
							file_url=f.file_url,
							file_name=f.file_name,
							project=project,
							model_name=(f.file_name or "BIM Model").rsplit(".", 1)[0],
							discipline="Architecture"
						)
						existing = res.get("name")
					except Exception:
						pass
				model_id = existing

			seen_ifc_urls.add(f.file_url)
			target_route = "bim"
			target_folder = "03 BIM Models"
			badge = "3D IFC"
			folder_map[target_folder]["files"].append({
				"id": f.name,
				"model_id": model_id or f.name,
				"file_name": f.file_name,
				"file_url": f.file_url,
				"file_size": flt(f.file_size),
				"file_size_formatted": _format_bytes(flt(f.file_size)),
				"extension": ext,
				"route_target": target_route,
				"badge": badge
			})
			continue
		elif ext in ["dwg", "dxf"]:
			target_route = "cad"
			target_folder = "02 Drawings & Specs"
			badge = "2D CAD"
		elif ext in ["pdf"]:
			target_route = "pdf"
			target_folder = "02 Drawings & Specs"
			badge = "PDF PLAN"
		elif ext in ["xlsx", "xls", "csv"]:
			target_folder = "04 BOQ & Estimates"
			badge = "ESTIMATE"
		elif ext in ["jpg", "jpeg", "png", "webp"]:
			target_folder = "05 Site Media"
			badge = "PHOTO"

		folder_map[target_folder]["files"].append({
			"id": f.name,
			"file_name": f.file_name,
			"file_url": f.file_url,
			"file_size": flt(f.file_size),
			"file_size_formatted": _format_bytes(flt(f.file_size)),
			"extension": ext,
			"route_target": target_route,
			"badge": badge
		})

	return folders


@frappe.whitelist()
def update_project_settings(project, settings_json):
	"""Updates project properties (health_status, status_narrative, is_template, is_favorite, parent_project)."""
	if not frappe.db.exists("Project", project):
		frappe.throw(_("Project {0} not found.").format(project))

	data = json.loads(settings_json) if isinstance(settings_json, str) else settings_json
	doc = frappe.get_doc("Project", project)

	if "project_name" in data:
		doc.project_name = data["project_name"]
	if "health_status" in data:
		doc.health_status = data["health_status"]
	if "status_narrative" in data:
		doc.status_narrative = data["status_narrative"]
	if "is_template" in data:
		doc.is_template = cint(data["is_template"])
	if "is_favorite" in data:
		doc.is_favorite = cint(data["is_favorite"])
	if "parent_project" in data:
		doc.parent_project = data["parent_project"] or None
	if "is_active" in data:
		doc.is_active = "Yes" if data["is_active"] in [1, True, "Yes"] else "No"

	doc.save(ignore_permissions=True)
	return {"status": "success", "project": doc.name}


@frappe.whitelist()
def clone_project_from_template(template_project, new_project_name, client=None, expected_start_date=None):
	"""Clones a project from a template project including PM² phases and milestones."""
	if not frappe.db.exists("Project", template_project):
		frappe.throw(_("Template Project {0} not found.").format(template_project))

	tmpl = frappe.get_doc("Project", template_project)

	new_proj = frappe.new_doc("Project")
	new_proj.project_name = new_project_name
	new_proj.customer = client or tmpl.customer
	new_proj.expected_start_date = expected_start_date or nowdate()
	new_proj.status = "Open"
	new_proj.is_active = "Yes"
	new_proj.health_status = "On Track"
	new_proj.insert(ignore_permissions=True)

	# Clone PM² Project Phases if Project Phase exists
	if _doctype_exists("Project Phase"):
		phases = frappe.get_all("Project Phase", filters={"project": template_project}, fields=["name"])
		for ph_name in phases:
			ph_doc = frappe.get_doc("Project Phase", ph_name.name)
			new_ph = frappe.new_doc("Project Phase")
			new_ph.project = new_proj.name
			new_ph.phase_name = ph_doc.phase_name
			new_ph.phase_order = ph_doc.phase_order
			new_ph.status = "Not Started"
			for gate in getattr(ph_doc, "gate_checklist", []):
				new_ph.append("gate_checklist", {
					"gate_item": gate.gate_item,
					"required": gate.required,
					"is_completed": 0
				})
			new_ph.insert(ignore_permissions=True)

	# Clone Milestones and Tasks
	tasks = frappe.get_all("Task", filters={"project": template_project}, fields=["name"])
	for t_name in tasks:
		t_doc = frappe.get_doc("Task", t_name.name)
		new_t = frappe.new_doc("Task")
		new_t.project = new_proj.name
		new_t.subject = t_doc.subject
		new_t.work_package_type = getattr(t_doc, "work_package_type", "Task")
		new_t.is_milestone = getattr(t_doc, "is_milestone", 0)
		new_t.priority = t_doc.priority
		new_t.status = "Open"
		new_t.insert(ignore_permissions=True)

	return {
		"status": "success",
		"new_project": new_proj.name,
		"project_name": new_proj.project_name
	}


def _format_bytes(bytes_val):
	"""Helper to format byte count into readable KB/MB/GB string."""
	bytes_val = flt(bytes_val)
	if bytes_val < 1024:
		return f"{int(bytes_val)} Bytes"
	elif bytes_val < 1024 * 1024:
		return f"{bytes_val / 1024:.1f} KB"
	elif bytes_val < 1024 * 1024 * 1024:
		return f"{bytes_val / (1024 * 1024):.1f} MB"
	else:
		return f"{bytes_val / (1024 * 1024 * 1024):.2f} GB"