import { Character } from "./Character";
import { Sprite } from "./Sprite";
import { Vec } from "./Vector";
import {Random} from "./Random";
import type { Game } from "./Game";

export class Rat {
    game: Game;
    c: Character;
    c1: number = 0;
    c2: number = 0;
    sprite: Sprite;
    random = Random.get();

    state: 'run' | 'caught' = 'run';

    constructor(p: [number, number], game: Game, speed: number = 2.8) {
        this.game = game;
        this.c = new Character(new Vec(p[0], p[1]), 10, 10, speed, 100, game);

        this.sprite = new Sprite(game.resources['sprite'], {
            run: [8, 34, 16, 10, 10, 16, 200, false],
            death: [8, 50, 16, 10, 10, 16, 100, true]
        });

        this.c.dir = Vec.random(this.random);
        this.state = 'run';
        this.sprite.play('run');
    }

    update(delta: number) {
        const scene = this.game.scene;
        const player = this.game.player;

        if (!scene || !player) {
            return;
        }

        const prevPosition = this.c.p.clone();

        this.c1 += 1;

        if (this.c1 === 150) {
            if (this.c.p.dist(player.c.p) < 100) {
                this.c.dir = player.c.p.sub(this.c.p).norm().negate();          
            } else if (this.random.next() < 0.5) {
                this.c.dir = Vec.random(this.random);
            }

            this.c1 = 0;
        }

        if (this.state === 'caught') {
            this.c2 += 1;
        }

        if (this.c2 === 250) {
            this.state = 'run';
            this.sprite.play('run');
            this.c2 = 0;
        }

        if (this.state === 'run') {
            this.c.update();

            while (this.c.p.equal(prevPosition)) {
                this.c.dir = Vec.random(this.random);
                this.c.update();
            }

            for (const projectile of scene.projectiles) {
                const distance = projectile.p.dist(this.c.p);

                if (this.state === 'run' && distance <= 16 && projectile.speed > 2) {
                    this.state = 'caught';
                    this.sprite.play('death');
                    this.game.sound.playEffect('stun');
                    this.c.hp -= 10;
                    break;
                }
            }
        }

        if (this.c.dir.x < 0) {
            this.sprite.hi = false;
        } else if (this.c.dir.x > 0) {
            this.sprite.hi = true;
        }

        this.sprite.update(delta);
    }

    draw(context: CanvasRenderingContext2D) {
        const x = this.c.p.x;
        const y = this.c.p.y;
        this.sprite.draw(context, x, y, 16 * 2, 10 * 2);

        context.beginPath();
        context.fillStyle = 'red';
        context.rect(x - 10, y - 24, 32, 4);
        context.fill();
        context.closePath();
        context.beginPath();
        context.fillStyle = 'green';
        context.rect(x - 10, y - 24, 32 * (this.c.hp / 100), 4);
        context.fill();
        context.closePath();

        if (this.game.scene?._debug) {
            context.fillStyle = 'red';

            context.beginPath();
            context.ellipse(this.c.p.x, this.c.p.y, 3, 3, Math.PI / 4, 0, 360);
            context.fill();
            context.closePath();
        }
    }
}