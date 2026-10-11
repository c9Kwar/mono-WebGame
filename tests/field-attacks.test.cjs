'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{harness}=require('./harness.cjs');
function ready(mob='slime'){
 const h=harness({v:1,lastSeen:Date.now(),stage:8,total:100,highestStage:8,vitality:40,guard:20});
 h.run(`s.paused=false;boss=false;currentMob='${mob}';phase='combat';s.heroHp=100000;hp=maxHp=100000;encounterSerial++;render();clearCombatEffects();var pendingTimers=new Map(),nextTimer=0;setTimeout=(fn,ms)=>{const id=++nextTimer;pendingTimers.set(id,{fn,ms});return id};clearTimeout=id=>pendingTimers.delete(id)`);
 return h;
}

test('ordinary species use distinct named attacks without an added hit or status effect',()=>{
 const ids=new Set();
 for(const mob of ['slime','mushroom','snail','moth','rabbit','eliteRabbit']){
  const h=ready(mob),skill=h.run('enemySkill()'),before=h.run('s.heroHp'),damage=h.run('incomingDamage()');
  assert.equal(skill.field,true);ids.add(skill.id);
  assert.ok(h.nodes.get('enemy-intent-text').textContent.includes(skill.name));
  assert.equal(h.nodes.get('boss-pattern').hidden,mob!=='eliteRabbit');
  h.run('Math.random=()=>{throw Error("presentation consumed gameplay RNG")};monsterHit(()=>.99)');
  assert.equal(before-h.run('s.heroHp'),damage);
  const burst=h.nodes.get('combat-fx').children.find(n=>n.className.includes('skill-'+skill.id));
  assert.ok(burst);assert.ok(burst.children.length<=13);
  const parts=burst.children.map(n=>n.className);
  assert.equal(parts.includes('field-mote'),mob==='slime','Only acid uses flying droplets');
  const unique={eliteRabbit:'field-claw-mark',rabbit:'field-claw-mark',mushroom:'field-cloud',snail:'field-tether',moth:'field-gust',slime:'field-mote'};
  assert.ok(parts.includes(unique[mob]));
  assert.ok(h.nodes.get('last-impact').textContent.includes(skill.name));
 }
 assert.equal(ids.size,5);
});

test('painted attacks are deterministic, share the five-burst budget and fully clean up',()=>{
 const h=ready('mushroom'),before=h.run('JSON.stringify(s)');
 h.run('Math.random=()=>{throw Error("cosmetic RNG")};for(let i=0;i<100;i++)emitFieldAttack(FIELD_SKILLS.mushroom)');
 assert.equal(h.nodes.get('combat-fx').children.length,5);
 assert.equal(h.run('combatFxTimers.size'),5);assert.equal(h.run('pendingTimers.size'),5);
 assert.equal(h.run('JSON.stringify(s)'),before);
 h.run('clearCombatEffects()');assert.equal(h.nodes.get('combat-fx').children.length,0);assert.equal(h.run('pendingTimers.size'),0);
});

test('field attack geometry follows actual actor rectangles and SVG meet alignment',()=>{
 for(const width of [390,800,1440]){
  const h=ready('slime');
  h.run(`$('combat-fx').getBoundingClientRect=()=>({left:20,top:70,width:${width},height:420});$('painted-enemy').getBoundingClientRect=()=>({left:20+${width}*.65,top:200,width:140,height:140});$('arena').querySelector=selector=>selector==='.hero-rig'?{getScreenCTM:()=>({a:.1,b:0,c:0,d:.1,e:20+${width}*.09,f:230})}:{getBoundingClientRect:()=>({left:20+${width}*.06,top:220,width:180,height:180})}`);
  const g=h.run('fieldAttackGeometry(FIELD_SKILLS.slime)');
  assert.equal(g.source.x,Math.round(width*.65+35));
  assert.equal(g.target.x,Math.round(width*.09+63.5));assert.equal(g.target.y,221);
  assert.ok(g.source.x>g.target.x&&g.source.x<width);
  h.run('emitFieldAttack(FIELD_SKILLS.slime)');
  const burst=h.nodes.get('combat-fx').children.at(-1);
  assert.ok(burst.style.cssText.includes('--target-x:'+g.target.x+'px'));
  for(const mote of burst.children.filter(n=>n.className==='field-mote'))assert.ok(mote.style.cssText.includes('offset-path:path("M '+g.source.x+' '+g.source.y+' Q '));
 }
});

test('reduced motion, lightweight mode, pause and hidden page keep cues but suppress effects',()=>{
 for(const setup of ['s.effectsLite=true','window.matchMedia=()=>({matches:true})','s.paused=true','document.hidden=true']){
  const h=ready('snail');h.run(setup);
  assert.equal(h.run('emitFieldAttack(FIELD_SKILLS.snail)'),false);
  assert.equal(h.nodes.get('combat-fx').children.length,0);
  assert.ok(h.nodes.get('enemy-intent-text').textContent.includes('이슬 점액 채찍'));
 }
 const h=ready('rabbit');h.run('emitFieldAttack(FIELD_SKILLS.rabbit);phase="travel";renderEncounter()');
 assert.equal(h.nodes.get('combat-fx').children.length,0);assert.equal(h.run('pendingTimers.size'),0);
});

 test('rabbit dodge suppresses contact marks and never loses health',()=>{
 const h=ready('rabbit');h.run('dodgeChance=()=>1');const before=h.run('s.heroHp');
 h.run('monsterHit(()=>0)');assert.equal(h.run('s.heroHp'),before);
 const burst=h.nodes.get('combat-fx').children.find(n=>n.className.includes('field-attack'));
 assert.ok(burst.className.includes('field-dodged'));
 assert.equal(burst.children.filter(n=>n.className==='field-claw-mark').length,3);
 assert.ok(h.nodes.get('last-impact').textContent.includes('받은 피해 0'));
 });
