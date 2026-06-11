import { Engine } from '../../core/engine'
import { Direction, ENEMY_TYPE, PLAYER_SPEED, SOUND_FX, UNLOCKABLE_ABILITY } from "@/constans/game-contstans"
import { controls } from "@/core/controls"
import { CollisionBlock } from "../CollisionBlock"
import { Animations, Box } from '@/model/common.model'
import { Sprite } from '../Sprite'
import { StateMachine } from '@/core/state-machine'
import { PlayerMoveState } from './player-move-state'
import { PlayerIdleState } from './player-idle-state'
import { Projectile } from '../Projectile'
import { Vector2 } from '@/core/vector'
import { PlayerFireState } from './player-fire-state'
import { time } from '@/core/time'
import { PlayerDigdashState } from './player-digdash-state'
import { PlayerMeleeState } from './player-melee-state'
import { PlayerHUD } from './PlayerHUD'
import { ParticleSystem } from '@/core/particle-system'
import { bossDieSFX, catDieSFX, playerDieSFX, playerHitSFX } from '@/audio/sfx'
import { zzfx } from '@/audio/zzfx'

const HBW = 10, HBH = 14, HBX = 27, HBY = 28

export class Player extends Sprite {
  isAlive = true
  position = new Vector2()
  velocity = new Vector2()
  collisionBlocks: CollisionBlock[] = []
  hitBox = new Box()
  attackBox = new Box()
  playerDirection = 0
  playerDirectionY = 0
  directionVector = Vector2.zero
  speed = PLAYER_SPEED
  center = new Vector2(0, 0)
  fsm!: StateMachine<Player>
  collidedWith!: string
  projectileArray: Projectile[] = []
  isFiring = false
  projectileHitbox = new Box()
  isActiveProjecetile = false
  isHozFlip: any
  inputDirection = Vector2.zero
  lastNonZeroDirection = new Vector2(1, 0)
  lastDashTime = -Infinity
  isDashing = false
  dashCooldown = 1e3
  lastPunchTime = -Infinity
  isPunching = false
  punchCooldown = 500
  private _isEnemyCollided = false
  set isEnemyCollided(v: boolean) { this._isEnemyCollided = v }
  private _maxHealth = 5
  private _health = 5
  get health() {
    if (this._health <= 0) this.isAlive = false
    this._health = Engine.clamp(this._health, 0, this._maxHealth)
    return this._health
  }
  set health(v) { this._health = Engine.clamp(v, 0, this._maxHealth) }
  private _canControlPlayer = true
  get canControlPlayer() { return this._canControlPlayer }
  set canControlPlayer(v) {
    if (!v) { this.velocity.set(0, 0); this.switchSprite('idle') }
    this._canControlPlayer = v
  }
  isDialogActive = false
  healthArray: PlayerHUD[] = []
  isInvincible = false
  private invincibilityDuration = 2e3
  lastHitTime = 0
  isVisible = false
  flashDuration = 100
  startFlashing = 0
  isMeleeAttacking = false
  isProjectileAttacking = false
  attackedMeleePower = 1
  attackedProjectilePower = 2
  particalSystem: ParticleSystem
  private isPlayingPlayerDie = false

  constructor(c: CollisionBlock[], pos: Vector2, src: string, anim: Animations[], f: number, fb: number, loop = true) {
    super(pos, src, anim, f, fb, loop)
    this.position = pos
    this.velocity = new Vector2()
    this.collisionBlocks = c
    this.particalSystem = new ParticleSystem()
  }

  enter() {
    this.fsm = new StateMachine<Player>(this)
    this.fsm.addState('move', PlayerMoveState)
    this.fsm.addState('idle', PlayerIdleState)
    this.fsm.addState('fire', PlayerFireState)
    this.fsm.addState('melee', PlayerMeleeState)
    this.fsm.addState('digdash', PlayerDigdashState)
    this.fsm.changeState('idle')
    this.fsm.lockState(UNLOCKABLE_ABILITY.PUNCH_ABILITY)
    this.fsm.lockState(UNLOCKABLE_ABILITY.DIG_DASH)
    this.fsm.lockState(UNLOCKABLE_ABILITY.FIRE_ABILITY)
  }

