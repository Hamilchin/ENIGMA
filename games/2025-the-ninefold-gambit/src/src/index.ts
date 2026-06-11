import { drawEngine } from './core/draw-engine';
import { MenuState } from './game-states/menu.state';
import { gameState } from './game-states/game.state';
import { createGameStateMachine, gameStateMachine } from './core/game-state-machine';
import { controls } from '@/core/controls';
import { time } from './core/time';
import { gamerEndState } from './game-states/game-end.state';


const menuState = new MenuState();
createGameStateMachine(menuState);
// createGameStateMachine(gameState);
// createGameStateMachine(gamerEndState);


time.reset(performance.now());
(function draw(currentTime: number) {
  time.update(currentTime);

  if (!time.isPaused && time.delta > 0) {
    controls.queryController();

    drawEngine.context.clearRect(0, 0, drawEngine.canvasWidth, drawEngine.canvasHeight);
    gameStateMachine.getState().onUpdate(time.delta);
  }

  if (time.isPaused) {
    drawPauseOverlay(); // optional: render "Game Paused" text
  }
  requestAnimationFrame(draw);
})(performance.now());

function drawPauseOverlay() {
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'p' || e.key === 'P') {
    if (time.isPaused) {
      time.resume();
    } else {
      time.pause();
    }
  }
});
