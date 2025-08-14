(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('header');

  function scrollToId(id){
    const el = document.getElementById(id);
    if(!el) return;
    const rect = el.getBoundingClientRect();
    const top = window.scrollY + rect.top - ((header?.offsetHeight || 0) + 12);
    window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if(!a) return;
    const id = a.getAttribute('href').slice(1);
    if(!id) return;
    e.preventDefault();
    history.pushState(null, '', '#' + id);
    scrollToId(id);
  });
  window.addEventListener('load', () => {
    if(location.hash?.length > 1) requestAnimationFrame(() => scrollToId(location.hash.slice(1)));
  });

  function setupDetails(details){
    const summary = details.querySelector(':scope > summary');
    if(!summary) return;

    let wrap = details.querySelector(':scope > ._anim-collapsible');
    if(!wrap){
      wrap = document.createElement('div');
      wrap.className = '_anim-collapsible';
      const nodes = [];
      let n = summary.nextSibling;
      while(n){ const next = n.nextSibling; nodes.push(n); n = next; }
      nodes.forEach(node => wrap.appendChild(node));
      details.appendChild(wrap);
    }

    wrap.style.overflow = 'hidden';
    if (!details.open) wrap.style.height = '0px';

    let anim;
    function measureHeight(){
      const prev = wrap.style.height;
      wrap.style.height = 'auto';
      const h = wrap.getBoundingClientRect().height;
      wrap.style.height = prev;
      return h;
    }

    function animateOpen(){
      const end = measureHeight();
      wrap.style.height = '0px';
      details.open = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          anim?.cancel();
          anim = wrap.animate(
            [{ height: '0px' }, { height: end + 'px' }],
            { duration: 220, easing: 'cubic-bezier(.22,.61,.36,1)' }
          );
          anim.onfinish = () => { wrap.style.height = 'auto'; };
        });
      });
    }

    function animateClose(){
      const start = wrap.getBoundingClientRect().height;
      wrap.style.height = start + 'px';
      requestAnimationFrame(() => {
        anim?.cancel();
        anim = wrap.animate(
          [{ height: start + 'px' }, { height: '0px' }],
          { duration: 180, easing: 'cubic-bezier(.22,.61,.36,1)' }
        );
        anim.onfinish = () => { wrap.style.height = '0px'; details.open = false; };
      });
    }

    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (prefersReduced){
        const willOpen = !details.open;
        details.open = willOpen;
        wrap.style.height = willOpen ? 'auto' : '0px';
        return;
      }
      details.open ? animateClose() : animateOpen();
    });
  }

  document.querySelectorAll('details.block').forEach(setupDetails);

  const reveal = (el) => el.classList.add('_in');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting && reveal(entry.target));
  }, { rootMargin: '0px 0px -20% 0px' });
  document.querySelectorAll('.rule-section').forEach(sec => io.observe(sec));
})();