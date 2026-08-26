/* ═══════════════════════════════════════════════════════
   PORTFOLIO DATA
   To add a new project:
     1. Copy your image to assets/img/
     2. Add a new <figure class="portfolio-item" data-index="N"> in index.html
     3. Add an entry here at index N with your image path, title, type, and link
═══════════════════════════════════════════════════════ */
const portfolioData = [
  {
    src: 'assets/img/lobby.jpg',
    title: 'Hotel Lobby Design',
    type: '3D Interior Visualization',
    link: 'https://www.behance.net'   // ← replace with your real Behance project URL
  },
  {
    src: 'assets/img/majliss.jpg',
    title: 'Majliss Traditional Lounge',
    type: 'Interior Design Concept',
    link: 'https://www.behance.net'
  },
  {
    src: 'assets/img/hotel-room.jpg',
    title: 'Royal Hotel Suite',
    type: 'Hospitality Interior Rendering',
    link: 'https://www.behance.net'
  },
  {
    src: 'assets/img/hall-entree.jpg',
    title: 'Grand Entrance Hall',
    type: 'Residential Visualization',
    link: 'https://www.behance.net'
  },
  {
    src: 'assets/img/salle-a-manger.jpg',
    title: 'Modern Dining Room',
    type: 'Interior Rendering',
    link: 'https://www.behance.net'
  },
  {
    src: 'assets/img/perspective-1.jpg',
    title: 'Architectural Perspective I',
    type: 'Exterior Visualization',
    link: 'https://www.behance.net'
  },
  {
    src: 'assets/img/perspective-2.jpg',
    title: 'Architectural Perspective II',
    type: '3D Architectural View',
    link: 'https://www.behance.net'
  },
  {
    src: 'assets/img/perspective-3.jpg',
    title: 'Architectural Perspective III',
    type: 'Exterior Rendering',
    link: 'https://www.behance.net'
  }
];

/* ═══════════════════════════════════════════════════════
   DOM READY
═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* ── Preloader ── */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader.classList.add('hide'), 320);
  });

  /* ── Year ── */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ── Scroll: header, back-to-top, progress bar ── */
  const header   = document.getElementById('header');
  const backTop  = document.getElementById('backToTop');
  const progress = document.getElementById('scrollProgress');

  window.addEventListener('scroll', () => {
    const scrollY   = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    header.classList.toggle('scrolled', scrollY > 40);
    backTop.classList.toggle('show', scrollY > 500);
    progress.style.width = (scrollY / docHeight * 100) + '%';
  });

  /* ── Mobile nav ── */
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  /* ── Active nav link ── */
  const sections   = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.45 }).observe.bind(
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          navAnchors.forEach(a => a.classList.remove('active'));
          const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    }, { threshold: 0.4 })
  );

  const navIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => navIO.observe(s));

  /* ── Typing effect ── */
  const roles = [
    'CAD Drafter',
    '3D Visualization Designer',
    'AutoCAD & Revit Specialist',
    'Architectural Renderer',
    '3ds Max & Cinema 4D Artist'
  ];
  const typedEl = document.querySelector('.typed-text');
  let roleIdx = 0, charIdx = 0, deleting = false;
  function typeLoop() {
    const word = roles[roleIdx];
    if (!deleting) {
      typedEl.textContent = word.slice(0, ++charIdx);
      if (charIdx === word.length) {
        deleting = true;
        return setTimeout(typeLoop, 1800);
      }
    } else {
      typedEl.textContent = word.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
      }
    }
    setTimeout(typeLoop, deleting ? 38 : 75);
  }
  typeLoop();

  /* ── Scroll reveal + counters + language bars ── */
  const aosEls   = document.querySelectorAll('[data-aos]');
  const statH3s  = document.querySelectorAll('.stat-card h3[data-count]');
  const langBars = document.querySelectorAll('.bar i');
  let countersRan = false, barsRan = false;

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    let current  = 0;
    const step   = Math.ceil(target / 50);
    const tick   = () => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current < target) requestAnimationFrame(tick);
    };
    tick();
  }

  const aosIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in-view');

      if (e.target.closest('.about-stats') && !countersRan) {
        countersRan = true;
        statH3s.forEach(animateCounter);
      }
      if (e.target.classList.contains('languages') && !barsRan) {
        barsRan = true;
        langBars.forEach(b => {
          const target = b.style.width;
          b.style.width = '0%';
          requestAnimationFrame(() => { b.style.width = target; });
        });
      }
      aosIO.unobserve(e.target);
    });
  }, { threshold: 0.18 });
  aosEls.forEach(el => aosIO.observe(el));

  /* ══════════════════════════════════════════
     LIGHTBOX CAROUSEL
  ══════════════════════════════════════════ */
  const lightbox  = document.getElementById('lightbox');
  const overlay   = document.getElementById('lbOverlay');
  const lbImg     = document.getElementById('lbImg');
  const lbTitle   = document.getElementById('lbTitle');
  const lbSubtitle= document.getElementById('lbSubtitle');
  const lbLink    = document.getElementById('lbViewLink');
  const lbCurrent = document.getElementById('lbCurrent');
  const lbTotal   = document.getElementById('lbTotal');
  const lbDots    = document.getElementById('lbDots');
  const lbClose   = document.getElementById('lbClose');
  const lbPrev    = document.getElementById('lbPrev');
  const lbNext    = document.getElementById('lbNext');

  let currentIdx  = 0;
  const total     = portfolioData.length;

  /* Build dots */
  lbTotal.textContent = total;
  portfolioData.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'lb-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to image ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    lbDots.appendChild(dot);
  });

  function getDots() { return lbDots.querySelectorAll('.lb-dot'); }

  function goTo(idx) {
    currentIdx = (idx + total) % total;
    const data = portfolioData[currentIdx];

    lbImg.classList.add('loading');
    const tmp = new Image();
    tmp.onload = () => {
      lbImg.src = data.src;
      lbImg.alt = data.title;
      lbImg.classList.remove('loading');
    };
    tmp.src = data.src;

    lbTitle.textContent     = data.title;
    lbSubtitle.textContent  = data.type;
    lbLink.href             = data.link;
    lbCurrent.textContent   = currentIdx + 1;

    getDots().forEach((d, i) => d.classList.toggle('active', i === currentIdx));
  }

  function openLightbox(idx) {
    goTo(idx);
    lightbox.hidden = false;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  /* Portfolio item click → open lightbox */
  document.querySelectorAll('.portfolio-item').forEach(item => {
    item.addEventListener('click', () => {
      openLightbox(parseInt(item.dataset.index, 10));
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => goTo(currentIdx - 1));
  lbNext.addEventListener('click', () => goTo(currentIdx + 1));

  /* Keyboard navigation */
  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape')       closeLightbox();
    if (e.key === 'ArrowLeft')    goTo(currentIdx - 1);
    if (e.key === 'ArrowRight')   goTo(currentIdx + 1);
  });

  /* Touch / swipe support */
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(currentIdx + (diff > 0 ? 1 : -1));
  });

  /* ── Contact form → opens Gmail compose ── */
  window.handleFormSubmit = function(e) {
    e.preventDefault();
    const name    = document.getElementById('fname').value.trim();
    const subject = document.getElementById('fsubject').value.trim() || 'Portfolio Inquiry';
    const message = document.getElementById('fmessage').value.trim();
    const body    = `Hi Abdelhak,\n\nMy name is ${name}.\n\n${message}`;
    const url     = `https://mail.google.com/mail/?view=cm&fs=1&to=abdelhak.haddani@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

});
