import type { Card } from './card';
import { changeStance, move } from './cardEffects';
import { handleEffectsSequentially } from './utils';

export const CARD_LIBRARY: Card[] = [
  {
    text: [
      'Roll 1 space right',
      'Roll 2 spaces right',
      'Roll 3 spaces right',
      'Roll 5 spaces right',
    ],
    effect: [() => move(1), () => move(2), () => move(3), () => move(5)],
    cost: [1, 1, 1, 2],
    caloriesBurned: [1, 2, 3, 5],
  },
  // 1
  {
    text: [
      'Roll 1 space left',
      'Roll 2 spaces left',
      'Roll 3 spaces left',
      'Roll 5 spaces left',
    ],
    effect: [
      () => move(1, 'left'),
      () => move(2, 'left'),
      () => move(3, 'left'),
      () => move(5, 'left'),
    ],
    cost: [1, 1, 1, 2],
    caloriesBurned: [1, 2, 3, 5],
  },
  // 2
  {
    text: ['Roll 1 space right, then 1 space left'],
    cost: [2],
    caloriesBurned: [2],
    effect: [
      () => {
        handleEffectsSequentially([() => move(1), () => move(1, 'left')]);
      },
    ],
  },
  // 3
  {
    text: [
      'Roll back and forth 1 space',
      'Roll back and forth 2 spaces',
      'Roll back and forth 3 spaces',
    ],
    cost: [2, 3, 4],
    caloriesBurned: [3, 6, 9],
    effect: [
      () => {
        handleEffectsSequentially([
          () => move(1),
          () => move(2, 'left'),
          () => move(1),
        ]);
      },
      () => {
        handleEffectsSequentially([
          () => move(2),
          () => move(4, 'left'),
          () => move(2),
        ]);
      },
      () => {
        handleEffectsSequentially([
          () => move(3),
          () => move(5, 'left'),
          () => move(3),
        ]);
      },
    ],
  },
  // 4
  {
    text: ['Roll 1 space right, then defensive nap position'],
    cost: [2],
    caloriesBurned: [1],
    effect: [
      () => {
        handleEffectsSequentially([() => move(1), () => changeStance('nap')]);
      },
    ],
  },
  //5
  {
    text: [
      'Roll 1 space right, then longcat position',
      'Roll 2 spaces right, then longcat position',
    ],
    cost: [2, 2],
    caloriesBurned: [1, 2],
    effect: [
      () => {
        handleEffectsSequentially([
          () => move(1),
          () => changeStance('longcat'),
        ]);
      },
      () => {
        handleEffectsSequentially([
          () => move(2),
          () => changeStance('longcat'),
        ]);
      },
    ],
  },
  // 6
  {
    text: [
      'Roll 1 space right, then standard position',
      'Roll 2 spaces right, then standard position',
      'Roll 3 spaces right, then standard position',
    ],
    cost: [2, 2, 2],
    caloriesBurned: [1, 2, 3],
    effect: [
      () => {
        handleEffectsSequentially([
          () => move(1),
          () => changeStance('standard'),
        ]);
      },
      () => {
        handleEffectsSequentially([
          () => move(2),
          () => changeStance('standard'),
        ]);
      },
      () => {
        handleEffectsSequentially([
          () => move(3),
          () => changeStance('standard'),
        ]);
      },
    ],
  },
  // 7
  {
    text: ['Roll 1 space left, then defensive nap position'],
    cost: [2],
    caloriesBurned: [1],
    effect: [
      () => {
        handleEffectsSequentially([
          () => move(1, 'left'),
          () => changeStance('nap'),
        ]);
      },
    ],
  },
  // 8
  {
    text: [
      'Roll 1 space left, then longcat position',
      'Roll 2 spaces left, then longcat position',
    ],
    cost: [2, 2],
    caloriesBurned: [1, 2],
    effect: [
      () => {
        handleEffectsSequentially([
          () => move(1, 'left'),
          () => changeStance('longcat'),
        ]);
      },
      () => {
        handleEffectsSequentially([
          () => move(2, 'left'),
          () => changeStance('longcat'),
        ]);
      },
    ],
  },
  // 9
  {
    text: [
      'Roll 1 space left, then standard position',
      'Roll 2 spaces left, then standard position',
      'Roll 3 spaces left, then standard position',
    ],
    cost: [2, 2, 2],
    caloriesBurned: [1, 2, 3],
    effect: [
      () => {
        handleEffectsSequentially([
          () => move(1, 'left'),
          () => changeStance('standard'),
        ]);
      },
      () => {
        handleEffectsSequentially([
          () => move(2, 'left'),
          () => changeStance('standard'),
        ]);
      },
      () => {
        handleEffectsSequentially([
          () => move(3, 'left'),
          () => changeStance('standard'),
        ]);
      },
    ],
  },
  // 10
  {
    text: ['Longcat, then roll 1 space right, then nap'],
    caloriesBurned: [1],
    cost: [2],
    effect: [
      () => {
        handleEffectsSequentially([
          () => changeStance('longcat'),
          () => move(1),
          () => changeStance('nap'),
        ]);
      },
    ],
  },
  // 11
  {
    text: ['Longcat, then roll 1 space left, then nap'],
    caloriesBurned: [1],
    cost: [2],
    effect: [
      () => {
        handleEffectsSequentially([
          () => changeStance('longcat'),
          () => move(1, 'left'),
          () => changeStance('nap'),
        ]);
      },
    ],
  },
];
