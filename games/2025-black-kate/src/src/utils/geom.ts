import { mathHypot } from "./math"

export interface Vector2 {
    x: number,
    y: number,
}

export interface Box2 {
    x: number,
    y: number,
    w: number,
    h: number,
}

export interface Transform {
    a: number,
    b: number,
    c: number,
    d: number,
    tx: number,
    ty: number,
}

export namespace Vector2 {
    export const normalize_ = (a: Vector2) => {
        const l = length_(a);
        if (l > 0) {
            a.x /= l;
            a.y /= l;
        }
    }

    export const length_ = (a: Vector2): number => {
        return mathHypot(a.x, a.y);
    }

    export const distance_ = (a: Vector2, b: Vector2): number => {
        return mathHypot(a.x - b.x, a.y - b.y);
    }

    export const add_ = (a: Vector2, b: Vector2): Vector2 => {
        return { x: a.x + b.x, y: a.y + b.y };
    }

    export const subtract_ = (a: Vector2, b: Vector2): Vector2 => {
        return { x: a.x - b.x, y: a.y - b.y };
    }

    export const scale_ = (a: Vector2, s: number): Vector2 => {
        return { x: a.x * s, y: a.y * s };
    }
}

export const vector2 = (x: number = 0, y: number = 0): Vector2 => ({ x, y });

export const box2 = (x: number = 0, y: number = 0, w: number = 0, h: number = 0): Box2 => ({ x, y, w, h });

export namespace Box2 {
    export const contains_ = (b: Box2, v: Vector2): boolean => {
        return b.x < v.x && v.x < b.x + b.w &&
            b.y < v.y && v.y < b.y + b.h;
    }
}