import {
  EXPLOSION_DURATION,
  EXPLOSION_PART_SIZE,
  EXPLOSION_ROTATION_SPEED,
  EXPLOSION_SIZE,
} from "../config";
import { drawEngine } from "../controllers/DrawController";
import { Coordinates } from "../types";

export class GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean; // Used for preventing duplicate collision
  explosionPieces: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rot: number;
    rotSpeed: number;
    alpha: number;
    size: number;
    sx: number;
    sy: number;
  }[] = [];
  isExploding = false;
  sprite: HTMLImageElement;
  velocity: Coordinates = { x: 0, y: 0 };

  constructor(
    sprite: HTMLImageElement,
    x: number,
    y: number,
    width: number = 0,
    height: number = 0,
    active: boolean = true
  ) {
    this.sprite = sprite;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.active = active;
  }

  centerX(): number {
    return this.x + this.width / 2;
  }

  centerY(): number {
    return this.y + this.height / 2;
  }

  explode(pieces: number = 8, pieceSize: number = EXPLOSION_PART_SIZE) {
    if (this.isExploding) return;
    this.velocity = { x: 0, y: 0 };
    this.isExploding = true;

    for (let i = 0; i < pieces; i++) {
      const speed = (Math.random() - 0.5) * EXPLOSION_SIZE; // px/sec instead of px/frame
      const angle = Math.random() * Math.PI * 2;

      this.explosionPieces.push({
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * EXPLOSION_ROTATION_SPEED, // radians/sec
        alpha: 1,
        size: pieceSize,
        sx: Math.floor(Math.random() * (this.sprite.width - pieceSize)),
        sy: Math.floor(Math.random() * (this.sprite.height - pieceSize)),
      });
    }
  }

  addExplosionParts(delta: number) {
    for (const p of this.explosionPieces) {
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.rot += p.rotSpeed * delta;
      p.alpha -= EXPLOSION_DURATION * delta;
    }

    this.explosionPieces = this.explosionPieces.filter((p) => p.alpha > 0);
  }

  drawExplosionParts(ctx: CanvasRenderingContext2D) {
    for (const p of this.explosionPieces) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.drawImage(
        this.sprite,
        p.sx,
        p.sy,
        p.size,
        p.size,
        -p.size / 2,
        -p.size / 2,
        p.size,
        p.size
      );
      ctx.restore();
    }
  }

  isDead(): boolean {
    return this.isExploding && this.explosionPieces.length === 0;
  }

  offScreen(): boolean {
    return (
      this.x + this.width < 0 ||
      this.x > drawEngine.canvasWidth ||
      this.y + this.height < 0 ||
      this.y > drawEngine.canvasHeight
    );
  }
}
