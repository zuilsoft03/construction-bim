import frappe
frappe.init("local.dev")
frappe.connect()

tables = [r[0] for r in frappe.db.sql("SHOW TABLES")]
auth_tables = [t for t in tables if "auth" in t.lower() or "password" in t.lower()]
print("auth-ish tables:", auth_tables)

# the actual __Auth table exists under some name? check with db list
like_tables = [t for t in tables if "Auth" in t]
print("tables with 'Auth':", like_tables)

# try querying __Auth directly
try:
    rows = frappe.db.sql("SELECT doctype, name, fieldname, length(password) AS plen FROM `__Auth` LIMIT 5", as_dict=True)
    print("__Auth rows:", rows)
except Exception as e:
    print("__Auth direct err:", type(e).__name__, str(e)[:120])
