import { Vector2 } from "@/core/vector";
import { Box } from "@/model/common.model";
import { GameObject } from "../GameObject";
import { Player } from "../player/Player";
import { OBJECT_BLOCK } from "@/constans/game-contstans";
import { images } from "../Images";
import { bossDieSFX } from "@/audio/sfx";
import { zzfx } from "@/audio/zzfx";

export class ObjectBlock extends GameObject {
  public health = 4;
  public type: string;
  public size: Box|null;

  constructor(pos: Vector2, src: string, player: Player, type: string, size?: Box){
    super(pos, src, player);
    this.name = type+'_block';
    this.type = type;
    this.size = size||null;
  }

  update(dt: number){
    this.drawSprite();
    this.updateHitbox();
    this.collidePlayer();
    this.playerHitBlock();
  }

  private updateHitbox(){
    const hb = this.hitBox, s = this.size;
    hb.position.x = this.position.x;
    hb.position.y = this.position.y;
    hb.width = s?s.width:16;
    hb.height = s?s.height:16;
  }

  collidePlayer(){
    const p = this.player.hitBox, e = this.hitBox;
    if(!this.checkCollision(p)||(!p.active&&this.type!=OBJECT_BLOCK.BLOCK_TILE)) return;

    const ox = Math.min(e.position.x+e.width,p.position.x+p.width)-Math.max(e.position.x,p.position.x);
    const oy = Math.min(e.position.y+e.height,p.position.y+p.height)-Math.max(e.position.y,p.position.y);

    if(ox<oy) this.player.position.x+=(p.position.x+p.width/2<e.position.x+e.width/2)?-ox:ox;
    else this.player.position.y+=(p.position.y+p.height/2<e.position.y+e.height/2)?-oy:oy;
  }

  collideWithOthers(blocks: ObjectBlock[]){
    const a = this.hitBox;
    for(let i=blocks.indexOf(this)+1;i<blocks.length;i++){
      const other = blocks[i], b = other.hitBox;
      if(!this.checkCollision(b)) continue;
      const ox = Math.min(a.position.x+a.width,b.position.x+b.width)-Math.max(a.position.x,b.position.x);
      const oy = Math.min(a.position.y+a.height,b.position.y+b.height)-Math.max(a.position.y,b.position.y);
      const eps=0.1;
      if(ox<oy){
        const shift=ox/2+eps, left=a.position.x+a.width/2<b.position.x+b.width/2;
        this.position.x+=left?-shift:shift;
        other.position.x+=left?shift:-shift;
      } else{
        const shift=oy/2+eps, top=a.position.y+a.height/2<b.position.y+b.height/2;
        this.position.y+=top?-shift:shift;
        other.position.y+=top?shift:-shift;
      }
    }
  }

  playerHitBlock(){
    if(this.type!='wood'||!(this.player.isMeleeAttacking||this.player.isFiring)) return;
    if(this.checkCollision(this.player.attackBox)&&this.player.attackBox.active){
      this.position.x=this.position.y=-2000;

      setTimeout(() => {
      zzfx(...bossDieSFX)
      }, 100);
    }
  }

  private drawSprite(){
    const pos=this.position;
    const t=this.type;
    if(t==OBJECT_BLOCK.WOOD) images.getWoodBlockSprite(pos);
    else if(t==OBJECT_BLOCK.STONE) images.getStoneBlockSprite(pos);
    else if(t==OBJECT_BLOCK.BLOCK_TILE) images.getBlockTileSprite(pos);
  }
}
