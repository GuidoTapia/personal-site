# CLAUDE.md

Personal portfolio for Guido Tapia Oré, shared with job applications. Live at https://guidore.netlify.app.

## Commands

```bash
yarn dev          # dev server at http://localhost:4321
yarn build        # static build into dist/
yarn preview      # serve dist/ locally
yarn validate     # astro check (types) + eslint; run before every commit
yarn format       # prettier on the repo
```

Node is pinned in `.nvmrc` (22.23.4; Astro 7 needs ≥22.23.4). Package manager is **yarn v1** (`yarn.lock`). Don't name a script `check`: `yarn check` is a built-in yarn v1 command.

## Deployment

- Netlify, continuous deployment from `main` of `github.com/GuidoTapia/personal-site` (public repo). PRs get deploy previews.
- `netlify.toml` (`yarn build` → `dist/`) overrides the Netlify UI. It also holds security headers, immutable caching for `/_astro/*`, and 301s for the old Gatsby routes (`/pensieve/*`, `/archive`).
- **Pushing to `main` deploys to production.** Work on a branch and open a PR.
- **Netlify build minutes are limited.** Every push to a PR branch builds a deploy preview, and every merge builds production. Open a PR only when Guido asks for one. Batch related changes into one branch and one PR instead of several small ones, and push to an open PR branch as rarely as possible (verify locally with `yarn build && yarn preview` first).
- `site` in `astro.config.mjs` is the canonical origin (og:image, canonical, sitemap). `public/robots.txt` repeats it. Update both if a custom domain is attached.
- `public/sw.js` is a kill switch for the service worker the old Gatsby site installed. Keep it, and keep it uncached, for at least several months after the migration.

## Architecture (Astro 7, static, React 19 islands, three.js via React Three Fiber)

- Pages render to static HTML. Everything except the hero visual is zero-JS Astro. Content must stay readable without JavaScript.
- `src/content.config.ts` defines two collections (Zod schemas):
  - `jobs`: `src/content/jobs/{en,es}/<role>.md` (ids like `en/ravn`). Frontmatter: `date` (start, sorted newest first), `title`, `company`, `location`, `range`, `url` (optional), `track` (`engineering` by default; `teaching` and `community` render in the compact "Alongside the engineering" grid), `tech[]`. The body is the bullet list.
  - `work`: `src/content/work/<slug>/index.md`, its Spanish twin `index.es.md`, plus images (ids like `es/<slug>`). `kind` is `case-study` (numbered list) or `achievement` (card with a cover). `order` sorts. `metrics[]` show only on the case-study page, not the homepage. `links[]`, and an optional `cover` + `coverAlt`. Each entry gets `/work/<slug>/` and `/es/work/<slug>/`.
  - To pull projects from other repos later, add a loader in `content.config.ts`. Pages only depend on the schema.
- `src/data/site.ts`: language-neutral data (name, email, socials, resume, skills).
- **i18n (English at `/`, Spanish at `/es/`):**
  - `src/i18n/ui.ts` holds every UI string for both languages; the `satisfies` check fails the build if a key is missing in one.
  - `src/i18n/index.ts` has `langFromUrl`, `localePath`, `translatePath`, and `getWork` / `getJobs`, which fall back to English for entries with no translation.
  - `src/views/Home.astro` and `src/views/WorkEntry.astro` render both languages; `src/pages/` and `src/pages/es/` are thin wrappers. Section components take a `lang` prop.
  - The header EN/ES switch links to the same page in the other language. Base emits `hreflang` alternates and `og:locale`; the sitemap pairs the pages.
  - A new page or entry needs both languages. Spanish copy follows the MCD Spanish rules (first person implicit verbs, Peru-market anglicism list).
  - Resumes: `public/Guido-Resume-En.pdf` and `public/Guido-Resume-Es.pdf`, linked per language via `resumeUrl` in `ui.ts`. `/resume.pdf` 301s to the English one.
- `src/components/hero/`, the Understand / Build hero (the wireframe half is "understand", the solid half "build"; shader and CSS internals still call the left side "audit"):
  - `HeroVisual.tsx` (island, `client:idle`) renders the CSS poster: the same portrait as two layers split by `--split`. It drives `--split` from the pointer, or a slow idle sweep. It loads `HeroScene` lazily, only if the device passes `canRunScene()`: no reduced motion, no data saver, ≥4 cores, ≥4 GB memory, WebGL2.
  - `HeroScene.tsx` samples `src/assets/me.jpeg` (200px webp) into points by luminance. One custom shader draws the left of the split as a gridded wireframe with a scanline (understand) and the right as amber relief dots (build). The camera is orthographic, so screen x maps linearly to world x. Rendering pauses when the hero is offscreen.
  - You can grab and stretch the face (mouse/pen) or poke it (touch, so scrolling still works): `grab.ts` carries pointer state from `HeroVisual` to damped springs in `HeroScene`, which feed `uPull` / `uPoke` uniforms. The split holds still while grabbing.
  - The scene chunk is ~235 KB gzipped (three + R3F), shared with the story scene. Keep it lazy, and import three only in the lazy `*Scene.tsx` modules (`HeroScene.tsx`, `StoryScene.tsx`). `capability.ts` (the `canRunScene()` gate) and `portrait.ts` (photo sampling) are three-free.
