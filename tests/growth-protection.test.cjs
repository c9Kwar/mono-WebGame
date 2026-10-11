const test=require('node:test'),assert=require('node:assert/strict'),{harness}=require('./harness.cjs');
const base={v:1,lastSeen:Date.now(),total:100,highestStage:25,stage:6,attack:35,vitality:30,guard:30,speed:15};
test('each boss blueprint is guaranteed on the sixtieth dry eligible kill',()=>{
 for(const [id,key] of ['bp_shellcoat','bp_runelegs','bp_groveblade','bp_moonboots','bp_acorncoat'].entries()){
  const h=harness(base);h.run('bossTier="normal";log=()=>{};notify=()=>{}');
  for(let i=0;i<59;i++)h.run(`rollLoot(true,${id},()=>.999999)`);
  assert.equal(h.run(`known('${key}')`),false);assert.equal(h.run(`s.blueprintMisses.${key}`),59);
  h.run(`rollLoot(true,${id},()=>.999999)`);assert.equal(h.run(`s.inventory.${key}`),1);assert.equal(h.run(`s.blueprintMisses.${key}`),0);
 }
});
test('normal kills cannot progress a boss blueprint guarantee',()=>{const h=harness(base);h.run('s.blueprintMisses.bp_shellcoat=59;currentMob="slime";rollLoot(false,0,()=>.99999)');assert.equal(h.run('known("bp_shellcoat")'),false);assert.equal(h.run('s.blueprintMisses.bp_shellcoat'),59);});
test('blueprint progress survives reload and never re-awards an unlocked guarantee',()=>{const h=harness({...base,blueprintMisses:{bp_shellcoat:59}});h.run('rollLoot(true,0,()=>.99999);save()');const r=harness(JSON.parse(h.stored['mosslight.save.v1']));assert.equal(r.run('known("bp_shellcoat")'),true);r.run('rollLoot(true,0,()=>.99999)');assert.equal(r.run('s.inventory.bp_shellcoat'),1);});
test('natural discovery resets dry progress; duplicate conversion stays unchanged',()=>{const h=harness({...base,blueprintMisses:{bp_shellcoat:22}});h.run('rollLoot(true,0,()=>0)');assert.equal(h.run('s.blueprintMisses.bp_shellcoat'),0);const dust=h.run('s.inventory.dust||0');h.run('rollLoot(true,0,()=>0)');assert.equal(h.run('s.inventory.dust'),dust+3);});
test('automatic protection activates only after three normal defeats and is persisted',()=>{const h=harness(base);for(let i=0;i<3;i++)h.run('boss=false;currentMob="slime";s.heroHp=1;phase="combat";defeatHero()');assert.equal(h.run('s.farmMode'),true);assert.equal(h.run('s.safetyDefeats'),3);const r=harness(JSON.parse(h.stored['mosslight.save.v1']));assert.equal(r.run('s.farmMode'),true);});
test('boss defeats and opted-out saves do not force farm mode',()=>{for(const raw of [base,{...base,autoSafety:false}]){const h=harness(raw);for(let i=0;i<3;i++)h.run(raw.autoSafety===false?'boss=false;currentMob="slime";phase="combat";defeatHero()':'boss=true;phase="combat";defeatHero()');assert.equal(h.run('s.farmMode'),false);}});
test('ordinary wins retain frontier defeat protection; a new stage record clears it',()=>{const h=harness({...base,safetyDefeats:2});h.run('boss=false;currentMob="slime";phase="combat";hp=1;damage(1e12)');assert.equal(h.run('s.safetyDefeats'),2);h.run('s.stage=s.highestStage;finishFieldStage()');assert.equal(h.run('s.safetyDefeats'),0);});

test('normal expeditions opt out of variant lottery with the same entry checks',()=>{const h=harness(base);assert.equal(h.run('startBoss(0,()=>0,true)'),true);assert.equal(h.run('bossTier'),'normal');assert.equal(h.run('bossLeft'),60);assert.equal(h.run('startBoss(0,()=>0,true)'),false);});
test('original lottery expeditions still retain mystic and elite rewards',()=>{const h=harness(base);assert.equal(h.run('startBoss(0,()=>0)'),true);assert.equal(h.run('bossTier'),'mystic');assert.equal(h.run('bossLeft'),120);});
