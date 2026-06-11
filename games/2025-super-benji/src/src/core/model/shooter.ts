import { MIN_ATTACK_SPEED } from "../config";
import { GameController } from "../controllers/GameController";
import { Coordinates, ShootPattern } from "../types";
import { BulletPool } from "./bulletPool";
import { GameObject } from "./gameObject";

export class Shooter extends GameObject {
  gameController: GameController;

  // Position
  lastPosition: Coordinates = { x: 0, y: 0 };
  shootingXOffset = 0;

  active = true;
  bulletPool: BulletPool;
  attackCooldown = 0;
  attackSpeed = 0.1;
  shootDir = { x: 0, y: -1 };
  tiltAmount = 4;
  tiltClamp = 5; // Max/min amount of tilting based on movespeed

  shootPattern: ShootPattern = "single";
  burstShotsRemaining = 0;
  burstTimer = 0;
  burstInterval = 0.1; // gap between burst shots
  burstCount = 3; // how many bullets per burst

  bulletColor: string = "red";

  constructor(
    gameController: GameController,
    sprite: HTMLImageElement,
    bulletPool: BulletPool,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    super(sprite, x, y, width, height);
    this.gameController = gameController;
    this.sprite = sprite;
    this.bulletPool = bulletPool;
  }

  updateShooting(delta: number, damage: number, bulletSpeed: number) {
    if (!this.active) return;

    if (this.shootPattern === "burst") {
      if (this.burstShotsRemaining > 0) {
        // Continue burst
        this.burstTimer -= delta;
        if (this.burstTimer <= 0) {
          this.shoot(damage, bulletSpeed, this.shootDir, this.bulletColor);
          this.burstShotsRemaining--;
          this.burstTimer = this.burstInterval;
        }

        if (this.burstShotsRemaining <= 0) {
          this.attackCooldown = Math.max(MIN_ATTACK_SPEED, this.attackSpeed);
        }
      } else {
        // Waiting to start burst
        this.attackCooldown -= delta;
        if (this.attackCooldown <= 0) {
          this.burstShotsRemaining = this.burstCount;
          this.burstTimer = 0; // fire immediately
        }
      }
    } else {
      // Normal single/spread fire
      this.attackCooldown -= delta;
      if (this.attackCooldown <= 0) {
        switch (this.shootPattern) {
          case "single":
            this.shoot(damage, bulletSpeed, this.shootDir, this.bulletColor);
            break;

          case "spread": {
            const spreadAngles = [-0.3, 0, 0.3]; // radians

            // normalize base direction
            const baseLen = Math.hypot(this.shootDir.x, this.shootDir.y);
            const bx = this.shootDir.x / baseLen;
            const by = this.shootDir.y / baseLen;

            for (const a of spreadAngles) {
              // rotate (bx, by) by angle a
              const cosA = Math.cos(a);
              const sinA = Math.sin(a);

              const dir = {
                x: bx * cosA - by * sinA,
                y: bx * sinA + by * cosA,
              };

              this.shoot(damage, bulletSpeed, dir, this.bulletColor);
            }
            break;
          }
          case "megaspread": {
            const spreadAngles = [-0.6, -0.3, 0, 0.3, 0.6]; // wider fan, 5 shots

            // normalize base direction
            const baseLen = Math.hypot(this.shootDir.x, this.shootDir.y);
            const bx = this.shootDir.x / baseLen;
            const by = this.shootDir.y / baseLen;

            for (const a of spreadAngles) {
              const cosA = Math.cos(a);
              const sinA = Math.sin(a);

              const dir = {
                x: bx * cosA - by * sinA,
                y: bx * sinA + by * cosA,
              };

              this.shoot(damage, bulletSpeed, dir, this.bulletColor);
            }
            break;
          }
          case "boss": {
            const spreadAngles = [-0.5, -0.4, -0.2, 0, 0.2, 0.4, 0.5];

            // normalize base direction
            const baseLen = Math.hypot(this.shootDir.x, this.shootDir.y);
            const bx = this.shootDir.x / baseLen;
            const by = this.shootDir.y / baseLen;

            for (const a of spreadAngles) {
              const cosA = Math.cos(a);
              const sinA = Math.sin(a);

              let dir = {
                x: bx * cosA - by * sinA,
                y: bx * sinA + by * cosA,
              };

              // add jitter to x axis
              const jitter = (Math.random() - 0.5) * 0.5; // tweak 0.4 for strength
              dir.x += jitter;

              // re-normalize so speed stays consistent
              const len = Math.hypot(dir.x, dir.y);
              dir.x /= len;
              dir.y /= len;

              this.shoot(damage, bulletSpeed, dir, this.bulletColor);
            }
            break;
          }
        }
        this.attackCooldown = Math.max(MIN_ATTACK_SPEED, this.attackSpeed);
      }
    }
  }

  shoot(
    damage: number,
    bulletSpeed: number,
    dir: { x: number; y: number } = this.shootDir,
    bulletColor?: string
  ) {
    if (!this.active || !this.bulletPool) return;

    const bullet = this.bulletPool.get();
    if (bullet) {
      if (bulletColor) {
        bullet.sprite =
          this.gameController.spriteManager.getBulletSprite(bulletColor);
      }

      const y = dir.y <= 0 ? this.y : this.y + this.height;

      bullet.damage = damage;
      bullet.speed = bulletSpeed;
      bullet.fire(this.centerX() + this.shootingXOffset, y, dir.x, dir.y);
    }
  }

  manageTilt(ctx: CanvasRenderingContext2D) {
    const tiltAmount = Math.max(
      -this.tiltClamp,
      Math.min(this.tiltClamp, this.velocity.x * this.tiltAmount)
    );

    const centerX = this.width / 2;

    for (let x = 0; x < this.width; x++) {
      const factor = (x - centerX) / centerX;

      // Invert shift for right/left sides
      // When moving right: left side goes up, right side goes down
      const offset = Math.floor(factor * tiltAmount);

      ctx.drawImage(
        this.sprite,
        x,
        0,
        1,
        this.height,
        this.x + x,
        this.y + offset,
        1,
        this.height
      );
    }
  }
}
