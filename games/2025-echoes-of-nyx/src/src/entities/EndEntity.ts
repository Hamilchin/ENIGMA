import { cardBoardImage } from '../assets';
import { getGridRealHeight } from '../config';
import Entity from './Entity';

export default class EndEntity extends Entity {
  isFilled: boolean;

  constructor(x: number, y: number, isFilled: boolean = true) {
    super(x, y, 2, 2);
    this.isFilled = isFilled;
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();

    if (!this.isFilled) {
      ctx.filter = 'invert(1) opacity(0.4)';
    }
    ctx.drawImage(cardBoardImage, this.x, getGridRealHeight() - this.y - this.height, this.width, this.height);

    ctx.restore();
  }
}
