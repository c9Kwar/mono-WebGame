'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{harness}=require('./harness.cjs');
function ready(){
 const h=harness({v:1,lastSeen:Date.now(),total:100,stage:6,vitality:70});
 h.run("s.paused=false;s.effectsLite=false;boss=false;currentMob='slime';phase='combat';s.heroHp=heroMaxHp();hp=maxHp=100000;encounterSerial++;render();clearCombatEffects();var pendingTimers=new Map(),timerID=0;setTimeout=(fn,ms)=>{const id=++timerID;pendingTimers.set(id,{fn,ms});return id};clearTimeout=id=>pendingTimers.delete(id)");
 return h;
}
const contacts=h=>h.nodes.get('impact-layer').children;
test('contact presentation cannot consume combat RNG, modify health, rewards or clocks',()=>{
 const h=ready(),before=h.run('JSON.stringify([s,hp,attackClock,enemyClock])');
 h.run('Math.random=()=>{throw Error("cosmetic RNG")};for(const kind of Object.keys(CONTACT_FEEDBACK.duration))paintContactFeedback(kind,27)');
 assert.equal(h.run('JSON.stringify([s,hp,attackClock,enemyClock])'),before);
 assert.ok(contacts(h).some(n=>n.className.includes('feedback-guard')));
 assert.ok(contacts(h).some(n=>n.className.includes('feedback-dodge')));
});
test('confirmed guard remains a damaging block; confirmed dodge shows zero without an impact hit',()=>{
 const h=ready();h.run('s.passiveBuffs.guard=5;dodgeChance=()=>0');
 const before=h.run('s.heroHp'),expected=h.run('incomingDamage()');h.run('monsterHit(()=>.99)');
 assert.equal(before-h.run('s.heroHp'),expected);
 assert.equal(contacts(h).at(-1).contactFeedback.kind,'guard');
 h.run('clearCombatEffects();dodgeChance=()=>1');const guarded=h.run('s.heroHp');h.run('monsterHit(()=>0)');
 assert.equal(h.run('s.heroHp'),guarded);assert.equal(contacts(h).length,1);
 assert.equal(contacts(h)[0].contactFeedback.kind,'dodge');
 const number=contacts(h)[0].children.at(-1);
 assert.equal(number.children[1].textContent,'0');
});
test('burst spam preserves at most three readable numbers and one silhouette per side',()=>{
 const h=ready();h.run("for(let i=0;i<100;i++){paintContactFeedback(i===0?'critical':'slash',10);paintContactFeedback('hurt',5)}");
 assert.equal(contacts(h).length,6);assert.equal(h.run('impactTimers.size'),6);assert.equal(h.run('pendingTimers.size'),6);
 for(const side of ['hero','enemy'])assert.equal(contacts(h).filter(n=>n.contactFeedback.side===side&&n.contactFeedback.parts.length).length,1);
 // A weaker chain hit does not erase the just-confirmed critical cut.
 assert.ok(contacts(h).some(n=>n.contactFeedback.kind==='critical'&&n.contactFeedback.parts.length));
 h.run('clearCombatEffects()');assert.equal(contacts(h).length,0);assert.equal(h.run('pendingTimers.size'),0);
});
test('lite and reduced motion retain a static labeled result through normal renders',()=>{
 for(const setup of ['s.effectsLite=true','window.matchMedia=()=>({matches:true})']){
  const h=ready();h.run(setup);h.run("showImpact(28,true);renderEncounter()");
  assert.equal(contacts(h).length,1);assert.ok(contacts(h)[0].className.includes('feedback-quiet'));
  assert.equal(contacts(h)[0].contactFeedback.parts.length,1);
  h.run("paintContactFeedback('guard',3);paintContactFeedback('hurt',5)");assert.equal(contacts(h).length,2);
  assert.equal(h.nodes.get('combat-fx').children.length,0);
 }
});
test('expiration, pause, hidden page, menu change and new encounter remove owned contacts',()=>{
 const h=ready();h.run("paintContactFeedback('guard',3);var expiry=[...pendingTimers.values()][0];pendingTimers.clear();expiry.fn()");
 assert.equal(contacts(h).length,0);assert.equal(h.run('impactTimers.size'),0);
 for(const stop of ["s.paused=true;renderEncounter()","document.hidden=true;renderEncounter()","showView('inventory')","encounterSerial++;renderEncounter()"]){
  h.run("s.paused=false;document.hidden=false;showView('battle');paintContactFeedback('guard',3)");h.run(stop);
  assert.equal(contacts(h).length,0);assert.equal(h.run('impactTimers.size'),0);
 }
 h.run("document.hidden=true;paintContactFeedback('critical',1)");assert.equal(contacts(h).length,0);
});

test('the first swing after returning from another menu keeps its pending contact',()=>{
 const h=ready();h.run("showView('inventory');renderEncounter();showView('battle');showImpact(10,true);renderEncounter()");
 assert.ok(h.run('pendingHeroContact!==null'));assert.ok(h.run('pendingTimers.has(strikeTimers.contact)'));
});
