/* ---------- 출석 체크 + 이번 달 출석 순위 (개근상) ---------- */
var AR=null,ART=0;
function attSend(){var tk=piTok&&piTok();if(!tk||!KID)return;api('/att',{token:tk,kid:KSFX,nm:KID.name,av:KID.av}).then(function(){ART=0;if(VIEW==='att')attLoad()})}
function attLoad(){if(Date.now()-ART<20000&&AR)return;ART=Date.now();var kf=KSFX;api('/attrank',{token:(window.piTok&&piTok())||'',kid:kf}).then(function(r){if(r&&r.ok){AR=r;if(kf===KSFX&&attMerge(r.days))render();else if(VIEW==='att')render()}})}
/* 서버에 남은 출석 날짜를 이 기기에도 표시 (햇살은 다시 주지 않아요) */
function attMerge(days){if(!days||!days.length)return false;var ck=ckMap(),ch=false;days.forEach(function(d){if(/^\d{4}-\d{2}-\d{2}$/.test(d)&&!ck[d]){ck[d]=1;ch=true}});if(!ch)return false;if(GR)grSave();else ls('gck',ck);var d=today();if(ck[d]){var e=ls('gearn')||{};if(e.d!==d)e={d:d};if(!e.ck){e.ck=1;ls('gearn',e)}}return true}
function attMonth(){var ck=ckMap(),ym=today().slice(0,7),n=0;Object.keys(ck).forEach(function(k){if(k.slice(0,7)===ym)n++});return n}
function attFull(){return attMonth()>=+today().slice(8,10)}
function attCard(){var d=today(),ok=!!ckMap()[d],n=attMonth(),s=streak();
  return '<div class="attc"><button class="attl" onclick="go(\'att\')"><span class="attic">📅</span><span><b>'+t('출석 체크')+'</b><small>'+t('이번 달 {0}일',n)+' · '+t('연속 {0}일',s)+(attFull()&&n>2?' · 🏅 '+t('개근 중'):'')+'</small></span></button>'+
  '<button class="attb'+(ok?' done':'')+'" onclick="'+(ok?'go(\'att\')':'checkIn()')+'">'+(ok?'✅ '+t('출석 완료'):'👆 '+t('출석하기'))+'</button>'+
  '<button class="attr" onclick="go(\'att\')">🏆 '+t('랭킹')+'</button></div>'}
function attView(){attLoad();var d=today(),ck=ckMap(),ok=!!ck[d],n=attMonth(),s=streak();
  var t0=new Date(d),y=t0.getFullYear(),m=t0.getMonth(),first=new Date(y,m,1).getDay(),dn=new Date(y,m+1,0).getDate(),cal='';
  for(var i=0;i<first;i++)cal+='<i></i>';
  for(var k=1;k<=dn;k++){var ds=y+'-'+String(m+1).padStart(2,'0')+'-'+String(k).padStart(2,'0');cal+='<i class="'+(ck[ds]?'on':'')+(ds===d?' td':'')+(ds>d?' fu':'')+'">'+(ck[ds]?'<span class="ckst">✓</span>':k)+'</i>'}
  var rk='';if(!AR)rk='<p class="mut" style="text-align:center">…</p>';else{
    if(!AR.top.length)rk='<p class="mut" style="text-align:center">'+t('아직 순위가 없어요. 첫 번째 주인공이 되어 보세요!')+'</p>';
    AR.top.slice(0,20).forEach(function(x,i){rk+='<div class="rkr'+(x.me?' me':'')+'"><span class="rkn">'+(i<3?['🥇','🥈','🥉'][i]:(i+1))+'</span><span class="rka">'+esc(x.a)+'</span><span class="rku">'+esc(x.n)+(x.full?' <em>🏅 '+t('개근')+'</em>':'')+'</span><b>'+t('{0}일',x.s)+'</b></div>'})}
  return hdr('📅 '+t('출석 체크'))+greet(ok?t('에헴~ 오늘도 출석했구먼! 옳지옳지~'):t('에헴! 오늘 출석 도장 찍으러 왔니?'),t('하루도 안 빠지면 개근상이야!'))+
  '<div class="box"><div class="attst"><div><b>'+n+'</b><small>'+t('이번 달 출석')+'</small></div><div><b>'+s+'</b><small>'+t('연속 출석')+'</small></div><div><b>'+(attFull()&&n>0?'🏅':'—')+'</b><small>'+t('개근')+'</small></div></div>'+
  '<div class="attcal">'+['일','월','화','수','목','금','토'].map(function(w){return '<u>'+t(w)+'</u>'}).join('')+cal+'</div>'+
  '<button class="btn '+(ok?'w':'y')+'" '+(ok?'disabled':'')+' onclick="checkIn()">'+(ok?'✅ '+t('오늘 출석 완료!'):'📅 '+t('출석하기')+' (+3 ☀️)')+'</button>'+
  '<p class="mut" style="text-align:center;font-size:12px;margin:8px 0 0">'+t('7일 연속 출석하면 햇살 +5 보너스!')+'</p></div>'+
  '<div class="box"><div style="display:flex;align-items:center"><h2 style="margin:0">🏆 '+t('{0}월 출석 랭킹',m+1)+'</h2>'+(AR&&AR.me?'<span class="chip s on" style="margin-left:auto;padding:4px 10px;font-size:12px">'+t('나의 순위')+' '+t('{0}위',AR.me.r)+'</span>':'')+'</div>'+
  (AR&&AR.n?'<p class="mut" style="font-size:12px;margin:4px 0 8px">'+t('친구 {0}명이 함께 출석하고 있어요',AR.n)+'</p>':'')+'<div class="rk">'+rk+'</div>'+
  (window.piTok&&piTok()?'':'<p class="mut" style="font-size:12px;text-align:center">'+t('Pi로 로그인하면 랭킹에 이름이 올라가요')+'</p>')+
  '<div class="attnote">🎁 <b>'+t('개근상을 탄 친구들에게 학용품을 드립니다!')+'</b><br>'+t('한 달 동안 하루도 빠짐없이 출석하면 개근상이에요. 학용품 선물은 Pi 정책에 따라 바뀌거나 빠질 수 있어요.')+'</div></div>'}
