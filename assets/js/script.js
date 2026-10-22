(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* ---- Theme toggle (remembered; safe if storage is blocked) ---- */
  const themeBtn = $('#themeBtn');
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    themeBtn && themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    const m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', t === 'dark' ? '#070c18' : '#f5f7fb');
  }
  setTheme(root.getAttribute('data-theme') || 'dark');
  themeBtn && themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('caleb-theme', next); } catch (e) {}
  });

  /* ---- Nav: scrolled state, progress bar, active link, back-to-top ---- */
  const nav = $('#nav'), bar = $('#progress'), toTop = $('#toTop');
  const links = $$('#navLinks a[href^="#"]');
  const sections = links.map(l => $(l.getAttribute('href'))).filter(Boolean);
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 24);
    toTop.classList.toggle('show', y > 600);
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    let cur = '';
    const line = 130;
    sections.forEach(s => { if (s.getBoundingClientRect().top <= line) cur = s.id; });
    if (innerHeight + y >= document.documentElement.scrollHeight - 4) cur = sections[sections.length - 1].id;
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + cur));
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* ---- Mobile menu ---- */
  const toggle = $('#navToggle');
  const closeMenu = () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.firstElementChild.className = 'fa-solid fa-bars'; };
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.firstElementChild.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  });
  links.forEach(l => l.addEventListener('click', closeMenu));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ---- Reveal on scroll ---- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---- Card spotlight (fine pointers only) ---- */
  if (matchMedia('(pointer:fine)').matches && !reduce) {
    $$('.card').forEach(c => c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }));
  }

  /* ---- Case-study dialogs ---- */
  function openCase(id) {
    const d = document.getElementById(id);
    if (!d) return;
    if (typeof d.showModal === 'function') { d.showModal(); document.body.style.overflow = 'hidden'; }
  }
  $$('[data-case]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); openCase(b.dataset.case); }));
  $$('dialog.case').forEach(d => {
    d.addEventListener('click', e => { if (e.target === d) d.close(); });       // click on backdrop
    d.addEventListener('close', () => { document.body.style.overflow = ''; });
    $$('[data-close]', d).forEach(b => b.addEventListener('click', () => d.close()));
  });

  /* ---- Copy email ---- */
  const toast = $('#toast');
  let tt;
  function say(msg) { toast.textContent = msg; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('show'), 2200); }
  const copyBtn = $('#copyEmail');
  copyBtn && copyBtn.addEventListener('click', async () => {
    const mail = copyBtn.dataset.email;
    try { await navigator.clipboard.writeText(mail); say('Email copied to clipboard'); }
    catch (e) {
      const t = document.createElement('textarea'); t.value = mail; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); say('Email copied to clipboard'); } catch (_) { say(mail); }
      t.remove();
    }
  });

  $('#yr').textContent = new Date().getFullYear();
})();
