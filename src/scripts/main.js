// Capa de comportamiento de la demo (vanilla, sin jQuery):
// burger menu, paneles slideout, carruseles Flickity, acordeón FAQs,
// newsletter demo, badge giratorio, cursor personalizado y avisos demo.
import Flickity from 'flickity';
import 'flickity-fade';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function parseOptions(el) {
  try {
    return JSON.parse(el.getAttribute('g-options')) || {};
  } catch {
    return {};
  }
}

/* ------------------------------------------------------------------ */
/* Header al hacer scroll (clases de Headroom.js que espera el CSS)    */
/* ------------------------------------------------------------------ */
function initHeadroom() {
  const header = $('.Header');
  if (!header) return;
  header.classList.add('headroom', 'headroom--pinned');
  const update = () => {
    const top = window.scrollY < 30;
    header.classList.toggle('headroom--top', top);
    header.classList.toggle('headroom--not-top', !top);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* ------------------------------------------------------------------ */
/* Vídeos: arrancan PAUSADOS; clic para reproducir/pausar; el cursor    */
/* personalizado cambia a PLAY/PAUSE (sin botón de play superpuesto).   */
/* ------------------------------------------------------------------ */
function initVideos() {
  $$('video').forEach((video) => {
    // anular el autoplay del tema original: empezar siempre en pausa
    video.removeAttribute('autoplay');
    video.autoplay = false;
    video.muted = true; // necesario para poder reproducir tras el clic sin bloqueo
    video.pause();

    const wrap = video.closest('.HeroCTA__media') || video.parentElement;
    wrap.classList.add('has-video-control');

    let hovering = false;
    const label = () => (video.paused ? 'PLAY' : 'PAUSE');

    const toggle = (e) => {
      if (e) e.preventDefault();
      if (video.paused) video.play().catch(() => {});
      else video.pause();
    };
    video.addEventListener('click', toggle);

    // el cursor personalizado cambia a PLAY/PAUSE mientras se está encima
    wrap.addEventListener('mouseenter', () => {
      hovering = true;
      setCursorText(label());
    });
    wrap.addEventListener('mouseleave', () => {
      hovering = false;
      setCursorText('');
    });

    video.addEventListener('play', () => {
      wrap.classList.add('is-playing');
      if (hovering) setCursorText('PAUSE');
    });
    video.addEventListener('pause', () => {
      wrap.classList.remove('is-playing');
      if (hovering) setCursorText('PLAY');
    });
  });
}

/* ------------------------------------------------------------------ */
/* Burger menu                                                         */
/* ------------------------------------------------------------------ */
function initBurger() {
  const open = () => document.body.classList.add('burger-menu-open', 'scroll-lock');
  const close = () => document.body.classList.remove('burger-menu-open', 'scroll-lock');

  $$('[g-ref="burger"]').forEach((btn) => btn.addEventListener('click', open));
  const menu = $('[g-component="BurgerMenu"]');
  if (menu) {
    const closeBtn = $('[g-ref="closeBtn"]', menu);
    if (closeBtn) closeBtn.addEventListener('click', close);
    // navegar cierra el menú
    $$('a', menu).forEach((a) => a.addEventListener('click', close));
  }
  $('.js-site-overlay')?.addEventListener('click', () => {
    close();
    closeSlideOuts();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      close();
      closeSlideOuts();
    }
  });
}

/* ------------------------------------------------------------------ */
/* SlideOut (pullouts de tarjetas, posiciones y eventos)               */
/* ------------------------------------------------------------------ */
function closeSlideOuts() {
  $$('.SlideOut.is-active').forEach((p) => p.classList.remove('is-active'));
  document.body.classList.remove('slideout-open', 'scroll-lock');
}

function openCtaPanel(content) {
  const panel = $('.SlideOut.js-cta-panel');
  if (!panel) return;
  const title = $('[g-ref="title"]', panel);
  const description = $('[g-ref="description"]', panel);
  const bookLinks = $('[g-ref="bookLinks"]', panel);
  if (title) title.textContent = content.title || '';
  if (description) {
    let html = content.description || '';
    if (content.form) html += content.form;
    description.innerHTML = html;
    // los formularios embebidos son demo
    $$('form', description).forEach((f) => {
      f.removeAttribute('action');
      f.setAttribute('data-demo', '');
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        toast('Demo: el envío de formularios no está implementado');
      });
    });
  }
  if (bookLinks) {
    bookLinks.innerHTML = '';
    if (content.link && content.link.url) {
      const a = document.createElement('a');
      a.href = content.link.url;
      a.textContent = content.above_link_text || content.link.title || 'Book Now';
      if (content.link.target) a.target = content.link.target;
      bookLinks.appendChild(a);
    }
  }
  panel.classList.add('is-active');
  document.body.classList.add('slideout-open', 'scroll-lock');
}

