const $ = (sel) => document.querySelector(sel);

$("#year").textContent = new Date().getFullYear();

// Smooth scroll offset (for sticky header)
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (!id || id === "#") return;
    const el = document.querySelector(id);
    if (!el) return;

    e.preventDefault();
    const header = document.querySelector(".header");
    const y = el.getBoundingClientRect().top + window.scrollY - (header?.offsetHeight ?? 0) - 10;
    window.scrollTo({ top: y, behavior: "smooth" });
  });
});

// Hide sticky CTA while hero is visible (optional nicety)
const sticky = $("#stickyCta");
const hero = $(".hero");
if (sticky && hero) {
  const io = new IntersectionObserver(([entry]) => {
    // if hero visible -> hide sticky, else show (only on mobile CSS shows it anyway)
    sticky.style.opacity = entry.isIntersecting ? "0" : "1";
    sticky.style.pointerEvents = entry.isIntersecting ? "none" : "auto";
  }, { threshold: 0.35 });
  io.observe(hero);
}

// Contact form submit
const form = $("#contactForm");
const msg = $("#formMsg");

function setMsg(text, ok = true) {
  msg.textContent = text;
  msg.style.color = ok ? "rgba(15,23,42,.70)" : "rgba(190,18,60,.95)";
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMsg("Se trimite…");

    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());

    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.ok) {
        setMsg(data.error || "A apărut o problemă. Încearcă din nou.", false);
        return;
      }

      form.reset();
      setMsg("Mulțumim! Am primit mesajul și revenim cât mai curând.");
    } catch (err) {
      setMsg("Conexiune eșuată. Încearcă din nou.", false);
    }
  });
}