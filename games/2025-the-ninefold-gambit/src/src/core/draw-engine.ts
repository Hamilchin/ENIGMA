import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/constans/game-contstans";

export class DrawEngine {
  context: CanvasRenderingContext2D;

  constructor(width?: number, height?: number) {
    this.context = c2d.getContext('2d');
    
    this.context.canvas.width = typeof(width) !== 'number' ? CANVAS_WIDTH : width;
    this.context.canvas.height = typeof(height) !== 'number' ? CANVAS_HEIGHT : height;
    this.context.imageSmoothingEnabled = false;
  }

  get canvasWidth() {
    return this.context.canvas.width;
  }

  get canvasHeight() {
    return this.context.canvas.height;
  }

  drawText(text: string, fontSize: number, x: number, y: number, color = 'white', textAlign: 'center' | 'left' | 'right' = 'center') {
    const context = c2d.getContext('2d', { alpha: false, desynchronized: false });
    context.imageSmoothingEnabled = false;

    context.font = `${fontSize}px Impact, sans-serif-black`;
    context.textAlign = textAlign;
    context.strokeStyle = 'black';

    context.textBaseline = 'middle';
    context.shadowColor = 'transparent'; // Disable any shadow
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;

    // context.lineWidth = 4;
    // context.strokeText(text, x, y);
    context.fillStyle = color;
    context.fillText(text, x, y);
  }
}

export const drawEngine = new DrawEngine();
