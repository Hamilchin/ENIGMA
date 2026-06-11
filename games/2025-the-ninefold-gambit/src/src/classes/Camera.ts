import { Vector2 } from '@/core/vector';
import { Box } from '@/model/common.model';
import { Engine } from '@/core/engine';
import { drawEngine } from '@/core/draw-engine';

export class Camera {
  public position = new Vector2(0,0);
  public scale = 1;
  public viewportWidth: number;
  public viewportHeight: number;
  private viewCenterX: number;
  private viewCenterY: number;
  private mapWidth = 0;
  private mapHeight = 0;
  public lockZones: Box[] = [];

  constructor(w:number,h:number){
    this.viewportWidth=w;
    this.viewportHeight=h;
    this.viewCenterX=w/2;
    this.viewCenterY=h/2;
  }

  setMapSize(w:number,h:number){this.mapWidth=w;this.mapHeight=h;}
  setLockZones(z:Box[]){this.lockZones=z;}

  follow(t:Vector2, tCenter:Vector2,hb?:Box){
    let locked=false,lc=new Vector2();
    for(const z of this.lockZones){
      if(Engine.collisions(hb??new Box(t,1,1),z)){
        locked=true;
        lc=new Vector2(z.position.x+z.width/2,z.position.y+z.height/2);
        break;
      }
    }
    const c=locked?lc:tCenter;
    this.position.x=Math.min(Math.max(0,c.x-this.viewCenterX),this.mapWidth-this.viewportWidth);
    this.position.y=Math.min(Math.max(0,c.y-this.viewCenterY),this.mapHeight-this.viewportHeight);
  }

  applyTransform(ctx:CanvasRenderingContext2D){
    ctx.scale(this.scale,this.scale);
    ctx.translate(-Math.round(this.position.x),-Math.round(this.position.y));
  }

  resetTransform(ctx:CanvasRenderingContext2D){ctx.setTransform(1,0,0,1,0,0);}

  drawDimOverlayIfLocked(ph:Box){
    const ctx=drawEngine.context;
    for(const z of this.lockZones){
      ctx.save();
      ctx.globalCompositeOperation=Engine.collisions(ph,z)?'destination-in':'destination-out';
      ctx.fillStyle='rgba(0,0,0,1)';
      ctx.fillRect(z.position.x,z.position.y,z.width,z.height);
      ctx.restore();
    }
  }
}
