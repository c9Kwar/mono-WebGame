const test=require('node:test'),assert=require('node:assert/strict'),{harness}=require('./harness.cjs');
const base={v:1,lastSeen:Date.now(),total:100,highestStage:999,stage:21,gearVersion:1,gold:1e9};
const plain=x=>JSON.parse(JSON.stringify(x));

test('Chapter 1 caps every new rarity at T3 while leaving rarity and potential line rules separate',()=>{
 const h=harness(base);
 for(const [key,rarity,lines] of [['trousers','rare',1],['mossblade','epic',2],['sunblade','legendary',3],['royalblade','mythic',4]]){
  for(const requested of [1,2,3,4,5,6,7,8,99]){
   const g=plain(h.run(`award('${key}',1,()=>.5,'cap regression',${requested})`));
   assert.equal(g.tier,Math.min(3,requested));assert.equal(g.potentials.length,lines);assert.equal(h.run(`ITEMS['${key}'].rarity`),rarity);
  }
 }
 assert.equal(h.run("makeGear('mossblade',()=>.5,false,1,8).tier"),3);
 for(const [stage,tier] of [[1,1],[5,1],[6,2],[10,2],[11,3],[21,3],[999,3]])assert.equal(h.run(`fieldGearTier(${stage})`),tier);
});

test('all elite and treasure drops use the stage tier and every crafting recipe uses the highest-stage tier',()=>{
 for(const [stage,tier] of [[1,1],[6,2],[11,3],[999,3]]){
  const h=harness({...base,stage,highestStage:stage});
  const sources=plain(h.run("Object.keys(MOBS).filter(k=>MOBS[k].elite||k==='treasure')"));
  for(const source of sources){
   h.run(`s.gear=[];currentMob='${source}';rollLoot(false,0,()=>0)`);
   assert.equal(h.run('s.gear.length'),h.run(`MOBS['${source}'].drops.filter(([key])=>ITEMS[key].slot).length`),source);assert.ok(h.run(`s.gear.every(g=>g.tier===${tier})`),source+' stage '+stage);
  }
  const recipes=plain(h.run('Object.keys(RECIPES)'));
  for(const key of recipes){
   h.run(`for(const [material,n] of Object.entries(RECIPES['${key}']))award(material,n);if(ITEMS['bp_${key}'])award('bp_${key}');s.stage=1`);
   assert.equal(h.run(`craft('${key}')`),true,key);assert.equal(h.run('s.gear.at(-1).tier'),tier,key+' stage '+stage);
  }
 }
});

test('every boss first-clear and variant reward respects T1–T3 including mythic rarity drops',()=>{
 for(let id=0;id<5;id++)for(const [variant,bonus]of [['normal',0],['elite',1],['mystic',2]]){
  const h=harness(base),expected=Math.min(3,id+1+bonus);
  h.run(`Math.random=()=>0;boss=true;bossId=${id};bossTier='${variant}';bossLeft=60;spawn();damage(1e12)`);
  assert.equal(h.run(`s.bossWins[${id}]`),1);assert.equal(h.run('s.battleReward.firstClear'),true);
  const rewards=plain(h.run('s.battleReward.rows.filter(r=>r.gear)'));
  assert.ok(rewards.length>1);assert.ok(rewards.every(r=>r.gear.tier===expected),id+' '+variant);
  if(variant==='mystic')assert.ok(h.run("s.gear.some(g=>ITEMS[g.key].rarity==='mythic')"));
 }
});

test('milestone equipment follows its target stage, not claim time, and cannot be claimed twice',()=>{
 for(const [target,tier]of [[6,2],[11,3],[21,3],[51,3],[991,3]])for(const roll of [0,.05,.3]){
  const h=harness(base);assert.equal(h.run(`claimMilestone(${target},()=>${roll})`),true);
  assert.equal(h.run('s.gear.length'),1);assert.equal(h.run('s.gear[0].tier'),tier);
  assert.equal(h.run(`claimMilestone(${target},()=>${roll})`),false);assert.equal(h.run('s.gear.length'),1);
 }
});

test('saved T4–T8 gear and reward snapshots survive reload and potential reroll at their original tier',()=>{
 const template=harness(base);
 const gear=[4,5,6,7,8].map(tier=>({id:'g'+tier,key:'guardiancoat',tier,roll:17,exceptional:true,locked:true,quantity:2,ward:.02,potentialVersion:2,potentials:plain(template.run(`rollPotentials('guardiancoat',()=>.999,${tier})`))}));
 const battleReward={id:'legacy-receipt',kind:'boss',tier:'mystic',name:'밤톨',gold:432000,seconds:35,bossId:4,firstClear:false,rows:gear.map(g=>({key:g.key,count:2,gear:{...g}}))};
 const saved={...base,gear,slots:{chest:'g8'},inventory:{guardiancoat:10,stone_legendary:10,crystal:100,dust:30},battleReward,rewardPending:true};
 const h=harness(saved);assert.deepEqual(plain(h.run('s.gear')),gear);assert.deepEqual(plain(h.run('s.battleReward')),battleReward);
 assert.ok(Math.abs(h.run('gearStat("chest","hp")')-350*2.4*1.255)<1e-9);
 h.run('save()');const restored=harness(JSON.parse(h.stored['mosslight.save.v1']));assert.deepEqual(plain(restored.run('s.gear')),gear);assert.deepEqual(plain(restored.run('s.battleReward')),battleReward);
 restored.run('finishBattleReward();finishBattleReward()');assert.equal(restored.run('s.gear.length'),5);
 const expected=plain(restored.run("rollPotentials('guardiancoat',()=>.999,8)"));
 assert.equal(restored.run("rerollPotential('g8',()=>.999)"),true);
 assert.equal(restored.run("equippedGear('chest').tier"),8);assert.deepEqual(plain(restored.run("equippedGear('chest').potentials")),expected);
 assert.equal(restored.run("s.gear.find(g=>g.id==='g8').quantity"),1);assert.equal(restored.run('s.gear.length'),6);
 restored.run('save()');const rerolled=harness(JSON.parse(restored.stored['mosslight.save.v1']));assert.equal(rerolled.run("equippedGear('chest').tier"),8);assert.deepEqual(plain(rerolled.run("equippedGear('chest').potentials")),expected);
});
