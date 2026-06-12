# Integraciones externas (iframes / APIs) — O Beach Ibiza (demo Astro)

Inventario de todo lo que en el sitio original carga desde un servicio de terceros
(iframe o API). Sirve de mapa para la futura sustitución por sistemas propios.

> **Estado tras esta revisión:** todas las integraciones de terceros se han
> sustituido en la demo por un placeholder **"Próximamente"** (`ComingSoon.astro`).
> Las URLs originales quedan documentadas aquí para reconectarlas o reconstruirlas.

---

## 1. Calendario de eventos y reservas de camas — **PremiumGuest** ⭐ (núcleo a reconstruir)

| | |
|---|---|
| **Página** | `/events-calendar/` |
| **Componente** | `src/components/EventsCalendarPage.astro` |
| **Tipo** | iframe (ticketing/reservas SaaS) |
| **URL original** | `https://sales.premiumguest.com/obeachibiza/en/?mode=list` |
| **Dato fuente** | `src/data/sections/events-calendar/00-EventsCalendarPage.json` → `embed.iframeSrc` |
| **Restricción** | Envía `X-Frame-Options: SAMEORIGIN`: **solo embebible bajo obeachibiza.com**. Fuera del dominio devuelve 403. |
| **Función** | Listado de eventos por día, selección de fecha, compra de entradas y reserva de camas/mesas. |

**Este es el sistema que vas a rehacer desde cero** (calendario propio + selección de
cama/mesa + reservas). En la demo: placeholder "Próximamente".

---

## 2. Reservas del restaurante — **CoverManager**

| | |
|---|---|
| **Página** | `/restaurant-calendar/` |
| **Componente** | `src/components/RestaurantBookingCalendar.astro` |
| **Tipo** | iframe (motor de reservas de restaurante) |
| **URL original** | `https://www.covermanager.com/reservation/module_restaurant/restaurante-obeach-ibiza/english` |
| **Dato fuente** | `src/data/sections/restaurant-calendar/01-RestaurantBookingCalendar.json` → `iframe.src` |
| **Restricción** | Sí se puede embeber (HTTP 200, sin X-Frame-Options). Usa iframeResizer para autoajuste de altura. |
| **Función** | Calendario de reservas de mesa: día, hora y nº de comensales. |

En la demo: placeholder "Próximamente".

---

## 3. Compra de paquetes de celebración — **CoverManager (e-commerce)**

| | |
|---|---|
| **Página** | `/celebration-packages/` |
| **Componente** | `src/components/pages/CelebrationIntro.astro` |
| **Tipo** | iframe (tienda/compra de productos) |
| **URL original** | `https://www.covermanager.com/eco/buy_products/restaurante-obeach-ibiza/english` |
| **Atributo** | `allow="payment"` (pasarela de pago dentro del iframe) |
| **Función** | Compra de paquetes de celebración (cumpleaños, despedidas, etc.). |

En la demo: placeholder "Próximamente".

---

## 4. Mapa de ubicación — **Google Maps Embed**

| | |
|---|---|
| **Página** | `/contact-us/` |
| **Componente** | `src/components/pages/ContactContent.astro` |
| **Tipo** | iframe (Google Maps embed) |
| **URL original** | `https://www.google.com/maps/embed?pb=...!2sOcean+Beach+Ibiza!...` |
| **Función** | Mapa con la ubicación del local (12-14 Carrer Des Moli, San Antonio). |

> ℹ️ **No es un sistema a reconstruir**, solo muestra la ubicación. Lo he sustituido por
> "Próximamente" siguiendo tu indicación de quitar todas las APIs, pero es trivial
> reponerlo (es un embed gratuito sin clave) si prefieres mantener el mapa. También
> aparece como **enlace** (no iframe) en el footer → `View Map`, que se conserva.

---

## 5. Feed de Instagram — **Smash Balloon / Instagram API**

| | |
|---|---|
| **Presencia** | Global (en el pie de TODAS las páginas, vía `Base.astro`) |
| **Componente** | `src/components/InstagramFeed.astro` |
| **Tipo** | API (plugin Smash Balloon, carga por AJAX las fotos del perfil) |
| **Estado en el scrape** | El grid llegaba **vacío** (se rellenaba por JS en el sitio real), así que en la demo nunca mostró fotos: solo la cabecera "Be Social" + enlace al perfil. |
| **Función** | Mostrar las últimas publicaciones de @obeachibiza. |

En la demo: placeholder "Próximamente" en la zona del grid. El enlace al perfil de
Instagram se mantiene.

---

## Enlaces externos (NO son iframes/API — solo navegación, se mantienen)

Estos no se tocan: son enlaces salientes normales, no integraciones embebidas.

| Destino | Dónde | Qué es |
|---|---|---|
| `store.obeachibiza.com` | Header, BurgerMenu | Tienda (Shopify) |
| `obeachdubai.com`, `obeachmusic.com` | Header, BurgerMenu | Webs hermanas |
| `thejockeyclub.co.uk/.../o-beach` | Header, BurgerMenu | Epsom Races |
| `engine.witbooking.com`, `thbhotels.com` | Bonito Hotel, FAQs | Motor de reservas del hotel (ya estaban como `#` en la demo) |
| `qrco.de`, `apps.apple.com`, `play.google.com` | Inner Circle | Descarga de la app O Beach |
| `wa.link/...` | FAQs | WhatsApp de Ibiza Luggage (servicio externo) |
| `xe.com` | FAQs | Conversor de divisas |
| Instagram / Facebook / TikTok / X / YouTube / SoundCloud / Pinterest / Spotify | Footer, BurgerMenu | Redes sociales |
| `google.com/maps/place/...` | Footer | "View Map" (enlace, no embed) |

---

## Resumen para el plan de reconstrucción

1. **PremiumGuest** (eventos + camas) → **sistema de reservas propio** (prioridad 1).
2. **CoverManager** (restaurante + compra de paquetes) → reservas/compra propias (prioridad 2).
3. **Google Maps** → opcional; un embed gratuito basta, no requiere reconstrucción.
4. **Instagram** → reconectar el feed (API oficial de Instagram o servicio tipo Smash Balloon) cuando haya backend.
