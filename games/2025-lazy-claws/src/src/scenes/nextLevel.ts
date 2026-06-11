import { H, W, B, HH, HW, animate, drawSkip } from "../common";
import type { Game } from "../Game";
import { Scene } from "../Scene";

export const getNextLevel = (game: Game, order: number, level: number) => {
    const fn = animate([
        `level ${level}`,
    ], 24);

    let t = -1;

    const scene = new Scene((ctx) => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, W, H);

        const { lines, done } = fn();

        if (done && t === -1) {
            t = setTimeout(() => {
                if (game.order === order) {
                    game.nextScene();
                }
            }, 1000);
        }

        ctx.fillStyle = '#fff';
        ctx.textBaseline = 'top';
        ctx.textAlign = 'center';
        ctx.font = '24px monospace';
        
        ctx.fillText(lines[0], HW, HH - B);

        drawSkip(ctx);
    }, false);

    return scene;
}