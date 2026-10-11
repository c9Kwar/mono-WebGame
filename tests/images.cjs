const fs=require('fs'),vm=require('vm'),assert=require('assert');
const pending=[],nodes=new Map();
function node(id){if(!nodes.has(id))nodes.set(id,{style:{},classList:{toggle(k,v){this[k]=v}},setAttribute(){},hidden:true});return nodes.get(id)}
class Image{constructor(){this.naturalWidth=100}set src(v){this.url=v;pending.push(this)}decode(){return Promise.resolve()}}
const ctx=vm.createContext({Image,setTimeout:()=>1,clearTimeout(){},Date,console,$:node,bossSprite:()=> 'moss-turtle-sprite.webp',boss:false,bossId:0,currentMob:'slime',BOSSES:[{name:'보스'}],MOBS:{slime:{name:'슬라임'},mushroom:{name:'버섯'}},sceneImage:()=>ctx.currentMob+'.webp'});
vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist/game.js'),'utf8').split('// Combat visuals')[0],ctx);
const run=s=>vm.runInContext(s,ctx),flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve()};
(async()=>{
run('battleWarmStarted=true;renderBattleScene()');assert.equal(pending.length,1);run('renderBattleScene()');assert.equal(pending.length,1);
ctx.currentMob='mushroom';run('renderBattleScene()');pending[0].onload();await flush();assert.equal(node('arena').style.backgroundImage,undefined);
pending[1].onload();await flush();assert.equal(node('arena').style.backgroundImage,'url("mushroom.webp")');
ctx.currentMob='slime';run('renderBattleScene()');await flush();assert.equal(pending.length,2);assert.equal(node('arena').style.backgroundImage,'url("slime.webp")');
ctx.boss=true;run('renderBattleScene()');const batch=pending.slice(2);assert.equal(batch.length,2);batch[0].onerror();pending.at(-1).onerror();batch[1].onload();await flush();assert.equal(node('arena').style.backgroundImage,'url("slime.webp")');assert(run('battleSceneRetryAt')>Date.now());assert.equal(node('scene-load-status').hidden,false);
run('battleSceneRetryAt=1;renderBattleScene()');pending.at(-1).onload();await flush();assert.equal(node('arena').classList['layered-scene'],true);assert.equal(node('enemy-actor').src,'moss-turtle-sprite.webp');assert.equal(node('scene-load-status').hidden,true);
console.log('PASS image cache, decode, stale race, atomic scene, bounded retry, recovery');
})().catch(e=>{console.error(e);process.exitCode=1});
