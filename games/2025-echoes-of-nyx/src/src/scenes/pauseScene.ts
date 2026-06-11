import { gameSym, startSym } from '.';
import { treatImage } from '../assets';
import AudioEngine from '../AudioEngine';
import { darkBackground, globalVolume, levelLocalStorageKey } from '../config';
import Game from '../Game';
import { UiScene } from '../ui-elements/Scene';
import { UiButton } from '../ui-elements/UiButton';
import { UiImage } from '../ui-elements/UiImage';
import { UiList } from '../ui-elements/UiList';
import { UiText } from '../ui-elements/UiText';
import { getMuteStatus } from '../utils';

export const pauseScene = new UiScene(true, `${darkBackground}ba`);
const scenelist = new UiList(0, 0, [true, true]);

const title = new UiText(0, 0, 'Pause', 3, [true, false]);
title.inverted = 1;

const infoList = new UiList(0, 0, [true, false], 'row');
const buttonList = new UiList(0, 0, [true, false]);

const resumeButton = new UiButton(0, 0, 'Resume', [true, false]);
resumeButton.onClick = () => {
  Game.instance.unPause();
};

const muteButton = new UiButton(0, 0, getMuteStatus(), [true, false]);
muteButton.onClick = () => {
  AudioEngine.instance.volume = AudioEngine.instance.volume ? 0 : globalVolume;
  muteButton.text = getMuteStatus();
  muteButton.update();
  muteButton.isPressed = false;
};

const quitButton = new UiButton(0, 0, 'Quit', [true, false]);
quitButton.onClick = () => {
  AudioEngine.instance.stopBgMusic();
  Game.instance.started = false;
  Game.instance._currentLvl = parseInt(localStorage.getItem(levelLocalStorageKey) ?? '0');
  Game.instance.reset();
  Game.instance.loadScene(startSym);
};

const skipButton = new UiButton(0, 0, 'Skip', [true, false]);
skipButton.onClick = () => {
  Game.instance.unPause();
  Game.instance.validateLvl();
};

scenelist.add(title, infoList, buttonList);

pauseScene.add(scenelist);

pauseScene.onLoad = async () => {
  buttonList.elements = [];
  infoList.elements = [];
  const world = Math.floor(Game.instance.currentLvl / 5) + 1;
  const level = (Game.instance.currentLvl % 5) + 1;
  const text = new UiText(0, 0, `Level ${world}-${level}`, 3, [false, true]);
  text.inverted = 1;

  const treatInfo = new UiList(0, 0, [false, true], 'row', 8);
  const treatUiImage = new UiImage(0, 0, 3, treatImage, [false, true]);
  const treatCounter = new UiText(0, 0, Game.instance.treatCount.toString(), 3, [false, true]);
  treatCounter.inverted = 1;
  treatInfo.add(treatUiImage, treatCounter);
  infoList.add(text, treatInfo);
  infoList.update();

  buttonList.add(resumeButton, muteButton, quitButton);
  buttonList.add(skipButton);
  buttonList.update();
};
