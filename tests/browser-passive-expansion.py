import os,shutil,json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox']);errors=[]
 for width in [390,800,1440]:
  page=b.new_page(viewport={'width':width,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)));page.add_init_script('window.setInterval=()=>0');page.goto(os.environ.get('GAME_URL','http://127.0.0.1:8082'));page.wait_for_function("typeof s!=='undefined'&&$('arena').getAttribute('aria-busy')==='false'")
  page.evaluate("s.inventory.skillstone=12;showView('shop');render()")
  for key,roll in [('breath',.6),('bark',.88),('hunter',.96),('wither',.995)]:
   page.evaluate(f'Math.random=()=>{roll}');page.locator('#passive-draw').click();assert page.evaluate(f's.passives.{key}')==1
   assert '현재 효과' in page.locator('#passive-effect-'+key).inner_text()
  assert page.evaluate('s.inventory.skillstone')==0
  page.evaluate("s.highestStage=11;showView('battle');render();openQuickBoss();selectQuickBoss(0)")
  assert '시든달' in page.locator('#quick-boss-stats').inner_text()
  page.locator('#quick-boss-close').click();page.evaluate('save()');snapshot=page.evaluate('JSON.stringify(s.passives)');page.reload();page.wait_for_function("s.passives.wither===1");assert page.evaluate('JSON.stringify(s.passives)')==snapshot
  page.evaluate("showView('shop');render()");assert not page.evaluate('document.documentElement.scrollWidth>innerWidth');page.screenshot(path=f'/tmp/passives-{width}.png',full_page=True);page.close()
 assert not errors,errors
 print(json.dumps({'result':'PASS four actual draws, effective descriptions, boss antiheal display, save/reload, 390/800/1440 layouts'}));b.close()
