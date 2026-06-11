import { State } from "@/core/state"
import { Player } from "./Player"
import { Vector2 } from "@/core/vector"
import { attackSFX } from "@/audio/sfx"
import { zzfx } from "@/audio/zzfx"
import { time } from "@/core/time"
import { Direction, SOUND_FX } from "@/constans/game-contstans"

export class PlayerMeleeState extends State<Player> {
  private spd = 50
  private dur = 200
  private t = 0
  private dir = Vector2.zero

  enter(): void {
    const p = this.gameObject
    if (p.isActiveProjecetile || p.isDialogActive) return
    this.meleeAttack()
    zzfx(...attackSFX)
    p.isPunching = true
    p.lastPunchTime = time.elapsed
    this.t = 0
  }

  update(d: number): void {
    this.t += d
    const p = this.gameObject, v = p.velocity, dir = this.dir
    v.x = dir.x * this.spd
    v.y = dir.y * this.spd
    if (this.t >= this.dur) { p.isPunching = false; this.stateMachine.changeState('idle') }
    this.meleeAttackBox()
  }

  meleeAttack(): void {
    const p = this.gameObject, d = p.directionVector
    p.isMeleeAttacking = true
    if (d.x) p.switchSprite('melee', d.x < 0)
    else if (d.y < 0) p.switchSprite('melee_down',false, true)
    else if (d.y > 0) p.switchSprite('melee_down',false, false)
  }

  meleeAttackBox(): void {
    const p = this.gameObject, pos = p.position, atk = p.attackBox
    let off = new Vector2(0,0), w = 0, h = 0
    switch (p.getDirection(p.directionVector)) {
      case Direction.LEFT:  off = new Vector2(2,30);  w=25; h=15; break
      case Direction.RIGHT: off = new Vector2(38,30); w=25; h=15; break
      case Direction.UP:    off = new Vector2(25,4);  w=15; h=25; break
      case Direction.DOWN:  off = new Vector2(25,38); w=15; h=25; break
    }
    atk.active = true
    atk.position.x = pos.x + off.x
    atk.position.y = pos.y + off.y
    atk.width = w
    atk.height = h
  }
}
