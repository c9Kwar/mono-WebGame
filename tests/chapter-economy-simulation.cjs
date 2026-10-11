// Comparable checkpoints, no rare gear or passive procs: faster training must not
// imply automatic late-stage survival. Times below are estimates, not playtime promises.
const {harness,assert}=require('./harness.cjs');
const rows=[];
for(const [stage,attack,vitality,guard,speed]of [[1,0,0,0,0],[3,5,4,3,1],[6,12,10,8,3],[11,22,20,20,6],[21,40,45,40,12],[30,55,65,60,18]]){
 const saved={v:1,lastSeen:Date.now(),stage,highestStage:stage,total:100,attack,vitality,guard,speed};
 const h=harness(saved);
 const rates=h.run(`(()=>{const keys=ordinaryMobPool();return keys.map(key=>{const hit=attack()*(1+crit()),oldCycle=Math.ceil(Math.round(health()*MOBS[key].hp)/hit)/speed()+.8+travelSeconds(),cycle=Math.ceil(fieldHealth(key)/(hit*(1-fieldReduction(key))))/speed()+.8+travelSeconds();return {key,oldRate:Math.floor(reward()*goldMultiplier())/oldCycle,rate:fieldGold(key)/cycle}})})()`);
 const oldRate=rates.reduce((n,m)=>n+m.oldRate,0)/rates.length,rate=rates.reduce((n,m)=>n+m.rate,0)/rates.length;
 const oldSeconds=Math.floor(30*1.22**attack)/oldRate,seconds=h.run("upgradePrice('attack',s.attack)")/rate;
 assert(seconds<oldSeconds*.9,'Training interval must improve, even after higher field HP and armor');
 const outcomes=[];
 for(const m of rates){
  const q=harness(saved);
  const fight=()=>q.run(`render=()=>{};renderLoot=()=>{};log=()=>{};notify=()=>{};Math.random=()=>.5;currentMob='${m.key}';phase='combat';boss=false;hp=maxHp=fieldHealth();s.heroHp=heroMaxHp();attackClock=enemyClock=0;var elapsed=0;while(phase==='combat'&&elapsed<120){stepCombat(.1);elapsed+=.1};({result:phase,seconds:Math.round(elapsed*10)/10})`);
  const result=fight();outcomes.push({mob:m.key,...result});
  if(stage<30)assert.equal(result.result,'loot');
  else if(result.result==='defeated'){q.run('s.stage=30;s.vitality=75;s.guard=70');assert.equal(fight().result,'loot','Additional survival training must solve the wall')}
 }
 rows.push({stage,build:{attack,vitality,guard,speed},nextAttackSeconds:{before:Math.round(oldSeconds),after:Math.round(seconds)},outcomes});
}
assert(rows.at(-1).outcomes.some(m=>m.result==='defeated'),'The final stage must require survival preparation');
console.log('PASS chapter field checkpoints, cheaper training intervals and a solvable stage-30 survival wall',JSON.stringify(rows));
