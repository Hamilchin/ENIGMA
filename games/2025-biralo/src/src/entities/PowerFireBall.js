import { root } from '@game/Game';
import { overlap } from '@lib/utils/misc';

import { PowerBase } from './PowerBase';

/**
 * @type {FPowerBase}
 */
export function PowerFireBall(name, texture) {
	const o = PowerBase(name, texture);
	const _update = o.update;
	const _kill = o.kill;
	const self = Object.assign(o,  /** @type {Partial<TPowerBase>}*/({
		toVx: true,
		update() {
			if (!self.active) {
				return;
			}
			_update();

			if (self.toVx) {
				self.vx = self.flipH * self.sx;
				self.x += self.vx;
			}
			if (self.toVy) {
				self.vx = 0;
				self.vy = self.sy;
				self.y += self.vy;
			}
		},
		onHitPlatform(platform) {
			addSfx();
		},
		vsPlayer(player) {
			if (!self.active || !player.active) {
				return;
			}

			const r1 = self.body;
			const r2 = player.body;
			const hit = overlap(r1, r2, 0.5, 0.5);

			if (hit) {
				player.receiveDamage(1, self);
			}
		},
		kill() {
			self.toVx = true;
			self.toVy = false;
			_kill();
		},
	}));

	self.allowHit = true;
	self.addBody();
	self.addSkin();

	function addSfx() {
		const mc = root.sfxPool.get('fireballImpact');

		if (!mc) {
			return;
		}

		mc.x = self.flipH === -1 ? self.x + self.width : self.x;
		mc.y = self.y;

		mc.scx = self.flipH; 
		mc.start();

		self.parent.add(mc);
	}

	return self;
}
