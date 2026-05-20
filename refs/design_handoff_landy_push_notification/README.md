# Handoff: Landy 푸시 알림 가시성 개선 (V2 — Sequential Flow)

> **For the developer:** Read this README first. The HTML files in `reference/` are design references — interactive prototypes that show the intended look, motion, and timing of the notification system. Your job is to recreate the **푸시 알림 페이로드 + 클라이언트 렌더링**을 in Landy's existing mobile codebase (iOS / Android / React Native — whichever you ship), not to ship the HTML.

---

## 1. Overview

Landy(랜디)는 소규모 임대인용 월세 수납 관리 서비스입니다. **현재 문제:** Landy가 보내는 푸시 알림이 락스크린에서 빈 흰색 아이콘 + 회색 본문으로 표시되어 ○○뱅킹 등 은행 입금 알림 사이에 묻혀버립니다.

**해결 방향:**

1. **알림 자체의 시각적 위계 재설계** — 네이비 액센트 레일, 큰 제목, Pretendard tnum 카운트업 금액, 호실/임차인/이번 달 진행도를 한 줄에.
2. **시퀀셜 플로우** — 입금 인식 직후(약 0.6초 후) Landy 푸시를 발송하여, 락스크린에서 은행 알림 바로 아래에 Landy 알림이 자연스럽게 따라오도록 한다.

이 디자인은 **iOS 표준 푸시 알림 + Notification Service Extension** (또는 Android `NotificationCompat.BigTextStyle`)으로 충분히 구현 가능합니다. OS가 허용하지 않는 동작(타 앱 알림 수정, 알림 간 연결선 등)은 의도적으로 배제했습니다.

---

## 2. About the Design Files

`reference/` 폴더에는 3개의 HTML 프로토타입이 있습니다:

| 파일 | 용도 |
|---|---|
| `Landy V2 Flow.html` | **★ 메인 핸드오프 대상.** 뱅킹 알림 → Landy 알림 시퀀셜 플로우. |
| `Randy Notifications.html` | 초기 탐색 — 3가지 방향(Color Pop / Hierarchy Burst / Live Activity) 비교. V2(Hierarchy Burst)가 채택됨. |
| `app.jsx`, `notifications.jsx`, `lockscreen.jsx`, `landy-v2-flow.jsx` | 위 HTML의 React 컴포넌트 소스. 디자인 명세를 코드로 읽고 싶을 때 참고. |

브라우저에서 `Landy V2 Flow.html`을 열어 “플로우 재생” 버튼을 눌러보면 의도된 타이밍·모션을 정확히 확인할 수 있습니다.

---

## 3. Fidelity

**High-fidelity.** 색상·타이포·간격·모션 타이밍 모두 최종 사양입니다. 단, 다음은 Landy 디자인 시스템에 이미 토큰화된 값이라면 그쪽 정의를 우선합니다:

- 네이비 `#1E3A8A`
- OK green `#00875A`
- ink `#14213D`, ink-2 `#4B5874`, ink-3 `#8590A6`

---

## 4. Screens / Views

이 핸드오프의 “화면”은 락스크린에 도착하는 **푸시 알림 카드 1종** + **시퀀스 타이밍**입니다.

### 4.1 Landy V2 Notification (락스크린 카드)

**Purpose** — 은행 입금 알림 직후 도착해 “어느 호실 · 어떤 임차인 · 이번 달 진행도”를 한 화면에 전달.

**Layout (iOS 락스크린 알림 기준)**

- 카드 컨테이너: iOS 기본 알림 카드 형태 (rounded 18, 다크 블러 배경)
- 좌측에 **3px 네이비 액센트 레일** (top 14 / bottom 14 inset)
- 컨텐츠 패딩: `14px` (좌측 레일과 6px 추가 inset)
- 본문은 좌우 2열 — 좌측 38×38 로고, 우측 텍스트 컬럼

**Components**

