'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{harness}=require('./harness.cjs');
const base={v:1,lastSeen:Date.now(),total:100,stage:6,highestStage:30,vitality:100};
function ready(){
 const h=harness(base);
 // Keep attributes and attachment identity observable without replacing gameplay.
 h.run(`const makeFeedbackNode=document.createElement;document.createElement=(tag)=>{const node=makeFeedbackNode(tag);node.isConnected=true;node.attributes={};node.setAttribute=(key,value)=>node.attributes[key]=String(value);node.getAttribute=key=>node.attributes[key]??null;return node};
 for(const id of ['victory-dialog','loot-acquisition']){const node=$(id);node.attributes={};node.setAttribute=(key,value)=>node.attributes[key]=String(value);node.getAttribute=key=>node.attributes[key]??null}
 s.paused=false;s.effectsLite=false;s.rewardPending=false;s.rewardAuto=false;boss=true;bossId=0;bossTier='normal';currentMob='slime';phase='combat';hp=maxHp=1000000;s.heroHp=heroMaxHp();bossLeft=50;bossStrikes=0;encounterSerial++;render();clearCombatEffects();
 var pendingTimers=new Map(),feedbackTimerId=0;setTimeout=(fn,ms)=>{const id=++feedbackTimerId;pendingTimers.set(id,{fn,ms});return id};clearTimeout=id=>pendingTimers.delete(id);`);
 return h;
}
function groups(h,kind){return h.run(`[...bossFeedbackTimers.keys()].filter(n=>n.bossFeedbackKind==='${kind}').length`)}
function snapshot(h){return h.run('JSON.stringify([s,hp,attackClock,enemyClock,bossStrikes])')}

test('boss and loot presentation use no gameplay RNG or state changes',()=>{
 const h=ready();h.run('bossStrikes=BOSS_BALANCE[bossId].every-1');const before=snapshot(h);
 h.run(`Math.random=()=>{throw Error('cosmetic RNG')};renderBossFeedback();for(const outcome of ['hit','guard','dodge'])showBossImpact(outcome);paintLootAcquisition({gold:25,rows:[{key:'ring',count:1},{key:'core',count:2}]})`);
 assert.equal(snapshot(h),before);assert.equal(groups(h,'impact'),1);
 assert.equal(h.nodes.get('loot-acquisition').children.length,4);
});

test('all five charged boss outcomes match confirmed hit, guard and dodge',()=>{
 for(let id=0;id<5;id++)for(const outcome of ['hit','guard','dodge']){
  const h=ready();h.run(`bossId=${id};bossStrikes=BOSS_BALANCE[bossId].every-1;dodgeChance=()=>${outcome==='dodge'?1:0};s.passiveBuffs.guard=${outcome==='guard'?5:0};render()`);
  const expected=h.run('incomingDamage()'),hp=h.run('s.heroHp'),strikes=h.run('bossStrikes');
  h.run('Math.random=()=>{throw Error("cosmetic RNG")};monsterHit(()=>.99)');
  assert.equal(hp-h.run('s.heroHp'),outcome==='dodge'?0:expected,{id,outcome});
  assert.equal(h.run('bossStrikes'),strikes+1);assert.equal(groups(h,'impact'),1);
  assert.equal(h.run('[...bossFeedbackTimers.keys()][0].getAttribute("data-outcome")'),outcome);
  assert.equal(h.run('[...bossFeedbackTimers.keys()][0].children.length'),outcome==='hit'?5:1);
 }
});

test('normal boss attacks have no strong mark and lethal received damage cancels marks',()=>{
 const h=ready();h.run('dodgeChance=()=>0;monsterHit(()=>.99)');assert.equal(groups(h,'impact'),0);
 h.run('bossStrikes=BOSS_BALANCE[bossId].every-1;s.heroHp=1;monsterHit(()=>.99)');
 assert.equal(h.run('phase'),'defeated');assert.equal(h.run('bossFeedbackTimers.size'),0);
});

test('telegraph is clock-driven, has bounded DOM and does not create countdown timers',()=>{
 const h=ready();h.run('bossStrikes=BOSS_BALANCE[bossId].every-1;enemyClock=enemyInterval()-.4;for(let i=0;i<100;i++)renderBossFeedback()');
 assert.equal(h.run('pendingTimers.size'),0);assert.equal(h.run('bossFeedbackLayer.children.length'),2);
 assert.equal(h.run('bossFeedbackTell.hidden'),false);
 h.run('bossStrikes++;renderBossFeedback()');assert.equal(h.run('bossFeedbackTell.hidden'),true);
});

