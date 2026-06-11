import { treatImage } from '../assets';
import { darkBackground } from '../config';
import { UiList } from '../ui-elements/UiList';
import { UiScene } from '../ui-elements/Scene';
import { UiText } from '../ui-elements/UiText';
import { UiImage } from '../ui-elements/UiImage';
import { UiButton } from '../ui-elements/UiButton';
import Game from '../Game';
import { startSym } from '.';
import { backgroundShift } from '../background';

// End Scene
export const scene = new UiScene();
const sceneList = new UiList(0, 0, [true, true], 'column');
sceneList.inverted = 1;

const endMessage = new UiText(0, 0, 'The End', 12, [true, false]);
const restartButton = new UiButton(0, 0, 'Back to menu', [true, false]);

restartButton.onClick = () => {
  Game.instance.loadScene(startSym);
};
restartButton.inverted = 0;

scene.onLoad = () => {
  sceneList.inverted = Game.instance.currentLvl > backgroundShift ? 0 : 1;
};

const treatLayout = new UiList(0, 0, [true, false], 'row');
const treatUiImage2 = new UiImage(8, 6, 3, treatImage, [false, true]);
treatUiImage2.inverted = 0;

export const treatEndCounter = new UiText(0, 16, '0', 5, [false, true]);
treatLayout.add(treatUiImage2, treatEndCounter);
sceneList.add(endMessage, treatLayout, restartButton);
scene.add(sceneList);
