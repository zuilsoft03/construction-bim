#!/usr/bin/env bash
set -euo pipefail
APP_SRC="C:/Users/gavie/ERP/construction_bim"
for svc in erpnext-full-backend-1 erpnext-full-frontend-1 erpnext-full-queue-short-1 erpnext-full-queue-long-1 erpnext-full-scheduler-1; do
  echo "== syncing into $svc"
  docker cp "$APP_SRC/." "$svc:/home/frappe/frappe-bench/apps/construction_bim/"
done
docker exec erpnext-full-frontend-1 ln -sfn /home/frappe/frappe-bench/apps/construction_bim/construction_bim/public /home/frappe/frappe-bench/assets/construction_bim 2>/dev/null || true
# docker cp lands files as root; the bench runs as frappe and build needs write access
docker exec -u root erpnext-full-backend-1 bash -lc 'chown -R frappe:frappe /home/frappe/frappe-bench/apps/construction_bim' 2>/dev/null || true
docker exec erpnext-full-backend-1 bash -lc 'grep -q "construction_bim" /home/frappe/frappe-bench/sites/apps.txt || echo "construction_bim" >> /home/frappe/frappe-bench/sites/apps.txt'
docker exec erpnext-full-backend-1 bash -lc 'export PATH="/home/frappe/.nvm/versions/node/v24.12.0/bin:$PATH" && cd /home/frappe/frappe-bench && bench --site localhost migrate 2>&1 | tail -2 && bench --site localhost execute frappe.model.sync.sync_for --args "[\"construction_bim\"]" 2>&1 | tail -1 && bench --site localhost build --app construction_bim 2>&1 | tail -1 && bench --site localhost clear-cache'
docker restart erpnext-full-backend-1 erpnext-full-frontend-1
echo "SYNC OK — hard-refresh (Ctrl+F5) http://localhost:8000/app/construction after restart (~15s)"
