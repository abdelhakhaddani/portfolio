/* ═══════════════════════════════════════════════════════
   PORTFOLIO DATA
   To add a new project:
     1. Copy image to assets/img/
     2. Add <figure class="portfolio-item" data-index="N"> in index.html
     3. Add matching entry here at index N
═══════════════════════════════════════════════════════ */
const portfolioData = [
  { src:'assets/img/lobby.jpg',         title:'Hotel Lobby Design',         type:'3D Interior Visualization',    link:'https://www.behance.net/abdelhakhaddani' },
  { src:'assets/img/majliss.jpg',       title:'Majliss Traditional Lounge', type:'Interior Design Concept',      link:'https://www.behance.net/abdelhakhaddani' },
  { src:'assets/img/hotel-room.jpg',    title:'Royal Hotel Suite',          type:'Hospitality Interior Rendering',link:'https://www.behance.net/abdelhakhaddani' },
  { src:'assets/img/hall-entree.jpg',   title:'Grand Entrance Hall',        type:'Residential Visualization',    link:'https://www.behance.net/abdelhakhaddani' },
  { src:'assets/img/salle-a-manger.jpg',title:'Modern Dining Room',         type:'Interior Rendering',           link:'https://www.behance.net/abdelhakhaddani' },
  { src:'assets/img/perspective-1.jpg', title:'Architectural Perspective I', type:'Exterior Visualization',      link:'https://www.behance.net/abdelhakhaddani' },
  { src:'assets/img/perspective-2.jpg', title:'Architectural Perspective II',type:'3D Architectural View',       link:'https://www.flipsnack.com/abdelhakhaddani/abdelhak-haddani-portfolio.html' },
  { src:'assets/img/perspective-3.jpg', title:'Architectural Perspective III',type:'Exterior Rendering',         link:'https://haddani.weebly.com/' }
];

document.addEventListener('DOMContentLoaded', () => {

  /* ── Preloader ── */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => setTimeout(() => preloader.classList.add('hide'), 320));

  /* ── Year ── */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ── Scroll: header + back-to-top + progress bar ── */
  const header  = document.getElementById('header');
  const backTop = document.getElementById('backToTop');
  const bar     = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    const y   = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 40);
    backTop.classList.toggle('show', y > 500);
    bar.style.width = (y / max * 100) + '%';
  });

  /* ── Mobile nav ── */
  const toggle   = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    toggle.classList.remove('open');
    navLinks.classList.remove('open');
  }));

  /* ── Active nav highlight ── */
  const sections   = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navAnchors.forEach(a => a.classList.remove('active'));
      const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (a) a.classList.add('active');
    });
  }, { threshold: 0.4 }).observe ? (() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        navAnchors.forEach(a => a.classList.remove('active'));
        const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (a) a.classList.add('active');
      });
    }, { threshold: 0.4 });
    sections.forEach(s => io.observe(s));
  })() : null;

  /* ── Typing effect ── */
  const roles = [
    'CAD Drafter',
    '3D Visualization Designer',
    'AutoCAD & Revit Specialist',
    'Architectural Renderer',
    '3ds Max & Cinema 4D Artist'
  ];
  const typedEl = document.querySelector('.typed-text');
  let ri = 0, ci = 0, del = false;
  function typeLoop() {
    const word = roles[ri];
    typedEl.textContent = del ? word.slice(0, --ci) : word.slice(0, ++ci);
    if (!del && ci === word.length) { del = true; return setTimeout(typeLoop, 1800); }
    if (del && ci === 0)            { del = false; ri = (ri + 1) % roles.length; }
    setTimeout(typeLoop, del ? 38 : 75);
  }
  typeLoop();

  /* ── Scroll reveal + counters + language bars ── */
  const aosEls  = document.querySelectorAll('[data-aos]');
  const statH3s = document.querySelectorAll('.stat-card h3[data-count]');
  const bars    = document.querySelectorAll('.bar i');
  let countersRan = false, barsRan = false;

  function animateCounter(el) {
    const target = +el.dataset.count;
    let n = 0;
    const step = Math.ceil(target / 50);
    (function tick() {
      n = Math.min(n + step, target);
      el.textContent = n;
      if (n < target) requestAnimationFrame(tick);
    })();
  }

  const aosIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in-view');
      if (e.target.closest('.about-stats') && !countersRan) {
        countersRan = true; statH3s.forEach(animateCounter);
      }
      if (e.target.classList.contains('languages') && !barsRan) {
        barsRan = true;
        bars.forEach(b => { const w = b.style.width; b.style.width = '0'; requestAnimationFrame(() => { b.style.width = w; }); });
      }
      aosIO.unobserve(e.target);
    });
  }, { threshold: 0.18 });
  aosEls.forEach(el => aosIO.observe(el));

  /* ══════════════════════════════════════════
     LIGHTBOX CAROUSEL
  ══════════════════════════════════════════ */
  const lightbox = document.getElementById('lightbox');
  const overlay  = document.getElementById('lbOverlay');
  const lbImg    = document.getElementById('lbImg');
  const lbTitle  = document.getElementById('lbTitle');
  const lbSub    = document.getElementById('lbSubtitle');
  const lbLink   = document.getElementById('lbViewLink');
  const lbCur    = document.getElementById('lbCurrent');
  const lbTotal  = document.getElementById('lbTotal');
  const lbDots   = document.getElementById('lbDots');
  const lbClose  = document.getElementById('lbClose');
  const lbPrev   = document.getElementById('lbPrev');
  const lbNext   = document.getElementById('lbNext');

  const total = portfolioData.length;
  let idx = 0;

  lbTotal.textContent = total;
  portfolioData.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'lb-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Image ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    lbDots.appendChild(d);
  });

  function goTo(i) {
    idx = (i + total) % total;
    const d = portfolioData[idx];
    lbImg.classList.add('loading');
    const tmp = new Image();
    tmp.onload = () => { lbImg.src = d.src; lbImg.alt = d.title; lbImg.classList.remove('loading'); };
    tmp.src = d.src;
    lbTitle.textContent = d.title;
    lbSub.textContent   = d.type;
    lbLink.href         = d.link;
    lbCur.textContent   = idx + 1;
    lbDots.querySelectorAll('.lb-dot').forEach((dot, j) => dot.classList.toggle('active', j === idx));
  }

  function open(i) {
    goTo(i);
    lightbox.hidden = false;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }
  function close() {
    lightbox.hidden = true;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.portfolio-item').forEach(item => {
    item.addEventListener('click', () => open(+item.dataset.index));
  });

  lbClose.addEventListener('click', close);
  overlay.addEventListener('click', close);
  lbPrev.addEventListener('click', () => goTo(idx - 1));
  lbNext.addEventListener('click', () => goTo(idx + 1));

  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  goTo(idx - 1);
    if (e.key === 'ArrowRight') goTo(idx + 1);
  });

  /* Swipe support */
  let tx = 0;
  lightbox.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend',   e => {
    const diff = tx - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(idx + (diff > 0 ? 1 : -1));
  });

  /* ── Contact form → opens WhatsApp ── */
  window.handleFormSubmit = function(e) {
    e.preventDefault();
    const name    = document.getElementById('fname').value.trim();
    const subject = document.getElementById('fsubject').value.trim() || 'Portfolio Inquiry';
    const message = document.getElementById('fmessage').value.trim();
    const text    = `Hi Abdelhak! 👋\n\nMy name is ${name}.\nSubject: ${subject}\n\n${message}`;
    window.open(`https://wa.me/13322604690?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

});
