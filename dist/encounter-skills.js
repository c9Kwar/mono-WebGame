/* Mosslight: an automatic skill is one combat event, however many visual wisps it has. */
(function () {
  'use strict';
  const elite = {
    eliteSlime: { name: '이끼 방울', motif: 'dew', cue: '몸을 낮춘 뒤 이슬 방울을 튕깁니다.', color: 'sage' },
    eliteMushroom: { name: '포자 부채', motif: 'spore', cue: '갓 아래의 포자가 부채처럼 퍼집니다.', color: 'mauve' },
    eliteMoth: { name: '달가루 날갯짓', motif: 'feather', cue: '날개에 모인 달가루가 은빛 호를 그립니다.', color: 'moon' },
    eliteSnail: { name: '나선 물결', motif: 'shell', cue: '등껍질 문양에서 동그란 물결을 보냅니다.', color: 'jade' },
    eliteRabbit: { name: '새싹 도약', motif: 'leaf', cue: '풀잎을 밟고 뛰어올라 짧게 돌진합니다.', color: 'sage' }
  };
  const guardians = [
    { motif: 'crown', color: 'brass', names: ['왕관 박치기', '금관의 겹물결', '별왕관의 공명'], cue: '작은 왕관에 빛을 모아 둥근 충격파를 보냅니다.' },
    { motif: 'root', color: 'sage', names: ['돌뿌리 내려찍기', '겹뿌리 파동', '고목의 별울림'], cue: '발밑의 뿌리 문양이 솟고 돌조각이 흩어집니다.' },
    { motif: 'thorn', color: 'jade', names: ['숲울림 돌진', '수호림의 메아리', '영원의 숲길'], cue: '숲의 인장을 펼치고 잎사귀를 두른 채 돌진합니다.' },
    { motif: 'feather', color: 'moon', names: ['달빛 날갯짓', '겹달의 깃비', '월식의 자장가'], cue: '달의 고리 사이로 은빛 깃털을 날립니다.' },
    { motif: 'acorn', color: 'brass', names: ['도토리 망치', '황동 도토리 강타', '별씨앗의 낙하'], cue: '호박빛 씨앗을 모아 망치의 울림을 터뜨립니다.' }
  ];
  const ranks = {
    elite: { label: '엘리트', rings: 1, motes: 5, windup: .6, duration: .95 },
    boss: { label: '수호자', rings: 1, motes: 6, windup: .75, duration: 1.1 },
    'elite-boss': { label: '엘리트 보스', rings: 2, motes: 9, windup: .9, duration: 1.2 },
    mystic: { label: '미스틱 보스', rings: 3, motes: 12, windup: 1.1, duration: 1.35 },
    treasure: { label: '황금 보물여우', rings: 2, motes: 10, windup: .85, duration: 1.35 }
  };
  function profile(context) {
    if (context.boss) {
      const b = guardians[context.bossId];
      if (!b) return null;
      const tier = context.tier === 'mystic' ? 2 : context.tier === 'elite' ? 1 : 0;
      const rank = ['boss', 'elite-boss', 'mystic'][tier];
      return { ...b, ...ranks[rank], rank, name: b.names[tier], id: 'guardian-' + context.bossId + '-' + tier, every: context.every || 4 };
    }
    if (context.mob === 'treasure') return {
      ...ranks.treasure, rank: 'treasure', id: 'jade-fox', motif: 'jade', color: 'gold', every: 3,
      name: '옥빛 삼미호화', cue: '옥구슬이 떠오르고 세 갈래 여우불이 금박 꽃잎을 남깁니다.'
    };
    const e = elite[context.mob];
    return e ? { ...e, ...ranks.elite, rank: 'elite', id: context.mob, every: 3 } : null;
  }
  function plan(context) {
    const p = profile(context);
    if (!p) return null;
    const strikes = Math.max(0, Math.floor(Number(context.strikes) || 0));
    const signature = (strikes + 1) % p.every === 0;
    // Raw attack budget remains 3.0 across each three-hit cycle. Boss multipliers live in game.js.
    const multiplier = context.boss ? 1 : p.rank === 'treasure' ? (signature ? 1.3 : .85) : (signature ? 1.2 : .9);
    return { ...p, signature, multiplier, remaining: p.every - strikes % p.every };
  }
  function description(context) {
    const p = profile(context);
    if (!p) return '';
    const tier = p.rank === 'mystic' ? '삼중 성좌 · 월식 후광' : p.rank === 'elite-boss' ? '이중 인장 · 겹파동' : p.rank === 'treasure' ? '옥구슬 · 세 갈래 여우불 · 금박 잔상' : p.rank === 'boss' ? '수호 인장 · 고유 강타' : '작은 인장 · 고유 기술';
    return p.every + '번째 공격마다 자동 발동. ' + p.cue + ' ' + tier + '.';
  }

  function createRenderer({ document: doc, arena, aura, layer, ledger, name, detail, status, hero, enemy }) {
    let key = '', auraKey = '', castLeft = 0, castPlan = null, quiet = false, combat = false;
    const make = (cls, parent, style) => {
      const el = doc.createElement('i'); el.className = cls;
      if (style) el.style.cssText = style;
      parent.append(el); return el;
    };
    const motif = (p, parent, cls = '') => {
      const img = doc.createElement('img'); img.src = 'skill-seals.svg#' + p.motif;
      img.alt = ''; img.className = 'skill-seal ' + cls; parent.append(img); return img;
    };
    function clear() {
      if (castPlan || layer.children.length) layer.replaceChildren();
      castPlan = null; castLeft = 0;
      arena.setAttribute('data-skill-phase', 'idle');
    }
    function buildAura(p) {
      aura.replaceChildren();
      aura.className = 'skill-aura ink-' + p.color + ' rank-' + p.rank + ' motif-' + p.motif;
      make('skill-halo', aura);
      for (let i = 0; i < p.rings; i++) make('skill-orbit orbit-' + i, aura);
      motif(p, aura, 'aura-seal');
      if (p.rank === 'mystic') make('skill-eclipse', aura);
      const n = p.rank === 'treasure' ? 3 : p.rings + 2;
      for (let i = 0; i < n; i++) make('aura-seed', aura, '--i:' + i + ';--angle:' + (360 * i / n) + 'deg;--delay:-' + (i * .7) + 's');
      if (p.rank === 'treasure') make('jade-heart', aura);
    }
    function sync(state) {
      if (state.key !== key) { clear(); key = state.key; }
      quiet = !!state.quiet; combat = !!state.combat;
      const p = state.plan;
      if (!p || !combat) {
        clear(); aura.hidden = true; ledger.hidden = true;
        arena.removeAttribute('data-skill-rank'); arena.removeAttribute('data-skill-motif'); return;
      }
      if (auraKey !== p.id) { buildAura(p); auraKey = p.id; }
      aura.hidden = false; ledger.hidden = false;
      ledger.className = 'skill-ledger ink-' + p.color;
      arena.setAttribute('data-skill-motif', p.motif);
      arena.setAttribute('data-skill-rank', p.rank);
      arena.setAttribute('data-skill-quiet', String(quiet));
      arena.setAttribute('data-skill-paused', String(!!state.paused));
      if (quiet && layer.children.length) layer.replaceChildren();
      const charging = p.signature && state.remaining <= p.windup;
      const stage = castPlan ? 'release' : charging ? 'charge' : 'idle';
      arena.setAttribute('data-skill-phase', stage);
      const shown = castPlan || p;
      name.textContent = shown.name;
      detail.textContent = shown.cue;
      status.textContent = state.paused ? '잠시 멈춤' : castPlan ? '발동 · ' + castPlan.outcome : charging ? '준비 ' + Math.max(0, state.remaining).toFixed(1) + '초' : p.remaining + '번째 공격에 발동';
      ledger.setAttribute('data-phase', stage);
      // The progress is driven by the combat clock, never by a second timer.
      aura.style.cssText = '--charge:' + (charging ? Math.max(0, Math.min(1, 1 - state.remaining / p.windup)) : 0);
    }
    function cast(p, outcome = '적중') {
      if (!p || !p.signature || !combat) return false;
      clear();
      // Even reduced-motion mode retains the short textual cast receipt.
      castPlan = { ...p, outcome }; castLeft = p.duration;
      arena.setAttribute('data-skill-phase', 'release');
      if (quiet) return true;
      const a = arena.getBoundingClientRect(), e = enemy.getBoundingClientRect(), h = hero.getBoundingClientRect();
      const aw = a.width || a.right - a.left || 720, ah = a.height || 420;
      const center = (r, fallback) => ({
        x: Number.isFinite(r.left) ? r.left - a.left + (r.width || r.right - r.left || aw * .3) / 2 : aw * fallback,
        y: Number.isFinite(r.top) ? r.top - a.top + (r.height || ah * .4) * .58 : ah * .6
      });
      const from = center(e, .72), to = center(h, .25);
      const burst = make('skill-cast ink-' + p.color + ' rank-' + p.rank + ' motif-' + p.motif + (outcome === '회피' ? ' is-dodged' : outcome === '방벽' ? ' is-guarded' : ''), layer);
      burst.style.cssText = '--from-x:' + from.x + 'px;--from-y:' + from.y + 'px;--to-x:' + to.x + 'px;--to-y:' + to.y + 'px;--dx:' + (to.x - from.x) + 'px;--dy:' + (to.y - from.y) + 'px;--duration:' + p.duration + 's;--path-width:' + Math.hypot(to.x - from.x, to.y - from.y) + 'px;--path-angle:' + Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI + 'deg';
      motif(p, burst, 'cast-seal');
      for (let i = 0; i < p.rings; i++) make('cast-ring', burst, '--i:' + i);
      const wisps = p.rank === 'treasure' ? 3 : p.rank === 'mystic' ? 5 : p.rank === 'elite-boss' ? 3 : 1;
      for (let i = 0; i < wisps; i++) {
        const arc = (i - (wisps - 1) / 2) * 40;
        make('skill-wisp', burst, '--i:' + i + ';--arc:' + arc + 'px');
      }
      make('skill-thread', burst);
      make('skill-impact', burst);
      for (let i = 0; i < p.motes; i++) {
        const angle = (i * 360 / p.motes) * Math.PI / 180;
        make('skill-petal', burst, '--i:' + i + ';--px:' + Math.round(Math.cos(angle) * (p.rank === 'mystic' ? 98 : 72)) + 'px;--py:' + Math.round(Math.sin(angle) * 58) + 'px;--turn:' + Math.round(angle * 180 / Math.PI) + 'deg');
      }
      if (p.rank === 'treasure') {
        make('fox-afterimage ghost-one', burst);
        make('fox-afterimage ghost-two', burst);
        make('fox-jade-bloom', burst);
      }
      if (p.rank === 'mystic') make('mystic-firmament', burst);
      return true;
    }
    function advance(dt) {
      if (!Number.isFinite(dt) || dt <= 0 || !castPlan) return;
      castLeft -= dt;
      if (castLeft <= 0) clear();
    }
    return { sync, cast, advance, clear, snapshot: () => ({ key, castLeft, casting: !!castPlan, nodes: layer.children[0]?.children.length || 0 }) };
  }
  globalThis.MosslightSkills = Object.freeze({ profile, plan, description, createRenderer });
})();
