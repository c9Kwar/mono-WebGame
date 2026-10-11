const test=require('node:test');const {harness,assert}=require('./harness.cjs');
const base={v:1,lastSeen:Date.now(),stage:11,highestStage:21,total:100,attack:30,vitality:40,guard:40,speed:10,gearVersion:1};
const plain=x=>JSON.parse(JSON.stringify(x));
test('three roles scale at each level and only the selected skill applies',()=>{
 const h=harness(base);const before=plain(h.run('({attack:attack(),hp:heroMaxHp(),speed:speed(),drop:luck(),gold:goldMultiplier()})'));
 for(let lv=1;lv<=3;lv++){
  h.run(`s.specialPassives={foxluck:${lv},foxward:${lv},foxspirit:${lv}};s.specialActive='foxluck'`);
  assert.ok(Math.abs(h.run('luck()')/before.drop-[1.3,1.4,1.5][lv-1])<1e-9);assert.ok(Math.abs(h.run('goldMultiplier()')/before.gold-[1.2,1.3,1.4][lv-1])<1e-9);assert.equal(h.run('attack()'),before.attack);
  h.run("s.specialActive='foxward'");assert.ok(Math.abs(h.run('heroMaxHp()')/before.hp-[1.15,1.2,1.25][lv-1])<.001);assert.ok(Math.abs(h.run('bossMitigation()')-[.12,.16,.2][lv-1])<1e-9);assert.equal(h.run('luck()'),before.drop);
  h.run("s.specialActive='foxspirit'");assert.ok(Math.abs(h.run('attack()')/before.attack-[1.2,1.275,1.35][lv-1])<.002);assert.ok(Math.abs(h.run('speed()')/before.speed-[1.08,1.11,1.14][lv-1])<1e-9);assert.equal(h.run('heroMaxHp()'),before.hp);
 }
});
test('guard stacks multiplicatively beyond capped potential reduction, speed still caps at three',()=>{
 const h=harness(base);h.run("s.specialPassives={foxward:3,foxspirit:3};s.specialActive='foxward';potentialSum=(k)=>k==='bossReduction'?1:k==='speedFlat'?3:0");assert.ok(Math.abs(h.run('bossMitigation()')-.4)<1e-9);h.run("s.specialActive='foxspirit'");assert.equal(h.run('speed()'),3);
});
test('duplicates guarantee growth, completed skills leave the pool and all-complete costs nothing',()=>{
 const h=harness(base);h.run('s.inventory.jadeorb=10');for(let i=0;i<9;i++)assert.equal(h.run('drawSpecial(()=>0)'),i<3?'foxluck':i<6?'foxward':'foxspirit');assert.deepEqual(plain(h.run('s.specialPassives')),{foxluck:3,foxward:3,foxspirit:3});assert.equal(h.run('s.inventory.jadeorb'),1);assert.equal(h.run('s.specialDraws'),9);assert.equal(h.run('drawSpecial(()=>.99)'),false);assert.equal(h.run('s.inventory.jadeorb'),1);assert.equal(h.run('s.inventory.skillstone||0'),0);
});
test('remaining weights are transparent and draw boundaries match them',()=>{
 const h=harness({...base,specialPassives:{foxluck:3},inventory:{jadeorb:3}});assert.equal(h.run("specialChance('foxward')"),.75);assert.equal(h.run("specialChance('foxspirit')"),.25);assert.equal(h.run('drawSpecial(()=>.74999)'),'foxward');assert.equal(h.run('drawSpecial(()=>.75)'),'foxspirit');assert.equal(h.run('drawSpecial(()=>1)'),'foxspirit');
});
test('existing owners get new effects without changing levels, draws, inventory or active choice',()=>{
 const raw={...base,specialPassives:{foxluck:2,foxward:3,foxspirit:1},specialActive:'foxward',specialDraws:15,inventory:{jadeorb:2},heroHp:100};const h=harness(raw);
 assert.deepEqual(plain(h.run('s.specialPassives')),raw.specialPassives);assert.equal(h.run('s.specialDraws'),15);assert.equal(h.run('s.specialActive'),'foxward');assert.equal(h.run('s.inventory.jadeorb'),2);assert.equal(h.run('s.heroHp'),100);h.run('save()');const r=harness(JSON.parse(h.stored['mosslight.save.v1']));assert.equal(r.run("specialEffect('bossReduction')"),.2);
});
test('activation, switching and upgrading HP do not provide free healing',()=>{
 const h=harness({...base,specialPassives:{foxward:1,foxluck:1},heroHp:50,inventory:{jadeorb:1}});h.run("setSpecialActive('foxward')");assert.equal(h.run('s.heroHp'),50);h.run('drawSpecial(()=>.7)');assert.equal(h.run('s.heroHp'),50);h.run("setSpecialActive('foxluck');setSpecialActive('foxward')");assert.equal(h.run('s.heroHp'),50);
});
test('no currency and save conflicts cannot spend jade or change selection',()=>{
 const h=harness({...base,specialPassives:{foxluck:1},specialActive:'foxluck'});assert.equal(h.run('drawSpecial()'),false);h.run('s.inventory.jadeorb=2;persistence.check=()=>false;var before=JSON.stringify(s)');assert.equal(h.run('drawSpecial()'),false);assert.equal(h.run("setSpecialActive('foxluck')"),false);assert.equal(h.run('JSON.stringify(s)'),h.run('before'));
});
test('reward, offline income, preparation and previews use the same special effects',()=>{
 const q=harness({...base,attack:60,vitality:70,guard:70,specialPassives:{foxluck:3}});q.run('s.gold=0;offline(60000)');const offlineGold=q.run('s.gold');q.run("s.specialActive='foxluck';s.gold=0;offline(60000)");assert.ok(q.run('s.gold')>=offlineGold*1.39);
 const h=harness(base);h.run("s.specialPassives={foxluck:3,foxward:3,foxspirit:3};phase='combat';currentMob='slime'");const gold=h.run('fieldGold()');h.run("s.specialActive='foxluck'");assert.ok(h.run('fieldGold()')>=gold*1.39);h.run("s.specialActive='foxspirit';renderUpgrades()");assert.equal(h.run('preparationStats().damage'),h.run('attack()'));assert.equal(h.run('preparationStats().speed'),h.run('speed()'));h.run("s.specialActive='foxward';renderUpgrades()");assert.equal(h.run('preparationStats().maxHp'),h.run('heroMaxHp()'));assert.ok(h.nodes.get('vitality-effect').textContent.includes(h.run('upgradeValue("vitality",s.vitality)')));
});
