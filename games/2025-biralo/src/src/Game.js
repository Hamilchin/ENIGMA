import { Keyboard } from '@lib/inputs';
import { CanvasLayers } from '@lib/render';
import { SceneManager } from '@lib/scene';
import { Ticker } from '@lib/ticker';
import { killTimers, updateTimers } from '@lib/timer';
import { LEVEL1DATA } from 'media/level1Data';
import { LEVEL2DATA } from 'media/level2Data';
import { LEVEL3DATA } from 'media/level3Data';
import { LEVEL4DATA } from 'media/level4Data';
import { LEVEL5DATA } from 'media/level5Data';
import { LEVEL6DATA } from 'media/level6Data';

import { GAME_HEIGHT, GAME_WIDTH } from './const';
import { ActorPool } from './entities/ActorPool';
import { PowerPool } from './entities/PowerPool';
import { SfxPool } from './entities/SfxPool';
import { Resizer } from './Resizer';
import { Level, LevelTilemap } from './scenes/Level';
import { Sound } from './Sound';
import { store } from './Store';

let initiated = false;

export const btn = Keyboard({
	left: 'a',
	right: 'd',
	jump: 'k',
	attack: 'j',
	restart: 'r',
},() => {
	if (initiated) {
		return;
	}
	initiated = true;
	Sound.music();
});

export const ticker = Ticker();

const layerIds = ['bg', 'fg'];

/**
 * @type {TRoot}
 */
export const root = (() => {
	const createLevel = (levelData) => {
		const tiles = levelData[0];
		const LevelFn = () => {
			return Level(levelData);
		};
		const LevelTilemapFn = () => {
			return LevelTilemap(tiles.data, tiles.gridCellsX);
		};
		return [LevelFn, LevelTilemapFn];
	};

	const levels = [
		LEVEL1DATA,
		LEVEL2DATA,
		LEVEL3DATA,
		LEVEL4DATA,
		LEVEL5DATA,
		LEVEL6DATA,
	].map(data => createLevel(data));

	const scenes = [
		// maybe menu
		[null, null],
		// levels
		...levels
	];

	store.endSceneIndex = levels.length;

	const layers = CanvasLayers();
	const bgSceneManager = SceneManager();
	const fgSceneManager = SceneManager();
	const actorPool = ActorPool(); 
	const sfxPool = SfxPool(); 
	const powerPool = PowerPool(); 

	/**
	 * @type {TRootSceneManager}
	 */
	const scene = {
		set(sceneIndex) {
			const [bg, fg] = scenes[sceneIndex];
			fgSceneManager.clear();
			bgSceneManager.clear();

			if (bg) {
				fgSceneManager.set(bg);
			}
			if (fg) {
				bgSceneManager.set(fg);
			}

			store.sceneIndex = sceneIndex;
		},
		render([bg, fg]) {
			bgSceneManager.render(bg.ctx);
			fgSceneManager.render(fg.ctx);
		},
		update() {
			fgSceneManager.update();
		},
		reload() {
			killTimers();
			store.reset();
			scene.set(store.sceneIndex);
		},
		next() {
			killTimers();
			store.sceneIndex += 1;
			scene.set(store.sceneIndex);
		}
	};

	return {
		scene,
		layers,
		actorPool,
		sfxPool,
		powerPool,
	};
})();

export function Game() {
	const sceneManager = root.scene;
	const layers = root.layers;

	const canvasLayers = layerIds.map(id => {
		const layer = layers.add(id, GAME_WIDTH, GAME_HEIGHT);
		document.body.appendChild(layer.canvas);
		return layer;
	});

	ticker.add('update', () => {
		updateTimers();
		sceneManager.update();
	});
	ticker.add('render', () => {
		sceneManager.render(canvasLayers);
	});
	sceneManager.reload();
	Resizer(canvasLayers, {width: GAME_WIDTH, height: GAME_HEIGHT});
}
