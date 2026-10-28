import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Build-time data for the story's "codebase city": this site's own source, one building per file.
// Footprint grows with line count, height with how many commits touched the file, and the
// files that are both large and often changed are flagged as hotspots (where an audit looks first).

export interface Building {
  x: number; // center, roughly in [-1, 1]
  z: number;
  w: number; // footprint, world units
  h: number; // height, world units
  hot: boolean;
}

export interface CodeCity {
  files: number;
  commits: number;
  buildings: Building[];
}

const TEXT = /\.(astro|tsx?|css|md|mjs|json)$/;

const git = (cmd: string) => {
  try {
    return execSync(`git ${cmd}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return ''; // no git (e.g. a tarball build): every file gets the same height
  }
};

export function getCodeCity(): CodeCity {
  const files = git('ls-files src')
    .split('\n')
    .filter(f => TEXT.test(f));

  const churn = new Map<string, number>();
  for (const line of git('log --no-merges --name-only --format= -- src').split('\n')) {
    if (line) churn.set(line, (churn.get(line) ?? 0) + 1);
  }
  const commits = Number(git('rev-list --count HEAD').trim()) || 0;

  const stats = files.map(path => {
    let lines = 1;
    try {
      lines = readFileSync(path, 'utf8').split('\n').length;
    } catch {
      // listed but unreadable: keep it as a small building
    }
    const dir = path.split('/').slice(0, -1).join('/');
    return { path, dir, lines, churn: churn.get(path) ?? 1 };
  });
  if (stats.length === 0) return { files: 0, commits, buildings: [] };

  const maxLines = Math.max(...stats.map(s => s.lines));
  const maxChurn = Math.max(...stats.map(s => s.churn));
  const scores = stats.map(s => s.lines * s.churn).sort((a, b) => b - a);
  const hotCut = scores[Math.max(0, Math.round(stats.length * 0.12) - 1)];

  // Districts are folders. Each one is a small square grid of lots; districts are packed into
  // shelves (rows) so the whole city ends up roughly square.
  const districts = new Map<string, typeof stats>();
  for (const s of stats) districts.set(s.dir, [...(districts.get(s.dir) ?? []), s]);
  const blocks = [...districts.values()]
    .map(list => ({ list, cols: Math.ceil(Math.sqrt(list.length)) }))
    .sort((a, b) => b.list.length - a.list.length);

  const total = blocks.reduce((n, b) => n + (b.cols + 1) ** 2, 0);
  const shelfWidth = Math.ceil(Math.sqrt(total) * 1.15);
  const raw: Building[] = [];
  let cx = 0;
  let cz = 0;
  let rowDepth = 0;
  for (const { list, cols } of blocks) {
    const rows = Math.ceil(list.length / cols);
    if (cx > 0 && cx + cols > shelfWidth) {
      cx = 0;
      cz += rowDepth + 1;
      rowDepth = 0;
    }
    list
      .sort((a, b) => b.lines - a.lines)
      .forEach((s, i) => {
        raw.push({
          x: cx + (i % cols) + 0.5,
          z: cz + Math.floor(i / cols) + 0.5,
          w: 0.3 + 0.55 * Math.sqrt(s.lines / maxLines),
          h: 0.15 + 1.6 * (Math.log1p(s.churn) / Math.log1p(maxChurn)),
          hot: s.lines * s.churn >= hotCut,
        });
      });
    cx += cols + 1;
    rowDepth = Math.max(rowDepth, rows);
  }

  // Center and scale into roughly [-1, 1] on x/z; heights scale with it.
  const width = Math.max(...raw.map(b => b.x)) + 0.5;
  const depth = Math.max(...raw.map(b => b.z)) + 0.5;
  const scale = 2 / Math.max(width, depth);
  const round = (n: number) => Math.round(n * 1000) / 1000;
  const buildings = raw.map(b => ({
    x: round((b.x - width / 2) * scale),
    z: round((b.z - depth / 2) * scale),
    w: round(b.w * scale),
    h: round(b.h * scale),
    hot: b.hot,
  }));

  return { files: stats.length, commits, buildings };
}
