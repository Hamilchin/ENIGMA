import { root } from '@game/Game';
import { Sound } from '@game/Sound';
import { IntervalTimer, WaitTimer } from '@lib/timer';
import { FROG_ATTACK, FROG_FLY, FROG_IDLE, FROG_JUMP } from 'media/frogAssets';

import { Actor } from './Actor';

/**
 * @type {FFrog}
 */
export function Frog(name, width, height, color) {
	const o = Actor(name, width, height, color);
	const _detach = o.detach;
	const _kill = o.kill;
	const _addTo = o.addTo;
	const _update = o.update;
	const _reset = o.reset;

	/**
	 * @type {TFrogState}
	 */
	let currentState;
	let jumped = false;
	let fsmIndex = -1;
	let onWallRegistered = false;
	let flyingUp = false;
	let flyingSide = false;
	let damaged = false;
	/**
	 * @type {TTimer | null}
	 */
	let itimer = null;
	/**
	 * @type {TFrogState[]}
	 */
	const fsm = [
		'idle',
		'attack',
		'idle',

		'jump',

		'idle',
		'attack',
		'idle',

		'fly'
	];
	const self = Object.assign(
		o,
		/** @type {TFrog}*/ ({
			type: name,
			addTo(group, index) {
				_addTo(group, index);
				self.setVisible(false, true);
			},
			update() {
				_update();

				if (self.jumping || flyingSide) {
					self.vx = self.flipH * 0.6;
				}

				if (flyingUp) {
					self.vx = 0;
				}

				if (self.onWall && !onWallRegistered) {
					onWallRegistered = true;
				}

				if (flyingSide) {
					self.vy = 0;

					if (onWallRegistered) {
						self.vx = 0;
						self.g = self.dg;
					}
				}

				if (self.grounded) {
					if (self.jumping) {
						self.jumping = false;

						if (onWallRegistered) {
							self.doFlipH();
							nextFsm(true);
						} else {
							if (!jumped) {
								self.changeState('jump');
							}
						}
					}
					if (flyingSide && onWallRegistered) {
						nextFsm();
					}
					self.vx = 0;
					self.vy = 0;
				}

				self.skin.alpha = Number(!damaged);

			},
			changeState(state) {
				self.attacking = false;
				currentState = state;

				switch (state) {
				case 'idle':
					doIdle();
					break;
				case 'attack':
					doAttack();
					break;
				case 'fly':
					doFly();
					break;
				case 'jump':
					doJump();
					break;
				}
			},
			kill() {
				_kill();
				self.setVisible(false, false);
				self.addSfx('blast');
				Sound.play('punch');
				self.detach();
				reset();

				WaitTimer(3, () => {
					root.scene.next();
				});
			},
			detach() {
				reset();

				if (!self.parent) {
					return;
				}
				_detach();
			},
			start() {
				nextFsm(true);
			},
			onDamage() {
				if (damaged) {
					return;
				}

				// blink like effect
				damaged = true;
				WaitTimer(0.1, () => {
					damaged = false;
				});
				WaitTimer(0.2, () => {
					damaged = true;
				});
				WaitTimer(0.3, () => {
					damaged = false;
				});
			},
			reset() {
				reset();
				_reset();
			},
			weak() {
				return self.active && !self.attacking && self.g; 
			},
			smash() {
				return self.active && self.jumping && self.falling; 
			},
			onLanded() {
				self.addSfx('impactDusts');
				Sound.play('landed');
			}
		}),
	);

	self.addSkin({
		// key should match TFrogSkinType
		idle: { texture: FROG_IDLE },
		attack: { texture: FROG_ATTACK },
		jump: { texture: FROG_JUMP, loop: false },
		fly: { texture: FROG_FLY },
	});

	self.skin.stop();

	function updateFsmIndex() {
		fsmIndex += 1;

		if (fsmIndex > fsm.length - 1) {
			fsmIndex = 0;
		}
	}

	function nextFsm(change=false) {
		onWallRegistered = false;
		flyingUp = false;
		flyingSide = false;
		killTimers();

		updateFsmIndex();
		const nextState = fsm[fsmIndex];

		if (change) {
			self.changeState(nextState);
		}

		return nextState;
	}

	function doIdle() {
		self.skin.play('idle');
		WaitTimer(3, () => {
			nextFsm(true);
		});
	}

	function doAttack() {
		fsmIndex += 1;
		self.attacking = true;
		self.skin.play('attack');
		addPower();

		WaitTimer(0.5, () => {
			nextFsm(true);
		});
	}

	function doFly() {
		flyingUp = true;

		jump('fly', 0, 0.5);

		flyAttack();

		WaitTimer(2, () => {
			flyingUp = false;
			flyingSide = true;
		});
	}

	function flyAttack() {
		itimer = IntervalTimer(1, () => {
			addPower(false, true);
		});
	}

	function doJump() {
		jumped = true;

		self.skin.play('idle');

		WaitTimer(1, () => {
			jump();
		});
	}

	function jump(anim='jump', grav=self.jg, force=3) {
		jumped = false;
		self.jumping = true;
		self.grounded = false;
		self.g = grav;
		self.vy -= force;

		if (!self.moving) {
			self.skin.play(anim);
		}
	}

	function addPower(toVx=true, toVy=false) {
		const mc = root.powerPool.get('fireball');

		if (!self.active || !mc) {
			return;
		}

		mc.addTo(self.parent);
		mc.x = self.x + width/2;
		mc.y = self.y + self.body.width/2;
		mc.flipH = self.flipH;
		mc.toVx = toVx;
		mc.toVy = toVy;
		mc.play();
		Sound.play('punch');
	}

	function killTimers() {
		if (itimer) {
			itimer.kill();
		}

		itimer = null;
	}

	function reset() {
		killTimers();
		jumped = false;
		onWallRegistered = false;
		flyingUp = false;
		flyingSide = false;
		fsmIndex = -1;
	}

	return self;
}

