import { root } from '@game/Game';
import { Sound } from '@game/Sound';
import { WaitTimer } from '@lib/timer';
import { TOTEM_ATTACK, TOTEM_IDLE } from 'media/miscAssets';

import { Actor } from './Actor';

/**
 * @type {FTotem}
 */
export function Totem(name, width, height, color) {
	/**
	 * @type {TTotemState}
	 */
	let currentState;

	const o = Actor(name, width, height, color);
	const _detach = o.detach;
	const _kill = o.kill;
	const _addTo = o.addTo;
	const self = Object.assign(
		o,
		/** @type {TTotem}*/ ({
			type: name,
			attackTime: 1,
			addTo(group, index) {
				_addTo(group, index);
				self.setVisible(false, true);
			},
			update() {
				self.body.update();
				self.updateSkin();
			},
			changeState(state) {
				currentState = state;

				switch (state) {
				case 'idle':
					doIdle();
					break;
				case 'attack':
					doAttack();
					break;
				}
			},
			vsPlatforms() {},
			kill() {
				_kill();
				self.setVisible(false, false);
				self.addSfx('blast');
				Sound.play('punch');

				WaitTimer(1, self.detach);
			},
			detach() {
				if (!self.parent) {
					return;
				}
				_detach();
			},
		}),
	);

	self.addSkin({
		// key should match TTotemSkinType
		idle: { texture: TOTEM_IDLE, loop: false },
		attack: { texture: TOTEM_ATTACK, loop: false },
	});
	self.skin.stop();

	self.skin.onComplete = (/** @type{TTotemSkinType}*/ animName) => {
		if (animName === 'attack') {
			self.changeState('idle');
			addPower();
		}
	};

	function doIdle() {
		self.skin.play('idle');
		WaitTimer(self.attackTime, doAttack);
	}

	function doAttack() {
		self.skin.play('attack');
	}

	function addPower() {
		const mc = root.powerPool.get('fireball');

		if (!mc) {
			return;
		}

		const offsetX = self.isFlipH() ? 8 : 0;

		mc.addTo(self.parent);
		mc.x = self.x + self.body.width/2 - offsetX;
		mc.y = self.y + self.body.width/2 + 4;
		mc.flipH = self.flipH;
		mc.play();
		Sound.play('punch');
	}

	return self;
}

