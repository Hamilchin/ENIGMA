export class CanvasBuffer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor(width: number, height: number) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d")!;
  }

  drawSprite(
    image: HTMLImageElement,
    dx: number,
    dy: number,
    sx: number,
    sy: number,
    sw: number,
    sh: number
  ) {
    this.ctx.save();
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(image, sx, sy, sw, sh, dx, dy, sw * 2, sh * 2);
    this.ctx.restore();
  }

  toImage(): HTMLImageElement {
    const img = new Image();
    img.src = this.canvas.toDataURL();
    return img;
  }
}
