import type { Lang } from './index';

// Every user-facing string outside the content collections, per language. Keep both in sync:
// the `satisfies` check below fails the build when a key exists in one language only.
const en = {
  meta: {
    role: 'Solutions Technical Advisor · Technical Lead',
    jobTitle: 'Solutions Technical Advisor & Technical Lead',
    description:
      'Guido Tapia Oré is a full-stack engineer and technical lead who audits codebases, turns the findings into plans people can act on, and ships React and Node.js products.',
  },
  a11y: {
    skip: 'Skip to content',
    home: 'home',
    openMenu: 'Open menu',
    primaryNav: 'Primary',
    language: 'Language',
    technologies: 'Technologies',
    skills: 'Skills',
  },
  nav: { work: 'Work', experience: 'Experience', about: 'About', contact: 'Contact' },
  resume: 'Resume',
  resumePdf: 'Resume (PDF)',
  resumeUrl: '/Guido-Resume-En.pdf',
  lens: {
    label: 'Understand',
    hint: 'Understand lens: see how this page is built. Press U',
    drag: 'Drag to explore',
  },
  hero: {
    availability: 'Open to new opportunities',
    location: 'Arequipa, Peru',
    taglineUnderstand: ['First I ', 'understand', ' the system.'],
    taglineBuild: ['Then I help ', 'build', ' what comes next.'],
    lede: 'I’m a full-stack engineer. I read codebases in whatever language they come in, find what will break, and explain it so the people behind the product can decide what to do next. Then I help build it: web and mobile apps in React, Node.js, and React Native, with teams across the US and Europe.',
    cta: 'See the work',
    visualLabel:
      'Portrait of Guido Tapia Oré, split into a wireframe half for understanding and a solid half for building',
    understand: 'Understand',
    build: 'Build',
    stretch: 'Drag to stretch',
    poke: 'Tap to poke',
  },
  story: {
    eyebrow: '01 · How I got here',
    title: 'Same habit since I was 12: take it apart, then build it.',
    steps: [
      {
        kicker: '2012-2018 · Arequipa to Nagoya',
        title: 'I joined a robotics club by accident.',
        body: 'At 12 I signed up for school groups without knowing what they were and ended up on a competition robotics team. Programming and robotics contests followed, my first world competition came in 2014, and in 2017 I led the UCSP team that won the RoboCup Junior Soccer SuperTeams world championship in Nagoya. Second in Montreal the year after.',
      },
      {
        kicker: '2017-2019 · Apselom, Edusoftnet',
        title: 'Then the robots needed real hardware.',
        body: 'I designed smart waste-monitoring devices and wrote the C libraries behind them, which cut their debugging time in half, and automated school bell systems. All while studying Computer Science at UCSP, near the top of the university-wide ranking.',
      },
      {
        kicker: 'Since childhood · Music',
        title: 'The other half of my brain plays in an orchestra.',
        body: 'I play several instruments, compose, and arrange, and I’ve worked with Peruvian bands, mostly symphonic. Arranging is writing inside someone else’s piece: every new part has to fit what’s already there. Auditing a codebase is the same job with worse documentation.',
      },
      {
        kicker: 'Now · Designli',
        title: 'Now I read other teams’ code for a living.',
        body: 'More than 40 prospective clients’ codebases since January 2026, in whatever language they come in, looking for where they will break first. Three years of teaching IT and robotics taught me the other half: explaining it so people act on it.',
      },
      {
        kicker: 'Thesis · in progress',
        title: 'And a tool for the smallest players.',
        body: 'My Computer Science thesis comes from a hobby, board games: a tool that helps independent creators compete with publishers that have years of experience and far bigger budgets.',
      },
      {
        kicker: 'Next',
        title: 'Then I help build yours.',
        body: 'Web and mobile products in React, Node.js, and React Native, with teams in the US and Europe, plus freelance work for Peruvian companies. Same pieces, rebuilt so they hold up.',
      },
    ],
    // {files} is replaced at build time
    cityNote:
      'This city is this site’s own source: {files} files. Taller means changed more often; amber is where I’d look first.',
  },
  work: {
    eyebrow: '02 · Work',
    title: 'Things I’ve audited, fixed, and built.',
    read: 'Read →',
    beyond: 'Beyond the day job',
  },
  experience: {
    eyebrow: '03 · Experience',
    title: 'Where I’ve worked.',
    alongside: 'Alongside the engineering',
    degree: 'Computer Science degree',
    school: 'Universidad Católica San Pablo',
    degreeNote: 'Studied while working, from the robotics lab to client projects.',
    more: ['The full history is in my ', 'resume', '.'],
  },
  about: {
    eyebrow: '04 · About',
    title: 'The short version.',
    body: [
      'Hey there, I’m Guido. I build full-stack web and mobile apps, but my real specialty is making sure no one makes them crash right before the demo. These days that instinct is my job: I read other teams’ codebases, find what will break, and explain it in terms a founder can act on.',
      'I started in hardware. I built school automation and smart waste-monitoring devices in Arequipa, and led the team that won the RoboCup Junior Soccer world championship in 2017. Then I spent over four years at RAVN, where I grew from trainee to software engineer, led teams of 2 to 10 developers, and cut onboarding for new hires from three months to one.',
      'I work in Spanish and English, with intermediate-advanced French, remotely with teams in the US and Europe. When I’m not doing any of that, I’m occasionally using my free time to compose the next summer hit.',
    ],
    ship: 'I ship with',
    review: 'I review and audit',
    reviewNote:
      'Languages I read and reason about in client audits, alongside everything in the list above.',
  },
  contact: {
    eyebrow: '05 · Contact',
    title: 'Let’s talk.',
    body: 'I’m open to new opportunities: full-time roles in full-stack engineering, technical leadership, or solutions advisory, remote or on-site, and project proposals too. Whether you have a role in mind, a codebase you want a second opinion on, or just want to say hi, my inbox is open and I’ll get back to you.',
  },
  footer: { built: 'Designed and built with Astro and React Three Fiber.', source: 'View source' },
  case: {
    back: '← All work',
    caseStudy: 'Case study',
    achievement: 'Achievement',
    stack: 'Stack and tools',
    links: 'Links',
    next: 'Next',
    nextLabel: 'Next case study',
  },
  notFound: {
    title: 'Page not found',
    heading: 'This page didn’t pass the audit.',
    body: 'The link may be from an older version of this site. Everything current is on the homepage.',
    back: 'Back home',
  },
};

