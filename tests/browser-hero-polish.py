"""Real Chromium articulated collapse and distinct critical-contact choreography.

The battle clock is disabled; combat entry points, CSS timelines, render lifecycle,
preference events and cleanup timers remain real. No reward/combat state is faked by CSS.
"""
import json
import os
import shutil
from playwright.sync_api import sync_playwright

BASE = os.environ.get('GAME_URL', 'http://127.0.0.1:8082')


def encounter(page, guardian=False):
    page.evaluate('''guardian => {
        clearCombatEffects(); s.paused=false; s.effectsLite=false; s.rewardPending=false;
        s.stage=11; s.highestStage=25; s.total=100; s.vitality=70; s.speed=0;
        s.heroHp=heroMaxHp(); boss=guardian; bossId=0; bossTier='normal'; bossLeft=60;
        currentMob='slime'; phase='combat'; phaseLeft=0; hp=maxHp=1000000;
        encounterSerial++; render(); renderBattleScene(); $('encounter-intro').classList.remove('reveal');
    }''', guardian)
    page.wait_for_function("$('arena').getAttribute('aria-busy') === 'false'")
    # Commit the recovered style before a synchronous test defeat. Otherwise the
    # renderer can coalesce combat -> defeated and retain the last finished fall.
    page.locator('.hero-upper-body').evaluate('(el)=>getComputedStyle(el).animationName')


def seek(page, ms):
    page.evaluate('''ms => {for(const a of $('arena').getAnimations({subtree:true})) {
        a.pause(); a.currentTime=ms;
    }}''', ms)


def joints(page):
    return page.evaluate('''() => {
        const point=(selector,x,y)=>{const e=document.querySelector(selector),p=new DOMPoint(x,y).matrixTransform(e.getScreenCTM()); const arena=$('arena').getBoundingClientRect(); return {x:p.x-arena.left,y:p.y-arena.top}};
        return {head:point('.hero-head',630,20),
            backKnee:point('.hero-leg-back',621,665), frontKnee:point('.hero-leg-front',817,678),
            backToe:point('.hero-shin-back',591,969), frontToe:point('.hero-shin-front',1020,995),
            sword:point('.hero-sword-hand',1510,25),
            body:getComputedStyle(document.querySelector('.hero-upper-body')).transform,
            thigh:getComputedStyle(document.querySelector('.hero-leg-front')).transform,
            shin:getComputedStyle(document.querySelector('.hero-shin-front')).transform};
    }''')


