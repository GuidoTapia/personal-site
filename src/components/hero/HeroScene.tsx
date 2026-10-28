import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import type { Grab } from './grab';
import { samplePortrait, type Portrait } from './portrait';

interface Props {
  sample: string;
  splitRef: RefObject<number>;
  grabRef: RefObject<Grab>;
  active: boolean;
  onReady: () => void;
}

// Portrait spans [-1, 1] on both axes; this leaves a margin around it.
const VIEW_HEIGHT = 2.15;
const AUDIT_CELL = 0.022;
// Stretch: how far the grabbed region can be pulled (world units), its radius, and the springs.
const MAX_PULL = 0.75;
const GRAB_RADIUS = 0.32;
const PULL_STIFFNESS = 140;
const PULL_DAMPING = 9; // well under critical (2 * sqrt(140) ≈ 24), so the face wobbles as it settles
const POKE_STIFFNESS = 90;
const POKE_DAMPING = 7;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSplit;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uScanY;
  uniform float uCell;
  uniform float uKeep;
  uniform vec2 uGrab;
  uniform vec2 uPull;
  uniform vec3 uPoke; // xy = center, z = strength
  attribute float aLum;
  attribute float aRand;
  varying float vLum;
  varying float vSide;
  varying float vScan;
  varying float vKeep;

  void main() {
    // Which side of the divider this point sits on, measured in world space (0 = audit, 1 = build).
    float worldX = (modelMatrix * vec4(position, 1.0)).x;
    float side = smoothstep(uSplit - 0.02, uSplit + 0.02, worldX);

    // Audit: snap to a flat grid and keep a sparse subset, like a scan of the structure.
    vec3 audit = vec3(floor(position.xy / uCell) * uCell + uCell * 0.5, 0.0);
    // Build: full relief with a slow breathing motion.
    vec3 build = position;
    build.z += sin(uTime * 0.9 + aRand * 6.2831) * 0.015;

    vec3 pos = mix(audit, build, side);

    // Stretch: points near the grab point follow the pull with a soft falloff and a little
    // per-point lag, and bulge toward the camera. A poke pushes points out from the tap.
    vec2 fromGrab = position.xy - uGrab;
    float pull = exp(-dot(fromGrab, fromGrab) / (${GRAB_RADIUS} * ${GRAB_RADIUS}));
    pos.xy += uPull * pull * (0.85 + aRand * 0.3);
    pos.z += length(uPull) * pull * 0.35;
    vec2 fromPoke = position.xy - uPoke.xy;
    float poke = exp(-dot(fromPoke, fromPoke) / 0.06);
    pos.xy += normalize(fromPoke + 1e-4) * uPoke.z * poke * (0.8 + aRand * 0.4);
    pos.z += uPoke.z * poke * 0.5;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float auditSize = uSize * 2.1;
    float buildSize = uSize * (0.6 + aLum * 0.9);
    gl_PointSize = mix(auditSize, buildSize, side) * uPixelRatio;

    vLum = aLum;
    vSide = side;
    vScan = (1.0 - side) * smoothstep(0.12, 0.0, abs(position.y - uScanY));
    vKeep = mix(step(aRand, uKeep), 1.0, side);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uAccent;
  uniform vec3 uInk;
  varying float vLum;
  varying float vSide;
  varying float vScan;
  varying float vKeep;

  void main() {
    if (vKeep < 0.5) discard;
    vec2 uv = gl_PointCoord - 0.5;
    vec3 color;
    float alpha;

    if (vSide < 0.5) {
      // Hollow square: a wireframe cell.
      float d = max(abs(uv.x), abs(uv.y));
      float edge = smoothstep(0.5, 0.44, d) * smoothstep(0.32, 0.4, d);
      alpha = edge * (0.22 + vLum * 0.78) + vScan * 0.55 * smoothstep(0.5, 0.0, d);
      color = mix(uInk * 0.8, uAccent, clamp(vScan * 1.4, 0.0, 1.0));
    } else {
      // Soft round dot: solid, amber-lit.
      float d = length(uv);
      alpha = smoothstep(0.5, 0.15, d) * (0.45 + vLum * 0.55);
      color = mix(uAccent * 0.55, mix(uAccent, vec3(1.0, 0.94, 0.84), 0.6), vLum);
    }

    if (alpha < 0.02) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

function Points({
  portrait,
  splitRef,
  grabRef,
  onReady,
}: { portrait: Portrait } & Omit<Props, 'sample' | 'active'>) {
  const group = useRef<THREE.Group>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const readyCalled = useRef(false);
  // Spring state for the stretch and the poke, advanced every frame.
  const springs = useRef({ px: 0, py: 0, vx: 0, vy: 0, poke: 0, pokeV: 0, lastPoke: 0 });
  const size = useThree(state => state.size);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(portrait.positions, 3));
    g.setAttribute('aLum', new THREE.BufferAttribute(portrait.lum, 1));
    g.setAttribute('aRand', new THREE.BufferAttribute(portrait.rand, 1));
    return g;
  }, [portrait]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSplit: { value: 0 },
      uSize: { value: 2.4 },
      uPixelRatio: { value: 1 },
      uScanY: { value: 1.2 },
      uCell: { value: AUDIT_CELL },
      // Fraction of points kept on the audit side; higher when sampling fewer points (mobile).
      uKeep: { value: portrait.lum.length > 12000 ? 0.3 : 0.75 },
      uGrab: { value: new THREE.Vector2() },
      uPull: { value: new THREE.Vector2() },
      uPoke: { value: new THREE.Vector3() },
      uAccent: { value: new THREE.Color(0.961, 0.647, 0.141) },
      uInk: { value: new THREE.Color(0.925, 0.91, 0.882) },
    }),
    [portrait],
  );

  useFrame(({ clock, gl, camera }, delta) => {
    const m = material.current;
    const g = group.current;
    if (!m || !g) return;

    // Fit the portrait height to the canvas. With an orthographic camera, screen x maps linearly to world x.
    const zoom = size.height / VIEW_HEIGHT;
    if (camera instanceof THREE.OrthographicCamera && camera.zoom !== zoom) {
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
    }

    const t = clock.getElapsedTime();
    const split = splitRef.current ?? 0.55;
    const viewWidth = size.width / zoom;

    m.uniforms.uTime.value = t;
    m.uniforms.uSplit.value = (split - 0.5) * viewWidth;
    m.uniforms.uPixelRatio.value = gl.getPixelRatio();
    // Point size scales with the canvas so density looks the same at any width.
    m.uniforms.uSize.value =
      Math.max(1.6, (size.height / 600) * 2.4) * (portrait.step > 1 ? 1.7 : 1);
    // Scanline sweeps top to bottom over the audit side.
    m.uniforms.uScanY.value = 1.25 - ((t * 0.32) % 2.6);

    // Stretch springs. While held, the pull follows the cursor (capped); once released it
    // springs back to rest. Pixels convert to world units through the camera zoom.
    const grab = grabRef.current;
    const sp = springs.current;
    const dt = Math.min(delta, 1 / 30);
    if (grab?.down) {
      let tx = (grab.x - grab.startX) / zoom;
      let ty = -(grab.y - grab.startY) / zoom;
      const len = Math.hypot(tx, ty);
      if (len > MAX_PULL) {
        // Soft cap: keeps stretching a little past the limit instead of stopping dead.
        const capped = MAX_PULL + (len - MAX_PULL) * 0.15;
        tx *= capped / len;
        ty *= capped / len;
      }
      // Track velocity too, so letting go mid-drag flings the face instead of stopping it.
      const follow = Math.min(1, dt * 18);
      const nx = sp.px + (tx - sp.px) * follow;
      const ny = sp.py + (ty - sp.py) * follow;
      sp.vx = (nx - sp.px) / Math.max(dt, 1e-3);
      sp.vy = (ny - sp.py) / Math.max(dt, 1e-3);
      sp.px = nx;
      sp.py = ny;
      m.uniforms.uGrab.value.set(grab.startX / zoom, -grab.startY / zoom);
    } else {
      sp.vx += (-PULL_STIFFNESS * sp.px - PULL_DAMPING * sp.vx) * dt;
      sp.vy += (-PULL_STIFFNESS * sp.py - PULL_DAMPING * sp.vy) * dt;
      sp.px += sp.vx * dt;
      sp.py += sp.vy * dt;
    }
    m.uniforms.uPull.value.set(sp.px, sp.py);

    if (grab && grab.poke !== sp.lastPoke) {
      sp.lastPoke = grab.poke;
      sp.pokeV += 2.2;
      m.uniforms.uPoke.value.x = grab.pokeX / zoom;
      m.uniforms.uPoke.value.y = -grab.pokeY / zoom;
    }
    sp.pokeV += (-POKE_STIFFNESS * sp.poke - POKE_DAMPING * sp.pokeV) * dt;
    sp.poke += sp.pokeV * dt;
    m.uniforms.uPoke.value.z = sp.poke;

    // Moving the divider also turns the head slightly, which reveals the depth relief.
    const targetY = (split - 0.5) * 0.35 + Math.sin(t * 0.4) * 0.04;
    g.rotation.y += (targetY - g.rotation.y) * Math.min(1, delta * 4);
    g.rotation.x = Math.sin(t * 0.3) * 0.03;

    if (!readyCalled.current) {
      readyCalled.current = true;
      onReady();
    }
  });

  return (
    <group ref={group}>
      <points geometry={geometry}>
        <shaderMaterial
          ref={material}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export default function HeroScene({ sample, splitRef, grabRef, active, onReady }: Props) {
  const [portrait, setPortrait] = useState<Portrait | null>(null);

  useEffect(() => {
    let cancelled = false;
    const step = window.matchMedia('(max-width: 760px)').matches ? 2 : 1;
    samplePortrait(sample, step)
      .then(p => !cancelled && setPortrait(p))
      .catch(() => {
        // Keep the CSS poster if sampling fails.
      });
    return () => {
      cancelled = true;
    };
  }, [sample]);

  if (!portrait) return null;

  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 5], near: 0.1, far: 20 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      frameloop={active ? 'always' : 'never'}
      aria-hidden="true">
      <Points portrait={portrait} splitRef={splitRef} grabRef={grabRef} onReady={onReady} />
    </Canvas>
  );
}