test('confirmed boss defeat is once-only and keeps 1800ms reward timing',()=>{
 const h=ready();h.run('Math.random=()=>.99;hp=1;damage(1)');
 assert.equal(h.run('phase'),'victory');assert.equal(h.run('phaseLeft'),1.8);assert.equal(groups(h,'defeat'),1);
 const awarded=snapshot(h);h.run('for(let i=0;i<20;i++){renderEncounter();queueBossDefeat();damage(1e6)}');
 assert.equal(snapshot(h),awarded);assert.equal(groups(h,'defeat'),1);
 h.run('stepBattleReward(.9)');assert.equal(h.run('phase'),'victory');
 h.run('stepBattleReward(.91)');assert.equal(h.run('phase'),'results');assert.equal(h.nodes.get('victory-dialog').open,true);
 assert.equal(h.nodes.get('victory-dialog').getAttribute('data-reward-motion'),'reveal');
});

test('boss overlap caps one impact plus one defeat and cancellation removes timers',()=>{
 const h=ready();h.run("for(let i=0;i<100;i++)showBossImpact('hit');phase='victory';queueBossDefeat()");
 assert.equal(h.run('bossFeedbackTimers.size'),2);assert.equal(h.run('pendingTimers.size'),2);
 for(const stop of ['s.paused=true;renderEncounter()','document.hidden=true;renderEncounter()',"showView('inventory')",'encounterSerial++;phase="combat";renderEncounter()']){
  h.run("s.paused=false;document.hidden=false;showView('battle');phase='combat';boss=true;showBossImpact('hit')");h.run(stop);
  assert.equal(h.run('bossFeedbackTimers.size'),0);assert.equal(h.run('pendingTimers.size'),0);
 }
});

test('receipt uses descending rarity, one featured gear and bounded card staggering',()=>{
 const h=ready();h.run(`Math.random=()=>.99;hp=1;damage(1);s.battleReward.rows=[...Array(18)].map((_,i)=>({key:i%2?'ring':'core',count:1,gear:null}));rewardPainted='';showBattleReward()`);
 const cards=h.nodes.get('victory-items').children;
 assert.equal(cards.length,18);assert.equal(cards.filter(x=>x.getAttribute('data-featured')==='true').length,1);
 assert.equal(cards.filter(x=>x.getAttribute('data-reveal')==='true').length,8);
 assert.ok(cards.every(x=>parseInt(x.style.animationDelay)<=300));
 assert.equal(cards[0].className,'victory-item epic');
 const awarded=snapshot(h);h.run('showBattleReward(true);showBattleReward(false)');
 assert.equal(h.nodes.get('victory-dialog').getAttribute('data-reward-motion'),'still');assert.equal(snapshot(h),awarded);
});

test('lite and reduced motion keep acquisition and boss result information static',()=>{
 for(const setup of ['s.effectsLite=true','window.matchMedia=()=>({matches:true})']){
  const h=ready();h.run(setup);h.run('renderEncounter();Math.random=()=>.99;hp=1;damage(1);stepBattleReward(2)');
  assert.equal(h.nodes.get('loot-acquisition').hidden,false);
  assert.equal(h.nodes.get('loot-acquisition').className,'loot-acquisition');
  assert.equal(h.nodes.get('victory-dialog').getAttribute('data-reward-motion'),'still');
  assert.equal(h.nodes.get('victory-items').children.some(x=>x.getAttribute('data-featured')==='true'),true);
 }
});


test('ordinary field loot confirms acquisition without a special receipt or changed recovery delay',()=>{
 const h=ready();h.run("boss=false;s.effectsLite=true;render();Math.random=()=>.99;hp=1;damage(1)");
 assert.equal(h.run('phase'),'loot');assert.equal(h.run('phaseLeft'),.8);
 assert.equal(h.run('s.rewardPending'),false);assert.equal(h.run('freshRewardFeedbackId'),null);
 assert.equal(h.nodes.get('loot-acquisition').hidden,false);
 assert.equal(h.nodes.get('loot-acquisition').children.length,4);
 const awarded=snapshot(h);h.run('for(let i=0;i<10;i++)render()');assert.equal(snapshot(h),awarded);
});
