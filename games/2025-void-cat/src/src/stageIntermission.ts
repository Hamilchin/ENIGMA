type Intermission = {
  text: string;
  buttonText: string;
  isButtonDisabled?: boolean;
};

// Last turn of NextButton should +1 the stage and switch screens
// Intermission button should just switch screens

export const STAGE_INTERMISSION: Intermission[] = [
  {
    text: 'VOID Cat',
    buttonText: 'Start',
  },
  {
    text: 'Nice job!',
    buttonText: 'Continue to Day 2',
  },
  {
    text: "Don't give up!",
    buttonText: 'Continue to Day 3',
  },
  {
    text: '...vast endless void...',
    buttonText: 'Continue to Day 4',
  },
  {
    text: 'soon...',
    buttonText: 'Continue to last day',
  },
  {
    text: 'END',
    buttonText: 'thank you for playing',
    isButtonDisabled: true,
  },
];

export function updateTextAndButtonText(currentStage: number) {
  const p = document.querySelector('#sit');
  const button: HTMLButtonElement | null = document.querySelector('#sib');

  if (!p || !button) return;

  const { text, buttonText, isButtonDisabled } =
    STAGE_INTERMISSION[currentStage];

  p.innerHTML = text;

  if (isButtonDisabled) {
    button.remove();
  } else {
    button.innerHTML = buttonText;
  }
}
