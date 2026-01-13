# 개발내역

## 목표
- Three.js로 레트로웨이브 “비행” 장면(카메라를 향해 다가오는 네온 그리드 지형)
- Perlin Noise로 지형의 높낮이가 시간에 따라 춤추듯 변화
- 배경에 거대한 레트로 태양(붉은빛/노을 톤) + 천천히 하강(“지는” 느낌)
- 단일 HTML 파일로 실행

## 구현 파일
- `retro-wave-flight/index.html`
- `retro-wave-flight/PROMPT.md`

## 구현 요약
- Three.js 모듈(CDN)로 렌더링
- 퍼린 노이즈(외부 의존 없이 JS로 구현)로 지형의 y 변위를 계산
- PlaneGeometry의 vertex를 매 프레임 갱신:
  - `height(x,z,t) = perlin(x*freq + t, z*freq + travel, t*speed) * amp`
  - travel 오프셋으로 “지형이 카메라로 다가오는” 느낌
- 보라색 네온 그리드:
  - `MeshBasicMaterial` wireframe + additive 느낌(투명/밝기)
  - 얕은 안개(FogExp2)로 원근감
- 레트로 태양:
  - CanvasTexture로 강한 붉은/주황 그라데이션 + 스트라이프(80s 태양) 생성
  - 별도 Glow Plane으로 붉은빛 확산
  - y 위치를 계속 낮추며 “지는” 연출 + 맥동하는 발광
- 인터랙션:
  - 마우스 위치에 따라 카메라 yaw/pitch를 미세하게 조정(비행 감각)

## 실행 방법
- 로컬 서버 권장(Three.js 모듈 로드):
  - `python3 -m http.server --directory retro-wave-flight 8000`
  - `http://localhost:8000`

## 조작
- 마우스 이동: 카메라 시점이 미세하게 흔들리며 비행 느낌 강화
- `Space` 또는 “리셋”: 시간/이동 오프셋 초기화
