const {harness,assert}=require('./harness.cjs');const results=[];
for(const [id,attack,vitality,guard,speed] of [[0,25,30,30,10],[1,42,55,45,15],[2,60,70,70,20]]){
 const summary=[];
 for(const key of [null,'foxluck','foxward','foxspirit'])for(const level of key?[1,3]:[0]){
  const fights=[];
  for(let seed=1;seed<=12;seed++){
   let state=seed;const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
   const h=harness({v:1,lastSeen:Date.now(),highestStage:21,stage:11,total:100,attack,vitality,guard,speed,passives:{light:3,guard:2,heal:2,haste:2,leech:1,echo:1},specialPassives:key?{[key]:level}:{},specialActive:key},{random});
   const fight=h.run(`render=renderLoot=renderCodex=renderBossList=renderQuickBoss=()=>{};log=notify=showImpact=castEnemySkill=animateStrike=clearCombatEffects=()=>{};save=()=>true;showView=()=>true;s.heroHp=heroMaxHp();startBoss(${id},Math.random,true);var seconds=0;while(boss&&phase==='combat'&&seconds<61){stepCombat(.1);seconds+=.1};({won:s.bossWins[${id}]===1,seconds,hp:s.heroHp/heroMaxHp()})`);
   fights.push(fight);
  }
  assert(fights.every(x=>x.won),'Prepared build must win: '+id+' '+key);
  summary.push({skill:key||'none',level,seconds:fights.reduce((n,x)=>n+x.seconds,0)/12,hp:fights.reduce((n,x)=>n+x.hp,0)/12});
 }
 const normal=summary[0];assert(summary.find(x=>x.skill==='foxspirit'&&x.level===3).seconds<normal.seconds*.85);assert(summary.find(x=>x.skill==='foxward'&&x.level===3).hp>normal.hp);assert(Math.abs(summary.find(x=>x.skill==='foxluck'&&x.level===3).seconds-normal.seconds)<1e-8);results.push({boss:id,summary});
}
console.log('PASS 252 seeded boss fights with ordinary passives: spirit speeds kills, ward preserves HP, luck leaves combat unchanged',JSON.stringify(results));
