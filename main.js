const revealTargets = document.querySelectorAll(
  ".section-title, .section-copy, .fiesta-points, .carousel, .dj-shot, .dj-roster, .scene-panel, .fotos .btn"
);

revealTargets.forEach((el) => el.classList.add("reveal"));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
);

revealTargets.forEach((el) => observer.observe(el));

const header = document.querySelector(".site-header");
let lastY = window.scrollY;

window.addEventListener(
  "scroll",
  () => {
    const y = window.scrollY;
    if (!header) return;

    header.classList.toggle("is-solid", y > 40);
    const hide = y > lastY && y > 140;
    header.style.opacity = hide ? "0" : "1";
    header.style.pointerEvents = hide ? "none" : "auto";
    lastY = y;
  },
  { passive: true }
);
