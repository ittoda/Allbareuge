/* ---------- 엉아들의 시간: 덧셈 · 뺄셈 · 곱셈 빈칸 채우기 → 올바르게 졸업장 ---------- */
var MOPS=[['add','➕','덧셈','#ffe3ec'],['sub','➖','뺄셈','#dff1ff'],['mul','✖️','곱셈','#fff3c4']],MQN=10,MPASS=8,MG=null;
function mathSt(){return ls('math')||{}}
function mOpName(k){return t(MOPS.filter(function(o){return o[0]===k})[0][2])}
function mAllPass(){var s=mathSt();return MOPS.every(function(o){return (s[o[0]]||0)>=MPASS})}
function mGen(op){var a,b,c,sym;
  if(op==='add'){a=1+Math.floor(Math.random()*9);b=1+Math.floor(Math.random()*9);c=a+b;sym='+'}
  else if(op==='sub'){c=1+Math.floor(Math.random()*9);b=1+Math.floor(Math.random()*9);a=b+c;c=a-b;sym='−'}
  else{a=2+Math.floor(Math.random()*8);b=1+Math.floor(Math.random()*9);c=a*b;sym='×'}
  var pos=Math.floor(Math.random()*3),parts=[a,b,c],ans=parts[pos],ch=[ans],d=[1,-1,2,-2,3,-3,op==='mul'?a:4,op==='mul'?-a:-4,5];
  while(ch.length<3){var v=ans+d[Math.floor(Math.random()*d.length)];if(v>=0&&ch.indexOf(v)<0)ch.push(v)}
  ch.sort(function(){return Math.random()-.5});return {p:parts,s:sym,pos:pos,ans:ans,ch:ch}}
function mathView(){var s=mathSt();
  if(MG&&SUB.play){var q=MG.q[MG.i],box=function(k){return k===q.pos?'<span class="mbx'+(MG.pick!=null?(MG.pick===q.ans?' ok':' no'):'')+'">'+(MG.pick!=null?q.ans:'?')+'</span>':'<span>'+q.p[k]+'</span>'};
    return hdr(MOPS.filter(function(o){return o[0]===MG.op})[0][1]+' '+mOpName(MG.op))+
    '<div class="mprog">'+MG.q.map(function(x,k){return '<i class="'+(k<MG.i?(MG.res[k]?'ok':'no'):k===MG.i?'cur':'')+'"></i>'}).join('')+'</div>'+
    '<div class="mq">'+box(0)+'<b>'+q.s+'</b>'+box(1)+'<b>=</b>'+box(2)+'</div>'+
    '<p class="mut" style="text-align:center;margin:6px 0 12px">'+t('빈칸에 들어갈 수를 골라요')+' ('+(MG.i+1)+'/'+MQN+')</p>'+
    '<div class="mch">'+q.ch.map(function(v){var cl=MG.pick==null?'':v===q.ans?' ok':v===MG.pick?' no':' dim';return '<button class="'+cl+'" onclick="mPick('+v+')"'+(MG.pick!=null?' disabled':'')+'>'+v+'</button>'}).join('')+'</div>'+
    (MG.pick!=null?'<button class="btn" style="margin-top:14px" onclick="mNext()">'+(MG.i+1<MQN?t('다음 문제')+' →':t('결과 보기'))+'</button>':'')}
  if(MG&&SUB.done){var sc=MG.res.filter(Boolean).length,pass=sc>=MPASS;
    return hdr('🏅 '+t('결과'))+greet(pass?t('에헴! 형님·언니 다 됐구먼!'):t('에헴, 아깝구먼~'),pass?t('옳지옳지~ 통과야!'):t('{0}개 이상 맞히면 통과야, 다시 해 보자!',MPASS))+
    '<div class="box score"><div style="font-size:15px;font-weight:800;color:var(--mut)">'+mOpName(MG.op)+'</div><div class="n">'+sc+'<span style="font-size:26px">/'+MQN+'</span></div><div class="stars">'+(pass?'✅ '+t('통과'):'💪 '+t('다시 도전'))+'</div></div>'+
    (mAllPass()?'<button class="btn y" onclick="mDiploma()">🎓 '+t('올바르게 졸업장 받기')+'</button>':'')+
    '<button class="btn" onclick="mStart(\''+MG.op+'\')">🔁 '+t('다시 하기')+'</button><button class="btn w" onclick="MG=null;go(\'math\')">'+t('다른 계산 고르기')+'</button>'}
  MG=null;var np=MOPS.filter(function(o){return (s[o[0]]||0)>=MPASS}).length;
  return hdr('🧒 '+t('엉아들의 시간'))+greet(t('에헴~ 이제 셈도 척척 해 보자꾸나!'),t('세 가지를 다 통과하면 졸업장을 줄게!'))+
  '<div class="mops">'+MOPS.map(function(o){var b=s[o[0]]||0,ok=b>=MPASS;return '<button style="background:'+o[3]+'" onclick="mStart(\''+o[0]+'\')"><span class="mi">'+o[1]+'</span><b>'+t(o[2])+'</b><small>'+(ok?'✅ '+t('통과'):b?t('최고 {0}점',b+'/'+MQN):t('도전!'))+'</small><em>'+(o[0]==='add'?'5 + ? = 7':o[0]==='sub'?'9 − ? = 4':'3 × ? = 12')+'</em></button>'}).join('')+'</div>'+
  '<div class="box" style="margin-top:12px;text-align:center"><div style="font-size:15px;font-weight:800">🎓 '+t('졸업까지 {0}/3',np)+'</div><div class="prog"><i style="width:'+Math.round(np/3*100)+'%"></i></div>'+
  (np===3?'<button class="btn y" style="margin-top:12px" onclick="mDiploma()">🎓 '+t('올바르게 졸업장 받기')+'</button>':'<p class="mut" style="margin:8px 0 0;font-size:12.5px">'+t('10문제 중 {0}개 이상 맞히면 통과예요',MPASS)+'</p>')+'</div>'}
