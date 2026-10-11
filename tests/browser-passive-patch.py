import os,shutil,json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox']);errors=[]
 for width in [390,800,1440]:
  page=b.new_page(viewport={'width':width,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)));page.add_init_script('window.setInterval=()=>0');page.goto(os.environ.get('GAME_URL','http://127.0.0.1:8082'));page.wait_for_function("typeof s!=='undefined'&&$('arena').getAttribute('aria-busy')==='false'")
  page.evaluate("for(const k of ['hunter','wither','light','guard','haste','leech','echo'])s.passives[k]=5;showView('shop');render()")
  expected={'hunter':['14%','22%'],'wither':['24.8%','30%'],'light':['13초','180%'],'guard':['4%','5초','30%'],'haste':['16%'],'leech':['16%','23%'],'echo':['14초','30%','50%']}
  for key,parts in expected.items():
   text=page.locator('#passive-effect-'+key).inner_text()
   for part in parts:assert part in text,(key,text,part)
  assert not page.evaluate('document.documentElement.scrollWidth>innerWidth');page.screenshot(path=f'/tmp/passive-patch-shop-{width}.png',full_page=True)
  page.evaluate("showView('battle');s.rewardPending=false;boss=false;currentMob='slime';phase='combat';hp=maxHp=1e9;s.heroHp=heroMaxHp();Math.random=()=>.99;render()")
  page.evaluate('monsterHit(()=>0);render()');assert '방벽' in page.locator('#passive-buffs').inner_text()
  page.evaluate('Math.random=()=>0;damage(100,true);render()');assert '시든달' in page.locator('#passive-buffs').inner_text()
  page.evaluate('performBasicAttack(()=>0);render()');assert '메아리' in page.locator('#passive-buffs').inner_text()
  page.wait_for_timeout(650)
  page.evaluate('Math.random=()=>.99;performBasicAttack(()=>0);render()');page.wait_for_timeout(510)
  assert page.locator('#impact-layer .impact-number').count()>=2
  page.evaluate('s.paused=true;save()');snapshot=page.evaluate('JSON.stringify(s.passiveBuffs)');page.reload();page.wait_for_function('s.paused===true');assert page.evaluate('JSON.stringify(s.passiveBuffs)')==snapshot
  page.evaluate('showView("battle");render()');assert not page.evaluate('document.documentElement.scrollWidth>innerWidth');page.screenshot(path=f'/tmp/passive-patch-battle-{width}.png',full_page=True)
  page.evaluate('s.paused=false;phase="travel";phaseLeft=30;stepCombat(14);render()');assert page.locator('#passive-buffs').is_hidden()
  page.close()
 assert not errors,errors
 print(json.dumps({'result':'PASS 7 passive Lv.5 descriptions, live guard/critical/echo, distinct hit effects, paused reload/expiry, 390/800/1440 layouts'}));b.close()
