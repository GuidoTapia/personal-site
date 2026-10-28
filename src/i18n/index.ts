import { getCollection, type CollectionEntry } from 'astro:content';

export const languages = { en: 'English', es: 'Español' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'en';

export const ogLocale: Record<Lang, string> = { en: 'en_US', es: 'es_PE' };

export function langFromUrl(url: URL): Lang {
  return url.pathname.startsWith('/es/') || url.pathname === '/es' ? 'es' : 'en';
}

/** Prefixes a root-relative path for the given language: `/work/x/` → `/es/work/x/`. */
export function localePath(lang: Lang, path = '/'): string {
  return lang === defaultLang ? path : `/es${path}`;
}

/** The same page in the other language, for the switch and hreflang links. */
export function translatePath(url: URL, to: Lang): string {
  const base = url.pathname.replace(/^\/es(?=\/|$)/, '') || '/';
  return localePath(to, base);
}

/** Entry id without its language prefix: `es/robocup` → `robocup`. */
export const slugOf = (id: string) => id.slice(id.indexOf('/') + 1);

/** Published work for a language, falling back to English for entries with no translation yet. */
export async function getWork(lang: Lang): Promise<CollectionEntry<'work'>[]> {
  const all = await getCollection('work', ({ data }) => !data.draft);
  const en = all.filter(e => e.id.startsWith('en/'));
  return en
    .map(e => (lang === 'en' ? e : (all.find(t => t.id === `${lang}/${slugOf(e.id)}`) ?? e)))
    .sort((a, b) => a.data.order - b.data.order);
}

/** Roles for a language, newest first, with the same English fallback. */
export async function getJobs(lang: Lang): Promise<CollectionEntry<'jobs'>[]> {
  const all = await getCollection('jobs');
  const en = all.filter(e => e.id.startsWith('en/'));
  return en
    .map(e => (lang === 'en' ? e : (all.find(t => t.id === `${lang}/${slugOf(e.id)}`) ?? e)))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
