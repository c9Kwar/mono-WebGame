"""Boss progression UI and tier persistence in real Chromium."""
import os, shutil, json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':1080})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('GAME_URL','http://127.0.0.1:8082'))
 page.evaluate('s.paused=true;s.total=100;s.highestStage=25;s.vitality=60;s.heroHp=heroMaxHp();save()')
 page.locator('#header-boss').click();page.locator('#quick-boss-list button').nth(4).click()
 assert '관통 35%' in page.locator('#quick-boss-stats').inner_text()
 assert '재생 5,400 HP' in page.locator('#quick-boss-stats').inner_text()
 page.locator('#boss-extra-details > summary').click()
 assert 'T6 장비 확정' in page.locator('#quick-boss-rewards').inner_text()
 assert 'T8' in page.locator('#quick-boss-variants').inner_text()
 page.locator('#boss-extra-details > summary').click()
 for width in [390,800,1440]:
  page.set_viewport_size({'width':width,'height':1080})
  assert page.locator('#quick-boss-dialog').evaluate('(el)=>el.scrollWidth<=el.clientWidth'),width
  page.screenshot(path=f'/tmp/mosslight-boss-growth-{width}.png')
 page.evaluate("document.querySelector('#quick-boss-dialog').close();award('mossblade',1,()=>.5,'test',1);award('mossblade',1,()=>.5,'test',6);renderLoot();save()")
 page.locator('#tab-equipment').click()
 assert 'T6' in page.locator('#gear-list').inner_text() and 'T1' in page.locator('#gear-list').inner_text()
 page.locator('#gear-list .gear-tile').first.hover();assert 'T6' in page.locator('#tip-stats').inner_text()
 page.reload();page.locator('#tab-equipment').click();assert 'T6' in page.locator('#gear-list').inner_text()
 page.set_viewport_size({'width':390,'height':1080});page.screenshot(path='/tmp/mosslight-tier-mobile.png',full_page=True)
 result=page.evaluate('''()=>{s.paused=false;boss=true;bossId=4;bossTier='normal';bossLeft=60;spawn();hp=100000;stepCombat(.1);const healed=hp;s.paused=true;stepCombat(1);return {healed,paused:hp,ui:document.querySelector('#enemy-attack-info').textContent}}''')
 assert abs(result['healed']-100540)<.001 and result['healed']==result['paused'],result
 assert '방어 관통 35%' in result['ui']
 page.evaluate("s.paused=false;damage(1e12);s.paused=true;save();render()")
 assert page.evaluate('s.battleReward.rows.some(r=>r.gear?.tier===6)')
 count=page.evaluate('s.gear.length');page.reload();assert page.evaluate('s.gear.length')==count
 assert not errors,errors
 print(json.dumps({'result':'PASS boss penetration/regen/rewards, three viewport layouts, T1/T6 comparison, saved tiers and victory receipt','regeneration':result['healed']-100000}))
 browser.close()