| 요소 | 사양 |
|---|---|
| **컨테이너 배경** | `rgba(28,30,40,0.82)` + `backdrop-filter: blur(20px)` |
| **컨테이너 보더** | `inset 0 0 0 1px rgba(255,255,255,0.05)` |
| **컨테이너 그림자** | `0 14px 28px -14px rgba(20,38,77,0.55)` |
| **Border-radius** | `18px` |
| **액센트 레일** | width `3px`, height `auto` (top/bottom inset 14px), `linear-gradient(180deg, #4A6FD8, #1E3A8A)`, border-radius `0 3px 3px 0` |
| **앱 로고** | 38×38, border-radius `~10px`, 배경 `#1E3A8A`, 안쪽 마크는 3×3 호실 그리드 (아래 SVG 참조) |
| **앱 라벨** | `Landy · 방금` — 12px / 600 / `#9BB3F2` |
| **확장 화살표** | iOS 표준 caret (우측) — `rgba(255,255,255,0.55)` |
| **타이틀** | `5월분 월세가 들어왔어요` — 16px / 800 / letter-spacing -0.3 / `#fff`, margin-top 4 |
| **금액** | `700,000` — 26px / 800 / line-height 1 / `#fff` + tnum |
| **금액 단위** | `원` — 13px / 600 / opacity 0.7 |
| **상태 점** | 6×6 원, `#52D97F`, 글로우 `0 0 6px rgba(82,217,127,0.7)` |
| **메타 텍스트** | `102호 정수아 · 이번 달 4/5세대 완납` — 12px / opacity 0.82 |

**Landy 로고 SVG (38×38)**

```svg
<svg viewBox="0 0 200 200" width="24" height="24">
  <rect x="50" y="50" width="100" height="100" rx="8"
        fill="none" stroke="#fff" stroke-width="10"/>
  <circle cx="70"  cy="70"  r="6" fill="#fff" opacity="0.9"/>
  <circle cx="100" cy="70"  r="6" fill="#fff" opacity="0.9"/>
  <circle cx="130" cy="70"  r="6" fill="#fff" opacity="0.9"/>
  <circle cx="70"  cy="100" r="6" fill="#fff" opacity="0.9"/>
  <circle cx="100" cy="100" r="9" fill="#fff"/>
  <circle cx="130" cy="100" r="6" fill="#fff" opacity="0.9"/>
  <circle cx="100" cy="130" r="6" fill="#fff" opacity="0.9"/>
  <circle cx="130" cy="130" r="6" fill="#fff" opacity="0.9"/>
</svg>
```

> 정적 알림 아이콘(앱 아이콘)으로 사용할 때는 위 마크를 네이비 배경에 화이트 stroke로 래스터화한 1024×1024 PNG가 필요합니다. **현재 빈 흰 박스로 보이는 문제는 앱 아이콘 자산이 누락 또는 잘못 등록된 데서 비롯됩니다 — 가장 먼저 수정하세요.**

---

## 5. Interactions & Behavior

### 5.1 도착 모션 (Landy 알림 단일 카드)

알림 카드가 락스크린에 mount되면 다음 순서로 내부 요소가 스태거 진입합니다.

| Element | Delay | Duration | Easing | Effect |
|---|---|---|---|---|
| 카드 컨테이너 | 0ms | 500ms | `cubic-bezier(.2,.9,.25,1.1)` | `translateY(-10px) → 0`, `opacity 0 → 1` |
| 액센트 레일 | 100ms | 500ms | `cubic-bezier(.2,.9,.25,1.1)` | `scaleY(0) → 1` (origin top), opacity 0 → 1 |
| 로고 | 50ms | 500ms | `cubic-bezier(.2,.9,.3,1.2)` | `scale(0.5) → 1.1 → 1`, opacity 0 → 1 |
| 타이틀 | 120ms | 450ms | `cubic-bezier(.2,.9,.25,1)` | `translateX(-6px) → 0`, opacity 0 → 1 |
| 금액 (카운트업) | 220ms | 700ms | easeOutExpo (`1 - 2^(-10t)`) | `0 → 700,000` 정수 카운트, tnum |
| 메타 라인 | 420ms | 450ms | ease | `translateX(-6px) → 0`, opacity 0 → 1 |

> **iOS 구현 노트:** iOS 푸시 알림 카드는 시스템 UI 안에서 표시되므로 위 모션은 **알림이 펼쳐졌을 때(notification content extension)** 또는 **앱 내 인박스 화면**에서만 그대로 재현 가능. 일반 헤드업 알림에는 시스템 기본 슬라이드 인이 사용됩니다 — 그것으로 충분합니다.

### 5.2 시퀀셜 플로우 (★ 핵심)

```
t = 0.0s  : 사용자에게 입금 발생 (은행이 푸시 발송)
t ≈ 0.0s  : 은행 푸시 → 사용자 락스크린에 도착
t ≈ 0.6s  : Landy 푸시 → 사용자 락스크린에 도착
```

