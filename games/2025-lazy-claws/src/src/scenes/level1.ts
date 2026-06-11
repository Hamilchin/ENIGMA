import type { Game } from "../Game";
import { Projectile } from "../Projectile";
import { Rat } from "../Rat";
import { Vec } from "../Vector";
import { assignFurniture } from "./common";
import { createLevel } from "./createLevel";

export const getLevel1 = (game: Game) => createLevel(game, 75000, (scene) => {
    assignFurniture(scene, game, 1);

    scene.projectiles = [
        new Projectile(new Vec(56, 516), new Vec(0, 0), game, 0),
        new Projectile(new Vec(700, 290), new Vec(0, 0), game, 0),
        new Projectile(new Vec(680, 480), new Vec(0, 0), game, 0),
    ];

    scene.rats = [
        new Rat([340, 340], game, 2.5),
        new Rat([340, 340], game, 2.9),
        new Rat([340, 340], game, 3.1),
        new Rat([80, 280], game, 2.6),
        new Rat([80, 280], game, 2.4),
        new Rat([80, 280], game, 2.8),
        new Rat([700, 400], game, 2.1),
        new Rat([700, 400], game, 2.6),
    ];

    const player = game.player;

    if (player) {
        player.c.p = new Vec(384, 288);
        player.balls = 0;
    }

    return scene;
});