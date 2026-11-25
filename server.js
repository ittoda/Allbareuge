// All 바르게 서버: 화면 제공 + Pi 로그인 확인 + 계정 저장(Upstash) + Pi 결제 + 사장님 통계 + 테스트넷 A2U
const http = require('http'), https = require('https'), fs = require('fs'), path = require('path');
const PORT = process.env.PORT || 8080;
const HTML = 'text/html; charset=utf-8';
const FILES = { '/': ['index.html', HTML], '/index.html': ['index.html', HTML], '/privacy': ['privacy.html', HTML], '/privacy.html': ['privacy.html', HTML], '/terms': ['terms.html', HTML], '/terms.html': ['terms.html', HTML] };

function upEnv(n) { const k = Object.keys(process.env).find(x => x.replace(/[^a-z]/gi, '').toLowerCase() === n); return k ? String(process.env[k]).trim() : '' }
const IS_TESTNET = !!upEnv('testnet');
const P = 'ab:' + (IS_TESTNET ? 't:' : ''); // 테스트넷 기록은 따로

function piMe(token) { // Pi 서버에 로그인 토큰 확인
  return new Promise(res => {
    const rq = https.request({ host: 'api.minepi.com', path: '/v2/me', headers: { Authorization: 'Bearer ' + token }, timeout: 8000 }, r => {
      let b = ''; r.on('data', d => b += d); r.on('end', () => { try { res(r.statusCode === 200 ? JSON.parse(b) : null) } catch (e) { res(null) } });
    });
    rq.on('error', () => res(null)); rq.on('timeout', () => { rq.destroy(); res(null) }); rq.end();
  });
}
function redis(cmd) { // Upstash Redis (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN)
  const url = upEnv('upstashredisresturl'), tok = upEnv('upstashredisresttoken'); if (!url || !tok) return Promise.resolve(null);
  return new Promise(res => { const u = new URL(url), body = JSON.stringify(cmd);
    const rq = https.request({ host: u.host, path: u.pathname === '/' ? '/' : u.pathname, method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }, timeout: 8000 }, r => {
      let b = ''; r.on('data', d => b += d); r.on('end', () => { try { const j = JSON.parse(b); res(j.result === undefined ? null : j.result) } catch (e) { res(null) } }) });
    rq.on('error', () => res(null)); rq.on('timeout', () => { rq.destroy(); res(null) }); rq.end(body) });
}
function piApi(method, p, data) { // Pi 결제 API (Render 환경변수 PI_API_KEY)
  const key = upEnv('piapikey'); if (!key) return Promise.resolve(null);
  return new Promise(res => { const b = data ? JSON.stringify(data) : '';
    const rq = https.request({ host: 'api.minepi.com', path: '/v2' + p, method, headers: { Authorization: 'Key ' + key, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) }, timeout: 10000 }, r => {
      let x = ''; r.on('data', d => x += d); r.on('end', () => { try { res(r.statusCode < 300 ? JSON.parse(x || '{}') : null) } catch (e) { res(null) } }) });
    rq.on('error', () => res(null)); rq.on('timeout', () => { rq.destroy(); res(null) }); rq.end(b) });
}
const kstDay = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const ME_CACHE = new Map();
async function uidOf(token) {
  if (!token) return null; token = String(token); const c = ME_CACHE.get(token);
  if (c && Date.now() - c.t < 3600e3) { stPi(c.uid); return c.uid }
  const me = await piMe(token); if (!me) return null;
  ME_CACHE.set(token, { uid: me.uid, t: Date.now() }); if (ME_CACHE.size > 5000) ME_CACHE.clear();
  if (me.username) redis(['HSET', P + 'names', me.uid, me.username]).catch(() => {});
  stPi(me.uid); return me.uid;
}
// 부모님 가게 상품 (가격 π, 주는 것)
const ITEMS = { sun30: { pi: 0.1, tok: 30 }, sun100: { pi: 0.3, tok: 100 }, pets: { pi: 0.5, flag: 'animals' }, plants: { pi: 0.3, flag: 'plants' }, animals: { pi: 0.5, flag: 'animals' }, sea: { pi: 0.5, flag: 'sea' }, space: { pi: 0.5, flag: 'space' }, deco: { pi: 0.3, flag: 'deco' } };
async function grant(uid, item) { const it = ITEMS[item]; if (!it) return false;
  if (it.tok) await redis(['INCRBY', P + 'gt:' + uid, String(it.tok)]); if (it.flag) await redis(['HSET', P + 'gf:' + uid, it.flag, '1']); return true }
