"""Real UI checks for Chapter 1 gates, last-kill completion, upgrades and saved rewards."""
import json,os,shutil
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':1100});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.add_init_script('window.setInterval=()=>0')
 page.goto(os.environ.get('GAME_URL','http://127.0.0.1:8082'))
 page.wait_for_function("typeof s!=='undefined' && $('arena').getAttribute('aria-busy')==='false'")
 for width in [390,800,1440]:
  page.set_viewport_size({'width':width,'height':1100})
  page.evaluate("s.paused=false;s.rewardPending=false;s.bossWins=[0,0,0,0,0];s.chapterOneCleared=false;s.bossReadyAt=[0,0,0,0,0];boss=false;phase='combat';currentMob='slime';s.heroHp=heroMaxHp();s.gold=1000;s.attack=0;s.vitality=0;s.guard=0;s.stage=2;s.highestStage=2;render();showView('battle')")
  page.locator('#attack-buy').click();assert page.evaluate('s.gold')==976
  page.locator('#vitality-buy').click();assert page.evaluate('s.gold')==940
  page.locator('#guard-buy').click();assert page.evaluate('s.gold')==896
  assert page.evaluate('bossUnlocked(0)') is False
  for stage,open_count in [(3,1),(6,2),(11,3),(21,4),(30,4)]:
   page.evaluate('(n)=>{s.stage=s.highestStage=n;render()}',stage)
   assert page.evaluate('BOSSES.filter((_,i)=>bossUnlocked(i)).length')==open_count
  page.evaluate('openQuickBoss();selectQuickBoss(4)')
  assert page.locator('#quick-boss-normal').is_disabled()
  assert '30' in page.locator('#quick-boss-list').inner_text()
  page.evaluate("$('quick-boss-dialog').close();s.claimedMilestones=[3,6,11,16,21,26];s.kills=requiredKills()-1;hp=1;damage(10);renderCollection();openQuickBoss();selectQuickBoss(4)")
  assert page.locator('#quick-boss-normal').is_enabled()
  assert '완주' in page.locator('#stage').inner_text()
  assert page.evaluate('s.stage')==30
  page.evaluate("$('quick-boss-dialog').close();showView('collection')")
  page.locator('#show-milestones').click()
  assert 'STAGE 30 완주' in page.locator('#milestone-list').inner_text()
  before=page.evaluate('s.gold');page.locator('.milestone-claim').click()
  assert page.evaluate('s.gold')==before+15000
  assert page.evaluate('s.gear.at(-1).tier')==3
  assert page.evaluate('ITEMS[s.gear.at(-1).key].rarity')=='legendary'
  assert page.locator('.milestone-claim').count()==0
  assert 'undefined' not in page.locator('#goal-label').inner_text()
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  page.screenshot(path=f'/tmp/mosslight-chapter-complete-{width}.png',full_page=True)
  page.evaluate('s.paused=true;save()');snapshot=page.evaluate('JSON.stringify([s.gold,s.gear,s.claimedMilestones])');page.reload()
  page.wait_for_function('s.chapterOneCleared===true')
  assert page.evaluate('JSON.stringify([s.gold,s.gear,s.claimedMilestones])')==snapshot
  assert page.evaluate('bossUnlocked(4) && s.stage===30')
 assert not errors,errors
 print(json.dumps({'result':'PASS actual upgrade buttons, reach-vs-clear boss gates, 30-stage cap, claim-once legendary reward and saved completion at 390/800/1440'}))
 browser.close()
