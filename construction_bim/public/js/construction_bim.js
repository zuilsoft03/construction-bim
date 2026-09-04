// Project Studio BIM - Desk Router and Interceptor
frappe.provide('frappe.project_studio');

(function () {
	function isConstructionRoute() {
		if (!window.frappe || !frappe.get_route) return false;
		var route = null;
		try {
			route = frappe.get_route();
		} catch (e) {
			return false;
		}
		if (!route || !Array.isArray(route) || route.length === 0) return false;
		var routeStr = route.join("/");

		if (routeStr === "construction" || routeStr === "app/construction") {
			return true;
		}
		if (route[0] === "construction") return true;
		if (route[0] === "app" && route[1] === "construction") return true;
		if (route[0] === "workspaces" && route[1] === "construction") return true;
		return false;
	}

	function redirectToProjectStudio() {
		if (isConstructionRoute()) {
			console.log('[Project Studio BIM] Redirecting desk route directly to project-studio...');
			frappe.set_route('project-studio');
		}
	}

	function updateSidebarLabels() {
		$('.sidebar-item-container[item-name="Construction"] .item-anchor, a[href*="/app/construction"]').each(function () {
			const $el = $(this);
			const currentText = $el.text().trim();
			if (currentText === 'Construction' || currentText === 'Construction BIM') {
				$el.contents().filter(function () {
					return this.nodeType === 3 && this.nodeValue.trim().length > 0;
				}).each(function () {
					this.nodeValue = ' Project Studio Bim';
				});
			}
			if ($el.attr('href') === '/app/construction') {
				$el.attr('href', '/app/project-studio');
			}
		});
	}

	if (window.frappe && frappe.router && frappe.router.on) {
		frappe.router.on('change', function () {
			redirectToProjectStudio();
			setTimeout(updateSidebarLabels, 100);
		});
	}

	$(document).ready(function () {
		redirectToProjectStudio();
		setTimeout(redirectToProjectStudio, 50);
		setTimeout(redirectToProjectStudio, 200);
		setTimeout(redirectToProjectStudio, 500);

		updateSidebarLabels();
		setTimeout(updateSidebarLabels, 300);
		setTimeout(updateSidebarLabels, 1000);
	});
})();
