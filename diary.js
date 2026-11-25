/* ---------- 나의 비밀 일기장 (이 폰에만 저장) ---------- */
var DWTH=[['☀️','맑음'],['⛅','구름 조금'],['☁️','흐림'],['🌧️','비'],['❄️','눈'],['🌬️','바람']];
var DY=null,REC=null,RECON=false;
function dyAll(){return ls('diary')||{}}
function dyLoad(d){var a=dyAll()[d];DY={d:d,w:a?a.w:'',t:a?a.t:'',x:a?a.x:''}}
function dyLocale(){return {ko:'ko-KR',en:'en-US',vi:'vi-VN',id:'id-ID',hi:'hi-IN',zh:'zh-CN',ja:'ja-JP'}[LANG]||'ko-KR'}
function dyDate(d){var p=d.split('-'),dt=new Date(+p[0],+p[1]-1,+p[2]);try{return dt.toLocaleDateString(dyLocale(),{year:'numeric',month:'long',day:'numeric',weekday:'long'})}catch(e){return d}}
function diaryView(){if(!DY||(SUB.d&&SUB.d!==DY.d))dyLoad(SUB.d||today());
  var all=dyAll(),keys=Object.keys(all).sort().reverse(),isT=DY.d===today();
  return hdr('📔 '+t('나의 비밀 일기장'))+
  '<div class="diary"><div class="dy-date">'+esc(dyDate(DY.d))+'</div>'+
  '<div class="dy-w"><span>'+t('날씨')+'</span>'+DWTH.map(function(w){return '<button class="'+(DY.w===w[0]?'on':'')+'" onclick="dySet(\'w\',\''+w[0]+'\');render()" title="'+esc(t(w[1]))+'">'+w[0]+'</button>'}).join('')+'</div>'+
  '<button class="dy-auto" onclick="dyWeather()">📍 '+t('오늘 날씨 알아보기')+'</button>'+
  '<input class="dy-t hand" id="dyT" maxlength="40" placeholder="'+esc(t('제목'))+'" value="'+esc(DY.t)+'" oninput="dySet(\'t\',this.value)">'+
  '<textarea class="dy-x hand" id="dyX" placeholder="'+esc(t('오늘 있었던 일을 말하거나 써 보세요'))+'" oninput="dySet(\'x\',this.value)">'+esc(DY.x)+'</textarea>'+
  '<button class="dy-mic'+(RECON?' on':'')+'" id="dyMic" onclick="dyMic()">'+(RECON?'⏹️ '+t('그만 말하기'):'🎤 '+t('말하면 글씨로 써져요'))+'</button>'+
  '<p class="dy-hint">'+(RECON?'👂 '+t('듣고 있어요… 천천히 또박또박 말해 보세요'):t('마이크를 누르고 말해 보세요. 예) 오늘은 친구와 놀아서 즐거웠다'))+'</p></div>'+
  '<div class="row"><button class="btn" onclick="dySave(1)">💾 '+t('일기 저장')+'</button><button class="btn p" onclick="dyCard()">'+t('그림으로 저장·인쇄')+'</button></div>'+
  (isT?'':'<button class="btn w" style="margin-top:10px" onclick="DY=null;go(\'diary\')">✏️ '+t('오늘 일기 쓰기')+'</button>')+
  (keys.length?'<div class="box" style="margin-top:14px"><h2>📚 '+t('지난 일기')+'</h2><div class="tlist">'+keys.slice(0,60).map(function(k){var e=all[k];return '<button class="'+(k===DY.d?'on':'')+'" onclick="dyStop();go(\'diary\',{d:\''+k+'\'})">'+(e.w||'📔')+' '+k.slice(5).replace('-','/')+' · '+esc(e.t||t('제목 없음'))+'</button>'}).join('')+'</div></div>':'')+
  '<p class="mut" style="text-align:center;font-size:12px">🔒 '+t('일기는 이 폰에만 저장되고 어디에도 보내지 않아요')+'</p>'}
