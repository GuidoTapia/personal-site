// Shared by the hero and the story scenes. No three.js here, so it costs nothing on its own.
export interface Portrait {
  step: number; // pixel sampling step; dots grow with it so coverage stays the same
  positions: Float32Array;
  lum: Float32Array;
  rand: Float32Array;
}

// Turn the photo into points: one per bright-enough pixel, with depth from brightness.
// The photo has a near-black background, so a luminance threshold isolates the subject.
export async function samplePortrait(url: string, step: number): Promise<Portrait> {
  const img = new Image();
  img.src = url;
  await img.decode();
  const { naturalWidth: w, naturalHeight: h } = img;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('2D canvas unavailable');
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, w, h);

  const positions: number[] = [];
  const lum: number[] = [];
  const rand: number[] = [];
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const i = (y * w + x) * 4;
      const l = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
      if (l < 0.09) continue;
      const r = Math.random();
      positions.push(
        (x / w - 0.5) * 2 + (r - 0.5) * 0.008,
        -(y / h - 0.5) * 2 + (Math.random() - 0.5) * 0.008,
        (l - 0.35) * 0.5,
      );
      lum.push(l);
      rand.push(r);
    }
  }
  return {
    step,
    positions: new Float32Array(positions),
    lum: new Float32Array(lum),
    rand: new Float32Array(rand),
  };
}
