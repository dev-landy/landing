const form = document.getElementById("signupForm");
const phoneInput = document.getElementById("phoneInput");
const submitButton = document.getElementById("submitButton");
const submitButtonLabel = submitButton.querySelector("[data-submit-label]");
const formMessage = document.getElementById("formMessage");
const floatingBetaCta = document.querySelector(".floating-beta-cta");
const firstContentSection = document.querySelector(".hero + .section");
const betaSection = document.getElementById("beta");
const defaultMessage = formMessage.textContent;
let phoneInputStarted = false;
let phoneFormViewed = false;
let pendingPhoneFormEntryPoint = "scroll";

function sendAnalyticsEvent(eventName, params = {}) {
  if (typeof gtag !== "function") return;
  gtag("event", eventName, params);
}

function sendPhoneFormView(entryPoint = "scroll") {
  if (phoneFormViewed) return;
  phoneFormViewed = true;
  sendAnalyticsEvent("beta_phone_form_view", {
    entry_point: entryPoint,
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

document.querySelectorAll('a[href="#beta"]').forEach((link) => {
  link.addEventListener("click", () => {
    const buttonLocation = link.dataset.betaLocation || "unknown";
    pendingPhoneFormEntryPoint = buttonLocation;
    sendAnalyticsEvent("beta_apply_click", {
      button_location: buttonLocation,
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
  });

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: JSON.stringify({ phone }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Beta signup failed");

    form.reset();
    phoneInputStarted = false;
    sendAnalyticsEvent("beta_apply_success", {
      method: "phone",
    });
    setFormMessage(
      "success",
      "베타 신청이 완료되었습니다. 안내 연락을 드리겠습니다.",
    );
  } catch (error) {
    sendAnalyticsEvent("beta_apply_fail", {
      reason: "api_error",
    });
    setFormMessage(
      "error",
      "신청을 완료하지 못했습니다. 잠시 후 다시 시도해주세요.",
    );
  } finally {
    submitButton.disabled = false;
    setSubmitButtonText("신청하기");
  }
});

phoneInput.addEventListener("input", () => {
  if (!phoneInputStarted) {
    phoneInputStarted = true;
    sendAnalyticsEvent("beta_phone_input_start", {
      field_name: "phone",
    });
  }

  if (!formMessage.classList.contains("success")) {
    setFormMessage("", defaultMessage);
  }
});
