import { UiElement } from './UiElement';

export interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
}

export class UiImage extends UiElement {
  image: HTMLImageElement;
  needRender: boolean;
  crop: Crop;

  constructor(x: number, y: number, size: number, image: HTMLImageElement, centered: boolean[] = [false, false]) {
    super(x, y, size, centered);
    this.image = image;
    this.centerElement();
  }

  getRealSize() {
    return {
      width: this.crop ? this.crop.w : this.image.width * this.size,
      height: this.crop ? this.crop.h : this.image.height * this.size,
    };
  }

  render(ctx: CanvasRenderingContext2D, inverted: boolean) {
    if (!this.needRender) {
      return;
    }
    ctx.save();
    super.render(ctx, inverted);
    if (this.crop) {
      ctx.drawImage(
        this.image,
        this.crop.x,
        this.crop.y,
        this.crop.w,
        this.crop.h,
        this.x,
        this.y,
        this.crop.w,
        this.crop.h,
      );
    } else {
      ctx.drawImage(this.image, this.x, this.y, this.image.width * this.size, this.image.height * this.size);
    }
    ctx.restore();
    this.needRender = false;
  }
}
