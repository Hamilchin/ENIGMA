import { Animations, Box, PatrolPoints } from "@/model/common.model";
import { ENEMY_ANIMATION_NAME, ProjectileType } from "@/constans/game-contstans";
import { GameObject } from "../GameObject";
import { Player } from "../player/Player";
import { Vector2 } from "@/core/vector";
import { Engine } from "@/core/engine";
import { time } from "@/core/time";
import { Projectile } from "../Projectile";
import { ParticleSystem } from "@/core/particle-system";

export class Enemy extends GameObject {
  static isEmenyCollided = false;
  isAlive = false;
  enemyAreaBox = new Box();
  isEnemyAttackedByPlayer = false;
  damage = 1;
  enemyType = '';
  isFollowingPlayer = false;
  projectileArray: Projectile[] = [];
  isActiveProjectile!: boolean;
  isProjectileAttacking!: boolean;
  patrolingWaitTime = 1000;
  patrolingTimeElapsed = 0;
  particalSystem!: ParticleSystem;

  startX!: number;
  startY!: number;
  moveSpeed!: number;
  runSpeed!: number;
  health!: number;
  patrolPoints!: PatrolPoints;
  currentTarget!: Vector2;

  private _dir = 0;
  get direction() { return this._dir > 0 ? 1 : -1; }
  set direction(v) { this._dir = v; }

  constructor(pos: Vector2, src: string, player: Player, anims: Animations[], loop?: boolean, frameCount?: number, frameBuffer?: number) {
    super(pos, src, player, anims, loop, frameCount, frameBuffer);
    this.isAlive = true;
    this.particalSystem = new ParticleSystem();
    this.playAnimation(ENEMY_ANIMATION_NAME.WALK);
  }

  update(dt: number) {
    this.playerAttackedEnemy();
    this.particalSystem.updateAndDraw(dt);
    // Engine.debugBox(this.enemyAreaBox, 'orange');
  }

  playerAttackedEnemy() {
    const isEnemyHitByPlayer = this.checkCollision(this.player.attackBox);

        const isHitByProjectile = this.player.projectileArray.some((projectile: Projectile) => {
            if (projectile.type === ProjectileType.PLAYER) {
                return this.checkCollision(projectile.hitBox);
            }
        });

        if ((isEnemyHitByPlayer && this.player.isMeleeAttacking) || (isHitByProjectile && this.player.isProjectileAttacking)) {
            this.isEnemyAttackedByPlayer = true;
        } else {
            this.isEnemyAttackedByPlayer = false;
        }

        return this.isEnemyAttackedByPlayer;
  }

  shootToPlayer() {
    const dir = Vector2.subtract(this.player.position, this.position).normalize();
    this.projectileArray.push(new Projectile(
      new Vector2(this.position.x + this.width/2, this.position.y + this.height/2),
      50, dir, 2000, ProjectileType.ENEMY
    ));
    this.isActiveProjectile = this.isProjectileAttacking = true;
  }

  enemyPatrol(a: Vector2, b: Vector2) {
    this.playAnimation(ENEMY_ANIMATION_NAME.WALK);
    const dx = this.currentTarget.x - this.position.x;
    const dy = this.currentTarget.y - this.position.y;
    const dist = Math.hypot(dx, dy);
    this.isHozFlip = dx < 0;

    if(dist > 1) {
      this.position.x += dx/dist * this.moveSpeed * time.deltaSeconds;
      this.position.y += dy/dist * this.moveSpeed * time.deltaSeconds;
      this.patrolingTimeElapsed = time.elapsed;
    } else if(time.elapsed - this.patrolingTimeElapsed > this.patrolingWaitTime) {
      this.currentTarget = this.currentTarget === a ? b : a;
      this.patrolingTimeElapsed = time.elapsed;
    }
  }

  followPlayer(isByBoss?: boolean) {
    const collided = Engine.collisions(this.player.hitBox, this.enemyAreaBox);
    if(collided && this.player.hitBox.active){
      const off = 8, dx = this.player.position.x - this.position.x, dy = this.player.position.y + off - this.position.y;
      this.isFollowingPlayer = true;
      const dist = Math.hypot(dx, dy);
      if (isByBoss) this.isHozFlip = dx > 0;
      this.isHozFlip = dx < 0;
      this.velocity.x = dx/dist * this.runSpeed * time.deltaSeconds;
      this.velocity.y = dy/dist * this.runSpeed * time.deltaSeconds;
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      this.playAnimation(ENEMY_ANIMATION_NAME.RUN, this.isHozFlip);
    } else {
      this.isFollowingPlayer = false;
      this.velocity.x = this.velocity.y = 0;
    }
  }

  enemyCollidePlayer() {
    const collided = this.checkCollision(this.player.hitBox);
    this.player.isEnemyCollided = collided && this.player.hitBox.active;

    if(collided && this.player.hitBox.active){
      const e = this.hitBox, p = this.player.hitBox;
      const ox = Math.min(e.position.x+e.width,p.position.x+p.width)-Math.max(e.position.x,p.position.x);
      const oy = Math.min(e.position.y+e.height,p.position.y+p.height)-Math.max(e.position.y,p.position.y);
      if(ox<oy) this.position.x += e.position.x+e.width/2 < p.position.x+p.width/2 ? -ox : ox, this.velocity.x=0;
      else this.position.y += e.position.y+e.height/2 < p.position.y+p.height/2 ? -oy : oy, this.velocity.y=0;
      if(!this.player.isInvincible) this.player.takeDamage(this.damage);
    }

    return collided;
  }

  enemyBulletHitPlayer(dt: number) {
    this.projectileArray.forEach((p,i)=>{
      p.update(dt);
      if(p.isActive && Engine.collisions(p.hitBox, this.player.hitBox)) this.player.takeDamage(this.damage);
      if(!p.isActive) this.isActiveProjectile = false, this.projectileArray.splice(i,1);
    });
  }
}
