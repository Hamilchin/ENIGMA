import { overlap } from '@lib/utils/misc';

import { PowerBase } from './PowerBase';

/**
 * @type {FPowerBase}
 */
export function PowerTailWhip(name, texture) {
	const o = PowerBase(name, texture);
	const _update = o.update;
	const self = Object.assign(o,  /** @type {Partial<TPowerBase>}*/({
		update() {
			if (!self.active) {
				return;
			}
			_update();

			self.skin.scx = self.body.scx;

			if (self.body.scx < 0) {
				self.skin.x = self.x + self.skin.width;
			} else {
				self.skin.x = self.x;
			}
			self.skin.y = self.body.y - self.skin.height + self.body.height;
		},
		onComplete(name) {
			self.kill();
		},
		vsPlatforms() {},
		vsTotems(totems) {
			for (let i=0; i< totems.length; i++) {
				const totem = totems[i];

				const r1 = self.body;
				const r2 = totem.body;
				const hit = overlap(r1, r2, 0.8, 0.8);

				if (hit && totem.active && allowHit()) {
					totem.receiveDamage(1, self);
				}
			}
		},
		vsTorches(torches, player) {
			for (let i=0; i< torches.length; i++) {
				const torch = torches[i];

				const r1 = self.body;
				const r2 = torch.body;
				const hit = overlap(r1, r2, 0.8, 0.8);

				if (hit && allowHit() && !player.swung) {
					player.doSwing();
				}
			}
		},
		vsFrog(frog) {
			if (!frog) {
				return;
			}
			const r1 = self.body;
			const r2 = frog.body;
			const hit = overlap(r1, r2);

			if (hit && frog.weak() && allowHit()) {
				frog.receiveDamage(1, self);
			}
		}
	}));

	self.loop = false;
	self.addBody();
	self.addSkin();
	self.body.height = 8;

	function allowHit() {
		return self.skin.currentFrame >= self.skin.totalFrames - 1;
	}

	return self;
}
