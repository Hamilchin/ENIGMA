import { H, W, B, HH, HW, animate } from "../common";
import type { Game } from "../Game";
import { O2D } from "../Object2D";
import { Scene } from "../Scene";
import { Vec } from "../Vector";

export const getGameOverScene = (game: Game) => {
    const fn = animate([
        'You failed to fulfill your duties'
    ], 24);

    const scene = new Scene((ctx) => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, W, H);

        if (p2) {
            cs = Math.max(0, cs - 2);
        } else {
            cs = Math.min(200, Math.max(5, cs + 2));
        }

        if (cs === 0) {
            p3 = true;
        }

        ctx.fillStyle = '#540d0d';
        ctx.beginPath();
        ctx.ellipse(HW, HH, cs, cs, Math.PI / 4, 0, 360);
        ctx.fill('evenodd');
        ctx.closePath();

        if (granny.position.x > HW) {
            granny.position = granny.position.add(new Vec(-1, 0));
        } else {
            granny.sprite.play('idle');
            if (!p1) {
                p1 = true;
                game.sound.playEffect('jump');
            }
        }

        if (p1) {
            cat.position = cat.position.add(new Vec(-1, -0.5).scale(5));
        }

        if (cat.position.x < 100) {
            p2 = true;
        }

        if (cs > 40) {
            granny.update(16);
            granny.draw(ctx);
        }

        if (p3) {
            const { lines } = fn();

            ctx.fillStyle = '#861d1d';
            ctx.textBaseline = 'top';
            ctx.textAlign = 'center';
            ctx.font = '24px monospace';

            let offsetY = 0;

            for (const line of lines) {
                ctx.fillText(line, HW, HH - B + offsetY);
                offsetY += B;
            }

            ctx.fill();
        }

        cat.update(16);
        cat.draw(ctx);
    }, false);


    let cs = 5;
    let p1 = false;
    let p2 = false;
    let p3 = false;

    const granny = new O2D([W - 250, HH], 3, game.sprites['granny'], 'run');
    const cat = new O2D([HW - 50, HH], 4, game.sprites['cat'], 'idle');

    scene.objects2D = [granny, cat];

    return scene;
}