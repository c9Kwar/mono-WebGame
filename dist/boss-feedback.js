/* Boss cues observe the combat clock and confirmed outcomes. No combat state,
   random draws, rewards or additional attack delay belong to this layer. */
const BOSS_FEEDBACK_TIMING={impact:520,defeat:1120,collapse:820};
const bossFeedbackTimers=new Map();
let bossFeedbackLayer=null,bossFeedbackTell=null,bossFeedbackTarget=null,bossFeedbackCycle='',bossDefeatSerial=null,bossFeedbackVersion=0;

function bossFeedbackAllowed(){return !s.paused&&!document.hidden&&!$('view-battle').hidden}
function ensureBossFeedbackLayer(){
 const arena=$('arena');for(const [name,ms] of Object.entries(BOSS_FEEDBACK_TIMING)){const key='--boss-'+name+'-ms';if(arena.style.setProperty)arena.style.setProperty(key,ms+'ms');else arena.style[key]=ms+'ms'}
 if(bossFeedbackLayer?.isConnected)return bossFeedbackLayer;
 const layer=document.createElement('div');layer.id='boss-feedback-layer';layer.setAttribute('aria-hidden','true');
 $('arena').append(layer);bossFeedbackLayer=layer;return layer;
}
function hideBossTell(){
 if(bossFeedbackTell)bossFeedbackTell.hidden=true;
 if(bossFeedbackTarget)bossFeedbackTarget.hidden=true;
 bossFeedbackCycle='';$('arena').classList.remove('boss-winding');
}
function removeBossFeedbackGroup(kind){
 for(const [node,timer] of bossFeedbackTimers){if(node.bossFeedbackKind!==kind)continue;clearTimeout(timer);node.remove();bossFeedbackTimers.delete(node)}
}
function appendBossFeedbackGroup(node,kind,duration){
 removeBossFeedbackGroup(kind);node.bossFeedbackKind=kind;ensureBossFeedbackLayer().append(node);
 bossFeedbackTimers.set(node,setTimeout(()=>{node.remove();bossFeedbackTimers.delete(node)},duration));
}
function clearBossFeedback(keepHeroStrike=false){
 // keepHeroStrike is deliberately not acted on: the caller owns the sword.
 // Only this module's labels, marks, timers and collapse state are cancelled.
 for(const timer of bossFeedbackTimers.values())clearTimeout(timer);bossFeedbackTimers.clear();
 if(bossFeedbackLayer){bossFeedbackLayer.replaceChildren();bossFeedbackTell=null;bossFeedbackTarget=null}
 bossFeedbackCycle='';bossDefeatSerial=null;bossFeedbackVersion++;
 const arena=$('arena');arena.classList.remove('boss-winding','boss-defeat-pending','boss-defeat-landed');
 arena.classList.toggle('boss-defeat-settled',boss&&['victory','results'].includes(phase));
}
function renderBossFeedback(){
 const arena=$('arena'),settled=boss&&['victory','results'].includes(phase)&&!arena.classList.contains('boss-defeat-pending')&&!arena.classList.contains('boss-defeat-landed');
 arena.classList.toggle('boss-defeat-settled',settled);
 if(!bossFeedbackAllowed()||!boss||phase!=='combat'||!bossCharged()){hideBossTell();return}
 const quiet=quietCombatEffects(),skill=BOSS_SKILL_VISUALS[bossId],interval=enemyInterval();
 const remaining=Math.max(0,interval-enemyClock),progress=Math.max(0,Math.min(1,enemyClock/interval));
 const cycle=[encounterSerial,bossId,bossStrikes,quiet].join('|');
 if(!bossFeedbackTell){
  const tell=document.createElement('div');tell.className='boss-tell';
  const glyph=document.createElement('b');glyph.className='boss-tell-glyph';
  const label=document.createElement('span');label.className='boss-tell-label';
  const rule=document.createElement('i');rule.className='boss-tell-rule';rule.append(document.createElement('i'));
  tell.append(glyph,label,rule);ensureBossFeedbackLayer().append(tell);bossFeedbackTell=tell;
  const target=document.createElement('i');target.className='boss-tell-target';ensureBossFeedbackLayer().append(target);bossFeedbackTarget=target;
 }
 if(cycle!==bossFeedbackCycle){
  const source=contactFeedbackPoint(false),target=contactFeedbackPoint(true);
  // A small nameplate by the source and chevrons at the hero identify intent;
  // there is no painted ground area or implied manual dodge mechanic.
  const x=Math.max(64,Math.min(source.width-64,source.x));
  const y=window.innerWidth<=560?source.height*.65:Math.min(source.height-70,Math.max(source.height*.72,source.y+44));
  bossFeedbackTell.style.left=x+'px';bossFeedbackTell.style.top=y+'px';
  bossFeedbackTell.setAttribute('data-boss-style',skill.id);bossFeedbackTell.querySelector('b').textContent=skill.glyph;
  bossFeedbackTell.classList.toggle('boss-feedback-quiet',quiet);
  bossFeedbackTarget.style.left=target.x+'px';bossFeedbackTarget.style.top=(target.y-38)+'px';
  bossFeedbackCycle=cycle;
 }
 bossFeedbackTell.hidden=false;bossFeedbackTarget.hidden=false;
 bossFeedbackTell.classList.toggle('boss-tell-imminent',remaining<=.65);
 bossFeedbackTell.querySelector('.boss-tell-label').textContent='강타 예고 · '+remaining.toFixed(1)+'초';
 bossFeedbackTell.querySelector('.boss-tell-rule i').style.transform='scaleX('+progress.toFixed(3)+')';
 $('arena').classList.add('boss-winding');
}
function showBossImpact(outcome='hit'){
 if(!boss||!bossFeedbackAllowed()||phase!=='combat'||!['hit','guard','dodge'].includes(outcome))return false;
 const point=contactFeedbackPoint(true),quiet=quietCombatEffects();
 const group=document.createElement('div');group.className='boss-strong-impact boss-impact-'+outcome+(quiet?' boss-feedback-quiet':'');
 group.setAttribute('data-outcome',outcome);group.style.cssText='left:'+point.x+'px;top:'+point.y+'px';
 const mark=document.createElement('i');mark.className='boss-impact-mark';group.append(mark);
 // The contact layer already supplies the numeric result and Korean state label.
 // These short directional chips add weight only to a confirmed damaging hit.
 if(!quiet&&outcome==='hit'){
  const count=window.innerWidth<=560?2:4;
  for(let i=0;i<count;i++){
   const chip=document.createElement('i');chip.className='boss-impact-chip';
   chip.style.cssText='--dx:'+[-24,-34,-27,-40][i]+'px;--dy:'+[-19,7,22,-5][i]+'px;--turn:'+[-25,15,40,-50][i]+'deg';group.append(chip);
  }
 }
 appendBossFeedbackGroup(group,'impact',BOSS_FEEDBACK_TIMING.impact);return true;
}
function queueBossDefeat(){
 if(!boss||phase!=='victory'||!bossFeedbackAllowed()||bossDefeatSerial===encounterSerial)return false;
 const serial=encounterSerial,version=bossFeedbackVersion,quiet=quietCombatEffects();bossDefeatSerial=serial;
 hideBossTell();$('arena').classList.remove('boss-defeat-settled');$('arena').classList.add('boss-defeat-pending');
 const land=()=>{
  if(serial!==encounterSerial||version!==bossFeedbackVersion||phase!=='victory'||!bossFeedbackAllowed())return;
  const arena=$('arena');arena.classList.remove('boss-defeat-pending','boss-defeat-settled');arena.classList.add('boss-defeat-landed');
  const point=contactFeedbackPoint(false),group=document.createElement('div');
  group.className='boss-defeat-seal'+(quiet?' boss-feedback-quiet':'');group.setAttribute('data-boss-style',BOSS_SKILL_VISUALS[bossId].id);
  // Stamp the space at the defeated creature's feet, below the victory title.
  group.style.cssText='left:'+point.x+'px;top:'+(point.height*(window.innerWidth<=560?.80:.78))+'px';
  const seal=document.createElement('i');seal.className='boss-defeat-ring';
  const glyph=document.createElement('b');glyph.className='boss-defeat-glyph';glyph.textContent=BOSS_SKILL_VISUALS[bossId].glyph;group.append(seal,glyph);
  if(!quiet){
   const count=window.innerWidth<=560?2:4;
   for(let i=0;i<count;i++){
    const leaf=document.createElement('i');leaf.className='boss-defeat-leaf';
    leaf.style.cssText='--dx:'+[-37,34,-25,27][i]+'px;--dy:'+[-12,-18,22,28][i]+'px;--turn:'+[-28,34,-55,62][i]+'deg';group.append(leaf);
   }
  }
  appendBossFeedbackGroup(group,'defeat',BOSS_FEEDBACK_TIMING.defeat);
 };
 // A confirmed lethal hit has already credited the reward. Wait only for the
 // existing blade's contact pose; reduced motion keeps the same information now.
 if(quiet||!heroStrikeAnimation)land();
 else atHeroPose('bossVictory',.66,land,Math.max(0,heroContactAt-Date.now()));
 return true;
}
