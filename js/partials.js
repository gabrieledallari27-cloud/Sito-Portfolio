// /js/partials.js

// Navbar di fallback (usata se il fetch fallisce)
const NAVBAR_FALLBACK_HTML = `
<header class="navbar" role="banner">
  <a class="brand" href="index.html" aria-label="Home">
    <img class="brand-logo" src="images/logo_white.svg" alt="Logo" width="40" height="40" />
    <h1>GABRIELE DALLARI</h1>
  </a>
  <nav class="nav" aria-label="Primary">
    <a href="portfolio.html">Portfolio</a>
    <a href="https://youtu.be/dKwzu5KsCe8" target="_blank" rel="noopener">Showreel</a>
    <a href="about.html">About Me</a>
    <a href="contact.html">Contacts</a>
  </nav>
</header>
`;

async function loadPartial(el) {
  const href = el.getAttribute('data-include');
  const candidates = href.startsWith('/')
    ? [href, href.slice(1)]
    : [href, '/' + href];

  let html = null, lastErr = null;

  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) { html = await res.text(); break; }
      lastErr = res.status + ' ' + res.statusText;
    } catch (e) {
      lastErr = e.message;
    }
  }

  // Se caricato, inserisci il partial. Altrimenti fallback inline.
  if (html) {
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    el.replaceWith(tpl.content);
  } else {
    console.warn('Include failed, using fallback for:', href, lastErr);
    const tpl = document.createElement('template');
    tpl.innerHTML = NAVBAR_FALLBACK_HTML;
    el.replaceWith(tpl.content);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const nodes = document.querySelectorAll('[data-include]');
  await Promise.all(Array.from(nodes).map(loadPartial));
});
