const CONFIG = {
  start: "2026-11-07T12:30:00-06:00",
  // Número con lada de país, sin espacios ni "+", p. ej. "5212311234567". Vacío = se oculta la sección.
  whatsapp: "",
  whatsappMessage: "¡Hola! Confirmo mi asistencia al bautizo de Alitel Guadalupe y Angel David. Seremos ___ personas.",
};

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);

if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);

/* ---------- Portada ---------- */

const cover = document.getElementById("cover");
document.getElementById("openBtn").addEventListener("click", () => {
  document.body.classList.add("opened", "intro");
  setTimeout(() => {
    document.documentElement.classList.remove("locked");
    cover.classList.add("gone");
    lenis?.start();
    measure();
  }, 1400);
});

/* ---------- Motor de escenas ---------- */

const parseRanges = (str) =>
  str.split(";").map((part) => {
    const [name, range] = part.split(":");
    const [a, b] = range.split(",").map(Number);
    return { prop: `--${name.trim()}`, a, b };
  });

const scenes = [...document.querySelectorAll("[data-scene]")].map((el) => ({
  el,
  mode: el.dataset.scene || "sticky",
  top: 0,
  height: 0,
  last: -1,
  targets: [...el.querySelectorAll("[data-t]")].map((t) => ({ el: t, ranges: parseRanges(t.dataset.t) })),
}));

let vh = innerHeight;
let docMax = 1;

function measure() {
  vh = document.documentElement.clientHeight;
  docMax = Math.max(1, document.documentElement.scrollHeight - vh);
  for (const s of scenes) {
    s.top = s.el.getBoundingClientRect().top + scrollY;
    s.height = s.el.offsetHeight;
    s.last = -1;
  }
  update(current);
}

const hooks = {
  verse: setupVerse(),
};

function update(y) {
  document.documentElement.style.setProperty("--g", clamp(y / docMax).toFixed(4));

  for (const s of scenes) {
    const p =
      s.mode === "view"
        ? clamp((y + vh - s.top) / (s.height + vh))
        : clamp((y - s.top) / Math.max(1, s.height - vh));
    if (Math.abs(p - s.last) < 0.0005) continue;
    s.last = p;

    for (const t of s.targets) {
      for (const r of t.ranges) {
        t.el.style.setProperty(r.prop, smooth(clamp((p - r.a) / (r.b - r.a))).toFixed(4));
      }
    }
    hooks[s.el.id]?.(p);
  }
}

let current = scrollY;

const lenis =
  window.Lenis && !reduceMotion
    ? new Lenis({ autoRaf: true, lerp: 0.1, wheelMultiplier: 1.1, touchMultiplier: 1.4 })
    : null;

if (lenis) {
  lenis.stop();
  lenis.on("scroll", ({ scroll }) => {
    current = scroll;
    update(current);
  });
} else {
  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      current = scrollY;
      update(current);
    });
  }, { passive: true });
}

let lastWidth = innerWidth;
addEventListener("resize", () => {
  // La barra de direcciones del móvil cambia la altura al hacer scroll; solo re-medimos si cambia el ancho.
  if (innerWidth === lastWidth && Math.abs(document.documentElement.clientHeight - vh) < 120) return;
  lastWidth = innerWidth;
  measure();
});
addEventListener("load", measure);
document.fonts?.ready.then(measure);

/* ---------- Oración palabra por palabra ---------- */

function setupVerse() {
  const el = document.getElementById("verseText");
  const golden = new Set(["Jesús,", "gracia", "amor."]);
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words
    .map((w) => `<span class="w${golden.has(w) ? " w--gold" : ""}">${w}</span>`)
    .join(" ");
  const spans = [...el.children];
  const n = spans.length;

  return (p) => {
    const t = clamp((p - 0.1) / 0.5) * (n + 2);
    spans.forEach((s, i) => s.style.setProperty("--w", smooth(clamp(t - i, 0, 1)).toFixed(3)));
  };
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
  const mobile = innerWidth < 700;
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

measure();
