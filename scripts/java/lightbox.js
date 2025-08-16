(() => {
  // Build overlay once
  const overlay = document.createElement('div');
  overlay.className = 'pi-lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', 'Image viewer');
  overlay.innerHTML = `
    <div class="pi-lightbox__frame" tabindex="-1">
      <img class="pi-lightbox__img" alt="">
      <div class="pi-lens"><div class="pi-lens__inner"></div></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const frame = overlay.querySelector('.pi-lightbox__frame');
  const imgEl = overlay.querySelector('.pi-lightbox__img');
  const lens = overlay.querySelector('.pi-lens');
  const lensInner = overlay.querySelector('.pi-lens__inner');

  let isOpen = false;
  let closing = false;
  let lastActive = null;

  // Magnifier state
  let zoom = 2;               // starting magnification
  const ZOOM_MIN = 1;
  const ZOOM_MAX = 6;
  const ZOOM_STEP = 0.25;
  let lensOn = false;

  function openLightbox(src, alt){
    if (!src) return;
    lastActive = document.activeElement;
    imgEl.src = src;
    imgEl.alt = alt || '';
    // Prepare lens background (use high-res if possible)
    lensInner.style.backgroundImage = `url("${src}")`;
    // Show
    overlay.classList.add('is-open');
    isOpen = true;
    closing = false;
    frame.focus({ preventScroll: true });
  }

  function closeLightbox(){
    if (!isOpen || closing) return;
    closing = true;
    overlay.classList.add('is-closing');
    // after transition, fully hide + cleanup
    const done = () => {
      overlay.classList.remove('is-open','is-closing');
      isOpen = false;
      closing = false;
      imgEl.removeAttribute('src');
      lens.classList.remove('is-on');
      lensOn = false;
      if (lastActive) lastActive.focus?.();
      overlay.removeEventListener('transitionend', done);
    };
    overlay.addEventListener('transitionend', done);
  }

  // Click background (not the image) to close
  overlay.addEventListener('click', (e) => {
    if (!e.target.closest('.pi-lightbox__frame')) closeLightbox();
  });

  // ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeLightbox();
  });

  // Delegate: open on ANY image (except explicit opt-out & brand logo)
  document.addEventListener('click', (e) => {
    const img = e.target.closest('img');
    if (!img || img.matches('[data-nolightbox], .brand-mark')) return;

    const full = img.getAttribute('data-full') || img.currentSrc || img.src;
    if (!full) return;

    if (e.button === 0) {
      e.preventDefault();
      openLightbox(full, img.alt || '');
    }
  }, { passive: false });

  // ——— Magnifier helpers ———
  function updateLensPos(clientX, clientY){
    const rect = imgEl.getBoundingClientRect();
    const lx = Math.max(rect.left, Math.min(clientX, rect.right));
    const ly = Math.max(rect.top,  Math.min(clientY, rect.bottom));

    const lensRect = lens.getBoundingClientRect();
    const half = lensRect.width / 2;

    // place lens centered at pointer
    lens.style.left = `${lx - rect.left - half + 4}px`;  // +4 = frame padding
    lens.style.top  = `${ly - rect.top  - half + 4}px`;

    // compute background position for the zoomed area
    const relX = (lx - rect.left) / rect.width;   // 0..1
    const relY = (ly - rect.top)  / rect.height;  // 0..1
    const bgSizeX = rect.width * zoom;
    const bgSizeY = rect.height * zoom;
    const bgPosX = -(relX * bgSizeX - lensRect.width/2);
    const bgPosY = -(relY * bgSizeY - lensRect.height/2);

    lensInner.style.backgroundSize = `${bgSizeX}px ${bgSizeY}px`;
    lensInner.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`;
  }

  function showLensAt(x, y){
    if (!isOpen) return;
    if (!lensOn){
      lens.classList.add('is-on');
      lensOn = true;
    }
    updateLensPos(x, y);
  }

  function hideLens(){
    if (!lensOn) return;
    lens.classList.remove('is-on');
    lensOn = false;
  }

  // Pointer events on the image to drive the lens
  imgEl.addEventListener('pointerdown', (e) => {
    // left button or touch/pen
    if (e.button !== 0 && e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
    e.preventDefault();
    imgEl.setPointerCapture(e.pointerId);
    showLensAt(e.clientX, e.clientY);
  });

  imgEl.addEventListener('pointermove', (e) => {
    if (!lensOn) return;
    updateLensPos(e.clientX, e.clientY);
  });

  const endLens = () => hideLens();
  imgEl.addEventListener('pointerup', endLens);
  imgEl.addEventListener('pointercancel', endLens);
  imgEl.addEventListener('pointerleave', endLens);

  // Touch & hold: start lens on long-press (300ms)
  let longPressTimer = null;
  imgEl.addEventListener('touchstart', (e) => {
    if (!isOpen) return;
    const t = e.touches[0];
    longPressTimer = setTimeout(() => {
      showLensAt(t.clientX, t.clientY);
    }, 300);
  }, { passive: true });

  const cancelLongPress = () => { clearTimeout(longPressTimer); longPressTimer = null; hideLens(); };
  imgEl.addEventListener('touchend', cancelLongPress);
  imgEl.addEventListener('touchcancel', cancelLongPress);
  imgEl.addEventListener('touchmove', (e) => {
    if (!lensOn) return;
    const t = e.touches[0];
    showLensAt(t.clientX, t.clientY);
  }, { passive: true });

  // Wheel to zoom (over frame or image)
  frame.addEventListener('wheel', (e) => {
    if (!isOpen) return;
    e.preventDefault();
    const dir = Math.sign(e.deltaY);
    zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom - dir * ZOOM_STEP));
    // keep lens centered under cursor while zooming
    if (lensOn){
      updateLensPos(e.clientX, e.clientY);
    }
  }, { passive: false });
})();