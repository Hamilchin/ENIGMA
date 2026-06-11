import { LOVE } from 'media/miscAssets';
import {
	BLAST,
	FIRE_BALL_IMPACT_SFX,
	IMPACT_DUSTS_SFX,
} from 'media/sfxAssets';

import { SfxBase } from './SfxBase';

/**
 * @type {FSfxPool}
 */
export function SfxPool() {
	let uid = 0;
	/**
	 * @type {TSfxPoolBasket}
	 */
	const basket = {};
	/**
	 * @type {TSfxPoolUpdaters}
	 */
	const updaters = {};

	/**
	 * @type {TSfxPool}
	 */
	const self = {
		init() {
			addToBasket('impactDusts', { max: 3, pool: [] });
			addToBasket('fireballImpact', { max: 20, pool: [] });
			addToBasket('love', { max: 1, pool: [] });
			addToBasket('blast', { max: 3, pool: [] });

			for (let key in basket) {
				const bname = /** @type {TSfxType}*/ (key);
				const props = basket[bname];
				const max = props.max;
				const pool = props.pool;

				for (let i = 0; i < max; i++) {
					const newName = `${bname}_${i}`;
					switch (bname) {
					case 'impactDusts':
						pool.push(SfxBase(newName, IMPACT_DUSTS_SFX));
						break;
					case 'fireballImpact':
						pool.push(SfxBase(newName, FIRE_BALL_IMPACT_SFX));
						break;
					case 'love':
						pool.push(SfxBase(newName, LOVE, true));
						break;
					case 'blast':
						pool.push(SfxBase(newName, BLAST));
						break;
					}
				}
			}
		},
		update() {
			for (let id in updaters) {
				const mc = updaters[id];
				if (mc.active) {
					mc.update();
				} else {
					delete updaters[id];
				}
			}
		},
		get(name) {
			const pool = basket[name].pool;
			/**
			 * @type {TSfxBase}
			 */
			let mc;
			for (let i = 0; i < pool.length; i++) {
				const _mc = pool[i];

				if (!_mc.active && !_mc.reserved) {
					mc = _mc;
					uid += 1;
					updaters[uid] = mc;
					mc.reserved = true;
					break;
				}
			}

			return mc;
		},
		detach() {
			for (let key in basket) {
				const bname = /** @type {TSfxType}*/ (key);
				const props = basket[bname];
				const pool = props.pool;

				pool.forEach(mc => {
					mc.kill();
				});
			}

			clearUpdaters();
		},
	};

	self.init();

	function clearUpdaters() {
		for (let id in updaters) {
			delete updaters[id];
		}
	}

	/**
	 * @param {TSfxType} name
	 * @param {TSfxPoolStorage} data
	 */
	function addToBasket(name, data) {
		basket[name] = data;
	}

	return self;
}
