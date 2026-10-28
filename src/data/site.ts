export const site = {
  name: 'Guido Tapia Oré',
  shortName: 'Guido Tapia',
  role: 'Solutions Technical Advisor · Technical Lead',
  description:
    'Guido Tapia Oré is a Solutions Technical Advisor and Technical Lead who audits codebases, writes the proposals that win the work, and ships React and Node.js products.',
  location: 'Arequipa, Peru',
  availability: 'Open to remote roles',
  email: 'guido.tapia.ore@gmail.com',
  resume: '/resume.pdf',
  repo: 'https://github.com/GuidoTapia/personal-site',
};

export const socials = [
  { name: 'GitHub', url: 'https://github.com/GuidoTapia' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/gl-tapia-ore-2601/' },
  { name: 'Instagram', url: 'https://www.instagram.com/guido.ore' },
];

export const nav = [
  { label: 'Work', href: '/#work' },
  { label: 'Experience', href: '/#experience' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
];

// Headline numbers under the hero. Each must be traceable to the career document.
export const highlights = [
  { value: '40+', label: 'codebases audited at Designli' },
  { value: '~15 days', label: 'average between new clients signed from my proposals' },
  { value: '3 → 1 mo', label: 'onboarding time for junior hires at RAVN' },
  { value: '2017', label: 'RoboCup Junior Soccer world champion' },
];

// Hands-on vs review depth is a deliberate, honest split (see CLAUDE.md).
export const skills = {
  ship: [
    'TypeScript',
    'React & Next.js',
    'Node.js',
    'React Native',
    'Python',
    'C# / .NET',
    'PostgreSQL',
    'AWS',
  ],
  review: ['Java', 'Swift', 'Kotlin', 'C++', 'SonarQube'],
};
