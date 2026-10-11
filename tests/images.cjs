const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(require('path').join(__dirname,'../dist/game.js'),'utf8');
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve()};
function harness(){
 const pending=[],nodes=new Map();
 function node(id){if(!nodes.has(id))nodes.set(id,{style:{},attributes:{},classList:{toggle(k,v){this[k]=v}},setAttribute(k,v){this.attributes[k]=v},hidden:true});return nodes.get(id)}
 class Image{constructor(){this.naturalWidth=100}set src(v){this.url=v;pending.push(this)}decode(){return Promise.resolve()}}
 const MOBS={slime:{name:'슬라임',image:'cute-slime.webp'},mushroom:{name:'버섯',image:'mushroom.webp'},moth:{name:'나방',image:'moth.webp'},snail:{name:'달팽이',image:'snail-sprite.webp',sprite:true},rabbit:{name:'토끼',image:'rabbit-sprite.webp',sprite:true},treasure:{name:'보물여우',image:'treasure.webp'}};
 for(const id of ['slime','mushroom','moth','snail','rabbit'])MOBS['elite'+id[0].toUpperCase()+id.slice(1)]={...MOBS[id],elite:true,name:'엘리트 '+MOBS[id].name};
 const ctx=vm.createContext({Image,setTimeout:()=>1,clearTimeout(){},Date,console,$:node,bossSprite:()=> 'moss-turtle-sprite.webp',boss:false,bossId:0,currentMob:'slime',BOSSES:[{name:'보스'}],MOBS});
 vm.runInContext(source.split('// Combat visuals')[0]+'\n'+source.match(/function sceneImage\(\)\{[^\n]+/)[0],ctx);
 const run=s=>vm.runInContext(s,ctx);
 run('battleWarmStarted=true');
 return {pending,node,ctx,run};
}
(async()=>{
 const {pending,node,ctx,run}=harness();
 run('renderBattleScene()');assert.deepEqual(pending.map(i=>i.url),['battle-clearing.webp','cute-slime.webp','knight-sprite.webp']);
 run('renderBattleScene()');assert.equal(pending.length,3,'Repeated renders share in-flight downloads');
 ctx.currentMob='mushroom';run('renderBattleScene()');assert.equal(pending.length,4);
 pending[0].onload();pending[1].onload();await flush();
 assert.equal(node('arena').style.backgroundImage,undefined,'Background and enemy do not paint before the hero decodes');
 pending[2].onload();await flush();assert.equal(node('arena').attributes['data-species'],undefined,'A completed stale slime request cannot replace the current mushroom encounter');
 pending[3].onload();await flush();assert.equal(node('arena').style.backgroundImage,'url("battle-clearing.webp")');assert.equal(node('arena').attributes['data-species'],'mushroom');assert.equal(node('arena').classList['layered-scene'],true);
 ctx.currentMob='slime';run('renderBattleScene()');await flush();assert.equal(pending.length,4);assert.equal(node('arena').attributes['data-species'],'slime');

 ctx.currentMob='moth';run('renderBattleScene()');pending.at(-1).onerror();pending.at(-1).onerror();await flush();
 assert.equal(node('arena').attributes['data-species'],'slime','Failed actor load preserves the entire previous scene');assert(run('battleSceneRetryAt')>Date.now());assert.equal(node('scene-load-status').hidden,false);
 const failedCount=pending.length;run('renderBattleScene()');assert.equal(pending.length,failedCount,'Failure backoff does not issue another download');
 run('battleSceneRetryAt=1;renderBattleScene()');pending.at(-1).onload();await flush();assert.equal(node('arena').attributes['data-species'],'moth');assert.equal(node('scene-load-status').hidden,true);

 for(const id of Object.keys(ctx.MOBS)){
  ctx.currentMob=id;run('renderBattleScene()');for(const image of pending)if(image.onload)image.onload();await flush();
  assert.equal(node('arena').classList['layered-scene'],true,id+' renders an independent hero');
  assert.equal(node('arena').attributes['data-species'],id.toLowerCase().replace(/^elite/,''));
  assert.equal(node('arena').attributes['aria-busy'],'false');
 }
 assert(!pending.some(i=>i.url==='mushroom.webp'||i.url==='treasure.webp'),'Landscape-only mushroom/fox artwork never appears behind the animated hero');
 assert.equal(node('enemy-actor').src,'rabbit-sprite.webp');
 ctx.boss=true;run('renderBattleScene()');pending.at(-1).onload();await flush();assert.equal(node('enemy-actor').src,'moss-turtle-sprite.webp');assert.equal(node('arena').attributes['data-species'],'guardian');

 const decode=harness();decode.run('renderBattleScene()');let finishDecode;
 decode.pending[2].decode=()=>new Promise(resolve=>{finishDecode=resolve});
 for(const image of decode.pending)image.onload();await flush();assert.equal(decode.node('arena').style.backgroundImage,undefined,'All three decode promises must resolve before a scene is visible');
 finishDecode();await flush();assert.equal(decode.node('scene-load-status').hidden,true);
 console.log('PASS all 11 layered encounters, shared image cache, decode atomicity, stale race, bounded retry, recovery');
})().catch(e=>{console.error(e);process.exitCode=1});
