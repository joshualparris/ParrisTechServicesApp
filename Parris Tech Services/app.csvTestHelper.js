// Helper exposing parseCsv for Node-based tests.
const fs = require('fs');
const path = require('path');
const content = fs.readFileSync(path.join(__dirname,'app.js'),'utf8');

// Extract parseCsv function source from app.js by regex.
const m = content.match(/function parseCsv\([\s\S]*?^}\n/m);
if (!m) throw new Error('parseCsv not found in app.js');
const fnSrc = m[0] + '\nthis.parseCsv = parseCsv;';

// Evaluate in a new scope
const vm = require('vm');
const script = new vm.Script(fnSrc,{filename:'app.parseCsv.js'});
const sandbox = {};
vm.createContext(sandbox);
script.runInContext(sandbox);
module.exports = sandbox.parseCsv;
