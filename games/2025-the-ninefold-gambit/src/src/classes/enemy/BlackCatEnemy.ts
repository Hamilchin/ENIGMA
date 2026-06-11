import { Animations, PatrolPoints } from "@/model/common.model";
import { Enemy } from "./Enemy";
import { ENEMY_TYPE, PatrolDirection } from "@/constans/game-contstans";
import { Player } from "../player/Player";
import { Vector2 } from "@/core/vector";
import { drawEngine } from "@/core/draw-engine";

const SHOOTING_RANGE = 30;

export class BlackCatEnemy extends Enemy {
  constructor(pos: Vector2, src: string, player: Player, anims: Animations[], patrolDir: PatrolDirection, patrolDist: number, loop?: boolean) {
    super(pos, src, player, anims, loop);
    this.name = "enemy_bcat";
    this.enemyType = ENEMY_TYPE.BLACK_CAT;
    this.moveSpeed = 40;
    this.runSpeed = 30;
    this.damage = 1;
    this.health = 2;

    if (patrolDir == PatrolDirection.Horizontal)
      this.patrolPoints = new PatrolPoints(new Vector2(pos.x - patrolDist, pos.y), new Vector2(pos.x + patrolDist, pos.y));
    else if (patrolDir == PatrolDirection.Vertical)
      this.patrolPoints = new PatrolPoints(new Vector2(pos.x, pos.y - patrolDist), new Vector2(pos.x, pos.y + patrolDist));
    else
      this.patrolPoints = new PatrolPoints(new Vector2(pos.x, pos.y), new Vector2(pos.x, pos.y));

    this.currentTarget = Math.random() < .5 ? this.patrolPoints.pointA : this.patrolPoints.pointB;
  }

  updateAndDraw(dt: number) {
    this.draw();
    this.enemyHitbox();
    this.update(dt);
    this.drawAreaBox();
    this.enemyBulletHitPlayer(dt);
    this.followPlayer();

    if (this.isFollowingPlayer) {
      const dist = this.position.distance(this.player.position);
      // if (dist < SHOOTING_RANGE) {
      //   const c = drawEngine.context, hb = this.hitBox;
      //   c.beginPath();
      //   c.arc(hb.position.x + hb.width / 2, hb.position.y + hb.height / 2, dist, 0, Math.PI * 2);
      //   c.strokeStyle = "pink";
      //   c.lineWidth = 1;
      //   c.stroke();
      // }
      if (!(this.projectileArray?.length > 0) && dist > SHOOTING_RANGE) this.shootToPlayer();
    } else {
      this.enemyPatrol(this.patrolPoints.pointA, this.patrolPoints.pointB);
    }

    this.enemyCollidePlayer();
  }

  enemyHitbox() {
    Object.assign(this.hitBox.position, { x: this.position.x + 18, y: this.position.y + 15 });
    this.hitBox.width = 12;
    this.hitBox.height = 18;
  }

  drawAreaBox() {
    Object.assign(this.enemyAreaBox.position, { x: this.position.x - 5, y: this.position.y });
    this.enemyAreaBox.width = this.width + 10;
    this.enemyAreaBox.height = this.height;
  }
}
