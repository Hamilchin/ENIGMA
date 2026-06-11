import { overlap } from '@lib/utils/misc';

import { StaticEntity } from './StaticEntity';

/**
 * @type {FPowerBase}
 */
export function PowerBase(name, texture) {
	const o = StaticEntity(name, texture);
	const self = Object.assign(o, /** @type {TPowerBase} */({
		name,
		type: 'power',
		flipH: 1,
		sx: 1,
		sy: 1,
		vx: 0,
		vy: 0,
		scx: 1,
		vsPlatforms(colliders) {
			if (!self.allowHit) {
				return;
			}

			for (let i=0; i<colliders.length; i++) {
				if (!self.active) {
					break;
				}

				const platform = colliders[i];
				const r1 = self.body;
				const r2 = platform;
				const hit = overlap(r1, r2);

				if (hit) {
					self.onHitPlatform(platform);
					self.kill();
				}
			}
		},
		onHitPlatform(platform) {
			//
		},
	}));

	self.attachProps();

	return self;
}