with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':1100})
    errors=[]; failures=[]
    page.on('pageerror', lambda error:errors.append(str(error)))
    page.on('response', lambda response:failures.append(response.url) if response.status>=400 else None)
    page.add_init_script('window.setInterval=()=>0')
    page.goto(BASE); page.wait_for_function("typeof s !== 'undefined' && typeof renderEncounter === 'function'")
    geometry=[]
    for width in [390,800,1440]:
        page.set_viewport_size({'width':width,'height':1100}); encounter(page)
        rest=joints(page); ground=(rest['backToe']['y']+rest['frontToe']['y'])/2
        page.evaluate('defeatHero();render()')
        seek(page,540); knee=joints(page)
        assert knee['head']['y'] > rest['head']['y']+35, (width,rest,knee)
        # Both knees, with independently folded shins, actually reach the standing ground plane.
        assert abs(knee['backKnee']['y']-ground)<12, (width,knee,ground)
        assert abs(knee['frontKnee']['y']-ground)<12, (width,knee,ground)
        assert knee['thigh']!=knee['shin'] and knee['shin']!='none', knee
        assert abs(knee['frontToe']['y']-knee['frontKnee']['y'])<8, knee
        assert knee['frontToe']['x']<knee['frontKnee']['x']-30, knee
        assert knee['sword']['y']<ground+22, (width,knee,ground)
        page.locator('#arena').screenshot(path=f'/tmp/mosslight-hero-kneel-{width}.png')
        seek(page,1200); settled=joints(page)
        assert settled['head']['y']>knee['head']['y']+35, (width,knee,settled)
        assert settled['body']!=knee['body'], settled
        assert abs(settled['backKnee']['y']-knee['backKnee']['y'])<9, settled
        page.locator('#arena').screenshot(path=f'/tmp/mosslight-hero-settled-{width}.png')
        geometry.append({'width':width,'knees_ground_delta':[round(knee['backKnee']['y']-ground,1),round(knee['frontKnee']['y']-ground,1)],'head_fall':round(settled['head']['y']-rest['head']['y'],1)})

    # Pause through the real control preserves the in-progress fall; resuming continues it.
    encounter(page); page.evaluate('defeatHero();render()'); page.wait_for_timeout(250)
    page.locator('#pause').click()
    page.evaluate("async()=>{await Promise.all(document.querySelector('.hero-motion').getAnimations({subtree:true}).map(a=>a.ready))}")
    before=joints(page); page.wait_for_timeout(180); after=joints(page)
    assert before==after, (before,after)
    assert page.locator('#arena').evaluate("e=>e.classList.contains('hero-defeated')")
    paused_time=page.locator('.hero-upper-body').evaluate('e=>e.getAnimations()[0].currentTime')
    page.locator('#pause').click(); page.wait_for_timeout(180)
    resumed_time=page.locator('.hero-upper-body').evaluate('e=>e.getAnimations()[0].currentTime')
    assert resumed_time>paused_time+100, (paused_time,resumed_time)

    # Accessibility retains a legible kneeling state without a moving or tilted whole sprite.
    page.emulate_media(reduced_motion='reduce')
    assert page.locator('.hero-collapse-root').evaluate("e=>getComputedStyle(e).animationName")=='none'
    assert joints(page)['shin']!='none'
    assert page.locator('.hero-motion').evaluate("e=>getComputedStyle(e).transform")=='none'
    page.emulate_media(reduced_motion='no-preference'); page.evaluate('s.effectsLite=true;render()')
    assert page.locator('.hero-collapse-root').evaluate("e=>getComputedStyle(e).animationName")=='none'
    assert joints(page)['shin']!='none'
    encounter(page); assert joints(page)['shin']=='none'

    # Contact reaction starts with the delayed blade hit, not with the windup.
    reactions=[]
    for guardian in [False,True]:
        encounter(page,guardian); page.evaluate('damage(5,true)'); seek(page,200)
        assert page.locator('.hero-arm').evaluate("e=>getComputedStyle(e).animationName")=='hero-critical-shoulder'
        assert page.locator('.enemy-position').evaluate("e=>getComputedStyle(e).animationName")=='none'
        page.wait_for_timeout(400)
        assert not page.locator('#arena').evaluate("e=>e.classList.contains('enemy-critical-hit')")
        seek(page,400)
        page.wait_for_function("$('arena').classList.contains('enemy-critical-hit')")
        reaction=page.locator('#painted-enemy').evaluate("e=>getComputedStyle(e).animationName")
        assert reaction==('enemy-critical-brace' if guardian else 'enemy-critical-buckle'), reaction
        reactions.append(reaction)
        page.evaluate("for(const a of $('painted-enemy').getAnimations()){a.pause();a.currentTime=140}")
        page.locator('#arena').screenshot(path='/tmp/mosslight-critical-'+('guardian' if guardian else 'creature')+'.png')
        page.evaluate('clearCombatEffects()')
        assert not page.locator('#arena').evaluate("e=>e.classList.contains('enemy-critical-hit')")

    # A critical passive proc advances the existing swing instead of re-opening its windup.
    encounter(page); page.evaluate('animateStrike();'); seek(page,240)
    page.evaluate('animateStrike(false,true)')
    progressed=page.locator('.hero-arm').evaluate("e=>e.getAnimations()[0].currentTime")
    assert 235<=progressed<=275, progressed
    page.evaluate('clearCombatEffects()')
    assert not errors,errors
    assert not failures,failures
    print(json.dumps({'result':'PASS articulated ground-contact knees, settled torso/sword, pause/resume, reduced/lite recovery, actual critical-contact reactions and proc continuity','geometry':geometry,'reactions':reactions}))
    browser.close()
