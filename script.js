// --- Lightweight image loader with optional format/quality detection ---
// If WEBP/AVIF variants with the same basename exist, we'll prefer them.
// Optionally appends ?q=60 to hint lower quality if the server/CDN supports it.
const IMG_QUALITY = 60; // change or null to disable adding ?q=
const supportCache = new Map(); // ext -> boolean
const existsCache = new Map();  // url -> boolean

async function supportsFormat(ext) {
  if (supportCache.has(ext)) return supportCache.get(ext);
  const el = document.createElement('img');
  return new Promise(res => {
    el.onload = () => { supportCache.set(ext, true); res(true); };
    el.onerror = () => { supportCache.set(ext, false); res(false); };
    // tiny data urls for feature detect
    if (ext === 'avif') el.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAG1pZjFhdmlmAAACAG1ldGEAAAAB';
    else if (ext === 'webp') el.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4ICAAAADQAgCdASoCAAIALmk0mk0iIiIi';
    else res(false);
  });
}

async function urlExists(url) {
  if (existsCache.has(url)) return existsCache.get(url);
  try {
    const r = await fetch(url, { method: 'HEAD' });
    const ok = r.ok;
    existsCache.set(url, ok);
    return ok;
  } catch (e) {
    existsCache.set(url, false);
    return false;
  }
}

function withQuality(url) {
  if (!IMG_QUALITY) return url;
  const u = new URL(url, location.href);
  if (!u.searchParams.has('q')) u.searchParams.set('q', String(IMG_QUALITY));
  return u.pathname + u.search; // keep relative feel
}

async function resolveBestSrc(jpgUrl) {
  const base = jpgUrl.replace(/\.(jpg|jpeg|png)$/i, '');
  const avif = base + '.avif';
  const webp = base + '.webp';

  if (await supportsFormat('avif') && await urlExists(avif)) return withQuality(avif);
  if (await supportsFormat('webp') && await urlExists(webp)) return withQuality(webp);
  return withQuality(jpgUrl);
}

// Progressive attach: creates <img> with placeholder, swaps when in view
function createSmartImg({ src, alt = '', width = '', height = '', fetchPriority = 'auto' }) {
  const img = new Image();
  img.alt = alt;
  if (width) img.width = width;
  if (height) img.height = height;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.fetchPriority = fetchPriority;
  img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="10" viewBox="0 0 16 10"><rect width="16" height="10" fill="%23e5e7eb"/></svg>'; // lightweight placeholder

  // When intersecting, resolve best src and load
  const io = new IntersectionObserver(async entries => {
    for (const e of entries) {
      if (e.isIntersecting) {
        const best = await resolveBestSrc(src);
        img.src = best;
        io.unobserve(img);
      }
    }
  });
  io.observe(img);

  return img;
}

// --- Index grid rendering ---
fetch('projects.json')
  .then(r => r.json())
  .then(data => {
    const projects = data.projects || [];
    const grid = document.getElementById('projekty');

    const makeCard = (p) => {
      const a = document.createElement('a');
      a.className = 'card';
      a.href = `project.html?project=${encodeURIComponent(p.slug)}`;

      const picture = document.createElement('div'); // simple wrapper
      const smart = createSmartImg({ src: p.cover || 'assets/placeholder.jpg', alt: p.title });
      picture.appendChild(smart);

      const cap = document.createElement('div');
      cap.className = 'cap';
      cap.textContent = p.title;

      a.appendChild(picture);
      a.appendChild(cap);
      return a;
    };

    // Render cards
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      grid.appendChild(makeCard(p));
    }
  })
  .catch(() => {
    const div = document.createElement('div');
    div.className = 'empty';
    div.textContent = 'NedaĹĂ­ se naÄĂ­st projekty.';
    document.body.appendChild(div);
  });
