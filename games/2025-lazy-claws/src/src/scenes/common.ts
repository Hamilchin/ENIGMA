import  { B, R, H, W, HH, HW } from "../common";
import type { Game } from "../Game";
import  { O2D } from "../Object2D";
import type { Scene } from "../Scene";

export const assignFurniture = (scene: Scene, game: Game, level: number) => {
    const hb = false;

    const sprite = game.sprites['furniture'];

    scene.objects2D = [
        new O2D([B * 4 , B * 3 + R * 2], 5, sprite, 'kitchen', { hb }),
        new O2D([B * 8 + R, B * 5 - R], 5, sprite, 'wash', { hb }),
        new O2D([B * 11 - R * 2 + R / 2, B * 3 + R * 2], 5, sprite, 'fridge', { hb }),
        new O2D([B * 6, B * 10], 4, sprite, 'table'),
        new O2D([B * 3, level === 2 ? H - B * 2 : H - B * 3 - R], 4, sprite, 'plant'),
        new O2D([W - B * 6, HH - B * 3 - R * 2], 4, sprite, 'window', { hb }),
        new O2D([W - B * 4, HH - B * 3 - R * 2], 4, sprite, 'window', { hb }),
        new O2D([B * 5 + R, B * 11], 4, sprite, 'chair2'),
        new O2D([B * 6 + R * 3, B * 11], 4, sprite, 'chair2'),
        new O2D([W - B * 10, HH - B * 3], 4, sprite, 'door', { hb }),
        new O2D([W - B * 5, HH + R], 4, sprite, 'table'),
        new O2D([W - B * 5, HH - R], 4, sprite, 'tv', { hb }),
        new O2D([W - B * 5 - R * 3, HH + B * 5], 4, sprite, 'chair', {hb}),
        new O2D([W - B * 5 + R * 3, HH + B * 5], 4, sprite, 'chair', {hb}),
        new O2D([HW, level === 0 ? H - B * 4 + R * 2 : H - B * 3], 4, sprite, 'stable'),
    ];

    if (level > 0) {
        scene.objects2D.push(
            new O2D([HW, H - B * 3 - R], 2, sprite, 'lamp', {hb}),
            new O2D([W - B * 2 + R, H - B * 2], 2, sprite, 'plant2', {hb: true}),
        );
    }
}