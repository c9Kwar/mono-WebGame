"""Real animation lifecycle, motion preferences, touch layouts and bounded cosmetic layers."""
import os,shutil,json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':1050});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('GAME_URL','http://127.0.0.1:8082'))
 page.evaluate("s.total=100;s.heroHp=100000;boss=true;bossId=0;bossTier='normal';bossLeft=60;spawn();hp=maxHp=1000000;render()")
 page.wait_for_function("document.querySelector('#arena').classList.contains('layered-scene')")
 page.evaluate("emitCombatEffect('critical');animateStrike(false,true)")
 assert page.locator('.fx-critical').count()>=1
 assert page.locator('.fx-critical .fx-ring').first.evaluate('(el)=>getComputedStyle(el).animationName')=='contact-ring'
 page.evaluate("for(let i=0;i<100;i++)emitCombatEffect('slash')")
 assert page.locator('.combat-burst').count()==5
 assert page.locator('#combat-fx').evaluate('(el)=>getComputedStyle(el).pointerEvents')=='none'
 page.evaluate('s.paused=true;clearCombatEffects();s.paused=false')
 page.wait_for_timeout(850)
 # Pausing actual combat prevents the next ordinary attack while cleanup is checked.
 page.evaluate("clearCombatEffects();emitCombatEffect('guard');s.paused=true")
 page.wait_for_timeout(850)
 assert page.locator('.combat-burst').count()==0
 page.evaluate("s.paused=false;showImpact(128,true);bossStrikes=3;render()")
 assert '치명타' in page.locator('#last-impact').inner_text()
 for width in [390,800,1440]:
  page.set_viewport_size({'width':width,'height':1050})
  page.evaluate("s.paused=false;render();clearCombatEffects();emitCombatEffect('critical');emitCombatEffect('guard');animateStrike(false,true)")
  page.wait_for_timeout(100)
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  freeze=page.add_style_tag(content='.combat-burst *{animation-play-state:paused!important}')
  page.locator('#arena').screenshot(path=f'/tmp/mosslight-combat-fx-{width}.png')
  freeze.evaluate('(el)=>el.remove()')
 page.locator('#fx-toggle').click()
 assert page.evaluate('s.effectsLite')
 assert page.locator('.combat-burst').count()==0
 assert page.evaluate("emitCombatEffect('critical')") is False
 page.reload();assert page.evaluate('s.effectsLite')
 page.locator('#fx-toggle').click()
 page.emulate_media(reduced_motion='reduce')
 assert page.evaluate("emitCombatEffect('critical')") is False
 assert page.locator('#combat-fx').evaluate('(el)=>getComputedStyle(el).display')=='none'
 page.evaluate('animateStrike(false,true,true)')
 assert page.locator('.battle-stage').evaluate('(el)=>getComputedStyle(el).animationName')=='none'
 assert not errors,errors
 print(json.dumps({'result':'PASS cosmetic lifecycle, 5-burst bound, 3 widths, saved lite mode, live reduced motion, no JS errors'}))
 browser.close()
