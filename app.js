/* All 바르게 — 꼰둥이와 함께하는 바른 습관 앱 (아이 이름·그림 사진은 이 폰 안에만 저장돼요) */
var $=function(s){return document.querySelector(s)};
function ls(k,v){try{if(v===undefined){var r=localStorage.getItem('ab_'+k);return r?JSON.parse(r):null}localStorage.setItem('ab_'+k,JSON.stringify(v));if(k!=='lang'&&k!=='t'&&window.cloudDirty)cloudDirty()}catch(e){return null}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function toast(m){var t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove()},2200)}
function today(){var d=new Date(Date.now()+9*3600e3);return d.toISOString().slice(0,10)}
function rnd(a){return a[Math.floor(Math.random()*a.length)]}
function confetti(n){var e=['🎉','⭐','🌸','💚','💛','🎈','✨'];for(var i=0;i<(n||26);i++){var c=document.createElement('div');c.className='conf';c.textContent=rnd(e);c.style.left=Math.random()*100+'vw';c.style.animationDuration=(1.8+Math.random()*1.6)+'s';c.style.animationDelay=Math.random()*.6+'s';document.body.appendChild(c);setTimeout(function(x){x.remove()}.bind(null,c),4200)}}
function buzz(){try{navigator.vibrate&&navigator.vibrate(30)}catch(e){}}

/* ---------- 언어: 한국어가 기본, 다른 언어는 TR(화면 글자)과 CT(콘텐츠)에서 찾아요 ---------- */
var LNAME={ko:'한국어',en:'English',ja:'日本語',zh:'中文',vi:'Tiếng Việt',id:'Bahasa Indonesia',hi:'हिन्दी',es:'Español',fr:'Français',de:'Deutsch',pt:'Português',it:'Italiano',tr:'Türkçe',ru:'Русский',th:'ไทย',ar:'العربية',el:'Ελληνικά'};
var LANGS={ko:'한국어'};Object.keys(LNAME).forEach(function(k){if(window.TR&&TR[k]&&window.CT&&CT[k])LANGS[k]=LNAME[k]});
var LANG=(function(){var q='';try{q=new URLSearchParams(location.search).get('lang')||''}catch(e){}var s=ls('lang');var n=(navigator.language||'').slice(0,2);
  if(LANGS[q])return q;if(LANGS[s])return s;return n==='ko'?'ko':(LANGS[n]?n:'en')})();
document.documentElement.lang=LANG;
function josa(s){if(LANG!=='ko')return s;return s.replace(/(\S)\[([^\]\/]+)\/([^\]]+)\]/g,function(m,ch,a,b){var j=jong(ch);if(a==='으로')return ch+((j>0&&j!==8)?a:b);return ch+(j>0?a:b)})}
function t(k){var a=arguments,d=LANG!=='ko'&&window.TR&&TR[LANG],s=d&&(k in d)?d[k]:k;return josa(s.replace(/\{(\d)\}/g,function(m,i){return a[+i+1]}))}
function C(name){return (LANG!=='ko'&&window.CT&&CT[LANG]&&CT[LANG][name])||window[name]}
function setLang(l){LANG=l;ls('lang',l);document.documentElement.lang=l;STORY=null;MQ=null;DR.topic=null;render()}
function langSel(){return '<select class="lsel" onchange="setLang(this.value)" aria-label="language">'+Object.keys(LANGS).map(function(k){return '<option value="'+k+'"'+(k===LANG?' selected':'')+'>'+LANGS[k]+'</option>'}).join('')+'</select>'}
function KN(){return t('꼰댕이')}function SN(){return t('꼰순이')}

/* ---------- 꼰둥이 쌍둥이 ---------- */
function chr(c,cls){if(c==='K')return '<img class="'+(cls||'ci')+'" src="'+IMG.kd_f+'" alt="'+KN()+'">';if(c==='S')return '<img class="'+(cls||'ci')+'" src="'+IMG.ks_f+'" alt="'+SN()+'">';return '<span class="ch">'+c+'</span>'}
var PIM={};['kd_f','ks_f','kd_h','ks_h'].forEach(function(k){var i=new Image();i.src=IMG[k];PIM[k]=i});
function twinsLogo(){return '<div class="lg2"><img src="'+IMG.kd_h+'" alt=""><img src="'+IMG.ks_h+'" alt=""></div>'}
function greet(kLine,sLine){return '<div class="greet"><img src="'+IMG.kd_f+'" alt="'+KN()+'"><div class="gb"><b>'+KN()+'</b> '+kLine+'<br><b class="pk">'+SN()+'</b> '+sLine+'</div><img src="'+IMG.ks_f+'" alt="'+SN()+'"></div>'}
function praise(msg,who){var o=$('#praise');if(o)o.remove();o=document.createElement('div');o.id='praise';o.className='praise';
  o.innerHTML='<img src="'+(who==='K'?IMG.kd_f:IMG.ks_f)+'" alt=""><div class="pb">'+esc(msg)+'</div>';document.body.appendChild(o);setTimeout(function(){o.classList.add('out')},1500);setTimeout(function(){o.remove()},1900)}

/* ---------- 한국어 조사 ---------- */
function jong(w){w=String(w||'');var c=w.charCodeAt(w.length-1);if(c<0xAC00||c>0xD7A3)return -1;return (c-0xAC00)%28}
function nm(n){return LANG==='ko'&&jong(n)>0?n+'이':n}             // 민준 → 민준이 (한국어만)
function voc(n){return LANG==='ko'?n+(jong(n)>0?'아':'야'):n}        // 민준아, 지우야
function fill(tpl,o){return josa(tpl.replace(/\{N\}/g,o.N).replace(/\{F\}/g,o.F).replace(/\{T\}/g,o.T).replace(/\{P\}/g,o.P).replace(/\{V\}/g,o.V))}

/* ---------- 상태 ---------- */
var KID=ls('kid')||null;       // {name, av}
var SB=ls('sb')||null;         // 도장판
var VIEW='cover',SUB={};
function go(v,o){VIEW=v;SUB=o||{};render();window.scrollTo(0,0)}
function hdr(x){return '<div class="top"><button class="back" onclick="go(\'home\')">← '+t('처음')+'</button><b>'+x+'</b></div>'}
var AV=['🐣','🐰','🐻','🦊','🐼','🐯','🦄','🐬','🐶','🐱','🦖','🐧'];

function render(){var h='';
  if(!KID&&VIEW!=='kid'&&VIEW!=='cover')VIEW='kid';
  if(VIEW==='cover')h=coverView();else if(VIEW==='kid')h=kidView();else if(VIEW==='home')h=homeView();else if(VIEW==='stamp')h=stampView();
  else if(VIEW==='story')h=storyView();else if(VIEW==='toon')h=toonView();else if(VIEW==='draw')h=drawView();else if(VIEW==='manner')h=mannerView();else if(VIEW==='grow')h=growView();
  $('#app').innerHTML=h;if(VIEW==='draw'&&SUB.step==='time')tick();}
