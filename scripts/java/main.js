(() => {
  const sections = Array.from(document.querySelectorAll('.rule-section'));
  const list = document.querySelector('#tocList');
  const search = document.querySelector('#tocSearch');
  const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Preserve existing section links and give each section one unique target.
  const entries = sections.map(section => {
    const heading = section.querySelector('h2');
    const id = section.id || heading.id || slug(heading.textContent);
    section.id = id;
    if (heading.id === id) heading.removeAttribute('id');
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#' + id;
    link.textContent = heading.textContent;
    item.append(link);
    list.append(item);
    const anchor = section.querySelector('.anchor');
    if (anchor) {
      anchor.href = '#' + id;
      anchor.setAttribute('aria-label', 'Link to ' + heading.textContent);
      anchor.title = 'Link to ' + heading.textContent;
    }
    return { section, item, link, text: section.textContent.toLowerCase() };
  });

  let scheduled = false;
  function updateActiveSection() {
    const visible = entries.filter(entry => !entry.section.hidden);
    let active = visible[0];
    const offset = document.querySelector('header').offsetHeight + 48;
    for (const entry of visible) {
      if (entry.section.getBoundingClientRect().top <= offset) active = entry;
    }
    entries.forEach(entry => {
      const selected = entry === active;
      entry.link.classList.toggle('active', selected);
      if (selected) entry.link.setAttribute('aria-current', 'location');
      else entry.link.removeAttribute('aria-current');
    });
    scheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(updateActiveSection);
    }
  }, { passive: true });
  window.addEventListener('resize', updateActiveSection);

  // Search the whole section and keep navigation in sync with the results.
  const empty = document.querySelector('#searchEmpty');
  const status = document.createElement('p');
  status.className = 'sr-only';
  status.setAttribute('role', 'status');
  search.after(status);
  search.addEventListener('input', () => {
    const query = search.value.trim().toLowerCase();
    let count = 0;
    entries.forEach(entry => {
      const matches = entry.text.includes(query);
      entry.section.hidden = !matches;
      entry.item.hidden = !matches;
      if (matches) count++;
    });
    empty.hidden = count !== 0;
    status.textContent = query ? `${count} matching section${count === 1 ? '' : 's'}.` : '';
    updateActiveSection();
  });

  updateActiveSection();
  window.addEventListener('load', () => {
    if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
    updateActiveSection();
  });

  document.querySelectorAll('pre[class*="language-"]').forEach(pre => {
    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper';
    pre.before(wrapper);
    wrapper.append(pre);
    if (pre.dataset.filename) {
      const filename = document.createElement('span');
      filename.className = 'code-filename';
      filename.textContent = pre.dataset.filename;
      wrapper.append(filename);
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn copy-btn';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', 'Copy ' + (pre.dataset.filename || 'code'));
    button.setAttribute('aria-live', 'polite');
    wrapper.append(button);
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.querySelector('code')?.textContent || pre.textContent);
        button.textContent = 'Copied';
      } catch {
        button.textContent = 'Select to copy';
        const range = document.createRange();
        range.selectNodeContents(pre);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
      setTimeout(() => { button.textContent = 'Copy'; }, 1800);
    });
  });

  document.querySelectorAll('table').forEach(table => {
    let container = table.closest('.table-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'table-container';
      table.before(container);
      container.append(table);
    }
    container.tabIndex = 0;
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', (table.closest('.rule-section')?.querySelector('h2').textContent || 'Reference') + ' table');
  });

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-grid-toggle]');
    const figure = button?.closest('.spec-figure');
    if (!figure) return;
    const enabled = figure.dataset.gridOn !== '1';
    figure.dataset.gridOn = enabled ? '1' : '0';
    button.setAttribute('aria-pressed', String(enabled));
  });
})();
