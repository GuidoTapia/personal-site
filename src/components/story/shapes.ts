import type { Portrait } from '@/components/hero/portrait';
import type { Building } from '@/lib/codeCity';

// Point clouds for each story chapter, all with the same point count so the scene can morph
// between them. Each point is 4 floats: x, y, z, heat (0 = wireframe "understand" cell,
// 1 = amber "build" dot). y is up; every shape fits roughly in [-1.1, 1.1].

export type Cloud = Float32Array;

// Small deterministic PRNG, so shapes look the same on every visit.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Emit = (x: number, y: number, z: number, heat: number) => void;

// Fill `n` points from weighted parts. Each part draws one point per call.
function build(n: number, seed: number, parts: [number, (r: () => number, emit: Emit) => void][]) {
  const out = new Float32Array(n * 4);
  const r = rng(seed);
  let i = 0;
  const emit: Emit = (x, y, z, heat) => {
    if (i >= n) return;
    out.set([x, y, z, heat], i * 4);
    i++;
  };
  const total = parts.reduce((s, [w]) => s + w, 0);
  for (const [w, part] of parts) {
    const count = Math.round((w / total) * n);
    for (let k = 0; k < count; k++) part(r, emit);
  }
  while (i < n) parts[0][1](r, emit); // rounding leftovers
  return out;
}

const TAU = Math.PI * 2;

// The hero portrait, resampled to n points. `split` keeps the hero's look (left half wireframe,
// right half amber); without it every point is amber, the "rebuilt" final chapter.
export function faceCloud(p: Portrait, n: number, split: boolean): Cloud {
  const out = new Float32Array(n * 4);
  const total = p.lum.length;
  const r = rng(7);
  for (let i = 0; i < n; i++) {
    const j = total > n ? Math.floor(r() * total) : i % total;
    const x = p.positions[j * 3];
    out.set(
      [
        x * 0.95,
        p.positions[j * 3 + 1] * 0.95,
        p.positions[j * 3 + 2],
        split ? (x > 0 ? 1 : 0) : 1,
      ],
      i * 4,
    );
  }
  return out;
}

// An original soccer robot drawn as a wireframe: a round chassis (rings and struts), an amber
// top deck, a kicker at the front, three wheels, and the ball on a center-circle arc.
export function robotCloud(n: number): Cloud {
  const base = -0.5;
  const R = 0.5;
  return build(n, 11, [
    // chassis rings
    [
      22,
      (r, e) => {
        const a = r() * TAU;
        const level = Math.floor(r() * 4) / 3;
        e(Math.cos(a) * R, base + 0.1 + level * 0.36, Math.sin(a) * R, 0);
      },
    ],
    // vertical struts
    [
      8,
      (r, e) => {
        const a = (Math.floor(r() * 12) / 12) * TAU;
        e(Math.cos(a) * R, base + 0.1 + r() * 0.36, Math.sin(a) * R, 0);
      },
    ],
    // top deck, a solid amber disc with a raised ring
    [
      20,
      (r, e) => {
        const a = r() * TAU;
        if (r() < 0.7) {
          const rad = 0.3 * Math.sqrt(r());
          e(Math.cos(a) * rad, base + 0.62, Math.sin(a) * rad, 1);
        } else {
          e(Math.cos(a) * 0.3, base + 0.46 + r() * 0.16, Math.sin(a) * 0.3, 1);
        }
      },
    ],
    // wheels, low on the sides
    [
      6,
      (r, e) => {
        const a = (Math.floor(r() * 3) / 3) * TAU + 0.5;
        const t = Math.PI * (1 + r());
        const [tx, tz] = [-Math.sin(a), Math.cos(a)];
        e(
          Math.cos(a) * R + tx * Math.cos(t) * 0.1,
          base + 0.1 + Math.sin(t) * 0.1,
          Math.sin(a) * R + tz * Math.cos(t) * 0.1,
          0,
        );
      },
    ],
    // kicker at the front
    [6, (r, e) => e((r() - 0.5) * 0.34, base + 0.06 + r() * 0.16, R + 0.04, 1)],
    // the ball
    [
      16,
      (r, e) => {
        const u = r() * 2 - 1;
        const t = r() * TAU;
        const s = Math.sqrt(1 - u * u);
        e(0.05 + s * Math.cos(t) * 0.15, base + 0.15 + u * 0.15, 0.82 + s * Math.sin(t) * 0.15, 1);
      },
    ],
    // center-circle arc on the pitch
    [
      10,
      (r, e) => {
        const a = r() * TAU;
        e(Math.cos(a) * 1.0, base, Math.sin(a) * 1.0 * 0.9, 0);
      },
    ],
  ]);
}

