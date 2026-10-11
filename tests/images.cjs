const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(require('path').join(__dirname,'../dist/game.js'),'utf8');
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve()};
function harness(){
 const pending=[],nodes=new Map();
 function node(id){if(!nodes.has(id))nodes.set(id,{style:{},attributes:{},classList:{add(k){this[k]=true},toggle(k,v){this[k]=v}},setAttribute(k,v){this.attributes[k]=v},hidden:true});return nodes.get(id)}
 class Image{constructor(){this.naturalWidth=100}set src(v){this.url=v;pending.push(this)}decode(){return Promise.resolve()}}
 const MOBS={};for(const id of ['slime','mushroom','moth','snail','rabbit','treasure'])MOBS[id]={name:id};
 for(const id of ['slime','mushroom','moth','snail','rabbit'])MOBS['elite'+id[0].toUpperCase()+id.slice(1)]={elite:true,name:'엘리트 '+id};
 const ctx=vm.createContext({Image,setTimeout:()=>1,clearTimeout(){},Date,console,$:node,boss:false,bossId:0,currentMob:'slime',BOSSES:Array.from({length:5},(_,i)=>({name:'보스'+i})),MOBS});
 vm.runInContext(source.split('// Combat visuals')[0]+'\n'+source.match(/function sceneImage\(\)\{[^\n]+/)[0],ctx);
 const run=s=>vm.runInContext(s,ctx);run('battleWarmStarted=true');
 return {pending,node,ctx,run};
}
(async()=>{
 const {pending,node,ctx,run}=harness();
 run('renderBattleScene()');assert.deepEqual(pending.map(i=>i.url),['art/mosslight-clearing.png','art/mosslight-creatures.png','art/mosslight-adventurer.png']);
 run('renderBattleScene()');assert.equal(pending.length,3,'Repeated renders share in-flight downloads');
 ctx.currentMob='mushroom';run('renderBattleScene()');assert.equal(pending.length,3,'An entire bestiary shares one sheet download');
 pending[0].onload();pending[1].onload();await flush();
 assert.equal(node('arena').style.backgroundImage,undefined,'Background and enemy do not paint before the hero decodes');
 pending[2].onload();await flush();assert.equal(node('arena').attributes['data-species'],'mushroom','The stale slime callback cannot repaint the current encounter');
 assert.equal(node('painted-enemy').attributes['data-art-key'],'mushroom');
 assert.equal(node('arena').style.backgroundImage,'url("art/mosslight-clearing.png")');
 ctx.currentMob='slime';run('renderBattleScene()');await flush();assert.equal(pending.length,3);assert.equal(node('painted-enemy').attributes['data-art-key'],'slime');

 // Simulate a cold sheet after the previous complete scene has painted.
 run('battleImages.delete(CREATURE_ATLAS.src)');ctx.currentMob='moth';run('renderBattleScene()');
 pending.at(-1).onerror();pending.at(-1).onerror();await flush();
 assert.equal(node('arena').attributes['data-species'],'slime','Failed actor load preserves the entire previous scene');
 assert.equal(node('painted-enemy').attributes['data-art-key'],'slime');assert(run('battleSceneRetryAt')>Date.now());
 assert.equal(node('scene-load-status').hidden,false);
 const failedCount=pending.length;run('renderBattleScene()');assert.equal(pending.length,failedCount,'Failure backoff does not issue another download');
 run('battleSceneRetryAt=1;renderBattleScene()');pending.at(-1).onload();await flush();assert.equal(node('arena').attributes['data-species'],'moth');assert.equal(node('scene-load-status').hidden,true);

 for(const id of Object.keys(ctx.MOBS)){
  ctx.currentMob=id;run('renderBattleScene()');await flush();
  assert.equal(node('arena').classList['layered-scene'],true,id+' renders an independent hero');
  assert.equal(node('arena').attributes['data-species'],id.toLowerCase().replace(/^elite/,''));
  assert.equal(node('painted-enemy').attributes['data-art-key'],id,'Elites retain their own paintings');
  assert.equal(node('arena').attributes['aria-busy'],'false');
 }
 ctx.boss=true;
 for(let id=0;id<5;id++){ctx.bossId=id;run('renderBattleScene()');await flush();assert.equal(node('painted-enemy').attributes['data-art-key'],'boss'+id)}
 assert.equal(node('enemy-actor').src,'art/mosslight-creatures.png');
 assert(!pending.some(i=>!i.url.startsWith('art/')),'Legacy landscapes are preserved on disk without appearing in the painted battle');

 const decode=harness();decode.run('renderBattleScene()');let finishDecode;
 decode.pending[2].decode=()=>new Promise(resolve=>{finishDecode=resolve});
 for(const image of decode.pending)image.onload();await flush();assert.equal(decode.node('arena').style.backgroundImage,undefined,'All three decode promises must resolve before a scene is visible');
 finishDecode();await flush();assert.equal(decode.node('scene-load-status').hidden,true);
 console.log('PASS all 16 painted encounters, shared atlas cache, decode atomicity, stale race, bounded retry, recovery');
})().catch(e=>{console.error(e);process.exitCode=1});
