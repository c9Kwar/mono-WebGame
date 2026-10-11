const {harness,assert}=require('./harness.cjs');
const summary=[];
for(const full of [false,true]){
 const times=[];for(let trial=1;trial<=40;trial++){
  const h=harness({v:1,lastSeen:Date.now(),total:100,highestStage:11,attack:40,vitality:50,guard:40,speed:15,passives:full?{light:5,guard:5,heal:5,haste:5,leech:5,echo:5}:{}});
  const value=h.run(`render=()=>{};renderLoot=()=>{};log=()=>{};notify=()=>{};var seed=${trial*101};Math.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};boss=true;bossId=1;bossTier='normal';bossLeft=60;spawn();s.heroHp=heroMaxHp();var duration=0;while(phase==='combat'&&duration<61){stepCombat(.1);duration+=.1};({duration,phase})`);
  assert.equal(value.phase,'victory');times.push(value.duration);
 }
 times.sort((a,b)=>a-b);summary.push({loadout:full?'max normal pool':'none',mean:times.reduce((a,b)=>a+b,0)/times.length,p10:times[4],median:times[20],p90:times[36]});
}
// Rare passives should provide a meaningful boost without multiplying DPS beyond 2x at the tested build.
assert(summary[0].mean/summary[1].mean<2);
console.log(JSON.stringify(summary,null,2));
