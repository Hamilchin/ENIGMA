import world1 from './levels/world-1';
import world2 from './levels/world-2';
import world3 from './levels/world-3';

// Sizes
export const ratio = (n: number, x: number, y: number = 100) => Math.round((n / y) * x);

const idealWidth = 20;
export const uiSquareRatio = 40;

export const gridWidth = 40;
export const gridHeight = ratio(gridWidth, 10, 16);
export let gridRealWidth = 0;
let zoomRatio = 1;

export let getSquareSize = () => Math.round(gridRealWidth / gridWidth);
export let getGridRealWidth = () => gridWidth * getSquareSize();
export let getGridRealHeight = () => gridHeight * getSquareSize();
export let gridRealHeight = 0;

export function computedSizes() {
  gridRealWidth = ratio(window.innerWidth, 80);
  if (ratio(gridRealWidth, 10, 16) > ratio(window.innerHeight, 90)) {
    gridRealWidth = ratio(ratio(window.innerHeight, 90), 16, 10);
  }
  const theoricalGridWidth = gridWidth * idealWidth;
  zoomRatio = (gridRealWidth * 100) / theoricalGridWidth / 100;
  gridRealHeight = gridHeight * getSquareSize();
}
computedSizes();

// Forces
export const getMoveSpeed = () => getSquareSize() / 5;
export const getJumpSpeed = () => (getSquareSize() / 5) * 5;
export const getYForceDecrease = () => getSquareSize() / 20;
export const getXForceDecrease = () => getSquareSize() / 10;

export const FPS = 60;

export const coyoteFrames = 3;
export const getDefaultRadius = () => getSquareSize() * gridWidth * 2;

export const lightBackground = '#f7f6f0';
export const darkBackground = '#111111';

export const gameName = 'Echoes of Nyx';
document.title = gameName;

export const treatLocalStorageKey = `${gameName}-t`;
export const levelLocalStorageKey = `${gameName}-l`;
export const introLocalStorageKey = `${gameName}-i`;
export const volumeLocalStorageKey = `${gameName}-v`;

export const worlds = [world1, world2, world3];
export const textSpeed = 40;
export const globalVolume = 0.5;
