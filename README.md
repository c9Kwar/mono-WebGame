# 모스라이트 · Mosslight

숲을 탐험하며 장비와 패시브를 수집하는 방치형 RPG.

- 게임: https://mosslight-idle.snappyowlet.chatgpt.site
- 저장소: https://github.com/c9Kwar/mono-WebGame

## 구조

- `dist/`: 빌드 없이 실행하는 HTML, CSS, JavaScript, 기존 WebP 및 새 유화 PNG 원화
- `tests/`: 로직·자산·확률·밸런스 검증
- `art-notes.md`: 이미지 제작 기록(기록에 나오는 PNG 원본은 기존 Sites 프로젝트에 보존, 이 저장소에는 실행용 WebP 포함)
- `release-notes.md`: 업데이트 및 검증 기록

## 실행

저장소 루트에서 `python3 -m http.server 8000 --directory dist`를 실행하고 http://localhost:8000 에 접속합니다. 진행 상황은 접속 주소별 브라우저 localStorage에 저장됩니다.

## 검증

Node.js 22 이상과 Python 3을 사용합니다. 의존성 없는 로직·자산 검사는 `npm test`로 모두 실행합니다.

```sh
npm test
python3 -m venv .venv
.venv/bin/pip install -r tests/requirements-browser.txt
.venv/bin/python -m playwright install chromium
npm start
# 별도 터미널에서:
.venv/bin/python tests/browser-smoke.py
.venv/bin/python tests/browser-preparation.py
.venv/bin/python tests/browser-effects.py
.venv/bin/python tests/browser-contact-feedback.py
.venv/bin/python tests/browser-skills.py
.venv/bin/python tests/browser-art.py
```

브라우저 테스트는 기본적으로 8082 포트 서버를 사용합니다. `GAME_URL`로 주소, `CHROMIUM_PATH`로 실행 파일을 지정할 수 있습니다. GitHub Actions에도 동일한 검사를 구성했습니다.

## 이번 개선

저장 파일 내보내기·확인 후 가져오기·교체 전 백업, 탭 충돌 감지, 장비 잠금, 일반 보스 선택, 설계도 미획득 60회 보장, 연속 사망 시 선택적 반복 사냥, 제작 목표의 부족 재료와 수급처를 추가했습니다. 기존 저장 키와 기본 전투·드롭 확률은 유지합니다.

- [게임과 아트의 개발 방향](docs/game-direction.md)
- [이끼빛 표본화: 독창적인 유화·레트로 아트 방향](docs/art-direction-oil.md)
- [전체 분석과 28개 개선 과제](docs/improvement-plan.md)
- [확률·경제 분석](docs/balance-review.md)
- [실행한 테스트와 제한](docs/validation-report.md)
- [전투 접촉 피드백: 명중·방어·회피와 접근성](docs/combat-contact-feedback.md)


## 배포

현재 게임은 Sites에서 운영합니다. GitHub 커밋만으로 자동 배포되지는 않습니다. 기존 사이트의 접근 설정과 저장 데이터는 이번 저장소 이전으로 변경되지 않습니다.

초기 가져오기 기준: Sites 소스 커밋 `6ebdbed2a0dd5663aea70715dca61a5ce2ca2dda`.
