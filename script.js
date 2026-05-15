const initialHash = window.location.hash;

if (initialHash) {
  history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  });
}

const emotions = {
  melancholia: {
    title: "MELANCHOLIA",
    code: "EA-01",
    color: "#8FA7C6",
    selectorImage: "./assets/selector-melancholia.png",
    imageAlt: "Melancholia personality portrait in rain and blue glass",
    imagePosition: "center center",
    description: "Rain air, wet paper, sea salt and the silence after a sleepless night.",
    status: { anxiety: 46, memory: 82, scent: 71 },
  },
  null: {
    title: "NULL",
    code: "EA-02",
    color: "#D9D9D7",
    selectorImage: "./assets/selector-null.png",
    imageAlt: "Null personality portrait dissolving into fog-white silence",
    imagePosition: "center center",
    description: "A white vacuum: cold air, blank pages, emotional latency and suspended breath.",
    status: { anxiety: 8, memory: 24, scent: 38 },
  },
  overload: {
    title: "OVERLOAD",
    code: "EA-03",
    color: "#FF2A2A",
    selectorImage: "./assets/selector-overload.png",
    imageAlt: "Overload personality portrait in red neural glitch noise",
    imagePosition: "center center",
    description: "A red neural spike: burnt metal, static pressure, panic rhythm and signal collapse.",
    status: { anxiety: 93, memory: 57, scent: 88 },
  },
  euphoria: {
    title: "EUPHORIA",
    code: "EA-04",
    color: "#F6D8AF",
    selectorImage: "./assets/selector-euphoria.png",
    imageAlt: "Euphoria personality portrait in golden sunset particles",
    imagePosition: "center center",
    description: "A warm exposure: sunset dust, neroli, white tea and a brief return to youth.",
    status: { anxiety: 18, memory: 78, scent: 84 },
  },
};

const root = document.documentElement;
const loader = document.querySelector(".loader");
const header = document.querySelector(".system-header");
const nodes = document.querySelectorAll(".emotion-node");
const title = document.querySelector("[data-emotion-title]");
const code = document.querySelector("[data-emotion-code]");
const description = document.querySelector("[data-emotion-description]");
const emotionCore = document.querySelector("[data-emotion-core]");
const emotionImage = document.querySelector("[data-emotion-image]");
const cursor = document.querySelector(".cursor");
const cursorTrail = document.querySelector(".cursor-trail");
const canvas = document.querySelector(".particle-field");
const context = canvas.getContext("2d");
let particles = [];
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let trailX = cursorX;
let trailY = cursorY;
let imageSwitchTimer;

function setEmotion(key) {
  const emotion = emotions[key];
  root.style.setProperty("--emotion-color", emotion.color);
  title.textContent = emotion.title;
  code.textContent = emotion.code;
  description.textContent = emotion.description;
  emotionCore?.classList.toggle("is-overload", key === "overload");

  if (emotionImage) {
    clearTimeout(imageSwitchTimer);
    emotionCore?.classList.add("is-switching");
    imageSwitchTimer = window.setTimeout(() => {
      emotionImage.src = emotion.selectorImage;
      emotionImage.alt = emotion.imageAlt;
      emotionImage.style.objectPosition = emotion.imagePosition;
      window.setTimeout(() => emotionCore?.classList.remove("is-switching"), 80);
    }, 220);
  }

  nodes.forEach((node) => node.classList.toggle("is-active", node.dataset.emotion === key));

  Object.entries(emotion.status).forEach(([name, value]) => {
    const bar = document.querySelector(`[data-status="${name}"]`);
    const label = document.querySelector(`[data-status-value="${name}"]`);
    if (bar) bar.style.width = `${value}%`;
    if (label) label.textContent = value;
  });
}

function revealOnScroll() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  document.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.min(110, Math.max(42, Math.floor(window.innerWidth / 16)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 1.8 + 0.25,
    speed: Math.random() * 0.18 + 0.04,
    drift: (Math.random() - 0.5) * 0.12,
    alpha: Math.random() * 0.34 + 0.08,
  }));
}

function drawParticles() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles.forEach((particle) => {
    particle.y -= particle.speed;
    particle.x += particle.drift;

    if (particle.y < -10) {
      particle.y = window.innerHeight + 10;
      particle.x = Math.random() * window.innerWidth;
    }

    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(244, 241, 236, ${particle.alpha})`;
    context.fill();
  });

  requestAnimationFrame(drawParticles);
}

function moveCursor() {
  trailX += (cursorX - trailX) * 0.12;
  trailY += (cursorY - trailY) * 0.12;

  if (cursor) cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
  if (cursorTrail) cursorTrail.style.transform = `translate3d(${trailX}px, ${trailY}px, 0) translate(-50%, -50%)`;

  requestAnimationFrame(moveCursor);
}

setEmotion("melancholia");
window.setTimeout(() => loader.classList.add("is-hidden"), 920);

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 20);
});

window.addEventListener("resize", resizeCanvas);

window.addEventListener("mousemove", (event) => {
  document.body.classList.add("has-cursor");
  cursorX = event.clientX;
  cursorY = event.clientY;
});

document.querySelectorAll("a, button").forEach((element) => {
  element.addEventListener("mouseenter", () => cursorTrail?.classList.add("is-hovering"));
  element.addEventListener("mouseleave", () => cursorTrail?.classList.remove("is-hovering"));
});

nodes.forEach((node) => {
  node.addEventListener("click", () => setEmotion(node.dataset.emotion));
});

revealOnScroll();
resizeCanvas();
drawParticles();
moveCursor();