- `src/components/Story.astro`, "How I got here", right after the hero: chapters scroll past a pinned stage where one particle cloud morphs face → robot → chip → blackboard → phone → codebase city → bar of music → board game → face rebuilt (all amber). The copy is chronological and follows a Story Spine: each chapter title is the turn ("But…", "Then…", "Because…") that the previous chapter caused, one concrete fact per chapter, and the last chapter calls back to the opening ("Almost 15 years…"). Every role should appear somewhere.
  - `story/shapes.ts` generates every chapter's points (same count, `xyz + heat`); `story/StoryScene.tsx` morphs between them in one shader (one `aT<i>` attribute per shape, generated from the count), driven by scroll progress from `story/StoryVisual.tsx` (`client:visible`).
  - The city is this repo's own `src/`, computed at build time by `src/lib/codeCity.ts` from `git ls-files` and `git log` (footprint = lines, height = commits touching the file, amber = top 12% by lines × commits). Without git every building gets the same height.
  - A small module script sets `data-scene="on"` before the island loads, so the layout doesn't jump. Without the scene (no JS, reduced motion, weak device) the chapters render as a plain grid and the city note is hidden.
- `src/styles/global.css` holds the design tokens (dark only, warm black + amber `#f5a524`, Geist + Geist Mono via Fontsource) and shared classes (`.container`, `.section`, `.eyebrow`, `.btn`, `.tags`, `.prose`, `.reveal`).
- `.reveal` is a CSS-only scroll animation (`animation-timeline: view()`). It's progressive, and off under reduced motion.
- Understand lens (header toggle, key `U`, `Esc` off): `src/scripts/lens.ts` + `src/styles/lens.css`. On first use it deep-clones `<main>` and the footer into an inert, aria-hidden overlay at the same document coordinates, clipped to a circle around the pointer (touch: drag the rim). The copy is restyled as a blueprint; labels come from `data-bp` attributes on component roots (code names, language-neutral), and it re-clones when `<main>` resizes.
- Lens gotcha: an `<astro-island>` in the live DOM hydrates again. The clone is built in a detached document, and islands, images, and videos become sized boxes before it is adopted. Keep it that way.
- Header memoji: `src/assets/memoji.png` is the still. The `.webm`/`.MOV` videos load only on hover (MOV for Safari, which lacks VP9 alpha).

## Conventions and gotchas

- **three is pinned to 0.182.0** because R3F 9 still constructs `THREE.Clock`, which logs a deprecation warning from r183 on. Upgrade three only once R3F switches to `THREE.Timer`, and check that the console stays clean.
- The React Compiler lint rules (`react-hooks` v7) forbid mutating hook return values. Mutate R3F objects inside `useFrame` through its state argument.
- `@emnapi/runtime` and `@emnapi/core` are explicit devDependencies because yarn v1 drops them and `astro check` fails without them.
- Every animation respects `prefers-reduced-motion`. New effects must too, and they must have a non-WebGL fallback.
- The repo often lives on an exFAT drive: `core.fileMode=false`, and `._*` is gitignored. Never commit `._*` files.
- Verify visual changes in a real browser at 1440px and 390px wide. Headless Chrome can screenshot sticky/translucent elements oddly: use `captureBeyondViewport: false`.

## Content source of truth and writing style

- `context/Master_Career_Document.md` (gitignored, local only; it contains private data) is the source of truth for roles, dates, and metrics. Publish nothing that isn't in it. Never put the phone number or references on the site.
- Binding style rules from that document:
  - No em dashes. Use a period, colon, parentheses, or semicolon. Use hyphens only for ranges (`2017-2022`, `2 to 10`).
  - Banned words: "it is worth noting", "overall", "in summary", "delve", "robust", "leveraging", "seamless", "cutting-edge", buzzword "end-to-end".
  - Use present tense for the current role (Designli) and past tense for past roles.
  - Don't name Designli clients; keep that work at the portfolio level (counts, languages, conversion).
  - Hands-on: JS/TS, Node, React, React Native, Python, .NET. Review and audit depth only: Java, Swift, Kotlin, C++. The About section splits them deliberately.
  - Don't claim impact numbers that are still being measured (see the funnel case study).
- Voice: first person, direct and specific, with a light personal touch ("making sure no one makes them crash right before the demo"). Keep the humor, but never trade accuracy for it.
- The resume PDFs and `public/og.png` are generated outside the build. The resume comes from the LaTeX CV; regenerate the OG card if the role or tagline changes.
