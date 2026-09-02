const fs = require('fs');
const src = fs.readFileSync('node_modules/web-ifc/web-ifc-api.js', 'utf8');
const i = src.indexOf('GetGeometry(modelID, geometryExpressionID)');
if (i < 0) {
  const j = src.indexOf('GetGeometry(');
  console.log(src.slice(j - 250, j + 350));
} else {
  console.log(src.slice(i - 250, i + 400));
}
