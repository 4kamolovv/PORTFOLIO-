// projects.js - handles project carousel loading from projects.json and language keys

// Config
let currentIndex = 0;
let projectsData = [];
let projectsLoaded = false;

// DOM
const projectsContainer = document.querySelector(".projects-grid");
const prevBtn = document.getElementById("project-prev");
const nextBtn = document.getElementById("project-next");

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

  const slice = projectsData.slice(
    currentIndex,
    currentIndex + visibleCount
  );

  slice.forEach((p) => {
    const card = document.createElement("div");
    card.className = "project-card ripple";
    card.innerHTML = `
      <img src="${p.propic}" class="project-img" loading="lazy" decoding="async" alt="${p.proname}" />
      <h3 class="project-title" lang="${p.proname}"></h3>
      <p class="project-desc" lang="${p.prodesc}"></p>
      <a href="${p.prolink}"  target="_blank" class="btn">Live Demo</a>
      `;
    projectsContainer.appendChild(card);
  });

  updateButtons(visibleCount);

  // refresh language for newly added elements
  let currentLang = localStorage.getItem("selectedLang") || "SystemLang";
  if (typeof setLanguage === "function") setLanguage(currentLang);
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
  if (currentIndex > 0) {
    currentIndex--;
    renderProjects();
  }
});

nextBtn?.addEventListener("click", () => {
  if (currentIndex + getVisibleCount() < projectsData.length) {
    currentIndex++;
    renderProjects();
  }
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
