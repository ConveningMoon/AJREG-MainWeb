# AGENTS.md — A&J Real Estate Group · sitio público (Next.js)

Guía operativa para agentes de código (Codex y similares). Es corta a propósito:
dice **cómo trabajar aquí**. La historia completa, el detalle de cada página y el
changelog viven en [`CLAUDE.md`](CLAUDE.md) (documento maestro, en español) — léelo
para entender una feature antes de tocarla. Contexto de producto y diseño:
[`PRODUCT.md`](PRODUCT.md), [`DESIGN.md`](DESIGN.md) y `.impeccable/surfaces/`.

## Qué es este proyecto

Sitio de marketing de **A&J Real Estate Group** (familias en Virginia y Carolina del
Norte, foco Hampton Roads), migrado de Webflow a **Next.js 16 (App Router)**,
bilingüe **EN/ES**. El CRM (**ITMANO**) es un producto aparte: este repo solo
muestra datos y le envía leads. Dominio de producción: `ajrealestateva.com`
(deploy en Vercel; preview por rama).

## Reglas de trabajo (no negociables)

1. **Mantén `CLAUDE.md` al día.** Todo cambio mayor (página nueva, integración,
   decisión de arquitectura) se registra en su sección de fase y en
   `## 📒 CHANGELOG DEL PROYECTO` (lo más reciente arriba, con fecha), en el mismo
   cambio que el código. Si algo escrito allí deja de ser cierto, corrígelo.
2. **No inundes el repo de commits ni PRs.** Una unidad de trabajo cohesiva = un
   commit. Nada de un commit por archivo ni un PR por ajuste menor.
3. **Pregunta antes de suponer.** No inventes copy, precios, fechas, cupos, datos de
   contacto, endpoints ni credenciales. Para decisiones de bajo riesgo y reversibles
   usa un default sensato y déjalo anotado; para estructura, datos reales,
   integraciones, formularios que envían correo o deploy, confirma primero.
4. **No ejecutes acciones con efectos externos sin que te lo pidan:** commit, push,
   deploy, enviar un lead de prueba al CRM, escribir en Supabase o en el Google Sheet
   de sponsors. En pruebas de formularios se verifica validación, cuerpo enviado y
   estados; **no se crean leads reales de prueba** (así se ha hecho hasta ahora).

## Stack (versiones que importan)

- **Next.js 16.2** + React 19 + TypeScript `strict`. **No es el Next que recuerdas:**
  `middleware.ts` ahora es `src/proxy.ts`, y hay APIs distintas. Antes de usar una
  API de Next que no hayas visto en este repo, lee la doc incluida en
  `node_modules/next/dist/docs/` (empieza por `index.md`).
- **Tailwind CSS v4**, CSS-first: tokens en `@theme` dentro de `src/app/globals.css`.
  No hay `tailwind.config.js`.
- **next-intl** (`[locale]`, `en`/`es`, `localePrefix: "always"`, default `en`).
- React Hook Form + Zod 4 para formularios, `motion` (LazyMotion), lucide-react,
  `@tsparticles/slim` y `canvas-confetti` solo en las páginas de campaña.
- Supabase (solo lectura, **anon key**) para listados y ediciones de newsletter.

## Comandos (Windows — leer esto antes de correr nada)

La ruta del repo contiene un **`&`** (`...\A&J\main-web-ajreg`), y en esta máquina
`npx` se rompe con ella (`Cannot find module ...\Escritorio\typescript\bin\tsc`).
Invoca los binarios con `node` directamente, desde la raíz del repo:

```bash
node node_modules/next/dist/bin/next dev -p 3100        # servidor de desarrollo
node node_modules/next/dist/bin/next build              # build de producción (SSG/ISR)
node node_modules/typescript/bin/tsc --noEmit           # tipos
node node_modules/eslint/bin/eslint.js <archivos>       # lint de lo que tocaste
node --test src/lib/affordability.test.ts               # tests (node:test, sin runner extra)
```

- Los tests son `node:test` y se ejecutan con el Node de esta máquina (v24, que quita los tipos solo); sus
  imports llevan extensión `.ts`. Hay tests en `src/lib/` (`affordability`,
  `feel-good-social-crm`, `hogar/`…). Si añades lógica pura, añade su test al lado.
- `npm run <script>` no se ha probado con esta ruta; si falla, usa las líneas de arriba.
- Si `tsc` se queja de `@tsparticles/*` o `canvas-confetti`: están en `package.json`
  pero pueden faltar en `node_modules` → `npm install`. No es un error de tu cambio.