function logo(center){return '<div class="logo"'+(center?' style="justify-content:center;margin:18px 0 6px"':'')+'>'+twinsLogo()+'<div><h1>all <span>'+t('바르게')+'</span></h1><small>'+t('꼰둥이와 함께 자라는 바른 습관')+'</small></div>'+(center?'':'<div style="margin-left:auto">'+langSel()+'</div>')+'</div>'}


/* ---------- 앞표지 ---------- */
function coverView(){var nm=t('바르게'),cols=['#5cc93a','#ffb800','#4db8f5','#ff7fa8'];
  var gs;try{gs=Array.from(new Intl.Segmenter(LANG,{granularity:'grapheme'}).segment(nm),function(x){return x.segment})}catch(e){gs=/[\u0900-\u0DFF\u0E00-\u0E7F\u0600-\u06FF]/.test(nm)?[nm]:Array.from(nm)}
  var title=gs.map(function(ch,i){return ch===' '?' ':'<i style="color:'+cols[i%4]+'">'+esc(ch)+'</i>'}).join('');
  var F=[['🏅',5],['📖',6],['💬',7],['🎨',8],['🙋',9]];
  return '<div class="cov"><div class="cv-sky"><span class="cl c1"></span><span class="cl c2"></span><span class="cl c3"></span></div>'+
  '<div class="cv-top">'+langSel()+'</div>'+
  '<div class="cv-hero"><div class="cv-sun"></div><img class="cv-k" src="'+IMG.kd_f+'" alt="'+esc(KN())+'"><img class="cv-s" src="'+IMG.ks_f+'" alt="'+esc(SN())+'">'+
  '<div class="cv-bub b1">'+esc(t('에헴~ 반갑구먼!'))+'</div></div>'+
  '<h1 class="cv-t"><small>all</small>'+title+'</h1>'+
  '<p class="cv-tag">'+esc(LU(10))+'</p>'+
  '<div class="cv-badge">'+esc(LGL().cover)+'</div>'+
  '<button class="btn cv-go" id="piStart" onclick="piStart()">π '+esc(LU(11))+' 🌱</button>'+
  (window.PI_SESSION?acctLine():'')+
  '<div class="cv-foot"><a href="#" onclick="legal(\'about\');return false">'+esc(LU(2))+'</a><span>·</span><a href="#" onclick="legal(\'privacy\');return false">'+esc(LU(0))+'</a><span>·</span><a href="#" onclick="legal(\'terms\');return false">'+esc(LU(1))+'</a></div>'+
  '<div class="cv-ver">'+esc(LU(3))+' '+APP_VER+' · © 2026 all '+esc(t('바르게'))+'</div></div>'}
function legal(k){var L=LGL(),h;
  if(k==='about')h='<h2 style="display:flex;align-items:center;gap:10px">'+twinsLogo()+'all '+esc(t('바르게'))+'</h2><p style="line-height:1.7">'+esc(L.about)+'</p><p class="mut">'+esc(L.cover)+'</p><p class="mut">'+esc(LU(3))+' '+APP_VER+'</p>';
  else h='<h2>'+esc(LU(k==='privacy'?0:1))+'</h2><ol class="lgl">'+L[k].map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ol><p class="mut">'+esc(L.eff)+' · '+esc(LU(3))+' '+APP_VER+'</p>';
  sheet(h+'<button class="btn w" onclick="closeSheet()">'+t('닫기')+'</button>')}
function footLinks(){return '<div class="cv-foot in"><a href="#" onclick="go(\'cover\');return false">🏠 All '+esc(t('바르게'))+'</a><span>·</span><a href="#" onclick="legal(\'privacy\');return false">'+esc(LU(0))+'</a><span>·</span><a href="#" onclick="legal(\'terms\');return false">'+esc(LU(1))+'</a></div><div class="cv-ver">'+esc(LU(3))+' '+APP_VER+'</div>'}

/* ---------- 아이 정보 ---------- */
function kidView(){var k=KID||{name:'',av:'🐣'};
  return '<div style="text-align:right">'+langSel()+'</div>'+logo(1)+greet(t('에헴~ 반갑구먼!'),t('이름이 뭐니? 알려 주렴~'))+
  '<div class="box"><h2>👋 '+t('우리 아이를 소개해 주세요')+'</h2><label class="f">'+t('아이 이름 (또는 애칭)')+'</label><input id="kn" class="inp" maxlength="12" placeholder="'+t('예) 지우')+'" value="'+esc(_kn!=null?_kn:k.name)+'">'+
  '<label class="f">'+t('좋아하는 캐릭터')+'</label><div class="chips" id="kav">'+AV.map(function(a){return '<button class="chip'+(a===(_av||k.av)?' on':'')+'" style="font-size:24px" onclick="pickAv(this,\''+a+'\')">'+a+'</button>'}).join('')+'</div>'+
  (function(){var p=ls('photo'),sel=(_av||k.av)==='📷';return '<div class="kph">'+(p?'<button class="chip kpc'+(sel?' on':'')+'" onclick="pickAv(this,\'📷\')"><img class="kphoto" src="'+p+'" alt=""></button><button class="btn w" style="flex:1" onclick="pickPhoto()">'+esc(LU(17))+'</button><button class="kdel" onclick="delPhoto()">'+esc(LU(19))+'</button>':'<button class="btn w" style="flex:1" onclick="pickPhoto()">'+esc(LU(17))+'</button>')+'</div><p class="mut" style="margin:6px 0 0;font-size:12.5px">🔒 '+esc(LU(18))+'</p>'})()+
  '<p class="mut" style="margin-top:12px">🔒 '+t('실명 대신 애칭만 넣어 주세요.')+'</p>'+
  '<button class="btn" onclick="saveKid()">'+t('시작하기')+' 🌱</button></div>'}
var _av=null,_kn=null;function pickAv(b,a){_av=a;document.querySelectorAll('#kav .chip,.kpc').forEach(function(x){x.classList.remove('on')});b.classList.add('on')}
function avHTML(){var p=ls('photo');return (KID&&KID.av==='📷'&&p)?'<img class="kphoto" src="'+p+'" alt="">':esc((KID&&KID.av!=='📷'&&KID.av)||'🐣')}
function pickPhoto(){var i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=function(){var f=i.files&&i.files[0];if(!f)return;var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var S=320,c=document.createElement('canvas');c.width=c.height=S;var m=Math.min(im.width,im.height),x=(im.width-m)/2,y=(im.height-m)/2;c.getContext('2d').drawImage(im,x,y,m,m,0,0,S,S);try{ls('photo',c.toDataURL('image/jpeg',0.82))}catch(e){}var kn=$('#kn');if(kn)_kn=kn.value;_av='📷';render()};im.src=r.result};r.readAsDataURL(f)};i.click()}
function delPhoto(){try{localStorage.removeItem('ab_photo')}catch(e){}if(_av==='📷')_av='🐣';if(KID&&KID.av==='📷'){KID.av='🐣';ls('kid',KID)}render()}
function saveKid(){var n=$('#kn').value.trim().replace(/[<>{}\[\]]/g,'');if(!n){toast(t('아이 이름을 넣어 주세요'));return}
  KID={name:n,av:_av||(KID&&KID.av)||'🐣'};_kn=null;_av=null;ls('kid',KID);go('home')}

