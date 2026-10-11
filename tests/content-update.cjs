const {harness,assert}=require('./harness.cjs');
const base={v:1,lastSeen:Date.now(),total:100,highestStage:25,stage:6};
let h=harness(base),r=h.run;
// Exact grade sums and RNG boundaries, no drop-luck influence on draws.
assert.deepEqual(JSON.parse(r('JSON.stringify(Object.values(PASSIVES).reduce((a,p)=>(a[p.rarity]=(a[p.rarity]||0)+p.weight,a),{}))')),{common:70,rare:20,epic:8,legendary:1.8,mythic:.2});
for(const [roll,key] of [[0,'light'],[.699999,'light'],[.7,'guard'],[.799999,'guard'],[.8,'heal'],[.899999,'heal'],[.9,'haste'],[.979999,'haste'],[.98,'leech'],[.997999,'leech'],[.998,'echo'],[.999999,'echo']]){
 const a=harness(base);a.run('s.inventory.skillstone=3');assert.equal(a.run(`drawPassive(()=>${roll})`),key);assert.equal(a.run('s.inventory.skillstone'),0);assert.equal(a.run(`s.passives.${key}`),1);
}
r('s.inventory.skillstone=3;s.passives.light=1;drawPassive(()=>.69)');assert.equal(r('s.passives.light'),2);
r('s.inventory.skillstone=3;s.passives.light=4;drawPassive(()=>.69)');assert.equal(r('s.passives.light'),4);assert.equal(r('s.inventory.skillstone'),1);
// Special pool uses jade only, max 3, one active, bounded combat impact.
assert.equal(r('drawSpecial(()=>0)'),false);
for(const [roll,key] of [[0,'foxluck'],[.6,'foxward'],[.9,'foxspirit']]){r('s.inventory.jadeorb=1');assert.equal(r(`drawSpecial(()=>${roll})`),key);assert.equal(r('s.inventory.jadeorb'),0)}
assert.equal(r('s.specialActive'),'foxluck');r('s.specialPassives={foxluck:3,foxward:3,foxspirit:3};s.specialActive="foxluck"');assert.equal(r('specialPower("foxluck")'),1.3);assert.equal(r('specialPower("foxspirit")'),0);
r('s.specialActive="foxward"');assert(Math.abs(r('bossMitigation()')-.026)<1e-8);r('s.specialActive="foxspirit"');assert.equal(r('bossMitigation()'),0);
r('s.inventory.jadeorb=1;var stonesBefore=s.inventory.skillstone||0;drawSpecial(()=>.99)');assert.equal(r('s.specialPassives.foxspirit'),3);assert.equal(r('s.inventory.skillstone'),r('stonesBefore+1'));
// Currency and blueprint sources cannot leak to normal mobs or other boss tables.
assert.equal(r('Object.values(MOBS).filter(m=>m.drops.some(x=>x[0]==="jadeorb")).length'),1);assert.equal(r('BOSS_TABLES.flat().some(x=>x[0]==="jadeorb")'),false);
for(const [index,key] of ['shellcoat','runelegs','groveblade','moonboots','acorncoat'].entries()){
 assert.equal(r(`BOSS_TABLES.filter(t=>t.some(x=>x[0]==='bp_${key}')).length`),1);assert(r(`BOSS_TABLES[${index}].some(x=>x[0]==='bp_${key}')`));
}
assert.equal(r('Object.values(MOBS).filter(m=>m.drops.some(x=>x[0]==="bp_foxring")).length'),1);
assert.equal(r('itemDropChance("jadeorb",1,false)'),.25);assert.equal(r('itemDropChance("bp_shellcoat",.03,true,"mystic")'),.25);
// Permanent blueprint unlock, recipe consumes exact materials and gold, duplicate converts honestly.
h=harness({...base,gold:999999});r=h.run;
r('for(const [k,n] of Object.entries(RECIPES.shellcoat))award(k,n*2)');assert.equal(r('canCraft("shellcoat")'),false);assert.equal(r('craft("shellcoat")'),false);
r('award("bp_shellcoat");var priorGold=s.gold');assert.equal(r('canCraft("shellcoat")'),true);assert.equal(r('craft("shellcoat")'),true);assert.equal(r('s.gold'),r('priorGold-CRAFT_GOLD.shellcoat'));assert.equal(r('s.inventory.bp_shellcoat'),1);assert.equal(r('craft("shellcoat")'),true);assert.equal(r('s.inventory.bp_shellcoat'),1);assert.equal(r('canCraft("shellcoat")'),false);
r('var oldDust=s.inventory.dust||0;rollLoot(true,0,()=>0)');assert.equal(r('s.inventory.bp_shellcoat'),1);assert.equal(r('s.inventory.dust'),r('oldDust+3'));
assert.equal(r('s.fieldNotes.target'),'shellcoat');assert(r('sourceText("bp_shellcoat").includes("꼬마 거북")'));assert.equal(r('pinRecipe("invalid")'),false);
r('save()');const migrated=harness(JSON.parse(h.stored['mosslight.save.v1']));assert.equal(migrated.run('known("bp_shellcoat")'),true);assert.equal(migrated.run('s.fieldNotes.target'),'shellcoat');assert(migrated.run('s.fieldNotes.finds.length<=12'));
// Every new mob is reachable and has valid tables, recipes and artwork references.
assert.equal(r('BOSSES.length'),5);assert.equal(r('Object.keys(MOBS).length'),11);assert.equal(r('s.bossWins.length'),5);assert.equal(r('s.bossReadyAt.length'),5);
r('s.stage=1');assert.equal(r('chooseMob(()=>.99)'),'snail');r('s.stage=6');assert.equal(r('chooseMob(()=>.99)'),'rabbit');
assert(r('Object.values(MOBS).every(m=>m.drops.every(([k])=>ITEMS[k]))'));assert(r('BOSS_TABLES.every(t=>t.every(([k])=>ITEMS[k]))'));assert(r('Object.entries(RECIPES).every(([k,v])=>ITEMS[k].slot&&CRAFT_GOLD[k]>0&&Object.keys(v).every(x=>ITEMS[x]))'));
// Both added bosses support selection, kill rewards, cooldown and save/reload.
for(const id of [3,4]){
 const a=harness({...base,highestStage:25});assert(a.run(`startBoss(${id},()=>.9)`));assert(a.run(`s.bossReadyAt[${id}]>Date.now()`));a.run('damage(1e12)');assert.equal(a.run('phase'),'victory');assert.equal(a.run(`s.bossWins[${id}]`),1);assert(a.run(`s.fieldNotes.bosses['${id}_normal'].wins===1`));
 const gold=a.run('s.gold');a.run('finishBattleReward();finishBattleReward()');assert.equal(a.run('s.gold'),gold);
 const b=harness(JSON.parse(a.stored['mosslight.save.v1']));assert.equal(b.run(`s.bossWins[${id}]`),1);assert.equal(b.run(`s.bossReadyAt[${id}]`),a.run(`s.bossReadyAt[${id}]`));
}
// Legacy saves keep their levels and three boss entries; additive extension has no reroll.
const legacy=harness({...base,passives:{light:5,echo:3},bossWins:[4,2,1],bossReadyAt:[10,20,30]});assert.equal(legacy.run('s.passives.light'),5);assert.equal(legacy.run('s.passives.echo'),3);assert.deepEqual(JSON.parse(legacy.run('JSON.stringify(s.bossWins)')),[4,2,1,0,0]);
const d=harness(base);d.run('award("snailshell")');assert(Math.abs(d.run('discoveryAttack()')-.002)<1e-8);d.run('award("moss")');assert(Math.abs(d.run('discoveryAttack()')-.012)<1e-8);
console.log('PASS exact passive grades/boundaries; special costs/one-active/caps; exclusive loot and capped rates; permanent blueprint recipes/duplicate conversion; 5 bosses/11 mobs; additive saves; collection budget and field notes');
