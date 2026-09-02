// Build script: bundle web-ifc engine (three + web-ifc + web-ifc-three) into IIFE.
//
// Two fixes for version drift:
//  1. web-ifc-three 0.0.126 imports 'three/examples/jsm/utils/BufferGeometryUtils'
//     WITHOUT .js — esbuild resolves it fine on older three maps, but we add a
//     resolve plugin that appends .js and maps the specifier to shim.js.
//  2. three 0.149 exports mergeBufferGeometries while web-ifc-three 0.0.126
//     imports mergeGeometries — shim.js re-exports under the new name.
const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

esbuild.build({
  entryPoints: ['entry.js'],
  bundle: true,
  format: 'iife',
  minify: false,   // esbuild minify breaks web-ifc's Emscripten wasm glue
  outfile: '../../construction_bim/public/js/webifc.bundle.js',
  logLevel: 'info',
  plugins: [{
    name: 'three-exports-fix',
    setup(build) {
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
    },
  }],
}).catch((e) => { console.error(e); process.exit(1); });