/* ---------- 홈 ---------- */
function homeView(){var s=SB,cnt=s?s.stamps.length:0,goal=s?s.goal:10,ti=todayToonIdx();
  return logo()+greet(t('에헴~ {0}, 오늘도 바르게!',esc(voc(KID.name))),t('잘하면 내가 "옳지옳지~" 해 줄게!'))+
  '<div class="kid"><div class="av">'+avHTML()+'</div><div><div class="nm">'+esc(KID.name)+'</div><div class="sub">'+t('오늘도 바르게, 즐겁게!')+' ✨</div></div><button class="ed" onclick="go(\'kid\')">✏️ '+t('고치기')+'</button></div>'+
  '<button class="card wide" onclick="go(\'manner\')"><div class="wl"><div class="icrow"><span class="ic">🐣</span><span class="icsay">'+t('에헴! 라떼는 말야~')+'</span></div><h3>'+t('아름다운 어린이 되기')+'</h3><p>'+t('꼰둥이 배지 {0}개',ls('mq')||0)+'</p></div><img src="'+IMG.ks_f+'" alt=""><img src="'+IMG.kd_f+'" alt=""></button>'+
  growCard()+'<div class="grid">'+
   '<button class="card g" onclick="go(\'stamp\')"><div class="ic"><span class="seal"><b>'+t('참 잘')+'</b><b>'+t('했어요')+'</b></span></div><h3>'+t('칭찬 도장판')+'</h3><p>'+t('약속을 지키면 도장 쾅!')+'<br>'+t('다 모으면 상장 카드')+'</p></button>'+
   '<button class="card p" onclick="go(\'story\')"><div class="ic">📖</div><h3>'+t('내 이름 동화')+'</h3><p>'+t('{0}[이/가] 주인공인',esc(KID.name))+'<br>'+t('5분 동화')+'</p></button>'+
   '<button class="card s" onclick="go(\'toon\',{i:'+ti+'})"><span class="bdg">'+t('오늘')+' #'+(ti+1)+'</span><div class="ic">💬</div><h3>'+t('꼰둥이 웹툰')+'</h3><p>'+t('꼰댕이·꼰순이의')+'<br>'+t('하루 한 편 4컷')+'</p></button>'+
   '<button class="card y" onclick="go(\'draw\')"><div class="ic">🎨</div><h3>'+t('그림 퀴즈')+'</h3><p>'+t('주제 뽑고 10분 그리기')+'<br>'+t('찰칵 찍으면 점수!')+'</p></button>'+
  '</div>'+
  '<div class="box" style="margin-top:14px"><h2>👨‍👩‍👧 '+t('부모님께')+'</h2><p class="mut" style="margin:0;line-height:1.6">'+t('도장은 아이가 약속을 지켰을 때 함께 찍어 주세요. 다 모으면 상장을 사진첩에 저장하거나 인쇄해서 냉장고에 붙여 주세요 😊')+'<br>'+t('광고 없이 안심하고 쓰는 앱이에요.')+'</p></div>'+footLinks()}

/* ---------- 칭찬 도장판 ---------- */
var STAMPS=['⭐','🌸','🍀','🐰','💚','🌈','🍓','🐥'];
function newSB(o){o=o||{};var M=C('MISS');return {missions:o.missions||[M[0],M[1],M[3]],goal:o.goal||10,promise:o.promise||'',parent:o.parent||t('엄마 아빠'),start:today(),stamps:[],done:false}}
function stampView(){if(!SB||SUB.setup)return stampSetup();var s=SB,n=s.stamps.length,full=n>=s.goal;
  var cells='';for(var i=0;i<s.goal;i++){var st=s.stamps[i];cells+=st?'<div class="cell on'+(SUB.pop===i?' pop':'')+'"><span>'+st.s+'</span><i>'+st.d.slice(5).replace('-','/')+'</i></div>':'<div class="cell">'+(i+1)+'</div>'}
  return hdr('🏅 '+t('칭찬 도장판'))+
  '<div class="box"><div style="display:flex;align-items:center"><h2 style="margin:0">'+t('{0}의 도장판',esc(KID.name))+'</h2><button class="chip" style="margin-left:auto" onclick="go(\'stamp\',{setup:1})">⚙️ '+t('설정')+'</button></div>'+
  '<div class="prog"><i style="width:'+Math.min(100,n/s.goal*100)+'%"></i></div><p class="mut" style="margin:6px 0 10px">'+t('{0} / {1}개',n,s.goal)+' · '+(full?t('다 모았어요!')+' 🎉':t('앞으로 {0}개 남았어요',s.goal-n))+'</p>'+
  '<div class="board">'+cells+'</div>'+
  (s.promise?'<div class="promise">🎁 <b>'+t('{0}의 약속',esc(s.parent))+'</b><br>'+t('다 모으면 <b>{0}</b>!',esc(s.promise))+'</div>':'<div class="promise">🎁 '+t('<b>부모님 약속</b>을 아직 안 정했어요. ⚙️ 설정에서 정해 주세요!')+'</div>')+'</div>'+
  (full?'<button class="btn p" onclick="makeCert()">🏆 '+t('상장 받기')+'</button><button class="btn w" onclick="restartSB()">'+t('새 도장판 시작하기')+'</button>':
  '<div class="box"><h2>'+t('오늘 지킨 약속을 눌러요')+'</h2>'+s.missions.map(function(m,i){var c=s.stamps.filter(function(x){return x.m===m}).length;return '<button class="mbtn" onclick="stamp('+i+')">'+esc(m)+'<small>'+t('{0}번',c)+' ✓</small></button>'}).join('')+
  [0,1].map(function(j){var v=(s.extra&&s.extra[j])||'',c=v?s.stamps.filter(function(x){return x.m==='✏️ '+v}).length:0;return '<div class="mx"><input id="mx'+j+'" class="inp" maxlength="20" placeholder="✏️ '+t('기타 약속 (직접 입력)')+'" value="'+esc(v)+'"><button class="chip" onclick="stampX('+j+')">'+(c?t('{0}번',c)+' ✓':'👍 '+t('도장'))+'</button></div>'}).join('')+
  '<p class="mut" style="margin:10px 0 0">👆 '+t('부모님이 확인하고 함께 눌러 주세요')+'</p>'+(n?'<button class="chip" style="margin-top:10px" onclick="undoStamp()">↩︎ '+t('방금 도장 취소')+'</button>':'')+'</div>')}
