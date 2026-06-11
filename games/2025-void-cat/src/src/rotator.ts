import { signifyNotEnoughEnergy, type Card } from './card';
import type { Direction } from './cardEffects';
import { CAT_OF_TRUTH, getOccupiedTileCoordinates } from './cat';
import { updateEnergyAndCalMetersAfterPlayingCard } from './meterUtils';
import { DOM_CAT } from './main';
import { STAGES } from './stage';
import { absorbThing } from './thingUtils';
import { GAME_STATE_OF_TRUTH } from './gameState';
import { playCannot, playSmallSound } from './sounds';

export function initRotator() {
  const buttonLeft = document.querySelector('.arrow.left');
  const buttonRight = document.querySelector('.arrow.right');

  buttonLeft?.removeEventListener('click', handleClockwiseRotation);
  buttonRight?.removeEventListener('click', handleCounterClockwiseRotation);

  buttonLeft?.addEventListener('click', handleClockwiseRotation);
  buttonRight?.addEventListener('click', handleCounterClockwiseRotation);
}

export const ORDER_OF_DIRECTIONS: Direction[] = [
  'top', // Feet facing 6 o'clock
  'left', // Feet facing 3 o'clock
  'bottom', //  Feet facing 12 o'clock
  'right', //   Feet facing 9 o'clock
];

/** This is the translate offset we need for each direction */
const DIRECTION_OFFSETS: Record<
  Direction,
  { x: number; y: number; angle: number }
> = {
  top: { x: 0, y: 0, angle: 0 },
  left: { x: -55, y: -55, angle: 270 },
  bottom: { x: 0, y: -110, angle: 180 },
  right: { x: 55, y: -55, angle: 90 },
};

type RotationDirection = 'clockwise' | 'counterClockwise';

/**
 * Loops through the ORDER_OF_DIRECTIONS const per click;
 * the order is: 'top' / 'left' / 'bottom' / 'right'
 * @param currentDirection headFacing of the cat
 * @param rotationDirection 'clockwise' or 'counterClockwise', depending on which button pressed
 * @returns index of ORDER_OF_DIRECTIONS
 */
export function getRotatedDirection(
  currentDirection: Direction,
  rotationDirection: RotationDirection
) {
  const currentIndex = ORDER_OF_DIRECTIONS.indexOf(currentDirection);
  /**  */
  if (rotationDirection === 'counterClockwise') {
    return currentIndex === 3
      ? ORDER_OF_DIRECTIONS[0]
      : ORDER_OF_DIRECTIONS[currentIndex + 1];
  } else {
    return currentIndex === 0
      ? ORDER_OF_DIRECTIONS[3]
      : ORDER_OF_DIRECTIONS[currentIndex - 1];
  }
}

/**
 * This rotates the DOM_CAT on the screen,
 * and updates the CAT_OF_TRUTH's headFacing param.
 * @param rotationDirection 'clockwise' or 'counterClockwise', depending on which button pressed
 */
export function rotate(rotationDirection: RotationDirection) {
  if (
    willRotationBeOutOfBounds(
      CAT_OF_TRUTH.headX,
      CAT_OF_TRUTH.headY,
      CAT_OF_TRUTH.headFacing,
      rotationDirection,
      CAT_OF_TRUTH.length,
      STAGES[GAME_STATE_OF_TRUTH.currentStage].gridSize
    )
  ) {
    return playCannot();
  }

  const energy = GAME_STATE_OF_TRUTH.energyCurrent;

  if (energy === 0 || (CAT_OF_TRUTH.stance === 'nap' && energy <= 1)) {
    return signifyNotEnoughEnergy();
  }

  /* Determine what the next direction is */
  const newDirection = getRotatedDirection(
    CAT_OF_TRUTH.headFacing,
    rotationDirection
  );

  /* Get new translate offsets and angle */
  const { x, y, angle } = DIRECTION_OFFSETS[newDirection];

  /* Update state before visible DOM changes */
  CAT_OF_TRUTH.headFacing = newDirection;

  /* Also update energy game state */
  /* Create fake card to satisfy type. Yes this is dumb */
  const fakeCard: Card = {
    text: [],
    effect: [],
    cost: [1],
    caloriesBurned: [0],
  };
  updateEnergyAndCalMetersAfterPlayingCard(fakeCard);

  /* Update DOM */
  DOM_CAT.style.transform = `rotate(${angle}deg) translate(${x}px, ${y}px)`;
  DOM_CAT.style.transformOrigin = 'top'; // keep this fixed

  /* Update card text */
  replaceTextBasedOnRotation();

  /* Absorb thing (coin) if applicable */
  absorbThing();

  /* Play sound */
  playSmallSound();
}

function handleClockwiseRotation() {
  rotate('clockwise');
}

function handleCounterClockwiseRotation() {
  rotate('counterClockwise');
}

/**
 * Takes the coordinates / direction / length of cat,
 * figure out all of the coordinates that it would be occupying
 * were it to complete a rotation, and determines if any of those
 * coordinates would be oob. Returns a boolean as such.
 * @param headX x-coordinate of cat head
 * @param headY y-coordinate of cat head
 * @param currentFacing which direction cat head is facing
 * @param rotation which direction cat wants to rotate
 * @param length length of cat
 * @param gridSize dimensions of current level
 * @returns boolean - if the cat will be oob or not
 */
function willRotationBeOutOfBounds(
  headX: number,
  headY: number,
  currentFacing: Direction,
  rotation: RotationDirection,
  length: number,
  gridSize: { x: number; y: number }
): boolean {
  const newFacing = getRotatedDirection(currentFacing, rotation);
  const occupied = getOccupiedTileCoordinates(headX, headY, newFacing, length);

  return occupied.some(
    ({ x, y }) => x < 0 || x >= gridSize.x || y < 0 || y >= gridSize.y
  );
}

export function replaceTextBasedOnRotation() {
  const isVertical =
    CAT_OF_TRUTH.headFacing === 'bottom' || CAT_OF_TRUTH.headFacing === 'top';
  const leftOrUp = isVertical ? 'left' : 'up';
  const rightOrDown = isVertical ? 'right' : 'down';

  const cards = document.getElementsByClassName('card');
  for (let i = 0; i < cards.length; i++) {
    cards[i].innerHTML = cards[i].innerHTML
      .replace(/left/g, leftOrUp)
      .replace(/up/g, leftOrUp)
      .replace(/right/g, rightOrDown)
      .replace(/down/g, rightOrDown);
  }
}
