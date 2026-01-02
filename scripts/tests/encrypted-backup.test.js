const assert = require('assert');
const crypto = require('crypto');

function bufToBase64(buffer){
  return Buffer.from(buffer).toString('base64');
}
function base64ToBuf(b64){
  return Buffer.from(b64, 'base64');
}

function deriveKeyBytes(pass, salt){
  // PBKDF2 with 100000 iterations, SHA-256, 32-byte key
  return crypto.pbkdf2Sync(pass, salt, 100000, 32, 'sha256');
}

function encryptAesGcm(keyBytes, iv, plain){
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBytes, iv);
  const ct1 = cipher.update(plain);
  const ct2 = cipher.final();
  const tag = cipher.getAuthTag();
  return Buffer.concat([ct1, ct2, tag]); // append tag like WebCrypto
}

function decryptAesGcm(keyBytes, iv, ctWithTag){
  const tag = ctWithTag.slice(ctWithTag.length - 16);
  const ct = ctWithTag.slice(0, ctWithTag.length - 16);
  const decipher = crypto.createDecipheriv('aes-256-gcm', keyBytes, iv);
  decipher.setAuthTag(tag);
  const p1 = decipher.update(ct);
  const p2 = decipher.final();
  return Buffer.concat([p1, p2]);
}

async function run(){
  const pass = 'correct horse battery staple';
  const payload = { hello: 'world', time: new Date().toISOString() };
  const plain = Buffer.from(JSON.stringify(payload), 'utf8');
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const keyBytes = deriveKeyBytes(pass, salt);
  const ctWithTag = encryptAesGcm(keyBytes, iv, plain);

  const packaged = { salt: bufToBase64(salt), iv: bufToBase64(iv), data: bufToBase64(ctWithTag) };

  // Decrypt
  const saltBuf = base64ToBuf(packaged.salt);
  const ivBuf = base64ToBuf(packaged.iv);
  const ctBuf = base64ToBuf(packaged.data);
  const keyBytes2 = deriveKeyBytes(pass, saltBuf);
  const plainBuf = decryptAesGcm(keyBytes2, ivBuf, ctBuf);
  const parsed = JSON.parse(plainBuf.toString('utf8'));
  assert.deepStrictEqual(parsed, payload);
  console.log('encrypted-backup test passed');
}

run().catch(err=>{ console.error(err); process.exit(2); });
