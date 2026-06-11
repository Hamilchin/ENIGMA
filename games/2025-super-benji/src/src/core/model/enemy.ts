import { drawEngine } from "@/core/controllers/DrawController";
import { Shooter } from "./shooter";
import { BulletPool } from "./bulletPool";
import {
  ENEMY_ATTACK_SPEED,
  ENEMY_ATTACK_VARIANCE,
  ENEMY_MAX_LIFE,
  ENEMY_MOVEMENT_Y_SPEED,
  ENEMY_PROXIMITY_DAMAGE,
} from "../config";
import { GameController } from "../controllers/GameController";
import { MovePattern, ShootPattern } from "../types";

export class Enemy extends Shooter {
  // GFX
  glowSprite: HTMLCanvasElement;
  glowColor: string = "#ffb3007c";
  glowAmount: number = 12;

  // Stats
  maxLife = ENEMY_MAX_LIFE;
  life = ENEMY_MAX_LIFE;
  movementYSpeed: number = ENEMY_MOVEMENT_Y_SPEED;
  yJitter = 0;
  yTargetJitter = 0;
  jitterTimer = 0;

  movementVilocityX: number = 0;
  proximityDamage: number = ENEMY_PROXIMITY_DAMAGE;
  attackSpeed: number = ENEMY_ATTACK_SPEED;
  shootDir = { x: 0, y: 1 };

  damage: number;
  bulletSpeed: number;

  private directionChangeTimer = 0;
  bulletColor: string = "red";
  movePattern: MovePattern;

  constructor(
    gameController: GameController,
    sprite: HTMLImageElement,
    bulletPool: BulletPool,
    health: number,
    damage: number,
    attackSpeed: number,
    bulletSpeed: number,
    x: number,
    y: number,
    movePattern: MovePattern,
    shootPattern: ShootPattern
  ) {
    super(
      gameController,
      sprite,
      bulletPool,
      x,
      y,
      sprite.width,
      sprite.height
    );
    this.maxLife = health;
    this.life = health;

    this.glowSprite = this.preloadGlowSprite();
    this.movementVilocityX = (Math.random() - 0.5) * 60;

    this.damage = damage;
    this.bulletSpeed = bulletSpeed;

    this.movePattern = movePattern;
    this.shootPattern = shootPattern;

    // Give each enemy attack speed variance
    this.attackSpeed =
      attackSpeed + (Math.random() * 2 - 1) * ENEMY_ATTACK_VARIANCE;
    this.attackCooldown = Math.random() * this.attackSpeed; // Prevent all enemies attacking at the same time
  }

  update(delta: number) {
    if (this.isExploding) {
      this.addExplosionParts(delta);
      return;
    }

    const prevX = this.x;

    // Don't move boss
    if (this.movePattern !== "none") {
      // countdown to next target change
      this.jitterTimer -= delta;
      if (this.jitterTimer <= 0) {
        this.jitterTimer = 0.5 + Math.random() * 1.5; // every 0.5–2s
        this.yTargetJitter = (Math.random() - 0.5) * 100; // target offset speed [-20..+20]
      }

      // ease toward target (smooth change)
      this.yJitter += (this.yTargetJitter - this.yJitter) * delta * 2;

      // apply base + jitter
      const netDownward = Math.max(10, this.movementYSpeed + this.yJitter);
      this.y += netDownward * delta;
    }

    // --- Movement ---
    switch (this.movePattern) {
      case "sine":
        this.x += Math.sin(this.y / 20) * 1.5;
        break;

      case "zigzag":
        this.directionChangeTimer -= delta;
        if (this.directionChangeTimer <= 0) {
          this.movementVilocityX = (Math.random() < 0.5 ? -1 : 1) * 50;
          this.directionChangeTimer = 0.5;
        }
        this.x += this.movementVilocityX * delta;
        break;
    }

    // Keep in bounds
    if (this.x < 0) {
      this.x = 0;
      this.movementVilocityX *= -1;
    }
    if (this.x + this.width > drawEngine.canvasWidth) {
      this.x = drawEngine.canvasWidth - this.width;
      this.movementVilocityX *= -1;
    }

    this.velocity.x = (this.x - prevX) / delta;

    this.updateShooting(delta, this.damage, this.bulletSpeed);
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.isExploding) {
      this.drawExplosionParts(ctx);
    } else {
      ctx.save();
      ctx.drawImage(
        this.glowSprite,
        this.x - this.glowAmount * 2,
        this.y - this.glowAmount * 2
      );

      ctx.drawImage(this.sprite, this.x, this.y);
      this.manageTilt(ctx);
      ctx.restore();
    }
  }

  // Only create one glow sprite for enemies and reuse it, helps with performance
  preloadGlowSprite() {
    const offscreen = document.createElement("canvas");
    offscreen.width = this.sprite.width + this.glowAmount * 4;
    offscreen.height = this.sprite.height + this.glowAmount * 4;
    const offCtx = offscreen.getContext("2d");
    if (!offCtx) throw new Error();

    offCtx.shadowColor = this.glowColor;
    offCtx.shadowBlur = this.glowAmount;
    offCtx.drawImage(this.sprite, this.glowAmount * 2, this.glowAmount * 2);

    return offscreen;
  }

  takeDamage(damage: number) {
    this.life -= damage;
    if (this.life <= 0) {
      this.explode();
      this.gameController.musicPlayer.playExplosionSound();
    }
  }

  // Don't treat spawned enemies above the canvas as offscreen
  override offScreen(): boolean {
    return (
      this.x + this.width < 0 ||
      this.x > drawEngine.canvasWidth ||
      this.y > drawEngine.canvasHeight
    );
  }
}
