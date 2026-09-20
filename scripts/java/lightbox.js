(() => {
  const dialog = document.createElement('dialog');
  dialog.className = 'pi-lightbox';
  dialog.setAttribute('aria-label', 'Image viewer');
  dialog.innerHTML = `
    <div class="pi-lightbox__toolbar">
      <button class="btn pi-lightbox__close" type="button" autofocus>Close</button>
    </div>
    <div class="pi-lightbox__viewport">
      <img class="pi-lightbox__img" alt="">
    </div>`;
  document.body.append(dialog);
  const image = dialog.querySelector('img');
  const viewport = dialog.querySelector('.pi-lightbox__viewport');
  let previousFocus;
  let previousOverflow;

  function open(source) {
    previousFocus = source;
    previousOverflow = document.body.style.overflow;
    image.src = source.dataset.full || source.currentSrc || source.src;
    image.alt = source.alt;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    viewport.scrollTo(0, 0);
  }

  dialog.querySelector('.pi-lightbox__close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog || event.target === viewport) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    image.removeAttribute('src');
    previousFocus?.focus({ preventScroll: true });
  });


  document.querySelectorAll('main img:not([data-nolightbox])').forEach(source => {
    source.tabIndex = 0;
    source.setAttribute('role', 'button');
    source.setAttribute('aria-haspopup', 'dialog');
    source.setAttribute('aria-label', 'Enlarge image: ' + (source.alt || 'Reference image'));
    source.addEventListener('click', () => open(source));
    source.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(source);
      }
    });
  });
})();
