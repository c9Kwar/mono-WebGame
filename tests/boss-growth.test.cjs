const test=require('node:test'),assert=require('node:assert/strict'),{harness}=require('./harness.cjs');
const base={v:1,lastSeen:Date.now(),total:100,highestStage:25,stage:21,gearVersion:1};
const plain=x=>JSON.parse(JSON.stringify(x));
test('legacy equipment keeps exact stats, options, lock and quantity across tier migration',()=>{
 const sample=harness(base);const potentials=plain(sample.run("makeGear('guardiancoat',()=>.5).potentials"));
 const gear={id:'g4',key:'guardiancoat',roll:17,exceptional:true,locked:true,quantity:3,ward:.02,potentials};
 const h=harness({...base,gear:[gear],slots:{chest:'g4'},inventory:{guardiancoat:3}});
 assert.equal(h.run('gearStat("chest","hp")'),350*(1+.17*1.5));
 assert.deepEqual(plain(h.run('s.gear[0]')),{...gear,tier:1});h.run('save()');
 const restored=harness(JSON.parse(h.stored['mosslight.save.v1']));assert.deepEqual(plain(restored.run('s.gear[0]')),{...gear,tier:1});
});
test('same-rarity higher tier improves stats, score and recommended loadout and tier-scaled potentials',()=>{
 const h=harness(base);h.run("var a=award('mossblade',1,()=>.5,'test',1),b=award('mossblade',1,()=>.5,'test',6);s.slots.weapon=a.id;var oldStat=gearStat('weapon','damage');s.slots.weapon=b.id");
 assert.equal(h.run("gearStat('weapon','damage')/oldStat"),2);assert.ok(h.run('baseGearScore(b)>baseGearScore(a)'));h.run('s.slots.weapon=a.id');assert.equal(h.run("recommendedGear('weapon').id"),h.run('b.id'));h.run('s.slots.weapon=b.id');
 assert.ok(h.run('b.potentials.every((p,i)=>p.value>=a.potentials[i].value)'));assert.match(h.run('gearText(b)'),/^T6/);
 h.run('save()');const restored=harness(JSON.parse(h.stored['mosslight.save.v1']));assert.equal(restored.run('equippedGear("weapon").tier'),6);
 assert.equal(h.run('gearTier({tier:99})'),8);assert.equal(h.run('gearTier({tier:-3})'),1);assert.equal(h.run('gearTier({tier:NaN})'),1);
});
test('all bosses and variants have three reachable guaranteed choices and correct reward tiers',()=>{
 for(let id=0;id<5;id++)for(const variant of ['normal','elite','mystic']){
  const seen=new Set();for(const roll of [.1,.5,.9]){
   const h=harness(base);h.run(`bossTier='${variant}';rollLoot(true,${id},()=>${roll})`);
   const gears=plain(h.run('s.gear'));const pool=plain(h.run(`BOSS_GEAR_POOLS[${id}]`));
   const selected=pool[Math.floor(roll*3)];assert.ok(gears.some(g=>g.key===selected));seen.add(selected);
   assert.ok(gears.every(g=>g.tier===id+2+['normal','elite','mystic'].indexOf(variant)));
  }assert.equal(seen.size,3);
 }
});
test('boss armor penetration affects defense before mitigation; regular enemies are unchanged',()=>{
 const h=harness(base);h.run("boss=true;bossId=4;bossTier='mystic';bossStrikes=0;hp=maxHp=100;s.guard=10");
 assert.equal(h.run('incomingDamage()'),h.run('Math.max(1,Math.round((1000*12-heroDefense()*.45)*(1-mitigation())*(1-bossMitigation())))'));
 h.run("boss=false;currentMob='slime';s.stage=1;s.guard=1");assert.equal(h.run('incomingDamage()'),h.run('Math.max(1,Math.round((18-heroDefense())*(1-mitigation())))'));
 assert.ok(h.run("bossPenetration(4,'mystic')<1"));
});
test('regeneration uses elapsed combat time, caps HP and never runs while hidden, paused or dead',()=>{
 const h=harness(base);h.run("boss=true;bossId=4;bossTier='normal';bossLeft=60;spawn();hp=100000;s.heroHp=heroMaxHp();attackClock=enemyClock=0;stepCombat(.1)");
 assert.ok(Math.abs(h.run('hp')-100540)<1e-8);
 for(const setup of ['s.paused=true','s.paused=false;document.hidden=true','document.hidden=false;phase="victory";s.rewardPending=false']){h.run(setup);const before=h.run('hp');h.run('stepCombat(.1)');assert.equal(h.run('hp'),before)}
 h.run('phase="combat";hp=maxHp-1;regenerateBoss(1)');assert.equal(h.run('hp'),h.run('maxHp'));
 h.run('hp=0;regenerateBoss(1)');assert.equal(h.run('hp'),0);
 assert.equal(h.run('bossRegenPerSecond(4,"normal",1)'),0);assert.equal(h.run('bossRegenPerSecond(4,"normal",.5)'),2700);
});
test('field/crafting tiers follow region while boss reward snapshots retain tier and never duplicate on reload',()=>{
 const h=harness({...base,gold:1e9});assert.equal(h.run('fieldGearTier(1)'),1);assert.equal(h.run('fieldGearTier(11)'),3);assert.equal(h.run('fieldGearTier(999)'),5);
 h.run("currentMob='slime';rollLoot(false,0,()=>0)");assert.equal(h.run('s.gear.length'),0);
 h.run("for(const [key,n] of Object.entries(RECIPES.practiceblade))award(key,n);craft('practiceblade')");assert.equal(h.run('s.gear.at(-1).tier'),5);
 h.run("boss=true;bossId=4;bossTier='mystic';bossLeft=60;spawn();damage(1e12)");const count=h.run('s.gear.length');assert.ok(h.run('s.battleReward.rows.filter(x=>x.gear).every(x=>x.gear.tier===8)'));
 h.run('save()');const restored=harness(JSON.parse(h.stored['mosslight.save.v1']));assert.equal(restored.run('s.gear.length'),count);restored.run('finishBattleReward();finishBattleReward()');assert.equal(restored.run('s.gear.length'),count);
});
