# CLAUDE.md — A&J Real Estate Group · Rebuild Web (Webflow → Next.js)

> **Documento maestro del proyecto.** Léelo completo al inicio de cada sesión.
> Es la fuente única de verdad sobre qué construimos, cómo y por qué.

---

## ⚠️ REGLAS DE TRABAJO (LEER PRIMERO — NO NEGOCIABLES)

1. **Mantén este `CLAUDE.md` actualizado.**
   Con **cada cambio mayor** que se ordene (nueva página, cambio de stack, nueva
   integración, cambio de arquitectura, decisión importante), **actualiza este
   documento antes o junto con el código**. La sección `## 📒 CHANGELOG DEL PROYECTO`
   debe reflejar todo lo que el proyecto va acumulando. Si un cambio invalida algo
   escrito aquí, corrígelo aquí también. Este archivo debe poder explicarle el
   proyecto completo a alguien que llega de cero.

2. **No inundes el repo de commits ni PRs.**
   Trabaja **por fases** (ver `## 🗺️ PLAN POR FASES`). Cada fase = **una unidad de
   trabajo cohesiva = idealmente un solo commit/PR**. Agrupa cambios relacionados.
   No hagas un commit por archivo ni un PR por cada ajuste menor. Solo lo necesario.
   Prefiere completar una fase entera y luego commitear, en lugar de fragmentar.

3. **Pregunta antes de suponer.**
   Si en cualquier requisito, decisión de diseño, integración o acción importante
   te falta información o hay ambigüedad que afecte el resultado, **PREGUNTA**.
   No inventes contenido, datos, endpoints, credenciales, ni decisiones de UX
   importantes. Para acciones de bajo riesgo y reversibles, usa defaults sensatos
   y déjalos anotados. Para acciones importantes (estructura, datos reales,
   integraciones, forms que envían correo, deploy), confirma primero.

---

## 🎯 OBJETIVO DEL PROYECTO

Recrear el sitio web actual de **A&J Real Estate Group** (hoy en **Webflow**,
`ajrealestateva.com`) como una aplicación moderna en **Next.js 15**, mejorando
performance, SEO y mantenibilidad, y agregando **soporte bilingüe EN/ES**.

- **Tipo de trabajo:** Réplica fiel del diseño actual **+ pulido** de detalles
  (tipografía, espaciado, responsive, accesibilidad, velocidad). No es un rediseño
  total: el look & feel se mantiene, pero ejecutado mejor.
- **El CRM personalizado YA existe** y es independiente de este sitio. Este proyecto
  es **solo el sitio público / marketing**. Los listados de propiedades son
  **estáticos por ahora**, pero la capa de datos se diseña para poder conectarse
  al CRM o a un CMS más adelante sin reescribir la UI.

### Identidad de marca (debe reflejarse en todo el sitio)
A&J Real Estate Group es una marca inmobiliaria **bilingüe y familiar** para
familias en Virginia y Carolina del Norte (foco en **Hampton Roads**). Tono:
cálido, confiable, centrado en la familia, comunitario, moderno y cercano.
Audiencias clave: familias, familias militares, hogares hispanos, compradores
primerizos, clientes de reubicación.

---

## 🧱 STACK TÉCNICO

| Capa | Tecnología | Notas |
|---|---|---|
| Framework | **Next.js 16 (App Router)** | Última estable (el doc nació apuntando a 15; `create-next-app@latest` instaló 16, 100% App Router). Server Components por defecto. Turbopack. Convención `proxy.ts` (ex-`middleware.ts`) |
| Lenguaje | **TypeScript** | Estricto (`strict: true`) |
| Estilos | **Tailwind CSS** | Design tokens en `globals.css` / config |
| i18n | **next-intl** | Routing `[locale]`, EN/ES |
| Iconos | **lucide-react** | Consistencia visual |
| Imágenes | **next/image** | Optimización automática |
| Formularios | **React Hook Form + Zod** | Validación tipada |
| Envío de forms | *Por confirmar* (ver Fase 5) | Default propuesto: **Resend** (email) |
| Deploy | **Vercel** | Preview por rama + producción |
| Node | 20 LTS+ | |

> **Decisión abierta — manejo de formularios:** El sitio tiene 3 entradas de form
> (newsletter modal, contacto home, página contacto). Antes de implementar el envío
> real (Fase 5), **confirmar con el usuario**: ¿enviar por email vía Resend?,
> ¿integrar con el CRM existente vía webhook/API?, ¿usar un servicio tipo Formspree?
> No implementar envío real sin confirmar el destino.

