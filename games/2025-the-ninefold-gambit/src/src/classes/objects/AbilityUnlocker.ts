import { Vector2 } from "@/core/vector";
import { GameObject } from "../GameObject";
import { Player } from "../player/Player";
import { images } from "../Images";
import { zzfx } from "@/audio/zzfx";
import { abilityUnlockSFX } from "@/audio/sfx";

export class AbilityUnlocker extends GameObject {
  private ability: string;
  private xHop = Math.random()*Math.PI*2;
  private yHop = this.xHop*2;

  constructor(pos: Vector2, src: string, player: Player, ability: string){
    super(pos, src, player);
    this.name = 'ability_unlocker';
    this.ability = ability;
  }

  update(dt: number){
    images.getAbilityCheeseSprite(this.position);
    this.hop();
    this.updateHitbox();
  }

  collidePlayer(){
    const p = this.player;
    if(!this.checkCollision(p.hitBox) || !p.hitBox.active) return;
    if(p.fsm.isLocked(this.ability)){
      p.fsm.unlockState(this.ability);
      zzfx(...abilityUnlockSFX)
      this.position.x = this.position.y = -200000;
    }
  }

  private hop(){
    this.yHop += 0.1;
    this.position.y += Math.sin(this.yHop)*0.2;
  }

  private updateHitbox(){
    const hb = this.hitBox;
    hb.position.x = this.position.x;
    hb.position.y = this.position.y;
    hb.width = hb.height = 16;
  }
}
