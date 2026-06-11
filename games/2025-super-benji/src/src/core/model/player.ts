import {
  MAX_MOVE_SPEED,
  PLAYER_ATTACK_SPEED,
  PLAYER_BULLET_DAMAGE,
  PLAYER_BULLET_SPEED,
  PLAYER_HEALTH_GLOW_COLOURS,
  PLAYER_MAX_LIFE,
  PLAYER_MOVEMENT_X_SPEED,
  PLAYER_MOVEMENT_Y_SPEED,
  PLAYER_REGEN_CAP,
} from "@/core/config";
import { drawEngine } from "@/core/controllers/DrawController";
import { Shooter } from "./shooter";
import { BulletPool } from "./bulletPool";
import { getInterpolatedColor } from "../utilities";
import { GameController } from "../controllers/GameController";
import { ShootPattern } from "../types";

export class Player extends Shooter {
  lives = 9; // We hardcode this because cats always have 9 lives!

  // Movement
  moveTolerance = 4; // Pixels to consider "close enough" to target

  // GFX
  sprite: HTMLImageElement;
  shootingXOffset = -2; // Offset for shooting position
  boosterSize = 20; // Size of the booster flame
  boosterYOffset = -2; // Offset for booster flame position

  // Glow
  glowColor: string = "#00bfff"; // Default glow color
  glowAmount: number = 20; // Default glow radius

  // Stats
  movementXSpeed: number = PLAYER_MOVEMENT_X_SPEED;
  movementYSpeed: number = PLAYER_MOVEMENT_Y_SPEED;
  maxLife = PLAYER_MAX_LIFE;
  life = PLAYER_MAX_LIFE;
  attackSpeed = PLAYER_ATTACK_SPEED;
  damage = PLAYER_BULLET_DAMAGE;
  bulletSpeed = PLAYER_BULLET_SPEED;
  evasion = 0;
  regen = 0;
  private regenTimer = 0;

  shootPattern: ShootPattern = "single";
  bulletColor: string = "blue";
  playerColor: string = "grey";

  moveSpeedEvasionBuff = false;
  regenIncreaseBuff = false;

  constructor(
    gameController: GameController,
    sprite: HTMLImageElement,
    bulletPool: BulletPool
  ) {
    super(
      gameController,
      sprite,
      bulletPool,
      drawEngine.getCenterX() - sprite.width / 2,
      drawEngine.canvasHeight * 0.5,
      sprite.width,
      sprite.height
    );
    this.sprite = sprite;
  }

  update(delta: number, targetX: number, targetY: number) {
    if (this.isExploding) {
      this.addExplosionParts(delta);
    } else {
      this.regenTick(delta);

      // Movement towards cursor
      const dx = targetX - this.centerX();
      const dy = targetY - this.centerY() - 28;
      const distance = Math.hypot(dx, dy);

      if (distance > this.moveTolerance) {
        // Normalize and move toward mouse at fixed speed
        this.x +=
          (dx / distance) *
          Math.min(MAX_MOVE_SPEED, this.movementXSpeed) *
          delta;
        this.y +=
          (dy / distance) *
          Math.min(MAX_MOVE_SPEED, this.movementYSpeed) *
          delta;
      }

      this.velocity = {
        x: this.x - this.lastPosition.x,
        y: this.y - this.lastPosition.y,
      };

      this.lastPosition = {
        x: this.x,
        y: this.y,
      };

      this.glowColor = getInterpolatedColor(
        this.life / this.maxLife,
        PLAYER_HEALTH_GLOW_COLOURS
      );

      this.updateShooting(delta, this.damage, this.bulletSpeed);
      this.updateSpriteColor();
    }
  }

  updateSpriteColor() {
    this.sprite = this.gameController.spriteManager.getPlayerSprite(
      this.playerColor
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.isExploding) {
      this.drawExplosionParts(ctx);
    } else {
      ctx.save();

      this.drawGlow(ctx);
      this.drawBoosters(ctx);

      this.manageTilt(ctx);

      ctx.restore();
    }
  }

  drawGlow(ctx: CanvasRenderingContext2D) {
    if (!this.sprite) return;

    const off = document.createElement("canvas");
    off.width = this.width;
    off.height = this.height;
    const offCtx = off.getContext("2d")!;

    // draw sprite to offscreen canvas
    offCtx.drawImage(this.sprite, 0, 0, this.width, this.height);

    // tint with glow color
    offCtx.globalCompositeOperation = "source-in";
    offCtx.fillStyle = this.glowColor;
    offCtx.fillRect(0, 0, this.width, this.height);

    // draw blurred glow behind the sprite
    ctx.save();
    ctx.globalAlpha = 0.8; // adjust intensity
    ctx.filter = `blur(${this.glowAmount}px)`;
    ctx.drawImage(off, this.x, this.y, this.width, this.height);
    ctx.restore();
  }

  regenTick(delta: number) {
    if (this.regen > 0 && this.life < this.maxLife) {
      this.regenTimer += delta;

      let regenTick = this.regenIncreaseBuff ? 2.5 : 5;
      if (this.regenTimer >= regenTick) {
        const regen = Math.min(this.regen, PLAYER_REGEN_CAP);
        this.life += regen;

        if (this.life > this.maxLife) {
          this.life = this.maxLife;
        }

        this.regenTimer = 0; // reset timer
      }
    }
  }

  private drawBoosters(ctx: CanvasRenderingContext2D) {
    const boosterX = this.centerX();
    const boosterY = this.y + this.height + this.boosterYOffset;

    // Create gradient (blue → white → orange)
    const gradient = ctx.createLinearGradient(
      boosterX,
      boosterY,
      boosterX,
      boosterY + 20
    );
    gradient.addColorStop(0, "rgba(0, 180, 255, 0.9)");
    gradient.addColorStop(0.4, "rgba(255, 255, 255, 0.8)");
    gradient.addColorStop(1, "rgba(255, 140, 0, 0)");

    ctx.fillStyle = gradient;

    // Make the flame tip more jittery
    const flicker = this.boosterSize + Math.random() * 15; // bigger randomness

    ctx.beginPath();
    ctx.moveTo(boosterX - 1, boosterY); // left booster edge
    ctx.lineTo(boosterX, boosterY + flicker); // center flame tip
    ctx.lineTo(boosterX + 1, boosterY); // right booster edge
    ctx.closePath();
    ctx.fill();
  }

  takeDamage(damage: number) {
    this.life -= damage;
    if (this.life <= 0) {
      // Prevent the player losing multiple lives
      if (!this.isExploding) {
        this.lives--;
        this.explode(40);
        this.gameController.musicPlayer.playExplosionSound();
      }
    }
    this.gameController.musicPlayer.playTakeDamage();
  }

  heal(amount: number) {
    if (this.life + amount > this.maxLife) {
      this.life = this.maxLife;
    } else {
      this.life += amount;
    }
  }

  revive() {
    this.life = this.maxLife;
    this.isExploding = false;
    this.explosionPieces = [];
    this.sprite = this.gameController.spriteManager.getPlayerSprite();
  }

  // Ran out of lives
  isReallyDead(): boolean {
    return (
      this.lives <= 0 && this.isExploding && this.explosionPieces.length === 0
    );
  }
}
