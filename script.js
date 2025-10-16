const grid=document.getElementById('projekty');fetch('projects.json')
  .then(r => r.json())
  .then(data => {
    const projects = data.projects || [];
    const grid = document.getElementById('projekty');

    const makeCard = (p) => {
      const a = document.createElement('a');
      a.className = 'card';
      a.href = `project.html?project=${encodeURIComponent(p.slug)}`;
      a.innerHTML = `
        <img src="${p.cover || 'assets/placeholder.jpg'}" alt="${p.title}" loading="lazy" decoding="async">
        <div class="cap">${p.title}</div>
      `;
      return a;
    };

    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];

      // pokud začíná "dvousloupcový řádek" a existuje i následující položka se stejným layoutem
      if (p.layout === 'two' && projects[i + 1] && projects[i + 1].layout === 'two') {
        const row = document.createElement('div');
        row.className = 'row-2';
        row.appendChild(makeCard(p));
        row.appendChild(makeCard(projects[i + 1]));
        grid.appendChild(row);
        i++; // přeskoč druhý, už je uvnitř .row-2
      } else {
        grid.appendChild(makeCard(p));
      }
    }
  })
  .catch(() => {
    const div = document.createElement('div');
    div.className = 'empty';
    div.textContent = 'Nedaří se načíst projekty.';
    document.body.appendChild(div);
  });