function stampSetup(){var s=SB||newSB(),M=C('MISS');var sel=s.missions.slice();window._sel=sel;
  return hdr('⚙️ '+t('도장판 설정'))+'<div class="box"><h2>'+t('어떤 약속을 지킬까요?')+'</h2><div class="chips" id="msel">'+
  M.concat(sel.filter(function(m){return M.indexOf(m)<0})).map(function(m){return '<button class="chip'+(sel.indexOf(m)>=0?' on':'')+'" onclick="togM(this)">'+esc(m)+'</button>'}).join('')+'</div>'+
  '<div class="row" style="margin-top:10px"><input id="mnew" class="inp" maxlength="20" placeholder="'+t('직접 쓰기 (예: 물 마시기)')+'"><button class="chip" style="flex:0 0 auto" onclick="addM()">＋ '+t('추가')+'</button></div>'+
  '<label class="f">'+t('도장 몇 개 모을까요?')+'</label><div class="chips" id="gsel">'+[5,10,15,20,30].map(function(g){return '<button class="chip'+(g===s.goal?' on':'')+'" onclick="pickG(this,'+g+')">'+t('{0}개',g)+'</button>'}).join('')+'</div>'+
  '<label class="f">🎁 '+t('부모님 약속 (다 모으면?)')+'</label><input id="prom" class="inp" maxlength="30" placeholder="'+t('예) 공룡 레고 사 주기, 놀이공원 가기')+'" value="'+esc(s.promise)+'">'+
  '<label class="f">'+t('약속하는 사람')+'</label><input id="par" class="inp" maxlength="16" value="'+esc(s.parent)+'">'+
  '<button class="btn" onclick="saveSB()">'+t('저장하기')+'</button>'+(SB&&SB.stamps.length?'<p class="mut">'+t('이미 찍은 도장은 그대로 남아요.')+'</p>':'')+'</div>'}
var _goal=null;
function togM(b){var m=b.textContent,i=_sel.indexOf(m);if(i>=0){_sel.splice(i,1);b.classList.remove('on')}else{if(_sel.length>=6){toast(t('약속은 6개까지 고를 수 있어요'));return}_sel.push(m);b.classList.add('on')}}
function addM(){var v=$('#mnew').value.trim().replace(/[<>]/g,'');if(!v)return;if(_sel.length>=6){toast(t('약속은 6개까지 고를 수 있어요'));return}v='⭐ '+v;_sel.push(v);var b=document.createElement('button');b.className='chip on';b.textContent=v;b.onclick=function(){togM(b)};$('#msel').appendChild(b);$('#mnew').value=''}
function pickG(b,g){_goal=g;document.querySelectorAll('#gsel .chip').forEach(function(x){x.classList.remove('on')});b.classList.add('on')}
function saveSB(){if(!_sel.length){toast(t('약속을 하나 이상 골라 주세요'));return}
  var o={missions:_sel.slice(),goal:_goal||(SB&&SB.goal)||10,promise:$('#prom').value.trim().replace(/[<>]/g,''),parent:$('#par').value.trim().replace(/[<>]/g,'')||t('엄마 아빠')};
  if(SB){SB.missions=o.missions;SB.goal=Math.max(o.goal,SB.stamps.length);SB.promise=o.promise;SB.parent=o.parent}else SB=newSB(o);
  _goal=null;ls('sb',SB);go('stamp')}
function stamp(i){var s=SB;if(s.stamps.length>=s.goal)return;s.stamps.push({m:s.missions[i],d:today(),s:rnd(STAMPS)});ls('sb',s);buzz();
  go('stamp',{pop:s.stamps.length-1});praise(rnd([t('옳지옳지~! 참 잘했어요'),t('에헴~ 약속을 지켰구먼!'),t('옳지! 라떼보다 낫구먼~')]),rnd(['K','S']));if(s.stamps.length>=s.goal)setTimeout(function(){confetti(40);toast('🎉 '+t('다 모았어요! 상장을 받아요!'))},500)}
function stampX(j){var s=SB,v=($('#mx'+j).value||'').trim().replace(/[<>{}\[\]]/g,'');if(!v){toast(t('약속을 적어 주세요'));$('#mx'+j).focus();return}if(s.stamps.length>=s.goal)return;s.extra=s.extra||['',''];s.extra[j]=v;s.stamps.push({m:'✏️ '+v,d:today(),s:rnd(STAMPS)});ls('sb',s);buzz();
  go('stamp',{pop:s.stamps.length-1});praise(rnd([t('옳지옳지~! 참 잘했어요'),t('에헴~ 약속을 지켰구먼!'),t('옳지! 라떼보다 낫구먼~')]),rnd(['K','S']));if(s.stamps.length>=s.goal)setTimeout(function(){confetti(40);toast('🎉 '+t('다 모았어요! 상장을 받아요!'))},500)}
function ask(msg,fn){sheet('<h2>'+msg+'</h2><div class="row"><button class="btn w" onclick="closeSheet()">'+t('아니요')+'</button><button class="btn" id="askY">'+t('네')+'</button></div>');$('#askY').onclick=function(){closeSheet();fn()}}
function undoStamp(){if(!SB.stamps.length)return;ask(t('방금 찍은 도장을 취소할까요?'),function(){SB.stamps.pop();ls('sb',SB);go('stamp')})}
function restartSB(){ask(t('새 도장판을 시작할까요?')+'<br><small class="mut">'+t('상장은 먼저 저장해 두세요')+'</small>',function(){var h=ls('hist')||[];h.unshift({end:today(),goal:SB.goal,promise:SB.promise});ls('hist',h.slice(0,30));SB=newSB({missions:SB.missions,goal:SB.goal,parent:SB.parent});ls('sb',SB);go('stamp',{setup:1})})}

