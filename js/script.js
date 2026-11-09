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
    '.skill-card, .project-card, .activity-card, .contact-card'
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

// ---- 7. GitHub contribution calendar ----
const GITHUB_USERNAME = 'proddatoorisanjeevreddy-oss';
const calendarBox = document.getElementById('contrib-calendar');
const summaryBox = document.getElementById('contrib-summary');

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Turn "2026-11-09" into a real Date (the T00:00:00 avoids timezone surprises)
function toDate(dateString) {
  return new Date(dateString + 'T00:00:00');
}

async function loadContributions() {
  try {
    const url = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Request failed with status ' + response.status);

    const data = await response.json();
    drawCalendar(data.contributions);
  } catch (error) {
    console.error('Could not load contributions:', error);
    calendarBox.textContent = 'Contributions could not be loaded right now. Please visit my GitHub profile instead.';
    summaryBox.textContent = '';
  }
}

function drawCalendar(days) {
  // 1. Total contributions in the last year
  const total = days.reduce((sum, day) => sum + day.count, 0);
  summaryBox.textContent = total.toLocaleString('en') + ' contributions in the last year';

  // 2. The first column must start on a Sunday, so add empty squares before the first day
  const padding = toDate(days[0].date).getDay(); // 0 = Sunday ... 6 = Saturday

  let cellsHTML = '';
  for (let i = 0; i < padding; i++) {
    cellsHTML += '<span class="contrib-cell empty"></span>';
  }

  // 3. One square per day; the level (0-4) picks the olive shade
  days.forEach((day) => {
    const word = day.count === 1 ? 'contribution' : 'contributions';
    const niceDate = toDate(day.date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
    cellsHTML += `<span class="contrib-cell level-${day.level}" title="${day.count} ${word} on ${niceDate}"></span>`;
  });

  // 4. Month labels: one slot per week column, filled when a new month starts
  const totalWeeks = Math.ceil((padding + days.length) / 7);
  const labels = [];
  let lastMonth = -1;
  for (let week = 0; week < totalWeeks; week++) {
    const firstDayOfWeek = days[Math.max(week * 7 - padding, 0)];
    const month = toDate(firstDayOfWeek.date).getMonth();
    labels.push(month !== lastMonth ? MONTH_NAMES[month] : '');
    lastMonth = month;
  }
  // Avoid two labels overlapping at the very start
  if (labels[1] || labels[2]) labels[0] = '';

  const monthsHTML = labels.map((label) => `<span>${label}</span>`).join('');

  // 5. Put everything on the page
  calendarBox.innerHTML = `
    <div class="contrib-wrap">
      <div class="contrib-days">
        <span></span><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span>
      </div>
      <div>
        <div class="contrib-months">${monthsHTML}</div>
        <div class="contrib-grid">${cellsHTML}</div>
      </div>
    </div>
    <div class="contrib-legend">
      <span>Less</span>
      <span class="contrib-cell level-0"></span>
      <span class="contrib-cell level-1"></span>
      <span class="contrib-cell level-2"></span>
      <span class="contrib-cell level-3"></span>
      <span class="contrib-cell level-4"></span>
      <span>More</span>
    </div>
  `;

  // 6. On phones, scroll to the right so the most recent weeks are visible first
  const scrollBox = calendarBox.parentElement;
  scrollBox.scrollLeft = scrollBox.scrollWidth;
}

// Only run if the section exists on the page
if (calendarBox && summaryBox) {
  loadContributions();
}