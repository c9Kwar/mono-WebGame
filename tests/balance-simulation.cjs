const {harness,assert}=require('./harness.cjs');
const rows=[];
for(const spec of [
 {boss:0,attack:10,vitality:5,guard:3,speed:5,expect:'defeated'},
 {boss:0,attack:22,vitality:18,guard:15,speed:10,expect:'victory'},
 {boss:1,attack:35,vitality:30,guard:30,speed:15,expect:'victory'},
 {boss:2,attack:46,vitality:45,guard:60,speed:20,expect:'victory'},
 {boss:3,attack:53,vitality:55,guard:80,speed:25,expect:'victory'},
 {boss:4,attack:61,vitality:65,guard:100,speed:30,expect:'victory'}
]){
 const h=harness({v:1,lastSeen:Date.now(),total:100,highestStage:25,stage:6,...spec});
 h.run(`Math.random=()=>.5;boss=true;bossId=${spec.boss};bossTier='normal';bossLeft=60;spawn();s.heroHp=heroMaxHp();`);
 let elapsed=0;while(h.run('phase')==='combat'&&elapsed<61){h.run('tick(.1)');elapsed+=.1}
 const result={boss:spec.boss+1,attackLevel:spec.attack,hpLevel:spec.vitality,defenseLevel:spec.guard,speedLevel:spec.speed,seconds:+elapsed.toFixed(1),result:h.run('phase'),remainingHP:Math.round(h.run('s.heroHp'))};rows.push(result);
 assert.equal(result.result,spec.expect);
}
// Compare a fully collected ordinary passive loadout under reproducible RNG.
for(const full of [false,true]){
 const h=harness({v:1,lastSeen:Date.now(),total:100,highestStage:11,attack:35,vitality:30,guard:30,speed:15,passives:full?{light:5,guard:5,heal:5,haste:5,leech:5,echo:5}:{}});
 h.run('var seed=119;Math.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};boss=true;bossId=1;bossTier="normal";bossLeft=60;spawn();s.heroHp=heroMaxHp()');
 let seconds=0;while(h.run('phase')==='combat'&&seconds<61){h.run('tick(.1)');seconds+=.1}
 rows.push({loadout:full?'all ordinary passives Lv.5':'no passives',seconds:+seconds.toFixed(1),result:h.run('phase'),remainingHP:Math.round(h.run('s.heroHp'))});assert.equal(h.run('phase'),'victory');
}
console.log(JSON.stringify(rows,null,2));
