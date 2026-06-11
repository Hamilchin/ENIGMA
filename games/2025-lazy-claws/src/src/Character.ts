import type { Game } from "./Game";
import { Vec } from "./Vector";

export class Character {
    p: Vec;
    w: number;
    h: number;
    s: number;
    hp: number;
    dir: Vec;
    game: Game;

    constructor(p: Vec, w: number, h: number, s: number, hp: number, game: Game) {
        this.p = p
        this.w = w
        this.h = h
        this.s = s
        this.hp = hp
        this.game = game
        this.dir = new Vec(0, 0);
    }

    wouldCollide(next: Vec) {
        const scene = this.game.scene;

        if (!scene) {
            return false;
        }

        for (const entity of scene.allEntities) {
            if (entity.intersect(next, Math.max(this.w, this.h))) {
                return true;
            }
        }

        return false;
    }

    update(smooth: boolean = false) {
        if (this.s === 0) {
            return;
        };

        const move = this.dir.scale(this.s);

        const nextX = this.p.add(new Vec(move.x, 0));
        const nextY = this.p.add(new Vec(0, move.y));
        const nextXY = this.p.add(move);

        if (smooth) {
            if (!this.wouldCollide(nextXY)) {
                this.p = nextXY;
            } else {
                let moved = false;

                if (!this.wouldCollide(nextX)) {
                    this.p = nextX;
                    moved = true;
                }

                if (!this.wouldCollide(nextY)) {
                    this.p = nextY;
                    moved = true;
                }

                if (!moved) {
                    this.p = this.p;
                }
            }
        } else {
            if (!this.wouldCollide(nextXY)) {
                this.p = nextXY;
            }
        }
    }
}