  update(d: number) {
    this.particalSystem.updateAndDraw(d)
    this.playerDirection = this.lastNonZeroDirection.x >= 0 ? 1 : -1
    this.playerDirectionY = this.lastNonZeroDirection.y >= 0 ? 1 : -1
    this.center.x = this.position.x + this.width / 2
    this.center.y = this.position.y + this.height / 2

    for (let i = this.projectileArray.length - 1; i >= 0; i--) {
      const p = this.projectileArray[i]
      p.update(d)
      if (!p.isActive) { this.isActiveProjecetile = false; this.projectileArray.splice(i, 1) }
    }

    if (this.isVisible) this.draw()
    this.playerInvincibleFrames(d)
    this.playerAndCollisionBlocks()
    this.controls()
    this.fsm.update(d)
    this.playerDied()
  }

  drawAndUpdate(d: number) { this.draw(); this.update(d) }

  private updateHitBox() {
    this.hitBox.position.x = this.position.x + HBX
    this.hitBox.position.y = this.position.y + HBY
    this.hitBox.active = !this.isDashing
    if (!this.isDashing) { this.hitBox.width = HBW; this.hitBox.height = HBH }
  }

  private updateAttackBox() {
    if (this.isPunching) return
    this.attackBox.active = false
    this.attackBox.position.x = this.attackBox.position.y = -Infinity
    this.attackBox.width = 15; this.attackBox.height = 24
  }

  private playerAndCollisionBlocks() {
    const pos = this.position, v = this.velocity
    pos.x += v.x * time.deltaSeconds
    this.updateHitBox(); this.updateAttackBox()
    this.checkForHorizontalCollision(this.collisionBlocks, pos, this.hitBox, v)
    pos.y += v.y * time.deltaSeconds
    this.updateHitBox(); this.updateAttackBox()
    this.checkForVerticalCollision(this.collisionBlocks, pos, this.hitBox, v)

    // if (DEBUGGER) { 
    //   this.hitBox.active ? Engine.debugBox(this.hitBox, 'green') : Engine.debugBox(this.hitBox, 'gray');
    //   Engine.debugBox(this.attackBox, '#c65197');
    // }
  }

  controls() {
    if (!this.canControlPlayer) return
    const input = controls.inputDirection
    this.inputDirection = input
    if (input.x || input.y) this.lastNonZeroDirection = input
    this.fsm.handleInput(input)
  }

  public getDirection(vec: Vector2): string {
    if (vec.x > 0) return Direction.RIGHT;
    if (vec.x < 0) return Direction.LEFT;
    if (vec.y > 0) return Direction.DOWN;
    if (vec.y < 0) return Direction.UP;
    return Direction.NONE;
  }

  takeDamage(a: number) {
    if (!this.isInvincible && this.isAlive) {
      zzfx(...playerHitSFX)
      this.health -= a
      this.isInvincible = true
      this.lastHitTime = 0
    }
  }

  playerDied() {
    if (!this.isAlive) {
      this.velocity.x = this.velocity.y = 0
      this.canControlPlayer = false
      this.isInvincible = false
      if (!this.isPlayingPlayerDie) {
        zzfx(...playerDieSFX)
        this.isPlayingPlayerDie = true;
      } 
      this.particalSystem.burst(new Vector2(this.hitBox.position.x + this.hitBox.width / 2, this.hitBox.position.y + this.hitBox.height / 2), 60, '#c56981');
      setTimeout(() => {
        this.particalSystem.resetBurst();
      }, 1000);
    }
  }

