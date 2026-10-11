# 모스라이트 · Mosslight

숲을 탐험하며 장비와 패시브를 수집하는 방치형 RPG입니다.

- 게임: https://mosslight-idle.snappyowlet.chatgpt.site
- 소스 저장소: https://github.com/c9Kwar/mono-WebGame

## 구조

- `dist/`: 별도 빌드 없이 실행하는 HTML, CSS, JavaScript와 게임 이미지
- `art-source/`: 신규 이미지 원본
- `tests/`: Node.js 기반 로직·자산·확률·밸런스 검증
- `art-notes.md`: 이미지 제작 기록
- `release-notes.md`: 업데이트 및 검증 기록

## 실행

저장소 루트에서 `python3 -m http.server 8000 --directory dist`를 실행한 뒤 http://localhost:8000 에 접속합니다. 진행 상황은 접속 주소별 브라우저 localStorage에 저장됩니다.

## 검증

Node.js 22 이상에서 다음을 실행합니다.

```sh
node --check dist/game.js
node tests/content-update.cjs
node tests/assets-ui.cjs
node tests/images.cjs
node tests/balance-simulation.cjs
node tests/passive-budget.cjs
```

테스트는 실제 브라우저 시각 검증을 대신하지 않습니다.

## 배포

현재 게임은 Sites에서 운영합니다. GitHub 커밋만으로 자동 배포되지는 않습니다. 기존 사이트의 접근 설정과 저장 데이터는 이번 저장소 이전으로 변경되지 않습니다.

초기 가져오기 기준: Sites 소스 커밋 `6ebdbed2a0dd5663aea70715dca61a5ce2ca2dda`.
