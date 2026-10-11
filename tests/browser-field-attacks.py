"""Ordinary species choreography and geometry in real Chromium.

Only the combat interval is disabled. Rendering, CSS animation instances, asset
loading, cancellation timers and accessibility preferences remain real.
"""
import json
import os
import shutil

from playwright.sync_api import sync_playwright


MOTIONS = {
    'slime': 'field-slime-spit',
    'mushroom': 'field-cap-puff',
    'snail': 'field-snail-lash',
    'moth': 'field-moth-beat',
    'rabbit': 'field-rabbit-claw',
    'eliteRabbit': 'field-rabbit-claw',
}


def encounter(page, mob):
    page.evaluate('''mob => {
        s.paused=false; s.effectsLite=false; boss=false; phase='combat';
        currentMob=mob; s.heroHp=100000; hp=maxHp=100000;
        encounterSerial++; enemyClock=0; attackClock=0;
        render(); clearCombatEffects(); renderBattleScene();
    }''', mob)
    page.wait_for_function('''mob =>
        $('arena').dataset.species===mob.replace(/^elite/,'').toLowerCase() && $('arena').getAttribute('aria-busy')!=='true'
    ''', arg=mob)


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(
        executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),
        headless=True, args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1440, 'height': 1050})
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.add_init_script('window.setInterval=()=>0')
    page.goto(os.environ.get('GAME_URL', 'http://127.0.0.1:8082'))
    page.wait_for_function("$('arena').classList.contains('layered-scene')")

    for width in [390, 800, 1440]:
        page.set_viewport_size({'width': width, 'height': 1050})
        for mob, motion in MOTIONS.items():
            encounter(page, mob)
            geometry = page.evaluate('''() => {
                const g=fieldAttackGeometry(enemySkill());
                const hero=$('arena').querySelector('.hero-position').getBoundingClientRect();
                const layer=$('combat-fx').getBoundingClientRect();
                return {...g, hero:{left:hero.left-layer.left, right:hero.right-layer.left,
                    top:hero.top-layer.top, bottom:hero.bottom-layer.top}};
            }''')
            target, source, hero = geometry['target'], geometry['source'], geometry['hero']
            assert 0 < target['x'] < source['x'] < geometry['width'], (width, mob, geometry)
            assert 0 < target['y'] < geometry['height'], (width, mob, geometry)
            assert 0 < source['y'] < geometry['height'], (width, mob, geometry)
            assert hero['left'] <= target['x'] <= hero['right'], (width, mob, geometry)
            assert hero['top'] <= target['y'] <= hero['bottom'], (width, mob, geometry)
            page.evaluate('monsterHit(()=>.99)')
            state = page.evaluate('''() => {
                for (const a of $('arena').getAnimations({subtree:true})) {
                    if(a.animationName?.startsWith('field-')) {a.pause();a.currentTime=360;}
                }
                const body=$('arena').querySelector('.enemy-position');
                const contact=document.querySelector('.field-contact');
                const hero=$('arena').querySelector('.hero-position');
                return {motion:getComputedStyle(body).animationName,
                    transform:getComputedStyle(body).transform,
                    motes:document.querySelectorAll('.field-mote').length,
                    claws:document.querySelectorAll('.field-claw-mark').length,
                    clouds:document.querySelectorAll('.field-cloud').length,
                    whips:document.querySelectorAll('.field-tether path').length,
                    gusts:document.querySelectorAll('.field-gust').length,
                    contactWidth:parseFloat(getComputedStyle(contact).width),
                    contactOpacity:parseFloat(getComputedStyle(contact).opacity),
                    heroMotion:getComputedStyle(hero).animationName,
                    heroTransform:getComputedStyle(hero).transform,
                    lunge:parseFloat($('arena').style.getPropertyValue('--field-lunge-x'))};
            }''')
            assert state['motion'] == motion, (width, mob, state)
            assert state['transform'] not in ['none', 'matrix(1, 0, 0, 1, 0, 0)'], (mob, state)
            assert state['motes'] == (4 if mob == 'slime' else 0), (mob, state)
            assert state['claws'] == (3 if mob in ['rabbit','eliteRabbit'] else 0), (mob, state)
            assert state['clouds'] == (1 if mob == 'mushroom' else 0), (mob, state)
            assert state['whips'] == (2 if mob == 'snail' else 0), (mob, state)
            assert state['gusts'] == (3 if mob == 'moth' else 0), (mob, state)
            assert state['contactWidth'] >= 78 and state['contactOpacity'] > .5, (width,mob,state)
            assert state['heroMotion'] in ['field-hero-hit','field-hero-buffet'], state
            assert state['heroTransform'] != 'none', state
            if mob in ['rabbit','eliteRabbit']:
                assert state['lunge'] < -30, (width,state)
                # At contact the actual painted creature must close the gap.
                dx=page.locator('.enemy-position').evaluate('(el)=>new DOMMatrix(getComputedStyle(el).transform).m41')
                assert dx < -30, (width,dx)
            # The trace must remain readable after the initial flash has passed.
            lingering=page.evaluate('''() => {
                for(const a of $('arena').getAnimations({subtree:true}))
                    if(a.animationName?.startsWith('field-')) a.currentTime=720;
                const n=document.querySelector('.field-claw-mark')||document.querySelector('.field-contact');
                return parseFloat(getComputedStyle(n).opacity);
            }''')
            assert lingering > .2, (width,mob,lingering)
            page.evaluate('''() => {for(const a of $('arena').getAnimations({subtree:true}))
                if(a.animationName?.startsWith('field-')) a.currentTime=360;}''')
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), width
            if width == 1440 or width == 390:
                page.locator('#arena').screenshot(path=f'/tmp/mosslight-field-{mob}-{width}.png')

    # Repeated fast attacks must create a fresh body animation even while the
    # prior data-cast-skill attribute still names the same species.
    encounter(page, 'moth')
    restarted = page.evaluate('''() => {
        monsterHit(()=>.99);
        const body=$('arena').querySelector('.enemy-position');
        const first=body.getAnimations().find(a=>a.animationName==='field-moth-beat');
        first.pause(); first.currentTime=450;
        monsterHit(()=>.99);
        const next=body.getAnimations().find(a=>a.animationName==='field-moth-beat');
        return {fresh:first!==next, time:next.currentTime ?? 0};
    }''')
    assert restarted['fresh'] and restarted['time'] < 100, restarted

    encounter(page, 'rabbit')
    page.evaluate('dodgeChance=()=>1;monsterHit(()=>0)')
    assert page.locator('.field-claw-mark').first.evaluate('(el)=>getComputedStyle(el).display') == 'none'
    assert page.locator('.hero-position').evaluate('(el)=>getComputedStyle(el).animationName') == 'field-hero-dodge'
    page.evaluate('for(let i=0;i<100;i++)emitFieldAttack(FIELD_SKILLS.moth)')
    assert page.locator('.combat-burst').count() == 5
    assert page.evaluate('combatFxTimers.size') == 5
    page.evaluate('s.paused=true;renderEncounter()')
    assert page.locator('.field-attack').count() == 0
    assert page.evaluate('combatFxTimers.size') == 0
    assert page.evaluate('emitFieldAttack(FIELD_SKILLS.moth)') is False

    encounter(page, 'snail')
    page.evaluate('monsterHit(()=>.99);s.effectsLite=true;renderEncounter()')
    assert page.locator('.field-attack').count() == 0
    assert page.evaluate('emitFieldAttack(FIELD_SKILLS.snail)') is False
    assert '이슬 점액 채찍' in page.locator('#enemy-intent-text').inner_text()
    assert page.locator('#combat-fx').evaluate('(el)=>getComputedStyle(el).display') == 'none'

    encounter(page, 'mushroom')
    page.evaluate('monsterHit(()=>.99)')
    page.emulate_media(reduced_motion='reduce')
    page.evaluate('renderEncounter()')
    assert page.locator('.field-attack').count() == 0
    assert page.evaluate('emitFieldAttack(FIELD_SKILLS.mushroom)') is False
    assert page.locator('#combat-fx').evaluate('(el)=>getComputedStyle(el).display') == 'none'
    assert page.locator('.enemy-position').evaluate('(el)=>getComputedStyle(el).animationName') == 'none'
    assert '자두빛 포자 숨결' in page.locator('#enemy-intent-text').inner_text()

    assert not errors, errors
    print(json.dumps({'result': 'PASS five distinct attack structures, lunging claws, broad impacts and lingering traces at 390/800/1440; fast recast restart; five-burst budget; pause/lite/reduced cleanup; no JS errors'}))
    browser.close()
