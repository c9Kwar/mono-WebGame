"""Run against a local static server. Requires Python Playwright + Chromium."""
import json, os, shutil
from playwright.sync_api import sync_playwright
BASE=os.environ.get('GAME_URL','http://127.0.0.1:8082')
KEY='mosslight.save.v1'
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':1440,'height':1000},accept_downloads=True)
 page=context.new_page();errors=[];http=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('response',lambda r:http.append(r.url) if r.status>=400 else None)
 page.goto(BASE);page.wait_for_function("typeof s!=='undefined' && typeof persistence!=='undefined'")
 page.evaluate('s.paused=true;save();render()')
 for name in ['boss','equipment','inventory','shop','collection','codex','journey','battle']:
  page.locator('#tab-'+name).click();assert page.locator('#view-'+name).is_visible()
 saved=page.evaluate('localStorage.getItem(KEY)')
 page.reload();assert page.evaluate('s.paused')
 with page.expect_download() as event:page.locator('#save-export').click()
 exported=event.value;content=json.load(open(exported.path()));assert content['v']==1
 # A second tab observes another writer and cannot spend or overwrite progress.
 other=context.new_page();other.goto(BASE)
 page.wait_for_function("persistence.status==='conflict'")
 other.evaluate('s.gold+=100;save()')
 latest=other.evaluate('localStorage.getItem(KEY)');page.locator('#attack-buy').click(force=True)
 assert page.evaluate('localStorage.getItem(KEY)')==latest
 other.close();page.reload()
 # Invalid file/cancel does not alter primary save.
 before=page.evaluate('localStorage.getItem(KEY)')
 page.locator('#save-file').set_input_files({'name':'invalid.json','mimeType':'application/json','buffer':b'{bad'})
 page.wait_for_timeout(100);assert not page.locator('#save-import-dialog').evaluate('(e)=>e.open')
 assert page.evaluate('localStorage.getItem(KEY)')==before
 legacy={'v':1,'gold':777,'total':100,'stage':6,'highestStage':25,'paused':True,'passives':{'light':3},'bossWins':[4,2,1],'attack':22,'vitality':18,'guard':15,'speed':10,'inventory':{'moss':25,'spore':10},'blueprintMisses':{'bp_shellcoat':59}}
 payload={'name':'legacy.json','mimeType':'application/json','buffer':json.dumps(legacy).encode()}
 page.locator('#save-file').set_input_files(payload)
 page.locator('#save-import-cancel').click();assert page.evaluate('localStorage.getItem(KEY)')==before
 page.locator('#save-file').set_input_files(payload)
 page.locator('#save-import-confirm').click();page.wait_for_function('s.gold===777 && s.paused')
 assert page.evaluate('localStorage.getItem(KEY+".backup")')==before
 assert page.evaluate('s.passives.light')==3
 assert page.evaluate('JSON.stringify(s.bossWins)')=='[4,2,1,0,0]'
 # Craft and protect a real equipment instance through actual UI controls.
 page.locator('#tab-inventory').click();page.locator('#craft-ready-only').uncheck();page.locator('#pin-shellcoat').click();page.locator('#tab-battle').click();page.locator('#pinned-target-sources summary').click();assert '왕관등갑 설계도' in page.locator('#pinned-target-needs').inner_text();page.locator('#tab-inventory').click();page.locator('#craft-practiceblade').click()
 assert page.evaluate('s.inventory.practiceblade')==1
 page.locator('#tab-equipment').click();page.locator('.gear-lock').first.click()
 assert page.locator('.gear-salvage').first.is_disabled()
 assert page.evaluate('s.gear[0].locked')
 for width in [390,800,1440]:
  page.set_viewport_size({'width':width,'height':1000})
  for name in ['battle','inventory','equipment','shop']:
   page.locator('#tab-'+name).click()
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),f'overflow at {width}/{name}'
 page.screenshot(path='/tmp/mosslight-improved-desktop.png',full_page=True)
 page.set_viewport_size({'width':390,'height':1000});page.locator('#tab-battle').click();page.screenshot(path='/tmp/mosslight-improved-mobile.png',full_page=True)
 # A prepared real-time boss fight, guarantee reward and replay-safe receipt.
 page.set_viewport_size({'width':1440,'height':1000});page.locator('#tab-battle').click()
 page.locator('#auto-safety').click();assert page.evaluate('s.autoSafety') is False
 page.locator('#pause').click();page.locator('#header-boss').click()
 page.locator('#quick-boss-list button').first.click()
 page.locator('#boss-extra-details > summary').click()
 assert '최대 1회' in page.locator('#quick-boss-blueprint').inner_text()
 page.locator('#quick-boss-normal').click()
 page.wait_for_function("phase==='results'",timeout=70000)
 page.evaluate('s.paused=true;save()')
 assert page.evaluate('s.bossWins[0]')==5
 assert page.evaluate('s.inventory.bp_shellcoat')==1
 reward_gold=page.evaluate('s.gold');page.reload()
 assert page.locator('#victory-dialog').evaluate('(e)=>e.open')
 page.locator('#victory-continue').click();page.locator('#reward-reopen').click();page.locator('#victory-continue').click()
 assert page.evaluate('s.gold')==reward_gold
 assert page.evaluate('s.bossWins[0]')==5
 # Corrupt record is preserved through temporary play and export.
 corrupt=browser.new_context();bad=corrupt.new_page();bad.goto(BASE)
 bad.evaluate("localStorage.setItem('mosslight.save.v1','broken-record')");bad.reload()
 assert bad.evaluate('localStorage.getItem(KEY)')=='broken-record'
 assert bad.locator('#save-warning').is_visible()
 with bad.expect_download() as event:bad.locator('#save-export').click()
 assert open(event.value.path()).read()=='broken-record'
 # No-storage mode still runs and makes the warning visible.
 blocked=browser.new_context();blocked.add_init_script("Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')}")
 denied=blocked.new_page();denied.goto(BASE)
 assert denied.locator('#save-warning').is_visible()
 assert denied.locator('#zone').inner_text()
 assert not errors,errors
 assert not http,http
 print('PASS browser: 8 tabs, reload/export, stale-tab write protection, invalid/cancelled import, confirmed import backup + legacy compatibility, 390/800/1440px, crafting/gear lock, real-time boss win + blueprint guarantee + receipt reload/review, corrupt export, denied storage')
 browser.close()
