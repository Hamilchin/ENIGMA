import { Entity } from "../Entity";
import type { Game } from "../Game";
import { Scene } from "../Scene";
import { Vec } from "../Vector";
import { W, H, HW, B, R, HH } from '../common';

export const createLevel = (_game: Game, time: number, extra: (scene: Scene) => void) => {
    const scene = new Scene((ctx) => {
        // clear
        ctx.fillStyle = '#b0b897';
        ctx.fillRect(B, B * 6, W - B * 2, H - B * 7);

        // borders
        ctx.fillStyle = '#545046';
        ctx.beginPath();
        ctx.rect(0, 0, B, H);
        ctx.rect(0, 0, HW, B);
        ctx.rect(HW, 0, B, B * 2);
        ctx.rect(0, H - B, W, H);
        ctx.rect(HW, B * 2, HW, B);
        ctx.rect(W - B, B * 2, B, H - B * 2);
        ctx.fill();
        ctx.closePath();
        // kitchen wall
        ctx.beginPath();
        ctx.fillStyle = '#6e6244';
        ctx.rect(B, B, HW - B, B * 5);
        ctx.fill();
        ctx.closePath();
        // wall
        ctx.beginPath();
        ctx.fillStyle = '#445216';
        ctx.rect(HW, B * 3, HW - B, HH - B * 4);
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.fillStyle = '#a6b379';
        for (let i = 0; i < 22; i++) {
            ctx.rect(HW + i * B / 2, B * 3, R, 164);
        }
        ctx.fill();
        ctx.closePath();
        // floor
        ctx.beginPath();
        ctx.fillStyle = '#ffffff';
        ctx.rect(B, HH - B * 3, HW - B, R);
        ctx.rect(B, HH - B * 3, R, HH + B * 2);
        ctx.rect(B, H - B - R, W - B * 2, R);
        ctx.rect(HW - R, HH - B * 3, R, B * 2 + R);
        ctx.rect(HW - R, HH - B, HW - B, R);
        ctx.rect(W - B - R, HH - B, R, HH);
        ctx.fill();
        ctx.closePath();
    }, true, time);

    scene.entities = [
        Entity.polygon(new Vec(384, 360), [
            [-344, -160],
            [-8, -160],
            [-8, -96],
            [344, -96],
            [344, 176],
            [-344, 176]
        ], 'red'),
        Entity.polygon(new Vec(608, 448), [
            [-50, -25],
            [50, -25],
            [50, 25],
            [-50, 25]
        ], 'red')
    ];

    extra(scene);

    return scene;
}