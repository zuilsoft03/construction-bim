const fs = require('fs');
const p = (n) => JSON.parse(fs.readFileSync(`node_modules/${n}/package.json`, 'utf8'));
console.log('three:', p('three').version);
console.log('web-ifc:', p('web-ifc').version);
console.log('web-ifc-three:', p('web-ifc-three').version);

// check vendored three revision
const vend = fs.readFileSync('../../construction_bim/public/js/three/three.module.min.js', 'utf8');
const m = vend.match(/REVISION\s*[=:]\s*['"]?(\d+)/);
console.log('vendored three revision:', m ? m[1] : 'not found');
