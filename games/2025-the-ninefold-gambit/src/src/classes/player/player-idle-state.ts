import { State } from "@/core/state"
import { Player } from "./Player"
import { controls } from "@/core/controls"
import { Vector2 } from "@/core/vector"
import { time } from "@/core/time"

export class PlayerIdleState extends State<Player> {
  enter(): void {
    const p = this.gameObject, v = p.velocity, d = p.directionVector
    v.x = v.y = 0

    if (d.equals(Vector2.zero)) p.directionVector = Vector2.up

    if (d.y > 0) p.switchSprite('idle', !(p.playerDirection > 0))
    else if (d.y < 0) p.switchSprite('idle', !(p.playerDirection < 0))
    else if (d.x > 0) p.switchSprite('idle', !(p.playerDirection > 0))
    else if (d.x < 0) p.switchSprite('idle', !(p.playerDirection < 0))
    else p.switchSprite('idle', (p.playerDirection < 0))
  }

  handleInput(i: any): void {
    const p = this.gameObject, c = controls, t = time.elapsed
    if (i.x || i.y) this.stateMachine.changeState('move')
    if (c.isFire && !c.previousState.isFire) this.stateMachine.changeState('fire')
    if (c.isAttack && !p.isFiring && !p.isPunching && t - p.lastPunchTime >= p.punchCooldown) this.stateMachine.changeState('melee')
    if (c.isDash && !p.isDashing && t - p.lastDashTime >= p.dashCooldown) this.stateMachine.changeState('digdash')
  }
}