/* ---------- 상장 카드 (캔버스) ---------- */
function wrapText(c,tx,x,y,mw,lh,dry){var words=LANG==='ko'||LANG==='ja'||LANG==='zh'?tx.split(''):tx.split(/(\s+)/),line='',lines=[];for(var i=0;i<words.length;i++){var tt=line+words[i];if(c.measureText(tt).width>mw&&line){lines.push(line);line=words[i].replace(/^\s+/,'')}else line=tt}lines.push(line);if(!dry)lines.forEach(function(l,k){c.fillText(l,x,y+k*lh)});return lines.length}
function makeCert(){var W=1080,H=1440,cv=document.createElement('canvas');cv.width=W;cv.height=H;var c=cv.getContext('2d');
  var F='"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif';
  var g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#fffbe8');g.addColorStop(1,'#f1fbe9');c.fillStyle=g;c.fillRect(0,0,W,H);
  c.strokeStyle='#5cc93a';c.lineWidth=18;c.strokeRect(40,40,W-80,H-80);c.strokeStyle='#ffcf33';c.lineWidth=6;c.strokeRect(72,72,W-144,H-144);
  var dots=['#ff7fa8','#4db8f5','#ffcf33','#5cc93a'];for(var i=0;i<26;i++){c.fillStyle=dots[i%4];c.beginPath();c.arc(90+i*(W-180)/25,56,9,0,7);c.fill();c.beginPath();c.arc(90+i*(W-180)/25,H-56,9,0,7);c.fill()}
  c.textAlign='center';c.font='120px '+F;c.fillText('🏆',W/2,250);
  c.fillStyle='#2e3a2a';c.font='900 '+(LANG==='ko'?104:66)+'px '+F;c.fillText(t('칭 찬 상 장'),W/2,400);
  c.fillStyle='#5cc93a';c.font='800 46px '+F;c.fillText('all '+t('바르게'),W/2,470);
  c.fillStyle='#2e3a2a';c.font='900 84px '+F;c.fillText(KID.name,W/2,620);
  c.font='800 40px '+F;c.fillStyle='#7d8a76';c.fillText(t('어린이'),W/2,680);
  var body=t('위 어린이는 {0}부터 {1}까지 {2} 약속을 {3}번이나 멋지게 지켰기에 이 상장을 드립니다.',SB.start.replace(/-/g,'.'),today().replace(/-/g,'.'),SB.missions.map(function(m){return m.replace(/^\S+\s/,'')}).join(', '),SB.goal);
  var room=(SB.promise?1100-190:1100)-790,fz=42,lh,ln;
  for(;fz>=26;fz-=2){lh=Math.round(fz*1.55);c.font='600 '+fz+'px '+F;ln=wrapText(c,body,0,0,W-260,lh,1);if(ln*lh+40<=room)break}
  c.fillStyle='#2e3a2a';c.font='600 '+fz+'px '+F;ln=wrapText(c,body,W/2,790,W-260,lh);
  var y=790+ln*lh+40;
  if(SB.promise){c.fillStyle='#fff3c4';c.beginPath();if(c.roundRect)c.roundRect(150,y,W-300,150,30);else c.rect(150,y,W-300,150);c.fill();
    c.fillStyle='#a06b00';c.font='800 38px '+F;c.fillText('🎁 '+t('{0}의 약속',SB.parent),W/2,y+58);c.fillStyle='#2e3a2a';c.font='900 46px '+F;c.fillText(SB.promise,W/2,y+118);y+=190}
  c.font='700 40px '+F;c.fillStyle='#2e3a2a';c.fillText(today().replace(/-/g,'. ')+'.',W/2,1215);
  c.font='800 46px '+F;c.fillText(t('{0} 드림',SB.parent),W/2,1290,W-640);
  c.save();c.translate(W-215,1225);c.rotate(-.2);c.strokeStyle='#e8364b';c.lineWidth=10;c.beginPath();c.arc(0,0,95,0,7);c.stroke();c.fillStyle='#e8364b';var fs=LANG==='ko'?40:34;c.font='900 '+fs+'px '+F;var mw=Math.max(c.measureText(t('참 잘')).width,c.measureText(t('했어요')).width);if(mw>140){fs=Math.floor(fs*140/mw);c.font='900 '+fs+'px '+F}c.fillText(t('참 잘'),0,-8);c.fillText(t('했어요'),0,42);c.restore();
  try{c.drawImage(PIM.kd_f,100,1150,Math.round(PIM.kd_f.width*200/PIM.kd_f.height),200)}catch(e){}
  var url=cv.toDataURL('image/png');window._cert={url:url,cv:cv};
  sheet('<h2>🏆 '+t('상장이 나왔어요!')+'</h2><p class="mut" style="margin:0 0 10px">'+t('사진첩에 저장하거나 인쇄해서 붙여 주세요')+'</p><div class="cert"><img src="'+url+'" alt=""></div>'+
   '<div class="row"><button class="btn p" onclick="saveImg(_cert.cv,\'certificate\')">📥 '+t('사진첩에 저장')+'</button><button class="btn s" onclick="printImg(_cert.url)">🖨️ '+t('인쇄')+'</button></div>'+
   '<p class="mut" style="text-align:center;margin-top:10px">'+t('저장이 안 되면 위 상장을 <b>길게 눌러 저장</b>해 주세요')+'</p><button class="btn w" onclick="closeSheet()">'+t('닫기')+'</button>');confetti(30)}
function saveImg(cv,name){cv.toBlob(function(b){var f;try{f=new File([b],'allbareuge-'+name+'.png',{type:'image/png'})}catch(e){}
  if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'All 바르게'}).catch(function(){})}
  else{var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='allbareuge-'+name+'.png';document.body.appendChild(a);a.click();a.remove();toast(t('저장했어요! 사진첩·다운로드를 확인해 주세요'))}},'image/png')}
function printImg(url){$('#printArea').innerHTML='<img src="'+url+'">';setTimeout(function(){try{window.print()}catch(e){toast(t('이 브라우저는 인쇄가 안 돼요. 저장한 뒤 인쇄해 주세요'))}},200)}
function sheet(h){closeSheet();var m=document.createElement('div');m.className='mask';m.id='mask';m.innerHTML='<div class="sheet">'+h+'</div>';m.onclick=function(e){if(e.target===m)closeSheet()};document.body.appendChild(m)}
function closeSheet(){var m=$('#mask');if(m)m.remove()}

/* ---------- 내 이름 동화 ---------- */
var STORY=ls('story')||null;if(STORY&&STORY.lang&&STORY.lang!==LANG)STORY=null;
var _th=0,_pl=0;
function storyView(){if(SUB.read&&STORY)return storyRead();var s=STORY&&STORY.inp||{friend:'',theme:0,place:0};_th=s.theme||0;_pl=s.place||0;
  var FR=C('FRIENDS'),TH=C('THEMES'),PL=C('PLACES');
  return hdr('📖 '+t('내 이름 동화'))+'<div class="box"><h2>'+t('{0}[이/가] 주인공인 동화를 만들어요',esc(KID.name))+'</h2>'+
  '<label class="f">🧸 '+t('함께할 친구 (동물·식물·인형 무엇이든)')+'</label><input id="sf" class="inp" maxlength="16" placeholder="'+t('예) 토끼, 해바라기, 곰인형')+'" value="'+esc(s.friend)+'">'+
  '<div class="chips" style="margin-top:8px">'+FR.slice(0,12).map(function(f){return '<button class="chip p" onclick="$(\'#sf\').value=this.dataset.v" data-v="'+esc(f[0])+'">'+f[1]+' '+esc(f[0])+'</button>'}).join('')+'</div>'+
  '<label class="f">💡 '+t('어떤 이야기?')+'</label><div class="chips" id="sth">'+TH.map(function(x,i){return '<button class="chip p'+(i===_th?' on':'')+'" onclick="pickT(this,'+i+')">'+x.e+' '+esc(x.k)+'</button>'}).join('')+'</div>'+
  '<label class="f">🗺️ '+t('어디에서?')+'</label><div class="chips" id="spl">'+PL.map(function(p,i){return '<button class="chip p'+(i===_pl?' on':'')+'" onclick="pickP(this,'+i+')">'+Array.from(p[2])[0]+' '+esc(p[0])+'</button>'}).join('')+'</div>'+
  '<button class="btn p" onclick="makeStory()">✨ '+t('동화 만들기')+'</button>'+(STORY?'<button class="btn w" onclick="go(\'story\',{read:1})">📖 '+t('지난 동화 다시 읽기')+'</button>':'')+'</div>'}
