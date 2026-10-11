"""Real boss clock/outcome cues and acquisition receipts, without gameplay rerolls."""
import json
import os
import shutil
from playwright.sync_api import sync_playwright

URL = os.environ.get('GAME_URL', 'http://127.0.0.1:8082')


def encounter(page, boss_id=0):
    page.evaluate('''id => {
        if ($('victory-dialog').open) $('victory-dialog').close();
        clearCombatEffects();s.paused=false;s.effectsLite=false;s.rewardPending=false;
        s.rewardAuto=false;s.stage=6;s.highestStage=30;s.total=100;s.vitality=100;s.speed=0;
        s.passiveBuffs.guard=0;s.passives.guard=0;s.heroHp=heroMaxHp();
        boss=true;bossId=id;bossTier='normal';bossLeft=50;bossStrikes=0;
        currentMob='slime';phase='combat';hp=maxHp=1000000;attackClock=enemyClock=0;
        encounterSerial++;showView('battle');render();renderBattleScene();
        $('encounter-intro').classList.remove('reveal');$('loot-acquisition').hidden=true;
    }''', boss_id)
    page.wait_for_function("$('arena').getAttribute('aria-busy')==='false'")


def kill(page):
    return page.evaluate('''() => {
        const rng=Math.random;Math.random=()=>.99;
        try {hp=1;damage(1)} finally {Math.random=rng}
        return {phase,remaining:phaseLeft,seal:document.querySelectorAll('.boss-defeat-seal').length,
            pending:$('arena').classList.contains('boss-defeat-pending'),duration:heroStrikeDuration};
    }''')


def receipt(page):
    return page.evaluate('JSON.stringify([s.gold,s.inventory,s.gear,s.total,s.battleReward])')


