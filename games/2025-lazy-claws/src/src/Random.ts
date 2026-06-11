let s = 2023;

export class Random {
    seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    static get() {
        s = (s + 1) % 10000;
        return new Random(s);
    }

    next(): number {
        this.seed = (this.seed * 16807) % 2147483647;
        const rand = Math.sin(this.seed) * 10000;
        return rand - Math.floor(rand);
    }
}