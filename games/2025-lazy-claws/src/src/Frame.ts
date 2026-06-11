export class Frame {
    g: number;
    c: number;
    i: number;
    f: boolean;
    sx: number;
    sy: number;
    w: number;
    h: number;
    timer: number;
    index: number;
    finished: boolean = false;

    constructor(
        x: number,
        y: number,
        w: number,
        h: number,
        c?: number,
        g?: number,
        i?: number,
        f?: boolean,
    ) {
        this.g = g ?? 0;
        this.c = c ?? 1;
        this.i = i ?? Infinity;
        this.f = f ?? this.c === 1;
        this.sx = x;
        this.sy = y;
        this.w = w;
        this.h = h;

        this.timer = 0;
        this.index = 0;
    }

    get x() {
        return this.sx + this.index * (this.w + this.g);
    }

    get y() {
        return this.sy;
    }

    reset() {
        this.timer = 0;
        this.index = 0;
        this.finished = false;
    }

    update(delta: number) {
        this.timer += delta;

        if (this.timer < this.i || this.finished) {
            return;
        }

        this.timer = 0;
        this.index = this.index + 1;

        if (this.index >= this.c) {
            if (!this.f) {
                this.index = 0;
            } else {
                this.index = this.c - 1;
                this.finished = true;
            }
        }
    }
}