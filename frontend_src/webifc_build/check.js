const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('node_modules/web-ifc-three/package.json', 'utf8'));
console.log('web-ifc-three deps:', JSON.stringify(pkg.dependencies || {}, null, 1));
console.log('peerDeps:', JSON.stringify(pkg.peerDependencies || {}, null, 1));
const src = fs.readFileSync('node_modules/three/examples/jsm/utils/BufferGeometryUtils.js', 'utf8');
const names = [...src.matchAll(/export\s+\{([^}]+)\}/g)].map(m => m[1].trim()).join(',');
console.log('three BufferGeometryUtils export names:', names.slice(0, 250));
