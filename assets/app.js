const form = document.getElementById("signupForm");
const phoneInput = document.getElementById("phoneInput");
const submitButton = document.getElementById("submitButton");
const submitButtonLabel = submitButton.querySelector("[data-submit-label]");
const formMessage = document.getElementById("formMessage");
const floatingBetaCta = document.querySelector(".floating-beta-cta");
const firstContentSection = document.querySelector(".hero + .section");
const betaSection = document.getElementById("beta");
const defaultMessage = formMessage.textContent;
const signupSource = form.dataset.source || "rent";
let phoneInputStarted = false;
let phoneFormViewed = false;
let pendingPhoneFormEntryPoint = "scroll";
const notificationFlows = document.querySelectorAll("[data-notification-flow]");

function sendAnalyticsEvent(eventName, params = {}) {
  if (typeof gtag !== "function") return;
  gtag("event", eventName, params);
}

function sendPhoneFormView(entryPoint = "scroll") {
  if (phoneFormViewed) return;
  phoneFormViewed = true;
  sendAnalyticsEvent("beta_phone_form_view", {
    entry_point: entryPoint,
    source: signupSource,
  });
}

function setFormMessage(type, message) {
  formMessage.className = "form-message";
  if (type) formMessage.classList.add(type);
  formMessage.textContent = message;
}

function setSubmitButtonText(message) {
  if (submitButtonLabel) {
    submitButtonLabel.textContent = message;
  } else {
    submitButton.textContent = message;
  }
}

function startNotificationFlow(flow) {
  if (flow.dataset.flowStarted === "true") return;
  flow.dataset.flowStarted = "true";

  const amountEl = flow.querySelector("[data-countup]");
  if (!amountEl) return;

  const target = Number(amountEl.dataset.countup || 0);
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let countFrame = 0;
  let countTimer = 0;
  let replayTimer = 0;

  function setAmount(value) {
    amountEl.textContent = Math.round(value).toLocaleString("ko-KR");
  }

  function animateAmount() {
    cancelAnimationFrame(countFrame);
    const startedAt = performance.now();
    const duration = 700;

    function tick(now) {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setAmount(target * eased);
      if (progress < 1) countFrame = requestAnimationFrame(tick);
    }

    countFrame = requestAnimationFrame(tick);
  }

  function replay() {
    clearTimeout(countTimer);
    clearTimeout(replayTimer);
    cancelAnimationFrame(countFrame);
    setAmount(reduceMotion ? target : 0);
    flow.classList.remove("flow-running");
    void flow.offsetWidth;
    flow.classList.add("flow-running");

    if (!reduceMotion) {
      countTimer = setTimeout(animateAmount, 1000);
      replayTimer = setTimeout(replay, 3700);
    }
  }

  replay();
}

function setupNotificationFlowStart(flow) {
  const amountEl = flow.querySelector("[data-countup]");
  if (amountEl) amountEl.textContent = "0";

  if (!("IntersectionObserver" in window)) {
    startNotificationFlow(flow);
    return;
  }

  const flowObserver = new IntersectionObserver(
    (entries, observer) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      startNotificationFlow(flow);
      observer.disconnect();
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.28,
    },
  );

  flowObserver.observe(flow);
}

notificationFlows.forEach(setupNotificationFlowStart);

document.querySelectorAll('a[href="#beta"]').forEach((link) => {
  link.addEventListener("click", () => {
    const buttonLocation = link.dataset.betaLocation || "unknown";
    pendingPhoneFormEntryPoint = buttonLocation;
    sendAnalyticsEvent("beta_apply_click", {
      button_location: buttonLocation,
      source: signupSource,
    });
  });
});

function updateFloatingCta() {
  if (!floatingBetaCta || !firstContentSection || !betaSection) return;
  const showCta =
    firstContentSection.getBoundingClientRect().top <=
      window.innerHeight - 80 &&
    betaSection.getBoundingClientRect().top > window.innerHeight - 120;
  floatingBetaCta.classList.toggle("is-visible", showCta);
}
updateFloatingCta();
window.addEventListener("scroll", updateFloatingCta, { passive: true });
window.addEventListener("resize", updateFloatingCta);

if ("IntersectionObserver" in window) {
  const betaObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        sendPhoneFormView(pendingPhoneFormEntryPoint);
        betaObserver.disconnect();
      }
    },
    { threshold: 0.35 },
  );
  betaObserver.observe(form);
} else {
  sendPhoneFormView("fallback");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const phone = phoneInput.value.trim();

  if (!phoneInput.validity.valid) {
    sendAnalyticsEvent("beta_apply_fail", {
      reason: "validation_error",
      source: signupSource,
    });
    setFormMessage("error", "올바른 전화번호를 입력해주세요.");
    phoneInput.focus();
    return;
  }

  submitButton.disabled = true;
  setSubmitButtonText("신청 중");
  setFormMessage("", "신청 정보를 전송하고 있습니다.");
  sendAnalyticsEvent("beta_apply_submit", {
    method: "phone",
    source: signupSource,
  });

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: JSON.stringify({ phone, source: signupSource }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Beta signup failed");

    form.reset();
    phoneInputStarted = false;
    phoneInput.disabled = true;
    submitButton.disabled = true;
    sendAnalyticsEvent("beta_apply_success", {
      method: "phone",
      source: signupSource,
    });
    setFormMessage(
      "success",
      "베타 신청이 완료되었습니다. 안내 연락을 드리겠습니다.",
    );
  } catch (error) {
    sendAnalyticsEvent("beta_apply_fail", {
      reason: "api_error",
      source: signupSource,
    });
    setFormMessage(
      "error",
      "신청을 완료하지 못했습니다. 잠시 후 다시 시도해주세요.",
    );
  } finally {
    if (!formMessage.classList.contains("success")) {
      submitButton.disabled = false;
      setSubmitButtonText("신청하기");
    }
  }
});

phoneInput.addEventListener("input", () => {
  if (!phoneInputStarted) {
    phoneInputStarted = true;
    sendAnalyticsEvent("beta_phone_input_start", {
      field_name: "phone",
      source: signupSource,
    });
  }

  if (!formMessage.classList.contains("success")) {
    setFormMessage("", defaultMessage);
  }
});
