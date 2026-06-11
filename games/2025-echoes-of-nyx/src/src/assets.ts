import treat from '/assets/treat.webp';
import text from '/assets/text.webp';
import cats from '/assets/cats.webp';
import cardboard from '/assets/cardboard.webp';
import btn from '/assets/btn.webp';

export const canvas = document.querySelector('canvas') as HTMLCanvasElement;

export const textMatcher = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#-/ .,'";

export const treatImage = new Image(10, 10);
treatImage.src = treat;

export const imageTextHeight = 7;
export const imageTextWidth = 5;

const textImage = new Image(textMatcher.length * imageTextWidth, imageTextHeight);
textImage.src = text;

export const catImageWidth = 20;
export const catImageHeight = 20;

export const catImage = new Image(catImageWidth * 21, catImageHeight);
catImage.src = cats;

export const cardBoardImage = new Image(40, 40);
cardBoardImage.src = cardboard;

export const buttonWidth = 15;
export const buttonHeight = 15;
export const buttonSideWidth = Math.floor(buttonWidth / 2);

export const btnImage = new Image(buttonWidth, buttonHeight);
btnImage.src = btn;

export { textImage };
