import { catImage, catImageHeight, catImageWidth } from '../assets';
import { getGridRealHeight, getGridRealWidth, getSquareSize, gridWidth } from '../config';
import { Box, Coord } from '../utils';
import Entity from './Entity';

export const idleSym = Symbol('idle');
export const runSym = Symbol('run');
const jumpSym = Symbol('jump');
const fallSym = Symbol('fall');
const landSym = Symbol('land');

export default class PlayerEntity extends Entity {
  isGrounded: boolean = false;
  isRunning: boolean = false;
  isJumping: boolean = false;
  isLeft: boolean = false;
  currentFrame: number;
  currentAnimation: symbol = idleSym;
  frameCounter: number;
  loopAnimation: boolean;
  backToIdle: boolean;
  hitBox: Entity;
  paused: boolean = false;
  offsets: Coord = { x: 0, y: 0 };
  catSet: number = 0;
  platformMovement: number = 0;

  animations: { [name: symbol]: number[] } = {
    [idleSym]: [0, 7],
    [runSym]: [8, 11],
    [jumpSym]: [13, 16, 1],
    [fallSym]: [17, 18],
    [landSym]: [19, 20],
  };

  set x(value: number) {
    this._x = value;
  }

  get x(): number {
    const dx = (this._width / 2) * (this.isLeft ? 1 : 0);

    return Math.round((this._x + dx) * getSquareSize() + this.offsets.x);
  }

  set y(value: number) {
    this._y = value;
  }

  get y(): number {
    return Math.round(this._y * getSquareSize() + this.offsets.y);
  }

  get hitbox(): Box {
    return {
      x: this.x - this.hitBox.x * (this.isLeft ? 1 : -1),
      y: this.y - this.hitBox.y,
      width: this.hitBox.width,
      height: this.hitBox.height,
    };
  }

  constructor(x: number, y: number, isStartLeft: boolean = false) {
    super(x, y, 2, 2);

    this.isLeft = isStartLeft;
    this.frameCounter = 0;
    this.currentAnimation = idleSym;
    this.currentFrame = this.animations[this.currentAnimation][0];
    this.loopAnimation = true;
    this.hitBox = new Entity(0.5, 0, 1, 1);
  }

  resetAnimationFrame(sym?: symbol) {
    if (sym) {
      this.currentAnimation = sym;
    }
    this.currentFrame = this.animations[this.currentAnimation][0];
    this.loopAnimation = [runSym, idleSym].includes(this.currentAnimation);
    if (this.currentAnimation === landSym) {
      this.backToIdle = true;
    }
  }

  isInXLimit(x: number) {
    const { x: hX, width } = this.hitbox;
    return hX + x + width <= getGridRealWidth() && hX + x >= 0;
  }

  update(x: number = 0, y: number = 0, byPassLimit = false) {
    let anim: symbol = [fallSym, landSym].includes(this.currentAnimation) ? landSym : idleSym;
    if (x) {
      if (byPassLimit || this.isInXLimit(x)) {
        if (x - this.platformMovement !== 0) {
          anim = runSym;
        }
        this.offsets.x += x;
      }
    }
    if (y) {
      this.offsets.y += y;
      anim = y >= 0 ? jumpSym : fallSym;
    }
    if (this.currentAnimation !== anim) {
      this.resetAnimationFrame(anim);
    }
  }

  render(ctx: CanvasRenderingContext2D, withAnimation: boolean = true) {
    if (withAnimation && !this.paused) {
      this.frameCounter++;
      const [start, end, animation] = this.animations[this.currentAnimation];
      if (this.frameCounter > (animation ?? end - start + 1)) {
        this.frameCounter = 0;
        if (this.currentFrame + 1 === end + 1) {
          if (this.loopAnimation) {
            this.resetAnimationFrame();
          }
          if (this.backToIdle) {
            this.resetAnimationFrame(this.isRunning ? runSym : idleSym);
            this.backToIdle = false;
          }
        } else {
          this.currentFrame++;
        }
      }
    }

    ctx.save();
    if (this.isLeft) {
      ctx.translate(Math.round(this.width / 2), 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(
      catImage,
      this.currentFrame * catImageWidth,
      this.catSet * catImageHeight,
      catImageWidth,
      catImageHeight,
      this.x * (this.isLeft ? -1 : 1),
      getGridRealHeight() - this.y - this.height,
      this.width,
      this.height,
    );

    ctx.restore();
  }
}
