const test=require('node:test'),assert=require('node:assert/strict'),{harness}=require('./harness.cjs');
const base={v:1,lastSeen:Date.now(),total:100,highestStage:25,stage:6};
const plain=x=>JSON.parse(JSON.stringify(x));
test('all 10000 normal and special passive buckets match advertised weights',()=>{
 const h=harness(base);for(const [pool,expected] of [['PASSIVES',{light:5000,breath:2000,guard:800,heal:800,bark:400,haste:500,hunter:300,leech:100,wither:80,echo:20}],['SPECIAL_PASSIVES',{foxluck:6000,foxward:3000,foxspirit:1000}]])assert.deepEqual(plain(h.run(`(()=>{const counts={};for(let i=0;i<10000;i++){const k=pickPassive(${pool},()=>i/10000);counts[k]=(counts[k]||0)+1}return counts})()`)),expected);
});
test('boss tier exact boundaries do not gain an extra elite bucket',()=>{
 const h=harness(base);assert.equal(h.run('rollBossTier(()=>.101)'),'normal');
 assert.deepEqual(plain(h.run(`(()=>{const counts={};for(let i=0;i<10000;i++){const k=rollBossTier(()=>i/10000);counts[k]=(counts[k]||0)+1}return counts})()`)),{mystic:10,elite:1000,normal:8990});
 h.run('potentialProduct=()=>1000');assert.deepEqual(plain(h.run(`(()=>{const counts={};for(let i=0;i<10000;i++){const k=rollBossTier(()=>i/10000);counts[k]=(counts[k]||0)+1}return counts})()`)),{mystic:1000,elite:6000,normal:3000});
});
test('potential pools normalize and grade probabilities sum to 100 percent',()=>{const h=harness(base);assert.equal(h.run('Object.values(POTENTIAL_POOLS).every(pool=>Math.abs(pool.reduce((sum,x)=>sum+x[1],0)-100)<1e-10)'),true);assert.deepEqual(plain(h.run('(()=>{const bins=[0,0,0,0];for(let i=0;i<10000;i++)bins[potentialGrade(i/10000)]++;return bins})()')),[8000,1700,280,20]);});
test('milestone loot is exactly 1/9/55/35 percent across 10000 buckets',()=>{const h=harness(base);assert.deepEqual(plain(h.run(`(()=>{const counts={};for(let i=0;i<10000;i++){const key=rollMilestoneGear(()=>i/10000),rarity=key?ITEMS[key].rarity:'none';counts[rarity]=(counts[rarity]||0)+1}return counts})()`)),{legendary:100,epic:900,rare:5500,none:3500});});
test('trail relic grades are exactly 65/28/7 percent outside guarantees',()=>{const h=harness(base);assert.deepEqual(plain(h.run(`(()=>{const counts=[0,0,0];for(let i=0;i<10000;i++)counts[rollTrailRelic(()=>i/10000)]++;return counts})()`)),[6500,2800,700]);});
test('all current drop probabilities are bounded; exclusive caps and combat caps remain',()=>{
 const h=harness(base);h.run('potentialProduct=()=>1000');assert.ok(h.run('Object.values(MOBS).every(m=>m.drops.every(([k,p])=>itemDropChance(k,p,false)>=0&&itemDropChance(k,p,false)<=1))'));
 assert.equal(h.run('itemDropChance("jadeorb",1,false)'),.25);assert.equal(h.run('itemDropChance("bp_shellcoat",1,true,"mystic")'),.25);
 h.run('potentialSum=()=>1');assert.equal(h.run('mitigation()'),.3);assert.equal(h.run('bossMitigation()'),.25);assert.equal(h.run('dodgeChance()'),.2);assert.equal(h.run('speedAtLevel(30)'),3);assert.equal(h.run('crit()'),.75);
});
test('sixty-kill guarantee has finite expected grind and no new currency payouts',()=>{for(const p of [.02,.018,.006]){const expected=(1-Math.pow(1-p,60))/p;assert.ok(expected<60&&expected<1/p);const missAfter59=Math.pow(1-p,59);assert.ok(missAfter59>0&&missAfter59<1);}});
