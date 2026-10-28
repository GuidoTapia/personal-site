# personal-site

Portfolio of Guido Tapia Oré, Solutions Technical Advisor and Technical Lead. Live at **https://guidore.netlify.app**.

Static site built with Astro, React islands, and React Three Fiber, deployed on Netlify. The hero renders the portrait as a particle field split into an **audit** side (wireframe scan) and a **build** side (solid relief). The 3D loads only on capable devices, and everyone else gets a CSS version of the same idea. All content is in the HTML, so the page works without JavaScript.

## Run it locally

```bash
nvm use         # Node 22.23.4, from .nvmrc
yarn
yarn dev        # http://localhost:4321
```

## Editing content

| What                                    | Where                                                            |
| --------------------------------------- | ---------------------------------------------------------------- |
| Experience                              | `src/content/jobs/<company>.md`                                  |
| Case studies and achievements           | `src/content/work/<slug>/index.md` (+ images in the same folder) |
| Name, role, links, hero numbers, skills | `src/data/site.ts`                                               |
| Section copy                            | `src/components/*.astro`                                         |

Run `yarn validate` (types + lint) before pushing. A push to `main` deploys to production.

## License

Code is MIT. Text, photos, and the resume are © Guido Tapia Oré.
