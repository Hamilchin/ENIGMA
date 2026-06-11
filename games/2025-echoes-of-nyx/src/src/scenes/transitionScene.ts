import { gameSym } from '.';
import { backgroundShift } from '../background';
import Game from '../Game';
import { slowDisplayText } from '../ui-elements/text-animation';
import { UiScene } from '../ui-elements/Scene';
import { UiButton } from '../ui-elements/UiButton';
import { UiList } from '../ui-elements/UiList';
import { UiText } from '../ui-elements/UiText';
import { FPS, getGridRealHeight, getGridRealWidth, getMoveSpeed, gridWidth } from '../config';
import PlayerEntity from '../entities/PlayerEntity';
import BlocEntity from '../entities/BlocEntity';
import { sleep } from '../utils';
import { Aether } from '../entities/Aether';

export async function moveCat(player: PlayerEntity, limit: number) {
  while (player.x < limit) {
    player.update(getMoveSpeed(), 0, true);
    await sleep(1000 / FPS);
  }
  player.update(0);
}

async function defautlCallback(player: PlayerEntity, aeter: Aether) {
  await moveCat(player, getGridRealWidth());
  Game.instance.currentLvl++;
  Game.instance.loadScene(gameSym);
  Game.instance.reset();
}

async function preLoad(player: PlayerEntity, aether: Aether, ground: BlocEntity) {
  await moveCat(player, getGridRealWidth() / 2 - player.width / 2);
}

export function getTransitionScene(
  msg: string,
  btnLabel = 'Continue',
  buttonCallback = defautlCallback,
  onloadCallback = preLoad,
) {
  const player = new PlayerEntity(-2, 1);
  const aether = new Aether(-2, 1);
  const ground = new BlocEntity(0, 0, gridWidth, 1, true);

  const scene = new UiScene(true);
  scene.onRender = (ctx: CanvasRenderingContext2D) => {
    player.render(ctx);
    aether.render(ctx);
    ground.render(ctx);
  };
  const list = new UiList(0, 0, [true, false]);
  const button = new UiButton(0, 0, btnLabel, [true, false]);

  msg.split('\n').forEach((line) => list.add(new UiText(0, 0, line, 3, [true, false])));
  list.add(button);
  list.y = (getGridRealHeight() - list.getRealSize().height) / 2;
  list.x = (getGridRealWidth() - list.getRealSize().width) / 2;

  button.onClick = async () => await buttonCallback(player, aether);
  scene.add(list);

  scene.onLoad = async () => {
    scene.autoRefresh = true;
    player.x = -2;
    player.offsets.x = 0;
    aether.x = -2;
    aether.offsets.x = 0;
    list.inverted = Game.instance.currentLvl > backgroundShift ? 0 : 1;
    list.elements = [];
    await onloadCallback(player, aether, ground);
    await slowDisplayText(list, msg);
    list.add(button);
  };
  return scene;
}
