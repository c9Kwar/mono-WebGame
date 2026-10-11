# Living Forest — asset production

Mode: built-in image generation, with existing project art as references. Sprite alpha was preserved; originals retained. These files are integrated into the battle scene.

| Asset | Final project path | Prompt / art brief |
|---|---|---|
| Golden fox | `/workspace/sites/mosslight/dist/treasure-fox-sprite.png` | Extract only the full golden multi-tailed fox from treasure.png, preserving premium pixel art, golden fur, cream tails, crown and gem ornaments. Face left, transparent margin. Remove knight, landscape, ground and free-floating effects. Genuine transparent alpha. |
| Empty clearing | `/workspace/sites/mosslight/dist/battle-clearing.png` | Remove knight, fox, gems, chest and treasure piles from treasure.png. Preserve pixel-art forest, waterfalls, ruins and teal depth. Leave an open grassy clearing for composited combatants. No text or creatures. |
| Knight | `/workspace/sites/mosslight/dist/knight-sprite.png` | Extract only the adorable full-body knight from cute-boss.png. Preserve silver helmet, yellow scarf, blue shield, sword pointing up-right and cute proportions. Face right, transparent margin, no scenery or ground. |
| Crown turtle | `/workspace/sites/mosslight/dist/moss-turtle-sprite.png` | Extract only the adorable crowned moss turtle from cute-boss.png. Preserve gold crown, sprout, mossy shell, smiling face and short legs. Face left, full body, centered transparent margin, no scenery or knight. |
| Forest golem | `/workspace/sites/mosslight/dist/forest-golem-sprite.png` | Adapt the mossy stone golem from boss.png into a chapter-one compact forest guardian: squat rounded limbs, leaves, amber eyes, friendly determined expression. Premium pixel art in teal green, warm stone and gold fissures. Full body facing left, genuine transparent background. |

Animation is implemented in CSS/JavaScript: independent actor transforms, hit choreography, tier auras, rotating sigils, gem orbit, ambient particles, entrance and victory sequences. No generated text is used in the UI. Reduced-motion and lightweight settings are supported.


# Forest Collection expansion — 2026-10-11

Mode: built-in image generation, transparent backgrounds. Generated art was visually inspected. Original PNGs are preserved in `/workspace/sites/mosslight/art-source/`. Runtime WebP assets retain alpha; icons are resized to at most 256 px and actors to 800 px. No CLI image generation was used.

## Runtime asset paths
- `/workspace/sites/mosslight/dist/icon-amber.webp`
- `/workspace/sites/mosslight/dist/icon-blueprint.webp`
- `/workspace/sites/mosslight/dist/icon-boots.webp`
- `/workspace/sites/mosslight/dist/icon-chest.webp`
- `/workspace/sites/mosslight/dist/icon-crownring.webp`
- `/workspace/sites/mosslight/dist/icon-crystal.webp`
- `/workspace/sites/mosslight/dist/icon-gem.webp`
- `/workspace/sites/mosslight/dist/icon-legs.webp`
- `/workspace/sites/mosslight/dist/icon-medal.webp`
- `/workspace/sites/mosslight/dist/icon-ring.webp`
- `/workspace/sites/mosslight/dist/icon-royalblade.webp`
- `/workspace/sites/mosslight/dist/icon-seed.webp`
- `/workspace/sites/mosslight/dist/icon-weapon.webp`
- `/workspace/sites/mosslight/dist/snail-sprite.webp`
- `/workspace/sites/mosslight/dist/rabbit-sprite.webp`
- `/workspace/sites/mosslight/dist/owl-sprite.webp`
- `/workspace/sites/mosslight/dist/hedgehog-sprite.webp`

## Initial art prompts / art direction

All were single isolated full objects, transparent background, no text/UI/frame, crisp silhouette, pixel-inspired hand-painted Korean fantasy RPG art.

