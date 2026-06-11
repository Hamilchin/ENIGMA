import { disableAllButtons, enableAllButtons, triggerAttack } from './attack';
import { addXCardsToHand } from './cardDeck';
import {
  handleDramaEventsSequentially,
  LAST_LINE,
  stopDramaEvents,
} from './stageDrama';

import { GAME_STATE_OF_TRUTH, setGameState } from './gameState';
import { initGame, initIntermission } from './main';
import { updateEnergy, updateTurn } from './meterUtils';
import { STAGES } from './stage';
import { addThingsToGrid, removeClassNamesFromGrid } from './thingUtils';
import { handleEffectsSequentially } from './utils';

export function initNextTurnButton() {
  const nextButton = document.querySelectorAll('.next');
  if (!nextButton) return;
  nextButton.forEach((btn) => {
    btn.removeEventListener('click', handleNextButtonClick);
    btn.addEventListener('click', handleNextButtonClick);
  });
}

export async function handleNextButtonClick() {
  if (GAME_STATE_OF_TRUTH.currentScreen === 'si') {
    setGameState('currentScreen', 'sg');
    updateTurn(0);
    updateEnergy(GAME_STATE_OF_TRUTH.energyMax);
    updateNextButtonText();
    return initGame(STAGES[GAME_STATE_OF_TRUTH.currentStage]);
  }

  if (!isLastTurn()) {
    return updateTurnViaButton();
  }

  /** Add 1 to the stage
   * Switch the screen */
  if (isLastTurn()) {
    await handleEffectsSequentially([
      // make everything unclickable
      () => disableAllButtons(),

      () => stopDramaEvents(),

      // if there's an attack square, trigger it audiovisually
      // also calculate how many tiles were struck with the attack
      async () => await triggerAttack(),

      // () => removeClassNamesFromGrid('attack'),

      // go to next screen
      () => setGameState('currentStage', GAME_STATE_OF_TRUTH.currentStage + 1),
      () => setGameState('currentScreen', 'si'),
      () => document.querySelector('.next')!.classList.remove('warning'),
      () => initIntermission(GAME_STATE_OF_TRUTH.currentStage),
      () => enableAllButtons(),
    ]);
  }
}

export async function updateTurnViaButton() {
  const newTurnValue = GAME_STATE_OF_TRUTH.currentTurn + 1;
  addXCardsToHand();

  stopDramaEvents();

  // trigger "attack" stage
  await handleEffectsSequentially(
    [
      // make everything unclickable
      () => disableAllButtons(),

      // if there's an attack square, trigger it audiovisually
      // also calculate how many tiles were struck with the attack
      () => triggerAttack(),

      // update meters
      () => updateTurn(newTurnValue),
      () => updateEnergy(GAME_STATE_OF_TRUTH.energyMax),
      () => updateNextButtonText(),

      // update grid
      () => removeClassNamesFromGrid('attack'),
      () =>
        addThingsToGrid(
          STAGES[GAME_STATE_OF_TRUTH.currentStage].attackCoordinates[
            newTurnValue
          ],
          { className: 'attack' }
        ),

      // make everything clickable again
      () => enableAllButtons(),

      // start next turn's text
      () =>
        handleDramaEventsSequentially([
          ...STAGES[GAME_STATE_OF_TRUTH.currentStage].drama[newTurnValue],
          LAST_LINE,
        ]),
    ],
    300
  );
}

export function isLastTurn() {
  const { currentTurn } = GAME_STATE_OF_TRUTH;
  const totalTurns = 4; // Really it's STAGES[currentStage].attackCoordinates.length || 4;

  return currentTurn >= totalTurns;
}

export function updateNextButtonText() {
  const nextButton = document.querySelector('.next');
  if (!nextButton) return null;

  if (isLastTurn()) {
    handleEffectsSequentially(
      [
        () => (nextButton.innerHTML = 'End stage'),
        () => nextButton.classList.add('warning'),
      ],
      1200
    );
  } else {
    nextButton.classList.remove('warning');
    nextButton.innerHTML = 'Next turn';
  }
}
