import { textImage, textMatcher } from './assets';

const textHeight = 7;
const textWidth = 5;
const widthTable = [".'i", ',lj', 'f', 'abcdeghknopqrstuxyz'];

export function displayString(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  str: string,
  size: number = 3,
  image = textImage,
) {
  ctx.save();
  str.split('').reduce((xOffset, c, i) => {
    let index = textMatcher.indexOf(c);
    const foundWidth = widthTable.findIndex((cs) => cs.includes(c)) + 1;
    const width = foundWidth || textWidth;
    const offset = index * textWidth + Math.floor((textWidth - width) / 2);

    const yOffset = c === ',' ? size : 'gjpqy'.includes(c) ? (size * 4) / 2 : 0;
    ctx.drawImage(image, 0 + offset, 0, width, textHeight, x + xOffset, y + yOffset, width * size, textHeight * size);
    return xOffset + (width + 1) * size;
  }, 0);
  ctx.restore();
}

export function getTextRealSizes(str: string, size: number) {
  const strWidth = str.split('').reduce((res, c) => {
    const foundWidth = widthTable.findIndex((cs) => cs.includes(c)) + 1;
    return res + (foundWidth || textWidth);
  }, 0);
  return {
    width: (strWidth + str.length - 1) * size,
    height: textHeight * size,
  };
}
