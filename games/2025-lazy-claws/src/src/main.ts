import { Game } from "./Game";
import { Resource } from "./Resource";
import { Sprite } from "./Sprite";

const node = document.getElementById('app') as HTMLCanvasElement;

if (!node) {
  throw new Error();
}

const game = new Game(node);
const sprite = new Resource('public/s.png');

game.resources = {
  sprite,
};

game.sprites = {
  furniture: new Sprite(sprite, {
    fridge: [103, 0, 15, 32],
    wash: [216, 0, 16, 16],
    kitchen: [0, 61, 39, 32],
    table: [55, 61, 32, 16],
    plant: [180, 0, 8, 12],
    plant2: [264, 0, 8, 14],
    window: [188, 0, 16, 32],
    chair: [64, 0, 13, 13],
    chair2: [77, 0, 10, 15],
    door: [87, 0, 16, 32],
    tv: [232, 0, 32, 16],
    stable: [39, 61, 16, 15],
    lamp: [203, 0, 12, 16],
  }),
  cat: new Sprite(sprite, {
    idle: [2, 0, 10, 6, 4, 6, 250, false],
    run: [2, 6, 10, 7, 4, 6, 200, false],
    attack: [2, 13, 12, 7, 4, 4, 100, true],
  }),
  granny: new Sprite(sprite, {
    idle: [118, 0, 14, 15, 1, 2, 250, false],
    run: [118, 0, 14, 15, 4, 2, 200, false],
  }),
};

game
  .load()
  .then(() => game.init())
  .then(() => game.renderer.start());