with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True)
    page=browser.new_page(viewport={'width':1440,'height':1080})
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.on('response',lambda response:errors.append(f'HTTP {response.status} {response.url}') if response.status>=400 else None)
    page.add_init_script('window.setInterval=()=>0')
    page.goto(URL,wait_until='networkidle')
    visual_checks=[]

    for width in [320,390,1440]:
        page.set_viewport_size({'width':width,'height':1080})
        page.evaluate('()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))')
        for boss_id in range(5):
            encounter(page,boss_id)
            state=page.evaluate('''() => {
                bossStrikes=BOSS_BALANCE[bossId].every-1;enemyClock=enemyInterval()-.4;render();
                const before=[hp,s.heroHp,enemyClock,bossStrikes],rng=Math.random;
                Math.random=()=>{throw Error('Cosmetic RNG')};
                try {for(let i=0;i<100;i++)renderBossFeedback()} finally {Math.random=rng}
                const tell=document.querySelector('.boss-tell'),a=$('arena').getBoundingClientRect(),t=tell.getBoundingClientRect();
                return {label:tell.querySelector('.boss-tell-label').textContent,style:tell.dataset.bossStyle,
                    expected:BOSS_SKILL_VISUALS[bossId].id,glyph:tell.querySelector('b').textContent,
                    progress:parseFloat(tell.querySelector('.boss-tell-rule i').style.transform.slice(7)),
                    expectedProgress:enemyClock/enemyInterval(),nodes:$('boss-feedback-layer').children.length,
                    before,after:[hp,s.heroHp,enemyClock,bossStrikes],left:t.left-a.left,right:t.right-a.left,
                    top:t.top-a.top,bottom:t.bottom-a.top,width:a.width,height:a.height};
            }''')
            assert state['label']=='강타 예고 · 0.4초',state
            assert state['style']==state['expected'] and state['glyph'],state
            assert abs(state['progress']-state['expectedProgress'])<.001,state
            assert state['before']==state['after'] and state['nodes']==2,state
            assert 0<=state['left']<=state['right']<=state['width'],(width,state)
            assert 0<=state['top']<=state['bottom']<=state['height'],(width,state)
            assert page.locator('#boss-feedback-layer').evaluate('e=>getComputedStyle(e).pointerEvents')=='none'
            # Frenzy shortens the live interval; the warning must follow that clock.
            page.evaluate('hp=maxHp*.3;enemyClock=enemyInterval()-.2;render()')
            assert page.locator('.boss-tell-label').inner_text()=='강타 예고 · 0.2초'
            if boss_id==0:
                page.locator('#arena').screenshot(path=f'/tmp/mosslight-boss-{width}.png')
            for outcome in ['hit','guard','dodge']:
                measured=page.evaluate('''outcome=>{
                    clearCombatEffects();bossStrikes=BOSS_BALANCE[bossId].every-1;s.heroHp=heroMaxHp();
                    s.passiveBuffs.guard=outcome==='guard'?5:0;const dodge=dodgeChance;
                    dodgeChance=()=>outcome==='dodge'?1:0;render();
                    const before=s.heroHp,expected=incomingDamage(),strikes=bossStrikes;
                    monsterHit(()=>.99);dodgeChance=dodge;
                    const mark=document.querySelector('.boss-strong-impact');
                    return {damage:before-s.heroHp,expected,strikes:bossStrikes-strikes,
                        outcome:mark?.dataset.outcome,chips:mark?.querySelectorAll('.boss-impact-chip').length};
                }''',outcome)
                assert measured['damage']==(0 if outcome=='dodge' else measured['expected']),(boss_id,outcome,measured)
                assert measured['outcome']==outcome and measured['strikes']==1,measured
                assert measured['chips']==((2 if width<=560 else 4) if outcome=='hit' else 0),measured
            page.evaluate('clearCombatEffects()')

        encounter(page)
        page.evaluate("showBossImpact('hit')")
        impact_samples=[]
        for ms in [0,62,250,520]:
            impact_samples.append(page.locator('.boss-impact-mark').evaluate('''(e,ms)=>{
                const animation=e.getAnimations()[0];animation.pause();animation.currentTime=ms;
                return {ms,opacity:parseFloat(getComputedStyle(e).opacity),transform:getComputedStyle(e).transform};
            }''',ms))
        assert impact_samples[1]['opacity']>.9 and impact_samples[-1]['opacity']==0,impact_samples
        page.evaluate('clearCombatEffects()')
        initial=kill(page)
        assert initial['phase']=='victory' and initial['remaining']==1.8,initial
        assert initial['seal']==0 and initial['pending'],initial
        # The boss remains present during windup, then collapses at blade contact.
        assert page.locator('.enemy-position').evaluate('e=>getComputedStyle(e).animationName')=='none'
        awarded=receipt(page)
        page.wait_for_selector('.boss-defeat-seal',state='attached')
        assert page.locator('.contact-feedback.feedback-slash').count()==1
        defeat_samples=[]
        for ms in [0,220,740,1120]:
            defeat_samples.append(page.locator('.boss-defeat-ring').evaluate('''(e,ms)=>{
                const animation=e.getAnimations()[0];animation.pause();animation.currentTime=ms;
                return {ms,opacity:parseFloat(getComputedStyle(e).opacity)};
            }''',ms))
        assert defeat_samples[0]['opacity']==0 and defeat_samples[1]['opacity']>.8 and defeat_samples[-1]['opacity']==0,defeat_samples
        page.wait_for_selector('#loot-acquisition',state='visible')
        assert '가방 보관' in page.locator('#loot-acquisition').inner_text()
        acquisition_samples=[]
        for ms in [0,160,360]:
            acquisition_samples.append(page.locator('.loot-acquisition-copy').evaluate('''(e,ms)=>{
                const animation=e.getAnimations()[0];animation.pause();animation.currentTime=ms;
                return {ms,opacity:parseFloat(getComputedStyle(e).opacity),transform:getComputedStyle(e).transform};
            }''',ms))
        assert acquisition_samples[0]['opacity']<.5 and acquisition_samples[-1]['opacity']==1,acquisition_samples
        assert page.locator('#loot-acquisition').evaluate('e=>getComputedStyle(e).pointerEvents')=='none'
        geometry=page.evaluate('''()=>{const a=$('arena').getBoundingClientRect(),r=$('loot-acquisition').getBoundingClientRect();return {arenaBottom:a.bottom,top:r.top,left:r.left,right:r.right,width:innerWidth}}''')
        assert geometry['top']>=geometry['arenaBottom'],geometry
        assert geometry['left']>=0 and geometry['right']<=geometry['width'],geometry
        page.evaluate('for(let i=0;i<20;i++){render();damage(1e9)}')
        assert receipt(page)==awarded
        assert page.locator('.boss-defeat-seal').count()==1
        page.evaluate('stepCombat(1.79)')
        assert not page.locator('#victory-dialog').evaluate('e=>e.open')
        page.evaluate('stepCombat(.02)')
        assert page.locator('#victory-dialog').evaluate('e=>e.open')
        assert page.locator('#victory-dialog').get_attribute('data-reward-motion')=='reveal'
        assert page.locator('.victory-item[data-featured=true]').count()==1
        page.wait_for_timeout(680)
        assert page.locator('.boss-defeat-seal').count()==0
        assert page.locator('#victory-continue').is_enabled()
        assert page.locator('.victory-item').evaluate_all("cards=>cards.every(e=>parseFloat(getComputedStyle(e).opacity)===1)")
        page.locator('#victory-dialog').screenshot(path=f'/tmp/mosslight-reward-{width}.png')
        page.reload(wait_until='networkidle')
        assert page.locator('#victory-dialog').get_attribute('data-reward-motion')=='still'
        assert receipt(page)==awarded
        assert page.locator('.boss-defeat-seal').count()==0
        page.locator('#victory-continue').click()
        page.locator('#reward-reopen').click()
        assert page.locator('#victory-dialog').get_attribute('data-reward-view')=='review'
        assert page.locator('#victory-dialog').get_attribute('data-reward-motion')=='still'
        assert receipt(page)==awarded
        page.locator('#victory-continue').click()
        visual_checks.append({'width':width,'bosses':5,'outcomes':15,'receipt':'fresh/reload/review','impact':impact_samples,'defeat':defeat_samples,'acquisition':acquisition_samples})

    # Reload mid-victory retains the saved delay but must not replay the killing event.
    encounter(page)
    kill(page)
    awarded=receipt(page)
    page.reload(wait_until='networkidle')
    assert page.evaluate('phase')=='victory'
    assert page.locator('.boss-defeat-seal').count()==0
    assert page.locator('#arena').evaluate("e=>!e.classList.contains('boss-defeat-pending')")
    page.evaluate('stepCombat(2)')
    assert page.locator('#victory-dialog').get_attribute('data-reward-motion')=='still'
    assert receipt(page)==awarded

    # Long receipts cannot create a multi-second serial reveal or block options.
    encounter(page)
    kill(page)
    page.evaluate('''() => {
        const rows=s.battleReward.rows.slice();s.battleReward.rows=Array.from({length:24},(_,i)=>({...rows[i%rows.length]}));
        stepCombat(2);
    }''')
    assert page.locator('.victory-item').count()==24
    assert page.locator('.victory-item[data-reveal=true]').count()==8
    assert page.locator('.victory-item[data-featured=true]').count()==1
    assert page.locator('.victory-item').evaluate_all('cards=>cards.every(e=>parseFloat(e.style.animationDelay)<=300)')
    page.wait_for_timeout(680)
    assert page.locator('.victory-item').evaluate_all('cards=>cards.every(e=>parseFloat(getComputedStyle(e).opacity)===1)')
    page.evaluate('s.rewardAuto=true')
    page.locator('.victory-item details').first.evaluate('e=>e.open=true')
    page.wait_for_function('s.rewardAuto===false')
    page.locator('#victory-continue').click()

    # Cancel before the sword lands; none of its delayed cues may appear afterward.
    for stop in ['pause','menu','resize','hidden','encounter']:
        encounter(page)
        page.evaluate('''stop=>{
            const rng=Math.random;Math.random=()=>.99;hp=1;damage(1);Math.random=rng;
            if(stop==='pause'){s.paused=true;render()}
            if(stop==='menu')showView('inventory');
            if(stop==='resize')window.dispatchEvent(new Event('resize'));
            if(stop==='hidden'){Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))}
            if(stop==='encounter'){encounterSerial++;phase='combat';render()}
        }''',stop)
        page.wait_for_timeout(650)
        assert page.locator('.boss-defeat-seal').count()==0,stop
        assert page.evaluate('bossFeedbackTimers.size')==0,stop
        assert page.locator('#loot-acquisition').is_hidden(),stop
        if stop=='hidden':
            page.evaluate("delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))")

    # Motion policies keep the same state labels and rewards without moving decoration.
    for mode in ['lite','reduced']:
        encounter(page)
        if mode=='lite':
            page.locator('#fx-toggle').click()
        else:
            page.emulate_media(reduced_motion='reduce');page.wait_for_timeout(80)
        page.evaluate('bossStrikes=BOSS_BALANCE[bossId].every-1;enemyClock=enemyInterval()-.3;render()')
        assert page.locator('.boss-tell-label').inner_text()=='강타 예고 · 0.3초'
        page.evaluate('monsterHit(()=>.99)')
        assert page.locator('.boss-impact-mark').evaluate('e=>getComputedStyle(e).animationName')=='none'
        assert page.locator('.boss-impact-chip').count()==0
        kill(page)
        assert page.locator('.boss-defeat-glyph').is_visible()
        assert page.locator('.boss-defeat-glyph').evaluate('e=>getComputedStyle(e).animationName')=='none'
        assert page.locator('#loot-acquisition').is_visible()
        assert not page.locator('#loot-acquisition').evaluate("e=>e.classList.contains('loot-arriving')")
        page.evaluate('stepCombat(2)')
        assert page.locator('#victory-dialog').get_attribute('data-reward-motion')=='still'
        assert page.locator('.victory-item').evaluate_all("cards=>cards.every(e=>getComputedStyle(e).animationName==='none')")
        page.locator('#victory-continue').click()
    assert not errors,errors
    print(json.dumps({'result':'PASS boss clock, 5 species x 3 outcomes, confirmed defeat, 1800ms receipt, replay/reload safety, bounded cards, cleanup, lite/reduced','checks':visual_checks}))
    browser.close()
