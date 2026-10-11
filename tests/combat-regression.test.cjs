const test=require('node:test'),assert=require('node:assert/strict');
const {harness}=require('./harness.cjs');
const base={v:1,lastSeen:Date.now(),total:100,highestStage:25,stage:6,attack:35,vitality:30,guard:30,speed:15};
test('attack and enemy clocks round trip through an active boss save',()=>{
 const h=harness(base);h.run('startBoss(1,()=>.9);attackClock=.31;enemyClock=.52;s.paused=true;save()');
 const r=harness(JSON.parse(h.stored['mosslight.save.v1']));assert.equal(r.run('boss'),true);assert.equal(r.run('attackClock'),.31);assert.equal(r.run('enemyClock'),.52);
});
test('normal combat clock resumes and legacy missing clock remains zero',()=>{const h=harness(base);h.run('attackClock=.22;save()');const r=harness(JSON.parse(h.stored['mosslight.save.v1']));assert.equal(r.run('attackClock'),.22);assert.equal(harness(base).run('attackClock'),0);});
test('offline boss/dead/reward/paused paths never award regular gold',()=>{
 for(const setup of ['boss=true','phase="defeated"','s.rewardPending=true','s.paused=true','s.journey={boss:true}','s.journey={phase:"defeated"}']){const h=harness(base);h.run(setup);const gold=h.run('s.gold');h.run('offline(3600000)');assert.equal(h.run('s.gold'),gold,setup);}
});
test('safe normal offline reward is positive and capped at eight hours',()=>{const h=harness(base);const initial=h.run('s.gold');h.run('s.journey=null;offline(28800000)');const gain=h.run('s.gold')-initial;assert.ok(gain>0);h.run(`s.gold=${initial};offline(288000000)`);assert.equal(h.run('s.gold')-initial,gain);});
test('negative/nonfinite time and damage cannot alter combat state',()=>{
 const h=harness(base);for(const value of ['-1','0','NaN','Infinity']){const before=h.run('JSON.stringify([hp,s.heroHp,s.gold,enemyClock,attackClock])');h.run(`tick(${value});stepCombat(${value});damage(${value});offline(${value})`);assert.equal(h.run('JSON.stringify([hp,s.heroHp,s.gold,enemyClock,attackClock])'),before);}
});
test('injected RNG controls guard chance as well as dodge',()=>{const h=harness(base);h.run('s.passives.guard=1;s.heroHp=heroMaxHp();Math.random=()=>.99');const before=h.run('s.heroHp'),expected=h.run('Math.max(1,Math.round(incomingDamage()*.7))');h.run('monsterHit(()=>0)');assert.equal(before-h.run('s.heroHp'),expected);});
test('nullable historical best time cannot crash boss detail',()=>{const h=harness({...base,fieldNotes:{bosses:{'0_normal':{wins:1,best:null}}}});assert.doesNotThrow(()=>h.run('openQuickBoss();selectQuickBoss(0)'));assert.ok(h.nodes.get('quick-boss-history').textContent.includes('시간 기록 없음'));});

test('legacy boss victories retain unlocks even without newer progress counters',()=>{const h=harness({v:1,lastSeen:Date.now(),stage:1,bossWins:[4,2,1]});for(let id=0;id<3;id++)assert.equal(h.run(`bossUnlocked(${id})`),true);assert.equal(h.run('bossUnlocked(3)'),false);});
