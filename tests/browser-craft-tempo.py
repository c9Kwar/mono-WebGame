"""Ready-only crafting, requirement feedback and real-time initiative in Chromium."""
import json, os, shutil
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'), headless=True, args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1440, 'height': 1000})
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(os.environ.get('GAME_URL', 'http://127.0.0.1:8082'))
    page.evaluate("s.paused=true;s.gold=179;s.inventory={moss:20,spore:10};s.discovered=[];render();renderLoot();save()")
    page.locator('#tab-inventory').click()
    assert page.locator('#craft-ready-only').is_checked()
    assert page.locator('.recipe-card:visible').count() == 0
    assert page.locator('#craft-empty').is_visible()
    page.locator('#craft-ready-only').uncheck()
    page.locator('#craft-filter-weapon').click()
    page.locator('#recipe-info-practiceblade').click()
    assert '재료 모두 수집 완료' in page.locator('#craft-tip-status').inner_text()
    assert '골드 부족' in page.locator('#craft-tip-status').inner_text()
    assert '부족 1' in page.locator('#craft-tip-gold').inner_text()
    assert all('✓ 준비 완료' in text for text in page.locator('#craft-tip-materials p').all_text_contents())
    page.screenshot(path='/tmp/mosslight-craft-material-ready.png')
    page.locator('#close-craft-tip').click()
    page.locator('#craft-ready-only').check()
    page.evaluate('s.gold=180;render()')
    assert page.locator('.recipe-card:visible').count() == 1
    assert page.locator('#craft-practiceblade').is_enabled()
    for width in [390, 800, 1522]:
        page.set_viewport_size({'width': width, 'height': 1000})
        page.locator('#recipe-card-practiceblade').scroll_into_view_if_needed()
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        assert page.locator('#craft-ready-only').is_visible()
        page.screenshot(path=f'/tmp/mosslight-craft-ready-{width}.png', full_page=True)
    page.locator('#craft-practiceblade').click()
    assert page.evaluate('s.inventory.practiceblade') == 1
    assert page.locator('.recipe-card:visible').count() == 0
    assert not page.locator('#craft-tooltip').is_visible()
    page.locator('#craft-filter-all').click()
    page.evaluate('s.gold=12000;for(const [key,n] of Object.entries(RECIPES.shellcoat))s.inventory[key]=n;render()')
    assert not page.locator('#recipe-card-shellcoat').is_visible()
    page.evaluate("award('bp_shellcoat');render()")
    assert page.locator('#recipe-card-shellcoat').is_visible()
    page.locator('#craft-rarity').select_option('rare')
    assert not page.locator('#recipe-card-shellcoat').is_visible()
    page.locator('#craft-rarity').select_option('legendary')
    assert page.locator('#recipe-card-shellcoat').is_visible()
    page.locator('#recipe-info-shellcoat').click()
    assert '✓ 설계도 해금 완료' in page.locator('#craft-tip-materials').inner_text()
    page.locator('#close-craft-tip').click()
    page.evaluate('save()');page.reload();page.locator('#tab-inventory').click()
    assert page.locator('#craft-ready-only').is_checked()
    assert page.locator('#recipe-card-shellcoat').is_visible()
    # Observe the unmodified real 100ms game loop, recording actual damage owners.
    page.locator('#tab-battle').click()
    page.evaluate("var strikeOrder=[];var realDamage=damage,realMonsterHit=monsterHit;damage=(...args)=>{strikeOrder.push('hero');return realDamage(...args)};monsterHit=(...args)=>{strikeOrder.push('enemy');return realMonsterHit(...args)}")
    cases = [('moth', 0, 'enemy'), ('rabbit', 0, 'enemy'), ('snail', 0, 'hero'), ('moth', 30, 'hero'), ('treasure', 0, 'enemy')]
    for mob, speed, first in cases:
        page.evaluate("([mob,speed])=>{s.paused=true;boss=false;s.rewardPending=false;phase='combat';currentMob=mob;s.speed=speed;s.vitality=30;s.passives={};s.gear=[];s.slots={};s.heroHp=heroMaxHp();hp=maxHp=1e8;attackClock=enemyClock=0;strikeOrder=[];lastTick=Date.now();s.paused=false;render()}", [mob,speed])
        page.wait_for_function('strikeOrder.length>0', timeout=2500)
        page.evaluate('s.paused=true;render()')
        assert page.evaluate('strikeOrder[0]') == first, (mob,speed,page.evaluate('strikeOrder'))
        assert page.evaluate('MOBS[currentMob].tempo') in page.locator('#enemy-attack-info').inner_text()
    page.locator('#tab-codex').click()
    page.locator('#codex-entities button').filter(has_text='달빛 나방').click()
    assert '공격 간격 0.85초' in page.locator('#codex-description').inner_text()
    assert not errors, errors
    print(json.dumps({'result': 'PASS crafting readiness, exact shortages, gold and blueprint gates, live acquisition/consumption, slot+rarity filters, reload, 3 widths; 5 real-time initiative cases and codex cadence'}))
    browser.close()
