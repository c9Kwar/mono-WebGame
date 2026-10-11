const test=require('node:test'),assert=require('node:assert/strict'),{harness}=require('./harness.cjs');
const base={v:1,lastSeen:Date.now(),total:100,highestStage:25,paused:true};
test('unlocked unequipped rare recommendations, exceptional rolls and wards can be bulk dismantled',()=>{
 const h=harness(base);h.run("award('practiceblade',1,()=>0);award('tunic',1,()=>0);award('boots',1,()=>.5);s.gear[2].locked=true;award('trousers',1,()=>.5);s.slots.legs=s.gear[3].id");
 assert.equal(h.run('bulkCandidates(1).length'),2);assert.equal(h.run('s.gear[0].exceptional'),true);assert.ok(h.run('s.gear[1].ward>0'));
 h.run("$('bulk-rarity').value='1'");assert.equal(h.run('previewBulkDismantle()'),true);assert.equal(h.run('confirmBulkDismantle()'),2);assert.equal(h.run('s.inventory.stone_rare'),2);assert.equal(h.run('s.gear.length'),2);
 h.run('save()');const r=harness(JSON.parse(h.stored['mosslight.save.v1']));assert.equal(r.run('s.gear.length'),2);assert.equal(r.run('s.gear[0].locked'),true);assert.ok(r.run('equippedGear("legs")'));
});
test('unchanged recommendation button stays actionable and opens comparison',()=>{
 const h=harness(base);h.run("award('practiceblade',1,()=>.5);equipRecommended();renderEquipment()");assert.equal(h.nodes.get('equip-recommended').disabled,false);
 const before=h.run('JSON.stringify([s.slots,s.inventory,s.gold])');h.nodes.get('equip-recommended').onclick();assert.equal(h.nodes.get('loadout-details').open,true);assert.equal(h.run('JSON.stringify([s.slots,s.inventory,s.gold])'),before);
});
test('boss rows are compact click targets and remain stable through timer refresh',()=>{
 const h=harness(base);h.run('renderBossList()');const row=h.nodes.get('boss-list').children[4];row.onclick();assert.equal(h.nodes.get('quick-boss-dialog').open,true);assert.equal(h.run('quickBossId'),4);h.run('s.total++;renderBossList()');assert.equal(h.nodes.get('boss-list').children[4],row);
});
