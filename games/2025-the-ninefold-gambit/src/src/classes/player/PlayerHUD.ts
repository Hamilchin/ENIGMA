import { Vector2 } from "@/core/vector";
import { images } from "../Images";
import { drawEngine } from "@/core/draw-engine";

export class PlayerHUD {

    public position: Vector2 = new Vector2();
    private showHearts: boolean = false;
    private showDash: boolean = false;

    private canvasWidth: number = 0;
    private canvasHeight: number = 0;

    constructor(position: Vector2, showHearts: boolean, showDash: boolean = false) {
        this.position = position;
        this.showHearts = showHearts;
        this.showDash = showDash;

        this.canvasWidth = drawEngine.context.canvas.width;
        this.canvasHeight = drawEngine.context.canvas.height;
    }

    public healthImgDraw() {
        if (this.showHearts) {
            images.getHeartSprite(this.position);
        }
    }

}