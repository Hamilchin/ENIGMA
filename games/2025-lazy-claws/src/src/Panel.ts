import type { Game } from "./Game";
import { Projectile } from "./Projectile";
import { Vec } from "./Vector";

export class Panel {
    game: Game;
    ball: Projectile;

    constructor(game: Game) {
        this.game = game;
        this.ball = new Projectile(new Vec(734, 46), new Vec(0, 0), game, 0);
    }

    draw(ctx: CanvasRenderingContext2D) {
        const seconds = (this.game.scene.timeLeft / 1000).toFixed(2);

        ctx.beginPath();

        ctx.fillStyle = '#000000';
        ctx.fillRect(700, 0, 60, 60);

        ctx.font = '16px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${seconds}s`, 730, 16);

        this.ball.draw(ctx);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${this.game.player?.balls ?? 0}`, 754, 40);

        ctx.closePath();
    }
}