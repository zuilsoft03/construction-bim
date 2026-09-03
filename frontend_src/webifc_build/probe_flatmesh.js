const fs = require('fs');
const src = fs.readFileSync('node_modules/web-ifc/web-ifc-api.js', 'utf8');
for (const name of ['FlatMesh', 'PlacedGeometry', 'Vector', 'List']) {
  const re = new RegExp('var ' + name + '[\\s\\S]{0,260}|function ' + name + '[\\s\\S]{0,260}|class ' + name + '[\\s\\S]{0,260}');
  const m = src.match(re);
  console.log('===' + name + '===');
  console.log(m ? m[0].slice(0, 260) : '(none)');
}
// find where GetFlatMesh is implemented (emscripten) and what it returns
const i = src.indexOf('GetFlatMesh');
console.log('=== around first GetFlatMesh ===');
console.log(src.slice(i - 200, i + 300));