---

## 🗂️ ESTRUCTURA DE CARPETAS (objetivo)

```
/
├── CLAUDE.md                      ← este archivo
├── messages/                      ← traducciones i18n
│   ├── en.json
│   └── es.json
├── src/
│   ├── app/
│   │   └── [locale]/
│   │       ├── layout.tsx         ← layout global (TopBar, Navbar, Footer, Modal)
│   │       ├── page.tsx           ← Home
│   │       ├── houses/page.tsx
│   │       ├── contact-us/page.tsx
│   │       └── team/[slug]/page.tsx   ← páginas de equipo (template único)
│   ├── components/
│   │   ├── layout/                ← TopBar, Navbar, Footer, NewsletterModal
│   │   ├── home/                  ← Hero, WhoWeAre, Stats, Testimonials, SalesStories
│   │   ├── houses/                ← PropertyCard, ListingsGrid
│   │   ├── team/                  ← TeamMemberProfile
│   │   ├── forms/                 ← ContactForm, NewsletterForm
│   │   └── ui/                    ← botones, inputs, primitivos reutilizables
│   ├── data/
│   │   ├── listings.ts            ← propiedades (estático, tipado)
│   │   └── team.ts                ← miembros del equipo
│   ├── lib/                       ← utils, helpers
│   └── styles/globals.css
├── public/
│   └── images/                    ← assets migrados del CDN de Webflow
└── ...config (next, tailwind, tsconfig, etc.)
```

---

## 🌐 ESTRATEGIA i18n (EN/ES)

- Routing por segmento `[locale]`: `/en/...` y `/es/...`.
- Locales soportados: `en`, `es`. **Locale por defecto: `en`** (replica el sitio
  actual, que está en inglés). *Decisión revisable* — dado el fuerte foco hispano,
  evaluar `es` como default; **confirmar con el usuario antes de fijarlo.**
- Toggle EN/ES visible en la **Navbar** (y/o TopBar). Debe conservar la ruta actual
  al cambiar de idioma.
- **Todo el texto de UI vive en `messages/en.json` y `messages/es.json`.**
  Nada de strings hardcodeados en componentes.
- Las traducciones al español deben sonar **naturales y cálidas**, no traducción
  mecánica. Preservar `ñ`, acentos y tono *amable*.
- Los **testimonios actuales están en español** en el sitio real — mantenerlos como
  contenido (no traducir el testimonio del cliente), pero sí traducir los rótulos
  de UI alrededor.

---

## 🧩 INVENTARIO DE PÁGINAS Y COMPONENTES

### Páginas (rutas, todas bajo `[locale]`)
- `/` — **Home**
- `/houses` — **Listados** (estáticos por ahora)
- `/contact-us` — **Contacto**
- `/team/[slug]` — **Equipo** → `adriana-melendez`, `john-leonard`,
  `melany-valencia`, `viviane-chiu`
  *(Nota: en Webflow son páginas separadas; aquí se unifican en un template con
  data en `data/team.ts`. El contenido exacto de cada bio debe extraerse de las
  páginas actuales en la fase correspondiente.)*

### Componentes globales (layout)
- **TopBar** — email, ubicación (Virginia, North Carolina, USA), redes (IG, FB, WhatsApp)
- **Navbar** — logo, links (Home, Houses, dropdown "Our Team"), teléfono, **toggle EN/ES**
- **Footer** — logo, navegación, contacto, redes, copyright
- **NewsletterModal** — modal de captura ("Stay Ahead in Real Estate Trends!")

### Componentes Home
- **Hero** — titular, subtítulo, CTA, retrato del equipo (tiene variante mobile distinta — replicar ambas)
- **WhoWeAre** — "// Who We Are", bios resumidas del equipo + badges (idiomas, familia, asistencia)
- **Stats** — +100 casas, +20 familias, +10 años
- **TestimonialsCarousel** — 6 tarjetas (familias García, Vázquez, Maduro, Flores, Ramírez, Cuevas)
- **SalesStories** — "// Our Sales", 4 cards con botón de play (video/historia) + CTA "Find Your Home"
- **ContactSection** — "Get a FREE consultation" + form

### Componentes Houses
- **PropertyCard** — imagen, nombre, precio, dirección, sqft, recámaras, baños
- **ListingsGrid** — grilla de cards desde `data/listings.ts`

### Componentes Equipo
- **TeamMemberProfile** — template de perfil individual

---

