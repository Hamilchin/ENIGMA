import { globalVolume, volumeLocalStorageKey } from './config';
import { canvas } from './assets';
import BlocEntity from './entities/BlocEntity';

export interface Coord {
  x: number;
  y: number;
}

export interface Box extends Coord {
  width: number;
  height: number;
}

export function isCollidingWith(a: Box, b: Box): boolean {
  if (!a || !b) return false;
  return (
    (!(b instanceof BlocEntity) || (b instanceof BlocEntity && b.isFilled)) &&
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function isPointCollission(p: { x: number; y: number }, r: Box) {
  return (
    p.x >= r.x && // right of the left edge AND
    p.x <= r.x + r.width && // left of the right edge AND
    p.y >= r.y && // below the top AND
    p.y <= r.y + r.height
  );
}

export function getCursorPosition(event: any) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return { x, y };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getMuteStatus(): string {
  return parseFloat(localStorage.getItem(volumeLocalStorageKey) ?? globalVolume.toString()) === 0 ? 'Unmute' : 'Mute';
}
