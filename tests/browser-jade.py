import os,shutil,json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox']);errors=[]
 for width in [390,800,1440]:
  page=b.new_page(viewport={'width':width,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)));page.add_init_script('window.setInterval=()=>0');page.goto(os.environ.get('GAME_URL','http://127.0.0.1:8082'));page.wait_for_function("typeof s!=='undefined'&&$('arena').getAttribute('aria-busy')==='false'")
  page.evaluate("s.inventory.jadeorb=10;s.specialPassives={};s.specialActive=null;Math.random=()=>0;showView('shop');render();renderLoot()")
  for _ in range(3):page.locator('#special-draw').click()
  assert page.evaluate('s.specialPassives.foxluck')==3
  assert '50%' in page.locator('#special-effect-foxluck').inner_text();assert '추첨 제외' in page.locator('#special-effect-foxluck').inner_text()
  assert '75%' in page.locator('#special-effect-foxward').inner_text()
  for _ in range(6):page.locator('#special-draw').click()
  assert page.locator('#special-draw').is_disabled();assert page.evaluate('s.inventory.jadeorb')==1
  baseline=page.evaluate('({attack:attack(),speed:speed(),hp:heroMaxHp()})');page.locator('#special-foxspirit').click()
  assert page.evaluate('attack()')>baseline['attack']*1.3;assert page.evaluate('speed()')>baseline['speed']*1.13
  page.evaluate('s.heroHp=50');page.locator('#special-foxward').click();assert page.evaluate('s.heroHp')==50;assert page.evaluate('heroMaxHp()')>baseline['hp']*1.24
  page.evaluate("showView('battle');render();openQuickBoss();selectQuickBoss(0)");assert page.evaluate('preparationStats().bossReduction')>.19
  page.locator('#quick-boss-close').click();page.evaluate("showView('shop');render();save()")
  snapshot=page.evaluate('JSON.stringify([s.specialPassives,s.specialActive,s.specialDraws,s.inventory.jadeorb,s.heroHp])');page.reload();page.wait_for_function("s.specialActive==='foxward'");assert page.evaluate('JSON.stringify([s.specialPassives,s.specialActive,s.specialDraws,s.inventory.jadeorb,s.heroHp])')==snapshot
  page.evaluate("showView('shop');render()");assert not page.evaluate('document.documentElement.scrollWidth>innerWidth');page.screenshot(path=f'/tmp/jade-shop-{width}.png',full_page=True);page.close()
 assert not errors,errors
 print(json.dumps({'result':'PASS actual jade draws, guaranteed duplicates, live probabilities, switching stats/no healing, completion/reload and 390/800/1440 layouts'}));b.close()
