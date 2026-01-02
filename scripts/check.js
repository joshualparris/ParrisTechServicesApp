#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
function exists(rel){ return fs.existsSync(path.join(root, rel)); }

const checks = [
  {name: 'Business OS index', path: 'Parris Tech Services/index.html'},
  {name: 'ParrisTechApp index', path: 'ParrisTechApp/index.html'},
  {name: 'modules folder', path: 'modules'},
  {name: 'checklist data', path: 'modules/checklist_data.json'}
];

console.log('Running lightweight project checks...');
let ok = true;
for(const c of checks){
  const e = exists(c.path);
  console.log(`${e ? '✓' : '✗'} ${c.name} (${c.path})`);
  if(!e) ok = false;
}

// Try parsing JSON checklist if present
try{
  const jd = path.join(root, 'modules', 'checklist_data.json');
  if(fs.existsSync(jd)){
    const raw = fs.readFileSync(jd, 'utf8');
    const parsed = JSON.parse(raw);
    console.log(`✓ parsed modules/checklist_data.json — type: ${Array.isArray(parsed)?'array':'object'}`);
  }
} catch(err){
  console.error('✗ Error parsing checklist_data.json:', err.message);
  ok = false;
}

// ensure bundled app exists
if (!exists('Parris Tech Services/app.bundle.js') && !exists('Parris Tech Services/app.js')){
  console.warn('✗ Warning: app bundle missing (Parris Tech Services/app.bundle.js or app.js)');
  ok = false;
}

// run a11y quick-scan
console.log('\nRunning accessibility quick-scan...');
const { spawnSync } = require('child_process');
const a11y = spawnSync(process.execPath, [require.resolve('./a11y-check.js')], { stdio: 'inherit' });
if (a11y.status !== 0) ok = false;

if(!ok){
  console.error('\nOne or more checks failed.');
  process.exit(2);
}
console.log('\nAll checks passed.');
process.exit(0);
