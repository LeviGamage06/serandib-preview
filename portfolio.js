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
})();