  private playerInvincibleFrames(d: number) {
    if (this.isInvincible && this.isAlive) {
      this.lastHitTime += d; this.startFlashing += d
      if (this.lastHitTime >= this.invincibilityDuration) this.isInvincible = false
      else if (this.startFlashing >= this.flashDuration) {
        this.isVisible = !this.isVisible; this.startFlashing = 0
      }
    } else this.isVisible = true
  }

  public attackEnemy(enemy: any, index: number, enemiesArray: Array<any>) {
    let attackedEnemy: any = {};
    if ((this.collidedWith === enemy.name && this.isMeleeAttacking && enemy.isEnemyAttackedByPlayer) ||
      (this.collidedWith === enemy.name && this.isActiveProjecetile && enemy.isEnemyAttackedByPlayer)) {
      attackedEnemy = enemy;
      if (attackedEnemy.health > 0) {
        const attackPower = this.isMeleeAttacking ? this.attackedMeleePower : this.attackedProjectilePower;
        attackedEnemy.health -= attackPower;
        console.log(enemy.name + " Health: ", attackedEnemy.health);
        this.isMeleeAttacking = false;
        this.isProjectileAttacking = false;

        if (attackedEnemy.health <= 0) {
          const id = enemiesArray.findIndex(obj => obj.name === this.collidedWith);
          this.collidedWith = '';
          enemiesArray.splice(index, 1);
          this.isEnemyCollided = false;

          if (enemy.enemyType === ENEMY_TYPE.BLACK_CAT) {
            if (SOUND_FX) zzfx(...catDieSFX)
          } else if (enemy.enemyType === ENEMY_TYPE.BOSS_CAT) {
            if (SOUND_FX) zzfx(...bossDieSFX)
          }
        }
      }
      // if (attackedEnemy.health == 0) {
      //     const id = enemiesArray.findIndex(obj => obj.name === this.collidedWith);
      //     this.collidedWith = '';
      //     enemiesArray.splice(id, 1);
      //     this.isEnemyCollided = false;
      //     this.particalSystem.resetBurst() 

      //     // if (enemy.enemyType === ENEMY_TYPE.BAT) {
      //     //     if (SOUND_FX) audio.playBatEnemyHitFx();
      //     // } else if (enemy.enemyType === ENEMY_TYPE.SKULL) {
      //     //     if (SOUND_FX) audio.playSkullEnemyHitFx();
      //     // }
      // }

    }
    return attackedEnemy;

  }

  checkForHorizontalCollision(c: CollisionBlock[], pos: Vector2, hb: Box, v: Vector2) {
    for (let i = 0; i < c.length; i++) {
      const b = c[i]
      if (Engine.collisions(hb, b)) {
        if (v.x < 0) { v.x = 0; pos.x = b.position.x + b.width - (hb.position.x - pos.x) + .01; break }
        if (v.x > 0) { v.x = 0; pos.x = b.position.x - (hb.position.x - pos.x + hb.width) - .01; break }
      }
    }
  }

  checkForVerticalCollision(c: CollisionBlock[], pos: Vector2, hb: Box, v: Vector2) {
    for (let i = 0; i < c.length; i++) {
      const b = c[i]
      if (Engine.collisions(hb, b)) {
        if (v.y < 0) { v.y = 0; pos.y = b.position.y + b.height - (hb.position.y - pos.y) + .01; break }
        if (v.y > 0) { v.y = 0; pos.y = b.position.y - (hb.position.y - pos.y + hb.height) - .01; break }
      }
    }
  }

  switchSprite(name: string, hFlip?: boolean, vFlip?: boolean) {
    if (!this.animations) return
    for (let i = 0; i < this.animations.length; i++) {
      const a = this.animations[i]
      if (a.animationName === name) {
        if (this.image === a.props.image) return
        this.currentframe = 0
        this.image = a.props.image
        this.frameCount = a.props.frameCount
        this.frameBuffer = a.props.frameBuffer
        this.loop = a.props.loop
        this.isHozFlip = hFlip
        this.isVertFlip = vFlip ?? false;
        this.currentAnimation = a
      }
    }
  }
}
