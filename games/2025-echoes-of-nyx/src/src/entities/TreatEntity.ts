import { treatImage } from '../assets';
import { getGridRealHeight, getSquareSize } from '../config';
import Entity from './Entity';

export default class TreatEntity extends Entity {
  frameCounter: number = 0;
  offsetShift: number = 0;
  moveDown: boolean = true;

  constructor(x: number, y: number, isFilled: boolean = true) {
    super(x, y, 0.5, 0.5);
    this.isFilled = isFilled;
  }

  render(ctx: CanvasRenderingContext2D) {
    this.frameCounter++;
    if (this.frameCounter > 6) {
      this.frameCounter = 0;
      this.offsetShift += this.moveDown ? 1 : -1;
      if (this.offsetShift === 3) {
        this.moveDown = false;
      } else if (this.offsetShift === -3) {
        this.moveDown = true;
      }
    }
    if (!this.isFilled) {
      ctx.filter = 'invert(1) opacity(0.4)';
    }
    ctx.drawImage(
      treatImage,
      this.x + 0.25 * getSquareSize(),
      getGridRealHeight() - this.y - this.height * 1.5 + this.offsetShift,
      this.width,
      this.height,
    );
  }
}
