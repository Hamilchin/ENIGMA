import { Vec } from "./Vector";
import type { Game } from "./Game";

function circleLineCollision(p: Vec, radius: number, a: Vec, b: Vec): boolean {
    const ab = b.sub(a);
    const ap = p.sub(a);
    const t = Math.max(0, Math.min(1, ap.dot(ab) / ab.dot(ab)));
    const closest = a.add(ab.scale(t));
    const dist = p.dist(closest);
    return dist <= radius;
}

function circlePointCollision(p: Vec, radius: number, point: Vec): boolean {
    return p.dist(point) <= radius;
}

export class Projectile {
    p: Vec;
    d: Vec;
    game: Game;
    speed: number;
    angle = 0;
    c = 0;

    constructor(position: Vec, direction: Vec, game: Game, speed = 4) {
        this.p = position;
        this.d = direction;
        this.game = game;
        this.speed = speed;
    }

    update() {
        const scene = this.game.scene;

        if (!scene) {
            return;
        }

        if (this.speed < 1.5) {
            this.speed *= 0.992;
        } else {
            this.speed *= 0.9985;
        }
    
        const next = this.p.add(this.d.scale(this.speed));

        let collided = false;

        for (const entity of scene.allEntities) {
            for (const [a, b] of entity.lines) {
                if (circleLineCollision(next, 4, a, b)) {
                    const normal = a.normal(b);
                    this.d = this.d.reflect(normal).norm();
                    collided = true;
                }

                if (circlePointCollision(next, 4, a) || circlePointCollision(next, 4, b)) {
                    const cornerNormal = next.sub(a).norm();
                    this.d = this.d.reflect(cornerNormal).norm();
                    collided = true;
                }
            }
        }

        if (!collided) {
            this.p = next;
        } else {
            if (this.speed > 0.25) {
                this.game.sound.playEffect('blip');
            }
            this.speed *= 0.95;
            this.p = this.p.add(this.d.scale(this.speed));
        }

        this.c += 1;

        if (this.c === 10) {
            this.c = 0;
            if (this.speed > 0.5) {
                this.angle = (this.angle + 1) % 4;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        const R = 6;
        const x = this.p.x;
        const y = this.p.y;

        const w = 12, h = 4;
        ctx.save();
        ctx.translate(x, y + R + 2);
        ctx.scale(1, 0.6);
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, w);
        grd.addColorStop(0, 'rgba(0,0,0,0.25)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        const angle = this.angle * (Math.PI / 2); // 4 frames → quarter rotations
        const hx = Math.cos(angle) * 2.5;
        const hy = Math.sin(angle) * 2.5;

        const g = ctx.createRadialGradient(
            x + hx,
            y + hy,
            0,
            x,
            y,
            R
        );
        g.addColorStop(0.0, '#ffffff');
        g.addColorStop(0.25, '#c67575ff');
        g.addColorStop(0.55, '#781f1fff');
        g.addColorStop(1.0, '#bd2020ff');

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, R, 0, Math.PI * 2);
        ctx.fill();

        // sparkle rotates around too
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath();
        ctx.arc(x + hx, y + hy, 1, 0, Math.PI * 2);
        ctx.fill();
    }
}