import type { Direction, Stance } from './cardEffects';

export type Cat = {
  headX: number;
  headY: number;
  length: number;
  headFacing: Direction; // I had this as Orientation, but maybe better to be specific
  stance: Stance;
};

/** These are the CSS classes for each cat part.
 * They are to be used inside a div with id "cat". */
const catClasses = [
  'ear left',
  'ear right',
  'eye left',
  'eye right',
  'nose',
  'smile',
  'paw front-left',
  'paw front-right',
  'paw back-left',
  'paw back-right',
];

export const CAT_OF_TRUTH: Cat = {
  headX: 0,
  headY: 0,
  length: 2,
  headFacing: 'top',
  stance: 'standard',
};

/**
 * Creates cat div in the DOM and applies classes, attributes, etc.
 * The initial settings come from the "source of truth," CAT_OF_TRUTH
 * Does NOT append it (that's done in addCatToGrid),
 * just in case you want to do anything else before appending.
 * @param startingX - number; the starting x value, saved as data-x in HTML. Default is CAT_OF_TRUTH's headX (0), but it can be overwritten
 * @param startingY - number; the starting y value, saved as data-y in HTML. Default is CAT_OF_TRUTH's headY (0), but it can be overwritten
 * @returns HTMLDivElement - DOM element of **the** cat
 */
export function createDOMCat(): HTMLDivElement {
  const domCat = document.createElement('div');

  /** Add id (for container) and classes (for body parts) */
  domCat.id = 'cat';
  catClasses.forEach((catClass) => {
    const catElement = document.createElement('div');
    catElement.className += ` ${catClass}`;
    domCat.appendChild(catElement);
  });

  /** Add initial position */
  // This is temporary and shoudl be handled better later... (later: it was not handled better)
  domCat.style.marginTop = '-890px';
  domCat.style.marginLeft = '-16px';
  domCat.style.top = '0px';
  domCat.style.left = '0px';

  return domCat;
}

export function addDOMCatToGrid(catDiv: HTMLDivElement) {
  document.querySelector('#grid')?.appendChild(catDiv);
}

/**
 * Returns all tiles that the cat is currently occupying,
 * taking into account its current coordinates,
 * direction, and length
 * @param headX x-coordinate of cat head
 * @param headY y-coordinate of cat head
 * @param facing which direction cat is facing
 * @param length current length of cat
 * @returns array of x and y coordinates
 */
export function getOccupiedTileCoordinates(
  headX: number = CAT_OF_TRUTH.headX,
  headY: number = CAT_OF_TRUTH.headY,
  facing: Direction = CAT_OF_TRUTH.headFacing,
  length: number = CAT_OF_TRUTH.length
): { x: number; y: number }[] {
  const tiles = [{ x: headX, y: headY }]; // head always included

  for (let i = 1; i < length; i++) {
    switch (facing) {
      case 'top':
        tiles.push({ x: headX, y: headY + i });
        break;
      case 'bottom':
        tiles.push({ x: headX, y: headY - i });
        break;
      case 'left':
        tiles.push({ x: headX + i, y: headY });
        break;
      case 'right':
        tiles.push({ x: headX - i, y: headY });
        break;
    }
  }

  return tiles;
}
