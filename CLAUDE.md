# CLAUDE.md

Personal portfolio for Guido Tapia Oré, shared with job applications. Live at https://guidore.netlify.app.

## Commands

```bash
yarn develop      # dev server at http://localhost:8000
yarn build        # production build into public/
yarn serve        # serve the production build at :9000
yarn validate     # type-check + lint (run before every commit)
yarn format       # prettier on the whole repo
yarn clean        # clear .cache and public/ (fixes most "stale schema" errors)
```

Node version is pinned in `.nvmrc` (22.x). Package manager is **yarn v1** (`yarn.lock`); do not add a `package-lock.json`.

## Deployment

- Netlify, continuous deployment from the `main` branch of `github.com/GuidoTapia/personal-site` (public repo).
- Build settings live in `netlify.toml` (`yarn build` → `public/`) and override the Netlify UI.
- **Pushing to `main` deploys to production.** Use a branch + PR for anything non-trivial; Netlify builds deploy previews for PRs.
- `siteUrl` in `gatsby-config.ts` is the canonical URL used for `og:image`, `og:url`, sitemap and robots.txt. If a custom domain is attached, change it there.
- `gatsby-plugin-offline` installs a service worker, so returning visitors can see a cached version until the worker updates.

## Architecture (Gatsby 5 + React 18 + TypeScript + styled-components 6)

- `content/` is the CMS. Each folder under `content/jobs/` and `content/featured/` has an `index.md` with frontmatter.
  - jobs: `date` (sort key, DESC), `title`, `company`, `location`, `range`, `url`; body is a bullet list.
  - featured: `date` (sort key, ASC, so `'1'`, `'2'` order the cards), `title`, `overline`, `cover` (relative image), `tech[]`, optional `github`, `external`, `cta`.
  - The frontmatter schema is declared explicitly in `gatsby-node.ts` (`createSchemaCustomization`). Add new fields there, or queries will fail when no file sets them.
- `src/components/sections/*` are the homepage sections; `src/pages/index.tsx` composes them.
- `src/config.ts` holds email, social links, nav links, and ScrollReveal defaults.
- `src/styles/` has the global styles, CSS variables (`variables.ts`), and mixins exposed through the styled-components theme. `DefaultTheme` is derived from `src/styles/theme.ts`, so you don't need a separate type to keep in sync.
- Path aliases (`@components`, `@config`, `@hooks`, `@styles`, `@utils`, `@images`) are defined twice and must match: `tsconfig.json` `paths` and the webpack aliases in `gatsby-node.ts`. Do not redeclare them in `src/types/*.d.ts`.
- `static/` is copied verbatim: `resume.pdf`, `og.png`, and the memoji logo videos (`.webm` for most browsers, `.MOV` HEVC-with-alpha for Safari).

## Conventions and gotchas

- Custom props on styled components must be transient (`$isActive`, `$menuOpen`) so they don't leak to the DOM.
- `scrollreveal` and `animejs` are null-loaded during SSR (`gatsby-node.ts`). Only touch them inside `useEffect`.
- Every animation respects `usePrefersReducedMotion`. Keep it that way for new effects (including any 3D).
- On the homepage, content renders only after the loader animation finishes, so the static HTML has no section content. Keep this in mind when reasoning about SEO and link previews.
- The repo often lives on an exFAT drive: `core.fileMode` is set to `false` and `._*` files are gitignored. Never commit `._*` files.
- The visual design comes from Brittany Chiang's v4 (MIT). Keep the footer credit and `LICENSE` while the design is derived from it.

## Content source of truth and writing style

- `context/Master_Career_Document.md` (gitignored, local only; it contains private data) is the source of truth for roles, dates, and metrics. Never publish anything that isn't in it, and never copy the phone number or references into the site.
- Binding style rules from that document:
  - No em dashes. Use a period, colon, parentheses, or semicolon. Use hyphens only for ranges (`2017-2022`, `2 to 10`).
  - Banned words: "it is worth noting", "overall", "in summary", "delve", "robust", "leveraging", "seamless", "cutting-edge", buzzword "end-to-end".
  - Use present tense for the current role (Designli) and past tense for past roles.
  - Don't name Designli clients; keep that work at the portfolio level (counts, languages, conversion).
  - Languages: JS/TS/Node/React/React Native/Python/.NET count as hands-on. Java/Swift/Kotlin/C++ are review and audit depth; don't present them as production experience.
- Voice: direct and specific, with a light personal touch (for example "making sure no one makes them crash right before the demo"). Keep the humor, but never trade accuracy for it.
- `static/resume.pdf` is generated from the LaTeX CV outside this repo. Update it there and copy it in.
