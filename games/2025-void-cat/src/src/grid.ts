import type { Direction } from './cardEffects';
import { CAT_OF_TRUTH } from './cat';
import { GAME_STATE_OF_TRUTH } from './gameState';
import { STAGES } from './stage';
import { type Thing } from './thing';
import { addThingsToGrid } from './thingUtils';

export type Terrain = 'floor' | 'grass' | 'street' | 'space';

type Tile = {
  x: number;
  y: number;
  terrain: Terrain;
  thing?: Thing;
  incomingAttack?: boolean;
};

type Grid = Tile[][];

export function createEmptyGrid(
  width: number,
  height: number,
  terrain: Terrain = 'floor'
): Grid {
  const grid: Grid = [];
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      row.push({ x, y, terrain });
    }
    grid.push(row);
  }
  return grid;
}

export function renderGrid(grid: Grid) {
  const gridContainer = document.getElementById('grid');
  if (!gridContainer) return;

  const gridRows = grid.length;
  const gridColumns = grid[0].length;

  const tileSize = 68; // px

  gridContainer.style.gridTemplateRows = `repeat(${gridRows}, ${tileSize}px)`;
  gridContainer.style.gridTemplateColumns = `repeat(${gridColumns}, ${tileSize}px)`;

  // The container will now auto-size to fit all tiles
  gridContainer.style.width = `${gridRows * (tileSize + 6)}px`;
  gridContainer.style.height = `${gridColumns * (tileSize + 6)}px`;

  gridContainer.innerHTML = '';

  // Populate DOM
  for (let y = 0; y < gridColumns; y++) {
    for (let x = 0; x < gridRows; x++) {
      const tileDiv = document.createElement('div');
      tileDiv.className = 'tile';
      tileDiv.classList.add(grid[y][x].terrain);
      tileDiv.dataset.x = x.toString();
      tileDiv.dataset.y = y.toString();

      gridContainer.appendChild(tileDiv);
    }
  }

  const currentStage = STAGES[GAME_STATE_OF_TRUTH.currentStage];
  addThingsToGrid(currentStage.thingCoordinates, {
    thing: currentStage.thingType,
  });
}

export function getTile(x: number, y: number): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    `.tile[data-x="${x}"][data-y="${y}"]`
  );
}

export function isOutOfBounds(direction: Direction) {
  const addend = direction === 'right' || direction === 'bottom' ? 1 : -1;

  /** If the cat's head is facing top or bottom, move headX
   * If the cat's head is facing left or right, move headY */
  const isCatVertical =
    CAT_OF_TRUTH.headFacing === 'top' || CAT_OF_TRUTH.headFacing === 'bottom';

  const headXOrHeadY = isCatVertical ? 'headX' : 'headY';
  const xOrY = isCatVertical ? 'x' : 'y';

  return (
    CAT_OF_TRUTH[headXOrHeadY] + addend < 0 ||
    CAT_OF_TRUTH[headXOrHeadY] + addend >=
      STAGES[GAME_STATE_OF_TRUTH.currentStage].gridSize[xOrY]
  );
}