## 🗃️ CAPA DE DATOS (estática, preparada para futuro)

Los listados y el equipo viven en `/data` como objetos tipados. Diseñar los tipos
pensando en que **mañana puedan venir del CRM o un CMS** sin tocar la UI (misma
forma de datos, solo cambia la fuente).

### Seed de listados (del sitio actual — `data/listings.ts`)
| Nombre | Precio | Dirección | Sqft | Rec | Baños |
|---|---|---|---|---|---|
| Oakmont Manor | $370,000 | 3033 Somme Avenue, Norfolk, VA | 2092 | 4 | 2/1 |
| Westfield House | $299,900 | 3154 Locust Avenue, Norfolk, VA | 1206 | 4 | 2 |
| Westfield House | $149,900 | 307 Central Avenue, Suffolk, VA | 840 | 3 | 1 |

> Confirmar con el usuario si estos 3 son los listados a mostrar o si hay una lista
> actualizada antes de hardcodearlos como definitivos.

### Equipo (`data/team.ts`)
Adriana Meléndez (líder, mamá de tres, experta VA/NC), John Leonard (Navy en
servicio activo), Viviane Chiu (ingeniera civil, trilingüe), Melany Valencia
(bilingüe, nueva mamá). *Bios completas: extraer de las páginas actuales.*

---

## 🎨 GUÍA DE DISEÑO Y MARCA

- **Fidelidad:** replicar el diseño de Webflow y pulir (espaciado consistente,
  jerarquía tipográfica, estados hover/focus, responsive impecable, accesibilidad).
- **Tipografía (confirmada):** **Montserrat** (principal — cuerpo/UI) + **EB
  Garamond** (secundaria — títulos/display). Cargadas vía `next/font` y expuestas
  como tokens `--font-body` / `--font-display`.
- **Colores:** logo en navy y blanco → **navy como color primario**, blanco de base,
  acento por confirmar. **Extraer los hex exactos del sitio actual** y fijarlos como
  design tokens en Tailwind. No inventar la paleta.
- **Tono visual:** seguro, cálido, aspiracional pero realista, limpio y elegante
  (no llamativo). Momentos familiares reales, hogares cálidos, escenas comunitarias.

### Datos de marca / contacto (de referencia)
- Tel/WhatsApp: **(407) 715-9052** · `wa.me/message/QNHEYQ2V2MVLE1`
- Email: **adrysofirealestate@gmail.com**
  *(Ojo: el footer del sitio actual tiene un typo `adrisofirealestate@…` — usar el
  correcto.)*
- Instagram: `@adrysofi_realestate` · Facebook: `/adryrealestate`
- Cobertura: Virginia · North Carolina (foco Hampton Roads)
- Idiomas del equipo: Español · English · Português

---

## 🗺️ PLAN POR FASES

> **Una fase = una unidad de trabajo = idealmente un commit/PR.**
> Completa la fase, actualiza el CHANGELOG, luego commitea. Alinea con las
> ~3 sesiones de 5 h estimadas.

### 🔵 SESIÓN 1 — Fundación y layout
**Fase 0 — Setup**
Next.js 15 + TS + Tailwind + next-intl + estructura de carpetas + design tokens
(fuentes y colores extraídos del sitio real) + `messages/en.json` y `es.json` base.
**→ commit:** `chore: project setup + i18n scaffolding`

**Fase 1 — Layout global**
TopBar, Navbar (dropdown "Our Team" + toggle EN/ES), Footer, NewsletterModal.
**→ commit:** `feat: global layout (topbar, navbar, footer, modal)`

### 🟢 SESIÓN 2 — Home y listados
**Fase 2 — Home**
Hero (+ variante mobile), WhoWeAre, Stats, TestimonialsCarousel, SalesStories,
ContactSection. Todo con texto i18n.
**→ commit:** `feat: home page (all sections)`

**Fase 3 — Houses**
Capa de datos `data/listings.ts` + PropertyCard + ListingsGrid + hero de la página.
**→ commit:** `feat: houses listings page (static data)`

### 🟣 SESIÓN 3 — Equipo, contacto, pulido y deploy
**Fase 4 — Equipo + Contacto**
Template `team/[slug]` + 4 perfiles (extraer bios) + página `/contact-us`.
**→ commit:** `feat: team profiles + contact page`

**Fase 5 — Forms + SEO + responsive**
Wiring real de formularios (**confirmar destino primero**), metadata/OG por
página y locale, sitemap, favicon, pulido responsive y accesibilidad.
**→ commit:** `feat: form handling + seo + responsive polish`

