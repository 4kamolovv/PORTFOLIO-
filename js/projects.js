// projects.js - handles project carousel loading from projects.json and language keys

// Config
const PROJECTS_VISIBLE = 3;
let currentIndex = 0;
let projectsData = [];

// DOM
const projectsContainer = document.querySelector(".projects-grid");
const prevBtn = document.getElementById("project-prev");
const nextBtn = document.getElementById("project-next");

// Fetch projects.json and render
async function loadProjects() {
  try {
    const res = await fetch("./data/projects.json");
    projectsData = await res.json();
    renderProjects();
  } catch (e) {
    console.error("Projects load error:", e);
  }
}

function renderProjects() {
  projectsContainer.innerHTML = "";

  const slice = projectsData.slice(
    currentIndex,
    currentIndex + PROJECTS_VISIBLE
  );

  slice.forEach((p) => {
    const card = document.createElement("div");
    card.className = "project-card ripple";
    card.innerHTML = `
      <img src="${p.propic}" class="project-img" />
      <h3 class="project-title" lang="${p.proname}"></h3>
      <p class="project-desc" lang="${p.prodesc}"></p>
      <a href="${p.prolink}"  target="_blank" class="btn">Live Demo</a>
      `;
    projectsContainer.appendChild(card);
  });

  updateButtons();

  // refresh language for newly added elements
  let currentLang = localStorage.getItem("selectedLang") || "SystemLang";
  if (typeof setLanguage === "function") setLanguage(currentLang);
}

function updateButtons() {
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex + PROJECTS_VISIBLE >= projectsData.length;
}

// Events
prevBtn?.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    renderProjects();
  }
});

nextBtn?.addEventListener("click", () => {
  if (currentIndex + PROJECTS_VISIBLE < projectsData.length) {
    currentIndex++;
    renderProjects();
  }
});

// Init
loadProjects();