function initPullouts() {
  $$('[g-component="SimpleCard"], [g-component="Card"]').forEach((card) => {
    const opts = parseOptions(card);
    if (!opts.clickToOpenPullout || !opts.pulloutContent) return;
    const link = card.tagName === 'A' ? card : $('a', card) || card;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openCtaPanel(opts.pulloutContent);
    });
  });

  $$('.SlideOut [g-ref="closeBtn"], .SlideOut .SlideOut__close').forEach((btn) =>
    btn.addEventListener('click', closeSlideOuts)
  );
}

/* ------------------------------------------------------------------ */
/* Carruseles (Flickity)                                               */
/* ------------------------------------------------------------------ */
function initCarousels() {
  $$('[g-component="Carousel"]').forEach((el) => {
    const opts = parseOptions(el);
    const cellSelector = opts.cellSelector || undefined;
    const fade = opts.fade === 'true' || opts.fade === true;
    const pageDots = opts.pageDots === 'true' || opts.pageDots === true;
    const flkty = new Flickity(el, {
      cellSelector,
      cellAlign: 'left',
      contain: true,
      pageDots,
      prevNextButtons: false,
      groupCells: !fade,
      fade,
      autoPlay: fade ? 5000 : false,
      wrapAround: fade,
      imagesLoaded: false,
      pauseAutoPlayOnHover: false,
    });

    // navegación propia del tema (g-ref prev/next + estados is-start/is-end)
    const section = el.closest('section, article, div.CardsRow, div')?.parentElement?.closest('section, article, div') || el.parentElement;
    const scope = el.closest('[g-component="CardsRow"], [g-component="EventsRow"], [g-component="PositionsListings"], section, article') || section;
    if (!scope) return;
    const nav = $('[g-ref="nav"]', scope);
    const prev = $('[g-ref="prev"]', scope);
    const next = $('[g-ref="next"]', scope);
    if (prev) prev.addEventListener('click', () => flkty.previous());
    if (next) next.addEventListener('click', () => flkty.next());
    if (nav) {
      const update = () => {
        nav.classList.toggle('is-start', flkty.selectedIndex === 0);
        nav.classList.toggle('is-end', flkty.selectedIndex >= flkty.slides.length - 1);
      };
      flkty.on('select', update);
      update();
    }
  });

  // slider de habitaciones del hotel (owl-carousel original) → Flickity
  $$('.owl-carousel').forEach((el) => {
    new Flickity(el, {
      cellAlign: 'left',
      contain: true,
      pageDots: true,
      prevNextButtons: true,
      wrapAround: true,
      imagesLoaded: false,
    });
  });
}

/* ------------------------------------------------------------------ */
/* FAQs (acordeón)                                                     */
/* ------------------------------------------------------------------ */
function initFaqs() {
  $$('.inside-faq').forEach((faq) => {
    faq.classList.add('demo-collapsed');
    const h3 = $('h3', faq);
    if (h3)
      h3.addEventListener('click', () => {
        faq.classList.toggle('demo-collapsed');
      });
  });
}

/* ------------------------------------------------------------------ */
/* Newsletter (demo)                                                   */
/* ------------------------------------------------------------------ */
function initNewsletter() {
  $$('[g-component="Newsletter"]').forEach((nl) => {
    const form = $('[g-ref="form"]', nl);
    const email = $('[g-ref="email"]', nl);
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = email && /.+@.+\..+/.test(email.value);
      nl.classList.toggle('is-success', ok);
      nl.classList.toggle('is-error', !ok);
    });
  });
}

/* ------------------------------------------------------------------ */
/* Hero in view (badge giratorio) + vídeos                             */
/* ------------------------------------------------------------------ */
function initHero() {
  const hero = $('.HeroCTA');
  if (hero && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      ([entry]) => document.body.classList.toggle('hero-in-view', entry.isIntersecting),
      { threshold: 0.15 }
    );
    io.observe(hero);
  }
  // El badge giratorio se oculta también sobre el footer (body.footer-in-view,
  // como el tema original) para no tapar el selector de idioma.
  const footer = $('.Footer');
  if (footer && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      ([entry]) => document.body.classList.toggle('footer-in-view', entry.isIntersecting),
      { threshold: 0.05 }
    );
    io.observe(footer);
  }
  // Los vídeos arrancan en pausa y se controlan con clic — ver initVideos().
}

/* ------------------------------------------------------------------ */
/* Cursor personalizado                                                */
/* ------------------------------------------------------------------ */
let cursorEl = null;
let cursorTextEl = null;

// Actualiza el texto del cursor (PLAY/PAUSE/VIEW…) y su estado expandido.
// Compartido entre el cursor genérico y el control de vídeo.
function setCursorText(txt) {
  if (!cursorEl) return;
  if (cursorTextEl) cursorTextEl.textContent = txt || '';
  cursorEl.classList.toggle('cursor-text', !!txt);
}

