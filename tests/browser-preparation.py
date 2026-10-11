"""Actual layout, purpose selection and large armory QA; same server as browser-smoke."""
import os, shutil, json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':1080})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('GAME_URL','http://127.0.0.1:8082'))
 page.evaluate('''s.paused=true;for(const key of ['practiceblade','mossblade','shellcoat','runelegs','moonboots','foxring'])award(key,1,()=>.5);save();render();renderLoot()''')
 page.locator('#tab-equipment').click()
 before=page.evaluate('JSON.stringify([s.slots,s.inventory,s.gold])')
 page.locator('#loadout-boss').click()
 assert page.locator('#loadout-boss').get_attribute('aria-pressed')=='true'
 assert page.evaluate('JSON.stringify([s.slots,s.inventory,s.gold])')==before
 page.locator('#equip-recommended').click()
 assert page.evaluate('Object.values(s.slots).filter(Boolean).length')==5
 page.reload();page.locator('#tab-equipment').click()
 assert page.locator('#loadout-boss').get_attribute('aria-pressed')=='true'
 for width in [390,800,1440]:
  page.set_viewport_size({'width':width,'height':1080})
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
  assert page.locator('#loadout-plan .loadout-choice').count()==5
  page.locator('#loadout-gather').click();page.locator('#loadout-hunt').click()
  page.screenshot(path=f'/tmp/mosslight-preparation-{width}.png',full_page=True)
 duration=page.evaluate('''()=>{for(let i=0;i<1000;i++)award('practiceblade',1,()=>.5);const start=performance.now();renderEquipment();return performance.now()-start}''')
 assert page.locator('#gear-list .gear-cell').count()==24
 first=page.locator('#gear-list').inner_text()
 page.locator('#gear-page-next').click()
 assert '2 /' in page.locator('#gear-page-status').inner_text()
 page.locator('#gear-category-ring').click()
 assert '1 / 1' in page.locator('#gear-page-status').inner_text()
 assert page.locator('#gear-page-next').is_disabled()
 page.locator('#loadout-balanced').focus();page.keyboard.press('Enter')
 assert page.locator('#loadout-balanced').get_attribute('aria-pressed')=='true'
 assert not errors,errors
 print(json.dumps({'result':'PASS preparation UI, persistence, explicit equip, keyboard, 3 viewport sizes, 1006-instance pagination','armory_render_ms':round(duration,2),'max_rows':24}))
 browser.close()
