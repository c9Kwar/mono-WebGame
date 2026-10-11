"""Confirmed contact readability, frame-based inspection and real cleanup in Chromium."""
import json
import os
import shutil
from playwright.sync_api import sync_playwright

URL = os.environ.get('GAME_URL', 'http://127.0.0.1:8082')

def encounter(page):
    page.evaluate("""() => {
        clearCombatEffects(); s.paused=false; s.effectsLite=false; s.rewardPending=false;
        boss=false; currentMob='slime'; phase='combat'; hp=maxHp=1000000;
        s.vitality=70; s.heroHp=heroMaxHp(); encounterSerial++; render(); renderBattleScene();
        $('encounter-intro').classList.remove('reveal');
    }""")
    page.wait_for_function("$('arena').getAttribute('aria-busy')==='false'")

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True)
    page=browser.new_page(viewport={'width':1440,'height':1050})
    errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    page.add_init_script('window.setInterval=()=>0')
    page.goto(URL,wait_until='networkidle')
    widths=[]
    for width in [320,390,800,1440]:
        page.set_viewport_size({'width':width,'height':1050})
        page.evaluate('()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))')
        encounter(page)
        for kind in ['slash','critical','hurt','heavy','guard','dodge']:
            page.evaluate("kind=>{clearCombatEffects();paintContactFeedback(kind,12840)}",kind)
            assert page.locator('.contact-feedback').count()==1,(width,kind)
            assert page.locator('.impact-number').inner_text().strip()
            assert page.locator('#impact-layer').evaluate('e=>getComputedStyle(e).pointerEvents')=='none'
            assert not page.locator('#arena').evaluate("e=>e.classList.contains('impact-flash')")
            geometry=page.evaluate("""()=>{
                const a=$('arena').getBoundingClientRect(),n=document.querySelector('.impact-number').getBoundingClientRect();
                return {left:n.left-a.left,right:n.right-a.left,width:a.width,top:n.top-a.top};
            }""")
            assert geometry['left']>=0 and geometry['right']<=geometry['width'],(width,kind,geometry)
            assert geometry['top']>140,(width,kind,geometry)
        # Stop CSS at the peak, decay and finish; timers remain real.
        page.evaluate("clearCombatEffects();paintContactFeedback('critical',284)")
        samples=[]
        for ms in [0,40,120,240,340]:
            state=page.locator('.feedback-mark').evaluate("""(e,ms)=>{
                const a=e.getAnimations()[0];a.pause();a.currentTime=ms;
                return {ms,opacity:parseFloat(getComputedStyle(e).opacity),transform:getComputedStyle(e).transform};
            }""",ms)
            samples.append(state)
        assert samples[1]['opacity']>.8 and samples[-1]['opacity']==0,samples
        page.evaluate("clearCombatEffects();paintContactFeedback('critical',284);paintContactFeedback('guard',12);for(const a of $('impact-layer').getAnimations({subtree:true})){a.pause();a.currentTime=80}")
        if width in [390,1440]:
            page.locator('#arena').screenshot(path=f'/tmp/mosslight-contact-{width}.png')
        widths.append({'width':width,'samples':samples})
        page.evaluate('clearCombatEffects()')

    encounter(page)
    page.evaluate("for(let i=0;i<100;i++){paintImpact(40,i%3===0);paintImpact(5,false,true,i%3===0)}")
    assert page.locator('.contact-feedback').count()<=6
    assert page.locator('.feedback-mark').count()<=2
    assert page.evaluate('impactTimers.size')<=6
    page.wait_for_timeout(950)
    assert page.locator('.contact-feedback').count()==0
    assert page.evaluate('impactTimers.size')==0

    # Existing game damage lands immediately; cosmetic contact follows the real sword pose.
    strike=page.evaluate("()=>{clearCombatEffects();damage(1,true);return {hp,clip:getComputedStyle(document.querySelector('.hero-arm')).animationName,contacts:impactTimers.size}}")
    assert strike=={'hp':999999,'clip':'hero-critical-shoulder','contacts':0},strike
    page.wait_for_selector('.contact-feedback.feedback-critical',state='attached')
    assert page.locator('.feedback-critical .impact-number').is_visible()
    page.locator('#pause').click()
    assert page.locator('.contact-feedback').count()==0
    page.locator('#pause').click()
    page.evaluate("paintContactFeedback('guard',1)")
    page.set_viewport_size({'width':390,'height':1050})
    page.wait_for_timeout(80)
    assert page.locator('.contact-feedback').count()==0
    page.evaluate("paintContactFeedback('guard',1);showView('inventory');paintContactFeedback('critical',1)")
    assert page.locator('.contact-feedback').count()==0
    page.evaluate("showView('battle');paintContactFeedback('guard',1);Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))")
    assert page.locator('.contact-feedback').count()==0
    page.evaluate("delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))")
    page.evaluate("paintContactFeedback('guard',1);encounterSerial++;renderEncounter()")
    assert page.locator('.contact-feedback').count()==0

    for mode in ['lite','reduced']:
        encounter(page)
        if mode=='lite':
            page.locator('#fx-toggle').click();assert page.evaluate('s.effectsLite')
        else:
            page.emulate_media(reduced_motion='reduce')
            page.wait_for_timeout(80)  # Let the media change cancellation run before a new hit.
        page.evaluate('showImpact(27,true);renderEncounter()')
        assert page.locator('.contact-feedback.feedback-quiet').count()==1
        assert '치명타' in page.locator('.impact-number').inner_text()
        assert page.locator('.feedback-fleck').count()==0
        assert page.locator('.feedback-mark').evaluate('e=>getComputedStyle(e).animationName')=='none'
        page.wait_for_timeout(200)
        assert page.locator('.impact-number').is_visible()
        page.wait_for_timeout(700)
        assert page.locator('.contact-feedback').count()==0
    page.emulate_media(reduced_motion='no-preference')
    encounter(page)
    page.evaluate("paintContactFeedback('guard',1);window.dispatchEvent(new Event('pagehide'))")
    assert page.evaluate('impactTimers.size')==0
    assert not errors,errors
    print(json.dumps({'result':'PASS contact forms, damage/sword timing, 4 widths, peak/decay/end, bounded overlap, cleanup, static lite/reduced signals','widths':widths}))
    browser.close()
