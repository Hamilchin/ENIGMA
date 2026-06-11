import { initClickHandler } from "./core/controllers/ClickController";
import { drawEngine } from "./core/controllers/DrawController";
import { screenTransitions } from "./core/controllers/ScreenTransitionController";
import { Background } from "./core/model/background";
import {
  createGameStateMachine,
  gameStateMachine,
} from "./gameStates/gameStateMachine";
import { menuState } from "./gameStates/menuState";

createGameStateMachine(menuState);

let previousTime = performance.now();

const globalBackground = new Background();

(() => {
  initClickHandler(drawEngine.context.canvas); // Setup click handlers

  function gameLoop(currentTime: number) {
    const delta = (currentTime - previousTime) / 1000; // in seconds
    previousTime = currentTime;

    drawEngine.context.clearRect(
      0,
      0,
      drawEngine.canvasWidth,
      drawEngine.canvasHeight
    );

    globalBackground.update(delta);
    globalBackground.draw(drawEngine.context);

    gameStateMachine.getState().onUpdate(delta);

    screenTransitions.update(delta);
    screenTransitions.draw(drawEngine.context);

    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
})();
