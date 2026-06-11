import { startSym } from '.';
import { treatImage } from '../assets';
import { backgroundShift } from '../background';
import { worlds } from '../config';
import Game from '../Game';
import { UiScene } from '../ui-elements/Scene';
import { UiButton } from '../ui-elements/UiButton';
import { UiList } from '../ui-elements/UiList';
import { UiText } from '../ui-elements/UiText';

export function getLevelScene(): UiScene {
  const levelScene = new UiScene();
  const sceneList = new UiList(0, 0, [true, true]);
  sceneList.inverted = Game.instance.currentLvl > backgroundShift ? 0 : 1;

  const text = new UiText(0, 0, 'Choose a level', 5, [true, false]);

  const worldList = new UiList(0, 0, [true, false]);
  let lvlCount = 0;
  worlds.forEach((levels, worldNb) => {
    const levelList = new UiList(0, 0, [false, false], 'row');
    const worldName = new UiText(0, 0, `World ${worldNb + 1}`, 2, [false, true]);
    levelList.add(worldName);
    levels.forEach((level, index) => {
      const lvlButton = new UiButton(
        0,
        0,
        `${worldNb + 1}-${index + 1}`,
        [false, true],
        treatImage,
        Game.instance.treatsFound.indexOf(lvlCount) === -1,
      );
      if (lvlCount > Game.instance.currentLvl) {
        lvlButton.disabled = true;
      }
      const i = lvlCount;
      lvlButton.onClick = () => {
        Game.instance.restart(i);
      };
      levelList.add(lvlButton);
      lvlCount++;
    });
    worldList.add(levelList);
  });

  const backButton = new UiButton(0, 0, 'Back', [true, false]);
  backButton.onClick = () => {
    Game.instance.loadScene(startSym);
  };
  sceneList.add(text, worldList, backButton);
  levelScene.add(sceneList);
  return levelScene;
}
