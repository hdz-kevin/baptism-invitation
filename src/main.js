import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CONFIG = {
  start: "2026-11-07T12:30:00-06:00",
  // Número con lada de país, sin espacios ni "+", p. ej. "5212311234567". Vacío = se oculta la sección.
  whatsapp: "",
  whatsappMessage: "¡Hola! Confirmo mi asistencia al bautizo de Alitel Guadalupe y Angel David. Seremos ___ personas.",
};

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobile = matchMedia("(max-width: 700px)").matches;

if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);

const heroTimeline = setupHero();

/* ---------- Portada ---------- */

const cover = document.getElementById("cover");
document.getElementById("openBtn").addEventListener("click", () => {
  document.body.classList.add("opened", "intro");
  heroTimeline.play();
  setTimeout(() => {
    document.documentElement.classList.remove("locked");
    cover.classList.add("gone");
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, 1400);
});

/* ---------- Animaciones de entrada ---------- */

function onceOnEnter(trigger, animation, start = "top 72%") {
  if (reduceMotion) {
    animation.progress(1);
    return;
  }
  ScrollTrigger.create({
    trigger,
    start,
    once: true,
    onEnter: () => animation.play(),
  });
}

function setupHero() {
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
  tl.to(".clouds", { "--in": 1, duration: 1.8 }, 0.2);
  tl.to(".hero__doves", { "--in": 1, duration: 1.5 }, 0.55);
  return tl;
}

function setupTwins() {
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
  tl.to(".twins__intro", { "--in": 1, duration: 0.55 });
  tl.to(".kid--girl", { "--in": 1, duration: 0.9 }, 0.12);
  tl.to(".kid--boy", { "--in": 1, duration: 0.9 }, 0.25);
  tl.to(".twins__amp", { "--in": 1, duration: 0.5 }, 0.45);
  tl.to(".twins__surname", { "--in": 1, duration: 0.65 }, 0.58);
  onceOnEnter(".twins", tl);
}

function setupFinale() {
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
  tl.to(".finale__photo", { "--in": 1, duration: 0.9, stagger: 0.08 });
  tl.to(".finale__title", { "--in": 1, duration: 0.75 }, 0.32);
  tl.to(".finale__sign", { "--in": 1, duration: 0.6 }, 0.62);
  tl.to(".finale__doves", { "--in": 1, duration: 1.6 }, 0.25);
  onceOnEnter(".finale", tl);
}

setupTwins();
setupVerse();
setupFinale();

const itineraryLine = gsap.to(".timeline__line", {
  "--in": 1,
  duration: 1.1,
  paused: true,
  ease: "power2.out",
});
onceOnEnter(".itinerary", itineraryLine, "top 78%");

// Solo el color del fondo sigue el documento; el contenido no depende del scroll.
let backgroundTicking = false;
addEventListener("scroll", () => {
  if (backgroundTicking) return;
  backgroundTicking = true;
  requestAnimationFrame(() => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    document.documentElement.style.setProperty("--g", Math.min(1, scrollY / max).toFixed(4));
    backgroundTicking = false;
  });
}, { passive: true });

let lastWidth = innerWidth;
addEventListener("resize", () => {
  if (innerWidth === lastWidth) return;
  lastWidth = innerWidth;
  ScrollTrigger.refresh();
});
addEventListener("load", () => ScrollTrigger.refresh());
document.fonts?.ready.then(() => ScrollTrigger.refresh());

/* ---------- Oración automática ---------- */

function setupVerse() {
  const el = document.getElementById("verseText");
  const golden = new Set(["Jesús,", "gracia", "amor."]);
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words
    .map((w) => `<span class="w${golden.has(w) ? " w--gold" : ""}">${w}</span>`)
    .join(" ");
  const spans = [...el.children];
  const wrap = document.querySelector(".verse__wrap");
  const drop = document.querySelector(".drop");
  const ripples = [...document.querySelectorAll(".ripple i")];

  if (reduceMotion) {
    gsap.set(wrap, { "--in": 1 });
    gsap.set(spans, { opacity: 1, y: 0 });
    return;
  }

  const tl = gsap.timeline({ paused: true });
  tl.to(wrap, { "--in": 1, duration: 0.55, ease: "power2.out" });
  tl.to(spans, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.05,
    ease: "power2.out",
  }, 0.12);
  tl.fromTo(drop, { y: "-12vh", opacity: 0 }, { y: "46vh", opacity: 1, duration: 0.7, ease: "power2.in" }, "+=0.2");
  tl.to(drop, { opacity: 0, duration: 0.18 });
  tl.fromTo(
    ripples,
    { scale: 0, opacity: 0.75 },
    { scale: (i) => [1, 0.7, 0.42][i], opacity: 0, duration: 1.1, stagger: 0.07, ease: "power2.out" },
    "<"
  );

  onceOnEnter("#verse", tl, "top 25%");
}

