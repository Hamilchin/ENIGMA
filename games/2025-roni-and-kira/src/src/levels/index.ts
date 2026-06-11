import { Cat, Level, Tiles } from "../interfaces";
import { ECatColor, ETiles, LOCAL_STORAGE_KEY } from "../utils/constants";
import { getValueFromCache, savePropierties } from "../utils/storage";
import { isValidNumber } from "../utils/helpers";
import LEVELS from "./LEVELS";

export const getTotalLevels = () => LEVELS.length;

export const getLevel = (level = 0) => convertLevel(LEVELS[level]);

export const isValidLevelFromCache = (level: string) => {
  // Valida si el valor en caché es un número válido, de lo contrario usa "0"
  const completedLevel = +(isValidNumber(level) ? level : "0");

  return completedLevel >= 0 && completedLevel <= getTotalLevels()
    ? completedLevel
    : 0;
};

// Obtiene el nivel completado almacenado en caché (LocalStorage)
export const getCurrentLevelFromCache = () =>
  isValidLevelFromCache(getValueFromCache(LOCAL_STORAGE_KEY.LEVEL, "0"));

/**
 * Devuelve el nivel que se ha seleccionado
 * @returns
 */
export const getSelectedLevel = () =>
  isValidLevelFromCache(getValueFromCache(LOCAL_STORAGE_KEY.SELECTED, "0"));

export const saveLevelCache = (currentLevel = 0) => {
  const nextLevel = currentLevel + 1;
  const completedLevel = getCurrentLevelFromCache();

  if (
    nextLevel >= 0 &&
    nextLevel <= getTotalLevels() &&
    nextLevel > completedLevel
  ) {
    savePropierties(LOCAL_STORAGE_KEY.LEVEL, nextLevel);
  }
};

const convertLevel = (stringLevel = ""): Level => {
  const [dimensiones = "", cats = "", tiles = ""] = stringLevel.split("#");
  const [w, h] = dimensiones.split(",");
  const [black, yellow] = cats.split(";");
  const listTiles = tiles.split(";");
  const ETilesKeys = Object.keys(ETiles);
  const newCats: Cat[] = [];
  const blackPos = black.split(",");
  const yellowPos = yellow.split(",");

  newCats.push(
    {
      color: ECatColor.BLACK,
      position: { x: +blackPos[0], y: +blackPos[1] },
    },
    {
      color: ECatColor.YELLOW,
      position: { x: +yellowPos[0], y: +yellowPos[1] },
    }
  );

  const newTiles: Tiles[] = listTiles.map((value) => {
    const [t, x, y] = value.split(",");
    return {
      type: +ETilesKeys[+t] as ETiles,
      position: { x: +x, y: +y },
    };
  });

  return {
    width: +w,
    height: +h,
    cats: newCats,
    tiles: getTiles(+w, +h, newTiles),
  };
};

const getTiles = (width = 0, height = 0, tiles: Tiles[]) => {
  const newTiles: Tiles[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = width - 1; x >= 0; x--) {
      const existTile = tiles.filter(
        (v) => v.position.x === x && v.position.y === y
      );

      if (existTile.length !== 0) {
        for (const tile of existTile) {
          newTiles.push({
            type: tile.type,
            position: { x, y },
          });
        }
      } else if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
        newTiles.push({
          type: ETiles.BRICK,
          position: { x, y },
        });
      }
    }
  }

  return newTiles;
};
