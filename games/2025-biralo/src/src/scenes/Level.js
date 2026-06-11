import { LAYERS } from '@game/const';
import { Alice } from '@game/entities/Alice';
import { Boulder } from '@game/entities/Boulder';
import { Reverser } from '@game/entities/Reverser';
import { StaticEntity } from '@game/entities/StaticEntity';
import { Trigger } from '@game/entities/Trigger';
import { btn, root } from '@game/Game';
import { Text } from '@game/GameUtils';
import { store } from '@game/Store';
import { Rectangle } from '@lib/display';
import { Tilemap } from '@lib/display/Tilemap';
import { Scene } from '@lib/scene';
import { FALLING_TILES, FIREFLIES, TORCH } from 'media/miscAssets';
import { TILES } from 'media/tilesAssets';

/**
 * @type {FLevel}
 */
export function Level(levelData) {
	const actorPool = root.actorPool;
	const sfxPool = root.sfxPool;
	const powerPool = root.powerPool;
	const o = Scene();
	const _destroy = o.destroy;

	const self = Object.assign(o, /** @type {TScene}*/({
		destroy() {
			actorPool.detach();
			sfxPool.detach();
			powerPool.detach();
			_destroy();
		}
	}));

	const stage = self.stage;
	/**
	 * @type {TRect[]}
	 */
	const platforms = [];
	/**
	 * @type {TRect[]}
	 */
	let exits = [];
	/**
	 * @type {TTotem[]}
	 */
	const totems = [];
	/**
	 * @type {TStaticEntity[]}
	 */
	const torches = [];
	/**
	 * @type {TBoulder[]}
	 */
	const boulders = [];
	/**
	 * @type {TReverser[]}
	 */
	const reversers = [];
	/**
	 * Boulder stoppers
	 * @type {TRect[]}
	 */
	const stoppers = [];
	/**
	 * @type {TTrigger[]}
	 */
	const triggers = [];
	/**
	 * @type {TRect[]}
	 */
	const hurts = [];
	/**
	 * @type {TBitmapFont[]}
	 */
	const texts = [];
	/**
	 * @type {TPlayer}
	 */
	let player;
	/**
	 * @type {TFrog}
	 */
	let frog;

	/**
	 * @type {TStaticEntity}
	 */
	let fireflies;
	/**
	 * @type {TStaticEntity}
	 */
	let fallingTiles;
	/**
	 * @type {TAlice}
	 */
	let alice;

	levelData.forEach((layer, i) => {
		if (i) {
			const layerName = layer.name;

			const entities = layer.entities;

			entities.forEach((entity, j) => {
				const entityname = entity.name;
				const w = entity.width ?? TILES.w;
				const h = entity.height ?? TILES.h;
				const x = entity.x;
				const y = entity.y;
				const eValues = entity.values;
				const nodes = /** @type {TNodes} */ (entity.nodes);

				/**
				 * @typedef {object} TRectProp
				 * @property {string} name
				 * @property {number} [ w ]
				 * @property {number} [ h ]
				 * @property {number} [ x ]
				 * @property {number} [ y ]
				 * @property {string} [ color ]
				 * @param {TRectProp} props 
				 * @returns {TRect}
				 */
				const createRectEntity = (props) => {
					const rect = Rectangle(0, 0, props.w ?? w, props.h ?? h, props.color);
					rect.x = props.x ?? x;
					rect.y = props.y ?? y;
					rect.name = props.name;
					// rect.alpha = 0.5;
					rect.visible = false;
					stage.addAt(rect, LAYERS.fg);
					return rect;
				};

				/**
				 * @param {string} name
				 * @param {TSpriteTexture} texture
				 * @param {number} layerIndex
				 * @param {boolean} playing
				 * @param {boolean} [ loop ]
				 * @returns {TStaticEntity}
				 */
				const createStaticEntity = (name, texture, layerIndex, playing, loop) => {
					const e = StaticEntity(name, texture);
					e.addBody();
					e.addSkin();
					e.attachProps();
					e.setBody(w, h);
					e.x = x;
					e.y = y;
					e.loop = loop ?? e.loop;
					if (playing) {
						e.play();
					} else {
						e.stop(0);
					}
					// e.skin.alpha = 0.6;
					// e.body.alpha = 0.5;
					// e.body.visible = true;
					e.addTo(stage, layerIndex);
					return e;
				};

				if (layerName === 'entities') {
					if (entityname === 'player') {
						player = actorPool.getPlayer();

						player.reset();
						player.setBody(w, h);
						player.x = x;
						player.y = y;
						// player.skin.alpha = 0.6;
						// player.body.alpha = 0.5;
						player.body.visible = true;
						player.addTo(stage, LAYERS.player);
					}
					if (entityname === 'totem') {
						const eFlipH = /** @type {number} */(eValues['flipH']);
						const attackTime = /** @type {number} */(eValues['attackTime']);
						const totem = actorPool.getTotem();

						totem.reset();
						totem.setBody(w, h);
						totem.flipH = eFlipH;
						totem.attackTime = attackTime;
						totem.x = x;
						totem.y = y;
						// totem.body.alpha = 0.5;
						totem.changeState('idle');
						// totem.body.visible = false;
						totem.addTo(stage, LAYERS.enemies);
						// totem.addTo(stage);
						totems.push(totem);
					}
					if (entityname === 'frog') {
						frog = actorPool.getFrog();

						frog.reset();
						frog.setBody(w, h);
						frog.flipH = -1;
						frog.health = 10;
						frog.x = x;
						frog.y = y;
						// frog.body.alpha = 0.5;
						frog.start();
						// frog.body.visible = false;
						frog.addTo(stage, LAYERS.enemies);
					}
					if (entityname === 'boulder') {
						const eFlipH = /** @type {number} */(eValues['flipH']);
						const name = entityname + j;
						const boulder = Boulder(name, w, h);

						boulder.flipH = eFlipH;
						boulder.x = x;
						boulder.y = y;
						// trigger manually
						boulder.reserved = true;
						// boulder.changeState('idle');
						// boulder.body.alpha = 0.5;
						// boulder.body.visible = true;
						boulder.addTo(stage, LAYERS.enemies);
						boulders.push(boulder);
					}

					if (entityname === 'torch') {
						const torch = createStaticEntity(entityname, TORCH, LAYERS.bg, true);
						torches.push(torch);
					}
					if (entityname === 'fireflies') {
						fireflies = createStaticEntity(entityname, FIREFLIES, LAYERS.fg, true);
					}
					if (entityname === 'alice') {
						alice = Alice(w, h);
						alice.x = x;
						alice.y = y;
						// alice.skin.alpha = 0.6;
						// alice.body.alpha = 0.5;
						alice.body.visible = false;
						alice.addTo(stage, LAYERS.fg);
					}
					if (entityname === 'fallingTiles') {
						fallingTiles = createStaticEntity(entityname, FALLING_TILES, LAYERS.bg, false, false);
					}
					if (entityname === 'hurt') {
						const name = entityname + j;
						hurts.push(createRectEntity({name}));
					}
					if (entityname === 'exit') {
						const name = entityname + j;
						exits.push(createRectEntity({name}));
					}
				}
				if (layerName === 'triggers' &&  entityname === 'trigger') {
					const delay = /** @type {number} */(eValues['delay']);
					const name = entityname + j;
					const trigger = Trigger(nodes, w, h);
					trigger.name = name;
					trigger.x = x;
					trigger.y = y;
					trigger.delay = delay; 
					trigger.visible = false;
					stage.addAt(trigger, LAYERS.fg);
					triggers.push(trigger);
				}
				if (layerName === 'reversers' &&  entityname === 'reverser') {
					const side = /** @type {number} */(eValues['side']);
					const name = entityname + j;
					const reverser = Reverser(name, x, y, w, h);
					reverser.side = side; 
					reverser.visible = false;
					stage.addAt(reverser, LAYERS.fg);
					reversers.push(reverser);
				}
				if (layerName === 'stoppers' &&  entityname === 'stopper') {
					const name = entityname + j;
					stoppers.push(createRectEntity({name}));
				}
				if (layerName === 'collision' &&  entityname === 'platform') {
					const name = entityname + j;
					platforms.push(createRectEntity({name}));
				}
				if (layerName === 'texts') {
					const txt = Text(eValues['text']);
					txt.name = eValues['name'];
					txt.visible = eValues['visible'];
					txt.x = x + w/2;
					txt.y = y;

					stage.addAt(txt, LAYERS.fg);
					texts.push(txt);
				}
			});
		}
	});

	self.update = () => {
		store.loaded = true;
		updateEntities();
	};

	const _render = o.render;

	self.render = ctx => {
		_render(ctx);
	};

	btn.is('restart').onDown(() => {
		if (store.gWon) {
			store.reset();
			root.scene.set(1);
		}
	});

	function updateEntities() {
		if (isPlayerActive()) {
			player.update();

			player.vsPlatforms(platforms);
			player.vsHurts(hurts);
			player.vsExits(exits);
			player.vsBoulders(boulders);
			player.vsTriggers(triggers, boulders, texts);

			if (alice) {
				const callback = () => {
					texts.forEach(text => text.visible = true);
				};
				player.vsAlice(alice, store.endSceneIndex ? callback : null);
			}
			if (fallingTiles) {
				player.vsFallTiles(fallingTiles);
			}
			if (frog) {
				player.vsFrog(frog);
			}

			totems.forEach((totem) => {
				if (totem.active) {
					totem.update();
					totem.vsPlatforms(platforms);
				}
			});
		}

		if (fireflies) {
			fireflies.update();
		}
		if (fallingTiles) {
			fallingTiles.update();
		}
		if (alice) {
			alice.update();
		}

		if (frog && frog.active) {
			frog.update();
			frog.vsPlatforms(platforms);
		}

		torches.forEach(torch => {
			torch.update();
		});
		boulders.forEach(boulder => {
			boulder.update();
			boulder.vsPlatforms(platforms);
			boulder.vsReversers(reversers);
			boulder.vsStoppers(stoppers);
		});
		sfxPool.update();
		powerPool.update(
			stage,
			platforms,
			totems,
			player,
			torches,
			frog,
		);
	}

	/**
	 * @type {boolFunc}
	 */
	function isPlayerActive() {
		return player && player.active;
	}

	return self;
}

/**
 * @type {FLevelTilemap}
 */
export function LevelTilemap(tilesData, gridCellsX) {
	const self = Scene();
	const stage = self.stage;

	const t = Tilemap(TILES, tilesData, gridCellsX);
	stage.addAt(t, LAYERS.bg);

	return self;
}
