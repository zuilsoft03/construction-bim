const esbuild = require('esbuild');
const path = require('path');

const page = process.argv[2] || 'bim_viewer';
const srcFile = path.resolve(__dirname, '..', `${page}_app.js`);
const outFile = path.resolve(__dirname, '..', '..', 'construction_bim', 'public', 'js', `${page}.bundle.js`);

esbuild.build({
  entryPoints: [srcFile],
  bundle: true,
  format: 'esm',
  minify: false,
  sourcemap: 'inline',
  outfile: outFile,
  logLevel: 'silent',
}).then(() => {
  console.log(`bundled ${page} -> ${outFile}`);
}).catch(err => {
  console.error(`ERROR bundling ${page}:`, err);
  process.exit(1);
});
