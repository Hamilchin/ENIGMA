import type { Scene } from "./Scene";

export class Renderer {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    frameId: number = -1;
    fps_timestamp: number = -1;
    fps_interval: number;
    scene?: Scene;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d', { alpha: false, willReadFrequently: true })!;

        const ratio = window.devicePixelRatio;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * ratio;
        canvas.height = rect.height * ratio;

        this.context.scale(ratio, ratio);

        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        this.context.imageSmoothingEnabled = false;

        this.fps_interval = 1000 / 60;
    }

    tick = () => {
        this.frameId = requestAnimationFrame(this.tick);

        const now = Date.now();
        const elapsed = now - this.fps_timestamp;

        if (elapsed < this.fps_interval) {
            return;
        }

        this.fps_timestamp = now - (elapsed % this.fps_interval);

        if (this.scene) {
            this.scene.update(elapsed);
            this.scene.draw(this.context);
        }
    }

    start() {
        this.tick();
    }
}
