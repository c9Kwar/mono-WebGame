"""Verify painted art through the actual battle, codex, armory and crafting UI."""
import json
import os
import shutil
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright


BASE = os.environ.get('GAME_URL', 'http://127.0.0.1:8082')
WIDTHS = [390, 800, 1440]
TABS = ['battle', 'boss', 'equipment', 'inventory', 'shop', 'collection', 'codex', 'journey']


def check_art(locator):
    """Measure rendered crops, so CSS overrides cannot silently distort a sheet."""
    measurements = locator.evaluate_all('''frames => frames.map(frame => {
        const image = frame.querySelector('img'), box = frame.getBoundingClientRect();
        const picture = image.getBoundingClientRect(), style = getComputedStyle(frame);
        return {key:frame.dataset.artKey, cell:frame.dataset.artCell,
            width:box.width, height:box.height, clip:style.clipPath,
            complete:image.complete && image.naturalWidth > 0,
            src:new URL(image.currentSrc || image.src).pathname,
            scaleX:picture.width / image.naturalWidth,
            scaleY:picture.height / image.naturalHeight,
            left:image.style.left, top:image.style.top};
    })''')
    assert measurements, 'No illustrated frame was rendered'
    for art in measurements:
        assert art['complete'], art
        assert '/art/' in art['src'], art
        assert art['key'] and art['clip'].startswith('polygon('), art
        assert art['width'] > 0 and art['height'] > 0, art
        assert abs(art['width'] - art['height']) <= 1, art
        # A single decorative border pixel may round the content box differently.
        assert abs(art['scaleX'] / art['scaleY'] - 1) <= .01, art
    return measurements


