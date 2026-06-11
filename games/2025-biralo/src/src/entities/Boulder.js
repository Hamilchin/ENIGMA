import { WaitTimer } from '@lib/timer';
import { overlap } from '@lib/utils/misc';
import { BOULDER } from 'media/miscAssets';

import { Actor } from './Actor';

/**
 * @type {FBoulder}
 */
export function Boulder(name, width, height, color) {
	/**
	 * @type {TBoulderState}
	 */
	let currentState;

	const o = Actor(name, width, height, color);
	const _detach = o.detach;
	const _kill = o.kill;
	const _addTo = o.addTo;
	const _update = o.update;
	let started = false;
	let stopped = false;
	const self = Object.assign(
		o,
		/** @type {TBoulder}*/ ({
			startTime: 4,
			type: 'boulder',
			sx: 0.3,
			addTo(group, index) {
				_addTo(group, index);
				self.setVisible(false, true);
			},
			update() {
				_update();
				updateMovement();
			},
			changeState(state) {
				currentState = state;

				switch (state) {
				case 'idle':
					doIdle();
					break;
				case 'roll':
					doRoll();
					break;
				case 'stop':
					doIdle(true);
					break;
				}
			},
			kill() {
				_kill();
				self.setVisible(false, false);
			},
			detach() {
				if (!self.parent) {
					return;
				}
				_detach();
			},
			start() {
				if (!started) {
					started = true;
				}

				const time = started ? 0.5 : self.startTime;
				WaitTimer(time, startRoll);
			},
			vsReversers(colliders) {
				for (let i = 0; i < colliders.length; i++) {
					const reverser = colliders[i];
					const r1 = self.body;
					const r2 = reverser;
					const hit = overlap(r1, r2);

					if (hit) {
						self.flipH = reverser.side;
						break;
					}
				}
			},
			vsStoppers(colliders) {
				if (stopped) {
					return;
				}

				for (let i = 0; i < colliders.length; i++) {
					const stopper = colliders[i];
					const r1 = self.body;
					const r2 = stopper;
					const hit = overlap(r1, r2);

					if (hit) {
						self.changeState('stop');
						break;
					}
				}
			},
			onTrigger(from, delay) {
				self.reserved = false;
				self.startTime = delay;
				// call this function when triggering
				self.changeState('idle');
			},
			onLanded() {
				self.addSfx('impactDusts');
			}
		}),
	);

	self.addSkin({
		// key should match TBoulderSkinType
		roll: { texture: BOULDER },
	});
	// self.skin.stop();

	initState();

	function updateMovement() {
		if (self.moving) {
			self.vx = self.flipH * self.sx;
		} else {
			self.vx = 0;
		}

		if (!self.grounded && started) {
			self.changeState('idle');
		}
	}

	function initState() {
		self.skin.stop();
		self.moving = false;
	}

	function doIdle(stop=false) {
		initState();

		if (!stop) {
			self.start();
		} else {
			stopped = true;
		}
	}

	function startRoll() {
		self.changeState('roll');
	}

	function doRoll() {
		self.moving = true;
		self.skin.play('roll');
	}

	return self;
}

