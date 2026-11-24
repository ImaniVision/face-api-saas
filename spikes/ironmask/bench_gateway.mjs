// fp32 vs int8 verification latency END TO END through the gateway (API key auth, rate limit,
// Postgres template fetch, ML /verify, usage metering). THROWAWAY BENCHMARK.
// Paired: subject bench-int8 holds the int8 encoding of the SAME P and digest as bench-fp32.
// Requests alternate formats (and which goes first), sequentially, never concurrently.
// Each format has its own API key so the per-key rate limit (1/s) can't throttle the comparison.
//
//   N=400 node spikes/ironmask/bench_gateway.mjs      (stack up, gateway on :3000)

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const API = 'http://localhost:3000';
const MAILPIT = 'http://localhost:8025';
const N = Number(process.env.N ?? 400);
const WARMUP = 20;
const LFW = 'spikes/ironmask/data/lfw_home/lfw_funneled/Abdullah_Gul';
const photo = (n) => readFileSync(join(LFW, `Abdullah_Gul_${String(n).padStart(4, '0')}.jpg`));
const ENROL = [1, 2, 4, 5, 7].map(photo);
const PROBES = [12, 13, 14, 15, 17, 18, 19].map(photo);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const psql = (sql) =>
  execFileSync('docker', ['exec', '-i', 'face-db', 'sh', '-c', 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tA'], {
    input: sql,
    maxBuffer: 64 * 1024 * 1024,
  }).toString().trim();

async function json(method, path, { token, key, body, form } = {}) {
  const headers = {};
  if (token) headers.authorization = `Bearer ${token}`;
  if (key) headers['x-api-key'] = key;
  if (body) headers['content-type'] = 'application/json';
  const res = await fetch(API + path, { method, headers, body: body ? JSON.stringify(body) : form });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

// --- throwaway developer account with two keys -----------------------------------------------
psql("delete from users where email like 'm2-bench-%@example.test'");
const email = `m2-bench-${Date.now()}@example.test`;
const password = `b-${crypto.randomUUID()}`;
await json('POST', '/auth/email-register', { body: { email, password } });
let token;
for (let i = 0; i < 20 && !token; i++) {
  const s = await (await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`)).json();
  if (s.messages?.length) {
    const m = await (await fetch(`${MAILPIT}/api/v1/message/${s.messages[0].ID}`)).json();
    token = decodeURIComponent(m.Text.match(/token=([^\s]+)/)[1]);
  } else await sleep(500);
}
await json('POST', '/auth/verify-email', { body: { token } });
const jwt = (await json('POST', '/auth/email-login', { body: { email, password } })).body.access_token;
const keys = {
  fp32: (await json('POST', '/api-keys', { token: jwt, body: { name: 'bench-fp32' } })).body.plainTextKey,
  int8: (await json('POST', '/api-keys', { token: jwt, body: { name: 'bench-int8' } })).body.plainTextKey,
};

// --- enrol, then make bench-int8 an int8 copy of bench-fp32's template ------------------------
for (const id of ['bench-fp32', 'bench-int8']) {
  const form = new FormData();
  ENROL.forEach((b, i) => form.append('images', new Blob([b]), `e${i}.jpg`));
  form.append('consent', 'true');
  const r = await json('PUT', `/v1/subjects/${id}`, { key: keys.fp32, form });
  if (r.status !== 200) throw new Error(`enrol ${id}: ${r.status} ${JSON.stringify(r.body)}`);
  await sleep(1100);
}
const [digestHex, helperHex] = psql(
  "select encode(b.digest,'hex')||'|'||encode(b.helper,'hex') from biometrics b join subjects s on s.id=b.subject_id where s.external_id='bench-fp32'",
).split('|');
const int8Hex = execFileSync(
  'docker',
  ['exec', '-i', 'face-api', 'python', '-c',
   'import sys; from app.protection import FP32, INT8, decode_helper, encode_helper; ' +
   'h = bytes.fromhex(sys.stdin.read().strip()); sys.stdout.write(encode_helper(decode_helper(h, FP32), INT8).hex())'],
  { input: helperHex, maxBuffer: 64 * 1024 * 1024 },
).toString().trim();
psql(`update biometrics set digest=decode('${digestHex}','hex'), helper=decode('${int8Hex}','hex'), template_version=2
      where subject_id=(select id from subjects where external_id='bench-int8')`);
const stored = psql(
  "select s.external_id||':v'||b.template_version||':'||octet_length(b.helper) from biometrics b join subjects s on s.id=b.subject_id where s.external_id like 'bench-%' order by 1",
);
console.log(`stored ${stored.replace(/\n/g, ', ')}`);

// --- benchmark -------------------------------------------------------------------------------
async function verify(fmt, probe) {
  const form = new FormData();
  form.append('image', new Blob([probe]), 'p.jpg');
  const s = performance.now();
  const r = await json('POST', `/v1/subjects/bench-${fmt}/verify`, { key: keys[fmt], form });
  return { ms: performance.now() - s, ok: r.status === 200 && r.body.match === true, status: r.status };
}

const lat = { fp32: [], int8: [] };
const bad = { fp32: 0, int8: 0 };
for (let i = 0; i < WARMUP + N; i++) {
  const start = performance.now();
  for (const fmt of i % 2 === 0 ? ['fp32', 'int8'] : ['int8', 'fp32']) {
    const r = await verify(fmt, PROBES[i % PROBES.length]);
    if (i >= WARMUP) {
      lat[fmt].push(r.ms);
      if (!r.ok) bad[fmt]++;
    }
  }
  const spent = performance.now() - start;
  if (spent < 1010) await sleep(1010 - spent); // each key at most 1 call per second
  if (i >= WARMUP && (i - WARMUP + 1) % 100 === 0) console.log(`${i - WARMUP + 1}/${N}`);
}

const stats = (xs) => {
  const a = [...xs].sort((x, y) => x - y);
  const q = (p) => +a[Math.min(a.length - 1, Math.floor(p * a.length))].toFixed(1);
  return { n: a.length, mean: +(a.reduce((s, x) => s + x, 0) / a.length).toFixed(1), p50: q(0.5), p95: q(0.95), p99: q(0.99), max: +a.at(-1).toFixed(1) };
};
console.log(
  'RESULT ' +
    JSON.stringify({
      layer: 'gateway end to end',
      n_per_format: N,
      fp32: { ...stats(lat.fp32), not_matched: bad.fp32 },
      int8: { ...stats(lat.int8), not_matched: bad.int8 },
    }),
);

await json('DELETE', '/auth/me', { token: jwt });
console.log(`test account deleted: ${psql(`select count(*) from users where email='${email}'`) === '0'}`);
