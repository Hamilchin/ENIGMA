import { getOccupiedTileCoordinates } from './cat';
import { getTile } from './grid';
import { updateCaloriesBurned } from './meterUtils';
import { playExplosion2, playWasAttacked } from './sounds';
import { handleEffectsSequentially } from './utils';

export function disableAllButtons() {
  const buttons = document.getElementsByTagName('button');
  Array.from(buttons ?? []).forEach((button) => {
    button.disabled = true;
  });
}

export function enableAllButtons() {
  const buttons = document.getElementsByTagName('button');
  Array.from(buttons ?? []).forEach((button) => {
    button.disabled = false;
  });
}

export async function triggerAttack() {
  const attackTiles = document
    .getElementById('grid')
    ?.getElementsByClassName('attack');

  if (attackTiles && attackTiles.length > 0) {
    playExplosion2();

    // Animate all attack tiles in parallel
    await Promise.all(
      Array.from(attackTiles).map((tile) =>
        handleEffectsSequentially([
          () => tile.classList.add('attacking'),
          () => tile.classList.remove('attacking'),
        ])
      )
    );

    // Do cat damage logic
    getOccupiedTileCoordinates().forEach(({ x, y }) => {
      const tile = getTile(x, y);
      if (tile?.classList.contains('attack')) {
        updateCaloriesBurned(-1);
        playWasAttacked();
      }
    });
  }
}
