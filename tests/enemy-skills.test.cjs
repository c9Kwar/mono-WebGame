'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{harness}=require('./harness.cjs');
const base={v:1,lastSeen:Date.now(),total:100,highestStage:25,stage:6,attack:35,vitality:70,guard:30};
function ready(setup=''){
 const h=harness(base);
 h.run(`s.paused=false;phase='combat';s.heroHp=1000000;hp=maxHp=1000000;${setup};encounterSerial++;render();clearCombatEffects()`);
 return h;
}
function timers(h){h.run('var pendingTimers=new Map(),nextTimer=0;setTimeout=(fn,ms)=>{const id=++nextTimer;pendingTimers.set(id,{fn,ms});return id};clearTimeout=id=>pendingTimers.delete(id)')}
const bursts=h=>h.nodes.get('combat-fx').children;

test('five boss skills telegraph and land their existing charged damage exactly once',()=>{
 for(let id=0;id<5;id++){
  const h=ready(`boss=true;bossId=${id};bossTier='normal';bossStrikes=BOSS_BALANCE[bossId].every-1;enemyClock=.5`);
  const name=h.run('enemySkill().name'),skill=h.run('enemySkill().id'),expected=h.run('incomingDamage()'),strikes=h.run('bossStrikes'),before=h.run('s.heroHp');
  assert.ok(h.nodes.get('boss-pattern-name').textContent.includes(name));
  assert.ok(h.nodes.get('enemy-intent-text').textContent.includes(name));
  assert.ok(h.nodes.get('boss-pattern-detail').textContent.includes('예상 피해'));
  h.run('Math.random=()=>{throw Error("presentation consumed RNG")};monsterHit(()=>.99)');
  assert.equal(before-h.run('s.heroHp'),expected);
  assert.equal(h.run('bossStrikes'),strikes+1);
  assert.ok(bursts(h).some(node=>node.className.includes('skill-'+skill)));
  assert.ok(h.nodes.get('last-impact').textContent.includes(name));
  assert.equal(h.run('enemySkill()'),null);
 }
});

test('each elite skill observes its species damage and cadence without an extra hit',()=>{
 for(const mob of ['eliteSlime','eliteMushroom','eliteMoth','eliteSnail','eliteRabbit']){
  const h=ready(`boss=false;currentMob='${mob}';enemyClock=1.3`),before=h.run('s.heroHp'),expected=h.run('incomingDamage()'),skill=h.run('enemySkill().id');
  assert.equal(h.run('enemyAttack()'),h.run('Math.round(18*1.2**5*MOBS[currentMob].atk)'));
  assert.equal(h.run('enemyInterval()'),h.run('MOBS[currentMob].interval'));
  assert.equal(h.nodes.get('boss-pattern').hidden,false);
  h.run('monsterHit(()=>.99)');assert.equal(before-h.run('s.heroHp'),expected);
  assert.ok(bursts(h).some(node=>node.className.includes('skill-'+skill)));
 }
});

test('skill cues survive guard, dodge, lite, reduced motion and pause',()=>{
 for(const setup of ['s.effectsLite=true','window.matchMedia=()=>({matches:true})','s.paused=true']){
  const h=ready("boss=false;currentMob='eliteMushroom'");h.run(setup+';render()');
  assert.ok(h.nodes.get('boss-pattern-name').textContent.includes('보랏빛 포자 폭발'));
  assert.equal(h.run('emitEncounterEffect(enemySkill())'),false);
  assert.equal(bursts(h).length,0);
 }
 const h=ready('boss=true;bossId=0;bossStrikes=3');h.run('s.passives.guard=1');
 const before=h.run('s.heroHp'),expected=h.run('Math.max(1,Math.round(incomingDamage()*.65))');h.run('monsterHit(()=>0)');
 assert.equal(before-h.run('s.heroHp'),expected);assert.match(h.nodes.get('last-impact').textContent,/왕관 박치기.*방어 성공/);
 h.run('bossStrikes=3;dodgeChance=()=>.2');const guarded=h.run('s.heroHp');h.run('monsterHit(()=>0)');
 assert.equal(h.run('s.heroHp'),guarded);assert.match(h.nodes.get('last-impact').textContent,/왕관 박치기.*회피.*0/);
});

test('golden fox arrival, cast and victory share bounded presentation without replaying rewards',()=>{
 const h=ready("boss=false;currentMob='treasure'");timers(h);
 const before=h.run('JSON.stringify(s)');h.run('Math.random=()=>{throw Error("cosmetic RNG")};encounterSerial++;renderEncounter();for(let i=0;i<5;i++)renderEncounter()');
 assert.equal(bursts(h).filter(n=>n.className.includes('skill-arrive')).length,1);
 assert.equal(h.run('JSON.stringify(s)'),before);
 h.run('monsterHit(()=>.99)');assert.ok(bursts(h).some(n=>n.className.includes('skill-fox skill-cast')));
 h.run('Math.random=()=>.99;damage(hp+1)');
 assert.equal(h.run('phase'),'victory');const earned=h.run('JSON.stringify([s.gold,s.inventory,s.gear,s.total,s.battleReward])');
 h.run('pendingTimers.get(strikeTimers.victory).fn();for(let i=0;i<5;i++){renderEncounter();showBattleReward(true)}');
 assert.equal(bursts(h).filter(n=>n.className.includes('skill-victory')).length,1);
 assert.equal(h.run('JSON.stringify([s.gold,s.inventory,s.gear,s.total,s.battleReward])'),earned);
});

