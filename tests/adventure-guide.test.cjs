const {test}=require('node:test');
const {harness,assert}=require('./harness.cjs');
const base={v:1,lastSeen:Date.now(),stage:11,highestStage:16,total:120,gearVersion:1,attack:25,vitality:25,guard:25,gold:10000};
test('bulk milestones pay exactly once and do not pay the stage-30 arrival reward',()=>{
 const h=harness({...base,highestStage:30,stage:30});const gold=h.run('s.gold');
 assert.equal(h.run('claimAllMilestones(()=>.99)'),6);assert.equal(h.run('s.gold'),gold+21600);
 const snapshot=h.run('JSON.stringify([s.gold,s.inventory,s.claimedMilestones,s.gear])');assert.equal(h.run('claimAllMilestones(()=>.99)'),0);assert.equal(h.run('JSON.stringify([s.gold,s.inventory,s.claimedMilestones,s.gear])'),snapshot);
 const r=harness(JSON.parse(h.stored['mosslight.save.v1']));assert.equal(r.run('claimAllMilestones()'),0);assert.equal(r.run('bossUnlocked(4)'),false);
});
test('elite and fox failures preserve progress, give no loot and still take eight seconds to recover',()=>{
 for(const key of ['eliteSlime','eliteMushroom','eliteMoth','eliteSnail','eliteRabbit','treasure']){
  const h=harness({...base,kills:7});h.run(`currentMob='${key}';boss=false;phase='combat';s.heroHp=1`);
  const before=h.run('JSON.stringify([s.gold,s.inventory,s.gear,s.kills,s.stage,s.total])');h.run('defeatHero()');
  assert.equal(h.run('JSON.stringify([s.gold,s.inventory,s.gear,s.kills,s.stage,s.total])'),before);assert.equal(h.run('phaseLeft'),8);assert.equal(h.run('s.heroHp'),0);assert.equal(h.run('s.deaths'),1);assert.equal(h.run('s.fieldDefeats.length'),0);
 }
});
test('rolling normal defeats survive intervening wins, persist and expire after ten minutes',()=>{
 let now=1800000000000;class Clock extends Date{static now(){return now}}
 const h=harness({...base,lastSeen:now},{Date:Clock,random:()=>.5});
 for(let i=0;i<3;i++){h.run("boss=false;phase='combat';currentMob='slime';s.heroHp=1;defeatHero()");if(i<2)h.run("phase='combat';s.heroHp=heroMaxHp();hp=1;damage(1e6)");now+=60000}
 assert.equal(h.run('s.farmMode'),true);assert.equal(h.run('s.fieldDefeats.length'),3);
 const saved=JSON.parse(h.stored['mosslight.save.v1']);assert.equal(harness(saved,{Date:Clock}).run('s.fieldDefeats.length'),3);
 now+=600001;assert.equal(harness({...saved,lastSeen:now},{Date:Clock}).run('s.fieldDefeats.length'),0);
});
test('queued route cannot reroll combat or unlock future stages and survives reload',()=>{
 const h=harness(base);h.run("boss=false;phase='combat';currentMob='slime';s.heroHp=50;hp=321;s.kills=4");
 assert.equal(h.run('requestRoute(17,true)'),false);assert.equal(h.run('requestRoute(3,true)'),true);assert.equal(h.run('hp'),321);assert.equal(h.run('s.stage'),11);
 const r=harness(JSON.parse(h.stored['mosslight.save.v1']));assert.equal(r.run('s.queuedRoute.stage'),3);r.run('beginTravel()');assert.equal(r.run('s.stage'),3);assert.equal(r.run('s.kills'),0);assert.equal(r.run('s.highestStage'),16);assert.equal(r.run('s.heroHp'),50);assert.equal(r.run('s.queuedRoute'),null);assert.equal(r.run('s.farmMode'),true);
 r.run("boss=true;phase='combat'");assert.equal(r.run('requestRoute(16,false)'),false);r.run('boss=false;s.rewardPending=true');assert.equal(r.run('requestRoute(16,false)'),false);
});
test('field report uses selected stage and never consumes RNG or changes progress',()=>{
 const h=harness(base);h.run('Math.random=()=>{throw Error("projection consumed RNG")};');const before=h.run('JSON.stringify(s)');
 assert.ok(h.run('projectFieldPreparation(16).damage')>h.run('projectFieldPreparation(3).damage'));assert.equal(h.run('JSON.stringify(s)'),before);
});
test('recipe navigation reveals a pinned unavailable recipe despite ready-only or rarity filters',()=>{
 const h=harness(base);h.run("craftReadyOnly=true;craftRarity='mythic';pinRecipe('practiceblade');openCraftTarget(s.fieldNotes.target)");assert.equal(h.run('craftReadyOnly'),false);assert.equal(h.run('craftRarity'),'all');assert.equal(h.nodes.get('recipe-card-practiceblade').hidden,false);assert.equal(h.run('s.fieldNotes.target'),'practiceblade');
});
test('bulk salvage follows visible status and protects locked or equipped gear',()=>{
 const h=harness(base);h.run("var a=award('practiceblade',1,()=>.1);var b=award('practiceblade',1,()=>.9);var c=award('tunic',1,()=>.3);s.slots.weapon=a.id;c.locked=true;gearStatus='upgrade';gearFilter='weapon';renderEquipment()");
 assert.equal(h.run('bulkCandidates(1).length'),1);assert.equal(h.run('bulkCandidates(1)[0].id===b.id'),true);
 h.run("gearStatus='locked'");assert.equal(h.run('bulkCandidates(1).length'),0);
 h.run("gearStatus='unlocked'");assert.equal(h.run('bulkCandidates(1).length'),1);
});
test('conflicting tab cannot claim, queue travel, change farm mode or craft target',()=>{
 const h=harness(base);h.run("persistence.check=()=>false;var before=JSON.stringify(s)");assert.equal(h.run('claimAllMilestones()'),0);assert.equal(h.run('requestRoute(3,true)'),false);assert.equal(h.run("pinRecipe('practiceblade')"),false);h.run("$('farm-mode').onclick()");assert.equal(h.run('JSON.stringify(s)'),h.run('before'));
});
