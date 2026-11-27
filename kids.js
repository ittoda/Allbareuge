/* ---------- 여러 아이 프로필 (형제·쌍둥이) ---------- */
var KMAX=5;
function kidIds(){var a=ls('kids');return Array.isArray(a)&&a.length?a:['']}
function kidLoad(){KID=ls('kid')||null;SB=ls('sb')||null;STORY=ls('story')||null;if(STORY&&STORY.lang&&STORY.lang!==LANG)STORY=null;
  GRS=ls('grows')||{};if(!Object.keys(GRS).length){var o=ls('grow');if(o&&o.pet)GRS[o.pet]=o}var c=ls('gcur');GR=(c&&GRS[c])||GRS[Object.keys(GRS)[0]]||null;
  DY=null;MG=null;MQ=null;DR.topic=null;_bdShown=false;_av=null;_kn=null;_kb=null}
function kidSwitch(id){if(id===KSFX)return;KSFX=id;ls('kcur',id);kidLoad();buzz();go(KID?'home':'kid');if(window.attLoad&&window.piTok&&piTok()){ART=0;attLoad()}}
function kidAdd(){var ids=kidIds();if(ids.length>=KMAX){toast(t('아이는 {0}명까지 넣을 수 있어요',KMAX));return}
  var id='_k'+Date.now().toString(36).slice(-5);ids.push(id);ls('kids',ids);window._kprev=KSFX;KSFX=id;ls('kcur',id);kidLoad();go('kid')}
function kidCancel(){var ids=kidIds().filter(function(x){return x!==KSFX});ls('kids',ids);var p=window._kprev;KSFX=ids.indexOf(p)>=0?p:ids[0];ls('kcur',KSFX);kidLoad();go(KID?'home':'kid')}
function kidDelAsk(){sheet('<h2>🗑️ '+t('{0} 프로필을 지울까요?',esc(KID.name))+'</h2><p class="mut" style="line-height:1.6">'+t('도장판, 친구 키우기, 일기 등 이 아이의 기록이 모두 지워져요.')+'</p><button class="btn" style="background:#e0567f;box-shadow:0 4px 0 #b83a5f" onclick="kidDel()">'+t('지우기')+'</button><button class="btn w" onclick="closeSheet()">'+t('취소')+'</button>')}
function kidDel(){var id=KSFX;if(!id)return;try{var rm=[];for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k.indexOf('ab_')===0&&k.slice(-id.length)===id)rm.push(k)}rm.forEach(function(k){localStorage.removeItem(k)})}catch(e){}
  var ids=kidIds().filter(function(x){return x!==id});ls('kids',ids);KSFX=ids[0]||'';ls('kcur',KSFX);kidLoad();closeSheet();go(KID?'home':'kid')}
function kidAvOf(id){var k=lsOf('kid',id),p=lsOf('photo',id);return (k&&k.av==='📷'&&p)?'<img class="kphoto" src="'+p+'" alt="">':esc((k&&k.av!=='📷'&&k.av)||'🐣')}
function kidTabs(){var ids=kidIds();if(ids.length<2)return '';
  return '<div class="ktabs">'+ids.map(function(id){var k=lsOf('kid',id);if(!k)return '';return '<button class="'+(id===KSFX?'on':'')+'" onclick="kidSwitch(\''+id+'\')"><span class="kav">'+kidAvOf(id)+'</span>'+esc(k.name)+'</button>'}).join('')+'</div>'}