**0.6초 간격**이 핵심입니다. 너무 빠르면 두 알림이 한 덩어리로 묶여 보이고, 너무 느리면 사용자가 은행 알림만 보고 폰을 내려놓아 Landy 알림을 놓칩니다.

**구현 방법:**

1. Landy 백엔드가 입금을 인식하는 경로 (오픈뱅킹 webhook / 카카오톡·SMS 알림 파싱)
2. 인식 즉시 Landy 푸시 페이로드 생성 → APNs / FCM 발송
3. 추가 인위적 지연 불필요. 은행 푸시 발송과 Landy 백엔드 인식 사이의 자연 지연(보통 0.3~1.5s)이 대체로 0.6초 부근에 떨어집니다.
4. 만약 인식이 너무 빨라(< 0.3s) 거의 동시에 도착한다면, 푸시 발송 전에 `300~500ms` 인위 지연을 두는 것을 검토.

---

## 6. State Management

알림 카드는 **순수 표시 컴포넌트**이며 자체 state가 없습니다. 페이로드를 받아 렌더링만 합니다.

**서버 → 클라이언트 푸시 페이로드 (제안)**

```json
{
  "aps": {
    "alert": {
      "title": "5월분 월세가 들어왔어요",
      "body": "102호 정수아 · 이번 달 4/5세대 완납"
    },
    "mutable-content": 1,
    "sound": "default"
  },
  "landy": {
    "kind": "deposit_received",
    "amount": 700000,
    "unit_label": "102호",
    "tenant_name": "정수아",
    "month_label": "5월분",
    "progress_paid": 4,
    "progress_total": 5,
    "deposit_id": "dep_2026_05_17_001"
  }
}
```

iOS Notification Service Extension에서 `landy.*` 데이터를 읽어 알림 본문을 가공하고, 필요 시 Notification Content Extension으로 위 디자인의 확장형 카드를 렌더합니다.

**Android (FCM)** — 동일한 `landy` 페이로드를 `data` 메시지로 받아 `NotificationCompat.Builder`로 빌드:

```kotlin
NotificationCompat.Builder(ctx, CHANNEL_ID)
  .setSmallIcon(R.drawable.ic_landy_mark)
  .setColor(0xFF1E3A8A.toInt())
  .setContentTitle("5월분 월세가 들어왔어요")
  .setContentText("102호 정수아 · 이번 달 4/5세대 완납")
  .setStyle(NotificationCompat.BigTextStyle()
    .bigText("700,000원\n102호 정수아 · 이번 달 4/5세대 완납"))
  .setColorized(true)
  .build()
```

---

## 7. Design Tokens

### Colors

| Token | Value | Usage |
|---|---|---|
| `--brand` | `#1E3A8A` | 메인 네이비 (로고 배경, 액센트 레일 종점) |
| `--brand-strong` | `#14264D` | 네이비 그라디언트 다크 종점 |
| `--brand-light` | `#4A6FD8` | 액센트 레일 시작점 |
| `--brand-on-dark` | `#9BB3F2` | 다크 배경 위 브랜드 라벨 텍스트 |
| `--brand-soft` | `#E8EDFB` | 밝은 배경 위 브랜드 칩 |
| `--ok` | `#00875A` | 완납 상태 |
| `--ok-strong` | `#52D97F` | 상태 점 (다크 위 글로우 포함) |
| `--ok-glow` | `rgba(82,217,127,0.7)` | 상태 점 글로우 |
| `--ink` | `#14213D` | 본문 텍스트 (라이트 모드) |
| `--ink-2` | `#4B5874` | 보조 텍스트 |
| `--ink-3` | `#8590A6` | 캡션·라벨 |
| `--notification-bg` | `rgba(28,30,40,0.82)` | iOS 다크 알림 카드 배경 |
| `--notification-border` | `rgba(255,255,255,0.05)` | iOS 다크 알림 inset border |

### Typography

- **Font family:** Pretendard (없으면 `-apple-system`, `BlinkMacSystemFont`, `Apple SD Gothic Neo`)
- **Numeric:** `font-feature-settings: "tnum"` — 금액 표기에 필수
- **Weights:** 500 / 600 / 700 / 800

| Style | Size / Weight / Line-height |
|---|---|
| App label | 12 / 600 / 1.3 |
| Title | 16 / 800 / 1.2 / `letter-spacing: -0.3` |
| Amount | 26 / 800 / 1.0 / tnum |
| Amount unit (원) | 13 / 600 |
| Meta | 12 / 500 / 1.4 |

