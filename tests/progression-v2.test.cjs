const test=require('node:test'),assert=require('node:assert/strict'),{harness}=require('./harness.cjs');
const base={v:1,lastSeen:Date.now(),total:100,highestStage:25,stage:6};
const plain=x=>JSON.parse(JSON.stringify(x));
test('all new and rerolled rarities have exact line counts with higher-tier values and rare high grades',()=>{
 const h=harness(base);for(const [key,count]of [['practiceblade',1],['mossblade',2],['sunblade',3],['royalblade',4]])for(const tier of [1,4,8])for(const roll of [0,.5,.8,.97,.998,.99999]){
  const gear=h.run(`makeGear('${key}',()=>${roll},false,1,${tier})`);assert.equal(gear.potentials.length,count);assert.equal(new Set(gear.potentials.map(x=>x.type)).size,count);assert.equal(h.run('validPotentials(s.gear.at(-1))!==null'),true);
 }
 h.run("var low=rollPotentials('practiceblade',()=>.5,1),high=rollPotentials('practiceblade',()=>.5,8)");assert.ok(h.run('high[0].value>low[0].value'));
 h.run("var g=award('practiceblade');s.gold=1000;s.inventory.stone_rare=1;s.inventory.crystal=2;rerollPotential(g.id,()=>.5)");assert.equal(h.run('g.potentials.length'),1);assert.equal(h.run('s.gold'),820);
});
test('legacy potential values and old 5-line mythics survive without silent rerolls',()=>{
 const h=harness(base);h.run("var g=award('royalblade');delete g.potentialVersion;g.potentials=[{type:'atkFlat',grade:0,value:1},{type:'atkPct',grade:0,value:.01},{type:'speedFlat',grade:0,value:.01},{type:'critical',grade:0,value:.005},{type:'trinket',grade:0,value:1}];save()");
 const before=plain(h.run('g.potentials')),restored=harness(JSON.parse(h.stored['mosslight.save.v1']));assert.deepEqual(plain(restored.run('s.gear[0].potentials')),before);
});
test('potential comparison exposes gained, lost and matching options; amplification adds rather than compounds',()=>{
 const h=harness(base);h.run("var a=award('mossblade'),b=award('mossblade');a.potentials=[{type:'atkFlat',grade:0,value:10},{type:'critical',grade:0,value:.01}];b.potentials=[{type:'atkFlat',grade:2,value:50},{type:'speedPct',grade:1,value:.03}];s.slots.weapon=a.id;openPotential(b.id)");
 const text=h.nodes.get('potential-comparison').children.map(n=>n.textContent).join('\n');assert.match(text,/10 → 선택 50 \(\+40\)/);assert.match(text,/현재 1% → 선택 0% \(−1%\)/);assert.match(text,/현재 0% → 선택 3%/);
 h.run("s.slots.weapon=a.id;var r=award('ring');s.slots.ring=r.id;a.potentials=[{type:'goldMore',grade:1,value:.2}];r.potentials=[{type:'goldMore',grade:1,value:.3}]");assert.equal(h.run("potentialProduct('goldMore')"),1.5);
});
test('ordinary mobs never award equipment even at maximum luck, while elites/fox retain equipment',()=>{
 const h=harness(base);assert.equal(h.run("Object.entries(MOBS).filter(([k,m])=>!m.elite&&k!=='treasure').every(([k,m])=>m.drops.every(([key])=>!ITEMS[key].slot))"),true);
 h.run("for(const [key,mob]of Object.entries(MOBS))if(!mob.elite&&key!=='treasure'){currentMob=key;rollLoot(false,0,()=>0)}");assert.equal(h.run('s.gear.length'),0);h.run("currentMob='eliteSlime';rollLoot(false,0,()=>0);currentMob='treasure';rollLoot(false,0,()=>0)");assert.ok(h.run('s.gear.length')>0);
});
test('exploration migration preserves percentage and completion gives capped permanent growth and supplies',()=>{
 const h=harness({...base,trails:{points:45,seconds:150,laps:2,relics:[0]}});assert.equal(h.run('s.trails.points'),75);assert.equal(h.run('s.trails.seconds'),750);
 h.run('save()');const r=harness(JSON.parse(h.stored['mosslight.save.v1']));assert.equal(r.run('s.trails.seconds'),750);
 h.run('s.trails.points=150;s.trails.seconds=1500;s.trails.step=0;resolveTrail(()=>.99)');assert.equal(h.run('s.trails.laps'),3);assert.equal(h.run('s.inventory.skillstone'),1);assert.equal(h.run('s.inventory.seal'),2);assert.equal(h.run('s.trails.seconds'),0);
 h.run('s.trails.laps=999;s.trails.relics=[0,1,2,3,4,5,6,7,8]');assert.ok(Math.abs(h.run('trailBonus()')-.15)<1e-10);assert.ok(h.run('trailPace()')<=1.15);
 h.run('s.paused=true');const before=h.run('s.trails.seconds');h.run('tick(1)');assert.equal(h.run('s.trails.seconds'),before);
});
test('travel grows with stage and benefits from movement without zero-time travel; set rewards at least 3%',()=>{
 const h=harness(base);h.run('s.stage=1;s.move=0');const early=h.run('travelSeconds()');h.run('s.stage=31');const slow=h.run('travelSeconds()');h.run('s.move=30');const fast=h.run('travelSeconds()');assert.ok(slow>early*3&&fast<slow&&fast>1.2);assert.equal(h.run('COLLECTION_SETS.every(x=>Object.values(x.bonuses).every(v=>v>=.03))'),true);
 assert.ok(h.run('bossHealth(1)/bossHealth(0)')>=7);assert.ok(h.run('bossHealth(2)/bossHealth(1)')>=6);
});
test('reset requires exact confirmation, preserves backup and refuses cross-tab overwrite',()=>{
 const h=harness({...base,gold:98765});h.run("window.location={reload(){}};$('reset-input').value='wrong'");const original=h.stored['mosslight.save.v1'];assert.equal(h.run('resetProgress()'),false);assert.equal(h.stored['mosslight.save.v1'],original);
 h.run("$('reset-input').value='초기화'");assert.equal(h.run('resetProgress()'),true);assert.equal(h.stored['mosslight.save.v1.backup'],original);const reset=JSON.parse(h.stored['mosslight.save.v1']);assert.equal(reset.stage,1);assert.equal(reset.gold,50);assert.equal(reset.gear.length,0);assert.equal(reset.total,0);
 const stale=harness(base);stale.stored['mosslight.save.v1']='other-tab';stale.run("$('reset-input').value='초기화'");assert.equal(stale.run('resetProgress()'),false);assert.equal(stale.stored['mosslight.save.v1'],'other-tab');
});
