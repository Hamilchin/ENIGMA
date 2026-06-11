import type { Random } from "./Random";

export class Vec {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static radian(angle: number) {
        return new Vec(Math.sin(angle), Math.cos(angle)).norm();
    }
    static random(rnd: Random) {
        return new Vec(rnd.next() * 2 - 1, rnd.next() * 2 - 1).norm();
    }
    add(vec: Vec) {
        return new Vec(this.x + vec.x, this.y + vec.y);
    }
    sub(vec: Vec) {
        return new Vec(this.x - vec.x, this.y - vec.y);
    }
    equal(vec: Vec) {
        return this.x === vec.x && this.y === vec.y
    }
    empty() {
        return this.equal(new Vec(0, 0))
    }
    scale(num: number) {
        return new Vec(this.x * num, this.y * num);
    }
    dot(vec: Vec) {
        return this.x * vec.x + this.y * vec.y;
    }
    cross(vec: Vec) {
        return this.x * vec.y - this.y * vec.x;
    }
    len() {
        return Math.hypot(this.x, this.y);
    }
    norm() {
        const len = this.len();
        return len !== 0 ? new Vec(this.x / len, this.y / len) : new Vec(0, 0);
    }
    normal(vec: Vec) {
        const edge = vec.sub(this);
        return new Vec(-edge.y, edge.x).norm();
    }
    dist(vec: Vec) {
        return this.sub(vec).len();
    }
    clone() {
        return new Vec(this.x, this.y)
    }
    perpendicular() {
        return new Vec(-this.y, this.x);
    }
    negate() {
        return this.scale(-1);
    }
    reflect(normal: Vec) {
        return this.sub(normal.scale(2 * this.dot(normal)));
    }
    rotate(angle: number) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vec(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
    }
}