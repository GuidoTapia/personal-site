# personal-site

Portfolio of Guido Tapia Oré, Solutions Technical Advisor and Technical Lead. Live at **https://guidore.netlify.app**.

Built with Gatsby 5, React 18, TypeScript, and styled-components, deployed on Netlify.

## Run it locally

```bash
nvm use        # Node 22, from .nvmrc
yarn
yarn develop   # http://localhost:8000
```

## Editing content

- Experience: `content/jobs/<Company>/index.md`
- Featured work and achievements: `content/featured/<Name>/index.md` (with a cover image in the same folder)
- Hero, about, and contact copy: `src/components/sections/`
- Email, social links, and nav: `src/config.ts`

Run `yarn validate` (type-check + lint) before pushing. A push to `main` deploys to production.

## Credits

The design is adapted from [Brittany Chiang's v4](https://github.com/bchiang7/v4) (MIT).
