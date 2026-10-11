"""Density, click disclosures, enabled recommendations and rare salvage in Chromium."""
import os,shutil,json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 page=b.new_page(viewport={'width':390,'height':844});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('GAME_URL','http://127.0.0.1:8082'))
 page.evaluate("s.paused=true;s.total=100;s.highestStage=25;for(let i=0;i<12;i++)award('practiceblade',1,()=>i/20);renderLoot();save()")
 for w in [390,800,1440]:
  page.set_viewport_size({'width':w,'height':900});page.locator('#tab-boss').click()
  assert page.locator('#boss-list').bounding_box()['height']<560
  page.screenshot(path=f'/tmp/mosslight-compact-boss-{w}.png',full_page=True)
  page.locator('#boss-list .boss-select').last.click()
  assert '밤톨' in page.locator('#quick-boss-name').inner_text()
  assert not page.locator('#boss-extra-details').evaluate('(e)=>e.open')
  page.locator('#boss-extra-details > summary').click();assert page.locator('#quick-boss-rewards').is_visible()
  page.locator('#boss-extra-details > summary').click()
  assert page.locator('#quick-boss-dialog').evaluate('(e)=>e.scrollWidth<=e.clientWidth')
  page.screenshot(path=f'/tmp/mosslight-compact-detail-{w}.png')
  page.locator('#quick-boss-close').click();page.locator('#tab-equipment').click()
  assert not page.locator('.preparation-help').evaluate('(e)=>e.open')
  assert not page.locator('#loadout-details').evaluate('(e)=>e.open')
  assert page.locator('#gear-list .gear-cell').first.bounding_box()['height']<115
  first=page.locator('#gear-list .gear-cell').nth(0).bounding_box();second=page.locator('#gear-list .gear-cell').nth(1).bounding_box();assert abs(first['y']-second['y'])<1
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  page.screenshot(path=f'/tmp/mosslight-compact-equipment-{w}.png',full_page=True)
 page.locator('#equip-recommended').click();assert page.locator('#equip-recommended').is_enabled()
 page.locator('#equip-recommended').click();assert page.locator('#loadout-details').evaluate('(e)=>e.open')
 page.evaluate("s.gear[0].locked=true;renderEquipment()")
 page.locator('#bulk-rarity').select_option('1');page.locator('#bulk-salvage').click()
 assert '희귀 이하는 추천' in page.locator('#salvage-options').inner_text()
 page.locator('#salvage-confirm').click();assert page.evaluate('s.gear.length')==2
 page.reload();page.locator('#tab-equipment').click();assert page.evaluate('s.gear.length')==2
 assert page.locator('.gear-salvage:disabled').count()==2
 assert not errors,errors
 print(json.dumps({'result':'PASS compact boss click details, touch/keyboard-native disclosures, two-column mobile gear, enabled comparison, rare salvage + locked/equipped protection, reload, 3 widths'}));b.close()
