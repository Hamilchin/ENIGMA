const screenIds = ['sg', 'si'] as const;

export type ScreenId = (typeof screenIds)[number];

// Could be improved or thought more about.
// Show the screen you pass in, then hide the others
export function showScreen(screen: ScreenId) {
  /* Show the chosen screen */
  const screenToShow = document.getElementById(screen);
  if (!screenToShow) return;
  screenToShow.style.display = 'flex';

  const otherScreen: ScreenId = screen === 'sg' ? 'si' : 'sg';

  /* Hide the others in that group */
  const elementWithID = document.getElementById(otherScreen);
  if (!elementWithID) return;
  elementWithID.style.display = 'none';
}