async function finishPay(paymentId, txid) {
  const p = await piApi('GET', '/payments/' + encodeURIComponent(paymentId)); if (!p) return false;
  const item = p.metadata && p.metadata.item, it = ITEMS[item]; if (!it || Number(p.amount) < it.pi) return false;
  if (!(p.status && p.status.developer_completed)) { const tx = txid || (p.transaction && p.transaction.txid); if (!tx) return false;
    const c = await piApi('POST', '/payments/' + encodeURIComponent(paymentId) + '/complete', { txid: tx }); if (!c) return false }
  if ((await redis(['SET', P + 'paid:' + paymentId, '1', 'NX', 'EX', '7776000'])) === 'OK') { // 같은 결제로 두 번 주지 않기
    await grant(p.user_uid, item); stIncr('pay'); stIncr('payPi', Number(p.amount) || 0); redis(['HINCRBY', P + 'st:item', item, '1']).catch(() => {}) }
  return true;
}
// ===== 사장님 통계 =====
const STATS_KEY = upEnv('statskey') || 'b8d2f61a';
const stIncr = (k, n) => { const d = kstDay(), c = n == null ? 'INCR' : 'INCRBYFLOAT', a = n == null ? [] : [String(n)]; redis([c, P + 'st:' + k + ':' + d, ...a]).catch(() => {}); redis([c, P + 'st:' + k + ':all', ...a]).catch(() => {}) };
const stAdd = (k, v) => { const d = kstDay(); redis(['SADD', P + 'st:' + k + ':' + d, v]).catch(() => {}); return redis(['SADD', P + 'st:' + k + ':all', v]).catch(() => 0) };
const PI_SEEN = new Map();
function stPi(uid) { const d = kstDay(); if (PI_SEEN.get(uid) === d) return; PI_SEEN.set(uid, d); if (PI_SEEN.size > 20000) PI_SEEN.clear(); stAdd('pi', uid) }
// ===== 테스트넷: 앱 → 사용자 테스트 파이 (메인넷 지갑 조건 5명) =====
let PIB = null; function piBackend() { if (PIB) return PIB; try { const m = require('pi-backend'); const B = m.default || m; PIB = new B(upEnv('piapikey'), upEnv('piwalletseed')) } catch (e) { console.log('pi-backend', e.message) } return PIB }

function body(req, max) { return new Promise(res => { let b = ''; req.on('data', d => { b += d; if (b.length > (max || 1e4)) req.destroy() }); req.on('end', () => { try { res(JSON.parse(b || '{}')) } catch (e) { res({}) } }) }) }
const J = (res, code, o) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)) };

