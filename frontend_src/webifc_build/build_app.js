// Build the BIM Viewer app bundle: plain IIFE, no imports (app reads the
// window.IFCEngine / window.WebIFC globals loaded by the page script).
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['../bim_viewer_app.js'],
  bundle: true,
  format: 'iife',
  minify: false,
  outfile: '../../construction_bim/public/js/bim_viewer.bundle.js',
  logLevel: 'silent',
}).then(() => console.log('Done')).catch((e) => { console.error('ERROR', e && e.message); process.exit(1); });