- Weapon: teal crystal forest sword, antique gold leaf guard and tiny runes.
- Ring: gold fox tail ring holding an emerald jade orb, violet celestial sparkles.
- Chest: gold and moss-green guardian breastplate, teal heart gem, leaf motifs.
- Legs: silver-violet guardian leggings, moonstone glow and gold leaf trim.
- Boots: dark green leather wind boots, golden wing cuffs and turquoise wisps.
- Jade: emerald orb enclosing a tiny golden fox spirit with a filigree base.
- Snail: cute mint snail, amber spiral shell, dew-covered leaf hat, facing left.
- Rabbit: cream forest rabbit, green sprout ears and leaf scarf, facing left.
- Owl: round midnight-blue owl boss, crescent crown, silver leaf cape, teal eyes and wisps, facing left.
- Hedgehog: chestnut hedgehog boss, golden acorn crown, autumn leaf spikes and little wooden mallet, facing left.

## Item-specific final prompts

### royalblade

Single mythical primordial guardian sword, an elegant silver-white blade containing a violet aurora, crescent gold guard and tiny luminous forest leaves, distinct legendary weapon loot icon for a Korean idle RPG. Beautiful hand-painted fantasy art, very crisp silhouette readable at 48px, diagonal centered on square transparent canvas with margin. No text, UI, border or other items.

### crownring

Single mythical ancient signet ring, antique gold circlet topped by a tiny three-point crown and a luminous ruby-violet gemstone, elegant forest leaf engravings. Premium hand-painted fantasy inventory icon, crisp readable at 48px, centered square transparent canvas with margin. No fox, no text, no UI, no frame.

### seed

Single mythical primordial seed, a radiant pale green sprouting seed inside a clear teardrop crystal with delicate golden roots and tiny cyan fireflies. Premium hand-painted fantasy RPG inventory icon, distinct organic silhouette readable at 48px, centered on square transparent canvas with margin. No text, no UI, no border.

### amber

Single legendary amber gemstone enclosing a tiny curled golden fox silhouette, irregular faceted warm honey amber with soft inner light, premium hand-painted fantasy RPG inventory icon, crisp and readable at 48px, centered on square transparent canvas with margin. No pedestal, no text, no UI, no frame.

### blueprint

Single legendary forest crafting blueprint scroll, curled ivory parchment with an elegant teal magical sword drawing and gold corner ornaments, no letters or writing, premium hand-painted fantasy RPG inventory icon, crisp silhouette readable at 48px, centered on square transparent canvas with margin. No text, no UI, no frame.

### crystal

Single legendary enhancement stone, angular lavender crystal cluster wrapped in a small gold leaf band, subtle inner teal light, premium hand-painted fantasy RPG inventory icon, very crisp readable at 48px, centered on square transparent canvas with margin. No text, no UI, no frame.

### medal

Single legendary forest scout medal, antique gold eight-point leaf star with an emerald center hanging from a short dark green ribbon, premium hand-painted fantasy RPG inventory icon, very crisp readable at 48px, centered on square transparent canvas with margin. No text, no UI, no frame.

## 2026-10-11 · 머리 위 내려치기와 조우별 스킬

기존 WebP 원본을 유지하고 브라우저의 SVG 클리핑으로 기사 몸통·투구·팔·검을 나누었다. 어깨와 손목을 따로 회전해 검을 투구 위로 들어 잠시 멈춘 뒤 아래로 내려치고 복귀한다. 공격 속도에 맞춰 동작 길이를 줄이고, 검이 내려오는 시점에 타격 효과를 연결한다.

슬라임·버섯·나방은 기존 배경 일러스트의 적 실루엣을 SVG로 잘라 공통 숲 배경에 배치한다. 일반·엘리트 조우에서도 움직이는 기사와 적을 독립적으로 표시하며 기존 파일을 다시 생성하거나 덮어쓰지 않는다.

보스는 왕관 파동·돌뿌리·녹색 돌진·달빛 깃털·도토리 낙하로, 엘리트는 이끼·포자·날개·나선껍질·도약으로 구분한다. 황금 보물여우는 등장·공격·승리에 금빛 동전과 옥빛 잔광을 사용한다. 이 효과들은 CSS 도형과 고정된 입자 경로이며 새 원화나 생성 이미지가 아니다.