- **Dev server y Tailwind:** una clase con valor arbitrario y variante responsive
  (`lg:max-w-[16rem]`) **no se emitió** en `next dev` ni tras reiniciar; la utilidad
  de la escala (`lg:max-w-64`) sí. Prefiere la escala de Tailwind y verifica en el
  navegador que la regla existe (la causa no está investigada).

## Cómo verificar antes de dar algo por terminado

1. `tsc --noEmit` (ignora solo los errores de dependencias faltantes de arriba) y
   ESLint sobre los archivos que tocaste.
2. Ver el resultado **renderizado**: desktop **1440×900** y móvil **390×844**, en
   **ES y EN**, sin scroll horizontal. No basta con que compile.
3. Si tocaste rutas, datos, i18n o metadata: `next build` completo.
4. Reporta fielmente lo que corriste y lo que no (por ejemplo, "no corrí `next build`").

## Mapa rápido del código

```
messages/{en,es}.json            ← TODO el texto visible
src/app/[locale]/…               ← páginas (home, houses, team, contact-us, newsletter,
                                    check-in, resources, giveaway, hogar, events/…)
src/app/api/…                    ← route handlers (contact-us, check-in, sponsors, …)
src/components/{layout,home,houses,team,forms,events,giveaway,hogar,ui}/
src/data/                        ← datos estáticos tipados (team, christmasGala, …)
src/lib/                         ← integraciones, esquemas Zod, motores puros + tests
src/proxy.ts · src/i18n/         ← detección/ruteo de idioma
next.config.ts                   ← redirects (/hogar → /es/hogar) y rewrites first-party
integrations/google-apps-script/ ← script del formulario de sponsors
scripts/og/                      ← generadores de imágenes para compartir
```

## i18n

- **Nada de strings hardcodeados** en componentes: claves en `messages/en.json` y
  `messages/es.json`, **las dos a la vez**. Mismo árbol de claves en ambos archivos.
- El español debe sonar **natural y cálido**, no traducido a máquina. Conserva `ñ` y
  acentos. Los testimonios de clientes se quedan en español (no se traducen).
- El toggle EN/ES conserva la ruta. Las páginas de campaña (`/giveaway`, `/hogar`)
  cambian de idioma sin navegar; `feel-good-social` es en inglés a propósito.
- Los mensajes con `{placeholders}` que se leen con `t.raw()` no se formatean;
  pásales valores con `t()` o interpola tú. Los que llevan `<em>` en el JSON se
  leen crudos (ICU los trataría como etiqueta rica).

## Dónde va cada formulario (no los mezcles)

| Formulario | Destino | Cómo |
|---|---|---|
| `/contact-us` | ITMANO canal contacto | `POST /api/contact-us` (server) → webhook con header `x-contact-secret` (`CONTACT_WEBHOOK_SECRET`) |
| `/check-in` | ITMANO canal `chn_x5yxx15jt7wf` | `POST /api/check-in` (server), mismo secreto |
| `/newsletter` + modal | ITMANO intake **público** | navegador → `/api/intake/<canal>/submit` (rewrite first-party). Exige `consent_text` = frase exacta de la casilla |
| `/giveaway`, `/hogar`, `/events/feel-good-social` | ITMANO intake **público** | igual: navegador + rewrite, honeypot vacío, sin secreto |
| `/events/christmas-gala/sponsors` | **Google Sheet + email a Adriana** (NO ITMANO) | `POST /api/sponsors` → Apps Script; envs solo servidor `SPONSOR_SHEET_*`; tras el 28-nov-2026 la API responde 410 |

- El cliente **nunca** llama al CRM con secreto; los secretos solo existen en el
  servidor. Los formularios de captación pública tienen **honeypot**, validación con
  Zod y confirmación inmediata con cola de reintento cuando aplica.
- Los consentimientos se guardan con **la frase exacta** que vio la persona
  (+ versión + idioma + timestamp). Si cambias el copy de un consentimiento, sube su
  versión. Hoy los términos son **solo correo**: no prometas SMS, WhatsApp ni llamadas
  donde el equipo no los hará.
- **Nada de formularios a Supabase.** Supabase es solo lectura.

## Datos y secretos

- **Listados** ← base del CRM (`lib/listings.ts`, tenant `tenant-aj`,
  `published_to_web = true`) con **lista explícita de columnas**: `select('*')` da 401
  porque `anon` tiene grants por columna. Mantiene fallback al seed estático. El
  **equipo** es 100 % estático (`data/team.ts`). Las ediciones de newsletter salen de
  la misma base (`lib/newsletter.ts`).
