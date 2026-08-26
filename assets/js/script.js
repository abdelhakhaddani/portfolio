/* ═══════════════════════════════════════════════════════════════
   HOW TO ADD A NEW PROJECT — only 2 steps:

   STEP 1 → Create a folder inside:
            assets/img/Your Project Name/

   STEP 2 → Drop your images into that folder.

   Then push to GitHub — the website updates automatically.
   The folder name becomes the project title.
═══════════════════════════════════════════════════════════════ */

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
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navAnchors.forEach(a => a.classList.remove('active'));
      const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (a) a.classList.add('active');
    });
  }, { threshold: 0.4 });
  sections.forEach(s => io.observe(s));

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

  /* ══════════════════════════════════════════════════════════════
     PORTFOLIO — loaded from assets/data/projects.json
     Each project = one folder in assets/img/<Project Name>/
     Folder name  → card title
     First image  → cover thumbnail
     All images   → lightbox carousel for that project
  ══════════════════════════════════════════════════════════════ */

  const grid     = document.getElementById('portfolioGrid');
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

  let projects = [];      // full list of projects from JSON
  let activeProject = null;  // currently open project in lightbox
  let imgIdx = 0;         // current image index within the active project

  /* ── Build dots for lightbox ── */
  function buildDots(count) {
    lbDots.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const d = document.createElement('button');
      d.className = 'lb-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', `Image ${i + 1}`);
      d.addEventListener('click', () => goToImg(i));
      lbDots.appendChild(d);
    }
  }

  /* ── Navigate within the active project ── */
  function goToImg(i) {
    const total = activeProject.images.length;
    imgIdx = (i + total) % total;
    const src = `assets/img/${activeProject.folder}/${activeProject.images[imgIdx]}`;
    lbImg.classList.add('loading');
    const tmp = new Image();
    tmp.onload = () => { lbImg.src = src; lbImg.alt = activeProject.title; lbImg.classList.remove('loading'); };
    tmp.src = src;
    lbCur.textContent   = imgIdx + 1;
    lbTotal.textContent = total;
    lbDots.querySelectorAll('.lb-dot').forEach((dot, j) => dot.classList.toggle('active', j === imgIdx));
  }

  /* ── Open lightbox for a project ── */
  function openProject(projectIndex) {
    activeProject = projects[projectIndex];
    imgIdx = 0;
    lbTitle.textContent = activeProject.title;
    lbSub.textContent   = activeProject.type || 'Interior Design';
    if (lbLink) lbLink.href = '#';
    buildDots(activeProject.images.length);
    goToImg(0);
    lightbox.hidden = false;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    activeProject = null;
  }

  /* ── Wire up controls ── */
  lbClose.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => goToImg(imgIdx - 1));
  lbNext.addEventListener('click', () => goToImg(imgIdx + 1));

  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  goToImg(imgIdx - 1);
    if (e.key === 'ArrowRight') goToImg(imgIdx + 1);
  });

  /* Swipe support */
  let tx = 0;
  lightbox.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend',   e => {
    const diff = tx - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goToImg(imgIdx + (diff > 0 ? 1 : -1));
  });

  /* ── Click on grid card ── */
  grid.addEventListener('click', e => {
    const item = e.target.closest('.portfolio-item');
    if (item) openProject(+item.dataset.index);
  });

  /* ── Fetch projects and build grid ── */
  fetch('assets/data/projects.json')
    .then(r => r.json())
    .then(data => {
      projects = data;

      projects.forEach((project, i) => {
        const coverSrc = `assets/img/${project.folder}/${project.cover}`;
        const typeLabel = project.type || 'Interior Design';

        const fig = document.createElement('figure');
        fig.className = 'portfolio-item';
        fig.dataset.index = i;
        fig.setAttribute('data-aos', '');
        fig.innerHTML = `
          <img src="${coverSrc}" alt="${project.title}" loading="lazy">
          <figcaption>
            <div class="fig-text">
              <h4>${project.title}</h4>
              <p>${typeLabel}</p>
            </div>
            ${project.images.length > 1 ? `<span class="img-count">+${project.images.length - 1} more</span>` : ''}
          </figcaption>`;
        grid.appendChild(fig);
      });

      /* Re-observe new portfolio items for scroll reveal */
      grid.querySelectorAll('[data-aos]').forEach(el => aosIO.observe(el));
    })
    .catch(err => {
      console.error('Could not load projects.json:', err);
      grid.innerHTML = '<p style="color:var(--gold);text-align:center;padding:2rem">Projects loading…</p>';
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
