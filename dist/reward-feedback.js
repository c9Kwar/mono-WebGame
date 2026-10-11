// Presentation only. Awards, rarity rolls and persistence remain in game.js.
const REWARD_FEEDBACK={arrival:360,stagger:60,maxDelay:300,maxAnimatedCards:8,contactDelay:80};
const REWARD_MARKS={common:'·',rare:'◇',epic:'✧',legendary:'✦',mythic:'❖'};
let pendingLootFeedback=null,freshRewardFeedbackId=null;

function rewardQuietMode(){return !!(s.effectsLite||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)}
function rewardFeedbackVisible(){return !s.paused&&!document.hidden&&!$('view-battle').hidden}
function queueLootFeedback(gold,rows,special=false){
 pendingLootFeedback={gold,rows:rows.map(row=>({key:row.key,count:row.count})),serial:encounterSerial};
 if(special)freshRewardFeedbackId=s.battleReward?.id||null;
}
function clearRewardFeedback(keepHeroStrike=false){
 if(!keepHeroStrike){pendingLootFeedback=null;clearTimeout(strikeTimers.loot);strikeTimers.loot=null}
 if(!rewardFeedbackVisible()||!['victory','results'].includes(phase)){freshRewardFeedbackId=null;$('victory-dialog').setAttribute('data-reward-motion','still')}
 // The caption is also a recent-loot record; cancellation leaves its text static.
 $('loot-acquisition').classList.remove('loot-arriving');
}

function playPendingLootFeedback(){
 const receipt=pendingLootFeedback;if(!receipt)return;
 pendingLootFeedback=null;
 if(!rewardFeedbackVisible())return;
 const show=()=>{if(receipt.serial===encounterSerial&&rewardFeedbackVisible())paintLootAcquisition(receipt)};
 if(rewardQuietMode()){show();return}
 clearTimeout(strikeTimers.loot);
 atHeroPose('loot',Math.min(1,.66+REWARD_FEEDBACK.contactDelay/heroStrikeDuration),show,Math.max(0,heroContactAt-Date.now())+REWARD_FEEDBACK.contactDelay);
}
function paintLootAcquisition(receipt){
 const holder=$('loot-acquisition'),rows=receipt.rows.filter(row=>ITEMS[row.key]);
 const ranked=rows.slice().sort((a,b)=>rarityRank(ITEMS[b.key].rarity)-rarityRank(ITEMS[a.key].rarity)||Number(!!ITEMS[b.key].slot)-Number(!!ITEMS[a.key].slot));
 const best=ranked[0],item=best&&ITEMS[best.key];
 holder.style.cssText='--reward-arrival-ms:'+REWARD_FEEDBACK.arrival+'ms';holder.replaceChildren();holder.hidden=false;holder.className='loot-acquisition'+(rewardQuietMode()?'':' loot-arriving');
 holder.setAttribute('data-rarity',item?.rarity||'common');
 const icon=document.createElement('span');icon.className='loot-acquisition-icon';icon.setAttribute('aria-hidden','true');
 if(item)paintItemIcon(icon,item);else icon.textContent='◆';
 const copy=document.createElement('span');copy.className='loot-acquisition-copy';
 const title=document.createElement('strong'),detail=document.createElement('small');
 title.textContent=item?REWARD_MARKS[item.rarity]+' '+RARITIES[item.rarity]+(item.slot?' 장비':item.blueprint?' 설계도':' 전리품')+' 획득':'전리품 획득';
 detail.textContent=item?item.name+' ×'+best.count+(rows.length>1?' · 외 '+(rows.length-1)+'건':''):'사냥 보상';
 copy.append(title,detail);
 const gold=document.createElement('b');gold.className='loot-acquisition-gold';gold.textContent='+'+fmt(receipt.gold)+' G';
 const stored=document.createElement('small');stored.className='loot-acquisition-stored';stored.textContent='✓ 가방 보관';
 holder.append(icon,copy,gold,stored);
}
function decorateRewardFeedback(report,rows){
 const dialog=$('victory-dialog');dialog.style.cssText='--reward-arrival-ms:'+REWARD_FEEDBACK.arrival+'ms';
 const fresh=freshRewardFeedbackId===report.id&&!rewardReview&&rewardFeedbackVisible();
 if(freshRewardFeedbackId===report.id)freshRewardFeedbackId=null;
 dialog.setAttribute('data-reward-motion',fresh&&!rewardQuietMode()?'reveal':'still');
 dialog.setAttribute('data-reward-view',rewardReview?'review':fresh?'acquired':'receipt');
 const featured=rows.findIndex(row=>ITEMS[row.key].slot&&rarityRank(ITEMS[row.key].rarity)>=1);
 const cards=$('victory-items').children;
 for(let i=0;i<cards.length;i++){
  const card=cards[i],item=ITEMS[rows[i].key];
  card.setAttribute('data-featured',String(i===featured));
  card.setAttribute('data-reveal',String(i<REWARD_FEEDBACK.maxAnimatedCards));
  card.style.animationDelay=Math.min(i*REWARD_FEEDBACK.stagger,REWARD_FEEDBACK.maxDelay)+'ms';
  const label=card.children[1];label.textContent=REWARD_MARKS[item.rarity]+' '+RARITIES[item.rarity]+(rows[i].gear?' · 장비':item.blueprint?' · 설계도':' · 재료');
  if(i===featured){const note=document.createElement('span');note.className='reward-featured-label';note.textContent=rewardReview?'주요 전리품':'획득 장비';card.append(note)}
 }
}
