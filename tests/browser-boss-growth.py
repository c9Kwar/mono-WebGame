"""Boss progression UI and tier persistence in real Chromium."""
import os, shutil, json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':1080})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('GAME_URL','http://127.0.0.1:8082'))
 page.evaluate('s.paused=true;s.total=100;s.highestStage=30;s.chapterOneCleared=true;s.vitality=60;s.heroHp=heroMaxHp();save()')
 page.locator('#header-boss').click();page.locator('#quick-boss-list button').nth(4).click()
 assert '관통 35%' in page.locator('#quick-boss-stats').inner_text()
 assert '재생 9,000 HP' in page.locator('#quick-boss-stats').inner_text()
 page.locator('#boss-extra-details > summary').click()
 assert 'T3 장비 확정' in page.locator('#quick-boss-rewards').inner_text()
 assert '엘리트 장비 T3 / 미스틱 T3' in page.locator('#quick-boss-variants').inner_text()
 page.locator('#boss-extra-details > summary').click()
 for width in [390,800,1440]:
  page.set_viewport_size({'width':width,'height':1080})
  assert page.locator('#quick-boss-dialog').evaluate('(el)=>el.scrollWidth<=el.clientWidth'),width
  page.screenshot(path=f'/tmp/mosslight-boss-growth-{width}.png')
 # A saved T6 remains valid; a new award asking for T6 must now stop at T3.
 page.evaluate("document.querySelector('#quick-boss-dialog').close();award('mossblade',1,()=>.5,'test',1);const fresh=award('mossblade',1,()=>.5,'test',6);if(fresh.tier!==3)throw Error('new chapter tier escaped');const legacy={...fresh,id:'g'+s.nextGearId++,tier:6,potentials:rollPotentials('mossblade',()=>.5,6)};s.gear.push(legacy);s.inventory.mossblade++;renderLoot();save()")
 page.locator('#tab-equipment').click()
 assert all(tier in page.locator('#gear-list').inner_text() for tier in ['T1','T3','T6'])
 assert '챕터 1 · 신규 장비 T1~T3' in page.locator('#equipped-label').inner_text()
 page.locator('#gear-list .gear-tile').first.hover();assert 'T6' in page.locator('#tip-stats').inner_text()
 page.reload();page.locator('#tab-equipment').click();assert 'T6' in page.locator('#gear-list').inner_text()
 page.set_viewport_size({'width':390,'height':1080});page.screenshot(path='/tmp/mosslight-tier-mobile.png',full_page=True)
 result=page.evaluate('''()=>{s.paused=false;boss=true;bossId=4;bossTier='normal';bossLeft=60;spawn();hp=100000;stepCombat(.1);const healed=hp;s.paused=true;stepCombat(1);return {healed,paused:hp,ui:document.querySelector('#enemy-attack-info').textContent}}''')
 assert abs(result['healed']-100900)<.001 and result['healed']==result['paused'],result
 assert '방어 관통 35%' in result['ui']
 page.evaluate("s.paused=false;damage(1e12);s.paused=true;save();render()")
 assert page.evaluate('s.battleReward.rows.filter(r=>r.gear).length>0&&s.battleReward.rows.filter(r=>r.gear).every(r=>r.gear.tier===3)')
 count=page.evaluate('s.gear.length');page.reload();assert page.evaluate('s.gear.length')==count
 assert not errors,errors
 print(json.dumps({'result':'PASS boss penetration/regen/rewards, three viewport layouts, Chapter 1 T1–T3 cap, legacy T6 comparison/persistence and T3 victory receipt','regeneration':result['healed']-100000}))
 browser.close()
