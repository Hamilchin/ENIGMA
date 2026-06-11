import { addCardsToDeck, addXCardsToHand, setDeckCards } from './cardDeck';
import { addDOMCatToGrid, CAT_OF_TRUTH, createDOMCat } from './cat';
import { createEmptyGrid, renderGrid } from './grid';
import { initRotator } from './rotator';
import { showScreen } from './screen';
import { STAGES, type Stage } from './stage';
import { initNextTurnButton } from './nextButton';
import { GAME_STATE_OF_TRUTH } from './gameState';
import { updateTextAndButtonText } from './stageIntermission';
import { handleDramaEventsSequentially, LAST_LINE } from './stageDrama';
import { addThingsToGrid } from './thingUtils';

export let DOM_CAT = createDOMCat();

export function initGame({ gridSize, terrain }: Stage) {
  /* Draw game grid */
  const grid = createEmptyGrid(gridSize.x, gridSize.y, terrain);
  renderGrid(grid);

  /* Add the attacks to the grid */
  addThingsToGrid(
    STAGES[GAME_STATE_OF_TRUTH.currentStage].attackCoordinates[0],
    { className: 'attack' }
  );

  /* Add the DOMcat to the grid! */
  DOM_CAT = createDOMCat();

  /* Add glow to cat on space stages */
  STAGES[GAME_STATE_OF_TRUTH.currentStage].terrain === 'space' &&
    DOM_CAT.classList.add('glowing');

  addDOMCatToGrid(DOM_CAT);

  CAT_OF_TRUTH.headX = 0;
  CAT_OF_TRUTH.headY = 0;
  CAT_OF_TRUTH.headFacing = 'top';
  CAT_OF_TRUTH.length = 2;
  CAT_OF_TRUTH.stance = 'standard';

  /* Add this stage's new cards */
  addCardsToDeck(STAGES[GAME_STATE_OF_TRUTH.currentStage].cardsAdded);

  /* Put all cards into the "unused" pile
   * Do this after setting up the cat so the cards are correct */
  setDeckCards();

  /* Add cards to your hand (default: 3) */
  addXCardsToHand();

  /* Create rotator buttons
   * Also do this after CAT so rotator angles are right... */
  initRotator();

  /* Init the next turn button */
  initNextTurnButton();

  /* Show the game screen */
  showScreen('sg');

  handleDramaEventsSequentially([
    ...STAGES[GAME_STATE_OF_TRUTH.currentStage].drama[0],
    LAST_LINE,
  ]);
}

export function initIntermission(currentStage: number) {
  /* Init the next turn button */
  initNextTurnButton();

  showScreen('si');

  updateTextAndButtonText(currentStage);
}

initIntermission(GAME_STATE_OF_TRUTH.currentStage);
