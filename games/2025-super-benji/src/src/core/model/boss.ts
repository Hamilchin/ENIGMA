import { GameController } from "../controllers/GameController";
import { MovePattern, ShootPattern } from "../types";
import { BulletPool } from "./bulletPool";
import { Enemy } from "./enemy";

export class Boss extends Enemy {
  shootDir = { x: 0, y: 1 };

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
      health,
      damage,
      attackSpeed,
      bulletSpeed,
      x,
      y,
      movePattern,
      shootPattern
    );
  }
}
