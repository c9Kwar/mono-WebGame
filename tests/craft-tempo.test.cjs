const test=require('node:test'),assert=require('node:assert/strict'),{harness}=require('./harness.cjs');
const base={v:1,lastSeen:Date.now(),paused:true,gold:1000,inventory:{moss:20,spore:10}};
test('ready-only default filters by materials, gold and permanent blueprint unlock and refreshes after crafting',()=>{
 const h=harness(base);
 assert.equal(h.nodes.get('craft-ready-only').checked,true);
 assert.equal(h.nodes.get('recipe-card-practiceblade').hidden,false);
 assert.equal(h.nodes.get('recipe-card-shellcoat').hidden,true);
 h.run('craft("practiceblade")');assert.equal(h.nodes.get('recipe-card-practiceblade').hidden,true);
 assert.equal(h.nodes.get('craft-empty').hidden,false);
 h.run('s.gold=12000;for(const [key,n] of Object.entries(RECIPES.shellcoat))s.inventory[key]=n;render()');
 assert.equal(h.nodes.get('recipe-card-shellcoat').hidden,true);
 h.run('award("bp_shellcoat");render()');assert.equal(h.nodes.get('recipe-card-shellcoat').hidden,false);
 h.run('s.gold=11999;render()');assert.equal(h.nodes.get('recipe-card-shellcoat').hidden,true);
 h.run('craftReadyOnly=false;setCraftFilter("armor")');assert.equal(h.nodes.get('recipe-card-shellcoat').hidden,false);
 assert.equal(h.nodes.get('recipe-card-practiceblade').hidden,true);
});
test('material completion is explicit even when gold is missing; inspection never spends items',()=>{
 const h=harness({...base,gold:179});const before=h.run('JSON.stringify([s.gold,s.inventory])');
 h.run('craftReadyOnly=false;renderCrafting();showCraftTip("practiceblade",$("recipe-info-practiceblade"))');
 assert.ok(h.nodes.get('craft-tip-materials').children.every(n=>n.textContent.includes('✓ 준비 완료')));
 assert.match(h.nodes.get('craft-tip-status').textContent,/재료 모두 수집 완료.*골드 부족/);
 assert.match(h.nodes.get('craft-tip-gold').textContent,/부족 1/);
 assert.equal(h.run('JSON.stringify([s.gold,s.inventory])'),before);
 h.run('s.inventory.moss=19;render()');assert.match(h.nodes.get('craft-tip-materials').children[0].textContent,/부족 1/);
 h.run('s.inventory.moss=20;s.gold=180;render()');assert.match(h.nodes.get('craft-tip-status').textContent,/모든 준비 완료/);
});
function battle(mob='moth',speed=0){const h=harness({...base,paused:false,speed,vitality:20});h.run(`boss=false;phase='combat';currentMob='${mob}';hp=maxHp=1e8;attackClock=enemyClock=0;s.heroHp=heroMaxHp();Math.random=()=>.99;render=()=>{}`);return h;}
test('first strikes depend on species cadence and hero training, not a guaranteed hero initiative',()=>{
 for(const mob of ['moth','rabbit','eliteMoth','eliteRabbit','treasure']){
  const h=battle(mob),before=h.run('s.heroHp');h.run('stepCombat(MOBS[currentMob].interval)');
  assert.ok(h.run('s.heroHp')<before,mob);assert.equal(h.run('hp'),1e8,mob);
 }
 for(const mob of ['slime','mushroom','snail','eliteSlime','eliteMushroom','eliteSnail']){
  const h=battle(mob),before=h.run('s.heroHp');h.run('stepCombat(1)');assert.equal(h.run('s.heroHp'),before,mob);assert.ok(h.run('hp')<1e8,mob);
 }
 const trained=battle('moth',30),before=trained.run('s.heroHp');trained.run('stepCombat(1/speed())');assert.equal(trained.run('s.heroHp'),before);assert.ok(trained.run('hp')<1e8);
});
test('simultaneously due attacks resolve chronologically, including lethal attacks and exact ties',()=>{
 const early=battle();early.run('s.heroHp=1;hp=1;stepCombat(1.1)');assert.equal(early.run('phase'),'defeated');assert.equal(early.run('s.total'),0);
 const hero=battle();hero.run('s.heroHp=1;hp=1;attackClock=.25;stepCombat(.9)');assert.equal(hero.run('phase'),'loot');assert.equal(hero.run('s.deaths'),0);
 const tied=battle();tied.run('s.heroHp=1;hp=1;attackClock=.15;stepCombat(.85)');assert.equal(tied.run('phase'),'defeated');
});
test('attack ordering is stable across tick sizes; paused and resumed fights keep their clocks',()=>{
 const one=battle(),split=battle();for(const h of [one,split])h.run('var order=[];damage=()=>order.push("hero");monsterHit=()=>order.push("enemy")');
 one.run('stepCombat(3.4)');split.run('for(let i=0;i<34;i++)stepCombat(.1)');assert.equal(one.run('JSON.stringify(order)'),split.run('JSON.stringify(order)'));
 const h=battle();h.run('stepCombat(.4);s.paused=true;save()');const state=h.run('JSON.stringify([hp,s.heroHp,attackClock,enemyClock])');h.run('stepCombat(10)');assert.equal(h.run('JSON.stringify([hp,s.heroHp,attackClock,enemyClock])'),state);
 const resumed=harness(JSON.parse(h.stored['mosslight.save.v1']));assert.equal(resumed.run('attackClock'),.4);assert.equal(resumed.run('enemyClock'),.4);
 resumed.run('s.paused=false;Math.random=()=>.99;stepCombat(.45)');assert.equal(resumed.run('hp'),1e8);assert.ok(resumed.run('s.heroHp')<h.run('s.heroHp'));
});
test('all species have distinct intended speed/weight traits and bounded relative damage pressure',()=>{
 const h=battle();for(const key of h.run('Object.keys(MOBS)')){
  const m=h.run(`MOBS['${key}']`);assert.ok(m.tempo&&m.interval>=.7&&m.interval<=3.2);
  const oldAtk=m.elite?2.8:key==='treasure'?3.5:key==='moth'?1.3:['rabbit','mushroom'].includes(key)?1.15:key==='snail'?1.1:1;
  const oldInterval=m.elite?2:key==='treasure'?1.5:2.6;
  assert.ok((m.atk/m.interval)/(oldAtk/oldInterval)<1.7,key+' damage pressure');
 }
});
