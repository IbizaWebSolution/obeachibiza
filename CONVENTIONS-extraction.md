# Convenciones de extracción — clon Astro de obeachibiza.com

## Contexto
Demo estática en Astro del sitio actual (WordPress) de O Beach Ibiza, para su migración interna.
El objetivo es fidelidad visual total reutilizando las clases CSS originales del tema
(los CSS ya están adaptados en `src/styles/components/*.css` — NO los toques).

## Rutas
- Volcados de secciones originales: `C:\Users\Sergio\Documents\MEGA\DESARROLLO WEB\DESARROLLO\oceanBeach\_scrape\sections-deep\<página>\NN-<Tipo>.html`
- Mapa de medios (URL original → ruta local): `C:\Users\Sergio\Documents\MEGA\DESARROLLO WEB\DESARROLLO\oceanBeach\_scrape\media-map.json`
- Componentes de salida: `C:\Users\Sergio\Documents\MEGA\DESARROLLO WEB\DESARROLLO\oceanBeach\obeachibiza\src\components\<Tipo>.astro`
- Datos de salida: `C:\Users\Sergio\Documents\MEGA\DESARROLLO WEB\DESARROLLO\oceanBeach\obeachibiza\src\data\sections\<página>\NN-<Tipo>.json`

## Reglas del componente .astro
1. Reproduce EXACTAMENTE la estructura de clases del marcado original (BEM: `HeroCTA__title`,
   `Card__image`, clases entre corchetes tipo `[ CTAPullout__header ]` se copian literal).
   Conserva los atributos `g-component`, `g-options` y `g-ref` tal cual (el JS los usará).
2. Frontmatter TypeScript: `interface Props { ... }` + `const { ... } = Astro.props;`.
3. El componente se alimenta SOLO de props; nada hardcodeado salvo estructura fija.
4. NO incluyas etiquetas `<script>` ni `<link rel="stylesheet">` (el JS global y CSS van aparte).
   Elimina los `<script>outputComponentScripts.push(...)</script>` y links de WP del original.
5. Texto enriquecido (HTML con negritas, enlaces, párrafos): prop `html: string` renderizada con
   `<Fragment set:html={...} />`. NUNCA pongas texto con `{`, `}` o HTML crudo directamente en
   la plantilla.

## Imágenes (patrón lazyload de WP → nativo)
Original:
```html
<div class="intrinsic-image" style="--six-intrinsic-ratio: 1620/462; --six-intrinsic-fallback: 28.5%">
  <noscript><img src="URL"></noscript>
  <img width="1620" height="462" data-src="URL" data-srcset="..." data-sizes="..." class="lazy lazyload">
</div>
```
Conversión (conserva el div wrapper, sus clases y el atributo style con las CSS vars):
```html
<div class="intrinsic-image" style="--six-intrinsic-ratio: 1620/462; --six-intrinsic-fallback: 28.5%">
  <img src="/media/..." width="1620" height="462" alt="..." loading="lazy">
</div>
```
Elimina `<noscript>`, `data-srcset`, `data-sizes` y las clases `lazy lazyload`.

## Reescritura de URLs
- Imagen `https://obeachibiza.com/wp-content/uploads/...` → busca la URL EXACTA (con su variante
  -WxH si la tiene) como clave en `media-map.json` y usa el valor (`/media/....webp`).
- Si no está en el mapa, prueba la URL sin el sufijo `-WxH`. Si tampoco, anótalo en tu informe.
- Enlaces internos `https://obeachibiza.com/x/` → `/x/` (p. ej. `/day-club/`, `/blog`).
- `https://obeachibiza.com/?page_id=N` → `#`.
- Dominios externos (obeachdubai.com, store.obeachibiza.com, instagram, etc.): déjalos absolutos.
- Vídeos Vimeo: `.../playback/<id>/rendition/...` → clave `vimeo:<id>` del mapa
  (`/media/videos/vimeo-<id>-XXXp.mp4`). Pósters `i.vimeocdn.com/video/<id>-...` → clave `poster:<id>`.
- Elimina `<source>` HLS (`application/x-mpegURL` / m3u8); deja solo el mp4 local.
- Formularios: conserva el marcado, quita `action`, añade atributo `data-demo`.
- Botones/enlaces de reserva ("BOOK A BED", "Book now", links a ticketing externo como
  eventbrite/fourvenues): se ven igual pero `href="#"` — la demo no implementa reservas.
  Los enlaces internos a `/events-calendar/` o `/restaurant-calendar/` SÍ se mantienen.

## JSON de datos
`{ "type": "<Tipo>", "props": { ...todas las props del componente... } }`
Un archivo por instancia, con el prefijo NN de orden del volcado original.
JSON válido UTF-8 (cuida los emojis y acentos del texto original — consérvalos).

## Informe final del agente
Devuelve: interfaz Props elegida, páginas/instancias procesadas, URLs no resueltas,
y cualquier rareza del marcado (variantes, modificadores de clase que dependan de datos).



#	Ruta	Página
1	/	Home
2	/day-club/	Day Club
3	/events-calendar/	Events Calendar (reservas "Book a Bed")
4	/restaurant-calendar/	Restaurant Calendar (reservas restaurante)
5	/bed-menus/	Bed Menus
6	/drinks-packages/	Drinks Packages
7	/celebration-packages/	Celebration Packages
8	/bonito-hotel/	Bonito Hotel
9	/inner-circle/	Inner Circle (membresía)
10	/blog/	Blog
11	/press/	Press
12	/partners/	Partners
13	/open-positions/	Open Positions (empleo)
14	/faqs/	FAQs
15	/contact-us/	Contact Us
16	/terms-conditions/	Terms & Conditions
17	/privacy-policy/	Privacy Policy
18	/es/terminos-y-condiciones/	Términos y Condiciones