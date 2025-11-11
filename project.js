// Uses the same image helper functions as script.js. If the file is loaded standalone,
// re-declare minimal helpers.
const IMG_QUALITY = 60;
const supportCache = new Map();
const existsCache = new Map();
async function supportsFormat(ext) {
  if (supportCache.has(ext)) return supportCache.get(ext);
  const el = document.createElement('img');
  return new Promise(res => {
    el.onload = () => { supportCache.set(ext, true); res(true); };
    el.onerror = () => { supportCache.set(ext, false); res(false); };
    if (ext === 'avif') el.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAG1pZjFhdmlmAAACAG1ldGEAAAAB';
    else if (ext === 'webp') el.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4ICAAAADQAgCdASoCAAIALmk0mk0iIiIi';
    else res(false);
  });
}
async function urlExists(url) {
  if (existsCache.has(url)) return existsCache.get(url);
  try { const r = await fetch(url, { method: 'HEAD' }); const ok = r.ok; existsCache.set(url, ok); return ok; }
  catch { existsCache.set(url, false); return false; }
}
function withQuality(url) {
  const q = IMG_QUALITY;
  if (!q) return url;
  const u = new URL(url, location.href);
  if (!u.searchParams.has('q')) u.searchParams.set('q', String(q));
  return u.pathname + u.search;
}
async function resolveBestSrc(jpgUrl) {
  const base = jpgUrl.replace(/\.(jpg|jpeg|png)$/i, '');
  const avif = base + '.avif', webp = base + '.webp';
  if (await supportsFormat('avif') && await urlExists(avif)) return withQuality(avif);
  if (await supportsFormat('webp') && await urlExists(webp)) return withQuality(webp);
  return withQuality(jpgUrl);
}
function createSmartImg({ src, alt = '', width = '', height = '', fetchPriority = 'auto' }) {
  const img = new Image();
  img.alt = alt;
  if (width) img.width = width;
  if (height) img.height = height;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.fetchPriority = fetchPriority;
  img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="10" viewBox="0 0 16 10"><rect width="16" height="10" fill="%23e5e7eb"/></svg>';
  const io = new IntersectionObserver(async entries => {
    for (const e of entries) if (e.isIntersecting) { img.src = await resolveBestSrc(src); io.unobserve(img); }
  });
  io.observe(img);
  return img;
}

const params = new URLSearchParams(location.search);
const slug = params.get('project');

const nf = document.getElementById('nf');
const hero = document.getElementById('hero');
const titleEl = document.getElementById('title');
const subtitleEl = document.getElementById('subtitle');
const descEl = document.getElementById('desc');
const galleryBlock = document.getElementById('galleryBlock');
const gallery = document.getElementById('gallery');

fetch('projects.json')
  .then(r => r.json())
  .then(async data => {
    const p = (data.projects || []).find(x => x.slug === slug);
    if (!p) { nf.hidden = false; return; }

    // HERO
    titleEl.textContent = p.title || '';
    subtitleEl.textContent = p.subtitle || '';
    descEl.innerHTML = p.description || '';
    const heroWrap = document.querySelector('.hero-media');
    heroWrap.innerHTML = '';
    const heroSmart = createSmartImg({ src: p.hero || p.cover || 'assets/placeholder.jpg', alt: p.title, fetchPriority: 'high' });
    heroWrap.appendChild(heroSmart);
    hero.hidden = false;

    // GALLERY
    const cols = Number(p.columns) === 2 ? 2 : 3;
    gallery.classList.add(cols === 2 ? 'cols-2' : 'cols-3');
    (p.images || []).forEach(src => gallery.appendChild(createSmartImg({ src, alt: p.title })));
    if ((p.images || []).length) galleryBlock.hidden = false;
  })
  .catch(() => { nf.hidden = false; });
