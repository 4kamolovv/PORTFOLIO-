document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", function (e) {
    const target = e.target.closest(".ripple");
    if (!target) return;
    
    const circle = document.createElement("span");
    const rect = target.getBoundingClientRect();
    
    const size = Math.max(rect.width, rect.height);
    circle.style.width = circle.style.height = size + "px";
    
    circle.style.left = e.clientX - rect.left - size / 2 + "px";
    circle.style.top = e.clientY - rect.top - size / 2 + "px";
    
    target.appendChild(circle);
    
    setTimeout(() => circle.remove(), 600);
  });
});
// ripple>
let toastSound = null;
const MAX_SAME_TOASTS = 3;
const TOAST_EXIT_MS = 400;

function getToastSound() {
  if (!toastSound) {
    toastSound = new Audio("sounds/notiferror.wav");
    toastSound.volume = 1;
  }
  return toastSound;
}

function getToastLang() {
  const savedLang = localStorage.getItem("selectedLang") || "SystemLang";
  return savedLang === "SystemLang" ? getSystemLanguage() : savedLang;
}

function getToastText(key) {
  if (!key) return "";
  const lang = getToastLang();
  return translations?.[lang]?.[key] || key;
}

function getToastIcon(type) {
  if (type === "error") {
    return `<svg class="toast-icon" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`;
  }

  if (type === "warning") {
    return `<svg class="toast-icon" viewBox="0 0 24 24">
      <path fill="none" stroke="currentColor" stroke-width="2"
      d="M12 9v4M12 17h.01M1 21h22L12 2 1 21z"
      stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  return `<svg class="toast-icon" viewBox="0 0 24 24">
    <path fill="none" stroke="currentColor" stroke-width="2"
    d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function removeToast(toast) {
  if (!toast || toast.dataset.removing === "true") return;
  toast.dataset.removing = "true";
  toast.style.animation = "slideOut 0.4s ease forwards";
  toast.addEventListener("animationend", () => toast.remove(), { once: true });
  setTimeout(() => toast.remove(), TOAST_EXIT_MS + 100);
}

function showToast(type, titleKey, descKey = null) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const safeType = ["success", "error", "warning"].includes(type) ? type : "success";
  const title = getToastText(titleKey);
  const desc = descKey ? getToastText(descKey) : "";
  const toastKey = JSON.stringify([safeType, title, desc]);
  const sameToasts = Array.from(container.querySelectorAll(".toast")).filter(
    (item) =>
      item.dataset.toastKey === toastKey && item.dataset.removing !== "true"
  );
  if (sameToasts.length >= MAX_SAME_TOASTS) return;

  const toast = document.createElement("div");
  toast.className = `toast ${safeType}`;
  toast.dataset.toastKey = toastKey;
  toast.innerHTML = `
    ${getToastIcon(safeType)}
    <div class="message">
      <strong>${title}</strong>
      ${desc ? `<p class="message-desc">${desc}</p>` : ""}
    </div>
    <button class="close-btn" type="button" aria-label="Close toast">
      <svg class="toast-icon" viewBox="0 0 24 24">
        <path fill="none" stroke="currentColor" stroke-width="2"
        d="M6 6l12 12M6 18L18 6"
        stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  `;

  container.appendChild(toast);

  if (safeType === "warning" || safeType === "error") {
    const sound = getToastSound();
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  toast.querySelector(".close-btn").addEventListener("click", () => {
    removeToast(toast);
  });

  setTimeout(() => removeToast(toast), 10000);
}

document.querySelectorAll("[toast]").forEach((el) => {
  el.addEventListener("click", () => {
    const message = el.getAttribute("toast-text") || "Undefind!?";
    showToast("success", message);
  });
});
document.querySelectorAll("[successToast]").forEach((btn) => {
  btn.addEventListener("click", () => {
    showToast("success", btn.getAttribute("successToast"));
  });
});
document.querySelectorAll("[errorToast]").forEach((btn) => {
  btn.addEventListener("click", () => {
    showToast("error", btn.getAttribute("errorToast"));
  });
});
document.querySelectorAll("[warningToast]").forEach((btn) => {
  btn.addEventListener("click", () => {
    showToast(
      "warning",
      btn.getAttribute("warningToast"),
      btn.getAttribute("descToast")
    );
  });
});
const copyText = document.getElementById("copyText");
if (copyText) {
  copyText.addEventListener("click", () => {
    navigator.clipboard.writeText(copyText.innerText).then(() => {
      let lang = localStorage.getItem("selectedLang") || "SystemLang";
      if (lang === "SystemLang") {
        lang = getSystemLanguage();
      }

      const copiedMsg = translations[lang]?.["copiedText"] || "Copied";

      showToast("success", copiedMsg);
    }).catch(() => {
      showToast("error", "Copy failed");
    });
  });
}
// Toast function>
const bar = document.getElementById("progress-bar");
bar.style.width = "10%";
setTimeout(() => {
  bar.style.transition = "width 0.8s ease";
  bar.style.width = "40%";
}, 500);
setTimeout(() => {
  bar.style.transition = "width 0.8s ease";
  bar.style.width = "70%";
}, 800);
window.onload = function () {
  bar.style.transition = "width 1.2s ease-out";
  setTimeout(() => {
    bar.style.transition = "width 0.4s ease-in";
    bar.style.width = "100%";
  }, 1200);
  setTimeout(() => {
    bar.style.transition = "opacity 0.3s ease-out";
    bar.style.opacity = "0";
    setTimeout(() => {
      bar.remove();
      document.getElementById("progress-bg").remove();
    }, 300);
  }, 1800);
  // loading
};
// loading>
document.querySelectorAll('.dropdown a[href^="#"]').forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    
    const targetId = this.getAttribute("href").substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      const elementRect = targetElement.getBoundingClientRect();
      const offset =
      window.scrollY +
      elementRect.top -
      window.innerHeight / 2 +
      elementRect.height / 2;
      
      window.scrollTo({
        top: offset,
        behavior: "smooth",
      });
    }
  });
});
// smooth scroll>
// Translate Language Switcher
let translations = {};
async function loadTranslations() {
  try {
    const res = await fetch("data/lang.json");
    translations = await res.json();
    
    const savedLang = localStorage.getItem("selectedLang") || "SystemLang";
    setLanguage(savedLang);
  } catch (err) {
    console.error("Error /data/lang.json:", err);
  }
}
function getSystemLanguage() {
  // Brauzer tilini olish
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split("-")[0]; // 'en-US' -> 'en'
  
  // Mavjud tillar ro'yxati
  const supportedLangs = ["en", "ru", "uz"];
  
  // Agar system tili mavjud bo'lsa, uni qaytarish
  if (supportedLangs.includes(langCode)) {
    return langCode;
  }
  
  // Aks holda English qaytarish
  return "en";
}
function setLanguage(lang) {
  let actualLang = lang;
  
  // Agar "SystemLang" tanlangan bo'lsa, system tilini aniqlash
  if (lang === "SystemLang") {
    actualLang = getSystemLanguage();
  }
  
  if (!translations[actualLang]) return;
  
  document.querySelectorAll("[lang]").forEach((el) => {
    const key = el.getAttribute("lang");
    if (translations[actualLang][key]) {
      el.textContent = translations[actualLang][key];
    }
  });
  
  localStorage.setItem("selectedLang", lang); //
  
  // Dropdown
  const langLabelKeys = {
    SystemLang: "langSystem",
    en: "langEnglish",
    ru: "langRussian",
    uz: "langUzbek",
  };
  const displayText =
    translations[actualLang][langLabelKeys[lang]] ||
    translations[actualLang].langUzbek ||
    "Uzbek";
  
  document.getElementById("selected-lang").textContent = displayText;

  document.dispatchEvent(
    new CustomEvent("app:language-changed", { detail: { lang: actualLang } })
  );
}
setLanguage("en");
// Dropdown til tanlash event
document.querySelectorAll(".dropdown a[data-lang]").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const selectedLang = link.getAttribute("data-lang");
    setLanguage(selectedLang);
  });
});
loadTranslations();
// Translate Language Switcher
document.querySelectorAll(".lang-ahref").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    
    const lang = link.getAttribute("data-lang");
    setLanguage(lang);
    
    let toastMsg = "";
    if (lang === "SystemLang") {
      //
      let systemLang = getSystemLanguage(); // misol: "en", "ru", "uz"
      toastMsg = translations[systemLang]?.["LangisSystem"] || "System language selected";
    } else {
      //
      toastMsg = translations[lang]?.["ChangedLang"] || "Language changed";
    }
    
    showToast("success", toastMsg); //
  });
});
const sections = document.querySelectorAll(".animate-on-scroll");
const observer = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate");
        observer.unobserve(entry.target); // faqat bir marta ishlash uchun
      }
    });
  },
  {
    threshold: 0.2,
  }
);
sections.forEach((section) => {
  observer.observe(section);
});

// Defer heavy section backgrounds until they are near viewport.
const lazyBgElements = document.querySelectorAll("[data-bg]");
if ("IntersectionObserver" in window) {
  const bgObserver = new IntersectionObserver(
    (entries, observerRef) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const bgPath = el.getAttribute("data-bg");
        if (bgPath) {
          el.style.backgroundImage = `url('${bgPath}')`;
          el.removeAttribute("data-bg");
        }
        observerRef.unobserve(el);
      });
    },
    { rootMargin: "300px 0px" }
  );

  lazyBgElements.forEach((el) => bgObserver.observe(el));
} else {
  lazyBgElements.forEach((el) => {
    const bgPath = el.getAttribute("data-bg");
    if (bgPath) {
      el.style.backgroundImage = `url('${bgPath}')`;
      el.removeAttribute("data-bg");
    }
  });
}
