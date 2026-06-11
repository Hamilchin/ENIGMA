import { getOccupiedTileCoordinates } from './cat';
import { GAME_STATE_OF_TRUTH } from './gameState';
import { getTile } from './grid';
import { updateMoney } from './meterUtils';
import { playPickup1 } from './sounds';
import { STAGES } from './stage';
import {
  generateDOMThing,
  type ThingCoordinates,
  type Thing,
  isThing,
} from './thing';

type ThingOrClass =
  | { thing: Thing; className?: never }
  | { thing?: never; className: string };

/**
 * This does the actual appending on stuff to the board.
 * Stuff refers to either Things (like coins) or CSS classes (like 'attack')
 * @param coordinates these are [x, y][] coordinates, but most likely come from a function like generateThingsInDiamondShape, which generate these for you
 * @param thingOrClass you should pass either {className: 'whatever'} OR {thing: 'coin'}, but not both
 */
export function addThingsToGrid(
  coordinates?: ThingCoordinates,
  thingOrClass?: ThingOrClass
) {
  if (!coordinates || !thingOrClass) return null;
  coordinates.forEach((thingLocation) => {
    const [x, y] = thingLocation;
    const { thing, className } = thingOrClass;

    const tileToAppendTo = getTile(x, y);
    if (!tileToAppendTo) {
      return;
    }

    if (thing) {
      tileToAppendTo.innerHTML = '';

      if (isThing(thing)) {
        return tileToAppendTo.appendChild(
          generateDOMThing(STAGES[GAME_STATE_OF_TRUTH.currentStage].thingType)
        );
      }
    }

    if (className) {
      return tileToAppendTo.classList.add(className);
    }
  });
}

/**
 * Removes all of a certain classname from the board
 * @param className; just a string
 */
export function removeClassNamesFromGrid(className: string) {
  const gridTiles = document.getElementsByClassName('tile');
  Array.from(gridTiles ?? []).forEach((gridTile) =>
    gridTile.classList.remove(className)
  );
}

export function absorbThing() {
  const tilesOccupiedByCat = getOccupiedTileCoordinates();

  tilesOccupiedByCat.forEach((occupiedTile) => {
    const tile = getTile(occupiedTile.x, occupiedTile.y);
    if (!tile) return;
    const coinTile = tile?.querySelector('.thing');
    if (coinTile) {
      updateMoney(1);
      tile?.removeChild(coinTile);
      playPickup1();
    }
  });
}
