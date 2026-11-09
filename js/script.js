/* =========================================
   Portfolio interactions
   ========================================= */

// ---- Grab the elements we need ----
const header = document.getElementById('header');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// ---- 1. Mobile menu open / close ----
function setMenu(isOpen) {
  navMenu.classList.toggle('open', isOpen);
  navToggle.classList.toggle('active', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
}

navToggle.addEventListener('click', () => {
  setMenu(!navMenu.classList.contains('open'));
});

// Close the menu after tapping a link
navLinks.forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

// Close the menu with the Escape key
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

// ---- 2. Header gets a shadow after scrolling ----
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
});

// ---- 3. Highlight the nav link of the section you're viewing ----
const sections = document.querySelectorAll('main section[id]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  },
  { rootMargin: '-45% 0px -50% 0px' } // a section is "current" when it crosses the middle of the screen
);
sections.forEach((section) => sectionObserver.observe(section));

// ---- 4. Fade-in animation when elements scroll into view ----
const revealTargets = document.querySelectorAll(
  '.hero-text, .hero-visual, .section-heading, .about-text, .about-card, ' +
  '.skill-card, .project-card, .contact-card'
);
revealTargets.forEach((el) => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // animate only once
      }
    });
  },
  { threshold: 0.15 }
);
revealTargets.forEach((el) => revealObserver.observe(el));

// ---- 5. Automatic footer year ----
document.getElementById('year').textContent = new Date().getFullYear();

// ---- 6. Reset the mobile menu if the window becomes wide ----
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) setMenu(false);
});