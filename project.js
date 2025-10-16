const params = new URLSearchParams(location.search);
const slug = params.get('project');

const nf = document.getElementById('nf');
const hero = document.getElementById('hero');
const heroImg = document.getElementById('heroImg');
const titleEl = document.getElementById('title');
const subtitleEl = document.getElementById('subtitle');
const descEl = document.getElementById('desc');
const galleryBlock = document.getElementById('galleryBlock');
const gallery = document.getElementById('gallery');

fetch('projects.json')
  .then(r => r.json())
  .then(data => {
    const p = (data.projects || []).find(x => x.slug === slug);
    if (!p) { nf.hidden = false; return; }

    document.title = p.title || 'Projekt';

    // HERO
    if (p.hero || p.cover) {
      heroImg.src = p.hero || p.cover;
      heroImg.alt = p.title || '';
      hero.hidden = false;
    }
    titleEl.textContent = p.title || '';
    subtitleEl.textContent = p.subtitle || '';

    // Popis (povolit odstavce přes prázdný řádek)
    if (p.description) {
      descEl.innerHTML = String(p.description)
        .split(/\n\n+/)
        .map(par => `<p>${par}</p>`)
        .join('');
    }

    // GALLERY: 2 nebo 3 sloupce (default 3)
    const cols = (p.columns === 2) ? 2 : 3;
    gallery.classList.add(cols === 2 ? 'cols-2' : 'cols-3');

    (p.images || []).forEach(src => {
      const im = new Image();
      im.src = src;
      im.alt = p.title || '';
      im.loading = 'lazy';
      im.decoding = 'async';
      gallery.appendChild(im);
    });

    if ((p.images || []).length) galleryBlock.hidden = false;
  })
  .catch(() => { nf.hidden = false; });
