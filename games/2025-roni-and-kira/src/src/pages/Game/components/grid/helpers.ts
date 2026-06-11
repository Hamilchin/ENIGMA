import { cloneDeep } from "../../../../utils/helpers";
import {
  ECatColor,
  EDirections,
  ETiles,
  INCREASE_SWIPE,
} from "../../../../utils/constants";
import type {
  Cat,
  coordinate,
  IBoardKeys,
  Level,
  TCatColor,
  Tiles,
} from "../../../../interfaces";

/**
 * Para saber si una coordenada está dentro dle board del juego
 * @param position
 * @param width
 * @param height
 * @returns
 */
const insideBoard = (position: coordinate, width = 0, height = 0) => {
  const { x, y } = position;
  return x >= 0 && x < width && y >= 0 && y < height;
};

/**
 * Dada la posisción, devuleve el tipo de tile que exista, pueden ser máximo dos
 * por ejemplo spikes y encima una caja
 * @param tiles
 * @param position
 * @returns
 */
const getTilePosition = (tiles: Tiles[], position: coordinate) => {
  const { x, y } = position;
  return tiles.filter((v) => v.position.x === x && v.position.y === y);
};

/**
 * Valida si en la posición dada existe un gato
 * @param cats
 * @param position
 * @returns
 */
const getCatPosition = (cats: Cat[], position: coordinate) => {
  const { x, y } = position;
  return cats.find((v) => v.position.x === x && v.position.y === y);
};

/**
 * devuelve la posición final que se mostrará en elemento en el board...
 * @param position
 * @param size
 * @returns
 */
export const calculatePosition = (position: coordinate, size = 0) => ({
  x: `${position.x * size}px`,
  y: `${position.y * size}px`,
});

/**
 * Retorna el listado de tiles dado el tipo del mismo
 * @param type
 * @param tiles
 * @returns
 */
export const getTileByType = (type: ETiles, tiles: Tiles[]) =>
  tiles.filter((v) => v.type === type);

/**
 * Valida si ya se han seleccionado todas las llaves...
 * @param boardKeys
 * @returns
 */
export const valiteCollectAllKeys = (boardKeys: IBoardKeys) =>
  boardKeys.total === boardKeys.collected;

// TODO, vlaidar que cuando ha recogido todas las monedas y pasa sobre spikes siga derecho

/**
 * Valida y ejecuta el movimiento de un gato en el tablero
 * @param level      Estado actual del nivel.
 * @param catColor   Color del gato a mover.
 * @param dir        Dirección del movimiento.
 * @param boardKeys  Estado de llaves recolectadas.
 * @returns          { copyLevel, catMove } nivel actualizado y cantidad de pasos avanzados.
 */
export const validateMoveCat = (
  level: Level,
  catColor: TCatColor,
  dir: EDirections,
  boardKeys: IBoardKeys
) => {
  // Copia para no mutar el estado original
  const copyLevel = cloneDeep(level);
  const { width, height, cats, tiles } = copyLevel;

  // Incremento de posición según la dirección
  const increase = INCREASE_SWIPE[dir];

  // Contador de pasos avanzados en este "swipe"
  let catMove = 0;

  // Buscar el gato por color
  const indexCat = cats.findIndex((v) => v.color === catColor);

  // Si no existe el gato, devolver sin cambios (evita posibles errores)
  if (indexCat < 0) {
    return { copyLevel, catMove };
  }

  do {
    const currentCat = copyLevel.cats[indexCat];

    // Calcular la nueva posición tentativa
    const newPosition = {
      x: currentCat.position.x + increase.x,
      y: currentCat.position.y + increase.y,
    };

    // Si el gato ya está destruido o sale del tablero → detener
    const isCatDestroy = currentCat?.destroy ?? false;
    if (isCatDestroy || !insideBoard(newPosition, width, height)) {
      break;
    }

    // Consultar qué hay en la nueva posición
    const tilePosition = getTilePosition(tiles, newPosition); // tiles en esa celda (0, 1 o 2)
    const catPosition = getCatPosition(cats, newPosition); // ¿hay otro gato?

    // Si hay otro gato en esa casilla → detener
    if (catPosition) {
      break;
    }

    // Si hay al menos un tile en la casilla
    if (tilePosition.length !== 0) {
      // Extraer datos del primer tile (como en el original)
      const typeTile = tilePosition[0].type;
      const isBox = typeTile === ETiles.BOXES;
      const isHide = tilePosition[0]?.hide ?? false;
      const isOpen = tilePosition[0]?.open ?? false;

      // Caso con 2 tiles (p. ej. BOX + otro)
      if (tilePosition.length === 2) {
        // Mantener la misma lógica: identificar la caja y el "otro tile"
        const tileBox = isBox ? tilePosition[0] : tilePosition[1];
        const otherTile = isBox ? tilePosition[1] : tilePosition[0];

        // Caja visible y aún no avanzó: detener antes de mover
        if (!tileBox.hide && catMove === 0) {
          break;
        }
        // Caja visible pero ya avanzó ≥1: ocultar caja y detener
        else if (!tileBox.hide) {
          tileBox.hide = true;
          break;
        }
        // Caja ya oculta: si el otro es SPIKE → avanzar y destruir
        else if (otherTile.type === ETiles.SPIKE) {
          currentCat.position = newPosition;
          currentCat.destroy = true;
          catMove++;
        }
      }
      // Caso con 1 tile
      else {
        // BRICK → bloqueo total
        if (typeTile === ETiles.BRICK) {
          break;
        } else {
          // BOX visible → si ya avanzó, ocultar; en todo caso, detener
          if (!isHide && typeTile === ETiles.BOXES) {
            if (catMove >= 1) {
              tilePosition[0].hide = true;
            }
            break;
          }

          // GATES cerrada → sólo avanzar si ya se recolectaron todas las llaves
          if (!isOpen && typeTile === ETiles.GATES) {
            if (valiteCollectAllKeys(boardKeys)) {
              tilePosition[0].open = true; // abrir puerta y permitir el paso
            } else {
              break; // puerta cerrada, detener
            }
          }

          // COIN visible + gato amarillo → ocultar (con delay)
          if (
            !isHide &&
            typeTile === ETiles.COIN &&
            catColor === ECatColor.YELLOW
          ) {
            tilePosition[0].hide = true;
            tilePosition[0].delay = catMove + 1;
          }

          // KEY visible + gato negro → ocultar (con delay)
          if (
            !isHide &&
            typeTile === ETiles.KEYS &&
            catColor === ECatColor.BLACK
          ) {
            tilePosition[0].hide = true;
            tilePosition[0].delay = catMove + 1;
          }

          // SPIKE visible → el gato avanza y queda destruido
          if (!isHide && typeTile === ETiles.SPIKE) {
            currentCat.destroy = true;
          }

          // Si no se detuvo por alguna de las condiciones anteriores → mover
          currentCat.position = newPosition;
          catMove++;
        }
      }
    }
    // Casilla vacía → mover normalmente
    else {
      currentCat.position = newPosition;
      catMove++;
    }
  } while (1);

  return { copyLevel, catMove };
};
