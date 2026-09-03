const assert = require("assert");
const fs = require("fs");
const path = require("path");

// Test OpenProject BIM Project Studio Tabs & Panes
console.log("=====================================================================");
console.log("Starting TDD Suite: OpenProject BIM Project Studio Tabs & Panes");
console.log("======================================================================");

const htmlPath = path.resolve(__dirname, "../construction_bim/bim/page/project_studio/project_studio.html");
const jsAppPath = path.resolve(__dirname, "../frontend_src/project_studio_app.js");

const htmlContent = fs.readFileSync(htmlPath, "utf-8");
const jsContent = fs.readFileSync(jsAppPath, "utf-8");

let passed = 0;
let failed = 0;

/**
 * Runs a test assertion and records whether it passes or fails.
 * @param {string} title - The test description displayed in the result output.
 * @param {Function} fn - The assertion function to execute.
 */
function test(title, fn) {
	try {
		fn();
		console.log(`  ✓ ${title}`);
		passed++;
	} catch (err) {
		console.error(`  ✈ ${title}`);
		console.error(`    ${err.message}`);
		failed++;
	}
}

// 1. Navigation Tabs
test("Sidebar contains all 11 required navigation tabs", () => {
	const expectedTabs = [
		"home", "work-packages", "boards", "gantt", "bcf", "cad", "pdf", "documents", "meetings", "members", "settings"
	];
	expectedTabs.forEach(tab => {
		const regex = new RegExp(`data-tab=[\"']${tab}["']`, "i");
		assert(regex.test(htmlContent), `Sidebar must contain nav item with data-tab="${tab}"`);
	});
});

// 2. Viewport Panes
test("Viewport contains all 12 view containers (#view-*)", () => {
	const expectedViews = [
		"view-all-projects", "view-home", "view-work-packages", "view-boards", "view-gantt", "view-bcf",
		"view-cad", "view-pdf", "view-documents", "view-meetings", "view-members", "view-settings"
	];
	expectedViews.forEach(viewId => {
		const regex = new RegExp(`id=[\"']${viewId}["']`, "i");
		assert(regex.test(htmlContent), `Viewport must contain container #${viewId}`);
	});
});

// 3. Quick Create
test("Quick-Create dropdown contains all 7 work package types and project actions", () => {
	const expectedTypes = ["TASK", "MILESTONE", "PHASE", "ISSUE", "REMARK", "REQUEST", "CLASH"];
	expectedTypes.forEach(type => {
		const regex = new RegExp(`data-type=[\"']${type}[\"']`, "i");
		assert(regex.test(htmlContent), `Quick create dropdown must have data-type="${type}"`);
	});
	assert(/data-type=["']project[\"']/i.test(htmlContent), "Quick create dropdown must support project creation");
	assert(/data-type=[\"']user[\"']/i.test(htmlContent), "Quick create dropdown must support user invitation");
});

// 4. BCF 2-Pane Viewport
test("BCF view contains spatial model tree, 3D canvas, and floating drawer", () => {
	assert(/id=["']bcf-models-tree["']/i.test(htmlContent), "BCF view must contain #bcf-models-tree");
	assert(/id=[\"']bcf-webgl-container[\"']/i.test(htmlContent), "BCF view must contain #bcf-webgl-container");
	assert(/id=[\"']bcf-floating-drawer[\"']/i.test(htmlContent), "BCF view must contain #bcf-floating-drawer");
	assert(/id=[\"']bcf-cards-container[\"']/i.test(htmlContent), "BCF view must contain #bcf-cards-container");
});

// 5. CAD and PDF Takeoff
test("CAD and PDF tabs embed iframe studios with standalone launcher links", () => {
	assert(/id=[\"']iframe-dwg-viewer[\"']/i.test(htmlContent), "CAD tab must embed #iframe-dwg-viewer");
	assert(/id=[\"']iframe-pdf-viewer[\"']/i.test(htmlContent), "PDF tab must embed #iframe-pdf-viewer");
	assert(/id=[\"']btn-open-dwg-fullscreen[\"']/i.test(htmlContent), "CAD tab must have standalone launch button");
	assert(/id=[\"']btn-open-pdf-fullscreen[\"']/i.test(htmlContent), "PDF tab must have standalone launch button");
});

// 6. Project Documents File Tree
test("Documents view contains folders container and file upload trigger", () => {
	assert(/id=[\"']document-folders-container[\"']/i.test(htmlContent), "Documents tab must contain #document-folders-container");
	assert(/id=[\"']btn-upload-document[\"']/i.test(htmlContent), "Documents tab must contain #btn-upload-document");
});

// 7. Client SPA switchTab Handlers
test("ProjectStudioApp switchTab handles all 11 tab keys", () => {
	const expectedHandlers = [
		"home", "work-packages", "boards", "gantt", "bcf", "cad", "pdf", "documents", "meetings", "members", "settings"
	];
	expectedHandlers.forEach(tab => {
		const check = `tabKey === '${tab}'`;
		assert(jsContent.includes(check), `ProjectStudioApp.switchTab must handle ${check}`);
	});
});

console.log("----------------------------------------------------------------------");
console.log(`Summary: ${passed} passed, ${failed} failed`);
console.log("======================================================================");

if (failed > 0) {
	process.exit(1);
} else {
	process.exit(0);
}