// A chip on a board: package, glowing die, pins on all four sides, and traces routed outward
// with a 45 degree bend, like the boards behind the waste-monitoring devices.
export function chipCloud(n: number): Cloud {
  const y = -0.15;
  const half = 0.42;
  const pins = 9;
  return build(n, 23, [
    // package top
    [26, (r, e) => e((r() * 2 - 1) * half, y + 0.07, (r() * 2 - 1) * half, 0)],
    // die
    [9, (r, e) => e((r() * 2 - 1) * 0.16, y + 0.075, (r() * 2 - 1) * 0.16, 1)],
    // pins
    [
      12,
      (r, e) => {
        const side = Math.floor(r() * 4);
        const k = Math.floor(r() * pins);
        const along = ((k + 0.5) / pins) * 2 - 1;
        const out = half + r() * 0.1;
        const across = along * half * 0.92 + (r() - 0.5) * 0.025;
        const [x, z] = [
          [out, across],
          [-out, across],
          [across, out],
          [across, -out],
        ][side];
        e(x, y + 0.02, z, 0);
      },
    ],
    // traces: straight out, then a 45 degree bend, ending in a pad
    [
      53,
      (r, e) => {
        const side = Math.floor(r() * 4);
        const k = Math.floor(r() * pins);
        const along = (((k + 0.5) / pins) * 2 - 1) * half * 0.92;
        const t = r();
        const first = 0.12 + ((k * 37) % 5) * 0.04;
        const bendDir = along >= 0 ? 1 : -1;
        const len = first + 0.45;
        const d = t * len;
        let o = half + 0.1 + Math.min(d, first);
        let a = along;
        if (d > first) {
          o += (d - first) * 0.707;
          a += bendDir * (d - first) * 0.707;
        }
        const [x, z] = [
          [o, a],
          [-o, a],
          [a, o],
          [a, -o],
        ][side];
        e(x, y, z, 1);
      },
    ],
  ]);
}

// The codebase city: wireframe buildings (edges and roof outline), hotspots in amber.
export function cityCloud(n: number, buildings: Building[]): Cloud {
  if (buildings.length === 0) return robotCloud(n);
  const base = -0.45;
  const scale = 0.95;
  // Points per building follow its edge length, so tall buildings get more.
  const weights = buildings.map(b => 4 * b.h + 8 * b.w);
  const sum = weights.reduce((s, w) => s + w, 0);
  let run = 0;
  const cumulative = weights.map(w => (run += w) / sum);
  return build(n, 31, [
    [
      88,
      (r, e) => {
        const pick = r();
        const b =
          buildings[
            Math.max(
              0,
              cumulative.findIndex(c => c >= pick),
            )
          ];
        const hw = (b.w / 2) * scale;
        const x0 = b.x * scale;
        const z0 = b.z * scale;
        const h = b.h * scale;
        const heat = b.hot ? 1 : 0;
        const sx = r() < 0.5 ? -1 : 1;
        const sz = r() < 0.5 ? -1 : 1;
        const kind = r();
        if (kind < 0.45) {
          e(x0 + sx * hw, base + r() * h, z0 + sz * hw, heat); // vertical edge
        } else if (kind < 0.85) {
          // roof outline
          const t = (r() * 2 - 1) * hw;
          if (r() < 0.5) e(x0 + t, base + h, z0 + sz * hw, heat);
          else e(x0 + sx * hw, base + h, z0 + t, heat);
        } else {
          // a few floor lines on the walls
          const floor = Math.floor(r() * Math.max(1, h / 0.08)) * 0.08;
          const t = (r() * 2 - 1) * hw;
          e(x0 + t, base + Math.min(floor, h), z0 + sz * hw, heat);
        }
      },
    ],
    // street grid on the ground
    [
      6,
      (r, e) => {
        const line = Math.round((r() * 2 - 1) * 6) / 6;
        const t = r() * 2 - 1;
        if (r() < 0.5) e(line * 1.05, base, t * 1.05, 0);
        else e(t * 1.05, base, line * 1.05, 0);
      },
    ],
  ]);
}