http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/healthz') { res.writeHead(200); return res.end('ok') }
  if (url === '/validation-key.txt') { const key = upEnv('pivalidationkey'); res.writeHead(key ? 200 : 404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end(key || 'Not found') }
  if (req.method === 'POST') {
    if (url === '/auth') { const { token } = await body(req); const me = token ? await piMe(String(token)) : null; return J(res, me ? 200 : 401, me ? { ok: true, uid: me.uid, username: me.username } : { ok: false }) }
    if (url === '/me') { // {token} 불러오기 · {token, data} 저장
      const q = await body(req, 300000); const uid = await uidOf(q.token); if (!uid) return J(res, 401, { ok: false });
      if (q.data && typeof q.data === 'object') { const r = await redis(['SET', P + 'me:' + uid, JSON.stringify(q.data).slice(0, 250000)]); return J(res, 200, { ok: r === 'OK' }) }
      const v = await redis(['GET', P + 'me:' + uid]); let data = null; try { data = v ? JSON.parse(v) : null } catch (e) {}
      return J(res, 200, { ok: true, data });
    }
    if (url === '/claim') { // 결제로 받은 햇살·특별친구·꾸미기 받아 가기
      const q = await body(req); const uid = await uidOf(q.token); if (!uid) return J(res, 401, { ok: false });
      const tok = Number(await redis(['GETDEL', P + 'gt:' + uid]) || 0); const f = await redis(['HGETALL', P + 'gf:' + uid]) || [];
      const o = { ok: true, tok }; for (let i = 0; i < f.length; i += 2) o[f[i]] = +f[i + 1]; return J(res, 200, o);
    }
    if (url === '/pay/approve') {
      const q = await body(req); const uid = await uidOf(q.token);
      const p = q.paymentId ? await piApi('GET', '/payments/' + encodeURIComponent(q.paymentId)) : null; const it = p && ITEMS[p.metadata && p.metadata.item];
      const ok = uid && p && p.user_uid === uid && it && Number(p.amount) >= it.pi && await piApi('POST', '/payments/' + encodeURIComponent(q.paymentId) + '/approve');
      return J(res, ok ? 200 : 400, { ok: !!ok });
    }
    if (url === '/pay/complete' || url === '/pay/incomplete') { const q = await body(req); const ok = q.paymentId ? await finishPay(String(q.paymentId), q.txid && String(q.txid)) : false; return J(res, ok ? 200 : 400, { ok }) }
    if (url === '/ev') { const q = await body(req); const uid = await uidOf(q.token); if (uid && (q.e === 'ck' || q.e === 'login')) stIncr(q.e); res.writeHead(204); return res.end() }
    if (url === '/hit') { const q = await body(req); const dev = String(q.d || '').replace(/[^\w-]/g, '').slice(0, 40);
      if (dev) { const isNew = await stAdd('dev', dev); if (isNew === 1) redis(['HINCRBY', P + 'st:lang', String(q.l || '?').replace(/[^\w-]/g, '').slice(0, 8) || '?', '1']).catch(() => {}) }
      res.writeHead(204); return res.end() }
    if (IS_TESTNET && url === '/a2u') {
      const q = await body(req); const me = q.token ? await piMe(String(q.token)) : null; if (!me) return J(res, 401, { ok: false, why: 'login' });
      if (await redis(['GET', P + 'a2u:' + me.uid])) return J(res, 200, { ok: true, again: true, user: me.username });
      const pi = piBackend(); if (!pi) return J(res, 500, { ok: false, why: 'setup' });
      try { const pid = await pi.createPayment({ amount: 0.01, memo: 'All Bareuge test reward', metadata: { kind: 'a2u-test' }, uid: me.uid });
        const txid = await pi.submitPayment(pid); await pi.completePayment(pid, txid);
        await redis(['SET', P + 'a2u:' + me.uid, txid]); if (me.username) redis(['HSET', P + 'names', me.uid, me.username]).catch(() => {});
        return J(res, 200, { ok: true, user: me.username, txid });
      } catch (e) {
        try { const inc = await pi.getIncompleteServerPayments(); for (const x of inc || []) { try { if (x.transaction && x.transaction.txid) await pi.completePayment(x.identifier, x.transaction.txid); else await pi.cancelPayment(x.identifier) } catch (z) {} } } catch (z) {}
        return J(res, 200, { ok: false, why: 'pay', msg: String((e && e.response && e.response.data && JSON.stringify(e.response.data)) || (e && e.message) || e).slice(0, 300) });
      }
    }
  }
  if (IS_TESTNET && url === '/a2u/count') {
    const k = await redis(['KEYS', P + 'a2u:*']) || []; const ids = k.map(x => x.slice((P + 'a2u:').length));
    const nm = ids.length ? (await redis(['HMGET', P + 'names', ...ids]) || []) : []; const mask = u => { u = String(u || '?'); return u.length <= 2 ? u[0] + '*' : u.slice(0, 2) + '*'.repeat(Math.min(4, u.length - 2)) };
    return J(res, 200, { n: ids.length, names: nm.map(mask), db: !!upEnv('upstashredisresturl') });
  }
  if (IS_TESTNET && (url === '/test' || url === '/testpi.html')) { fs.readFile(path.join(__dirname, 'testpi.html'), (e, b) => { res.writeHead(e ? 404 : 200, { 'Content-Type': HTML, 'Cache-Control': 'no-cache' }); res.end(e ? 'Not found' : b) }); return }
  if (url === '/stats') {
    const q = new URL(req.url, 'http://x').searchParams; if (q.get('key') !== STATS_KEY) { res.writeHead(404); return res.end('Not found') }
    const num = async k => Number(await redis(['GET', P + 'st:' + k]) || 0), card = async k => Number(await redis(['SCARD', P + 'st:' + k]) || 0);
    const hash = async k => { const f = await redis(['HGETALL', P + 'st:' + k]) || []; const o = []; for (let i = 0; i < f.length; i += 2) o.push([f[i], +f[i + 1]]); return o.sort((a, b) => b[1] - a[1]) };
    const days = []; for (let i = 0; i < 7; i++) days.push(new Date(Date.now() + 9 * 3600e3 - i * 864e5).toISOString().slice(0, 10));
    const row = async d => [d, await card('dev:' + d), await card('pi:' + d), await num('ck:' + d), await num('pay:' + d), Math.round(await num('payPi:' + d) * 100) / 100];
    const [rows, T, items, langs] = await Promise.all([Promise.all(days.map(row)), row('all'), hash('item'), hash('lang')]);
    const IT = { sun30: '햇살 30', sun100: '햇살 100', pets: '동물(옛)', plants: '식물 모두', animals: '동물 모두', sea: '바다 친구 모두', space: '별·우주 모두', deco: '꾸미기 세트' };
    const td = rows.map(r => '<tr>' + r.map(x => '<td>' + x + '</td>').join('') + '</tr>').join('');
    res.writeHead(200, { 'Content-Type': HTML, 'Cache-Control': 'no-store' });
    return res.end(`<!doctype html><meta name=viewport content="width=device-width,initial-scale=1"><title>All 바르게 통계</title><style>body{font-family:sans-serif;background:#f3fbe9;color:#2e3a2a;padding:16px;line-height:1.6}table{border-collapse:collapse;width:100%;background:#fff;border-radius:12px;overflow:hidden}td,th{padding:7px 6px;border-bottom:1px solid #e6efdc;text-align:center;font-size:14px}th{background:#5cc93a;color:#fff}.c{background:#fff;border-radius:14px;padding:12px 14px;margin:12px 0}.n{color:#889;font-size:12px}</style>
<h2>🌱 All 바르게 통계${IS_TESTNET ? ' (테스트넷)' : ''}</h2>
<div class=c>누적 방문 기기 <b>${T[1]}</b> · 누적 Pi 로그인 <b>${T[2]}</b><br>출석 체크 <b>${T[3]}</b>회 · 파이 결제 <b>${T[4]}</b>건 (<b>${T[5]}</b> π)</div>
<table><tr><th>날짜</th><th>방문</th><th>Pi 로그인</th><th>출석</th><th>결제</th><th>π</th></tr>${td}</table>
<div class=c>많이 산 상품: ${items.length ? items.map(([k, v]) => (IT[k] || k) + ' <b>' + v + '</b>').join(' · ') : '아직 없어요'}</div>
<div class=c>처음 방문한 기기 언어: ${langs.length ? langs.slice(0, 10).map(([k, v]) => k + ' <b>' + v + '</b>').join(' · ') : '아직 없어요'}</div>
<p class=n>한국 시간 기준 · 저장: ${upEnv('upstashredisresturl') ? 'Upstash (계속 유지)' : '저장소 연결 안 됨'}</p>`);
  }
  const f = FILES[url]; if (!f) { res.writeHead(404); return res.end('Not found') }
  fs.readFile(path.join(__dirname, f[0]), (err, buf) => { if (err) { res.writeHead(404); return res.end('Not found') }
    res.writeHead(200, { 'Content-Type': f[1], 'Cache-Control': 'no-cache', 'Content-Length': buf.length }); res.end(buf) });
}).listen(PORT, () => console.log('allbareuge on', PORT));