def battle(page, key):
    page.evaluate('''key => {
        boss = key.startsWith('boss'); bossId = boss ? Number(key.slice(4)) : 0;
        currentMob = boss ? 'snail' : key; bossTier = 'normal';
        phase = 'combat'; phaseLeft = 0; bossLeft = 60; hp = maxHp = 1000000;
        encounterSerial++; render(); renderBattleScene();
    }''', key)
    page.wait_for_function('''key =>
        document.querySelector('#arena').getAttribute('aria-busy') === 'false' &&
        document.querySelector('#painted-enemy').dataset.artKey === key''', arg=key)
    assert page.locator('.hero-rig').is_visible(), key
    assert page.locator('#arena').evaluate("el => el.classList.contains('layered-scene')"), key
    art = check_art(page.locator('#painted-enemy'))[0]
    assert art['key'] == key, (key, art)
    return art


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(
        executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),
        headless=True, args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1440, 'height': 1080})
    errors, failed_requests = [], []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('response', lambda response: failed_requests.append(response.url)
            if response.status >= 400 else None)
    # Use ordinary UI rendering with a stable game clock and a complete collection.
    page.add_init_script('window.setInterval = () => 0')
    page.goto(BASE)
    page.wait_for_function("typeof s !== 'undefined' && typeof creatureArt === 'function'")
    page.evaluate('''s.paused=true; s.total=100; s.highestStage=25;
        for (const key of Object.keys(ITEMS)) award(key,1,()=>.5);
        render(); renderLoot();''')
    page.wait_for_function("document.querySelector('#arena').getAttribute('aria-busy') === 'false'")

    # The full painted hero replaces the former knight in both display locations.
    assert page.locator('.hero-rig').count() == 1
    assert page.locator('#hero-original-art').get_attribute('href') == 'art/mosslight-adventurer.png'
    assert page.locator('.hero-shield').count() == 0
    assert page.locator('.hero-head').count() == 1
    assert page.locator('.hero-sword-hand').get_attribute('data-tip-x')
    assert not page.locator('.hero-position img[src*="knight"]').count()

    # Each normal monster, elite, boss and fox displays a distinct real crop.
    creature_keys = page.evaluate("[...Object.keys(MOBS), ...BOSSES.map((_, id) => 'boss'+id)]")
    assert len(creature_keys) == 16
    battle_art = [battle(page, key) for key in creature_keys]
    assert len({art['cell'] for art in battle_art}) == 16
    assert len({(art['left'], art['top']) for art in battle_art}) == 16

    page.locator('#tab-codex').click()
    codex_art = []
    for kind in ['mobs', 'bosses']:
        page.locator('#codex-' + kind).click()
        count = page.locator('#codex-entities button').count()
        for index in range(count):
            page.locator('#codex-entities button').nth(index).click()
            art = check_art(page.locator('#painted-codex'))[0]
            assert page.locator('#codex-image').get_attribute('alt')
            codex_art.append(art)
    assert {art['key'] for art in codex_art} == set(creature_keys)

    page.locator('#tab-boss').click()
    boss_art = check_art(page.locator('#boss-list .boss-card-art'))
    assert {art['key'] for art in boss_art} == {'boss'+str(i) for i in range(5)}
    page.locator('#header-boss').click()
    quick_art = check_art(page.locator('#quick-boss-list .quick-boss-art'))
    assert {art['key'] for art in quick_art} == {'boss'+str(i) for i in range(5)}
    page.locator('#quick-boss-close').click()

    # Inspect the actual paginated armory, not a synthetic atlas gallery.
    page.locator('#tab-equipment').click()
    page.locator('.preparation-help > summary').click()
    portrait = page.locator('.preparation-art img')
    assert portrait.is_visible()
    assert portrait.get_attribute('src') == 'art/mosslight-adventurer.png'
    assert portrait.evaluate('el => el.complete && el.naturalWidth > 0')
    gear_art = []
    while True:
        gear_art.extend(check_art(page.locator('#gear-list .premium-item-art')))
        if page.locator('#gear-page-next').is_disabled():
            break
        page.locator('#gear-page-next').click()
    assert len(gear_art) == 27
    assert len({art['key'] for art in gear_art}) == 27
    assert len({(art['left'], art['top']) for art in gear_art}) == 27
    page.locator('#gear-page-prev').click()

    # The bag exposes all 60 item names and paintings; recipes use the same mounts.
    page.locator('#tab-inventory').click()
    page.locator('#inventory-filter').select_option('owned')
    bag_art = check_art(page.locator('#inventory-grid .premium-item-art'))
    assert len(bag_art) == 60
    item_names = page.evaluate('Object.values(ITEMS).map(item => item.name)')
    assert set(page.locator('#inventory-grid .item-slot strong').all_text_contents()) == set(item_names)
    assert page.locator('#inventory-grid .item-slot[aria-label]').count() == 60
    recipe_keys = page.evaluate('Object.keys(RECIPES)')
    assert len(recipe_keys) == 18
    for key in recipe_keys:
        art = check_art(page.locator('#recipe-info-' + key + ' .premium-item-art'))
        assert len(art) == 1 and art[0]['key'] == key, (key, art)

    # The new typography, image wrappers and visible controls must still fit.
    for width in WIDTHS:
        page.set_viewport_size({'width': width, 'height': 1080})
        for tab in TABS:
            page.locator('#tab-' + tab).click()
            assert page.locator('#view-' + tab).is_visible(), (width, tab)
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width, tab)
            if tab == 'battle':
                battle(page, 'treasure')
                check_art(page.locator('#painted-enemy'))
            elif tab == 'equipment':
                check_art(page.locator('#gear-list .premium-item-art'))
            elif tab == 'codex':
                check_art(page.locator('#painted-codex'))
            elif tab == 'boss':
                check_art(page.locator('#boss-list .boss-card-art'))
            if width != 800 and tab in ['battle', 'equipment', 'codex']:
                page.screenshot(path=f'/tmp/mosslight-oil-final-{tab}-{width}.png', full_page=True)
        page.locator('#tab-equipment').focus()
        page.keyboard.press('ArrowDown')
        assert page.locator('#view-inventory').is_visible()
        assert page.evaluate("document.activeElement.matches(':focus-visible')")
        assert page.evaluate("getComputedStyle(document.activeElement).outlineStyle !== 'none'")

    assert not errors, errors
    assert not failed_requests, failed_requests

    # A cold connection failure must retain the new neutral loading state instead
    # of revealing the former background with a baked-in knight. A fresh context
    # also proves hidden legacy mounts do not download their unused old artwork.
    cold_context = browser.new_context(viewport={'width': 390, 'height': 1080})
    cold_context.add_init_script('window.setInterval = () => 0')
    cold = cold_context.new_page()
    cold_requests, cold_errors = [], []
    cold.on('request', lambda request: cold_requests.append(request.url))
    cold.on('pageerror', lambda error: cold_errors.append(str(error)))
    cold.route('**/art/*.png', lambda route: route.abort())
    cold.goto(BASE)
    cold.wait_for_function("document.querySelector('#scene-load-status').textContent.includes('다시')")
    assert cold.locator('#scene-load-status').is_visible()
    assert cold.locator('#arena').evaluate('el => getComputedStyle(el).backgroundImage') == 'none'
    assert not cold.locator('#arena').evaluate("el => el.classList.contains('layered-scene')")
    assert not [url for url in cold_requests if urlsplit(url).path.endswith('.webp')], cold_requests
    assert not cold_errors, cold_errors
    cold_context.close()

    print(json.dumps({'result': 'PASS 16 battle/codex paintings, 5 boss/quick-boss portraits, 27 equipment paintings across real armory pages, 60 bag items, 18 static recipes, unstretched crops, adult hero mounts, 8 tabs at 3 widths, keyboard focus, neutral cold-load failure with no legacy downloads, no runtime/HTTP errors'}))
    browser.close()
