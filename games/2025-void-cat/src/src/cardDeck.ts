import { createDOMCard, type Card } from './card';
import { CARD_LIBRARY } from './cardLibrary';
import { replaceTextBasedOnRotation } from './rotator';

type DeckOfTruthType = {
  unusedCards: Card[];
  hand: Card[];
  discardPile: Card[];
};

export let DECK_OF_TRUTH: DeckOfTruthType = {
  unusedCards: [
    CARD_LIBRARY[0],
    CARD_LIBRARY[0],
    CARD_LIBRARY[0],
    CARD_LIBRARY[1],
    CARD_LIBRARY[1],
    CARD_LIBRARY[1],
    CARD_LIBRARY[2],
    CARD_LIBRARY[3],
  ],
  hand: [],
  discardPile: [],
};
/**
 * Takes an array of cards, randomizes it, and returns the randomized array.
 * Intended to be used to shuffle your deck (global).
 * Uses the Schwartzian transform.
 * https://stackoverflow.com/a/46545530
 */
export function shuffleCards(cards: Card[]): Card[] {
  return cards
    .map((value) => ({ value, order: Math.random() }))
    .sort((a, b) => a.order - b.order)
    .map(({ value }) => value);
}

export function getAllCards() {
  return DECK_OF_TRUTH.unusedCards.concat(DECK_OF_TRUTH.discardPile);
}

/**
 * Set fresh deck
 */
export function setDeckCards() {
  DECK_OF_TRUTH.unusedCards = shuffleCards(getAllCards());
  DECK_OF_TRUTH.discardPile = [];
}

/**
 * Add cards to your hand for use in a future stage.
 * @param cards Array of Cards to add to hand, set in the STAGES const
 */
export function addCardsToDeck(cards: Card[]) {
  cards.forEach((card) => DECK_OF_TRUTH.unusedCards.push(card));
}

/* Draw one card */
export function drawCard(): Card | null {
  if (DECK_OF_TRUTH.unusedCards.length === 0) {
    reshuffleDiscardIntoDraw();
    if (DECK_OF_TRUTH.unusedCards.length === 0) return null; // no cards at all
  }
  return DECK_OF_TRUTH.unusedCards.pop()!;
}

/**
 * Runs drawCard() in a loop of how many cards your handSize is.
 * This all creates a card in the DOM (in #card-holder)
 * @param handSize Number of cards to draw
 */
export function addXCardsToHand(
  handSize: number = 3,
  shouldClearHandBeforeDrawing: boolean = true
) {
  /* Clear any remaining cards before drawing new cards
   * This will set DECK_OF_TRUTH.hand = [],
   * move those cards into DECK_OF_TRUTH.discard,
   * and will also visually remove them from the DOM */
  if (shouldClearHandBeforeDrawing) {
    clearHand();
  }
  let cardsDrawn = 0;
  while (cardsDrawn < handSize) {
    /** This removes the card from unusedCards */
    const card = drawCard();
    if (!card) break;

    DECK_OF_TRUTH.hand.push(card);

    addCardToHandVisually(card);
    cardsDrawn++;
  }

  replaceTextBasedOnRotation();
}

export function addCardToHandVisually(card: Card) {
  const cardToAdd = createDOMCard(card);
  document.getElementById('card-holder')?.appendChild(cardToAdd);
}

function clearHandState() {
  DECK_OF_TRUTH.hand.forEach((card) => {
    DECK_OF_TRUTH.discardPile.push(card);
  });
  DECK_OF_TRUTH.hand = [];
}

function clearHandVisually() {
  document.getElementById('card-holder')!.innerHTML = '';
}

function clearHand() {
  clearHandState();
  clearHandVisually();
}

// is this different than addXCardsToHand
export function addWholeHandVisually() {
  const cardHolder = document.getElementById('card-holder');
  // clear out first. Feels unwieldy but without, I'm getting doubles
  clearHandVisually();
  DECK_OF_TRUTH.hand.forEach((card) =>
    cardHolder?.appendChild(createDOMCard(card))
  );

  replaceTextBasedOnRotation();
}

/**
 * Push a card into DECK_OF_TRUTH.discardPile
 * @param card Card you are discarding
 */
export function discardCard(card: Card) {
  DECK_OF_TRUTH.discardPile.push(card);
}

// Reshuffle discard into draw pile
export function reshuffleDiscardIntoDraw() {
  if (DECK_OF_TRUTH.discardPile.length === 0) return;
  DECK_OF_TRUTH.unusedCards = shuffleCards(DECK_OF_TRUTH.discardPile);
  DECK_OF_TRUTH.discardPile = [];
}
