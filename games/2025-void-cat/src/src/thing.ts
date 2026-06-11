import { getRandom } from './utils';

const validThings = ['coin', 'tree', 'house', 'building', 'planet'] as const;

export type Thing = (typeof validThings)[number];

export function isThing(value: string): value is Thing {
  return (validThings as readonly string[]).includes(value);
}

export type ThingCoordinates = [number, number][];

/**
 * Create the div which contains a Thing.
 * Do NOT add it to the DOM, just generate it
 * @param thingType of type Thing.
 * @returns
 */
export function generateDOMThing(thingType: Thing) {
  const thing = document.createElement('div');
  thing.classList.add('thing');
  if (thingType === 'coin') {
    thing.classList.add('coin');
    thing.innerHTML = '1';
  } else if (thingType === 'tree') {
    thing.innerHTML = getRandom(['🌲', '🌳', '🪾']);
  } else if (thingType === 'house') {
    thing.innerHTML = getRandom(['🏡', '🏠', '🏘️']);
  } else if (thingType === 'building') {
    thing.innerHTML = getRandom(['🏙️', '🌃', '🌆', '🌇']);
  } else {
    thing.classList.add('planet');
    thing.classList.add(getRandom(['planet-1', 'planet-2', 'planet-3']));
  }
  return thing;
}

/**
 * This gives the coordinates of things in a "diamond" shape on the grid.
 * You pass in the largest x or y value; either is OK (it's a square),
 * and you can pass in, for example, `gridRows`.
 * @param maxCoordinate the largest x or y value (assuming a square grid)
 * @returns an array of all of the coordinates of the diamonds to append
 */
export function generateThingCoordinatesInDiamondShape(
  maxCoordinate: number
): ThingCoordinates {
  const center = Math.floor(maxCoordinate / 2);
  const coords: ThingCoordinates = [];

  for (let y = 0; y < maxCoordinate; y++) {
    for (let x = 0; x < maxCoordinate; x++) {
      if (Math.abs(x - center) + Math.abs(y - center) === center) {
        coords.push([x, y]);
      }
    }
  }

  return coords;
}

/**
 *
 * @param maxCoordinate The largest coordinate of the grid.
 * @param xsOrYs Depending on row or column, the number of the rows or columns that you want to add Things to (in an array)
 * @param rowOrColumn If you're making rows or columns
 * @returns
 */
export function generateThingCoordinatesInStraightRowsOrColumns(
  maxCoordinate: number,
  xsOrYs: number[],
  rowOrColumn: 'row' | 'column'
): ThingCoordinates {
  const coords: ThingCoordinates = [];
  xsOrYs.forEach((xOrY) => {
    for (let i = 0; i < maxCoordinate; i++) {
      coords.push(rowOrColumn === 'row' ? [i, xOrY] : [xOrY, i]);
    }
  });
  return coords;
}
