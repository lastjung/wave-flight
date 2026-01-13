# 스팀펑크 비행 시뮬레이터 구현 계획

사용자가 선택한 **5번 스팀펑크 비행정(Steampunk Airship)** 테마를 기반으로, 기존 배경 코드를 모듈화하고 비행 시스템을 추가합니다.

## 1. 주요 설계 목표

- **기술 스택**: **Vanilla JS**와 **ES Modules**를 기반으로 하며, UI 스타일링을 위해 **Tailwind CSS (via CDN)**를 도입합니다.
- **3D 엔진**: **Three.js**를 사용하여 3D 월드와 기체를 구현합니다.
- **플랫폼 지원**: PC(키보드)와 **모바일(터치 조작)**을 모두 지원하는 반응형 설계를 적용합니다.
- **파일 분리**: 논리적 파일 분리를 통해 배경과 플레이어 로직의 결합도를 낮춥니다.
- **스팀펑크 미학**: 황동, 구리, 증기 효과가 강조된 독특한 비주얼을 구현합니다.

## 2. 시스템 구성 및 아키텍처

비행 시뮬레이터의 확장성과 유지보수성을 위해 다음과 같은 **객체 지향형 아키텍처**를 제안합니다.

### 시스템 계층 구조

- **Game (main.js)**: 전체 엔진 조율 및 루프 관리.
- **Environment (Environment.js)**: 지형(Perlin Noise), 하늘, 광원 및 스팀펑크 효과 담당.
- **Player (Player.js)**: 비행선 모델링, 물리 시뮬레이션 및 지형 반응 로직.
- **CameraSystem (CameraSystem.js)**: 3인칭 추적 카메라 (뒤쪽 15도 상단).
- **Input (Input.js)**: 키보드 및 터치 입력 상태 관리.

### 클래스별 상세 역할

1.  **Game (Orchestrator)**:
    - Three.js의 `Scene`, `Renderer`, `Camera` 초기화.
    - 서브 시스템 생성 및 매 프레임 `update()` 호출.
2.  **Environment (The World)**:
    - **지형 엔진**: Perlin Noise 기반 파도 지형 생성.
    - **스팀펑크 스타일**: 구리/황동 와이어프레임, 증기 안개, 거대한 저녁 노을.
    - **API**: 특정 (x, z) 좌표의 지형 높이(y) 반환 기능 제공.
3.  **Player (The Steampunk Airship)**:
    - **모델링**: 기본 매쉬 조합을 통한 Zeppelin 형태 구현.
    - **제어**: 입력 상태에 따른 이동 및 Pitch, Roll 시뮬레이션. Terrain 높이에 맞춰 부드럽게 고도 조절.
4.  **CameraSystem (The View)**:
    - **Chase Camera**: 비행기를 부드럽게 추적 (Damping 적용).
    - **Shake Effect**: 충돌 시 흔들림 효과 (Drift 방지 로직 적용).
5.  **Input (Controller)**:
    - WASD 입력 및 모바일 터치 드래그 기반 조종 지원.

## 3. 파일 구조

```text
/
├── index.html          # 진입점
├── js/
│   ├── main.js         # Game 클래스
│   ├── Environment.js  # Environment 클래스
│   ├── Player.js       # Player 클래스
│   ├── CameraSystem.js # CameraSystem 클래스
│   ├── Input.js        # Input 클래스
│   ├── ObstacleManager.js # 장애물 관리 클래스
│   ├── crafts/
│   │   ├── SpaceFighter.js   # 기존 파이터 기체
│   │   ├── SteampunkPlane.js # 스팀펑크 기체
│   │   └── Obstacle.js       # [NEW] 독립된 장애물 모델
│   └── Utils.js        # 유틸리티 (Perlin Noise 등)
└── docs/
    ├── game_prompt.md  # 컨셉 문서
    ├── physics_spec.md # 물리 명세서
    └── implementation_plan.md # 구현 계획서 (이 파일)
```

## 4. 검증 계획

- [x] PC/모바일 조작 반응성 확인.
- [x] 지형 고도에 따른 기체 움직임 자연스러움 확인.
- [x] 스팀펑크 시각 효과 및 Tailwind UI 정상 작동 확인.
- [x] 장애물 생성 및 충돌 처리.
- [ ] 카메라 쉐이크 정상 작동 확인 (충돌 시).
