// Pointer state shared between HeroVisual (DOM events) and HeroScene (springs), without re-renders.
// Coordinates are CSS pixels from the center of the visual, y pointing down.
export interface Grab {
  down: boolean; // mouse or pen is holding the face
  startX: number;
  startY: number;
  x: number;
  y: number;
  poke: number; // increments on every touch tap; the scene reacts when it changes
  pokeX: number;
  pokeY: number;
}

export const createGrab = (): Grab => ({
  down: false,
  startX: 0,
  startY: 0,
  x: 0,
  y: 0,
  poke: 0,
  pokeX: 0,
  pokeY: 0,
});
