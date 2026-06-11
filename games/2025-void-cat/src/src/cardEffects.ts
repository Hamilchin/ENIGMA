import { CAT_OF_TRUTH, getOccupiedTileCoordinates } from './cat';
import { DOM_CAT } from './main';
import { isOutOfBounds } from './grid';
import { delay } from './utils';
import { absorbThing } from './thingUtils';
import {
  playDisappointment,
  playLongcatSound,
  playNapSound,
  playSmallSound,
} from './sounds';
import { GAME_STATE_OF_TRUTH } from './gameState';
import { STAGES } from './stage';

/** Distance in pixels one move left or right should take */
export const ONE_MOVE = 182;

export type Direction = 'left' | 'right' | 'top' | 'bottom';
export type Stance = 'standard' | 'nap' | 'longcat';

/**
 * Function to move the cat upon playing a "movement" card
 * @param numberOfTiles number of tiles to move
 * @param direction direction to move in. Default is 'right'
 * @param orientation which way you expect to move, based if the cat is horizontally or vertically oriented
 */
export function move(
  numberOfTiles: number,
  // Can do cooler type for this if you want
  // Cards only have left or right and are gonna be augmented in this fx
  direction: 'left' | 'right' = 'right'
) {
  /** This determines which direction we're moving.
   * Specifically, if we add neg or pos pixels */
  const factor = direction === 'right' ? 1 : -1;

  const shouldMoveHorizontally =
    CAT_OF_TRUTH.headFacing === 'top' || CAT_OF_TRUTH.headFacing === 'bottom';

  const oneMovePx = shouldMoveHorizontally ? ONE_MOVE : ONE_MOVE;
  const headDirection = shouldMoveHorizontally ? 'headX' : 'headY';
  const leftOrTop = shouldMoveHorizontally ? 'left' : 'top';

  for (let i = 1; i <= numberOfTiles; i++) {
    /** Get the current x and multiply it by tile width
     * to get the current horizontal px count. */
    const movementPx = shouldMoveHorizontally
      ? CAT_OF_TRUTH.headX * ONE_MOVE
      : CAT_OF_TRUTH.headY * ONE_MOVE;

    if (!isOutOfBounds(direction)) {
      /** Add or subtract 1 to the current x */
      CAT_OF_TRUTH[headDirection] += factor;

      /** Move the cat on the DOM */
      DOM_CAT.style[leftOrTop] = `${movementPx + oneMovePx * factor}px`;

      /** Interact with Things on the grid */
      absorbThing();

      /* Make sound */
      playSmallSound();
    }

    delay(250);
  }
}

const stanceLengths: Record<Stance, number> = {
  standard: 2,
  nap: 1,
  longcat: 3,
};

export function changeStance(stance: Stance) {
  const stances: Stance[] = ['standard', 'nap', 'longcat'];
  const newLength = stanceLengths[stance];

  const occupied = getOccupiedTileCoordinates(
    CAT_OF_TRUTH.headX,
    CAT_OF_TRUTH.headY,
    CAT_OF_TRUTH.headFacing,
    stanceLengths[stance]
  );

  const gridSize = STAGES[GAME_STATE_OF_TRUTH.currentStage].gridSize;

  if (
    occupied.some(
      ({ x, y }) => x < 0 || x >= gridSize.x || y < 0 || y >= gridSize.y
    )
  ) {
    return playDisappointment();
  }

  CAT_OF_TRUTH.stance = stance;
  CAT_OF_TRUTH.length = newLength;

  // remove all stance classes and add the intended one
  DOM_CAT.classList.remove(...stances);
  DOM_CAT.classList.add(stance);

  // attempt to absorb from your new location
  absorbThing();

  if (stance === 'longcat') {
    playLongcatSound();
  } else if (stance === 'nap') {
    playNapSound();
  } else {
    playSmallSound();
  }
}
