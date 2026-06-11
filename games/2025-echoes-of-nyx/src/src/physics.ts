import { getSquareSize } from './config';
import BlocEntity from './entities/BlocEntity';
import Entity from './entities/Entity';
import Game from './Game';
import { isPointCollission } from './utils';

export const topSym = Symbol('top');
export const bottomSym = Symbol('bottom');
export const leftSym = Symbol('left');
export const rightSym = Symbol('right');

interface ColisionCheck {
  block: BlocEntity;
  side?: Symbol;
}

interface Colission {
  top?: ColisionCheck;
  bottom?: ColisionCheck;
  left?: ColisionCheck;
  right?: ColisionCheck;
}

export function checkColissions(game: Game): Colission {
  const hitBox = game.player.hitbox;
  const colisions = game.checkColission({
    x: hitBox.x + game.xForce,
    y: hitBox.y + game.yForce,
    width: hitBox.width,
    height: hitBox.height,
  });

  let colisionChecks: ColisionCheck[] = [];
  if (colisions.length) {
    const x = hitBox.x + game.xForce;
    const y = hitBox.y + game.yForce;

    colisionChecks = colisions.map((block) => {
      const c = {
        tl: isPointCollission({ x, y: y + hitBox.height }, block),
        tr: isPointCollission({ x: x + hitBox.width, y: y + hitBox.height }, block),
        bl: isPointCollission({ x, y }, block),
        br: isPointCollission({ x: x + hitBox.width, y }, block),
      };
      let side;
      if ((c.br && c.bl) || (c.bl && !c.tl && game.yForce < 0) || (c.br && !c.tr && game.yForce < 0)) {
        side = topSym;
      } else if ((c.tr && c.tl) || (c.tl && !c.bl && game.yForce > 0) || (c.tr && !c.br && game.yForce > 0)) {
        side = bottomSym;
      } else if ((c.br && c.tr) || (c.br && game.yForce > 0) || (c.tr && game.yForce < 0)) {
        side = leftSym;
      } else if ((c.bl && c.tl) || (c.bl && game.yForce > 0) || (c.tl && game.yForce < 0)) {
        side = rightSym;
      }
      return {
        block,
        side,
      };
    });
  }

  const topCollision = colisionChecks.find((colisionCheck) => colisionCheck.side === bottomSym);
  const bottomCollision = colisionChecks.find((colisionCheck) => colisionCheck.side === topSym);
  const rightCollision = colisionChecks.find((colisionCheck) => colisionCheck.side === leftSym);
  const leftCollision = colisionChecks.find((colisionCheck) => colisionCheck.side === rightSym);

  return {
    top: topCollision,
    bottom: bottomCollision,
    right: rightCollision,
    left: leftCollision,
  };
}
