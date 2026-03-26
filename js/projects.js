// projects.js - handles project carousel loading from projects.json and language keys

// Config
let currentIndex = 0;
let projectsData = [];
let projectsLoaded = false;

// DOM
const projectsContainer = document.querySelector(".projects-grid");
const prevBtn = document.getElementById("project-prev");
const nextBtn = document.getElementById("project-next");

function getDescToggleLabels() {
  let lang = localStorage.getItem("selectedLang") || "SystemLang";
  if (lang === "SystemLang" && typeof getSystemLanguage === "function") {
    lang = getSystemLanguage();
  }

  if (lang === "ru") return { more: "Подробнее", less: "Свернуть" };
  if (lang === "en") return { more: "Read more", less: "Show less" };
  return { more: "Batafsil", less: "Yopish" };
}

function toggleDescription(card) {
  if (!card) return;

  const desc = card.querySelector(".project-desc");
  const toggleBtn = card.querySelector(".project-desc-toggle");
  if (!desc || !toggleBtn || toggleBtn.hidden) return;

  const labels = getDescToggleLabels();
  const willExpand = !desc.classList.contains("expanded");

  desc.classList.toggle("expanded", willExpand);
  toggleBtn.textContent = willExpand ? labels.less : labels.more;
  desc.setAttribute("title", willExpand ? labels.less : labels.more);
}

function updateDescriptionClampState() {
  if (!projectsContainer) return;
  const labels = getDescToggleLabels();

  const descriptions = projectsContainer.querySelectorAll(".project-desc");
  descriptions.forEach((desc) => {
    const card = desc.closest(".project-card");
    const toggleBtn = card?.querySelector(".project-desc-toggle");
    const wasExpanded = desc.classList.contains("expanded");

    // Measure while collapsed to detect true overflow state.
    if (wasExpanded) desc.classList.remove("expanded");
    desc.classList.remove("can-expand");
    desc.removeAttribute("title");

    const canExpand = desc.scrollHeight - desc.clientHeight > 2;

    if (wasExpanded && canExpand) desc.classList.add("expanded");

    if (canExpand) {
      desc.classList.add("can-expand");
      desc.setAttribute("title", wasExpanded ? labels.less : labels.more);
      if (toggleBtn) {
        toggleBtn.hidden = false;
        toggleBtn.textContent = wasExpanded ? labels.less : labels.more;
      }
    } else if (toggleBtn) {
      toggleBtn.hidden = true;
      toggleBtn.textContent = "";
      desc.classList.remove("expanded");
    }
  });
}

// Fetch projects.json and render
async function loadProjects() {
  if (projectsLoaded) return;
  try {
    const res = await fetch("data/projects.json");
    projectsData = await res.json();
    projectsLoaded = true;
    renderProjects();
  } catch (e) {
    console.error("Projects load error:", e);
  }
}

function renderProjects() {
  projectsContainer.innerHTML = "";
  const visibleCount = getVisibleCount();

  const slice = projectsData.slice(currentIndex, currentIndex + visibleCount);

  slice.forEach((p, idx) => {
    const eagerImage = idx === 0;
    const card = document.createElement("div");
    card.className = "project-card ripple project-card-enter";
    card.innerHTML = `
      <div class="project-img-wrap">
        <img
          src="${p.propic}"
          class="project-img"
          loading="${eagerImage ? "eager" : "lazy"}"
          fetchpriority="${eagerImage ? "high" : "auto"}"
          decoding="async"
          width="1280"
          height="720"
          alt="${p.proname}"
        />
      </div>
      <h3 class="project-title" lang="${p.proname}"></h3>
      <p class="project-desc" lang="${p.prodesc}"></p>
      <div class="project-actions">
        <button type="button" class="project-desc-toggle" hidden></button>
        <a href="${p.prolink}" target="_blank" class="btn" lang="liveDemo"></a>
      </div>
      `;

    const projectImg = card.querySelector(".project-img");
    const imgWrap = card.querySelector(".project-img-wrap");
    if (projectImg && imgWrap) {
      projectImg.addEventListener("load", () => {
        projectImg.classList.add("is-ready");
      });
      projectImg.addEventListener("error", () => {
        imgWrap.classList.add("img-error");
      });
    }

    projectsContainer.appendChild(card);
  });

  updateButtons(visibleCount);

  // refresh language for newly added elements
  let currentLang = localStorage.getItem("selectedLang") || "SystemLang";
  if (typeof setLanguage === "function") setLanguage(currentLang);

  requestAnimationFrame(updateDescriptionClampState);
}

function updateButtons(visibleCount = getVisibleCount()) {
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex + visibleCount >= projectsData.length;
}

function getVisibleCount() {
  if (window.innerWidth <= 640) return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

function normalizeIndex() {
  const visibleCount = getVisibleCount();
  const maxStart = Math.max(0, projectsData.length - visibleCount);
  if (currentIndex > maxStart) currentIndex = maxStart;
}

// Events
prevBtn?.addEventListener("click", () => {
  if (currentIndex <= 0) return;
  currentIndex--;
  renderProjects();
});

nextBtn?.addEventListener("click", () => {
  if (currentIndex + getVisibleCount() >= projectsData.length) return;
  currentIndex++;
  renderProjects();
});

let resizeTimer;
window.addEventListener("resize", () => {
  if (!projectsData.length) return;
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    normalizeIndex();
    renderProjects();
  }, 120);
});

projectsContainer?.addEventListener("click", (e) => {
  const toggleBtn = e.target.closest(".project-desc-toggle");
  if (toggleBtn) {
    toggleDescription(toggleBtn.closest(".project-card"));
    return;
  }

  const desc = e.target.closest(".project-desc.can-expand");
  if (desc) toggleDescription(desc.closest(".project-card"));
});

document.addEventListener("app:language-changed", () => {
  requestAnimationFrame(updateDescriptionClampState);
});

function initProjectsWhenVisible() {
  const projectsSection = document.getElementById("mypro");
  if (!projectsSection) {
    loadProjects();
    return;
  }

  if (!("IntersectionObserver" in window)) {
    loadProjects();
    return;
  }

  const sectionObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadProjects();
        observer.unobserve(projectsSection);
      });
    },
    { rootMargin: "400px 0px" }
  );

  sectionObserver.observe(projectsSection);
}

// Init
initProjectsWhenVisible();
