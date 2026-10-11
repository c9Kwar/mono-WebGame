"""Actual layout containment, potential comparison, exploration, defeat and opt-in reset."""
import os,shutil,json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1522,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('GAME_URL','http://127.0.0.1:8082'))
 page.evaluate("s.paused=true;s.total=100;s.highestStage=25;for(let i=0;i<41;i++)award(['practiceblade','tunic','trousers','boots','leaf'][i%5],1,()=>.5,'test',5);renderLoot();save()")
 page.locator('#tab-equipment').click()
 for width in [390,800,1100,1522,1920]:
  page.set_viewport_size({'width':width,'height':900})
  result=page.locator('.gear-category-tree').evaluate('''nav=>{const box=nav.getBoundingClientRect();return {height:box.height,buttons:[...nav.querySelectorAll('button')].map(b=>{const r=b.getBoundingClientRect(),label=b.querySelector('span').getBoundingClientRect(),count=b.querySelector('small').getBoundingClientRect();return {contained:r.left>=box.left&&r.right<=box.right+1&&count.left>=r.left&&count.right<=r.right+1&&count.top>=r.top&&count.bottom<=r.bottom+1,labelHeight:label.height,width:r.width}})}}''')
  assert result['height']<150 and all(r['contained'] and r['labelHeight']<30 and r['width']>=90 for r in result['buttons']),result
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
  page.screenshot(path=f'/tmp/mosslight-growth2-equipment-{width}.png',full_page=True)
 page.evaluate("var a=s.gear[0],b=s.gear[1];b.key=a.key;a.potentials=[{type:'atkFlat',grade:0,value:10},{type:'critical',grade:0,value:.01}];b.potentials=[{type:'atkFlat',grade:2,value:50},{type:'speedPct',grade:1,value:.03}];s.slots.weapon=a.id;openPotential(b.id)")
 assert '10 → 선택 50 (+40)' in page.locator('#potential-comparison').inner_text()
 assert '현재 1% → 선택 0% (−1%)' in page.locator('#potential-comparison').inner_text()
 page.set_viewport_size({'width':390,'height':900});assert page.locator('#potential-dialog').evaluate('(e)=>e.scrollWidth<=e.clientWidth')
 page.screenshot(path='/tmp/mosslight-growth2-comparison.png');page.locator('#potential-close').click()
 page.locator('#tab-battle').click();page.evaluate("s.trails.points=80;s.trails.seconds=600;s.trails.step=1;renderExpedition()")
 page.locator('#trail-shortcut').click();assert page.locator('.trail-details').evaluate('(e)=>e.open');assert '대기' in page.locator('#trail-state').inner_text()
 page.evaluate('s.paused=false;s.heroHp=heroMaxHp();phase="combat";advanceTrail(.5);renderExpedition()');assert '진행 중' in page.locator('#trail-state').inner_text()
 page.screenshot(path='/tmp/mosslight-growth2-trail.png',full_page=True)
 page.evaluate("s.paused=false;boss=false;phase='combat';s.heroHp=1;defeatHero();render()")
 page.wait_for_timeout(1000)
 assert page.locator('#arena').evaluate('(e)=>e.classList.contains("hero-defeated")')
 pose=page.locator('.hero-upper-body').evaluate('(e)=>getComputedStyle(e).transform');assert pose!='none'
 assert page.locator('.hero-shin-front').evaluate('(e)=>getComputedStyle(e).transform')!='none'
 page.locator('#arena').scroll_into_view_if_needed();page.screenshot(path='/tmp/mosslight-growth2-defeat.png')
 page.emulate_media(reduced_motion='reduce');assert page.locator('.hero-motion').evaluate('(e)=>getComputedStyle(e).animationName')=='none'
 assert page.locator('.hero-shin-front').evaluate('(e)=>getComputedStyle(e).transform')!='none'
 page.evaluate('s.paused=true;save()')
 before=page.evaluate('localStorage.getItem(KEY)');page.locator('#save-reset').click()
 assert page.locator('#reset-confirm').is_disabled();page.locator('#reset-input').fill('잘못된 입력');assert page.locator('#reset-confirm').is_disabled()
 page.locator('#reset-cancel').click();assert page.evaluate('localStorage.getItem(KEY)')==before
 page.locator('#save-reset').click();page.locator('#reset-input').fill('초기화');page.locator('#reset-confirm').click();page.wait_for_function('s.total===0&&s.stage===1&&s.gear.length===0&&s.paused')
 assert page.evaluate('JSON.parse(localStorage.getItem(KEY+".backup")).total')==100
 assert page.locator('#save-backup').is_visible()
 with page.expect_download() as event:page.locator('#save-backup').click()
 assert json.load(open(event.value.path()))['total']==100
 assert not errors,errors
 print(json.dumps({'result':'PASS 41-item category/count containment at 5 widths; lost/gained potential comparison; live exploration; falling and reduced motion; reset cancel/confirmation/backup download','defeat_transform':pose}))
 browser.close()
