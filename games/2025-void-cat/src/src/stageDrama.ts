import { playBoop } from './sounds';
import { delay } from './utils';

/**
 * Renders text character-by-character
 */
async function renderEachLetter(text: string) {
  const dramaBox = document.querySelector('.drama');
  if (!dramaBox) return;
  const newTextContainer = document.createElement('div');
  dramaBox.prepend(newTextContainer);
  let temp = '';
  for (const character of text) {
    if (STOP_REQUESTED) return; // <- bail out if stop requested
    playBoop();
    temp += character;
    newTextContainer.innerHTML = temp;
    await delay(25);
  }
}

/**
 * This will take an array of messages; it will render the first one,
 * look at the number of characters in the previous one, and
 * render the next one based on the total time it takes to render the previous one
 */
export async function handleDramaEventsSequentially(
  lines: (string | (() => string))[]
) {
  STOP_REQUESTED = false; // reset before starting

  /* Calculate delay based on message length */
  const baseDelay = 500; // Base delay in ms for short messages
  const lengthFactor = 25; // Additional ms per character in the message

  for (const line of lines) {
    if (STOP_REQUESTED) return; // <- bail out between lines
    const actualLine = typeof line === 'function' ? line() : line;
    await renderEachLetter(actualLine);
    // const messageDelay = baseDelay + line.length * lengthFactor;
    // await delay(messageDelay);
    const messageDelay = baseDelay + line.length * lengthFactor;
    let elapsed = 0;
    while (elapsed < messageDelay) {
      if (STOP_REQUESTED) return; // <- bail out during waiting
      await delay(50);
      elapsed += 50;
    }
  }
}

/** This is a flag that will allow us to bail out of
 * the async handleScriptEventsSequentially function. */
let STOP_REQUESTED = false;

export function stopDramaEvents() {
  STOP_REQUESTED = true;
}

export const LAST_LINE =
  'TURN TRANSMISSION COMPLETED. CONTINUE WITH WORKOUT 🃏🃏🃏🃏🃏';
