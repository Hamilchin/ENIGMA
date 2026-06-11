import { State } from "@/core/state"
import { Player } from "./Player"
import { Vector2 } from "@/core/vector"
import { time } from "@/core/time"

export class PlayerDigdashState extends State<Player> {
  private spd = 100
  private dur = 500
  private t = 0
  private dir = Vector2.zero

  enter(): void {
    const p = this.gameObject
    p.switchSprite('digdash')
    p.isDashing = true
    p.lastDashTime = time.elapsed

    const i = p.directionVector, l = Math.hypot(i.x, i.y)
    this.dir = l > 0 ? new Vector2(i.x / l, i.y / l) : Vector2.right
    this.t = 0
  }

  update(d: number): void {
    this.t += d
    const p = this.gameObject, v = p.velocity, dir = this.dir
    v.x = dir.x * this.spd
    v.y = dir.y * this.spd
    if (this.t >= this.dur) { p.isDashing = false; this.stateMachine.changeState('idle') }
  }
}
