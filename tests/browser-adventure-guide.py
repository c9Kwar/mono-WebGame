"""Real controls at phone, tablet and desktop widths; battle never depends on a visual effect."""
import json,os,shutil
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 errors=[]
 for width in [390,800,1440]:
  page=browser.new_page(viewport={'width':width,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)))
  page.add_init_script('window.setInterval=()=>0');page.goto(os.environ.get('GAME_URL','http://127.0.0.1:8082'))
  page.wait_for_function("typeof s!=='undefined' && $('arena').getAttribute('aria-busy')==='false'")
  assert '첫 숲길' in page.locator('#guide-title').inner_text()
  page.locator('#guide-action').click();assert page.evaluate("document.activeElement.id==='vitality-buy'")
  page.evaluate("s.total=150;s.stage=11;s.highestStage=16;s.gold=1000;phase='combat';boss=false;currentMob='slime';s.heroHp=heroMaxHp();hp=maxHp=500;render();window.scrollTo(0,0)")
  assert '4개' in page.locator('#guide-claim').inner_text()
  page.locator('#guide-claim').click();assert page.evaluate('s.gold')==7600;assert page.locator('#guide-claim').is_hidden()
  receipt=page.evaluate('JSON.stringify([s.inventory,s.gold,s.claimedMilestones])')
  page.reload();page.wait_for_function('s.claimedMilestones.length===4');assert page.evaluate('JSON.stringify([s.inventory,s.gold,s.claimedMilestones])')==receipt
  page.locator('#open-route').click();assert page.locator('#route-stage option').count()==16
  page.locator('#route-stage').select_option('3');page.locator('#route-go').click()
  assert page.evaluate('s.stage')==11;assert page.evaluate('s.queuedRoute.stage')==3;assert '이동 예약' in page.locator('#guide-title').inner_text()
  page.reload();page.wait_for_function('s.queuedRoute?.stage===3');page.evaluate("damage(1e9);stepCombat(1);render()")
  assert page.evaluate('s.stage===3 && s.farmMode && s.queuedRoute===null && s.highestStage===16')
  page.locator('#open-route').click();page.locator('#route-frontier').click();assert page.evaluate('s.stage===16 && !s.farmMode')
  page.evaluate("pinRecipe('practiceblade');s.inventory.moss=0;craftReadyOnly=true;craftRarity='mythic';render();renderLoot()")
  page.locator('#pinned-target-open').click();assert page.locator('#recipe-card-practiceblade').is_visible();assert not page.locator('#craft-ready-only').is_checked();assert page.locator('#craft-practiceblade').is_disabled()
  page.evaluate("award('moss',20);award('spore',10);s.gold=10000;showView('battle');render();renderLoot()")
  before=page.evaluate('s.gear.length');page.locator('#pinned-target-craft').click();assert page.evaluate('s.gear.length')==before+1
  page.locator('#guide-equipment').click();assert page.locator('#loadout-details').get_attribute('open') is not None
  page.locator('#equip-recommended').click();assert page.evaluate('equippedGear("weapon")!==null')
  page.evaluate("for(let i=0;i<80;i++)award('practiceblade',1,()=>.1);s.gear.at(-1).locked=true;renderEquipment()")
  page.locator('#gear-status').select_option('locked');assert page.locator('#gear-list .gear-cell').count()==1
  page.locator('#gear-status').select_option('unlocked');assert page.locator('#gear-list .gear-cell').count()<=24
  page.locator('#gear-sort').select_option('score');page.locator('#bulk-salvage').click();assert page.locator('#salvage-dialog').is_visible();page.locator('#salvage-cancel').click()
  page.evaluate("showView('battle');s.farmMode=true;s.stage=12;s.highestStage=16;render();window.scrollTo(0,0)")
  assert '반복 사냥' in page.locator('#guide-title').inner_text()
  assert '현재 지역' in page.locator('#stage-progress-title').inner_text()
  for view in ['battle','equipment','inventory','collection']:
   page.evaluate('(v)=>showView(v)',view);assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,view)
  page.evaluate("showView('battle');window.scrollTo(0,0)");page.screenshot(path=f'/tmp/mosslight-guide-{width}.png',full_page=True)
  page.locator('#open-route').click();page.screenshot(path=f'/tmp/mosslight-route-{width}.png')
  page.locator('#route-close').click()
  page.evaluate("currentMob='eliteRabbit';phase='combat';boss=false;s.stage=12;s.kills=5;s.heroHp=1;defeatHero();render()")
  assert page.evaluate('s.stage===12 && s.kills===5 && phaseLeft===8')
  page.close()
 assert not errors,errors
 print(json.dumps({'result':'PASS guide claims/reload, queued routes/frontier, pinned crafting, gear filters, salvage cancel, special defeat and overflow at 390/800/1440'}))
 browser.close()
