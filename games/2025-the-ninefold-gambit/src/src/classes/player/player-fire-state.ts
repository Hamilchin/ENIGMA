import { State } from "@/core/state"
import { Player } from "./Player"
import { controls } from "@/core/controls"
import { Projectile } from "../Projectile"
import { Vector2 } from "@/core/vector"
import { fireballSFX } from "@/audio/sfx"
import { zzfx } from "@/audio/zzfx"
import { ProjectileType } from "@/constans/game-contstans"

const BOFFX = -8, BOFFY = -5

export class PlayerFireState extends State<Player> {
  enter(): void {
    const p = this.gameObject
    p.isFiring = true
    p.switchSprite('idle', p.playerDirection > 0)
  }

  handleInput(_: any): void {
    const p = this.gameObject, c = controls
    if (_.x || _.y) this.stateMachine.changeState('move')
    if (!c.inputDirection.x && !c.inputDirection.y) this.stateMachine.changeState('idle')

    if (c.isFire && !p.isPunching) {
      if (p.projectileArray?.length > 0) return
      this.fire()
    }
  }

  fire(): void {
    const p = this.gameObject
    const pos = new Vector2(
      p.position.x + p.width / 2 + BOFFX,
      p.position.y + p.height / 2 + BOFFY
    )
    const proj = new Projectile(pos, 180, p.directionVector, 500, ProjectileType.PLAYER)
    p.projectileArray.push(proj)
    p.isActiveProjecetile = p.isProjectileAttacking = true
    zzfx(...fireballSFX)
  }

  exit(): void { this.gameObject.isFiring = false }
}
