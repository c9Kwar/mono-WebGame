"""Real Chromium pose geometry, encounter skills and cosmetic lifecycle regression.

Run against the same local static server as browser-smoke.py. The combat interval is
disabled so explicit combat steps and CSS animation seeking are deterministic;
browser rendering, DOM events, storage, animations and cleanup timers remain real.
"""
import json
import os
import shutil

from playwright.sync_api import sync_playwright


BASE = os.environ.get('GAME_URL', 'http://127.0.0.1:8082')
WIDTHS = [390, 800, 1440]


def encounter(page, mob='snail', boss_id=None, tier='normal'):
    """Select an encounter without depending on its rare random spawn chance."""
    page.evaluate('''({mob, bossId: id, tier}) => {
        if ($('victory-dialog').open) $('victory-dialog').close();
        s.paused = false; s.effectsLite = false; s.rewardPending = false;
        s.rewardAuto = false; s.stage = 11; s.highestStage = 25; s.total = 100;
        s.vitality = 70; s.guard = 0; s.speed = 0; s.heroHp = heroMaxHp();
        boss = id !== null; bossId = id ?? 0; bossTier = tier;
        bossLeft = BOSS_TIERS[tier].time; bossGate = false; bossStrikes = 0;
        currentMob = mob; phase = 'combat'; phaseLeft = 0;
        hp = maxHp = 1000000; enemyClock = 0; attackClock = 0;
        encounterSerial++; render(); renderBattleScene();
    }''', {'mob': mob, 'bossId': boss_id, 'tier': tier})
    page.wait_for_function("document.querySelector('#arena').getAttribute('aria-busy') !== 'true'")


def seek_arena(page, milliseconds):
    page.evaluate('''ms => {
        for (const animation of $('arena').getAnimations({subtree: true})) {
            animation.pause(); animation.currentTime = ms;
        }
    }''', milliseconds)


def reward_snapshot(page):
    return page.evaluate('JSON.stringify([s.gold, s.inventory, s.gear, s.total, s.bossWins, s.defeated])')


def assert_no_overflow(page, width):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), width


