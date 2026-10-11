const {harness,assert}=require('./harness.cjs'),fs=require('fs'),path=require('path');
const h=harness({v:1,lastSeen:Date.now(),total:100,highestStage:25}),r=h.run;
const assets=JSON.parse(r(`JSON.stringify([CREATURE_ATLAS.src,EQUIPMENT_ATLAS.src,sceneImage(),'art/mosslight-adventurer.png',...Object.values(MOBS).map(m=>m.image),...BOSSES.map((_,i)=>bossSprite(i))])`));
for(const asset of assets)assert(fs.existsSync(path.join(__dirname,'../dist',asset)),asset);
const html=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
r(`s.gold=1e6;award('jadeorb');award('bp_shellcoat');award('shellcoat');inventoryFilter='blueprints';renderLoot()`);assert.equal(h.nodes.get('inventory-grid').children.length,1);
r(`craftRarity='legendary';setCraftFilter('all')`);assert.equal(h.nodes.get('recipe-card-shellcoat').hidden,false);assert.equal(h.nodes.get('recipe-card-foxring').hidden,true);assert.equal(h.nodes.get('recipe-card-dewboots').hidden,true);
r(`setCraftFilter('weapon')`);assert.equal(h.nodes.get('recipe-card-shellcoat').hidden,true);assert.equal(h.nodes.get('recipe-card-groveblade').hidden,false);
r(`openQuickBoss();selectQuickBoss(4)`);assert.equal(h.nodes.get('quick-boss-list').children.length,5);assert(h.nodes.get('quick-boss-stats').textContent.includes('744,000'));assert(h.nodes.get('quick-boss-survival').textContent.includes('강타'));assert.equal(h.nodes.get('quick-boss-enter').disabled,false);
const counts=JSON.parse(r(`JSON.stringify({items:Object.keys(ITEMS).length,recipes:Object.keys(RECIPES).length,mobs:Object.keys(MOBS).length,bosses:BOSSES.length,sets:COLLECTION_SETS.length})`));console.log('PASS all item/monster art paths, unique DOM IDs, compact inventory filter, rarity + slot recipe filters, 5-boss detail modal',counts);

assert(html.indexOf('id="save-import-dialog"')<html.indexOf('<script src="storage.js'));
assert(html.indexOf('<script src="storage.js')<html.indexOf('<script src="game.js'));
