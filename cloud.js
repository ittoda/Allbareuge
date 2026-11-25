/* ---------- Pi 로그인 · 클라우드 저장 · Pi 결제 ---------- */
var SYNC_KEYS=['kid','sb','grow','gearn','mq','gtok','gprem','gdeco','story'];
function piTok(){return window.PI_SESSION&&window.PI_SESSION.token}
function api(u,d){return fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d||{})}).then(function(r){return r.ok?r.json():null}).catch(function(){return null})}
var _cdT=null,_pulling=false;
function cloudDirty(){if(_pulling||!piTok())return;try{localStorage.setItem('ab_t',JSON.stringify(Date.now()))}catch(e){}clearTimeout(_cdT);_cdT=setTimeout(cloudPush,1500)}
function cloudPush(){var tk=piTok();if(!tk)return;var d={_t:ls('t')||Date.now()};SYNC_KEYS.forEach(function(k){var v=ls(k);if(v!==null)d[k]=v});api('/me',{token:tk,data:d})}
async function cloudPull(){var tk=piTok();if(!tk)return;var r=await api('/me',{token:tk});
  if(r&&r.ok&&r.data&&(r.data._t||0)>(ls('t')||0)){_pulling=true;SYNC_KEYS.forEach(function(k){if(k in r.data)ls(k,r.data[k])});ls('t',r.data._t);_pulling=false;
    KID=ls('kid')||KID;SB=ls('sb')||SB;GR=ls('grow')||GR}
  await claim();if(!(r&&r.data))cloudPush()}
async function claim(){var tk=piTok();if(!tk)return;var g=await api('/claim',{token:tk});if(!g||!g.ok)return;var ch=false;
  if(g.tok>0){if(GR){GR.tok+=g.tok;grSave()}else ls('gtok',(ls('gtok')||0)+g.tok);ch=true;toast('☀️ '+GU(33,g.tok))}
  if(g.prem&&!ls('gprem')){ls('gprem',1);ch=true}if(g.deco&&!ls('gdeco')){ls('gdeco',1);ch=true}
  if(ch){clearTimeout(_cdT);cloudPush();render()}}
document.addEventListener('visibilitychange',function(){if(document.hidden&&_cdT){clearTimeout(_cdT);_cdT=null;cloudPush()}});
function withTimeout(p,ms){return Promise.race([p,new Promise(function(r){setTimeout(function(){r(null)},ms)})])}
var _logging=false;
async function piStart(){if(_logging)return;_logging=true;var b=$('#piStart');if(b){b.disabled=true;b.textContent=LU(12)}
  try{var inPi=/PiBrowser/i.test(navigator.userAgent)||window.top!==window.self;var s=(inPi&&window.piLogin)?await withTimeout(window.piLogin(),12000):null;if(s){api('/ev',{token:s.token,e:'login'});await cloudPull()}}catch(e){}
  _logging=false;go(KID?'home':'kid')}
function acctLine(){var s=window.PI_SESSION;return s&&s.username?'<p class="mut" style="text-align:center;margin:8px 0 0">'+esc(LU(14,s.username))+'</p>':''}
/* 실제 Pi 결제 (부모님 확인 뒤) */
payPi=function(i){var it=PAY[i];gate(async function(){
  if(!window.Pi){toast('π '+GU(54));return}
  if(!piTok()){await withTimeout(window.piLogin(),12000);if(!piTok()){toast('π '+GU(54));return}await cloudPull()}
  var tk=piTok();
  try{Pi.createPayment({amount:it.pi,memo:'All Bareuge: '+it.id,metadata:{item:it.id}},{
    onReadyForServerApproval:function(id){api('/pay/approve',{token:tk,paymentId:id})},
    onReadyForServerCompletion:function(id,tx){api('/pay/complete',{token:tk,paymentId:id,txid:tx}).then(function(r){if(r&&r.ok){claim().then(function(){confetti(40);toast(it.e+' '+GU(59))})}else toast(LU(15))})},
    onCancel:function(){toast(LU(16))},onError:function(){toast(LU(15))}})}catch(e){toast(LU(15))}})};
/* 출석은 통계에 세기 */
(function(){var c=window.checkIn;window.checkIn=function(){var had=GR&&GR.ck&&GR.ck[today()];var r=c.apply(this,arguments);if(!had&&piTok())api('/ev',{token:piTok(),e:'ck'});return r}})();
/* 방문 기기 수 (이름 없음) */
(function(){try{var d=ls('dev');if(!d){d=Math.random().toString(36).slice(2,12);ls('dev',d)}fetch('/hit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({d:d,l:LANG})}).catch(function(){})}catch(e){}})();
render();
