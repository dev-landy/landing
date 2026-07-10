// Amplitude Browser SDK 2.0 — 방문 → Google Play 클릭 퍼널 추적.
// 클라이언트 공개 키(GA measurement ID와 동일 성격)라 하드코딩이 표준.
(function () {
  "use strict";

  var AMPLITUDE_API_KEY = "19445bfc8856391e9e23cfa3d76f7c60";
  var SDK_URL =
    "https://cdn.jsdelivr.net/npm/@amplitude/analytics-browser@2/lib/scripts/amplitude-min.js";

  // SDK가 async로 로드되기 전에 trackAmplitude()가 호출돼도 유실되지 않도록 큐잉.
  var queue = [];
  var isReady = false;

  window.trackAmplitude = function (eventName, eventProperties) {
    if (isReady && window.amplitude) {
      window.amplitude.track(eventName, eventProperties || {});
    } else {
      queue.push([eventName, eventProperties || {}]);
    }
  };

  function initAmplitude() {
    if (!window.amplitude || typeof window.amplitude.init !== "function") return;

    window.amplitude.init(AMPLITUDE_API_KEY, {
      // 세션/utm 자동 수집 + 모든 이벤트에 페이지 속성(Page Location 등) enrichment.
      // 단, autocapture 페이지뷰 "이벤트"는 원격 설정에 좌우되므로 아래에서 명시적으로 발생시킴.
      autocapture: {
        pageViews: true,
        sessions: true,
        attribution: true,
        formInteractions: false,
        fileDownloads: false,
        elementInteractions: false,
      },
      // serverZone: "EU", // 데이터 레지던시가 EU면 주석 해제.
    });

    // 퍼널 시작점: 방문 이벤트를 결정적으로 기록 (autocapture 설정과 무관하게 항상 발생).
    window.amplitude.track("page_view");

    isReady = true;
    for (var i = 0; i < queue.length; i++) {
      window.amplitude.track(queue[i][0], queue[i][1]);
    }
    queue = [];
  }

  var script = document.createElement("script");
  script.src = SDK_URL;
  script.async = true;
  script.onload = initAmplitude;
  script.onerror = function () {
    // SDK 로드 실패 시 조용히 no-op — 사이트 동작에는 영향 없음.
    window.trackAmplitude = function () {};
  };
  document.head.appendChild(script);
})();
