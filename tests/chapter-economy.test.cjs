const test=require('node:test'),assert=require('node:assert/strict'),{harness}=require('./harness.cjs');
const base={v:1,lastSeen:Date.now(),stage:1,total:0,gearVersion:1};
test('boss gates use reached stages, while the final guardian requires the last stage kill',()=>{
 for(const [stage,open]of [[2,0],[3,1],[5,1],[6,2],[10,2],[11,3],[20,3],[21,4],[30,4]]){
  const h=harness({...base,stage,highestStage:stage,total:999});
  assert.equal(h.run('BOSSES.filter((_,i)=>bossUnlocked(i)).length'),open);
 }
 const h=harness({...base,stage:30,highestStage:30});
 assert.equal(h.run('bossUnlocked(4)'),false);assert.equal(h.run('claimMilestone(30)'),false);
 h.run("s.kills=requiredKills()-1;currentMob='slime';hp=1;s.heroHp=heroMaxHp();damage(10)");
 assert.equal(h.run('s.stage'),30);assert.equal(h.run('s.chapterOneCleared'),true);assert.equal(h.run('bossUnlocked(4)'),true);
 assert.equal(h.run('s.farmMode'),true);assert.equal(h.run('claimMilestone(30,()=>.99)'),true);
 assert.equal(h.run('ITEMS[s.gear.at(-1).key].rarity'),'legendary');assert.equal(h.run('s.gear.at(-1).tier'),3);
 const gold=h.run('s.gold');assert.equal(h.run('claimMilestone(30)'),false);assert.equal(h.run('s.gold'),gold);
 h.run('save()');const r=harness(JSON.parse(h.stored['mosslight.save.v1']));assert.equal(r.run('bossUnlocked(4)'),true);
 r.run('for(let i=0;i<100;i++){s.kills=requiredKills();finishFieldStage()}');assert.equal(r.run('s.stage'),30);
});
test('migration retains old records, gear, currency and cleared rewards without creating a new chapter',()=>{
 const h=harness({...base,stage:56,highestStage:71,gold:12345,claimedMilestones:[6,31,51],bossWins:[1,1,1,1,1]});
 assert.equal(h.run('s.stage'),30);assert.equal(h.run('s.highestStage'),30);assert.equal(h.run('s.legacyHighestStage'),71);
 assert.equal(h.run('s.chapterOneCleared'),true);assert.equal(h.run('s.gold'),12345);
 assert.deepEqual(JSON.parse(h.run('JSON.stringify(s.claimedMilestones)')),[6,31,51]);
 assert.equal(h.run('claimMilestone(51)'),false);
 const early=harness({...base,bossWins:[0,0,0,0,1]});assert.equal(early.run('bossUnlocked(4)'),true);assert.equal(early.run('s.chapterOneCleared'),false);
});
test('a saved last kill finishes stage thirty once; arriving there never does',()=>{
 const incomplete=harness({...base,stage:30,highestStage:30,kills:21});assert.equal(incomplete.run('s.chapterOneCleared'),false);
 const complete=harness({...base,stage:30,highestStage:30,kills:22});assert.equal(complete.run('s.chapterOneCleared'),true);
 complete.run('save()');const restored=harness(JSON.parse(complete.stored['mosslight.save.v1']));assert.equal(restored.run('s.kills'),0);assert.equal(restored.run('s.stage'),30);
});
test('gold gains rise 10–40 percent by species difficulty; received amount matches the HUD quote',()=>{
 for(const key of ['slime','mushroom','moth','snail','rabbit','eliteSlime','eliteMushroom','eliteMoth','eliteSnail','eliteRabbit','treasure']){
  const h=harness({...base,stage:21,highestStage:21});h.run(`currentMob='${key}';hp=1;s.paused=false;phase='combat';render()`);
  const boost=h.run('mobGoldBoost()');assert.ok(boost>=.1&&boost<=.4);
  const expected=h.run('fieldGold()'),before=h.run('s.gold');h.run('damage(10)');assert.equal(h.run('s.gold')-before,expected);
 }
 const h=harness(base);assert.equal(h.run('mobGoldBoost("slime")'),.1);assert.equal(h.run('mobGoldBoost("treasure")'),.4);
 for(let id=0;id<5;id++){const ratio=h.run(`BOSS_GOLD[${id}]`)/[600,2400,9600,18000,36000][id];assert.ok(ratio>=1.1&&ratio<=1.4)}
});
test('basic training is cheaper at early and late levels, while field offense, HP and armor scale up',()=>{
 const h=harness(base);
 for(const [key,oldBase,oldRate]of [['attack',30,1.22],['vitality',45,1.2],['guard',55,1.2]])for(const level of [0,10,30,60,90]){
  assert.ok(h.run(`upgradePrice('${key}',${level})`)<Math.floor(oldBase*oldRate**level));
 }
 for(const stage of [1,3,6,11,21,30])for(const key of ['slime','snail','rabbit']){
  h.run(`s.stage=${stage};currentMob='${key}';boss=false;hp=1e6`);
  assert.ok(h.run('fieldHealth()')>h.run('health()*MOBS[currentMob].hp'));
  assert.ok(h.run('enemyAttack()')>h.run('Math.round(18*1.2**(s.stage-1)*MOBS[currentMob].atk)'));
  const armor=h.run('fieldReduction()');assert.ok(armor>0&&armor<=.45);
  h.run('damage(1000)');assert.ok(h.run('hp')>999000&&h.run('hp')<1000000);
 }
 h.run("s.stage=30;currentMob='snail';boss=false;hp=1000");assert.equal(h.run('damage(1)'),1);
});
test('upgraded late boss gear keeps old two-line rolls; new drops have three lines',()=>{
 const h=harness({...base,gear:[{id:'g1',key:'acornblade',roll:10,quantity:2,locked:true,tier:5,potentialVersion:2,potentials:[{type:'atkFlat',grade:0,value:10},{type:'critical',grade:0,value:.01}]}],inventory:{acornblade:2},slots:{weapon:'g1'}});
 assert.equal(h.run('s.gear[0].potentials.length'),2);assert.equal(h.run('s.gear[0].tier'),5);assert.equal(h.run('s.gear[0].locked'),true);
 assert.equal(h.run('makeGear("acornblade",()=>.5).potentials.length'),3);
});
test('late guardian first-clear blueprints are guaranteed once without duplicated drops',()=>{
 for(const id of [3,4]){const h=harness(base);h.run(`bossTier='normal';s.bossWins[${id}]=1;rollLoot(true,${id},()=>.99)`);const key=id===3?'bp_moonboots':'bp_acorncoat';assert.equal(h.run(`s.inventory.${key}`),1);h.run(`s.bossWins[${id}]=2;rollLoot(true,${id},()=>.99)`);assert.equal(h.run(`s.inventory.${key}`),1)}
});