function mStart(op){MG={op:op,i:0,res:[],pick:null,q:[]};for(var k=0;k<MQN;k++)MG.q.push(mGen(op));buzz();go('math',{play:1})}
function mPick(v){if(MG.pick!=null)return;MG.pick=v;var ok=v===MG.q[MG.i].ans;MG.res[MG.i]=ok;buzz();
  if(ok)praise(rnd([t('옳지옳지~! 정답이야'),t('옳지! 라떼보다 낫구먼~')]),rnd(['K','S']));render()}
function mNext(){MG.i++;MG.pick=null;if(MG.i<MQN){go('math',{play:1});return}
  var sc=MG.res.filter(Boolean).length,s=mathSt(),was=mAllPass();s[MG.op]=Math.max(s[MG.op]||0,sc);ls('math',s);
  go('math',{done:1});if(sc>=MPASS)confetti(30);if(!was&&mAllPass())setTimeout(mDiploma,900)}
function mDiploma(){var W=1080,H=1440,cv=document.createElement('canvas');cv.width=W;cv.height=H;var c=cv.getContext('2d'),F='"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif';
  var g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#f3f0ff');g.addColorStop(1,'#fff6e0');c.fillStyle=g;c.fillRect(0,0,W,H);
  c.strokeStyle='#2e3a6e';c.lineWidth=18;c.strokeRect(40,40,W-80,H-80);c.strokeStyle='#d4a72c';c.lineWidth=6;c.strokeRect(72,72,W-144,H-144);
  c.textAlign='center';c.font='130px '+F;c.fillText('🎓',W/2,250);
  c.fillStyle='#2e3a6e';c.font='900 '+(LANG==='ko'?100:64)+'px '+F;c.fillText(t('졸 업 장'),W/2,395,W-200);
  c.fillStyle='#5cc93a';c.font='800 46px '+F;c.fillText('all '+t('바르게'),W/2,465);
  c.fillStyle='#2e3a2a';c.font='900 84px '+F;c.fillText(KID.name,W/2,610,W-200);
  c.font='800 40px '+F;c.fillStyle='#7d8a76';c.fillText(t('어린이'),W/2,670);
  var body=t('위 어린이는 바른 습관을 익히고 덧셈·뺄셈·곱셈까지 씩씩하게 해냈기에 all 바르게를 졸업함을 축하합니다. 이제 멋진 형님·언니예요!');
  c.fillStyle='#2e3a2a';c.font='600 42px '+F;var ln=wrapText(c,body,W/2,780,W-260,66);
  c.font='64px '+F;c.fillText('➕  ➖  ✖️',W/2,800+ln*66+50);
  c.font='700 40px '+F;c.fillStyle='#2e3a2a';c.fillText(today().replace(/-/g,'. ')+'.',W/2,1215);
  c.font='800 44px '+F;c.fillText(t('{0} · {1} 드림',KN(),SN()),W/2,1290,W-560);
  try{c.drawImage(PIM.kd_f,100,1130,Math.round(PIM.kd_f.width*220/PIM.kd_f.height),220);var sw=Math.round(PIM.ks_f.width*220/PIM.ks_f.height);c.drawImage(PIM.ks_f,W-100-sw,1130,sw,220)}catch(e){}
  var url=cv.toDataURL('image/png');window._dip={url:url,cv:cv};
  sheet('<h2>🎓 '+t('졸업을 축하해요!')+'</h2><p class="mut" style="margin:0 0 10px">'+t('이제 형님·언니가 되었어요. 꼰댕이와 꼰순이가 늘 응원할게요!')+'</p><div class="cert"><img src="'+url+'" alt=""></div>'+
   '<div class="row"><button class="btn p" onclick="saveImg(_dip.cv,\'diploma\')">📥 '+t('사진첩에 저장')+'</button><button class="btn s" onclick="printImg(_dip.url)">🖨️ '+t('인쇄')+'</button></div>'+
   '<p class="mut" style="text-align:center;margin-top:10px">'+t('저장이 안 되면 위 상장을 <b>길게 눌러 저장</b>해 주세요')+'</p><button class="btn w" onclick="closeSheet()">'+t('닫기')+'</button>');confetti(50)}
