import { State } from "@/core/state"
import { Player } from "./Player"
import { controls as c } from "@/core/controls"
import { Vector2 } from "@/core/vector"
import { time } from "@/core/time"

export class PlayerMoveState extends State<Player> {
  dirX = 1
  dirY = 0

  handleInput(_: any): void {
    const p = this.gameObject, t = time.elapsed

    if (c.isFire && !c.previousState.isFire) return this.stateMachine.changeState('fire')
    if (c.isAttack && !p.isFiring && !p.isPunching && t - p.lastPunchTime >= p.punchCooldown) return this.stateMachine.changeState('melee')
    if (c.isDash && !p.isDashing && t - p.lastDashTime >= p.dashCooldown) return this.stateMachine.changeState('digdash')

    if (c.inputDirection.x) {
      this.dirX = c.inputDirection.x > 0 ? 1 : -1
      p.isHozFlip = c.inputDirection.x < 0
    }

    if (c.isLeft && !c.previousState.isRight) {
      p.directionVector = Vector2.left
      this.dirX = -1
      p.switchSprite('run', true)
    } else if (c.isRight && !c.previousState.isLeft) {
      p.directionVector = Vector2.right
      this.dirX = 1
      p.switchSprite('run')
    } else if (c.isUp && !c.previousState.isDown) {
      p.directionVector = Vector2.down
      this.dirY = this.dirX < 0 ? -1 : 1
      p.switchSprite('run')
    } else if (c.isDown && !c.previousState.isUp) {
      p.directionVector = Vector2.up
      this.dirY = this.dirX < 0 ? -1 : 1
      p.switchSprite('run')
    } else {
      p.switchSprite('idle', this.dirX < 0)
    }

    if (!c.inputDirection.x && !c.inputDirection.y) return this.stateMachine.changeState('idle')

    const len = Math.hypot(c.inputDirection.x, c.inputDirection.y)
    p.velocity.x = len ? (c.inputDirection.x / len) * p.speed : 0
    p.velocity.y = len ? (c.inputDirection.y / len) * p.speed : 0
  }
}
