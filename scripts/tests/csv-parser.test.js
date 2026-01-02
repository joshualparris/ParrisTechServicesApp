const assert = require('assert');
const parseCsv = require('../../Parris Tech Services/app.csvTestHelper');

function run(){
  // simple
  let txt = 'name,email\nAlice,alice@example.com\nBob,bob@example.com';
  let parsed = parseCsv(txt);
  console.log('parsed[0]=', JSON.stringify(parsed[0]));
  assert.strictEqual(parsed.length, 3);
  assert.strictEqual(parsed[0][0].trim(), 'name');
  assert.strictEqual(parsed[0][1].trim(), 'email');
  assert.strictEqual(parsed[1][0].trim(), 'Alice');
  assert.strictEqual(parsed[1][1].trim(), 'alice@example.com');

  // quoted comma
  txt = 'name,notes\n"Doe, John","Works, remote"\n"Smith, Ann","On site"';
  parsed = parseCsv(txt);
  assert.strictEqual(parsed.length, 3);
  assert.strictEqual(parsed[1][0].trim(), 'Doe, John');
  assert.strictEqual(parsed[1][1].trim(), 'Works, remote');

  // quoted newline
  txt = 'name,notes\n"Multiline","Line1\nLine2"\nSimple,OneLine';
  parsed = parseCsv(txt);
  assert.strictEqual(parsed.length, 3);
  assert.strictEqual(parsed[1][0].trim(), 'Multiline');
  // second field may contain a literal newline; normalize for comparison
  assert.strictEqual(parsed[1][1].replace(/\r/g,'').trim(), 'Line1\nLine2');

  // escaped quotes
  txt = 'q\n"He said ""Hello""",x';
  parsed = parseCsv(txt);
  assert.strictEqual(parsed.length, 2);
  assert.strictEqual(parsed[1][0].trim(), 'He said "Hello"');
  assert.strictEqual(parsed[1][1].trim(), 'x');

  // trailing empty lines
  txt = 'a,b\n1,2\n\n';
  parsed = parseCsv(txt);
  assert.strictEqual(parsed.length, 2);

  console.log('csv-parser tests passed');
}

run();
