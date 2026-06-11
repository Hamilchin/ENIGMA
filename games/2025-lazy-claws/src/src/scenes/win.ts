import { H, W, B, HH, HW, animate } from "../common";
import type { Game } from "../Game";
import { O2D } from "../Object2D";
import { Scene } from "../Scene";

export const getGameWinScene = (game: Game) => {
    const fn = animate([
        'You did it!',
        `You finished your duties in ${(game.spentTime / 1000).toFixed(2)} seconds!`
    ], 24);

    let cs = 5;

    const scene = new Scene((ctx) => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, W, H);

        const { lines } = fn();

        cs = Math.min(200, Math.max(5, cs + 2));

        ctx.fillStyle = '#540d0d';
        ctx.beginPath();
        ctx.ellipse(HW, HH, cs, cs, Math.PI / 4, 0, 360);
        ctx.fill('evenodd');
        ctx.closePath();
        
        ctx.fillStyle = '#000000ff';
        ctx.textBaseline = 'top';
        ctx.textAlign = 'center';
        ctx.font = '24px monospace';

        let offsetY = 0;

        for (const line of lines) {
            ctx.fillText(line, HW, HH - B * 2 + offsetY);
            offsetY += B;
        }

        cat.update(16);
        cat.draw(ctx);
    }, false);

    const cat = new O2D([HW, HH + 100], 10, game.sprites['cat'], 'idle');

    scene.objects2D = [cat];

    return scene;
}