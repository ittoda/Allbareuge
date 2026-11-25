/* ---------- Pi 로그인 · 클라우드 저장 · Pi 결제 ---------- */
var SYNC_KEYS=['kid','sb','grow','gearn','mq','gtok','gprem','gdeco','story','gp_plants','gp_animals','gp_sea','gp_space'];
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
  if(g.prem&&!ls('gprem')){ls('gprem',1);ch=true}['plants','animals','sea','space'].forEach(function(f){if(g[f]&&!ls('gp_'+f)){ls('gp_'+f,1);ch=true}});if(g.deco&&!ls('gdeco')){ls('gdeco',1);ch=true}
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
/* 파이 브라우저가 아니면 열어 달라고 안내 (샌드박스·미리보기 iframe 안에서는 안 띄워요) */
(function(){try{var ua=navigator.userAgent||'',inFrame=false;try{inFrame=window.self!==window.top}catch(_){inFrame=true}
  if(/PiBrowser/i.test(ua)||inFrame||!/^https?:$/.test(location.protocol)||location.hostname==='localhost')return;
  var H=location.host,an=/Android/i.test(ua),store=an?'https://play.google.com/store/apps/details?id=pi.browser':'https://apps.apple.com/app/pi-browser/id1560911608';
  var go=an?'intent://'+H+'#Intent;scheme=pi;package=pi.browser;S.browser_fallback_url='+encodeURIComponent(store)+';end':'pi://'+H;
  var TT={ko:['파이 브라우저에서 열어 주세요','All 바르게는 파이 로그인으로 아이 기록을 지켜요. 파이 브라우저에서 열어야 쓸 수 있어요.','π 파이 브라우저로 열기','주소 복사하기','파이 브라우저 설치하기','안 열리면: 파이 브라우저를 켜고 주소창에 '+H+' 를 입력해 주세요','복사했어요! 파이 브라우저 주소창에 붙여 넣으세요'],
   en:['Open in Pi Browser','All Bareuge keeps your child’s records safe with Pi login. Please open it in the Pi Browser.','π Open in Pi Browser','Copy address','Get Pi Browser','If it does not open: start Pi Browser and type '+H,'Copied! Paste it in the Pi Browser address bar'],
   vi:['Mở trong Pi Browser','All Bareuge dùng đăng nhập Pi để giữ an toàn dữ liệu của bé. Hãy mở bằng Pi Browser.','π Mở bằng Pi Browser','Sao chép địa chỉ','Cài Pi Browser','Nếu không mở được: mở Pi Browser và nhập '+H,'Đã sao chép! Dán vào thanh địa chỉ Pi Browser'],
   id:['Buka di Pi Browser','All Bareuge menjaga catatan anak dengan login Pi. Silakan buka di Pi Browser.','π Buka di Pi Browser','Salin alamat','Pasang Pi Browser','Jika tidak terbuka: buka Pi Browser dan ketik '+H,'Tersalin! Tempel di bilah alamat Pi Browser'],
   hi:['Pi Browser में खोलें','All Bareuge Pi लॉगिन से बच्चे के रिकॉर्ड सुरक्षित रखता है। कृपया Pi Browser में खोलें।','π Pi Browser में खोलें','पता कॉपी करें','Pi Browser इंस्टॉल करें','न खुले तो: Pi Browser खोलकर '+H+' लिखें','कॉपी हो गया! Pi Browser के पता बार में पेस्ट करें'],
   zh:['请在 Pi 浏览器中打开','All 乖乖 通过 Pi 登录保护孩子的记录,请在 Pi 浏览器中打开。','π 用 Pi 浏览器打开','复制网址','安装 Pi 浏览器','打不开时:打开 Pi 浏览器,在地址栏输入 '+H,'已复制!请粘贴到 Pi 浏览器地址栏'],
   ja:['Pi Browser で ひらいてね','All バルゲは Pi ログインで お子さまの きろくを まもります。Pi Browser で ひらいてください。','π Pi Browser で ひらく','アドレスを コピー','Pi Browser を インストール','ひらかないときは Pi Browser を ひらいて '+H+' と にゅうりょく','コピーしました! Pi Browser の アドレスバーに はりつけてね']};
  var T=TT[LANG]||TT.en,d=document.createElement('div');d.id='openPi';d.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(46,90,30,.9);display:flex;align-items:center;justify-content:center;padding:20px';
  var b='display:block;width:100%;margin-top:10px;padding:14px;border-radius:16px;font-size:16px;font-weight:800;border:0;text-decoration:none;text-align:center;box-sizing:border-box;';
  d.innerHTML='<div style="background:#fff;border-radius:24px;max-width:360px;width:100%;padding:24px 20px;text-align:center;color:#2e3a2a">'+twinsLogo().replace('class="lg2"','class="lg2" style="margin:0 auto"')+'<h2 style="margin:10px 0 8px;font-size:21px">'+T[0]+'</h2><p style="margin:0 0 8px;color:#6b7866;font-size:14px;line-height:1.55">'+T[1]+'</p>'+
   '<a id="opGo" href="'+go+'" style="'+b+'background:#5cc93a;color:#fff;box-shadow:0 4px 0 #3e9a22">'+T[2]+'</a><button id="opCopy" style="'+b+'background:#e7f9dd;color:#3a8f20">'+T[3]+'</button><a href="'+store+'" target="_blank" rel="noopener" style="'+b+'background:#fff;color:#3a8f20;border:2px solid #c9f0b6">'+T[4]+'</a>'+
   '<p id="opHelp" hidden style="margin:12px 0 0;font-size:13px;color:#8a6500;background:#fff6d4;border-radius:10px;padding:10px">'+T[5]+'</p></div>';
  document.body.appendChild(d);
  document.getElementById('opGo').onclick=function(){setTimeout(function(){document.getElementById('opHelp').hidden=false},1800)};
  document.getElementById('opCopy').onclick=function(){var u='https://'+H;try{navigator.clipboard.writeText(u).then(function(){toast(T[6])},function(){prompt('',u)})}catch(e){prompt('',u)}};
}catch(e){}})();
render();
