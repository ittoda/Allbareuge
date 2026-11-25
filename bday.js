/* ---------- 생일 축하: 생일날 첫 방문에 노래 + 햇살 선물 ---------- */
var BDAY_GIFT=30,_bdShown=false;
function bdMD(){var b=KID&&KID.bd;return b&&/^\d{4}-\d\d-\d\d$/.test(b)?b.slice(5):null}
function isBday(){var m=bdMD();return !!m&&today().slice(5)===m}
function bdAge(){var b=KID&&KID.bd;if(!b)return 0;var a=+today().slice(0,4)-(+b.slice(0,4));return a>0&&a<20?a:0}
function bdGot(){return ls('bday')===today().slice(0,4)}
function bdCheck(){if(VIEW==='home'&&isBday()&&!bdGot()&&!_bdShown){_bdShown=true;setTimeout(bdOpen,400)}}
function bdLines(){var n=KID.name;return [t('생일 축하합니다'),t('생일 축하합니다'),t('사랑하는 {0}의',n),t('생일 축하합니다')]}
function bdOpen(){var a=bdAge(),got=bdGot();
  sheet('<div class="bd"><div class="bdc">🎂</div><h2>'+(a?t('오늘은 {0}의 {1}번째 생일!',esc(KID.name),a):t('오늘은 {0}의 생일!',esc(KID.name)))+'</h2>'+
   '<div class="bdk"><img src="'+IMG.kd_f+'" alt=""><div class="bdl" id="bdl">'+bdLines().map(function(l,i){return '<p id="bl'+i+'">'+esc(l)+'</p>'}).join('')+'</div><img src="'+IMG.ks_f+'" alt=""></div>'+
   '<button class="btn p" id="bdPlay" onclick="bdSing()">🎵 '+t('생일 노래 듣기')+'</button><p class="mut" style="font-size:11.5px;margin:-4px 0 8px">🔈 '+t('소리가 안 나면 폰 소리(볼륨)를 키워 주세요')+'</p>'+
   (got?'<p class="mut" style="text-align:center">🎁 '+t('생일 선물은 이미 받았어요')+'</p>':'<div class="bdg" id="bdGift"><div style="font-size:44px">🎁</div><b>'+t('생일 선물로 햇살 ☀️ {0}개를 줄게!',BDAY_GIFT)+'</b><button class="btn y" onclick="bdGive()">'+t('선물 받기!')+'</button></div>')+
   '<button class="btn w" onclick="bdStop();closeSheet()">'+t('닫기')+'</button></div>');confetti(40)}
function bdGive(){if(bdGot())return;ls('bday',today().slice(0,4));if(window.GR){GR.tok+=BDAY_GIFT;grSave()}else ls('gtok',(ls('gtok')||0)+BDAY_GIFT);
  buzz();confetti(60);praise(t('에헴~ 생일 축하하구먼! 한 살 더 멋져졌네!'),'K');var g=$('#bdGift');if(g)g.innerHTML='<div style="font-size:44px">☀️</div><b>'+t('햇살 {0}개를 받았어요! 나의 친구에게 써 보세요',BDAY_GIFT)+'</b>'}
