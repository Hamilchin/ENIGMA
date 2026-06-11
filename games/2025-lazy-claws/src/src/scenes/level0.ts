import type { Game } from "../Game";
import { Projectile } from "../Projectile";
import { Rat } from "../Rat";
import { Vec } from "../Vector";
import { assignFurniture } from "./common";
import { createLevel } from "./createLevel";

export const getLevel0 = (game: Game) => createLevel(game, 90000, (scene) => {
    assignFurniture(scene, game, 0);

    scene.projectiles = [
        new Projectile(new Vec(56, 516), new Vec(0, 0), game, 0),
    ];

    scene.rats = [
        new Rat([340, 340], game, 2.5),
        new Rat([340, 340], game, 2.1),
        new Rat([80, 280], game, 2.6),
        new Rat([80, 280], game, 2.8),
        new Rat([700, 500], game, 2.4),
        new Rat([700, 500], game, 2.2),
    ];

    const player = game.player;

    if (player) {
        player.balls = 1;
    }

    return scene;
});