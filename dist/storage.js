'use strict';
// Keep the original v1 key. Invalid/future records are never replaced implicitly.
const MosslightSaves = (() => {
 const KEY='mosslight.save.v1', BACKUP=KEY+'.backup';
 const record=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 function validate(raw) {
  if(typeof raw!=='string'||raw.length>10*1024*1024)throw Error('저장 파일 크기를 확인해 주세요.');
  const data=JSON.parse(raw);
  if(!record(data)||data.v!==1)throw Error('지원하지 않는 저장 버전입니다.');
  const visit=(x,depth=0)=>{
   if(depth>25)throw Error('저장 구조가 너무 깊습니다.');
   if(typeof x==='number'&&!Number.isFinite(x))throw Error('저장 수치가 올바르지 않습니다.');
   if(x&&typeof x==='object')for(const [key,value] of Object.entries(x)){
    if(['__proto__','prototype','constructor'].includes(key))throw Error('저장 키가 올바르지 않습니다.');
    visit(value,depth+1);
   }
  };visit(data);
  for(const key of ['stage','highestStage'])if(data[key]!==undefined&&(!Number.isInteger(data[key])||data[key]<0||data[key]>1000))throw Error('스테이지 기록이 지원 범위를 벗어났습니다.');
  for(const key of ['inventory','slots','passives','specialPassives','fieldNotes','trails','research','journey','potentialBuff'])if(data[key]!=null&&!record(data[key]))throw Error(key+' 기록이 올바르지 않습니다.');
  for(const key of ['gold','total','kills','attack','speed','crit','move','vitality','guard','lastSeen','nextGearId','deaths'])if(data[key]!==undefined&&(typeof data[key]!=='number'||data[key]<0))throw Error(key+' 수치가 올바르지 않습니다.');
  for(const key of ['bossWins','bossReadyAt','discovered','claimedMilestones','gear'])if(data[key]!==undefined&&!Array.isArray(data[key]))throw Error(key+' 목록이 올바르지 않습니다.');
  if(data.gear){
   if(data.gear.length>20000)throw Error('장비 기록이 너무 큽니다.');
   const ids=new Set();
   for(const g of data.gear){
    if(!record(g)||typeof g.id!=='string'||!/^g\d+$/.test(g.id)||!Number.isSafeInteger(Number(g.id.slice(1)))||ids.has(g.id)||typeof g.key!=='string'||!Number.isInteger(g.roll)||g.roll<0||g.roll>30||(g.quantity!==undefined&&(!Number.isSafeInteger(g.quantity)||g.quantity<1||g.quantity>1e6))||(g.potentials!==undefined&&(!Array.isArray(g.potentials)||g.potentials.some(p=>!record(p)))))throw Error('장비 기록이 올바르지 않습니다.');
    ids.add(g.id);
   }
  }
  if(data.slots&&Object.values(data.slots).some(x=>x!==null&&typeof x!=='string'))throw Error('장착 기록이 올바르지 않습니다.');
  if(data.inventory&&Object.values(data.inventory).some(x=>!Number.isSafeInteger(x)||x<0))throw Error('가방 기록이 올바르지 않습니다.');
  if(data.journey?.lastLoot&&(!Array.isArray(data.journey.lastLoot)||data.journey.lastLoot.some(x=>!record(x)||typeof x.key!=='string'||!Number.isFinite(x.count))))throw Error('전리품 기록이 올바르지 않습니다.');
  return data;
 }
 function create(access) {
  let storage,baseline=null,status='ready',message='';
  try {storage=access();baseline=storage.getItem(KEY);if(baseline!==null)validate(baseline);}
  catch(e){status=storage?'protected':'unavailable';message=e.message;}
  return {
   get status(){return status;},get message(){return message;},
   readRaw(){return status==='ready'?baseline:null;},
   original(){return baseline;},
   check(){
    if(status!=='ready')return false;
    try{if(storage.getItem(KEY)!==baseline){status='conflict';message='다른 탭이 저장했습니다. 이 탭을 새로고침해 주세요.';return false;}}
    catch(e){status='unavailable';message=e.message;return false;}
    return true;
   },
   write(raw){
    if(!this.check())return false;
    try {validate(raw);storage.setItem(KEY,raw);baseline=raw;return true;}
    catch(e){message=e.message;return false;}
   },
   replace(raw){
    const data=validate(raw);
    if(!storage)throw Error('브라우저 저장소를 사용할 수 없습니다.');
    // A stale tab cannot import over newer progress. Backup must succeed first.
    if(storage.getItem(KEY)!==baseline)throw Error('다른 탭의 기록이 변경되었습니다. 새로고침해 주세요.');
    data.lastSeen=Date.now();data.paused=true;
    if(baseline!==null)storage.setItem(BACKUP,baseline);
    const next=JSON.stringify(data);storage.setItem(KEY,next);baseline=next;status='ready';return data;
   },
   backup(){return storage?.getItem(BACKUP)||null;}
  };
 }
 return {KEY,BACKUP,validate,create};
})();
if(typeof module!=='undefined')module.exports=MosslightSaves;
