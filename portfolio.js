(() => {
  const links = [...document.querySelectorAll('.folio-open')];
  const dialog = document.querySelector('.folio-dialog');
  if (!links.length || !dialog) return;
  const large = document.getElementById('folio-large');
  const caption = document.getElementById('folio-caption');
  const counter = document.getElementById('folio-counter');
  let current = 0;
  let opener;
  function show(index) {
    current = (index + links.length) % links.length;
    const link = links[current];
    large.src = link.href;
    large.alt = link.querySelector('img').alt;
    caption.textContent = link.dataset.caption;
    counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(links.length).padStart(2, '0')}`;
  }
  if (typeof dialog.showModal === 'function') {
    links.forEach((link, index) => link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      show(index);
      dialog.showModal();
      document.body.classList.add('folio-scroll-locked');
    }));
    dialog.querySelector('.folio-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('.folio-prev').addEventListener('click', () => show(current - 1));
    dialog.querySelector('.folio-next').addEventListener('click', () => show(current + 1));
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        show(current + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('folio-scroll-locked');
      opener?.focus({preventScroll: true});
    });
  }
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !motion.matches) {
    const items = [...document.querySelectorAll('[data-reveal]')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('folio-pending');
          entry.target.classList.add('folio-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: 0, rootMargin: '0px 0px -25px 0px'});
    items.forEach(item => { item.classList.add('folio-pending'); observer.observe(item); });
    motion.addEventListener('change', event => {
      if (event.matches) {
        observer.disconnect();
        items.forEach(item => item.classList.remove('folio-pending'));
      }
    });
  }
})();

// Small, scroll-linked movement keeps the portraits part of each scene.
(() => {
  if (!('requestAnimationFrame' in window) || !('IntersectionObserver' in window)) return;
  const scenes = [...document.querySelectorAll('.folio-scene')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compact = window.matchMedia('(max-width: 750px)');
  const active = new Set();
  let scheduled = false;
  function paint() {
    scheduled = false;
    active.forEach(scene => {
      const photo = scene.querySelector('.folio-photo');
      if (reduced.matches || compact.matches) { photo.style.removeProperty('--scene-drift'); return; }
      const rect = scene.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
      photo.style.setProperty('--scene-drift', `${(-18 * progress).toFixed(2)}px`);
    });
  }
  function schedule() {
    if (!scheduled) { scheduled = true; window.requestAnimationFrame(paint); }
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) active.add(entry.target); else active.delete(entry.target); });
    schedule();
  });
  scenes.forEach(scene => observer.observe(scene));
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule, {passive:true});
  reduced.addEventListener('change', schedule);
  compact.addEventListener('change', schedule);
})();