def sword_poses(page, critical=False, received=False):
    return page.evaluate('''({critical, received}) => {
        clearCombatEffects(); animateStrike(false, critical);
        if (received) animateStrike(true, false, true);
        const sword = document.querySelector('.hero-sword-hand');
        const headActor = document.querySelector('.hero-head');
        const point = (element, x, y) => {
            const p = new DOMPoint(x, y).matrixTransform(element.getScreenCTM());
            return {x: p.x, y: p.y};
        };
        const animations = $('arena').getAnimations({subtree:true});
        const frames = [0, .34, .44, .64, .99].map(progress => {
            for (const animation of animations) {
                animation.pause();
                animation.currentTime = animation.effect.getTiming().duration * progress;
            }
            return {
                tip: point(sword, Number(sword.dataset.tipX), Number(sword.dataset.tipY)),
                grip: point(sword, Number(sword.dataset.gripX), Number(sword.dataset.gripY)),
                head: point(headActor, Number(headActor.dataset.topX), Number(headActor.dataset.topY)),
            };
        });
        const bounds = $('arena').getBoundingClientRect();
        return {frames, bounds: {left: bounds.left, top: bounds.top,
            right: bounds.right, bottom: bounds.bottom},
            animations: animations.map(animation => animation.animationName)};
    }''', {'critical': critical, 'received': received})


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(
        executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),
        headless=True, args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1440, 'height': 1080})
    errors, failed_requests = [], []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('response', lambda response: failed_requests.append(response.url)
            if response.status >= 400 else None)
    page.add_init_script('window.setInterval = () => 0')
    page.goto(BASE)
    page.wait_for_function("typeof s !== 'undefined' && typeof renderEncounter === 'function'")

    pose_results = []
    for width in WIDTHS:
        page.set_viewport_size({'width': width, 'height': 1080})
        encounter(page, boss_id=0)
        for critical, received in [(False, False), (True, False), (False, True)]:
            poses = sword_poses(page, critical, received)
            rest, raised, held, down, recovered = poses['frames']
            assert poses['animations'], (width, 'missing attack animation')
            for overhead in [raised, held]:
                assert overhead['tip']['y'] < overhead['head']['y'], (width, poses)
                assert overhead['tip']['y'] < rest['tip']['y'] - 10, (width, poses)
            assert down['tip']['y'] > down['head']['y'] + 20, (width, poses)
            assert down['tip']['y'] > held['tip']['y'] + 40, (width, poses)
            assert down['tip']['x'] > held['tip']['x'], (width, poses)
            for frame in [raised, held, down]:
                assert poses['bounds']['top'] <= frame['tip']['y'] <= poses['bounds']['bottom'], (width, poses)
                assert poses['bounds']['left'] <= frame['tip']['x'] <= poses['bounds']['right'], (width, poses)
            pose_results.append({'width': width, 'critical': critical, 'overlap': received,
                                 'lift_px': round(rest['tip']['y'] - raised['tip']['y'], 1),
                                 'drop_px': round(down['tip']['y'] - held['tip']['y'], 1)})
        for label, time in [('raised', 220), ('downstroke', 352)]:
            page.evaluate("clearCombatEffects(); $('encounter-intro').classList.remove('reveal'); animateStrike(false, true)")
            seek_arena(page, time)
            page.locator('#arena').screenshot(path=f'/tmp/mosslight-sword-{label}-{width}.png')
        assert_no_overflow(page, width)

    # Every species uses the articulated hero, including the former baked scenes.
    for mob in page.evaluate('Object.keys(MOBS)'):
        encounter(page, mob=mob)
        assert page.locator('#arena').evaluate("el => el.classList.contains('layered-scene')"), mob
        assert page.locator('.hero-rig').is_visible(), mob
        assert page.locator('#enemy-actor').evaluate('el => el.complete && el.naturalWidth > 0'), mob

    # A killing blow finishes the actual stroke, with contact after the overhead
    # windup; rewards are already credited and cannot replay with the animation.
    for boss_id, speed_level in [(None, 0), (0, 30)]:
        encounter(page, boss_id=boss_id)
        initial = page.evaluate('''speedLevel => {
            s.speed = speedLevel; hp = 1; clearCombatEffects();
            window.finishingSwordEnded = false;
            document.querySelector('.hero-arm').addEventListener('animationend', () => {
                window.finishingSwordEnded = true;
            }, {once:true});
            const start = performance.now(); damage(1);
            // Simulate a busy reward/loot render before the browser's next frame.
            // Cosmetic contact must follow the blade even when the main thread
            // delays the CSS animation start, rather than follow wall time alone.
            const busyUntil = performance.now() + 100;
            while (performance.now() < busyUntil) Math.sqrt(performance.now());
            return {start, duration:heroStrikeDuration, interval:1000 / speed(), phase};
        }''', speed_level)
        assert initial['phase'] == ('loot' if boss_id is None else 'victory')
        assert initial['duration'] < initial['interval']
        assert page.locator('#arena').evaluate("el => el.classList.contains('hero-striking')")
        if boss_id is None:
            assert page.locator('#travel-overlay').evaluate("el => getComputedStyle(el).visibility") == 'hidden'
        assert page.locator('.contact-feedback.feedback-slash').count() == 0
        receipt = reward_snapshot(page)
        page.wait_for_function("document.querySelector('.contact-feedback.feedback-slash') !== null", timeout=1500)
        contact = page.evaluate('''() => {
            const sword = document.querySelector('.hero-sword-hand');
            const headActor = document.querySelector('.hero-head');
            const tip = new DOMPoint(Number(sword.dataset.tipX), Number(sword.dataset.tipY)).matrixTransform(sword.getScreenCTM());
            const head = new DOMPoint(Number(headActor.dataset.topX),Number(headActor.dataset.topY)).matrixTransform(headActor.getScreenCTM());
            return {at:performance.now(), tipY:tip.y, headY:head.y,
                poseAnimations: document.querySelector('.hero-arm').getAnimations().map(animation => ({
                    name:animation.animationName, currentTime:animation.currentTime,
                    duration:animation.effect.getTiming().duration, state:animation.playState}))};
        }''')
        assert contact['at'] - initial['start'] >= initial['duration'] * .5, initial
        assert contact['tipY'] > contact['headY'], (initial, contact)
        page.wait_for_function("!document.querySelector('#arena').classList.contains('hero-striking')")
        assert page.evaluate('window.finishingSwordEnded'), (initial, 'recovery animation ended early')
        if boss_id is None:
            assert page.locator('#travel-overlay').is_visible()
        page.evaluate('damage(1000000); render()')
        assert reward_snapshot(page) == receipt

    skill_colors = {}
    boss_skills = ['crown', 'root', 'charge', 'moon', 'acorn']
    for boss_id, skill in enumerate(boss_skills):
        encounter(page, boss_id=boss_id)
        page.evaluate('bossStrikes = BOSS_BALANCE[bossId].every - 1; enemyClock = enemyInterval() - .3; render()')
        assert page.locator('#arena').get_attribute('data-skill') == skill
        assert page.locator('#boss-pattern').is_visible()
        assert page.evaluate("$('boss-pattern-name').textContent.includes(BOSS_BALANCE[bossId].skill)")
        result = page.evaluate('''() => {
            const expected = incomingDamage(), before = s.heroHp;
            const name = BOSS_BALANCE[bossId].skill;
            monsterHit(() => 1);
            return {expected, actual: before - s.heroHp,
                named: $('last-impact').textContent.includes(name), strikes: bossStrikes,
                every: BOSS_BALANCE[bossId].every};
        }''')
        assert result['expected'] == result['actual'], (skill, result)
        assert result['named'] and result['strikes'] == result['every'], (skill, result)
        effect = page.locator(f'.encounter-fx.skill-{skill}.skill-cast')
        assert effect.count() == 1, skill
        assert effect.locator('.skill-fragment').count() == 6, skill
        seek_arena(page, 250)
        assert effect.locator('.skill-source').evaluate("el => getComputedStyle(el).animationName") != 'none', skill
        assert effect.locator('.skill-impact').evaluate("el => getComputedStyle(el).animationName") != 'none', skill
        assert effect.locator('.skill-source').evaluate("el => el.getBoundingClientRect().width > 0"), skill
        assert effect.locator('.skill-source').evaluate("el => Number(getComputedStyle(el).opacity) > .05"), skill
        assert effect.locator('.skill-impact').evaluate("el => Number(getComputedStyle(el).opacity) > .05"), skill
        skill_colors[skill] = effect.evaluate('el => getComputedStyle(el).color')
        page.locator('#arena').screenshot(path=f'/tmp/mosslight-boss-skill-{skill}.png')

    # The charged spell still appears when the hero evades or blocks its damage.
    for defense in ['dodge', 'block']:
        encounter(page, boss_id=3)
        result = page.evaluate('''defense => {
            bossStrikes = BOSS_BALANCE[bossId].every - 1;
            const oldBoots = s.slots.boots, oldGuard = s.passives.guard, oldGuardBuff = s.passiveBuffs.guard;
            s.passiveBuffs.guard = 0;
            if (defense === 'dodge') {
                const boots = award('scoutboots', 1, () => .5);
                boots.potentials = [{type:'dodge', value:.05, grade:3},{type:'movePct', value:.01, grade:0}];
                s.slots.boots = boots.id;
            } else s.passives.guard = 1;
            render();
            const expected = defense === 'dodge' ? 0 : Math.max(1, Math.round(incomingDamage() * .70));
            const before = s.heroHp;
            let draws = 0;
            // Current guard: 4% proc, then 30% reduction for five seconds.
            monsterHit(() => defense === 'dodge' ? 0 : draws++ === 0 ? .9 : .01);
            const result = {expected, actual:before - s.heroHp, impact:$('last-impact').textContent};
            s.slots.boots = oldBoots; s.passiveBuffs.guard = oldGuardBuff;
            if (oldGuard) s.passives.guard = oldGuard; else delete s.passives.guard;
            return result;
        }''', defense)
        assert result['actual'] == result['expected'], (defense, result)
        assert ('회피' if defense == 'dodge' else '방어 성공') in result['impact'], (defense, result)
        assert page.locator('.skill-moon.skill-cast').count() == 1, defense

    for mob, skill in [('eliteSlime', 'moss'), ('eliteMushroom', 'spore'),
                       ('eliteMoth', 'wing'), ('eliteSnail', 'shell'), ('eliteRabbit', 'field-claw')]:
        encounter(page, mob=mob)
        page.evaluate('enemyClock = enemyInterval() - .3; render()')
        assert page.locator('#arena').get_attribute('data-skill') == skill, mob
        assert page.locator('#arena').evaluate("el => el.classList.contains('skill-charging')"), mob
        expected = page.evaluate('incomingDamage()')
        before = page.evaluate('s.heroHp')
        page.evaluate('monsterHit(() => 1)')
        assert before - page.evaluate('s.heroHp') == expected, mob
        assert page.locator(f'.encounter-fx.skill-{skill}.skill-cast').count() == 1, mob
        skill_colors[skill] = page.locator(f'.skill-{skill}.skill-cast').evaluate('el => getComputedStyle(el).color')

    # Fox arrival and victory are emitted once per transition, never per render.
    encounter(page, mob='treasure')
    assert page.locator('.skill-fox.skill-arrive').count() == 1
    skill_colors['fox'] = page.locator('.skill-fox.skill-arrive').evaluate('el => getComputedStyle(el).color')
    assert len({skill_colors[skill] for skill in ['crown', 'moon', 'spore', 'fox']}) == 4, skill_colors
    page.evaluate('for (let i = 0; i < 20; i++) render()')
    assert page.locator('.skill-fox.skill-arrive').count() == 1
    page.evaluate('monsterHit(() => 1); damage(1)')
    assert page.locator('.skill-fox.skill-cast').count() == 1
    page.evaluate('damage(maxHp*2 + 1)')
    assert page.evaluate('phase') == 'victory'
    assert page.locator('#arena').evaluate("el => el.classList.contains('hero-striking')")
    page.wait_for_function("document.querySelector('.skill-fox.skill-victory') !== null", timeout=1500)
    assert page.locator('.skill-fox.skill-victory').count() == 1
    awarded = reward_snapshot(page)
    page.evaluate('for (let i = 0; i < 20; i++) { damage(10000000); render(); }')
    assert reward_snapshot(page) == awarded
    assert page.locator('.skill-fox.skill-victory').count() == 1
    seek_arena(page, 300)
    page.locator('#arena').screenshot(path='/tmp/mosslight-fox-victory.png')
    page.evaluate('stepBattleReward(2); save()')
    page.reload()
    assert page.locator('#victory-dialog').evaluate('el => el.open')
    assert reward_snapshot(page) == awarded
    page.locator('#victory-continue').click()
    page.locator('#reward-reopen').click()
    page.locator('#victory-continue').click()
    assert reward_snapshot(page) == awarded

    # Cosmetic work never consumes combat RNG, HP or rewards and remains bounded.
    encounter(page, boss_id=3)
    page.evaluate('bossStrikes = BOSS_BALANCE[bossId].every - 1; render()')
    unchanged = reward_snapshot(page)
    page.evaluate('''() => {
        const rng = Math.random;
        Math.random = () => { throw Error('Cosmetic effect consumed combat RNG'); };
        try { for (let i = 0; i < 100; i++) emitEncounterEffect(enemySkill()); }
        finally { Math.random = rng; }
    }''')
    assert page.locator('.combat-burst').count() == 5
    assert page.locator('.combat-burst .skill-fragment').count() == 30
    assert reward_snapshot(page) == unchanged
    assert page.locator('#combat-fx').evaluate("el => getComputedStyle(el).pointerEvents") == 'none'
    page.wait_for_timeout(1150)
    assert page.locator('.combat-burst').count() == 0

    # Preferences and visibility settle both the blade and skill particles.
    for state in ['pause', 'lite', 'reduced', 'hidden']:
        encounter(page, boss_id=0)
        page.evaluate('bossStrikes = BOSS_BALANCE[bossId].every - 1; render(); monsterHit(() => 1); animateStrike()')
        if state == 'pause':
            page.locator('#pause').click()
        elif state == 'lite':
            page.locator('#fx-toggle').click()
        elif state == 'reduced':
            page.emulate_media(reduced_motion='reduce')
        else:
            page.evaluate("Object.defineProperty(document, 'hidden', {configurable:true, value:true}); document.dispatchEvent(new Event('visibilitychange'))")
        page.wait_for_function("document.querySelectorAll('.combat-burst').length === 0")
        assert not page.locator('#arena').evaluate("el => /hero-striking|hero-critical|enemy-striking|heavy-impact|skill-charging/.test(el.className)"), state
        assert page.evaluate("emitEncounterEffect({id:'crown',name:'test',cue:'test',glyph:'✦'})") is False, state
        page.evaluate('animateStrike(); animateStrike(true, false, true)')
        assert not page.locator('#arena').evaluate("el => /hero-striking|hero-critical|enemy-striking|heavy-impact/.test(el.className)"), state
        if state == 'reduced':
            assert page.locator('.hero-arm').evaluate("el => getComputedStyle(el).animationName") == 'none'
            page.emulate_media(reduced_motion='no-preference')
        elif state == 'hidden':
            page.evaluate("delete document.hidden; document.dispatchEvent(new Event('visibilitychange'))")

    for width in WIDTHS:
        page.set_viewport_size({'width': width, 'height': 1080})
        encounter(page, boss_id=4, tier='mystic')
        page.evaluate('bossStrikes = BOSS_BALANCE[bossId].every - 1; enemyClock = enemyInterval() - .3; render(); monsterHit(() => 1)')
        assert_no_overflow(page, width)
        seek_arena(page, 220)
        page.locator('#arena').screenshot(path=f'/tmp/mosslight-skill-layout-{width}.png')

    assert not errors, errors
    assert not failed_requests, failed_requests
    print(json.dumps({'result': 'PASS overhead/downstroke geometry, all mob layers, five boss skills, five elite skills, fox arrival/cast/victory and replay-safe rewards, 5-burst bound, live preference/visibility cleanup, three widths, no runtime/HTTP errors', 'poses': pose_results}))
    browser.close()
