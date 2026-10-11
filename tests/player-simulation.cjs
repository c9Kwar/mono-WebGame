// Deterministic players drive the actual combat, spending, crafting and reward code.
// Accelerated clock, not pre-granted levels; cosmetic work is omitted for throughput.
const {harness,assert}=require('./harness.cjs');
const baseline=process.env.SIM_BASELINE==='1'?require('node:child_process').execFileSync('git',['show','0a8942f:dist/game.js'],{cwd:require('node:path').join(__dirname,'..'),encoding:'utf8'}):null;
const profiles={explorer:{interval:20,weights:{attack:1,vitality:1,guard:.8,speed:.2,move:.12,crit:.12},craft:true,claim:true},collector:{interval:45,weights:{attack:1,vitality:1,guard:.8,speed:.15,move:.1,crit:.08},craft:true,claim:true},casual:{interval:120,weights:{attack:1,vitality:.8,guard:.6,speed:.1,move:.08,crit:.06},craft:false,claim:false},challenger:{interval:20,weights:{attack:1,vitality:1.2,guard:1,speed:.3,move:.1,crit:.1},craft:true,claim:true}};
function simulate(profile,seed,seconds=7200){
 let time=1800000000000,state=seed>>>0;const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
 class Clock extends Date{constructor(...a){super(...(a.length?a:[time]))}static now(){return time}}
 const h=harness({v:1,lastSeen:time},{Date:Clock,random,gameSource:baseline});
 h.run(`render=renderLoot=renderCodex=renderCollection=renderEquipment=renderFieldNotes=renderCrafting=renderBossList=renderQuickBoss=()=>{};log=notify=showImpact=castEnemySkill=animateStrike=clearCombatEffects=showBattleReward=()=>{};save=()=>true;showView=()=>true;s.rewardAuto=true;var sim={deathSources:{},actions:0,claims:0,crafts:0,bossAttempts:0,farmSeconds:0,checkpoints:[],firstBoss:null};var strategy=${JSON.stringify(profiles[profile])};const originalDefeat=defeatHero;defeatHero=()=>{const key=boss?'boss'+bossId:currentMob;sim.deathSources[key]=(sim.deathSources[key]||0)+1;return originalDefeat()};
 function act(){
 if(s.rewardPending)finishBattleReward();
 if(typeof claimAllMilestones==='function'){const count=claimAllMilestones();sim.claims+=count;if(count)sim.actions++}
 else if(strategy.claim)for(const n of milestoneTargets())if(milestoneReady(n)&&!s.claimedMilestones.includes(n)){claimMilestone(n);sim.claims++;sim.actions++}
 if(strategy.craft){for(const key of Object.keys(RECIPES)){if(!known(key)&&canCraft(key)){craft(key);sim.crafts++;sim.actions++}}}
 if(s.gear.length){const changes=equipRecommended();if(changes)sim.actions++}
 if(s.inventory.skillstone>=3){drawPassive();sim.actions++}
 for(let i=0;i<100;i++){const candidates=Object.keys(strategy.weights).filter(k=>s[k]<upgrades[k].max&&cost(k)<=s.gold).sort((a,b)=>(s[a]+1)/strategy.weights[a]-(s[b]+1)/strategy.weights[b]);if(!candidates.length)break;
 // The new field note is observable information. Guided players compare the
 // displayed HP/defense/attack improvements when it reports attrition or danger.
 let choice=candidates[0];
 if(typeof projectFieldPreparation==='function'&&projectFieldPreparation().status!=='ready'){
  const risk=projectFieldPreparation().damage/heroMaxHp();let best=0;
  for(const k of candidates.filter(k=>['attack','vitality','guard','speed'].includes(k))){const price=cost(k);s[k]++;const next=projectFieldPreparation().damage/heroMaxHp();s[k]--;const gain=(risk-next)/price;if(gain>best){best=gain;choice=k}}
 }
 upgrade(choice);sim.actions++}
 if(s.farmMode&&!boss&&!s.queuedRoute&&typeof projectFieldPreparation==='function'){if(projectFieldPreparation(s.highestStage).status==='ready'){requestRoute(s.highestStage,false);sim.actions++}else if(projectFieldPreparation().status==='survival'&&s.stage>1){requestRoute(s.stage-1,true);sim.actions++}}
 if(!boss&&phase!=='defeated'){for(let id=0;id<5;id++){if(!bossUnlocked(id)||bossRemaining(id)>0)continue;const p=projectBossPreparation(id);if(p.status==='ready'&&startBoss(id,Math.random,true)){sim.bossAttempts++;break}}}
 }
 `);
 for(let t=0;t<seconds;t++){
  time+=1000;
  h.run(`for(let sub=0;sub<4;sub++)stepCombat(.25);if(s.farmMode)sim.farmSeconds++;`);
  if(t%profiles[profile].interval===0)h.run('act()');
  if((t+1)%1800===0)h.run(`sim.checkpoints.push({minute:${(t+1)/60},stage:s.stage,highest:s.highestStage,deaths:s.deaths,bosses:s.bossWins.reduce((a,b)=>a+b,0)})`);
 }
 const out=JSON.parse(h.run(`JSON.stringify({profile:${JSON.stringify(profile)},seed:${seed},...sim,stage:s.stage,highest:s.highestStage,deaths:s.deaths,farmMode:s.farmMode,gold:Math.floor(s.gold),kills:s.total,gear:s.gear.length,unclaimed:milestoneTargets().filter(n=>milestoneReady(n)&&!s.claimedMilestones.includes(n)),levels:{attack:s.attack,vitality:s.vitality,guard:s.guard},bosses:s.bossWins})`));
 assert(out.kills>0);assert(out.gold>=0);assert(out.highest<=30);assert(h.run('s.gear.every(g=>g.tier<=3)'));assert(h.run('s.claimedMilestones.length===new Set(s.claimedMilestones).size'));assert(h.run('Object.values(s.inventory).every(n=>Number.isInteger(n)&&n>=0)'));return out;
}
if(require.main===module){const rows=[];for(const profile of Object.keys(profiles))for(const seed of [7,42,99])rows.push(simulate(profile,seed,Number(process.env.SIM_SECONDS)||7200));console.log(JSON.stringify(rows,null,2))}
module.exports={simulate,profiles};