function pickT(b,k){_th=k;document.querySelectorAll('#sth .chip').forEach(function(x){x.classList.remove('on')});b.classList.add('on')}
function pickP(b,i){_pl=i;document.querySelectorAll('#spl .chip').forEach(function(x){x.classList.remove('on')});b.classList.add('on')}
function makeStory(){var FR=C('FRIENDS'),TH=C('THEMES'),PL=C('PLACES');var fr=$('#sf').value.trim().replace(/[<>{}\[\]]/g,'')||FR[0][0];
  var o={N:nm(KID.name),V:voc(KID.name),T:fr,F:rnd(C('FNAMES')),P:PL[_pl][0]};
  var paras=[fill(rnd(C('ST_OPEN')),o),fill(rnd(C('ST_MEET')),o)].concat(C('ST_THEME')[TH[_th].k].map(function(x){return fill(x,o)}),[fill(rnd(C('ST_END')),o)]);
  var title=fill(C('ST_TITLE')[_th],{N:KID.name,V:'',T:fr,F:o.F,P:''});
  STORY={lang:LANG,title:title,paras:paras,em:friendEmoji(fr),place:_pl,inp:{friend:fr,theme:_th,place:_pl}};ls('story',STORY);go('story',{read:1,pg:0})}
function friendEmoji(f){f=String(f||'').toLowerCase();var L=[C('FRIENDS'),FRIENDS];for(var j=0;j<2;j++)for(var i=0;i<L[j].length;i++)if(f.indexOf(String(L[j][i][0]).toLowerCase())>=0)return L[j][i][1];
  if(/인형|doll|teddy/.test(f))return '🧸';if(/꽃|flower/.test(f))return '🌷';if(/새|bird/.test(f))return '🐦';if(/물고기|fish/.test(f))return '🐠';if(/개구리|frog/.test(f))return '🐸';if(/사자|lion/.test(f))return '🦁';if(/거북|turtle/.test(f))return '🐢';if(/기차|train/.test(f))return '🚂';return '✨'}
function storyRead(){var s=STORY,pg=SUB.pg||0,per=2,tot=Math.ceil(s.paras.length/per),P=C('PLACES')[s.place];
  var ps=s.paras.slice(pg*per,pg*per+per);
  return hdr('📖 '+esc(s.title))+'<div class="scene" style="background:'+P[1]+'"><div class="deco">'+P[2]+'</div><div class="who">'+avHTML()+'</div><div class="who">'+s.em+'</div></div>'+
  '<div class="box story">'+ps.map(function(p){return '<p>'+esc(p)+'</p>'}).join('')+'</div>'+
  '<div class="pager"><button class="btn w" style="margin:0" '+(pg?'':'disabled')+' onclick="go(\'story\',{read:1,pg:'+(pg-1)+'})">◀ '+t('앞')+'</button><span>'+(pg+1)+' / '+tot+'</span>'+
  (pg<tot-1?'<button class="btn p" style="margin:0" onclick="go(\'story\',{read:1,pg:'+(pg+1)+'})">'+t('다음')+' ▶</button>':'<button class="btn" style="margin:0" onclick="confetti(20);go(\'story\')">'+t('끝!')+' 🌟</button>')+'</div>'+
  '<button class="btn s" onclick="readAloud()">🔊 '+t('읽어 주기')+'</button><p class="mut" style="text-align:center">'+t('소리가 안 나오면 부모님이 다정하게 읽어 주세요 😊')+'</p>'}
var VOICE={ko:'ko-KR',en:'en-US',ja:'ja-JP',zh:'zh-CN',vi:'vi-VN',id:'id-ID',hi:'hi-IN',es:'es-ES',fr:'fr-FR',de:'de-DE',pt:'pt-BR',it:'it-IT',tr:'tr-TR',ru:'ru-RU',th:'th-TH',ar:'ar-SA',el:'el-GR'};
function readAloud(){try{var ss=window.speechSynthesis;if(!ss){toast(t('이 브라우저는 읽어 주기가 안 돼요'));return}ss.cancel();var per=2,pg=SUB.pg||0;
  var u=new SpeechSynthesisUtterance(STORY.paras.slice(pg*per,pg*per+per).join(' '));u.lang=VOICE[LANG]||'en-US';u.rate=.92;u.pitch=1.15;ss.speak(u)}catch(e){toast(t('이 브라우저는 읽어 주기가 안 돼요'))}}

/* ---------- 꼰둥이 웹툰 ---------- */
function todayToonIdx(){var d=Math.floor((Date.now()+9*3600e3)/864e5);return d%TOONS.length}
function toonView(){var T=C('TOONS'),i=SUB.i||0,tn=T[i],ti=todayToonIdx(),who=[KN(),SN(),''];
  var pans=tn.c.map(function(p,k){var dark=/^#[3-6]/.test(p[0]);var bb=p[3].map(function(b){return '<div class="bb">'+(b[0]<2?'<span style="color:'+(b[0]?'#e0567f':'#d99a00')+'">'+who[b[0]]+'</span> ':'')+esc(b[1])+'</div>'}).join('');
    return '<div class="pan'+(dark?' dark':'')+'" style="background:'+p[0]+'"><span class="no">'+(k+1)+'</span><div class="bbs">'+bb+'</div><div class="who2">'+p[1].map(function(c){return chr(c)}).join('')+'</div><span class="pr">'+p[2]+'</span></div>'}).join('');
  return hdr('💬 '+t('꼰둥이 웹툰'))+'<div class="box" style="padding:12px"><div style="display:flex;align-items:center;margin-bottom:8px"><h2 style="margin:0">#'+(i+1)+' '+esc(tn.t)+'</h2>'+(i===ti?'<span class="chip s on" style="margin-left:auto;padding:4px 10px;font-size:12px">'+t('오늘')+'</span>':'')+'</div>'+
  '<div class="toon">'+pans+'</div><div class="promise" style="background:var(--s2)">💡 <b style="color:#1d78b0">'+t('오늘의 바른 습관')+'</b><br>'+esc(tn.l)+'</div></div>'+
  '<div class="box"><h2>📚 '+t('다른 이야기')+'</h2><div class="tlist">'+T.map(function(x,k){return '<button class="'+(k===i?'on':'')+'" onclick="go(\'toon\',{i:'+k+'})">#'+(k+1)+' '+esc(x.t)+(k===ti?' 🆕':'')+'</button>'}).join('')+'</div></div>'}

