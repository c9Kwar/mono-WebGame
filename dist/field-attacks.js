/* Ordinary forest attacks are deterministic paint and motion, never extra hits. */
const FIELD_SKILLS={
 slime:{id:'field-acid',name:'이끼 산성 수액',cue:'몸을 낮춘 뒤 산성 수액을 뱉습니다',glyph:'·',field:true},
 mushroom:{id:'field-spore',name:'자두빛 포자 숨결',cue:'갓을 움츠린 뒤 포자를 퍼뜨립니다',glyph:'·',field:true},
 snail:{id:'field-mucus',name:'이슬 점액 채찍',cue:'껍질에 몸을 모은 뒤 끈끈한 점액을 뻗습니다',glyph:'⌁',field:true},
 moth:{id:'field-wing',name:'달가루 날갯바람',cue:'날개를 접었다 펴며 인분을 날립니다',glyph:'⌁',field:true},
 rabbit:{id:'field-kick',name:'새싹 뒷발차기',cue:'뒷발에 힘을 모아 짧게 뛰어 찹니다',glyph:'⌁',field:true}
};

function fieldAttackGeometry(skill){
 const arena=$('arena'),layer=$('combat-fx').getBoundingClientRect(),enemy=$('painted-enemy').getBoundingClientRect(),hero=arena.querySelector('.hero-position').getBoundingClientRect();
 const width=layer.width||layer.right-layer.left||600,height=layer.height||400;
 const point=(x,y)=>({x:Math.round(Math.max(8,Math.min(width-8,x))),y:Math.round(Math.max(8,Math.min(height-8,y)))});
 const sourceY=({'field-acid':.64,'field-spore':.48,'field-mucus':.76,'field-wing':.43,'field-kick':.77})[skill.id];
 const source=point(enemy.left-layer.left+(enemy.width||enemy.right-enemy.left)*.25,enemy.top-layer.top+enemy.height*sourceY);
 let target=point(hero.left-layer.left+(hero.width||hero.right-hero.left)*.42,hero.top-layer.top+hero.height*.62);
 // SVG coordinates include the illustration's transparent margins and meet alignment.
 const matrix=arena.querySelector('.hero-rig')?.getScreenCTM?.();
 if(matrix)target=point(matrix.a*635+matrix.c*610+matrix.e-layer.left,matrix.b*635+matrix.d*610+matrix.f-layer.top);
 return {source,target,width,height};
}

function emitFieldAttack(skill){
 if(!skill?.field||!Object.values(FIELD_SKILLS).includes(skill)||quietCombatEffects()||s.paused)return false;
 const {source,target,width}=fieldAttackGeometry(skill),burst=document.createElement('div');
 burst.className='combat-burst encounter-fx field-attack skill-'+skill.id;
 burst.style.cssText='--source-x:'+source.x+'px;--source-y:'+source.y+'px;--target-x:'+target.x+'px;--target-y:'+target.y+'px;--field-size:'+Math.min(1,width/550)+';';
 for(const part of ['source','contact']){const node=document.createElement('i');node.className='field-'+part;burst.append(node)}
 const arc=skill.id==='field-mucus'?8:skill.id==='field-spore'?24:skill.id==='field-kick'?36:48;
 for(let i=0;i<6;i++){
  const mote=document.createElement('i'),spread=(i-2.5)*5;
  // A fixed curved flight per brush mark. No gameplay RNG or random timers.
  const cx=Math.round((source.x+target.x)/2),cy=Math.round(Math.min(source.y,target.y)-arc+spread);
  mote.className='field-mote';
  mote.style.cssText='--i:'+i+';--delay:'+(i*17)+'ms;--turn:'+(i*39-60)+'deg;--scatter-x:'+((i%3-1)*19)+'px;--scatter-y:'+(-20-i*3)+'px;offset-path:path("M '+source.x+' '+source.y+' Q '+cx+' '+cy+' '+target.x+' '+(target.y+spread)+'");';
  burst.append(mote);
 }
 for(let i=0;i<3;i++){
  const fleck=document.createElement('i');fleck.className='field-fleck';
  fleck.style.cssText='--i:'+i+';--scatter-x:'+(i*22-22)+'px;--scatter-y:'+(-16-i%2*21)+'px;--turn:'+(i*57)+'deg;';burst.append(fleck);
 }
 return appendCombatBurst(burst,1050);
}
