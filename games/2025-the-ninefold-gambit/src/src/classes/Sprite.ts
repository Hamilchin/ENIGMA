import { drawEngine } from "@/core/draw-engine";
import { Vector2 } from "@/core/vector";
import { Animations, Box } from "@/model/common.model";

export class Sprite {
    public position: Vector2;
    protected image: HTMLImageElement;
    private isLoaded: boolean = false;
    public width: number = 0;
    public height: number = 0;
    public currentAnimation: any;
    public animations: Array<Animations> | undefined = [];

    private cropBox: Box = new Box();
    protected frameCount: number;
    protected currentframe: number = 0;
    private elapsedFrames: number = 0;
    protected frameBuffer: number;
    protected isHozFlip: boolean | undefined = false;
    protected isVertFlip: boolean | undefined = false;
    protected loop: boolean;
    protected autoplay: boolean;

    constructor(
        position: Vector2,
        src: string,
        animations?: Array<Animations>,
        frameCount = 1,
        frameBuffer = 0,
        loop = true,
        autoplay = true
    ) {
        this.position = position;
        this.frameCount = frameCount;
        this.frameBuffer = frameBuffer;
        this.loop = loop;
        this.autoplay = autoplay;

        this.image = new Image();
        this.image.src = src;
        this.image.onload = () => {
            if (!this.image) return;
            this.width = this.image.width / this.frameCount;
            this.height = this.image.height;
            this.isLoaded = true;
        };

        if (animations) {
            this.animations = animations;
            for (const animation of animations) {
                const img = new Image();
                img.src = animation.props.src;
                animation.props.image = img;
            }
        }
    }

    public draw() {
        if (!this.isLoaded) return;

        this.cropBox.position.x = this.width * this.currentframe;
        this.cropBox.width = this.width;
        this.cropBox.height = this.height;

        const ctx = drawEngine.context;
        ctx.imageSmoothingEnabled = false;

        if (this.isHozFlip || this.isVertFlip) {
            ctx.save();
            ctx.translate(
                this.position.x + (this.isHozFlip ? this.width : 0),
                this.position.y + (this.isVertFlip ? this.height : 0)
            );
            ctx.scale(this.isHozFlip ? -1 : 1, this.isVertFlip ? -1 : 1);
            ctx.drawImage(
                this.image,
                this.cropBox.position.x,
                this.cropBox.position.y,
                this.cropBox.width,
                this.cropBox.height,
                0,
                0,
                this.width,
                this.height
            );
            ctx.restore();
        } else {
            ctx.drawImage(
                this.image,
                this.cropBox.position.x,
                this.cropBox.position.y,
                this.cropBox.width,
                this.cropBox.height,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            );
        }

        this.updateFrames();
    }

    public update(delta: number) {
        this.draw();
    }

    public play() {
        this.autoplay = true;
    }

    public stop() {
        this.autoplay = false;
    }

    public updateFrames() {
        if (!this.autoplay || this.frameCount <= 1 || this.frameBuffer === 0) return;

        this.elapsedFrames++;
        if (this.elapsedFrames % this.frameBuffer === 0) {
            if (this.currentframe < this.frameCount - 1) {
                this.currentframe++;
            } else if (this.loop) {
                this.currentframe = 0;
            }

            if (this.currentAnimation?.onComplete && !this.currentAnimation.isActive && this.currentframe === this.frameCount - 1) {
                this.currentAnimation.onComplete();
                this.currentAnimation.isActive = true;
            }
        }
    }
}
