// /js/partials.js
(() => {
  // ↑ Cambia questo ad ogni deploy (es. v5, v6...)
  const VERSION = "v5";

  // Navbar di fallback (usata se il fetch fallisce)
  const NAVBAR_FALLBACK_HTML = `
<header class="navbar" role="banner">
  <a class="brand" href="/" aria-label="Home">
    <img class="brand-logo" src="/images/logo_white.svg" alt="Logo" width="40" height="40" />
    <h1>GABRIELE DALLARI</h1>
  </a>
  <nav class="nav" aria-label="Primary">
    <a href="/portfolio.html">Portfolio</a>
    <a href="https://youtu.be/dKwzu5KsCe8" target="_blank" rel="noopener">Showreel</a>
    <a href="/about.html">About Me</a>
    <a href="/contact.html">Contacts</a>
  </nav>
</header>`;

  const withVersion = (url) => url + (url.includes("?") ? "&" : "?") + "v=" + encodeURIComponent(VERSION);

  async function loadPartial(el) {
    const href = el.getAttribute("data-include") || "";
    // Prova sia assoluto che relativo
    const candidates = href.startsWith("/")
      ? [href]
      : ["/" + href, href];

    let html = null;
    let lastErr = null;

    for (const raw of candidates) {
      try {
        const url = withVersion(raw);
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) { html = await res.text(); break; }
        lastErr = res.status + " " + res.statusText;
      } catch (e) {
        lastErr = e.message;
      }
    }

    const tpl = document.createElement("template");
    tpl.innerHTML = html ?? NAVBAR_FALLBACK_HTML;
    el.replaceWith(tpl.content);

    if (!html) {
      console.warn("Include failed, using fallback for:", href, lastErr);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-include]").forEach(loadPartial);
  });
})();