- Embeds de propiedades (tours 3D, video, mapas): solo se aceptan urls de una lista
  blanca de hosts y la web construye su propio `<iframe>`. Nunca
  `dangerouslySetInnerHTML` con HTML que venga de datos.
- **Secretos:** `.env.local` está ignorado; `.env.example` documenta cada variable
  (sin valores reales). **No imprimas, copies al chat ni commitees** valores de
  `.env*`, `CONTACT_WEBHOOK_SECRET`, `SPONSOR_SHEET_SECRET` ni tokens. Una variable
  `NEXT_PUBLIC_*` llega al navegador: nada sensible ahí. Variable nueva → también a
  `.env.example` y a la nota de la fase en `CLAUDE.md`. Hay que configurarla además en
  Vercel (eso lo hace una persona).
- No toques `.claude/settings.local.json` (puede tener tokens).

## Medios pesados (video, audio, PDF grandes)

**No se commitean al repo** (además vive dentro de OneDrive). Se alojan en **Vercel
Blob** y el código guarda la URL absoluta. Ejemplo vigente: el video vertical 9:16 del
hero de la landing de sponsors se configura en `galaEvent.invitationVideo`
(`src/data/christmasGala.ts`, `{ src, poster? }`); mientras sea `null` se ve el slate
"Muy pronto" en la misma caja 9:16. Formato recomendado: H.264 + AAC, `+faststart`,
≲ 15 MB. Las imágenes pequeñas sí van en `public/images/` (preferir `.webp`) y con
`next/image`.

## Diseño y marca

- Tipografía: **Montserrat** (cuerpo/UI) y **EB Garamond** (títulos), vía `next/font`
  (`--font-body`, `--font-display`). Colores como tokens en `globals.css`: navy
  `#102037`, slate `#597383`, taupe `#49443e`, crema `#fff7f5`, blush `#e9d8d0`, gold
  `#c7a260`. Usa los tokens, no hex sueltos (salvo en arte de campaña ya existente).
- Look: cálido, confiable, elegante, nada llamativo. Bordes: `rounded-sm` en CTAs y
  tarjetas estructurales; `rounded-full` solo en pills pequeños.
- Las páginas de campaña (`/giveaway`, `/hogar`, `/events/…`) pueden tener su propio
  mundo visual **sin tocar los tokens globales**. Antes de rediseñar una, lee su
  contrato en `.impeccable/surfaces/` y `DESIGN.md`.
- Accesibilidad: roles ARIA en modal/carousel, `alt` en imágenes, foco visible,
  `prefers-reduced-motion` respetado en toda animación (nieve, confeti, partículas).
- Componentes **Server por defecto**; `"use client"` solo para interactividad.
  Librerías de animación/partículas pesadas se cargan con `next/dynamic` y solo en
  la página que las usa.

## Datos de marca (para copy y metadata)

- Tel/WhatsApp **(407) 715-9052** · email **adrysofirealestate@gmail.com** (el
  footer de Webflow tenía un typo `adrisofi…`: no lo reproduzcas).
- Instagram `@adrysofi_realestate` · Facebook `/adryrealestate`.
- Cobertura: Virginia y Carolina del Norte (Hampton Roads). Idiomas: ES · EN · PT.
- Gala Christmas Party: **sábado 5-dic-2026, 7–11 PM**, The Royal Courtyard at West
  Neck, Virginia Beach. Cierre de sponsors **28-nov-2026 23:59 ET**. `spotsLeft` es un
  número de exhibición pedido por el cliente (no hay cupo real).

## Git

- **Commits:** Conventional Commits en **inglés** (`feat:`, `fix:`, `chore:`,
  `refactor:`, `docs:`), pocos y significativos.
- **Antes de ramificar:** `git fetch origin`. La `main` local suele ir atrás de
  `origin/main` y hay ramas de feature sin fusionar; ramifica desde `origin/main`
  (`git switch -c <rama> origin/main`) salvo que te indiquen otra base.
- Una rama por unidad de trabajo. Sin `--force`, sin saltarte hooks. No hagas commit
  ni push si no te lo piden. No reviertas cambios ajenos que encuentres sin commitear.

## Grafo de conocimiento (opcional)

Si existe `graphify-out/` y el CLI `graphify` está en el PATH:
`graphify query "<pregunta>"` / `graphify explain "<concepto>"` orientan más rápido que
recorrer el repo; tras modificar código, `graphify update .`. Es una ayuda: los hooks de
`.claude/settings.json` que lo exigen son de Claude Code y no aplican a otros agentes.
`graphify-out/graph.json` y `GRAPH_REPORT.md` están commiteados; `graph.html` y `cache/`
no.