function dySet(k,v){DY[k]=v;dySave()}
function dySave(show){if(!DY)return;var a=dyAll();if(DY.t||DY.x||DY.w){a[DY.d]={w:DY.w,t:DY.t,x:DY.x}}else delete a[DY.d];try{localStorage.setItem('ab_diary',JSON.stringify(a))}catch(e){}if(show){buzz();praise(t('에헴~ 일기를 쓰다니 훌륭하구먼!'),'K')}}
/* 음성 → 글씨 */
function dyNoMic(why){dyStop();if(VIEW==='diary')render();
  sheet('<h2>🎤 '+t('이 폰에서는 앱 마이크가 안 돼요')+'</h2><p style="line-height:1.7">'+t('대신 이렇게 해 보세요!')+'<br>① '+t('일기 쓰는 칸을 눌러요')+'<br>② '+t('키보드에 있는 <b>🎤 마이크 버튼</b>을 눌러요')+'<br>③ '+t('말하면 글씨로 써져요!')+'</p>'+(why?'<p class="mut" style="font-size:11px">('+esc(why)+')</p>':'')+'<button class="btn" onclick="closeSheet();var x=$(\'#dyX\');x&&x.focus()">'+t('알겠어요')+'</button>')}
function dyMic(){if(RECON){dyStop();render();return}
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){dyNoMic('no-api');return}
  try{REC=new SR();REC.lang=dyLocale();REC.continuous=true;REC.interimResults=true;var base=DY.x,got=false,heard=false,err='',me=REC;
    var wd=setTimeout(function(){if(REC===me&&!heard){err=err||'no-audio';try{me.abort()}catch(e){}dyNoMic(err)}},7000);
    REC.onaudiostart=function(){heard=true};REC.onspeechstart=function(){heard=true};
    REC.onresult=function(e){got=heard=true;var fin='',tmp='';for(var i=0;i<e.results.length;i++){var r=e.results[i][0].transcript;if(e.results[i].isFinal)fin+=r;else tmp+=r}
      var sep=base&&!/\s$/.test(base)?' ':'';var v=base+(fin||tmp?sep:'')+fin.trim()+(tmp?(fin?' ':'')+tmp.trim():'');var x=$('#dyX');if(x)x.value=v;DY.x=base+(fin?sep+fin.trim():'');if(fin)dySave()};
    REC.onerror=function(e){err=e.error||'error'};
    REC.onend=function(){clearTimeout(wd);if(REC!==me)return;var x=$('#dyX');if(x&&got){DY.x=x.value;dySave()}RECON=false;REC=null;
      if(!got&&err&&err!=='no-speech'&&err!=='aborted'){dyNoMic(err);return}if(!got&&err==='no-speech')toast('🎤 '+t('잘 안 들렸어요. 다시 눌러 말해 보세요'));if(VIEW==='diary')render()};
    REC.start();RECON=true;buzz();render()}catch(e){RECON=false;dyNoMic(String(e&&e.name||e))}}
function dyStop(){if(REC){try{REC.stop()}catch(e){}}RECON=false}
/* 날씨 자동: 위치 허락 시 Open-Meteo */
function dyWeather(){if(!navigator.geolocation){toast(t('날씨를 직접 골라 주세요'));return}
  toast('🌤️ '+t('날씨를 알아보는 중…'));
  navigator.geolocation.getCurrentPosition(function(p){fetch('https://api.open-meteo.com/v1/forecast?latitude='+p.coords.latitude.toFixed(2)+'&longitude='+p.coords.longitude.toFixed(2)+'&current=weather_code,wind_speed_10m,temperature_2m').then(function(r){return r.json()}).then(function(j){var c=j.current||{},w=c.weather_code,ws=c.wind_speed_10m||0,e;
    e=w>=71&&w<=77||w===85||w===86?'❄️':w>=51&&w<=67||w>=80&&w<=99?'🌧️':ws>=30?'🌬️':w===0||w===1?'☀️':w===2?'⛅':'☁️';
    DY.w=e;dySave();render();toast(e+' '+t(DWTH.filter(function(x){return x[0]===e})[0][1])+(c.temperature_2m!=null?' · '+Math.round(c.temperature_2m)+'°C':''))}).catch(function(){toast(t('날씨를 직접 골라 주세요'))})},
  function(){toast(t('날씨를 직접 골라 주세요'))},{timeout:8000,maximumAge:3600e3})}