// A bar of a score: five staff lines (bent slightly in depth so it reads as 3D), amber note
// heads with stems, beams joining pairs, and a sustained tie arcing over the end.
export function scoreCloud(n: number): Cloud {
  const gap = 0.13;
  const bend = (x: number) => -0.25 * x * x; // the page curls away at the edges
  // Notes as [x, staff step]; step 0 is the bottom line, every step is half a gap.
  const notes: [number, number][] = [
    [-0.82, 2],
    [-0.6, 4],
    [-0.38, 3],
    [-0.16, 6],
    [0.06, 5],
    [0.28, 7],
    [0.5, 4],
    [0.72, 2],
  ];
  const head = (r: () => number, e: Emit, [x, step]: [number, number]) => {
    const a = r() * TAU;
    const rad = Math.sqrt(r());
    const nx = x + Math.cos(a) * rad * 0.06;
    e(nx, -0.26 + step * (gap / 2) + Math.sin(a) * rad * 0.042, bend(nx), 1);
  };
  const stemTop = (step: number) => -0.26 + step * (gap / 2) + 0.36;
  return build(n, 41, [
    // staff lines
    [
      34,
      (r, e) => {
        const x = (r() * 2 - 1) * 1.05;
        e(x, -0.26 + Math.floor(r() * 5) * gap, bend(x), 0);
      },
    ],
    // bar lines at both ends
    [
      4,
      (r, e) => {
        const x = r() < 0.5 ? -1.05 : 1.05;
        e(x, -0.26 + r() * 4 * gap, bend(x), 0);
      },
    ],
    [30, (r, e) => head(r, e, notes[Math.floor(r() * notes.length)])],
    // stems, on the right of each head
    [
      12,
      (r, e) => {
        const [x, step] = notes[Math.floor(r() * notes.length)];
        const y0 = -0.26 + step * (gap / 2);
        const sx = x + 0.055;
        e(sx, y0 + r() * (stemTop(step) - y0), bend(sx), 0);
      },
    ],
    // beams joining notes in pairs, sloped from one stem top to the next
    [
      14,
      (r, e) => {
        const k = Math.floor(r() * 4) * 2;
        const [x1, s1] = notes[k];
        const [x2, s2] = notes[k + 1];
        const t = r();
        const x = x1 + 0.055 + t * (x2 - x1);
        const thick = r() * 0.035;
        e(x, stemTop(s1) + t * (stemTop(s2) - stemTop(s1)) - thick, bend(x), 1);
      },
    ],
    // a tie arcing over the last two notes
    [
      6,
      (r, e) => {
        const t = r();
        const x = 0.5 + t * 0.22;
        e(x, -0.26 + 3 * (gap / 2) - 0.08 - Math.sin(t * Math.PI) * 0.07, bend(x) + 0.02, 1);
      },
    ],
  ]);
}

