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

    const isReviews = carousel.dataset.carousel === 'reviews';
    const isDesktop = window.innerWidth >= 1024;

    if (isReviews && isDesktop) {
      // Continuous conveyor belt animation
      carousel.querySelector('.carousel-controls').style.display = 'none';

      // Duplicate cards for seamless loop
      const originalCards = Array.from(cards);
      originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        grid.appendChild(clone);
      });

      // Set grid width to 200% for duplication
      grid.style.width = '200%';

      // Add continuous animation
      grid.style.animation = 'slide 20s linear infinite';

      // Pause on hover
      container.addEventListener('mouseenter', () => grid.style.animationPlayState = 'paused');
      container.addEventListener('mouseleave', () => grid.style.animationPlayState = 'running');

      // No further logic needed for continuous animation
      return;
    }

    // Standard carousel logic for other cases
    const visibleCards = 1;
    const maxIndex = cards.length - visibleCards + 1;

    let currentIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    let autoSlideInterval;

    // Create dots
    for (let i = 0; i < maxIndex; i++) {
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
      const translatePercent = (100 / visibleCards) * index;
      grid.style.transform = `translateX(-${translatePercent}%)`;
      updateDots();
    }

    // Wheel event for mouse scrolling
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        if (e.deltaX > 0) {
          // Scroll right - next slide
          currentIndex = (currentIndex + 1) % maxIndex;
        } else {
          // Scroll left - previous slide
          currentIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex - 1;
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
          currentIndex = (currentIndex + 1) % maxIndex;
        } else {
          // Swipe right - previous slide
          currentIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex - 1;
        }
        goToSlide(currentIndex);
      }
    }

    prevBtn.addEventListener('click', () => {
      currentIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex - 1;
      goToSlide(currentIndex);
    });

    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % maxIndex;
      goToSlide(currentIndex);
    });
  });
}

initCarousels();

// Entrance animations on scroll
function initAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Trigger animations for elements already in view
  const triggerInitialAnimations = () => {
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('animated');
        observer.unobserve(el);
      }
    });
  };

  // Add animation classes to elements
  document.querySelectorAll('.section, .band, .cta-band, .footer, .promo-bar, .header, .hero').forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
  });

  // Special animations for hero elements
  document.querySelectorAll('.hero-copy > *, .hero-highlight').forEach((el, index) => {
    el.classList.add('animate-on-scroll', 'slide-left');
    el.style.transitionDelay = `${index * 0.2}s`;
    observer.observe(el);
  });

  // Cards in carousels
  document.querySelectorAll('.card, .review').forEach(el => {
    el.classList.add('animate-on-scroll', 'scale-in');
    observer.observe(el);
  });

  // Stats in about section
  document.querySelectorAll('.stat').forEach(el => {
    el.classList.add('animate-on-scroll', 'slide-up');
    observer.observe(el);
  });

  // Contact items
  document.querySelectorAll('.contact-item').forEach(el => {
    el.classList.add('animate-on-scroll', 'slide-left');
    observer.observe(el);
  });

  // Form elements
  document.querySelector('.form').classList.add('animate-on-scroll', 'slide-right');
  observer.observe(document.querySelector('.form'));

  // Trigger initial animations
  triggerInitialAnimations();
}

initAnimations();

// Immediate animations for top elements
setTimeout(() => {
  document.querySelector('.promo-bar').classList.add('animated');
  document.querySelector('.header').classList.add('animated');
  document.querySelector('.hero').classList.add('animated');
}, 100);