/* 생일 축하 노래(작곡 1893, 퍼블릭 도메인) — WebAudio로 직접 연주 */
var _bdUrl=null,_bdAud=null,_bdTm=[];
function bdStop(){if(_bdAud){try{_bdAud.pause()}catch(e){}}_bdTm.forEach(clearTimeout);_bdTm=[]}
/* 노래를 직접 합성해 WAV로 만들어 <audio>로 재생 — 아이폰 무음 모드에서도 소리가 나요 */
var BD_BT=0.55,BD_MEL=[[67,.75,0],[67,.25,0],[69,1,0],[67,1,0],[72,1,0],[71,2,0],[67,.75,1],[67,.25,1],[69,1,1],[67,1,1],[74,1,1],[72,2,1],[67,.75,2],[67,.25,2],[79,1,2],[76,1,2],[72,1,2],[71,1,2],[69,2,2],[77,.75,3],[77,.25,3],[76,1,3],[72,1,3],[74,1,3],[72,3,3]];
function bdWav(){if(_bdUrl)return _bdUrl;var SR=22050,bt=BD_BT,lead=0.15,tot=0;BD_MEL.forEach(function(n){tot+=n[1]});var len=Math.ceil((lead+tot*bt+1.5)*SR),buf=new Float32Array(len),hz=function(m){return 440*Math.pow(2,(m-69)/12)};
  var add=function(f,s,d,v,h){var a=Math.floor(s*SR),n=Math.floor(d*SR),w=2*Math.PI*f/SR;for(var k=0;k<n&&a+k<len;k++){var e=Math.min(1,k/(0.02*SR))*Math.exp(-3*k/n);var x=Math.sin(w*k);if(h)x+=0.3*Math.sin(2*w*k)+0.12*Math.sin(3*w*k);buf[a+k]+=v*e*x}};
  var tt=lead;BD_MEL.forEach(function(n){add(hz(n[0]),tt,n[1]*bt*1.15,.32,1);add(hz(n[0]+12),tt,n[1]*bt*.8,.06,0);tt+=n[1]*bt});
  var Cc=[48,55,64],Gc=[43,50,59],Fc=[41,53,57],ch=[Cc,Gc,Gc,Cc,Cc,Fc,Gc,Cc],b=lead+bt;
  for(var k=0;k<8;k++){var c=ch[k];add(hz(c[0]),b,bt*.95,.22,1);[1,2].forEach(function(q){add(hz(c[1]),b+q*bt,bt*.5,.07,1);add(hz(c[2]),b+q*bt,bt*.5,.07,1)});b+=3*bt}
  var pk=0;for(var i=0;i<len;i++)pk=Math.max(pk,Math.abs(buf[i]));var g=pk?0.85/pk:1;
  var ab=new ArrayBuffer(44+len*2),dv=new DataView(ab),ws=function(o,s){for(var i=0;i<s.length;i++)dv.setUint8(o+i,s.charCodeAt(i))};
  ws(0,'RIFF');dv.setUint32(4,36+len*2,true);ws(8,'WAVE');ws(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,1,true);dv.setUint32(24,SR,true);dv.setUint32(28,SR*2,true);dv.setUint16(32,2,true);dv.setUint16(34,16,true);ws(36,'data');dv.setUint32(40,len*2,true);
  for(var i2=0;i2<len;i2++)dv.setInt16(44+i2*2,Math.max(-1,Math.min(1,buf[i2]*g))*32767,true);
  _bdUrl=URL.createObjectURL(new Blob([ab],{type:'audio/wav'}));return _bdUrl}
function bdSing(){bdStop();try{if(!_bdAud){_bdAud=new Audio();_bdAud.preload='auto'}_bdAud.src=bdWav();_bdAud.currentTime=0;_bdAud.volume=1;
    var p=_bdAud.play();if(p&&p.catch)p.catch(function(){toast('🔈 '+t('이 폰에서는 소리를 낼 수 없어요'))})}catch(e){toast('🔈 '+t('이 폰에서는 소리를 낼 수 없어요'));return}
  var on=function(i){document.querySelectorAll('.bdl p').forEach(function(p,j){p.classList.toggle('on',j===i)})};
  var tt=0.15,seen={};BD_MEL.forEach(function(n){if(!seen[n[2]]){seen[n[2]]=1;(function(i,s){_bdTm.push(setTimeout(function(){on(i)},s*1000))})(n[2],tt)}tt+=n[1]*BD_BT});
  _bdTm.push(setTimeout(function(){on(-1);confetti(30)},tt*1000+300));
  var b=$('#bdPlay');if(b)b.innerHTML='🔁 '+t('한 번 더 부르기')}
function bdBanner(){return isBday()?'<button class="bdban" onclick="bdOpen()">🎂 <b>'+t('오늘은 {0}의 생일이에요!',esc(KID.name))+'</b><span>🎵 '+t('노래 듣기')+'</span></button>':''}