type Dict = typeof en;

const es = {
  meta: {
    role: 'Asesor Técnico de Soluciones · Líder Técnico',
    jobTitle: 'Asesor Técnico de Soluciones y Líder Técnico',
    description:
      'Guido Tapia Oré es ingeniero full-stack y líder técnico: audita bases de código, convierte los hallazgos en planes accionables y construye productos con React y Node.js.',
  },
  a11y: {
    skip: 'Ir al contenido',
    home: 'inicio',
    openMenu: 'Abrir menú',
    primaryNav: 'Principal',
    language: 'Idioma',
    technologies: 'Tecnologías',
    skills: 'Habilidades',
  },
  nav: { work: 'Trabajo', experience: 'Experiencia', about: 'Sobre mí', contact: 'Contacto' },
  resume: 'CV',
  resumePdf: 'CV (PDF)',
  resumeUrl: '/Guido-Resume-Es.pdf',
  lens: {
    label: 'Entender',
    hint: 'Lente Entender: mira cómo está construida esta página. Presiona U',
    drag: 'Arrastra para explorar',
  },
  hero: {
    availability: 'Abierto a nuevas oportunidades',
    location: 'Arequipa, Perú',
    taglineUnderstand: ['Primero ', 'entiendo', ' el sistema.'],
    taglineBuild: ['Después ayudo a ', 'construir', ' lo que sigue.'],
    lede: 'Soy ingeniero full-stack. Leo bases de código en el lenguaje que vengan, encuentro lo que se va a romper y lo explico para que las personas detrás del producto decidan qué hacer. Después ayudo a construirlo: apps web y móviles con React, Node.js y React Native, junto a equipos en EE. UU. y Europa.',
    cta: 'Ver el trabajo',
    visualLabel:
      'Retrato de Guido Tapia Oré, dividido en una mitad de malla para entender y una mitad sólida para construir',
    understand: 'Entender',
    build: 'Construir',
    stretch: 'Arrastra para estirar',
    poke: 'Toca para empujar',
  },
  story: {
    eyebrow: '01 · Cómo llegué aquí',
    title: 'La misma costumbre desde los 12: desarmarlo y luego construirlo.',
    steps: [
      {
        kicker: '2012-2018 · De Arequipa a Nagoya',
        title: 'Entré a la robótica por accidente.',
        body: 'A los 12 me inscribí en grupos del colegio sin saber de qué trataban y terminé en un equipo de robótica de competencia. Vinieron concursos de programación y robótica, mi primer mundial en 2014 y, en 2017, lideré el equipo de la UCSP que ganó el campeonato mundial de RoboCup Junior Soccer SuperTeams en Nagoya. Al año siguiente quedamos segundos en Montreal.',
      },
      {
        kicker: '2017-2019 · Apselom, Edusoftnet',
        title: 'Después, los robots necesitaron hardware de verdad.',
        body: 'Diseñé dispositivos inteligentes de monitoreo de residuos y escribí las librerías en C detrás de ellos, que redujeron su tiempo de depuración a la mitad, y automaticé sistemas de timbres escolares. Todo mientras estudiaba Ciencia de la Computación en la UCSP, entre los primeros puestos del ranking general de la universidad.',
      },
      {
        kicker: 'Desde niño · Música',
        title: 'La otra mitad de mi cabeza toca en una orquesta.',
        body: 'Toco varios instrumentos, compongo y hago arreglos, y he colaborado con bandas peruanas, sobre todo en lo sinfónico. Arreglar es escribir dentro de la obra de otro: cada parte nueva tiene que encajar con lo que ya existe. Auditar una base de código es el mismo trabajo, con peor documentación.',
      },
      {
        kicker: 'Hoy · Designli',
        title: 'Hoy leo el código de otros equipos como trabajo.',
        body: 'Más de 40 bases de código de clientes potenciales desde enero de 2026, en el lenguaje que vengan, buscando dónde se van a romper primero. Tres años enseñando informática y robótica me dieron la otra mitad: explicarlo para que la gente actúe.',
      },
      {
        kicker: 'Tesis · en curso',
        title: 'Y una herramienta para los más pequeños.',
        body: 'Mi tesis de Ciencia de la Computación nace de un hobby, los juegos de mesa: una herramienta para que creadores independientes compitan con editoriales con años de experiencia y presupuestos mucho mayores.',
      },
      {
        kicker: 'Lo que sigue',
        title: 'Después ayudo a construir el tuyo.',
        body: 'Productos web y móviles con React, Node.js y React Native, junto a equipos en EE. UU. y Europa, además de trabajos freelance para empresas peruanas. Las mismas piezas, reconstruidas para que aguanten.',
      },
    ],
    cityNote:
      'Esta ciudad es el código de este mismo sitio: {files} archivos. Más alto significa que cambió más seguido; en ámbar, donde miraría primero.',
  },
  work: {
    eyebrow: '02 · Trabajo',
    title: 'Lo que he auditado, arreglado y construido.',
    read: 'Leer →',
    beyond: 'Más allá del trabajo',
  },
  experience: {
    eyebrow: '03 · Experiencia',
    title: 'Dónde he trabajado.',
    alongside: 'Además de la ingeniería',
    degree: 'Ciencia de la Computación',
    school: 'Universidad Católica San Pablo',
    degreeNote: 'Estudié mientras trabajaba, del laboratorio de robótica a proyectos con clientes.',
    more: ['La historia completa está en mi ', 'CV', '.'],
  },
  about: {
    eyebrow: '04 · Sobre mí',
    title: 'La versión corta.',
    body: [
      'Hola, soy Guido. Construyo apps web y móviles full-stack, pero mi verdadera especialidad es asegurarme de que nadie las haga caer justo antes de la demo. Hoy ese instinto es mi trabajo: leo las bases de código de otros equipos, encuentro lo que se va a romper y lo explico en términos que un fundador pueda usar para decidir.',
      'Empecé en hardware. Construí automatización para colegios y dispositivos inteligentes de monitoreo de residuos en Arequipa, y lideré el equipo que ganó el campeonato mundial de RoboCup Junior Soccer en 2017. Después pasé más de cuatro años en RAVN, donde crecí de trainee a ingeniero de software, lideré equipos de 2 a 10 desarrolladores y reduje el onboarding de nuevas contrataciones de tres meses a uno.',
      'Trabajo en español e inglés, con francés intermedio-avanzado, de forma remota con equipos en EE. UU. y Europa. Cuando no estoy en nada de eso, de vez en cuando uso mi tiempo libre para componer el próximo hit del verano.',
    ],
    ship: 'Construyo con',
    review: 'Reviso y audito',
    reviewNote:
      'Lenguajes que leo y analizo en auditorías para clientes, además de todo lo de la lista anterior.',
  },
  contact: {
    eyebrow: '05 · Contacto',
    title: 'Conversemos.',
    body: 'Estoy abierto a nuevas oportunidades: roles a tiempo completo en ingeniería full-stack, liderazgo técnico o asesoría de soluciones, remotos o presenciales, y también propuestas de proyectos. Si tienes un rol en mente, una base de código que quieres que revise o solo quieres saludar, escríbeme y te respondo.',
  },
  footer: { built: 'Diseñado y construido con Astro y React Three Fiber.', source: 'Ver código' },
  case: {
    back: '← Todo el trabajo',
    caseStudy: 'Caso de estudio',
    achievement: 'Logro',
    stack: 'Stack y herramientas',
    links: 'Enlaces',
    next: 'Siguiente',
    nextLabel: 'Siguiente caso de estudio',
  },
  notFound: {
    title: 'Página no encontrada',
    heading: 'Esta página no pasó la auditoría.',
    body: 'El enlace puede ser de una versión anterior de este sitio. Todo lo actual está en la página principal.',
    back: 'Volver al inicio',
  },
} satisfies Dict;

export const ui: Record<Lang, Dict> = { en, es };
