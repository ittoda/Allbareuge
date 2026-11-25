/* ---------- 생일 축하: 생일날 첫 방문에 노래 + 햇살 선물 ---------- */
var BDAY_GIFT=30,_bdShown=false,_bdAc=null;
function bdMD(){var b=KID&&KID.bd;return b&&/^\d{4}-\d\d-\d\d$/.test(b)?b.slice(5):null}
function isBday(){var m=bdMD();return !!m&&today().slice(5)===m}
function bdAge(){var b=KID&&KID.bd;if(!b)return 0;var a=+today().slice(0,4)-(+b.slice(0,4));return a>0&&a<20?a:0}
function bdGot(){return ls('bday')===today().slice(0,4)}
function bdCheck(){if(VIEW==='home'&&isBday()&&!bdGot()&&!_bdShown){_bdShown=true;setTimeout(bdOpen,400)}}
function bdLines(){var n=KID.name;return [t('생일 축하합니다'),t('생일 축하합니다'),t('사랑하는 {0}의',n),t('생일 축하합니다')]}
function bdOpen(){var a=bdAge(),got=bdGot();
  sheet('<div class="bd"><div class="bdc">🎂</div><h2>'+(a?t('오늘은 {0}의 {1}번째 생일!',esc(KID.name),a):t('오늘은 {0}의 생일!',esc(KID.name)))+'</h2>'+
   '<div class="bdk"><img src="'+IMG.kd_f+'" alt=""><div class="bdl" id="bdl">'+bdLines().map(function(l,i){return '<p id="bl'+i+'">'+esc(l)+'</p>'}).join('')+'</div><img src="'+IMG.ks_f+'" alt=""></div>'+
   '<button class="btn p" id="bdPlay" onclick="bdSing()">🎵 '+t('생일 노래 듣기')+'</button>'+
   (got?'<p class="mut" style="text-align:center">🎁 '+t('생일 선물은 이미 받았어요')+'</p>':'<div class="bdg" id="bdGift"><div style="font-size:44px">🎁</div><b>'+t('생일 선물로 햇살 ☀️ {0}개를 줄게!',BDAY_GIFT)+'</b><button class="btn y" onclick="bdGive()">'+t('선물 받기!')+'</button></div>')+
   '<button class="btn w" onclick="bdStop();closeSheet()">'+t('닫기')+'</button></div>');confetti(40)}
function bdGive(){if(bdGot())return;ls('bday',today().slice(0,4));if(window.GR){GR.tok+=BDAY_GIFT;grSave()}else ls('gtok',(ls('gtok')||0)+BDAY_GIFT);
  buzz();confetti(60);praise(t('에헴~ 생일 축하하구먼! 한 살 더 멋져졌네!'),'K');var g=$('#bdGift');if(g)g.innerHTML='<div style="font-size:44px">☀️</div><b>'+t('햇살 {0}개를 받았어요! 나의 친구에게 써 보세요',BDAY_GIFT)+'</b>'}
/* 생일 축하 노래(작곡 1893, 퍼블릭 도메인) — WebAudio로 직접 연주 */
function bdStop(){if(_bdAc){try{_bdAc.close()}catch(e){}_bdAc=null}}
function bdSing(){bdStop();var AC=window.AudioContext||window.webkitAudioContext;if(!AC){toast(t('이 폰에서는 소리를 낼 수 없어요'));return}
  var ac=_bdAc=new AC(),bt=0.55,t0=ac.currentTime+0.15,hz=function(m){return 440*Math.pow(2,(m-69)/12)};
  var G=67,A=69,B=71,C=72,D=74,E=76,F=77,G2=79;
  var mel=[[G,.75,0],[G,.25,0],[A,1,0],[G,1,0],[C,1,0],[B,2,0],[G,.75,1],[G,.25,1],[A,1,1],[G,1,1],[D,1,1],[C,2,1],[G,.75,2],[G,.25,2],[G2,1,2],[E,1,2],[C,1,2],[B,1,2],[A,2,2],[F,.75,3],[F,.25,3],[E,1,3],[C,1,3],[D,1,3],[C,3,3]];
  var tone=function(f,s,d,v,type){var o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(v,s+0.02);g.gain.exponentialRampToValueAtTime(0.001,s+d);o.connect(g);g.connect(ac.destination);o.start(s);o.stop(s+d+0.05)};
  var tt=t0,lines=[];
  mel.forEach(function(n){tone(hz(n[0]),tt,n[1]*bt*1.1,.22,'triangle');tone(hz(n[0]+12),tt,n[1]*bt*.8,.05,'sine');if(lines[n[2]]==null)lines[n[2]]=tt-t0;tt+=n[1]*bt});
  /* 반주: 쿵-짝-짝 */
  var Cc=[48,55,64],Gc=[43,50,59],Fc=[41,53,57],ch=[Cc,Gc,Gc,Cc,Cc,Fc,Gc,Cc],beat=t0+bt;
  for(var k=0;k<8;k++){var c=ch[k];tone(hz(c[0]),beat,bt*.9,.16,'sine');tone(hz(c[1]),beat+bt,bt*.5,.05,'triangle');tone(hz(c[2]),beat+bt,bt*.5,.05,'triangle');tone(hz(c[1]),beat+2*bt,bt*.5,.05,'triangle');tone(hz(c[2]),beat+2*bt,bt*.5,.05,'triangle');beat+=3*bt}
  var on=function(i){document.querySelectorAll('.bdl p').forEach(function(p,j){p.classList.toggle('on',j===i)})};
  lines.forEach(function(s,i){setTimeout(function(){on(i)},s*1000+150)});setTimeout(function(){on(-1);confetti(30)},(tt-t0)*1000+300);
  var b=$('#bdPlay');if(b)b.innerHTML='🔁 '+t('한 번 더 부르기')}
function bdBanner(){return isBday()?'<button class="bdban" onclick="bdOpen()">🎂 <b>'+t('오늘은 {0}의 생일이에요!',esc(KID.name))+'</b><span>🎵 '+t('노래 듣기')+'</span></button>':''}
