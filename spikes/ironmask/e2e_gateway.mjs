// End-to-end M2 check through the real gateway (host :3000), ML service and Postgres.
// sign up -> verify email (Mailpit) -> API key -> 5-photo enrol (+ the error cases) -> verify
// genuine/impostor with client-side latency -> pre-M2 subject gets 409 -> re-enrol ->
// M3 risk-engine payments (each rule triggers a face check) -> delete -> 404.
// Creates a throwaway developer account and deletes it at the end.
//
// Run from the repo root with `npm run dev:infra` up and the gateway on :3000:
//   node spikes/ironmask/e2e_gateway.mjs

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const API = 'http://localhost:3000';
const MAILPIT = 'http://localhost:8025';
const LFW = 'spikes/ironmask/data/lfw_home/lfw_funneled';
const photo = (who, n) => join(LFW, who, `${who}_${String(n).padStart(4, '0')}.jpg`);

// Single-face photos (LFW often has background faces, which the API rightly rejects).
const ENROL = [1, 2, 4, 5, 7].map((n) => photo('Abdullah_Gul', n));
const GENUINE = [12, 13, 14, 15, 17, 18, 19].map((n) => photo('Abdullah_Gul', n));
const IMPOSTORS = [
  photo('Aaron_Peirsol', 1),
  photo('Aaron_Peirsol', 2),
  photo('Abdullah', 1),
  photo('Abdullah', 2),
  photo('Abdoulaye_Wade', 1),
  photo('Abdoulaye_Wade', 2),
];
const LATENCY_CALLS = Number(process.env.LATENCY_CALLS ?? 30);
const HELPER_BYTES = { 1: 1048576, 2: 263168 }; // fp32, int8

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const blob = (path) => new Blob([readFileSync(path)], { type: 'image/jpeg' });

