#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const files = [
  'Parris Tech Services/index.html',
  'ParrisTechApp/index.html'
];

function read(rel){
  const p = path.join(process.cwd(), rel);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p,'utf8');
}

let issues = [];

files.forEach(f=>{
  const src = read(f);
  if (!src) { issues.push(`${f}: missing`); return; }
  // check images with missing alt
  const imgRe = /<img\b([^>]+)>/gi;
  let m; let idx=0;
  while ((m = imgRe.exec(src)) !== null){
    idx++;
    const attrs = m[1];
    if (!/\balt\s*=/.test(attrs)) issues.push(`${f}: <img> tag #${idx} missing alt attribute`);
  }
  // collect label information (for= targets and ranges for wrapped controls)
  const labelFor = new Set();
  const labelRanges = [];
  const labelRe = /<label\b([^>]*)>([\s\S]*?)<\/label>/gi;
  while ((m = labelRe.exec(src)) !== null){
    const attrs = m[1];
    const inner = m[2];
    const start = m.index;
    const end = m.index + m[0].length;
    const forMatch = attrs.match(/for\s*=\s*['"]([^'"]+)['"]/i);
    if (forMatch) labelFor.add(forMatch[1]);
    labelRanges.push({start,end,inner});
  }
  // find form controls
  const controlRe = /<(input|select|textarea)\b([^>]*)>/gi;
  while ((m = controlRe.exec(src)) !== null){
    const tag = m[1]; const attrs = m[2]; const idx = m.index;
    // ignore hidden inputs
    if (/type\s*=\s*['\"]hidden['\"]/i.test(attrs)) continue;
    const hasAriaLabel = /aria-label\s*=\s*['"][^'"]+['"]/i.test(attrs);
    const hasAriaLabelled = /aria-labelledby\s*=\s*['"][^'"]+['"]/i.test(attrs);
    const idMatch = attrs.match(/id\s*=\s*['\"]([^'\"]+)['\"]/i);
    if (idMatch){
      const id = idMatch[1];
      // considered labeled if has for=, wrapped by a label range, or has aria-label/aria-labelledby
      const wrapped = labelRanges.some(r=> idx > r.start && idx < r.end);
      if (!labelFor.has(id) && !wrapped && !hasAriaLabel && !hasAriaLabelled) issues.push(`${f}: form control <${tag}> with id="${id}" has no associated <label> or aria-label`);
    } else {
      // if the control is inside a label, it's OK; otherwise flag
      const wrapped = labelRanges.some(r=> idx > r.start && idx < r.end);
      if (!wrapped && !hasAriaLabel && !hasAriaLabelled) issues.push(`${f}: form control <${tag}> without id (cannot be associated with <label>) or aria-label`);
    }
  }
  // buttons without accessible name
  const buttonRe = /<(button)\b([^>]*)>([\s\S]*?)<\/button>/gi;
  while ((m = buttonRe.exec(src)) !== null){
    const attrs = m[2]; const inner = m[3].trim();
    const aria = /aria-label\s*=\s*['"][^'"]+['"]/i.test(attrs);
    const hasText = inner.replace(/<[^>]*>/g,'').trim().length > 0;
    if (!aria && !hasText) issues.push(`${f}: <button> missing accessible name (no text and no aria-label)`);
  }
});

if (!issues.length) { console.log('Static a11y scan: no issues found'); process.exit(0); }
console.log('Static a11y scan issues:'); issues.forEach(i=>console.log('- '+i)); process.exit(2);
