const test=require('node:test'),assert=require('node:assert/strict'),{harness}=require('./harness.cjs');
const saved={v:1,lastSeen:Date.now(),total:100,stage:6,highestStage:25};
const read=(h,expression)=>JSON.parse(h.run('JSON.stringify('+expression+')'));

test('all 16 encounters have independent in-bounds paintings, including every elite and boss',()=>{
 const h=harness(saved),art=read(h,"[...Object.keys(MOBS),...BOSSES.map((_,i)=>'boss'+i)].map(creatureArt)");
 assert.equal(art.length,16);assert.equal(new Set(art.map(a=>a.index)).size,16);
 for(const cell of art){assert(cell.src.startsWith('art/'));assert(cell.column>=0&&cell.column<cell.columns);assert(cell.row>=0&&cell.row<cell.rows);const [x,y,size,outline]=cell.crop;assert(x>=0&&y>=0&&x+size<=1254&&y+size<=1254);assert(outline.includes('%'))}
 for(const species of ['slime','mushroom','moth','snail','rabbit'])assert.notEqual(h.run(`creatureArt('${species}').index`),h.run(`creatureArt('elite${species[0].toUpperCase()+species.slice(1)}').index`));
});

test('all 27 equipment pieces have their own painting and every material has an illustration',()=>{
 const h=harness(saved),gear=read(h,'Object.values(ITEMS).filter(i=>i.slot).map(itemArt)'),all=read(h,'Object.values(ITEMS).map(itemArt)');
 assert.equal(gear.length,27);assert.equal(new Set(gear.map(a=>a.index)).size,27);
 assert.equal(all.length,60);
 for(const cell of all){assert(cell,'Every item resolves to painted art');assert(cell.index>=0&&cell.index<cell.columns*cell.rows)}
 assert.equal(h.run("itemArt(ITEMS.practiceblade).key"),'practiceblade');
 assert.equal(h.run("itemArt(ITEMS.bp_shellcoat).key"),'blueprint');
 assert.notEqual(h.run('itemArt(ITEMS.acornblade).index'),h.run('itemArt(ITEMS.royalblade).index'));
 const mallet=read(h,'itemArt(ITEMS.acornblade)');
 assert.equal(h.run('ITEMS.acornblade.name'),'밤톨 원정 망치');
 assert.equal(mallet.src,h.run('CREATURE_ATLAS.src'));
 assert.equal(mallet.index,2,'A different source preserves the stable equipment identity');
 assert.notDeepEqual(mallet.crop,read(h,"creatureArt('boss4').crop"),'The item crops only the mallet, not its wielder');
 assert.notDeepEqual(mallet.crop,read(h,"atlasCell(EQUIPMENT_ATLAS,'acornblade').crop"),'The unused sword cell cannot stand in for a hammer');
});

test('inventory art keeps rarity, crops the last cell correctly and falls back on image failure',()=>{
 const h=harness(saved);h.run("paintItemIcon($('victory-items'),ITEMS.medal)");
 const frame=h.nodes.get('victory-items').children[0],image=frame.children[0];
 assert.equal(frame.className,'oil-art-frame premium-item-art legendary');
 const [x,y,size,outline]=read(h,'itemArt(ITEMS.medal).crop');
 assert.equal(image.style.width,1254/size*100+'%');assert.equal(image.style.height,image.style.width);
 assert.equal(image.style.left,-x/size*100+'%');assert.equal(image.style.top,-y/size*100+'%');
 assert.equal(frame.style.clipPath,'polygon('+outline+')');
 image.onerror();assert.equal(h.nodes.get('victory-items').textContent,h.run('ITEMS.medal.icon'));
});

test('art rendering consumes neither gameplay randomness nor saved resources',()=>{
 const h=harness(saved),before=h.run('JSON.stringify(s)');
 h.run(`Math.random=()=>{throw Error('Cosmetic art used gameplay randomness')};
  for(const item of Object.values(ITEMS))paintItemIcon($('victory-items'),item);
  for(const key of CREATURE_ATLAS.keys)createAtlasArt(creatureArt(key),'test-portrait');
  renderCodex();renderBossList();openQuickBoss();`);
 assert.equal(h.run('JSON.stringify(s)'),before);
});
