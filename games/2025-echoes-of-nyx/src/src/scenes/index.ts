import { getGridRealWidth, getSquareSize, gridWidth } from '../config';
import Game from '../Game';
import { scene as endScene } from './endScenes';
import { gameScene } from './gameScene';
import { getLevelScene } from './levelScene';
import { pauseScene } from './pauseScene';
import { getStartScene } from './startScene';
import { getTransitionScene, moveCat } from './transitionScene';

export const startSym = Symbol('start');
export const startLoreSym = Symbol('loreStart');
export const gameSym = Symbol('game');
export const pauseSym = Symbol('pause');
export const endSym = Symbol('end');
export const levelSym = Symbol('level');
export const world1TransitionSym = Symbol('world1Transition');
export const world2TransitionSym = Symbol('world2Transition');
export const world3TransitionSym = Symbol('world3Transition');
export const world3Part2TransitionSym = Symbol('world3Part2Transition');

const startLore = `At first, there was Chaos, a primordial and pure being.
Then came Nyx, goddess of the night, and Erebus, god of darkness.
Nyx was close to her brother, but their bond evolved beyond mere kinship.
Ashamed of her actions, Nyx disguised herself as a cat and left Hell
to ponder her choices.`;

const world1TransitionText = `In her feline disguise, she navigated through the shadows of the night.
But as she moved farther from her home, the sun began to rise.
The light was relentless, its rays a tangible, physical weight.
She was hungry and needed food to recover from the pain.
Yet for some obscure reason, she kept going, drawn toward the light.`;

const world2TransitionText = `As the light filled the sky, Nyx saw a flicker of movement.
Beyond the brightness, hidden in a mirror dimension,
a small white cat was peeking directly at her. Its presence felt magnetic.
Nyx pierced through the mirror to reach the little cat,
but at the sight of her, the white cat ran away.`;

const world3TransitionText = `As she pushed forward to catch up,
the little ball of fur stopped and looked right at her.
As she approached, its gaze pierced through her soul.
The white cat began to shine brighter and brighter, but Nyx remained unfazed.
And then it clicked, the white cat before her was her own daughter.
She had just created Aether, the personification of light itself.`;

const world3Part2TransitionText = `Nyx and her newborn daughter returned to their ethereal forms
and left the mirror dimension to travel back to the Atlas.
There, Erebus was waiting for them and welcomed his daughter.
They both looked at Aether and thought the same thing:
She had just been born, and yet, she had come to restore equilibrium.`;

export const getScenesList = () => ({
  [startSym]: getStartScene(),
  [gameSym]: gameScene,
  [pauseSym]: pauseScene,
  [endSym]: endScene,
  [levelSym]: getLevelScene(),
  [startLoreSym]: getTransitionScene(
    startLore,
    'Leave',
    async () => {
      Game.instance.started = true;
      Game.instance.loadScene(gameSym);
    },
    async (player, aether, ground) => {
      ground.y = -1;
    },
  ),
  [world1TransitionSym]: getTransitionScene(world1TransitionText),
  [world2TransitionSym]: getTransitionScene(world2TransitionText),
  [world3TransitionSym]: getTransitionScene(
    world3TransitionText,
    'Continue',
    async (player, aether) => {
      aether.isLeft = false;
      await moveCat(player, (gridWidth / 2 + 4) * getSquareSize());
      await Promise.all([
        moveCat(player, getGridRealWidth() + player.width),
        moveCat(aether, getGridRealWidth() + aether.width),
      ]);
      Game.instance.loadScene(world3Part2TransitionSym);
    },
    async (player, aether) => {
      aether.x = gridWidth / 2 + 2;
      aether.isLeft = true;
      await moveCat(player, getGridRealWidth() / 2 - player.width / 2);
    },
  ),
  [world3Part2TransitionSym]: getTransitionScene(
    world3Part2TransitionText,
    'Continue',
    async (player, aether) => {
      await Promise.all([
        moveCat(player, getGridRealWidth() + player.width),
        moveCat(aether, getGridRealWidth() + aether.width),
      ]);
      Game.instance.loadScene(endSym);
      Game.instance.reset();
    },
    async (player, aether) => {
      aether.isLeft = false;
      aether.x = -4;
      await Promise.all([
        moveCat(player, getGridRealWidth() / 2 - player.width / 2),
        moveCat(aether, getGridRealWidth() / 2 - player.width - aether.width / 2),
      ]);
    },
  ),
});
