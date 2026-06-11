import { GameObject } from "./gameObject";

export class Bullet extends GameObject {
  dx: number;
  dy: number;
  active: boolean = false;

  // GFX
  sprite: HTMLImageElement;
  radius = 2;
  glowRadius = 2;

  // Stats
  damage = 1;
  speed = 1;

  constructor(sprite: HTMLImageElement) {
    super(sprite, 0, 0);
    this.dx = 0;
    this.dy = 0;
    this.sprite = sprite;
  }

  fire(x: number, y: number, dirX: number, dirY: number) {
    this.x = x;
    this.y = y;
    this.dx = dirX;
    this.dy = dirY;
    this.active = true;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.isExploding) {
      this.drawExplosionParts(ctx);
    } else {
      ctx.drawImage(this.sprite, this.x, this.y);
    }
  }

  update(delta: number) {
    if (this.isExploding) {
      this.addExplosionParts(delta);
      if (this.isDead()) {
        this.isExploding = false;
        this.active = false;
      }
    } else {
      this.x += this.dx * this.speed * delta;
      this.y += this.dy * this.speed * delta;
    }
  }
}
