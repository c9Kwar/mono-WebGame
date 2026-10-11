/* Ordinary forest attacks are deterministic paint and motion, never extra hits. */
const FIELD_SKILLS={
 slime:{id:'field-acid',name:'이끼 산성 수액',cue:'몸을 낮춘 뒤 산성 수액을 뱉습니다',glyph:'·',field:true},
 mushroom:{id:'field-spore',name:'자두빛 포자 숨결',cue:'갓을 움츠린 뒤 포자를 퍼뜨립니다',glyph:'·',field:true},
 snail:{id:'field-mucus',name:'이슬 점액 채찍',cue:'껍질에 몸을 모은 뒤 끈끈한 점액을 뻗습니다',glyph:'⌁',field:true},
 moth:{id:'field-wing',name:'달가루 날갯바람',cue:'날개를 접었다 펴며 인분을 날립니다',glyph:'⌁',field:true},
 rabbit:{id:'field-claw',name:'새싹 발톱 할퀴기',cue:'몸을 낮춰 파고든 뒤 앞발로 할퀩니다',glyph:'⌁',field:true}
};

function fieldAttackGeometry(skill){
 const arena=$('arena'),layer=$('combat-fx').getBoundingClientRect(),enemy=$('painted-enemy').getBoundingClientRect(),hero=arena.querySelector('.hero-position').getBoundingClientRect();
 const width=layer.width||layer.right-layer.left||600,height=layer.height||400;
 const point=(x,y)=>({x:Math.round(Math.max(8,Math.min(width-8,x))),y:Math.round(Math.max(8,Math.min(height-8,y)))});
 const sourceY=({'field-acid':.64,'field-spore':.48,'field-mucus':.76,'field-wing':.43,'field-claw':.58})[skill.id];
 const source=point(enemy.left-layer.left+(enemy.width||enemy.right-enemy.left)*.25,enemy.top-layer.top+enemy.height*sourceY);
 let target=point(hero.left-layer.left+(hero.width||hero.right-hero.left)*.42,hero.top-layer.top+hero.height*.62);
 // SVG coordinates include the illustration's transparent margins and meet alignment.
 const matrix=arena.querySelector('.hero-rig')?.getScreenCTM?.();
 if(matrix)target=point(matrix.a*635+matrix.c*610+matrix.e-layer.left,matrix.b*635+matrix.d*610+matrix.f-layer.top);
 return {source,target,width,height};
}

function emitFieldAttack(skill,hit=true){
 if(!skill?.field||!(Object.values(FIELD_SKILLS).includes(skill)||skill===ELITE_SKILLS.eliteRabbit)||quietCombatEffects()||s.paused)return false;
 const {source,target,width,height}=fieldAttackGeometry(skill),burst=document.createElement('div');
 const size=Math.max(.78,Math.min(1.35,width/620)),dx=target.x-source.x,dy=target.y-source.y;
 burst.className='combat-burst encounter-fx skill-cast field-attack skill-'+skill.id+(hit?'':' field-dodged');
 burst.style.cssText='--source-x:'+source.x+'px;--source-y:'+source.y+'px;--target-x:'+target.x+'px;--target-y:'+target.y+'px;--field-size:'+size+';--reach:'+Math.hypot(dx,dy)+'px;--flow-angle:'+Math.atan2(dy,dx)*180/Math.PI+'deg;';
 // The rabbit travels with its own painting. Nothing leaves its mouth.
 const arena=$('arena');
 for(const [key,value] of [['--field-lunge-x',dx+42*size],['--field-lunge-y',dy]]){
  if(arena.style.setProperty)arena.style.setProperty(key,value+'px');else arena.style[key]=value+'px';
 }
 const part=(name,i=0)=>{const node=document.createElement('i');node.className=name;node.style.cssText='--i:'+i+';';burst.append(node);return node};
 part('field-source');part('field-contact');
 if(skill.id==='field-acid'){
  for(let i=0;i<4;i++){
   const mote=part('field-mote',i),spread=(i-1.5)*8;
   mote.style.cssText+='--delay:'+i*22+'ms;offset-path:path("M '+source.x+' '+source.y+' Q '+Math.round((source.x+target.x)/2)+' '+Math.round(Math.min(source.y,target.y)-42+spread)+' '+target.x+' '+(target.y+spread)+'");';
  }
 }else if(skill.id==='field-claw'){
  for(let i=0;i<3;i++)part('field-claw-mark',i);
  for(let i=0;i<2;i++)part('field-ground-dust',i);
 }else if(skill.id==='field-spore'){
  part('field-cloud');
  for(let i=0;i<6;i++)part('field-spore',i);
 }else if(skill.id==='field-mucus'){
  const tether=document.createElement('div');tether.className='field-tether';
  const d='M '+source.x+' '+source.y+' Q '+Math.round((source.x+target.x)/2)+' '+Math.round(Math.min(source.y,target.y)-60*size)+' '+target.x+' '+target.y;
  const brushId='field-brush-'+combatFxSerial++;
  tether.innerHTML='<svg viewBox="0 0 '+width+' '+height+'" aria-hidden="true"><defs><filter id="'+brushId+'" x="-10%" y="-30%" width="120%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="7" result="grain"/><feDisplacementMap in="SourceGraphic" in2="grain" scale="3" xChannelSelector="R" yChannelSelector="G"/></filter></defs><g filter="url(#'+brushId+')"><path class="field-whip-shadow" d="'+d+'" pathLength="100"/><path class="field-whip" d="'+d+'" pathLength="100"/></g></svg>';
  burst.append(tether);
 }else if(skill.id==='field-wing'){
  for(let i=0;i<3;i++)part('field-gust',i);
 }
 for(let i=0;i<4;i++){
  const fleck=part('field-fleck',i);
  fleck.style.cssText+='--scatter-x:'+(i*24-36)+'px;--scatter-y:'+(-20-i%2*30)+'px;--turn:'+(i*57)+'deg;';
 }
 return appendCombatBurst(burst,1350);
}
