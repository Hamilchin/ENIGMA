import { drawEngine } from "./draw-engine";
import { Engine } from "./engine";
import { Vector2 } from "./vector";

export class ParticleSystem {
    public particles: Particle[];
    public context: CanvasRenderingContext2D;
    private particlePoolSize: number;

    public isBurst: boolean = false;
    private delta: number = 0;
    private startTime: number = 0;

    constructor(particlePoolSize: number = 200) {
        this.particles = [];
        this.context = drawEngine.context;
        this.particlePoolSize = particlePoolSize;
    }

    private createParticle(
        x: number,
        y: number,
        velocityX: number,
        velocityY: number,
        size: number,
        lifeSpan: number,
        color: string
    ) {
        if (this.particles.length >= this.particlePoolSize) {
            this.particles.shift(); // Remove oldest particle
        }
        this.particles.push(new Particle(new Vector2(x, y), new Vector2(velocityX, velocityY), size, lifeSpan, color));
    }

    emit(position: Vector2, count: number, color: string, direction: number = 0) {
        let xMin = -1, xMax = 1;
        if (direction === -1) xMax = 0;
        else if (direction === 1) xMin = 0;

        for (let i = 0; i < count; i++) {
            const vx = Engine.clamp((Math.random() - 0.5) * 2, xMin, xMax);
            const vy = Engine.clamp((Math.random() - 0.5) * 2, -1, 1);
            const size = Engine.clamp(Math.random() * 2 + 1, 0, 2);
            const life = Math.random() * 500;
            this.createParticle(position.x, position.y, vx, vy, size, life, color);
        }
    }

    burst(position: Vector2, count: number, color: string, direction: number = 0) {
        if (!this.isBurst) {
            this.startTime += this.delta;
            this.isBurst = true;
            this.emit(position, count, color, direction);
        }
    }

    resetBurst() {
        this.isBurst = false;
        this.startTime = 0;
    }

    updateAndDraw(delta: number) {
        this.delta = delta;

        this.particles = this.particles.filter(p => p.isAlive());
        this.particles.forEach(p => {
            p.update(delta);
            p.draw(this.context);
        });
    }
}

class Particle {
    public position: Vector2;
    private velocity: Vector2;
    private size: number;
    private lifeSpan: number;
    private age: number;
    private color: string;

    constructor(position: Vector2, velocity: Vector2, size: number, lifeSpan: number, color: string) {
        this.position = position;
        this.velocity = velocity;
        this.size = size;
        this.lifeSpan = lifeSpan;
        this.age = 0;
        this.color = color;
    }

    update(delta: number) {
        this.position.x += this.velocity.x * delta * 0.03;
        this.position.y += this.velocity.y * delta * 0.05;
        this.age += delta;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.size, this.size);
    }

    isAlive() {
        return this.age < this.lifeSpan;
    }
}