// A board game on the table: a hex board in wireframe with a few claimed (amber) tiles, two
// pawns, and a die. A nod to the thesis: tools for small board game creators.
export function boardCloud(n: number): Cloud {
  const y = -0.4;
  const size = 0.17; // hex radius
  const w = Math.sqrt(3) * size;
  const hexes: [number, number][] = [];
  for (let q = -3; q <= 3; q++) {
    for (let rr = Math.max(-3, -q - 3); rr <= Math.min(3, -q + 3); rr++) {
      hexes.push([w * (q + rr / 2), 1.5 * size * rr]);
    }
  }
  const claimed = new Set([4, 9, 10, 17, 22, 23, 30]);
  const corner = (k: number) => {
    const a = (Math.PI / 3) * k + Math.PI / 6;
    return [Math.cos(a) * size, Math.sin(a) * size];
  };
  const pawns: [number, number][] = [
    [-0.32, 0.18],
    [0.42, -0.3],
  ];
  return build(n, 53, [
    // hex outlines
    [
      40,
      (r, e) => {
        const [cx, cz] = hexes[Math.floor(r() * hexes.length)];
        const k = Math.floor(r() * 6);
        const [ax, az] = corner(k);
        const [bx, bz] = corner(k + 1);
        const t = r();
        e(cx + ax + (bx - ax) * t, y, cz + az + (bz - az) * t, 0);
      },
    ],
    // claimed tiles, filled
    [
      18,
      (r, e) => {
        const ids = [...claimed];
        const [cx, cz] = hexes[ids[Math.floor(r() * ids.length)]];
        const a = r() * TAU;
        const rad = Math.sqrt(r()) * size * 0.8;
        e(cx + Math.cos(a) * rad, y + 0.005, cz + Math.sin(a) * rad, 1);
      },
    ],
    // pawns: a round head on a flared body
    [
      22,
      (r, e) => {
        const [px, pz] = pawns[Math.floor(r() * pawns.length)];
        const a = r() * TAU;
        if (r() < 0.4) {
          const u = r() * 2 - 1;
          const s = Math.sqrt(1 - u * u);
          e(px + s * Math.cos(a) * 0.075, y + 0.36 + u * 0.075, pz + s * Math.sin(a) * 0.075, 1);
        } else {
          const h = r();
          const rad = 0.13 - h * 0.09;
          e(px + Math.cos(a) * rad, y + h * 0.3, pz + Math.sin(a) * rad, 1);
        }
      },
    ],
    // a die: cube edges with pips on the top face
    [
      20,
      (r, e) => {
        const [dx, dz, s] = [0.05, -0.62, 0.11];
        if (r() < 0.8) {
          const axis = Math.floor(r() * 3);
          const t = (r() * 2 - 1) * s;
          const a = r() < 0.5 ? -s : s;
          const b = r() < 0.5 ? -s : s;
          const p = axis === 0 ? [t, a, b] : axis === 1 ? [a, t, b] : [a, b, t];
          e(dx + p[0], y + s + p[1], dz + p[2], 0);
        } else {
          const pips: [number, number][] = [
            [-0.5, -0.5],
            [0, 0],
            [0.5, 0.5],
          ];
          const [ux, uz] = pips[Math.floor(r() * 3)];
          const a = r() * TAU;
          const rad = Math.sqrt(r()) * 0.022;
          e(dx + ux * s + Math.cos(a) * rad, y + 2 * s, dz + uz * s + Math.sin(a) * rad, 1);
        }
      },
    ],
  ]);
}

