import { treatImage } from '../assets';
import { backgroundShift, instructions } from '../background';
import { getGridRealHeight, getSquareSize } from '../config';
import Game from '../Game';
import { UiScene } from '../ui-elements/Scene';
import { UiImage } from '../ui-elements/UiImage';
import { UiList } from '../ui-elements/UiList';
import { UiText } from '../ui-elements/UiText';

export const gameScene = new UiScene(true, 'transparent');
const treatInfo = new UiList(
  () => Math.round(getSquareSize() / 2),
  () => Math.round(getSquareSize() / 2),
  [false, false],
  'row',
  8,
);
const treatUiImage = new UiImage(0, 0, 2, treatImage, [false, true]);
export const treatCounter = new UiText(0, 0, '0', 3, [false, true]);
treatInfo.add(treatUiImage, treatCounter);

const instructionList = new UiList(0, getGridRealHeight() / 4, [true, false]);

gameScene.onLoad = () => {
  treatCounter.inverted = Game.instance.currentLvl > backgroundShift ? 0 : 1;
  const controls = new UiImage(0, 0, 3, instructions, [true, true]);
  instructionList.elements = [];
  if (Game.instance.currentLvl === 0) {
    instructionList.add(controls);
  }
  instructionList.update();
};

gameScene.add(instructionList, treatInfo);