### Spacing & Radius

- 카드 padding: `14px`
- 좌측 내부 inset (액센트 레일용): 추가 `6px`
- 로고와 텍스트 컬럼 간격: `11px`
- 카드 border-radius: `18px`
- 로고 border-radius: `10px` (= size × 0.26)
- 상태 점: `6 × 6`, fully round

### Shadow

- Card: `inset 0 0 0 1px rgba(255,255,255,0.05), 0 14px 28px -14px rgba(20,38,77,0.55)`

### Motion

- 진입 easing: `cubic-bezier(.2, .9, .25, 1.1)` (전체 카드, 레일, 타이틀)
- 팝 easing: `cubic-bezier(.2, .9, .3, 1.2)` (로고)
- 카운트업: easeOutExpo, 700ms

---

## 8. Edge Cases & Future States

이번 핸드오프는 **`deposit_received` (월세 입금 확인)** 1종만 다룹니다. 다음 상태는 같은 디자인 시스템에서 액센트 컬러만 바꿔 확장하면 됩니다 (별도 디자인 핸드오프로 후속):

| 종류 | 액센트 컬러 | 톤 |
|---|---|---|
| `deposit_due_soon` (D-3 입금 예정) | `#D9770A` (warn) | 정보 |
| `deposit_overdue` (연체) | `#DC2626` (danger) | 경고, 차분한 모션 |
| `deposit_grouped` (같은 날 다건 입금) | `#1E3A8A` (brand) | 요약 카드 |

---

## 9. Assets

이 핸드오프에는 별도 이미지 자산이 없습니다. 다음 자산은 개발 시 준비 필요:

- **앱 아이콘 (Landy 마크)** — 1024×1024 PNG (iOS), Android adaptive icon (foreground/background). 위 SVG를 네이비 배경에 화이트 stroke로 래스터화. **현재 푸시 알림에서 빈 박스로 보이는 문제의 직접 원인이므로 우선순위 최상.**
- **Notification small icon (Android)** — 단색 마스크 PNG, 24×24 dp

---

## 10. Files

```
design_handoff_landy_push_notification/
├── README.md                              ← 이 문서
└── reference/
    ├── Landy V2 Flow.html                 ← ★ 메인 디자인: 시퀀셜 플로우 프로토타입
    ├── Randy Notifications.html           ← 초기 3개 방향 비교 (Color Pop / Hierarchy Burst / Live Activity)
    ├── landy-v2-flow.jsx                  ← Flow 프로토타입 컴포넌트 (사양을 코드로 읽을 때 참조)
    ├── notifications.jsx                  ← 3개 방향의 알림 컴포넌트 소스
    ├── lockscreen.jsx                     ← iOS 락스크린 목업 (상태바/시계/노치)
    └── app.jsx                            ← 비교 페이지 컴포넌트
```

브라우저로 `Landy V2 Flow.html`을 열고 “플로우 재생” 버튼을 눌러 의도된 타이밍을 정확히 확인하세요. 속도 슬라이더(0.5×/1×/2×)로 모션을 자세히 분석할 수 있습니다.

---

## 11. Checklist for Implementation

- [ ] **앱 아이콘 자산 등록 확인** — 푸시 알림에서 빈 박스로 보이는 현재 문제 해결 (최우선)
- [ ] iOS Notification Service Extension에서 `landy.*` 페이로드 파싱
- [ ] 알림 제목/본문 포맷팅 (`{month_label} 월세가 들어왔어요` / `{unit_label} {tenant_name} · 이번 달 {progress_paid}/{progress_total}세대 완납`)
- [ ] (선택) Notification Content Extension으로 확장형 카드 구현 (액센트 레일 + 큰 금액 + 카운트업)
- [ ] Android `NotificationCompat.BigTextStyle` + `setColor(#1E3A8A)` + `setColorized(true)`
- [ ] 백엔드: 입금 인식 후 푸시 발송 (은행 푸시와 약 0.6초 간격을 자연스럽게 형성하는지 모니터링)
- [ ] Pretendard 폰트 번들 (앱 내 인박스 화면용)
- [ ] 알림 클릭 시 → Landy 앱 내 해당 호실 상세 화면으로 deep link

질문 있으면 디자인 측에 회신 주세요.
