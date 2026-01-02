#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');

console.log('Running tests...');
// run all tests in the tests folder
const tests = [
	'csv-parser.test.js',
	'encrypted-backup.test.js'
];
let finalStatus = 0;
for (const t of tests){
	console.log(`\n=== running ${t} ===`);
	const res = spawnSync(process.execPath, [path.join(__dirname,'tests',t)], { stdio: 'inherit' });
	if (res.status !== 0) finalStatus = res.status;
}
process.exit(finalStatus);
