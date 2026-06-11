import { Entity } from "./Entity";
import type { Sprite } from "./Sprite";
import { Vec } from "./Vector";

export class O2D {
    position: Vec;
    scale: number;
    entity?: Entity;
    sprite: Sprite;
    frame: string;
    finite: boolean;

    hb: boolean;
    hi: boolean;
    vi: boolean;

    constructor(
        position: [number, number],
        scale: number,
        sprite: Sprite,
        frame: string,
        params: {
            hb?: boolean,
            hi?: boolean,
            vi?: boolean,
        } = {}
    ) {
        this.position = new Vec(position[0], position[1]);
        this.sprite = sprite;
        this.scale = scale;
        this.frame = frame;
        this.hb = params.hb ?? true;
        this.hi = params.hi ?? false;
        this.vi = params.vi ?? false;
        this.finite = this.sprite.frame.f;

        this.sprite.play(this.frame);

        if (this.hb) {
            const hw = (this.width / 2) | 0;
            const hh = (this.height / 2) | 0;
            this.entity = Entity.polygon(this.position, [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]], 'red');
        }
    }

    get width() {
        return this.sprite.frame.w * this.scale;
    }

    get height() {
        return this.sprite.frame.h * this.scale;
    }

    update(delta: number) {
        if (!this.finite) {
            this.sprite.update(delta);
        }
    }

    draw(context: CanvasRenderingContext2D) {
        this.sprite.play(this.frame);
        this.sprite.hi = this.hi;
        this.sprite.vi = this.vi;
        this.sprite.draw(context, this.position.x, this.position.y, this.width, this.height);
    }
}