/* ---------- Apariciones al entrar en pantalla ---------- */

const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    }
  },
  { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* ---------- Pétalos ---------- */

const petals = document.getElementById("petals");
const petalColors = ["#f3c6d0", "#f8dbe2", "#bcd6ee", "#d7e6f4", "#ead6a6", "#ffffff"];
for (let i = 0; i < 22; i++) {
  const p = document.createElement("i");
  p.className = "petal";
  p.style.cssText = `
    --l:${Math.random() * 100}%;
    --s:${8 + Math.random() * 10}px;
    --d:${7 + Math.random() * 7}s;
    --dl:${-Math.random() * 14}s;
    --c:${petalColors[i % petalColors.length]};
  `;
  petals.appendChild(p);
}
new IntersectionObserver(([e]) => petals.classList.toggle("on", e.isIntersecting)).observe(petals);

/* ---------- Partículas doradas ---------- */

(function particles() {
  if (reduceMotion) return;
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");
  let w, h, dpr;
  const count = mobile ? 22 : 50;
  const dots = [];

  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 64;
  const sctx = sprite.getContext("2d");
  const g = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255, 236, 190, 1)");
  g.addColorStop(0.3, "rgba(222, 186, 110, .5)");
  g.addColorStop(1, "rgba(222, 186, 110, 0)");
  sctx.fillStyle = g;
  sctx.fillRect(0, 0, 64, 64);

  function resize() {
    dpr = mobile ? 1 : Math.min(devicePixelRatio || 1, 1.5);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
  }
  resize();
  let lastW = innerWidth;
  addEventListener("resize", () => {
    if (innerWidth === lastW) return;
    lastW = innerWidth;
    resize();
  });

  for (let i = 0; i < count; i++) {
    dots.push({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 2.2,
      s: 0.00008 + Math.random() * 0.00025,
      a: Math.random() * Math.PI * 2,
      tw: 0.5 + Math.random() * 1.5,
    });
  }

  let lastY = scrollY;
  let running = true;
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(draw);
  });

  function draw(time) {
    if (!running) return;
    const dy = (scrollY - lastY) / innerHeight;
    lastY = scrollY;
    ctx.clearRect(0, 0, w, h);

    for (const d of dots) {
      d.y -= d.s * 16 + dy * 0.25 * d.r;
      d.x += Math.sin(time * 0.0004 + d.a) * 0.0002;
      if (d.y < -0.05) { d.y = 1.05; d.x = Math.random(); }
      if (d.y > 1.05) d.y = -0.05;

      const alpha = 0.35 + 0.45 * Math.sin(time * 0.001 * d.tw + d.a) ** 2;
      const x = d.x * w;
      const y = d.y * h;
      const size = d.r * dpr * 8;
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* ---------- Cuenta regresiva ---------- */

(function countdown() {
  const target = new Date(CONFIG.start).getTime();
  const box = document.getElementById("countdown");
  const done = document.getElementById("countdownDone");
  const units = Object.fromEntries([...box.querySelectorAll("[data-unit]")].map((b) => [b.dataset.unit, b]));
  const pad = (n) => String(n).padStart(2, "0");

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      box.hidden = true;
      done.hidden = false;
      return;
    }
    const s = Math.floor(diff / 1000);
    units.d.textContent = pad(Math.floor(s / 86400));
    units.h.textContent = pad(Math.floor((s % 86400) / 3600));
    units.m.textContent = pad(Math.floor((s % 3600) / 60));
    units.s.textContent = pad(s % 60);
    setTimeout(tick, 1000 - (Date.now() % 1000));
  }
  tick();
})();

/* ---------- Confirmación ---------- */

if (CONFIG.whatsapp) {
  document.getElementById("rsvp").hidden = false;
  document.getElementById("waBtn").href =
    `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.whatsappMessage)}`;
}
