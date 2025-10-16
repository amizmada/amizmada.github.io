(function () {
  const KEY = 'theme_override'; // uloží se 'dark' nebo 'light' po prvním kliknutí
  const btnId = 'theme-toggle';
  const mm = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

  init();

  function init() {
    applyEffective();          // nastav hned (Auto dle systému, pokud není override)

    // Pokud jsme v Auto (bez override), reaguj i na změnu systému
    if (!localStorage.getItem(KEY) && mm && mm.addEventListener) {
      mm.addEventListener('change', applyEffective);
    }

    window.addEventListener('DOMContentLoaded', () => {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      updateButton(btn);

      btn.addEventListener('click', () => {
        // první klik: přejdeme z Auto do ručního režimu a nastavíme opak aktuálního efektivního
        const cur = effectiveTheme();
        const override = localStorage.getItem(KEY);
        const next = override ? (override === 'dark' ? 'light' : 'dark')
                              : (cur === 'dark' ? 'light' : 'dark');
        localStorage.setItem(KEY, next);
        applyOverride(next);
        updateButton(btn);
      });
    });
  }

  function effectiveTheme() {
    const o = localStorage.getItem(KEY);
    if (o === 'dark' || o === 'light') return o;
    return (mm && mm.matches) ? 'dark' : 'light';
  }

  function applyEffective() {
    const o = localStorage.getItem(KEY);
    if (o === 'dark' || o === 'light') {
      applyOverride(o);
    } else {
      document.documentElement.removeAttribute('data-theme'); // Auto (podle @media)
      setThemeColor(effectiveTheme() === 'dark' ? '#0a0a0a' : '#ffffff');
    }
  }

  function applyOverride(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    setThemeColor(mode === 'dark' ? '#0a0a0a' : '#ffffff');
  }

  function updateButton(btn) {
    // Tlačítko ukazuje, kam se přepne po kliknutí
    const o = localStorage.getItem(KEY);
    const cur = effectiveTheme();
    const next = o ? (o === 'dark' ? 'light' : 'dark')
                   : (cur === 'dark' ? 'light' : 'dark');
    btn.textContent = next === 'dark' ? 'Dark' : 'Light';
    btn.title = o ? `Přepnout na ${next}` : `Přepnout (z Auto) na ${next}`;
    btn.setAttribute('aria-pressed', o ? 'true' : 'false');
  }

  function setThemeColor(color) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', color);
  }
})();