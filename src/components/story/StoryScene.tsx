import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import { samplePortrait } from '@/components/hero/portrait';
import type { Building } from '@/lib/codeCity';
import {
  boardCloud,
  blackboardCloud,
  chipCloud,
  cityCloud,
  faceCloud,
  phoneCloud,
  robotCloud,
  scoreCloud,
} from './shapes';

interface Props {
  sample: string;
  buildings: Building[];
  progressRef: RefObject<number>; // 0 = face, then one step per chapter, ending on the face rebuilt
  active: boolean;
  onReady: () => void;
}

// One vec4 attribute per chapter shape (xyz + heat). The chapter after the last one reuses the
// face, fully amber: same pieces, rebuilt.
const vertexShader = (count: number) => /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uScan;
  ${Array.from({ length: count }, (_, i) => `attribute vec4 aT${i};`).join('\n  ')}
  attribute float aRand;
  varying float vHeat;
  varying float vScan;
  varying float vFade;

  vec3 ease(vec3 a, vec3 b, float t) { return mix(a, b, t * t * (3.0 - 2.0 * t)); }

  vec4 target(float i) {
    ${Array.from({ length: count }, (_, i) => `if (i < ${i}.5) return aT${i};`).join('\n    ')}
    return vec4(aT0.xyz, 1.0);
  }

  void main() {
    // Pick the two chapters around the scroll position.
    float seg = clamp(floor(uProgress), 0.0, ${count - 1}.0);
    float f = clamp(uProgress - seg, 0.0, 1.0);
    vec4 a = target(seg);
    vec4 b = target(seg + 1.0);

    // Points leave at slightly different moments and scatter mid-flight, so shapes dissolve
    // and reassemble rather than sliding.
    float t = clamp((f - aRand * 0.35) / 0.65, 0.0, 1.0);
    vec3 pos = ease(a.xyz, b.xyz, t);
    vec3 scatter = vec3(sin(aRand * 91.0), cos(aRand * 57.0), sin(aRand * 33.0 + 1.3));
    pos += scatter * 0.32 * sin(t * 3.14159);
    pos += vec3(0.0, sin(uTime * 0.8 + aRand * 6.2831) * 0.008, 0.0);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    float heat = mix(a.w, b.w, t);
    gl_PointSize = uSize * mix(1.9, 1.15, heat) * uPixelRatio / -mv.z;

    vHeat = heat;
    // Scanline sweeping across the wireframe parts, like the hero's understand side.
    vScan = (1.0 - heat) * smoothstep(0.1, 0.0, abs(pos.x - uScan));
    // Points further from the camera fade a little, which reads as depth.
    vFade = clamp(1.0 - (-mv.z - 3.8) * 0.3, 0.45, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uAccent;
  uniform vec3 uInk;
  varying float vHeat;
  varying float vScan;
  varying float vFade;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    vec3 color;
    float alpha;
    if (vHeat < 0.5) {
      float d = max(abs(uv.x), abs(uv.y));
      alpha = smoothstep(0.5, 0.44, d) * smoothstep(0.3, 0.38, d) * 0.7 + vScan * 0.6 * smoothstep(0.5, 0.0, d);
      color = mix(uInk * 0.85, uAccent, clamp(vScan * 1.5, 0.0, 1.0));
    } else {
      float d = length(uv);
      alpha = smoothstep(0.5, 0.12, d) * 0.9;
      color = mix(uAccent, vec3(1.0, 0.93, 0.8), 0.25);
    }
    alpha *= vFade;
    if (alpha < 0.02) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

interface Clouds {
  t: Float32Array[];
  rand: Float32Array;
}

function Morph({
  clouds,
  progressRef,
  onReady,
}: { clouds: Clouds } & Pick<Props, 'progressRef' | 'onReady'>) {
  const group = useRef<THREE.Group>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const shown = useRef({ progress: 0, ready: false });
  const size = useThree(state => state.size);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = clouds.rand.length;
    // position is required by three, but the shader only reads the chapter targets.
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    clouds.t.forEach((c, i) => g.setAttribute(`aT${i}`, new THREE.BufferAttribute(c, 4)));
    g.setAttribute('aRand', new THREE.BufferAttribute(clouds.rand, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 3);
    return g;
  }, [clouds]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 10 },
      uPixelRatio: { value: 1 },
      uScan: { value: 0 },
      uAccent: { value: new THREE.Color(0.961, 0.647, 0.141) },
      uInk: { value: new THREE.Color(0.925, 0.91, 0.882) },
    }),
    [],
  );

  useFrame(({ clock, gl }, delta) => {
    const m = material.current;
    const g = group.current;
    if (!m || !g) return;
    const t = clock.getElapsedTime();
    const s = shown.current;
    // Ease toward the scroll position so fast scrolling still shows the morph.
    s.progress += ((progressRef.current ?? 0) - s.progress) * Math.min(1, delta * 3.5);
    const p = s.progress;

    m.uniforms.uProgress.value = p;
    m.uniforms.uTime.value = t;
    m.uniforms.uPixelRatio.value = gl.getPixelRatio();
    m.uniforms.uSize.value = Math.max(7, (size.height / 600) * 10);
    m.uniforms.uScan.value = 1.2 - ((t * 0.45) % 2.4);

    // Faces look straight at the camera; the 3D chapters tilt toward it and turn slowly.
    const objectWeight = Math.min(1, p, clouds.t.length - p);
    g.rotation.x = 0.5 * objectWeight;
    g.rotation.y = objectWeight * (Math.sin(t * 0.25) * 0.5 + 0.35);

    if (!s.ready) {
      s.ready = true;
      onReady();
    }
  });

  return (
    <group ref={group}>
      <points geometry={geometry}>
        <shaderMaterial
          ref={material}
          vertexShader={vertexShader(clouds.t.length)}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export default function StoryScene({ sample, buildings, progressRef, active, onReady }: Props) {
  const [clouds, setClouds] = useState<Clouds | null>(null);

  useEffect(() => {
    let cancelled = false;
    const n = window.matchMedia('(max-width: 760px)').matches ? 5000 : 9000;
    samplePortrait(sample, 2)
      .then(portrait => {
        if (cancelled) return;
        const rand = new Float32Array(n);
        for (let i = 0; i < n; i++) rand[i] = Math.random();
        setClouds({
          t: [
            faceCloud(portrait, n, true),
            robotCloud(n),
            chipCloud(n),
            blackboardCloud(n),
            phoneCloud(n),
            cityCloud(n, buildings),
            scoreCloud(n),
            boardCloud(n),
          ],
          rand,
        });
      })
      .catch(() => {
        // Keep the still poster if sampling fails.
      });
    return () => {
      cancelled = true;
    };
  }, [sample, buildings]);

  if (!clouds) return null;

  return (
    <Canvas
      camera={{ position: [0, 0, 5.4], fov: 32, near: 0.1, far: 20 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      frameloop={active ? 'always' : 'never'}
      aria-hidden="true">
      <Morph clouds={clouds} progressRef={progressRef} onReady={onReady} />
    </Canvas>
  );
}
