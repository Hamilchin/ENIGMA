import { Character } from "./Character";
import type { Game } from "./Game";
import { Projectile } from "./Projectile";
import { Sprite } from "./Sprite";
import { Vec } from "./Vector";

export class Player {
    c: Character;
    sprite: Sprite;
    game: Game;
    balls: number = 0;
    isAttacking: boolean = false;

    constructor(p: Vec, game: Game) {
        this.game = game;
        this.c = new Character(p, 16, 16, 2.5, 100, game);
        this.sprite = this.game.sprites['cat'];
    }

    init() {
        this.game.emitter.on('mouseDownLeft', this.attack);
        this.game.emitter.on('mouseDownRight', this.throw);
    }

    dispose() {
        this.game.emitter.off('mouseDownLeft', this.attack);
        this.game.emitter.off('mouseDownRight', this.throw);
    }

    attack = () => {
        if (!this.isAttacking) {
            this.sprite.play('attack');
            this.game.sound.playEffect('hit');
            this.isAttacking = true;

            const rats = this.game.scene?.rats ?? [];

            for (const rat of rats) {
                if (this.c.p.dist(rat.c.p) < 30) {
                    rat.c.hp -= 25;
                }
            }
        }
    }

    throw = () => {
        const scene = this.game.scene;

        if (!scene) {
            return;
        }

        if (this.balls === 0) {
            return;
        }

        this.balls -= 1;
        this.game.sound.playEffect('shoot');

        const y = this.game.control.y;
        const x = this.game.control.x;

        const dir = new Vec(x, y).sub(this.c.p).norm();

        scene.projectiles.push(new Projectile(this.c.p, dir, this.game))
    }

    update(delta: number) {
        this.updateDirection();
        this.updateCharacter(delta);

        this.c.update(true);
    }

    private updateDirection() {
        const control = this.game.control;

        let d = new Vec(0, 0);

        if (control.state.get('KeyW')) {
            d = d.add(new Vec(0, -1));
        }

        if (control.state.get('KeyS')) {
            d = d.add(new Vec(0, 1));
        }

        if (control.state.get('KeyA')) {
            d = d.add(new Vec(-1, 0));
        }

        if (control.state.get('KeyD')) {
            d = d.add(new Vec(1, 0));
        }

        this.c.dir = d.norm();
    }

    private updateCharacter(delta: number) {
        const scene = this.game.scene;

        if (!scene) {
            return;
        }

        let nextFrame = 'idle';

        if (this.isAttacking) {
            if (this.sprite.frame.finished) {
                this.isAttacking = false;
                nextFrame = this.c.dir.empty() ? 'idle' : 'run';
            } else {
                nextFrame = 'attack';
            }
        } else {
            nextFrame = this.c.dir.empty() ? 'idle' : 'run';
        }

        this.sprite.play(nextFrame);

        if (this.c.dir.x < 0) {
            this.sprite.hi = true;
        } else if (this.c.dir.x > 0) {
            this.sprite.hi = false;
        }

        for (let i = 0; i < scene.projectiles.length; i++) {
            const p = scene.projectiles[i];
            const distance = p.p.dist(this.c.p);

            if (distance <= (Math.max(this.c.w * 2, this.c.h * 2)) && p.speed < 3) {
                scene.projectiles.splice(i, 1);
                i -= 1;
                this.game.sound.playEffect('pickup');
                this.balls += 1;
            }
        }

        this.sprite.update(delta);
    }

    draw(context: CanvasRenderingContext2D) {
        const position = this.c.p;

        this.sprite.draw(context, position.x, position.y, this.sprite.frame.w * 4, this.sprite.frame.h * 4);

        if (this.game.scene?._debug) {
            context.fillStyle = 'red';

            context.beginPath();
            context.ellipse(position.x, position.y, 3, 3, Math.PI / 4, 0, 360);
            context.fill();
            context.closePath();
        }
    }
}