/* ---------- 그림 퀴즈 ---------- */
var DR={topic:null,min:10,end:0,start:0},TK=null;
function topic(){var D=C('DRAW');return D[DR.topic]||D[0]}
function drawView(){var st=SUB.step||'pick';
  if(st==='pick'){var tp=DR.topic!=null?topic():null;
    return hdr('🎨 '+t('그림 퀴즈'))+'<div class="topic">'+(tp?'<span class="cat">'+esc(tp[0])+'</span><div class="em">'+tp[1]+'</div><h2>'+esc(tp[2])+'</h2><p class="mut">'+t('스케치북에 그려 보세요!')+'</p>':'<div class="em">🎁</div><h2>'+t('오늘의 그림 주제는?')+'</h2><p class="mut">'+t('버튼을 눌러 뽑아요')+'</p>')+'</div>'+
    '<button class="btn y" onclick="pickTopic()">🎲 '+(tp?t('다시 뽑기'):t('주제 뽑기'))+'</button>'+
    (tp?'<div class="box" style="margin-top:14px"><h2>⏱️ '+t('몇 분 동안 그릴까요?')+'</h2><div class="chips" id="tsel">'+[[3,t('{0}분',3)],[5,t('{0}분',5)],[10,t('{0}분',10)],[0,t('시간 없이')]].map(function(m){return '<button class="chip y'+(m[0]===DR.min?' on':'')+'" onclick="DR.min='+m[0]+';go(\'draw\')">'+m[1]+'</button>'}).join('')+'</div>'+
    '<button class="btn" onclick="startDraw()">✏️ '+t('그리기 시작!')+'</button></div>':'')}
  var tp=topic();
  if(st==='time'){return hdr('🎨 '+t('그리는 중'))+'<div class="topic" style="padding:14px"><div class="em" style="font-size:48px">'+tp[1]+'</div><h2 style="font-size:20px">'+esc(tp[2])+'</h2></div>'+
    '<div class="timer"><svg width="220" height="220"><circle cx="110" cy="110" r="96" stroke="#fff3c4" stroke-width="18" fill="none"/><circle id="tc" cx="110" cy="110" r="96" stroke="#ffcf33" stroke-width="18" fill="none" stroke-linecap="round" stroke-dasharray="603" stroke-dashoffset="0"/></svg><div class="t" id="tt">'+(DR.min?DR.min+':00':'✏️')+'</div></div>'+
    '<button class="btn p" onclick="doneDraw()">✅ '+t('다 그렸어요!')+'</button><button class="btn w" onclick="stopTick();go(\'draw\')">'+t('그만하기')+'</button>'}
  if(st==='shot'){return hdr('📸 '+t('그림 찍기'))+'<div class="box" style="text-align:center"><div style="font-size:60px">📸</div><h2>'+t('그림을 찍어 주세요')+'</h2><p class="mut">'+t('스케치북이 화면에 꽉 차게, 밝은 곳에서 찍으면 좋아요')+'</p>'+
    '<input id="ph" type="file" accept="image/*" capture="environment" hidden onchange="gotPhoto(this)"><button class="btn p" onclick="$(\'#ph\').click()">📷 '+t('사진 찍기')+'</button>'+
    '<p class="mut">🔒 '+t('사진은 이 폰 안에서만 확인하고 어디에도 보내지 않아요')+'</p></div>'}
  if(st==='scan'){return hdr('🔍 '+t('그림 보는 중'))+'<div class="shot"><img src="'+DR.img+'"><div class="line"></div></div><p style="text-align:center;font-weight:800;font-size:18px">'+t('{0}의 그림을 살펴보고 있어요…',esc(KID.name))+'</p>'}
  if(st==='res'){var r=DR.res;return hdr('🏅 '+t('그림 점수'))+greet(t('에헴~ 점수를 발표하겠구먼!'),r.score>=90?t('옳지옳지~ 라떼보다 잘 그렸네!'):t('옳지~ 다음엔 더 멋질 거야!'))+'<div class="box score"><div style="font-size:15px;font-weight:800;color:var(--mut)">'+tp[1]+' '+esc(tp[2])+'</div><div class="n">'+r.score+'<span style="font-size:26px">'+t('점')+'</span></div><div class="stars">'+'⭐'.repeat(r.stars)+'</div>'+
    '<div class="badges">'+r.badges.map(function(b){return '<span>'+b+'</span>'}).join('')+'</div><p style="font-size:16px;line-height:1.7;margin:14px 0 0;word-break:keep-all">'+esc(r.msg)+'</p></div>'+
    '<div class="shot" style="background:#fff"><img src="'+DR.img+'"></div>'+
    '<button class="btn p" onclick="drawCard()">🖼️ '+t('그림 카드 저장하기')+'</button><button class="btn y" onclick="DR.topic=null;go(\'draw\')">🎲 '+t('새 주제 뽑기')+'</button>'+
    '<p class="mut" style="text-align:center">'+t('점수는 재미로 보는 거예요. 모든 그림은 멋져요!')+' 💛</p>'}
}
function pickTopic(){var n=C('DRAW').length,k;do{k=Math.floor(Math.random()*n)}while(k===DR.topic&&n>1);DR.topic=k;buzz();go('draw')}
function startDraw(){DR.start=Date.now();DR.end=DR.min?Date.now()+DR.min*60e3:0;go('draw',{step:'time'})}
function tick(){stopTick();var f=function(){var tt=$('#tt'),tc=$('#tc');if(!tt){stopTick();return}
  if(!DR.end){var s=Math.floor((Date.now()-DR.start)/1000);tt.textContent=Math.floor(s/60)+':'+('0'+s%60).slice(-2);return}
  var left=Math.max(0,DR.end-Date.now()),s=Math.ceil(left/1000);tt.textContent=Math.floor(s/60)+':'+('0'+s%60).slice(-2);tc.setAttribute('stroke-dashoffset',String(603*(1-left/(DR.min*60e3))));
  if(s<=10)tt.style.color='#e8364b';if(left<=0){stopTick();buzz();tt.textContent=t('땡!');toast('⏰ '+t('시간 끝! 다 그렸나요?'))}};f();TK=setInterval(f,250)}
function stopTick(){if(TK){clearInterval(TK);TK=null}}
function doneDraw(){stopTick();DR.used=(Date.now()-DR.start)/1000;go('draw',{step:'shot'})}
function gotPhoto(inp){var f=inp.files&&inp.files[0];if(!f)return;var rd=new FileReader();rd.onload=function(){var im=new Image();im.onload=function(){
  var mx=900,w=im.width,h=im.height,k=Math.min(1,mx/Math.max(w,h));var cv=document.createElement('canvas');cv.width=Math.round(w*k);cv.height=Math.round(h*k);cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);
  DR.img=cv.toDataURL('image/jpeg',.85);DR.res=scoreDraw(cv);go('draw',{step:'scan'});setTimeout(function(){confetti(24);go('draw',{step:'res'})},2600)};im.src=rd.result};rd.readAsDataURL(f)}
