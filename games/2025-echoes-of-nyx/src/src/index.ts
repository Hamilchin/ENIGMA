import { computeBackgrounds } from './background';
import { computedSizes, gridRealHeight, getGridRealWidth, getDefaultRadius } from './config';
import { canvas } from './assets';
import Engine from './Engine';
import Game from './Game';

window.addEventListener('keydown', (e) => (Game.instance.keys[e.code] = true));

window.addEventListener('keyup', (e) => (Game.instance.keys[e.code] = false));

async function init() {
  if (!canvas) return;

  canvas.style.display = 'none';
  await computeBackgrounds();
  canvas.style.display = 'flex';
  canvas.height = gridRealHeight;
  canvas.width = getGridRealWidth();

  window.addEventListener('resize', () => {
    computedSizes();
    canvas.height = gridRealHeight;
    canvas.width = getGridRealWidth();
    Game.instance.radius = getDefaultRadius();
    Game.instance.scenes[Game.instance.currentScene].update();
    Game.instance.scenes[Game.instance.currentScene].needRefresh = true;
  });
  const engine = new Engine();

  window.requestAnimationFrame(engine.loop.bind(engine));
}

init();