/* 일기 그림 카드 */
var HANDF='"Gaegu","Nanum Pen Script","Comic Sans MS","Apple SD Gothic Neo","Noto Sans KR",cursive';
function dyCard(){if(!DY.t&&!DY.x){toast(t('먼저 일기를 써 주세요'));return}dySave();
  var go2=function(){var W=1080,F='"Apple SD Gothic Neo","Noto Sans KR",sans-serif',c0=document.createElement('canvas').getContext('2d');
    c0.font='44px '+HANDF;var lh=78,ln=Math.max(6,wrapText(c0,DY.x||' ',0,0,W-200,lh,1)),H=Math.max(1350,560+ln*lh+260);
    var cv=document.createElement('canvas');cv.width=W;cv.height=H;var c=cv.getContext('2d');
    c.fillStyle='#fffdf4';c.fillRect(0,0,W,H);c.fillStyle='#ffd9e4';c.fillRect(0,0,W,150);
    for(var i=0;i<14;i++){c.fillStyle='#fff';c.beginPath();c.arc(70+i*72,150,14,0,7);c.fill()}
    c.textAlign='center';c.fillStyle='#2e3a2a';c.font='900 56px '+F;c.fillText('📔 '+t('나의 비밀 일기장'),W/2,98);
    c.textAlign='left';c.font='700 36px '+F;c.fillStyle='#556';c.fillText(dyDate(DY.d),90,240);
    c.textAlign='right';c.font='60px '+F;c.fillText(DY.w||'',W-90,250);c.font='700 26px '+F;c.fillText(DY.w?t(DWTH.filter(function(x){return x[0]===DY.w})[0][1]):'',W-170,240);
    c.textAlign='left';c.fillStyle='#e0567f';c.font='700 34px '+F;c.fillText(t('제목'),90,345);
    c.fillStyle='#2e3a2a';c.font='700 58px '+HANDF;c.fillText(DY.t||'',200,350,W-290);
    c.strokeStyle='#e0567f';c.lineWidth=3;c.beginPath();c.moveTo(90,372);c.lineTo(W-90,372);c.stroke();
    var top=470;c.strokeStyle='#cfe6ff';c.lineWidth=2;for(var k=0;k<ln+1;k++){c.beginPath();c.moveTo(90,top+k*lh+14);c.lineTo(W-90,top+k*lh+14);c.stroke()}
    c.strokeStyle='#ffb3c7';c.beginPath();c.moveTo(80,400);c.lineTo(80,top+ln*lh+20);c.stroke();
    c.fillStyle='#2e3a2a';c.font='44px '+HANDF;wrapText(c,DY.x||'',100,top,W-200,lh);
    var by=H-210;try{c.drawImage(PIM.ks_f,W-330,by,Math.round(PIM.ks_f.width*180/PIM.ks_f.height),180);c.drawImage(PIM.kd_f,W-210,by,Math.round(PIM.kd_f.width*180/PIM.kd_f.height),180)}catch(e){}
    c.fillStyle='#7d8a76';c.font='800 34px '+F;c.fillText('✏️ '+KID.name,90,H-90);c.font='700 26px '+F;c.fillStyle='#5cc93a';c.fillText('all '+t('바르게'),90,H-50);
    var url=cv.toDataURL('image/png');window._dy={url:url,cv:cv};
    sheet('<h2>📔 '+t('일기 카드가 나왔어요!')+'</h2><div class="cert"><img src="'+url+'" alt=""></div><div class="row"><button class="btn p" onclick="saveImg(_dy.cv,\'diary-'+DY.d+'\')">📥 '+t('사진첩에 저장')+'</button><button class="btn s" onclick="printImg(_dy.url)">🖨️ '+t('인쇄')+'</button></div>'+
      '<p class="mut" style="text-align:center;margin-top:10px">'+t('저장이 안 되면 위 그림을 <b>길게 눌러 저장</b>해 주세요')+'</p><button class="btn w" onclick="closeSheet()">'+t('닫기')+'</button>')};
  try{Promise.race([document.fonts.load('44px Gaegu','가a'),new Promise(function(r){setTimeout(r,1500)})]).then(go2,go2)}catch(e){go2()}}