function initCursor() {
  cursorEl = $('[g-component="Cursor"]');
  if (!cursorEl || window.matchMedia('(pointer: coarse)').matches) {
    document.body.classList.add('no-custom-cursor');
    cursorEl = null;
    return;
  }
  cursorTextEl = $('[g-ref="text"]', cursorEl);
  cursorEl.classList.add('is-hidden');
  document.addEventListener('mousemove', (e) => {
    cursorEl.classList.remove('is-hidden');
    // conserva el centrado translate(-50%,-50%) del CSS del tema
    cursorEl.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  });
  document.addEventListener('mouseleave', () => cursorEl.classList.add('is-hidden'));
  $$('[data-cursor-text]').forEach((el) => {
    el.addEventListener('mouseenter', () => setCursorText(el.getAttribute('data-cursor-text') || ''));
    el.addEventListener('mouseleave', () => setCursorText(''));
  });
}

/* ------------------------------------------------------------------ */
/* Avisos de demo                                                      */
/* ------------------------------------------------------------------ */
let toastTimer;
function toast(msg) {
  const el = $('#demo-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2600);
}

function initDemoLinks() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#"]');
    if (!a) return;
    e.preventDefault();
    toast('Demo: esta acción no está disponible');
  });
  $$('form[data-demo]').forEach((f) =>
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      toast('Demo: el envío de formularios no está implementado');
    })
  );
}

/* ------------------------------------------------------------------ */
/* Enlaces externos: cualquier enlace a otro dominio se abre en pestaña */
/* nueva (_blank) y todo _blank lleva rel="noopener" (también el        */
/* contenido editorial que viene en HTML crudo de los JSON)             */
/* ------------------------------------------------------------------ */
function initSecureLinks() {
  $$('a[href]').forEach((a) => {
    const href = a.getAttribute('href') || '';
    if (/^https?:\/\//i.test(href) && !href.startsWith(window.location.origin + '/') && href !== window.location.origin) {
      a.setAttribute('target', '_blank');
    }
    if (a.getAttribute('target') === '_blank') {
      const rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
      if (!rel.includes('noopener')) {
        rel.push('noopener');
        a.setAttribute('rel', rel.join(' '));
      }
    }
  });
}

/* ------------------------------------------------------------------ */
/* i18n: selector de idioma del footer + enlaces del contenido          */
/* ------------------------------------------------------------------ */
function initLanguageSwitcher() {
  $$('[g-component="LanguageSwitcher"]').forEach((nav) => {
    const toggle = $('[g-ref="toggle"]', nav);
    const dropdown = $('[g-ref="dropdown"]', nav);
    if (!toggle || !dropdown) return;

    const close = () => {
      dropdown.hidden = true;
      dropdown.style.cssText = '';
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      window.removeEventListener('scroll', close);
    };

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!dropdown.hidden) return close();
      // posicionamiento fixed sobre el viewport: el footer y el burger
      // recortan (overflow) los hijos absolutos que sobresalen
      const r = $('.choices', nav).getBoundingClientRect();
      dropdown.hidden = false;
      dropdown.style.position = 'fixed';
      dropdown.style.left = `${Math.round(r.left)}px`;
      dropdown.style.minWidth = `${Math.round(r.width)}px`;
      const h = dropdown.offsetHeight;
      const below = r.bottom + 4 + h <= window.innerHeight;
      dropdown.style.top = below ? `${Math.round(r.bottom + 4)}px` : `${Math.round(r.top - h - 4)}px`;
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      window.addEventListener('scroll', close, { passive: true });
    });

    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target)) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  });
}

// En páginas localizadas (/es, /it, /fr, /de) el contenido editorial sigue
// siendo el original en inglés, así que sus enlaces internos no llevan
// prefijo de idioma: se les añade aquí para no salir del idioma elegido.
function initLocaleLinks() {
  const m = window.location.pathname.match(/^\/(es|it|fr|de)(?=\/|$)/);
  if (!m) return;
  const prefix = `/${m[1]}`;
  $$('a[href^="/"]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;
    if (a.closest('[g-component="LanguageSwitcher"]')) return; // el selector ya apunta a cada idioma
    if (/^\/(es|it|fr|de)(\/|$)/.test(href)) return; // ya localizado
    if (/^\/(media|img|fonts)\//.test(href)) return; // recursos estáticos
    if (/\.[a-z0-9]{2,5}([?#]|$)/i.test(href)) return; // archivos (pdf, etc.)
    a.setAttribute('href', prefix + href);
  });
}

/* ------------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.remove('gasp-loading');
  initHeadroom();
  initBurger();
  initPullouts();
  initCarousels();
  initFaqs();
  initNewsletter();
  initHero();
  initCursor();
  initVideos();
  initDemoLinks();
  initLanguageSwitcher();
  initLocaleLinks();
  initSecureLinks();
});