/* 재미 점수: 칠한 넓이 · 색깔 가짓수 · 선의 꼼꼼함 · 시간 */
function scoreDraw(cv){var w=160,h=Math.round(cv.height*160/cv.width),c=document.createElement('canvas');c.width=w;c.height=h;var x=c.getContext('2d');x.drawImage(cv,0,0,w,h);
  var d=x.getImageData(0,0,w,h).data,ink=0,hues=new Array(12).fill(0),edge=0,tot=w*h,L=new Float32Array(tot);
  for(var i=0,p=0;i<d.length;i+=4,p++){var r=d[i]/255,g=d[i+1]/255,b=d[i+2]/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,sat=mx===mn?0:(mx-mn)/(1-Math.abs(2*l-1));L[p]=l;
    if(l<.62||sat>.32){ink++;if(sat>.3&&l>.12&&l<.9){var hh;if(mx===r)hh=((g-b)/(mx-mn))%6;else if(mx===g)hh=(b-r)/(mx-mn)+2;else hh=(r-g)/(mx-mn)+4;hh=(hh*60+360)%360;hues[Math.floor(hh/30)]++}}}
  for(var yy=1;yy<h;yy++)for(var xx=1;xx<w;xx++){var q=yy*w+xx;if(Math.abs(L[q]-L[q-1])+Math.abs(L[q]-L[q-w])>.18)edge++}
  var cov=ink/tot,nc=hues.filter(function(v){return v>tot*.004}).length,det=edge/tot;
  var sCov=Math.min(14,Math.round(cov*40)),sCol=Math.min(14,nc*2+(nc>0?2:0)),sDet=Math.min(8,Math.round(det*60)),sTime=DR.min&&DR.used<=DR.min*60+5?4:2;
  var score=Math.max(60,Math.min(100,60+sCov+sCol+sDet+sTime)),stars=score>=95?5:score>=88?4:score>=78?3:2;
  var badges=[];if(nc>=5)badges.push('🌈 '+t('색깔 마법사'));else if(nc>=3)badges.push('🎨 '+t('색칠 솜씨왕'));if(cov>.28)badges.push('🖍️ '+t('꽉 찬 그림'));if(det>.09)badges.push('🔍 '+t('꼼꼼 화가'));if(DR.min&&DR.used<=DR.min*60)badges.push('⏰ '+t('시간 지킴이'));if(!badges.length)badges.push('✏️ '+t('멋진 시작'));
  var V=voc(KID.name),msg=nc>=4?t('{0}, 알록달록 색깔이 정말 예뻐요! 보는 사람 마음까지 환해져요.',V):cov>.28?t('{0}, 종이를 가득 채운 그림이 정말 힘차요! 상상력이 대단해요.',V):det>.09?t('{0}, 선 하나하나 꼼꼼하게 그렸네요! 관찰력이 최고예요.',V):t('{0}, 멋지게 그렸어요! 다음엔 좋아하는 색을 더 칠해 볼까요?',V);
  return {score:score,stars:stars,badges:badges,msg:msg}}
function drawCard(){var tp=topic(),im=new Image();im.onload=function(){var W=1080,ph=Math.round(im.height*(W-120)/im.width),H=Math.min(1900,ph+520),cv=document.createElement('canvas');cv.width=W;cv.height=H;var c=cv.getContext('2d'),F='"Apple SD Gothic Neo","Noto Sans KR",sans-serif';
  c.fillStyle='#fff6d4';c.fillRect(0,0,W,H);c.fillStyle='#fff';c.fillRect(40,40,W-80,H-80);c.strokeStyle='#ffcf33';c.lineWidth=14;c.strokeRect(40,40,W-80,H-80);
  c.textAlign='center';c.fillStyle='#2e3a2a';c.font='900 56px '+F;c.fillText(tp[1]+' '+tp[2],W/2,140);
  var mh=H-520;var dw=W-120,dh=Math.min(ph,mh);c.drawImage(im,60,180,dw,dh);
  c.fillStyle='#ff7fa8';c.font='900 110px '+F;c.fillText(DR.res.score+t('점'),W/2,180+dh+130);
  c.font='54px '+F;c.fillText('⭐'.repeat(DR.res.stars),W/2,180+dh+210);
  c.fillStyle='#7d8a76';c.font='800 40px '+F;c.fillText(KID.name+' · '+today().replace(/-/g,'.')+' · All '+t('바르게'),W/2,180+dh+280);
  saveImg(cv,'drawing')};im.src=DR.img}

/* ---------- 아름다운 어린이 되기 (예절 퀴즈) ---------- */
var MQ=null;
function mannerStart(){var M=C('MANNERS'),idx=M.map(function(_,i){return i}).sort(function(){return Math.random()-.5}).slice(0,5);
  var W=C('W3');MQ={q:idx.map(function(i){var m=M[i],o=[[m[3],1],[m[4],0]];if(W&&W[i])o.push([[W[i],W3E[i]],0]);return {m:m,opts:o.sort(function(){return Math.random()-.5})}}),i:0,ok:0,ans:null};go('manner')}
function mannerView(){if(!MQ)return hdr('🐣 '+t('아름다운 어린이 되기'))+greet(t('에헴~ 예절 공부 시간이구먼!'),t('5문제 맞히면 꼰둥이 배지를 줄게~'))+
  '<div class="box"><h2>🏅 '+t('모은 꼰둥이 배지: {0}개',ls('mq')||0)+'</h2><p class="mut" style="margin:0">'+t('식당·화장실·버스·엘리베이터·도서관… 여러 곳의 예절을 배워요')+'</p></div><button class="btn p" onclick="mannerStart()">'+t('시작하기')+' ▶</button>';
  var Q=MQ.q[MQ.i];if(!Q)return mannerEnd();var m=Q.m;
  var h=hdr('🐣 '+(MQ.i+1)+' / '+MQ.q.length)+'<div class="mscene"><span class="pl">'+esc(m[1])+'</span><div class="pe">'+m[0]+'</div><h2>'+esc(m[2])+'</h2></div>';
  if(MQ.ans===null){h+=Q.opts.map(function(o,k){return '<button class="opt" onclick="mannerPick('+k+')"><span>'+o[0][1]+'</span>'+esc(o[0][0])+'</button>'}).join('')}
  else{var right=Q.opts[MQ.ans][1]===1;h+='<div class="react '+(right?'ok':'no')+'"><img src="'+(right?IMG.ks_f:IMG.kd_f)+'" alt=""><div><b>'+(right?t('옳지옳지~! 정답이야')+' ⭕':t('에헴~ 그건 아니지!')+' ❌')+'</b><p>'+t('정답')+': '+esc(m[3][0])+' '+m[3][1]+'</p><p>'+esc(m[5])+'</p></div></div>'+
    '<button class="btn" onclick="mannerNext()">'+(MQ.i<MQ.q.length-1?t('다음 문제')+' ▶':t('결과 보기')+' 🏅')+'</button>'}
  return h}
function mannerPick(k){if(MQ.ans!==null)return;MQ.ans=k;if(MQ.q[MQ.i].opts[k][1]===1){MQ.ok++;buzz()}render()}
function mannerNext(){MQ.i++;MQ.ans=null;render();window.scrollTo(0,0)}
function mannerEnd(){var ok=MQ.ok,n=MQ.q.length,full=ok===n;if(!MQ.saved){MQ.saved=1;if(ok>=4){ls('mq',(ls('mq')||0)+1);setTimeout(function(){confetti(36)},200)}}
  var g=full?greet(t('에헴! 다 맞혔구먼, 라떼보다 낫네!'),t('옳지옳지~ 꼰둥이 배지 받으렴!')):ok>=4?greet(t('에헴, 아깝구먼~'),t('옳지옳지~ 배지 하나 줄게!')):greet(t('에헴~ 괜찮아, 다시 해 보자꾸나!'),t('4개 넘게 맞히면 배지를 줄게~'));
  return hdr('🏅 '+t('예절 퀴즈 결과'))+'<div class="box score"><div class="n">'+ok+'<span style="font-size:26px"> / '+n+'</span></div><div class="stars">'+'⭐'.repeat(ok)+'</div>'+g.replace('class="greet"','class="greet" style="margin-top:12px"')+
  '<p class="mut">'+t('모은 꼰둥이 배지: {0}개',ls('mq')||0)+'</p></div><button class="btn p" onclick="mannerStart()">🔄 '+t('다시 하기')+'</button><button class="btn w" onclick="MQ=null;go(\'home\')">'+t('처음으로')+'</button>'}


