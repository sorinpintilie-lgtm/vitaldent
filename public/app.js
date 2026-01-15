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
    const header = document.querySelector(".header-desktop") || document.querySelector(".header-mobile");
    const isDesktop = window.innerWidth >= 1024;
    const offset = isDesktop ? 35 : (header?.offsetHeight ?? 0) + 10;
    const y = el.getBoundingClientRect().top + window.scrollY - offset;
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

// Hamburger menu toggle
const hamburger = $(".hamburger");
const nav = $(".nav");
if (hamburger && nav) {
  hamburger.addEventListener("click", () => {
    nav.classList.toggle("nav-open");
    hamburger.classList.toggle("open");
  });
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

// Carousel functionality
function initCarousels() {
  document.querySelectorAll('.carousel').forEach(carousel => {
    // Initialize scroll functionality for all carousels
    // Button controls are only shown on mobile via CSS
    const container = carousel.querySelector('.carousel-container');
    const grid = container.querySelector('.grid') || container.querySelector('.reviews');
    const cards = grid.children;
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    const dotsContainer = carousel.querySelector('.carousel-dots');

    let currentIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;

    // Create dots
    for (let i = 0; i < cards.length; i++) {
      const dot = document.createElement('button');
      dot.className = 'dot';
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }

    const dots = dotsContainer.querySelectorAll('.dot');

    function updateDots() {
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    function goToSlide(index) {
      currentIndex = index;
      grid.style.transform = `translateX(-${index * 100}%)`;
      updateDots();
    }

    // Wheel event for mouse scrolling
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        if (e.deltaX > 0) {
          // Scroll right - next slide
          currentIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
        } else {
          // Scroll left - previous slide
          currentIndex = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
        }
        goToSlide(currentIndex);
      }
    }, { passive: false });

    // Touch events for swipe gestures
    container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const swipeThreshold = 50; // minimum distance for swipe
      const swipeDistance = touchStartX - touchEndX;

      if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
          // Swipe left - next slide
          currentIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
        } else {
          // Swipe right - previous slide
          currentIndex = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
        }
        goToSlide(currentIndex);
      }
    }

    prevBtn.addEventListener('click', () => {
      currentIndex = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
      goToSlide(currentIndex);
    });

    nextBtn.addEventListener('click', () => {
      currentIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
      goToSlide(currentIndex);
    });
  });
}

initCarousels();