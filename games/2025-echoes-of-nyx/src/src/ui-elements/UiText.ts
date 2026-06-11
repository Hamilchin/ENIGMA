import { canvas } from '../assets';
import { displayString, getTextRealSizes } from '../text-utils';
import { UiElement } from './UiElement';
import { UiImage } from './UiImage';

export class UiText extends UiElement {
  _text: string;
  needRender: boolean;

  constructor(x: number, y: number, text: string, size: number, centered?: boolean[]) {
    super(x, y, size, centered);
    this.text = text;
    this.centerElement();
  }

  set text(value: string) {
    this._text = value;
    this.parent?.update();
  }

  getRealSize() {
    return getTextRealSizes(this._text, this.size);
  }

  render(ctx: CanvasRenderingContext2D, inverted: boolean) {
    if (!this.needRender) {
      return;
    }
    ctx.save();
    super.render(ctx, inverted);
    displayString(ctx, this.x, this.y, this._text, this.size);
    ctx.restore();
    this.needRender = false;
  }

  toImage() {
    const exportImg = new Image();
    exportImg.src = canvas.toDataURL('image/png');
    const img = new UiImage(0, 0, 1, exportImg, this.centered);
    img.inverted = 0;
    img.crop = {
      x: this.x,
      y: this.y,
      w: this.width,
      h: this.height + 3 * this.size,
    };
    return img;
  }
}
