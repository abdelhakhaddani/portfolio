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
    resetZoom();                         // always reset zoom on image change
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
    lbSub.textContent   = activeProject.featured
      ? 'Technical Drawings · AutoCAD & Revit'
      : (activeProject.type || 'Interior Design');
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
    resetZoom();
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

  /* ── Pinch-to-zoom + pan + double-tap ── */
  /*
   * Transform used: translate(zoomX, zoomY) scale(zoomScale)
   * Applied order:  1) scale around element centre  2) translate
   * A pixel at image-local coords (px, py) relative to centre
   * appears in viewport at: (px*s + tx + cx,  py*s + ty + cy)
   * where (cx, cy) = element centre in viewport.
   *
   * Pivot-preserving zoom from finger midpoint (mx, my):
   *   rx = mx - cx  (midpoint relative to element centre)
   *   new_tx = rx - (rx - old_tx) * (new_s / old_s)
   *   new_ty = ry - (ry - old_ty) * (new_s / old_s)
   */
  const MIN_SCALE = 1, MAX_SCALE = 4;
  let zoomScale = 1;
  let zoomX = 0, zoomY = 0;
  let lastTap  = 0;
  let panActive = false;
  let panX0 = 0, panY0 = 0, ptx0 = 0, pty0 = 0;
  let pinchDist0 = 0, pinchScale0 = 1, pinchTx0 = 0, pinchTy0 = 0;
  let swipeTx = 0, swipeTy = 0;   // for nav-swipe tracking

  function applyTransform() {
    lbImg.style.transform = `translate(${zoomX}px,${zoomY}px) scale(${zoomScale})`;
    lbImg.classList.toggle('zoomed', zoomScale > 1);
  }

  function resetZoom() {
    zoomScale = 1; zoomX = 0; zoomY = 0;
    lbImg.style.transform = '';
    lbImg.classList.remove('zoomed');
  }

  /* Clamp pan so image edges don't go past the wrap */
  function clampPan() {
    const wrap = lbImg.parentElement;
    const maxX = (lbImg.offsetWidth  * (zoomScale - 1)) / 2;
    const maxY = (lbImg.offsetHeight * (zoomScale - 1)) / 2;
    zoomX = Math.min(maxX, Math.max(-maxX, zoomX));
    zoomY = Math.min(maxY, Math.max(-maxY, zoomY));
  }

  function getDist(t) {
    return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  }

  function pivotZoom(newScale, mx, my) {
    newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale));
    const rect = lbImg.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const rx = mx - cx, ry = my - cy;
    const ratio = newScale / zoomScale;
    zoomX = rx - (rx - zoomX) * ratio;
    zoomY = ry - (ry - zoomY) * ratio;
    zoomScale = newScale;
    if (zoomScale === 1) { zoomX = 0; zoomY = 0; }
    else                 { clampPan(); }
    applyTransform();
  }

  lbImg.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      e.preventDefault();
      pinchDist0  = getDist(e.touches);
      pinchScale0 = zoomScale;
      pinchTx0    = zoomX;
      pinchTy0    = zoomY;
      panActive   = false;
    } else if (e.touches.length === 1) {
      swipeTx = ptx0 = e.touches[0].clientX;
      swipeTy = pty0 = e.touches[0].clientY;
      panX0 = zoomX; panY0 = zoomY;
      panActive = (zoomScale > 1);

      // Double-tap to toggle zoom
      const now = Date.now();
      if (now - lastTap < 280) {
        e.preventDefault();
        if (zoomScale > 1) { resetZoom(); }
        else { pivotZoom(2.5, e.touches[0].clientX, e.touches[0].clientY); }
        lastTap = 0;
      } else { lastTap = now; }
    }
  }, { passive: false });

  lbImg.addEventListener('touchmove', e => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist     = getDist(e.touches);
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, pinchScale0 * (dist / pinchDist0)));
      const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      /* Restore state from pinch-start so each frame is computed from the same baseline */
      zoomScale = pinchScale0; zoomX = pinchTx0; zoomY = pinchTy0;
      pivotZoom(newScale, mx, my);
    } else if (e.touches.length === 1 && panActive) {
      e.preventDefault();
      zoomX = panX0 + (e.touches[0].clientX - ptx0);
      zoomY = panY0 + (e.touches[0].clientY - pty0);
      clampPan();
      applyTransform();
    }
  }, { passive: false });

  lbImg.addEventListener('touchend', e => {
    if (e.touches.length === 0 && !panActive && zoomScale === 1) {
      const diff = swipeTx - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goToImg(imgIdx + (diff > 0 ? 1 : -1));
    }
    panActive = false;
  }, { passive: true });

  /* ── Desktop: scroll-wheel zoom anywhere in the lightbox ── */
  lightbox.addEventListener('wheel', e => {
    if (lightbox.hidden) return;
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    pivotZoom(zoomScale * factor, e.clientX, e.clientY);
  }, { passive: false });

  /* ── Desktop: double-click to toggle zoom ── */
  lbImg.addEventListener('dblclick', e => {
    e.stopPropagation();
    if (zoomScale > 1) { resetZoom(); }
    else               { pivotZoom(2.5, e.clientX, e.clientY); }
  });

  /* ── Desktop: mouse drag to pan when zoomed ── */
  let mousePanning = false;
  let mousePanX0 = 0, mousePanY0 = 0, mousePanTx0 = 0, mousePanTy0 = 0;
  let mouseMoved = false;

  lbImg.addEventListener('mousedown', e => {
    if (e.button !== 0 || zoomScale <= 1) return;
    e.preventDefault();
    mousePanning = true;
    mouseMoved   = false;
    mousePanX0   = e.clientX;
    mousePanY0   = e.clientY;
    mousePanTx0  = zoomX;
    mousePanTy0  = zoomY;
  });

  window.addEventListener('mousemove', e => {
    if (!mousePanning) return;
    const dx = e.clientX - mousePanX0;
    const dy = e.clientY - mousePanY0;
    if (Math.abs(dx) + Math.abs(dy) > 3) mouseMoved = true;
    zoomX = mousePanTx0 + dx;
    zoomY = mousePanTy0 + dy;
    clampPan();
    applyTransform();
  });

  window.addEventListener('mouseup', () => { mousePanning = false; });

  /* ── Click on grid card ── */
  grid.addEventListener('click', e => {
    const item = e.target.closest('.portfolio-item');
    if (item) openProject(+item.dataset.index);
    const feat = e.target.closest('.portfolio-featured-card');
    if (feat) openProject(+feat.dataset.index);
  });

  /* ── Build the featured hero card (Details / Drafts) ── */
  function buildFeaturedCard(project, index) {
    const folder = project.folder;
    // Pick up to 4 images spread across the set for visual variety
    const picks = project.images.length <= 4
      ? project.images
      : [
          project.images[0],
          project.images[Math.floor(project.images.length * 0.33)],
          project.images[Math.floor(project.images.length * 0.66)],
          project.images[project.images.length - 1]
        ];

    const previewHTML = picks
      .map(img => `<img src="assets/img/${folder}/${img}" alt="${project.title}" loading="lazy">`)
      .join('');

    const card = document.createElement('div');
    card.className = 'portfolio-featured-card';
    card.dataset.index = index;
    card.setAttribute('data-aos', '');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Open ${project.title} gallery`);
    card.innerHTML = `
      <div class="feat-preview">${previewHTML}</div>
      <div class="feat-info">
        <span class="feat-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
          </svg>
          Technical Drawings &amp; Drafting
        </span>
        <h3 class="feat-title">Details, Plans<br>&amp; Construction Drafts</h3>
        <p class="feat-desc">
          Complete set of architectural construction documents — floor plans,
          elevations, wall sections, structural details, site plans, and working
          drawings produced in AutoCAD and Revit. This collection demonstrates
          precision drafting and full-project documentation from concept to
          construction-ready deliverable.
        </p>
        <div class="feat-meta">
          <div class="feat-stat">
            <span class="feat-stat-num">${project.images.length}</span>
            <span class="feat-stat-label">Sheets &amp; Details</span>
          </div>
          <div class="feat-stat">
            <span class="feat-stat-num">CAD</span>
            <span class="feat-stat-label">AutoCAD · Revit</span>
          </div>
        </div>
        <span class="feat-cta">
          Open full drawing set
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </span>
      </div>`;

    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openProject(index); });
    return card;
  }

  /* ── Fetch projects and build grid ── */
  fetch('assets/data/projects.json')
    .then(r => r.json())
    .then(data => {
      projects = data;

      projects.forEach((project, i) => {
        if (project.featured) {
          /* ── Featured hero card ── */
          const card = buildFeaturedCard(project, i);
          grid.appendChild(card);
        } else {
          /* ── Regular portfolio card ── */
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
        }
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
