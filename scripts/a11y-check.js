#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const files = [
  'Parris Tech Services/index.html',
  'ParrisTechApp/index.html'
];

let issues = [];

files.forEach(rel => {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) {
    issues.push(`${rel}: MISSING`);
    return;
  }
  const src = fs.readFileSync(p, 'utf8');

  if (!/\<html[^>]*\blang=/.test(src)) issues.push(`${rel}: <html> missing lang attribute`);

  // duplicate IDs
  const ids = {};
  const idRe = /id\s*=\s*["']([^"']+)["']/g;
  let m;
  while ((m = idRe.exec(src)) !== null) ids[m[1]] = (ids[m[1]] || 0) + 1;
  Object.keys(ids).forEach(id => { if (ids[id] > 1) issues.push(`${rel}: duplicate id "${id}" (${ids[id]} times)`); });

  // images without alt
  const imgNoAlt = [...src.matchAll(/<img\b(?![^>]*\balt=)[^>]*>/gi)];
  if (imgNoAlt.length) issues.push(`${rel}: ${imgNoAlt.length} <img> elements without alt attribute`);

  // landmark roles
  if (/\<main\b/.test(src) && !/\<main[^>]*role=/.test(src)) issues.push(`${rel}: <main> element missing role attribute`);
  if (/\<nav\b/.test(src) && !/\<nav[^>]*role=/.test(src)) issues.push(`${rel}: <nav> element missing role attribute`);
  if (/\<header\b/.test(src) && !/\<header[^>]*role=/.test(src)) issues.push(`${rel}: <header> element missing role attribute`);
  if (/\<footer\b/.test(src) && !/\<footer[^>]*role=/.test(src)) issues.push(`${rel}: <footer> element missing role attribute`);

  // dialogs
  const dialogs = [...src.matchAll(/<[^>]+role=["']dialog["'][^>]*>/gi)];
  dialogs.forEach(d => { if (!/aria-modal=/.test(d[0])) issues.push(`${rel}: dialog missing aria-modal`); });
});

console.log('Accessibility quick-scan results:');
if (issues.length === 0) {
  console.log('✓ No obvious issues found.');
  process.exit(0);
}
issues.forEach(i => console.log('- ' + i));
console.log(`\nFound ${issues.length} issues (quick-scan).`);
process.exit(2);