// A phone, standing up and turned a little: wireframe body, feed cards on the screen, and five
// amber stars above it (the app rescued from a 1-star rating).
export function phoneCloud(n: number): Cloud {
  const [hw, hh, depth] = [0.36, 0.72, 0.06];
  const cy = -0.12;
  const star = (k: number, t: number) => {
    // a five-pointed star outline, walked by t in [0, 1)
    const seg = Math.floor(t * 10);
    const f = t * 10 - seg;
    const pt = (i: number) => {
      const a = Math.PI / 2 + (i * Math.PI) / 5;
      const rad = i % 2 === 0 ? 0.085 : 0.036;
      return [Math.cos(a) * rad, Math.sin(a) * rad];
    };
    const [ax, ay] = pt(seg);
    const [bx, by] = pt(seg + 1);
    return [(k - 2) * 0.2 + ax + (bx - ax) * f, cy + hh + 0.2 + ay + (by - ay) * f];
  };
  return build(n, 67, [
    // body outline, front and back, with rounded corners
    [
      30,
      (r, e) => {
        const t = r() * 4;
        const side = Math.floor(t);
        const f = t - side;
        let [x, y] = [
          [-hw + f * 2 * hw, -hh],
          [hw, -hh + f * 2 * hh],
          [hw - f * 2 * hw, hh],
          [-hw, hh - f * 2 * hh],
        ][side];
        const rc = 0.08;
        const ex = Math.abs(x) - (hw - rc);
        const ey = Math.abs(y) - (hh - rc);
        if (ex > 0 && ey > 0) {
          const a = Math.atan2(ey, ex);
          x = Math.sign(x) * (hw - rc + Math.cos(a) * rc);
          y = Math.sign(y) * (hh - rc + Math.sin(a) * rc);
        }
        e(x, cy + y, r() < 0.65 ? depth : -depth, 0);
      },
    ],
    // feed cards on the screen
    [
      24,
      (r, e) => {
        const card = Math.floor(r() * 4);
        const top = hh - 0.14 - card * 0.32;
        const t = r();
        const kind = r();
        let x;
        let y;
        if (kind < 0.6) {
          // card outline
          const s = Math.floor(t * 4);
          const f = t * 4 - s;
          [x, y] = [
            [-0.28 + f * 0.56, top],
            [0.28, top - f * 0.24],
            [0.28 - f * 0.56, top - 0.24],
            [-0.28, top - 0.24 + f * 0.24],
          ][s];
        } else {
          // two lines of "text"
          x = -0.2 + t * (kind < 0.8 ? 0.4 : 0.25);
          y = top - (kind < 0.8 ? 0.08 : 0.15);
        }
        e(x, cy + y, depth + 0.005, 0);
      },
    ],
    // avatar dots on each card
    [
      8,
      (r, e) => {
        const card = Math.floor(r() * 4);
        const a = r() * TAU;
        const rad = Math.sqrt(r()) * 0.035;
        e(
          -0.235 + Math.cos(a) * rad,
          cy + hh - 0.22 - card * 0.32 + Math.sin(a) * rad,
          depth + 0.01,
          1,
        );
      },
    ],
    // five stars above the phone
    [
      20,
      (r, e) => {
        const [x, y] = star(Math.floor(r() * 5), r());
        e(x, y, depth + 0.1, 1);
      },
    ],
  ]);
}

// A blackboard: wireframe frame and chalk lines, with an amber diagram (nodes and the edges
// between them), the kind you draw when explaining how a robot decides where to go.
export function blackboardCloud(n: number): Cloud {
  const [hw, hh] = [0.95, 0.55];
  const nodes: [number, number][] = [
    [0.1, 0.3],
    [-0.15, 0.02],
    [0.38, 0.05],
    [-0.32, -0.28],
    [0.05, -0.3],
    [0.58, -0.26],
  ];
  const edges: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
    [2, 4],
  ];
  return build(n, 79, [
    // frame
    [
      22,
      (r, e) => {
        const t = r() * 4;
        const s = Math.floor(t);
        const f = t - s;
        const [x, y] = [
          [-hw + f * 2 * hw, -hh],
          [hw, -hh + f * 2 * hh],
          [hw - f * 2 * hw, hh],
          [-hw, hh - f * 2 * hh],
        ][s];
        e(x, y, r() * 0.04, 0);
      },
    ],
    // chalk "notes" down the left side
    [
      12,
      (r, e) => {
        const line = Math.floor(r() * 5);
        e(-0.82 + r() * (0.32 - (line % 2) * 0.1), 0.36 - line * 0.16, 0.01, 0);
      },
    ],
    // edges of the diagram
    [
      22,
      (r, e) => {
        const [a, b] = edges[Math.floor(r() * edges.length)];
        const t = r();
        e(
          nodes[a][0] + (nodes[b][0] - nodes[a][0]) * t,
          nodes[a][1] + (nodes[b][1] - nodes[a][1]) * t,
          0.01,
          0,
        );
      },
    ],
    // nodes, as amber rings with a filled center
    [
      26,
      (r, e) => {
        const [x, y] = nodes[Math.floor(r() * nodes.length)];
        const a = r() * TAU;
        const rad = r() < 0.6 ? 0.075 : Math.sqrt(r()) * 0.04;
        e(x + Math.cos(a) * rad, y + Math.sin(a) * rad, 0.015, 1);
      },
    ],
  ]);
}
