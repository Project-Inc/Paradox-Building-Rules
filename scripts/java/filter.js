  (() => {
    const filterBar = document.currentScript.previousElementSibling?.querySelector?.('.lights-filter');
    const table = document.querySelector('.lights-matrix');
    if (!filterBar || !table) return;

    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      filterBar.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn));
      const key = btn.dataset.filter;

      // show all
      table.querySelectorAll('thead th, tbody tr, tbody td').forEach(el => el.style.display = '');
      if (key === 'all') return;

      // hide other columns
      const idx = [...table.querySelectorAll('thead th')].findIndex(th => th.dataset.col === key);
      [...table.querySelectorAll('thead th')].forEach((th,i) => {
        if (i !== 0 && i !== idx && th.dataset.col !== undefined) th.style.display = 'none';
      });
      table.querySelectorAll('tbody tr').forEach(tr => {
        [...tr.children].forEach((td,i) => {
          if (i !== 0 && i !== idx && table.tHead.rows[0].cells[i].dataset.col !== undefined) td.style.display = 'none';
        });
      });
    });
  })();