async function call(method, path, { token, key, json, form } = {}) {
  const headers = {};
  if (token) headers.authorization = `Bearer ${token}`;
  if (key) headers['x-api-key'] = key;
  let body;
  if (json) {
    headers['content-type'] = 'application/json';
    body = JSON.stringify(json);
  } else if (form) body = form;
  const res = await fetch(API + path, { method, headers, body });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

function enrolForm(paths, consent = 'true') {
  const form = new FormData();
  paths.forEach((p, i) => form.append('images', blob(p), `enrol-${i + 1}.jpg`));
  if (consent) form.append('consent', consent);
  return form;
}

function verifyForm(path) {
  const form = new FormData();
  form.append('image', blob(path), 'probe.jpg');
  return form;
}

// SQL goes in on stdin, so its quotes never meet the shell.
function psql(sql) {
  return execFileSync(
    'docker',
    ['exec', '-i', 'face-db', 'sh', '-c', 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tA'],
    { input: sql },
  )
    .toString()
    .trim();
}

// Leftovers from an interrupted run.
psql("delete from users where email like 'm2-e2e-%@example.test'");

// --- developer account -------------------------------------------------------------------
const email = `m2-e2e-${Date.now()}@example.test`;
const password = `e2e-${crypto.randomUUID()}`;
check('sign up', (await call('POST', '/auth/email-register', { json: { email, password } })).status === 201);

let token = null;
for (let i = 0; i < 20 && !token; i++) {
  const search = await (await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`)).json();
  if (search.messages?.length) {
    const msg = await (await fetch(`${MAILPIT}/api/v1/message/${search.messages[0].ID}`)).json();
    token = decodeURIComponent(msg.Text.match(/token=([^\s]+)/)[1]);
  } else await sleep(500);
}
check('verification email arrives', Boolean(token));
check('verify email', (await call('POST', '/auth/verify-email', { json: { token } })).status === 200);
const login = await call('POST', '/auth/email-login', { json: { email, password } });
const jwt = login.body?.access_token;
const created = await call('POST', '/api-keys', { token: jwt, json: { name: 'm2-e2e' } });
const key = created.body?.plainTextKey;
check('create API key', Boolean(key), `status ${created.status}`);

// --- enrolment validation ------------------------------------------------------------------
const subject = '/v1/subjects/m2-e2e-alice';
let r = await call('PUT', subject, { key, form: enrolForm(ENROL.slice(0, 4)) });
check('4 photos rejected (400)', r.status === 400, r.body?.message);
r = await call('PUT', subject, { key, form: enrolForm([...ENROL.slice(0, 4), ENROL[0]]) });
check('duplicate photo rejected (400)', r.status === 400, r.body?.message);
r = await call('PUT', subject, { key, form: enrolForm(ENROL, null) });
check('no consent rejected (400)', r.status === 400);
r = await call('PUT', subject, { key, form: enrolForm([...ENROL.slice(0, 4), IMPOSTORS[0]]) });
check('mixed people rejected (400)', r.status === 400, r.body?.message);

let start = performance.now();
r = await call('PUT', subject, { key, form: enrolForm(ENROL) });
const enrolMs = performance.now() - start;
check('enrol 5 photos', r.status === 200 && Boolean(r.body?.consentGrantedAt), `${enrolMs.toFixed(0)} ms`);
const stored = psql(
  "select b.template_version||'/'||octet_length(b.digest)||'/'||octet_length(b.helper) from biometrics b join subjects s on s.id=b.subject_id where s.external_id='m2-e2e-alice'",
);
const [version, digestBytes, helperBytes] = stored.split('/').map(Number);
check(
  `stored template v${version}: digest 32 B + helper ${HELPER_BYTES[version]} B, no embedding`,
  digestBytes === 32 && helperBytes === HELPER_BYTES[version],
  stored,
);

// --- verification + latency ----------------------------------------------------------------
const latencies = [];
let genuineMatches = 0;
for (let i = 0; i < LATENCY_CALLS; i++) {
  start = performance.now();
  r = await call('POST', `${subject}/verify`, { key, form: verifyForm(GENUINE[i % GENUINE.length]) });
  latencies.push(performance.now() - start);
  if (r.status === 200 && r.body.match === true) genuineMatches++;
  if (r.status === 200 && 'confidence' in r.body) check('no confidence score in response', false);
  await sleep(1050); // stay under the 60/min per-key limit
}
check(`genuine verifications match (${genuineMatches}/${LATENCY_CALLS})`, genuineMatches === LATENCY_CALLS);

let impostorAccepts = 0;
let impostorRejected = 0;
for (const p of IMPOSTORS) {
  r = await call('POST', `${subject}/verify`, { key, form: verifyForm(p) });
  if (r.status === 200 && r.body.match) impostorAccepts++;
  if (r.status === 200 && !r.body.match) impostorRejected++;
  await sleep(1050);
}
check(`impostors rejected (${impostorRejected} no-match, ${impostorAccepts} accepted)`, impostorAccepts === 0);

const sorted = [...latencies].sort((a, b) => a - b);
const pct = (q) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
check(`verify latency p95 < 300 ms`, pct(0.95) < 300, `p50 ${pct(0.5).toFixed(0)} ms, p95 ${pct(0.95).toFixed(0)} ms, max ${sorted.at(-1).toFixed(0)} ms`);
console.log(`LATENCY ${JSON.stringify({ version, p50: pct(0.5), p95: pct(0.95), samples: latencies })}`);

// --- re-enrolment of a pre-M2 subject ------------------------------------------------------
psql("delete from biometrics where subject_id=(select id from subjects where external_id='m2-e2e-alice')");
r = await call('POST', `${subject}/verify`, { key, form: verifyForm(GENUINE[0]) });
check('pre-M2 subject (no template) gets 409 re-enroll', r.status === 409, r.body?.message);
r = await call('PUT', subject, { key, form: enrolForm(ENROL) });
check('re-enrol with 5 photos', r.status === 200);
r = await call('POST', `${subject}/verify`, { key, form: verifyForm(GENUINE[1]) });
check('verify works after re-enrolment', r.status === 200 && r.body.match === true);

// --- M3: risk engine in front of the mock payment API ---------------------------------------
const pay = (fields, image) => {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.append(k, String(v));
  if (image) form.append('image', blob(image), 'selfie.jpg');
  return call('POST', `${subject}/transactions`, { key, form });
};
const usual = { amount: 5000, payee: 'Ama Mensah', device_id: 'phone-1' };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

r = await pay(usual);
check('first payment asks for a face (new payee + new device)', r.body?.status === 'face_required' && same(r.body.reasons, ['new_payee', 'new_device']), JSON.stringify(r.body));
r = await pay(usual, IMPOSTORS[0]);
check('impostor selfie declines the payment', r.body?.status === 'declined', r.body?.status);
r = await pay(usual);
check('declined payment does not make the payee known', r.body?.status === 'face_required');
r = await pay(usual, GENUINE[2]);
check('genuine selfie approves it', r.body?.status === 'approved' && r.body.faceVerified === true, r.body?.status);
r = await pay(usual);
check('repeat payment: no face check', r.body?.status === 'approved' && r.body.faceVerified === false && same(r.body.reasons, []));
r = await pay({ ...usual, amount: 100000 });
check('amount at 1,000.00 asks for a face', r.body?.status === 'face_required' && same(r.body.reasons, ['amount_over_limit']));
r = await pay({ ...usual, payee: 'Kofi Boateng' });
check('new payee asks for a face', same(r.body?.reasons, ['new_payee']));
r = await pay({ ...usual, device_id: 'laptop-2' });
check('new device asks for a face', same(r.body?.reasons, ['new_device']));
r = await pay({ ...usual, amount: 0 });
check('invalid amount rejected (400)', r.status === 400, r.body?.message);
const plain = psql("select count(*) from transactions where encode(payee_hash, 'escape') like '%Ama%'");
const rows = psql("select count(*) from transactions t join subjects s on s.id = t.subject_id where s.external_id='m2-e2e-alice'");
check('only approved payments stored, payee hashed', rows === '2' && plain === '0', `${rows} rows`);

// --- deletion ------------------------------------------------------------------------------
check('delete subject (204)', (await call('DELETE', subject, { key })).status === 204);
r = await call('POST', `${subject}/verify`, { key, form: verifyForm(GENUINE[0]) });
check('deleted subject gets 404', r.status === 404);
check('payment history deleted with the subject', psql("select count(*) from transactions t join subjects s on s.id = t.subject_id where s.external_id='m2-e2e-alice'") === '0');
check('delete test account (204)', (await call('DELETE', '/auth/me', { token: jwt })).status === 204);

const failed = results.filter((x) => !x.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