test('all cosmetic timers and nodes remain bounded and are cancelled on transition or pause',()=>{
 const h=ready("boss=false;currentMob='eliteSlime'");timers(h);
 h.run('Math.random=()=>{throw Error("cosmetic RNG")};for(let i=0;i<100;i++)emitEncounterEffect(enemySkill())');
 assert.equal(bursts(h).length,5);assert.equal(h.run('combatFxTimers.size'),5);assert.equal(h.run('pendingTimers.size'),5);
 assert.equal(bursts(h).reduce((n,node)=>n+node.children.length,0),45);
 h.run('s.paused=true;renderEncounter()');assert.equal(bursts(h).length,0);assert.equal(h.run('pendingTimers.size'),0);
 h.run('s.paused=false;emitEncounterEffect(enemySkill());phase="travel";renderEncounter()');assert.equal(bursts(h).length,0);
 h.run('document.hidden=true');assert.equal(h.run('emitEncounterEffect(enemySkill())'),false);
});

test('hero contact uses no gameplay RNG, coalesces procs, and completes before the next fast strike',()=>{
 const h=ready();timers(h);
 const before=h.run('JSON.stringify(s)');
 h.run('s.speed=30;Math.random=()=>{throw Error("cosmetic RNG")};showImpact(100);var firstSwing=strikeTimers.hero,firstContact=strikeTimers.contact;showImpact(50,true)');
 assert.equal(h.run('strikeTimers.hero'),h.run('firstSwing'));
 assert.equal(h.run('strikeTimers.contact'),h.run('firstContact'));
 assert.ok(h.run('heroStrikeDuration<1000/speed()'));
 assert.ok(h.run('pendingTimers.get(strikeTimers.contact).ms<=heroStrikeDuration*.66+1'));
 assert.equal(h.nodes.get('impact-layer').children.length,0);
 h.run('pendingTimers.get(strikeTimers.contact).fn()');
 assert.match(h.nodes.get('impact-layer').children[0].textContent,/치명타 150/);
 h.run('s.speed=0');assert.equal(h.run('JSON.stringify(s)'),before);
});

test('final hit retains its cosmetic contact through victory but cancels across encounters',()=>{
 const h=ready("boss=false;currentMob='treasure'");timers(h);
 h.run('Math.random=()=>.99;damage(hp+1)');
 assert.equal(h.run('phase'),'victory');assert.ok(h.run('pendingHeroContact!==null'));
 assert.ok(h.run('pendingTimers.has(strikeTimers.hero)&&pendingTimers.has(strikeTimers.contact)'));
 h.run('pendingTimers.get(strikeTimers.contact).fn()');assert.equal(h.nodes.get('impact-layer').children.length,1);
 h.run('phase="combat";currentMob="slime";encounterSerial++;renderEncounter()');
 assert.equal(h.run('pendingHeroContact'),null);assert.equal(h.nodes.get('impact-layer').children.length,0);assert.equal(bursts(h).length,0);
});


test('impact-number timeouts are bounded and fully cancelled with their particles',()=>{
 const h=ready();timers(h);
 h.run('Math.random=()=>{throw Error("cosmetic RNG")};for(let i=0;i<100;i++)paintImpact(i,false,true)');
 assert.equal(h.nodes.get('impact-layer').children.length,10);
 assert.equal(h.run('impactTimers.size'),10);assert.equal(h.run('combatFxTimers.size'),5);
 assert.equal(h.run('pendingTimers.size'),15);
 h.run('clearCombatEffects()');
 assert.equal(h.run('pendingTimers.size'),0);assert.equal(h.run('impactTimers.size'),0);assert.equal(h.nodes.get('impact-layer').children.length,0);
});

test('cosmetic contact and recovery wait for the CSS pose under delayed rendering',()=>{
 const h=ready();timers(h);
 h.run('var landed=0,finished=0;heroStrikeDuration=550;heroStrikeAnimation={currentTime:250,playState:"running"};atHeroPose("contact",.66,()=>landed++,0);atHeroPose("hero",1,()=>finished++,0);var runVisualTimer=key=>{const id=strikeTimers[key],timer=pendingTimers.get(id);pendingTimers.delete(id);timer.fn()}');
 for(let i=0;i<5;i++)h.run('runVisualTimer("contact");runVisualTimer("hero")');
 assert.equal(h.run('landed'),0);assert.equal(h.run('finished'),0);assert.equal(h.run('pendingTimers.size'),2);
 h.run('heroStrikeAnimation.currentTime=370;runVisualTimer("contact");runVisualTimer("hero")');
 assert.equal(h.run('landed'),1);assert.equal(h.run('finished'),0);assert.equal(h.run('pendingTimers.size'),1);
 h.run('heroStrikeAnimation.currentTime=550;heroStrikeAnimation.playState="finished";runVisualTimer("hero")');
 assert.equal(h.run('finished'),1);assert.equal(h.run('pendingTimers.size'),0);
 h.run('heroStrikeAnimation.currentTime=0;heroStrikeAnimation.playState="running";atHeroPose("contact",.66,()=>landed++,0);runVisualTimer("contact");clearCombatEffects()');
 assert.equal(h.run('landed'),1);assert.equal(h.run('pendingTimers.size'),0);
});
