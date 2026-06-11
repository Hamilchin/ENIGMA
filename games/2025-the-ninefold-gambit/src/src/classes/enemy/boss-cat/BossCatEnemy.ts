import { Player } from "@/classes/player/Player";
import { ENEMY_ANIMATION_NAME, ENEMY_TYPE, PatrolDirection } from "@/constans/game-contstans";
import { Vector2 } from "@/core/vector";
import { Animations, PatrolPoints } from "@/model/common.model";
import { Engine } from "@/core/engine";
import { BlackCatEnemy } from "../BlackCatEnemy";


export class BossCatEnemy extends BlackCatEnemy {

  public isActive = false;

  constructor(
    position: Vector2,
    src: string,
    player: Player,
    animations: Array<Animations>,
    loop?: boolean
  ) {
    super(position, src, player, animations, PatrolDirection.NONE, 0, loop);

    this.name = "boss_enemy_cat";
    this.enemyType = ENEMY_TYPE.BLACK_CAT;

    this.moveSpeed = 40;
    this.runSpeed = 30;
    this.damage = 1;
    this.health = 15;

    this.patrolPoints = new PatrolPoints(new Vector2(265, -5), new Vector2(335, -5));
    this.currentTarget = this.patrolPoints.pointB;

    this.playAnimation(ENEMY_ANIMATION_NAME.WALK);
  }

  public updateAndDraw(delta: number) {
    if (!this.isActive) return;

    this.draw();
    this.bossFightPhase(delta);
    this.enemyHitbox();
    this.update(delta);
    this.drawBossCatEnemyAreaBox();
    this.enemyBulletHitPlayer(delta);
  }

  private bossFightPhase(delta: number) {
    if (this.health > 10) {
      // Phase 1: Patrol + light shooting

      this.moveSpeed = 60;
      this.enemyPatrol(this.patrolPoints.pointA, this.patrolPoints.pointB);

      if (Engine.collisions(this.player.hitBox, this.enemyAreaBox)) {
        if (this.projectileArray.length <= 3) {
          this.shootToPlayer();
        }
      }
    } else if (this.health > 5) {
      // Phase 2: Aggressive shooting + chase

      this.runSpeed = 30;
      this.playAnimation(ENEMY_ANIMATION_NAME.RUN);

      if (Engine.collisions(this.enemyAreaBox, this.player.hitBox)) {
        if (this.projectileArray.length <= 6) {
          this.shootToPlayer();
        }
        this.followPlayer(true);
      }
    } else if (this.health > 0) {
      // Phase 3: Frenzied melee + chase

      this.playAnimation(ENEMY_ANIMATION_NAME.RUN);
      this.runSpeed = 50;

      if (Engine.collisions(this.enemyAreaBox, this.player.hitBox)) {
        this.followPlayer(true);
        this.enemyCollidePlayer();
      }
    } else {
      // Dead
      this.isAlive = false;
      this.position.set(-Infinity, -Infinity);
    }
  }

  private drawBossCatEnemyAreaBox() {
    this.enemyAreaBox.position.x = this.position.x - 108;
    this.enemyAreaBox.position.y = this.position.y - 80;
    this.enemyAreaBox.width = this.width + 220;
    this.enemyAreaBox.height = this.height + 160;

    // Engine.debugBox(this.enemyAreaBox, "orange");
  }
}
