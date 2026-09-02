#!/usr/bin/env bash
set -euo pipefail
APP_SRC="C:/Users/gavie/ERP/construction_bim"
for svc in erpnext-full-backend-1 erpnext-full-queue-short-1 erpnext-full-queue-long-1 erpnext-full-scheduler-1; do
  echo "== syncing into $svc"
  docker cp "$APP_SRC/." "$svc:/home/frappe/frappe-bench/apps/construction_bim/"
done
docker exec erpnext-full-backend-1 bash -lc 'cd /home/frappe/frappe-bench && bench --site local.dev migrate 2>&1 | tail -3 && bench --site local.dev build --app construction_bim 2>&1 | tail -3 && bench --site local.dev clear-cache'
docker restart erpnext-full-backend-1 erpnext-full-frontend-1
echo "SYNC OK — hard-refresh (Ctrl+F5) http://localhost:8000/app/construction after restart (~15s)"
