const esbuild = require('esbuild');
esbuild
  .build({
    entryPoints: ['entry2.js'],
    bundle: true,
    format: 'iife',
    minify: false, // esbuild minify breaks web-ifc's Emscripten glue
    outfile: '../../construction_bim/public/js/webifc.bundle.js',
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"' },
  })
  .then(() => console.log('Done'))
  .catch((e) => {
    console.error('ERROR', e && e.message);
    process.exit(1);
  });
