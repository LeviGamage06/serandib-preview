/* Progressive motion for a static website. No libraries, timers or scroll hijacking. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 761px)');
  const controls = [...document.querySelectorAll('[data-motion-toggle]')];
  const progress = document.createElement('div');
  progress.className = 'reading-line';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  const header = document.querySelector('body > header');
  const running = new Set();
  const images = [...document.querySelectorAll('[data-parallax]')];
  const activeImages = new Set();
  let paused = window.Serandib?.storage.read('motion-paused', false) === true;
  let frame = 0;
  const enabled = () => !paused && !reduced.matches;
  function cancelRunning() {
    for (const animation of running) animation.cancel();
    running.clear();
  }
  function animate(element, keyframes, options) {
    if (!enabled() || typeof element.animate !== 'function') return;
    const animation = element.animate(keyframes, options);
    running.add(animation);
    animation.onfinish = animation.oncancel = () => running.delete(animation);
  }
  function paint() {
    frame = 0;
    header?.classList.toggle('is-scrolled', scrollY > 24);
    const travel = document.documentElement.scrollHeight - innerHeight;
    progress.style.setProperty('--reading-progress', travel > 0 ? String(Math.min(1, Math.max(0, scrollY / travel))) : '0');
    if (!enabled() || !desktop.matches || document.hidden) return;
    for (const img of activeImages) {
      const rect = img.parentElement.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (innerHeight / 2 - (rect.top + rect.height / 2)) / innerHeight));
      img.style.setProperty('--parallax', (progress * Number(img.dataset.parallax)).toFixed(2) + 'px');
    }
  }
  function schedule() { if (!frame && !document.hidden) frame = requestAnimationFrame(paint); }
  function sync() {
    cancelRunning();
    root.dataset.motion = enabled() ? 'on' : 'off';
    controls.forEach(button => {
      button.hidden = false;
      button.disabled = reduced.matches;
      button.setAttribute('aria-pressed', String(!enabled()));
      button.textContent = reduced.matches ? 'Reduced motion' : paused ? 'Play motion  ▷' : 'Pause motion  Ⅱ';
      button.title = reduced.matches ? 'Following your device’s reduced-motion setting' : 'Turn decorative animations on or off';
    });
    images.forEach(img => img.style.removeProperty('--parallax'));
    schedule();
  }
  controls.forEach(button => button.addEventListener('click', () => {
    paused = !paused;
    window.Serandib?.storage.write('motion-paused', paused);
    sync();
  }));
  sync();
  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        reveal.unobserve(entry.target);
        if (entry.boundingClientRect.bottom < 0 || entry.target.contains(document.activeElement)) return;
        animate(entry.target, [{opacity:.08, transform:'translateY(28px)'}, {opacity:1, transform:'translateY(0)'}], {
          duration:1000, delay:Number(entry.target.dataset.revealDelay || 0), easing:'cubic-bezier(.22,1,.36,1)'
        });
      });
    }, {threshold:.08, rootMargin:'0px 0px -25px 0px'});
    const targets = document.querySelectorAll('.section-head,.home-discovery>div,.home-venue-form,.principles article,.service-grid article,.story-trio>a,.tradition-copy,.tradition-portrait,.steps article,.founder-mark,.founders>div:last-child,.faq>div:first-child,.enquire>div,.guide-grid article,.folio-chapter-heading,.folio-photo,.folio-scene-copy,.memory-words,.memory-image,.memory-note');
    targets.forEach(el => {
      const siblings = Array.from(el.parentElement.children);
      if (el.matches('.principles article,.service-grid article,.steps article,.guide-grid article')) el.dataset.revealDelay = String(Math.min(siblings.indexOf(el) * 90, 270));
      reveal.observe(el);
    });
    const visibility = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) activeImages.add(entry.target); else activeImages.delete(entry.target);
      }
      schedule();
    }, {rootMargin:'100px'});
    images.forEach(img => visibility.observe(img));
    window.addEventListener('pagehide', () => { cancelRunning(); cancelAnimationFrame(frame); frame = 0; });
  }
  document.querySelector('.destination-tabs')?.addEventListener('click', event => {
    if (!event.target.closest('[role="tab"]')) return;
    const panel = document.getElementById('setting');
    if (panel) animate(panel, [{opacity:.2, transform:'translateY(10px)'}, {opacity:1, transform:'translateY(0)'}], {duration:500, easing:'cubic-bezier(.22,1,.36,1)'});
  });
  const menu = document.querySelector('.menu'), nav = document.getElementById('nav');
  if (menu && nav) {
    const close = () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); };
    document.addEventListener('click', event => { if (!event.target.closest('header')) close(); });
    matchMedia('(min-width: 1001px)').addEventListener('change', event => { if (event.matches) close(); });
  }
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule, {passive:true});
  window.addEventListener('pageshow', schedule);
  reduced.addEventListener('change', sync);
  desktop.addEventListener('change', sync);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelRunning(); cancelAnimationFrame(frame); frame = 0; }
    else schedule();
  });
})();
