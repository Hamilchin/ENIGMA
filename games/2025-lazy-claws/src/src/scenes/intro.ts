import { H, W, B, HH, R, HW, drawSkip, animate } from "../common";
import type { Game } from "../Game";
import { Scene } from "../Scene";

export const getScene0 = (game: Game) => {
    const fn = animate([
        'They say black cat brings bad luck',
        'But today the black cat is unlucky',
        'Fulfill your cat duties or face consequences!',
    ], 24, 50);

    let t = -1;

    const scene = new Scene((ctx) => {
        const { lines, done } = fn();

        if (done && t === -1) {
            t = setTimeout(() => {
                if (game.order === 0) {
                    game.nextScene();
                }
            }, 3000);
        }

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, W, H);

        const o = 120;

        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(HW - B * 3, HH - B + o, B, B);
        ctx.strokeRect(HW - B * 3, HH + R + o, B, B);
        ctx.strokeRect(HW - B * 2 + R, HH + R + o, B, B);
        ctx.strokeRect(HW - B * 4 - R, HH + R + o, B, B);

        ctx.fillStyle = '#fff';
        ctx.textBaseline = 'top';
        ctx.textAlign = 'center';
        ctx.font = '14px monospace';

        ctx.fillText('W', HW - B * 3 + R * 2, HH - R * 3 + o);
        ctx.fillText('S', HW - B * 3 + R * 2, HH + R * 2 + o);
        ctx.fillText('A', HW - B * 4 + R, HH + R * 2 + o);
        ctx.fillText('D', HW - B * 2 + R * 3, HH + R * 2 + o);

        ctx.strokeRect(HW + 50, HH - 50 + o, 30, 50);
        ctx.strokeRect(HW + 50 + 30, HH - 50 + o, 30, 50);
        ctx.strokeRect(HW + 50, HH - 50 + o, 60, 125);

        ctx.fillText('Attack', HW + 40, HH - 75 + o);
        ctx.fillText('Throw', HW + 120, HH - 75 + o);


        ctx.fillStyle = '#fff';
        ctx.textBaseline = 'top';
        ctx.textAlign = 'center';
        ctx.font = '24px monospace';

        let offsetY = 0;

        for (const line of lines) {
            ctx.fillText(line, HW, HH - B * 4 + offsetY);
            offsetY += B;
        }

        drawSkip(ctx);
    }, false);

    return scene;
}