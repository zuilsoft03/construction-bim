// Build the BIM Viewer bundle: app + three r149 + web-ifc + web-ifc-three.
// NOTE: esbuild must resolve 'three' AND 'web-ifc-three' from THIS dir's node_modules
// (three r149 matches web-ifc-three's peer; shim bridges mergeGeometries).
const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

esbuild.build({
  entryPoints: ['../bim_viewer_app.js'],
  bundle: true,
  format: 'iife',
  minify: false,   // esbuild minify breaks web-ifc's Emscripten wasm glue
  outfile: '../../construction_bim/public/js/bim_viewer.bundle.js',
  logLevel: 'info',
  plugins: [{
    name: 'three-exports-fix',
    setup(build) {
      // IMPORTANT: register addons resolver BEFORE the generic three resolver,
      // otherwise esbuild picks the generic one and resolves into a bad path.
      build.onResolve({ filter: /^three\/addons\/(.+)$/ }, args => {
        const rel = args.path.slice('three/addons/'.length);
        let p = path.resolve(__dirname, 'node_modules/three/examples/jsm', rel);
        if (!fs.existsSync(p) && !p.endsWith('.js')) {
          if (fs.existsSync(p + '.js')) p = p + '.js';
          else if (fs.existsSync(p + '.mjs')) p = p + '.mjs';
        }
        return { path: p };
      });
      build.onResolve({ filter: /^three\/examples\/jsm\/utils\/BufferGeometryUtils$/ }, () => {
        return { path: path.resolve(__dirname, 'shim.js') };
      });
      build.onResolve({ filter: /^three\/(.+)$/ }, args => {
        const rel = args.path.slice('three/'.length);
        let p = path.resolve(__dirname, 'node_modules', 'three', rel);
        if (!fs.existsSync(p) && !p.endsWith('.js')) {
          if (fs.existsSync(p + '.js')) p = p + '.js';
          else if (fs.existsSync(p + '.mjs')) p = p + '.mjs';
        }
        return { path: p };
      });
      build.onResolve({ filter: /^three$/ }, () => {
        return { path: path.resolve(__dirname, 'node_modules/three/build/three.module.js') };
      });
      build.onResolve({ filter: /^web-ifc-three$/ }, () => {
        return { path: path.resolve(__dirname, 'node_modules/web-ifc-three/IFCLoader.js') };
      });
      build.onResolve({ filter: /^web-ifc$/ }, () => {
        return { path: path.resolve(__dirname, 'node_modules/web-ifc/web-ifc-api.js') };
      });
    },
  }],
}).catch((e) => { console.error(e); process.exit(1); });