**Fase 6 — Deploy + QA**
Deploy a Vercel, pruebas en preview, ajustes finales, revisión bilingüe.
**→ commit:** `chore: production deploy + QA fixes`

---

## 🔧 CONVENCIONES

- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`,
  `docs:`). Mensajes claros y en inglés. **Pocos y significativos.**
- **Ramas:** una rama por fase (`fase-2-home`, etc.) si se usan PRs; si no, commits
  directos por fase. No micro-PRs.
- **Componentes:** Server Components por defecto; `"use client"` solo cuando se
  necesite interactividad (modal, carousel, toggle, forms).
- **Sin strings hardcodeados:** todo texto visible pasa por i18n.
- **Accesibilidad:** roles ARIA en modal/carousel, alt en imágenes, focus visible.

---

## ❓ DECISIONES ABIERTAS (confirmar antes de implementar)
- [x] **Destino de los formularios** → CRM externo **ITMANO** vía `POST` JSON.
      Solo se implementa el **formulario de Contáctanos**; el resto NO se cablea.
      Endpoint: `POST https://app.itmano.com/api/intake/<PUBLIC_ID>/submit`
      (Contacto → `chn_qv8uhxg9qizl`). Body: `first_name`, `last_name`,
      `email` (req), `phone` (opc), `language` (es|en|pt), `intent`
      (compra|vende|invierte), `form_answers[]`. Manejar éxito/duplicado.
- [x] **Locale por defecto** → `en` (routing `localePrefix: "always"`: `/en`, `/es`).
- [x] **Rol de Supabase** → fuente de datos de **listados** y **equipo** (lectura
      pública vía anon key + RLS). Los formularios NO van a Supabase (van al CRM).
- [x] **Fuentes reales** → **Montserrat** (principal) + **EB Garamond**
      (secundaria). Ya cargadas vía `next/font`.
- [ ] **Paleta exacta (hex)** del sitio Webflow — *pendiente*: la extracción por
      red estuvo bloqueada en setup. Tokens actuales en `globals.css` son
      provisionales (escala navy + acento dorado). **Se necesitan los hex exactos.**
- [~] **Assets/imágenes reales** — parcial: `public/images/Logo.PNG` y
      `Team_Portrait_2.webp` ya están en el repo. Para lo que falte (testimonios,
      thumbnails de Sales Stories, contacto, etc.) se usará placeholder y se
      reportará en el chat.
- [ ] Lista definitiva de listados de propiedades (seed actual = 3 del sitio).
- [ ] Contenido/bios finales de cada miembro del equipo.
- [ ] ¿Agregar blog/recursos para SEO en una fase futura?

---

## 📒 CHANGELOG DEL PROYECTO

> Registrar aquí **cada cambio mayor** con fecha. Lo más reciente arriba.

- **2026-06-22** — **Fase 0 (Setup) completada.** Scaffold con `create-next-app`:
  **Next.js 16.2.9** + React 19 + TypeScript estricto + **Tailwind v4** (CSS-first
  con `@theme` en `globals.css`). i18n con **next-intl** (locales `en`/`es`,
  default `en`, `localePrefix: "always"`): `src/i18n/{routing,navigation,request}.ts`
  + `src/proxy.ts` (ex-middleware). App movida a `src/app/[locale]/`
  (`layout.tsx` con fuentes Playfair Display + Lato vía `next/font`, `page.tsx`
  placeholder, `not-found` global y por locale). **Design tokens** provisionales
  (escala navy + acento dorado) en `globals.css`. **messages/en.json** y `es.json`
  base. **Cliente Supabase** (`src/lib/supabase/{client,server}.ts`, anon key,
  lectura pública). **Capa de datos tipada** `src/data/{listings,team}.ts` (seed
  estático con la forma que servirá Supabase). Estructura de carpetas creada.
  **MCP** de Vercel agregado (`.mcp.json`). Decisiones cerradas: forms → CRM
  ITMANO (solo Contáctanos), locale default `en`, Supabase para listados+equipo.
  Pendiente: hex/fuentes exactos y assets reales del sitio Webflow.
- **2026-06-19** — Creación del `CLAUDE.md`. Definida la arquitectura inicial:
  Next.js 15 + TS + Tailwind + next-intl (EN/ES), listados estáticos preparados
  para futura conexión a CRM/CMS, réplica fiel + pulido del sitio Webflow actual.
  Plan en 6 fases sobre ~3 sesiones de 5 h.
