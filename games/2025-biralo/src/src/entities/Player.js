import { LAYERS } from '@game/const';
import { btn, root } from '@game/Game';
import { Sound } from '@game/Sound';
import { store } from '@game/Store';
import { WaitTimer } from '@lib/timer';
import { getChildIndex, overlap } from '@lib/utils/misc';
import { PLAYER_ATTACK,PLAYER_FALL, PLAYER_IDLE, PLAYER_JUMP, PLAYER_RUN } from 'media/playerAssets';

import { Actor } from './Actor';

/**
 * @type {FPlayer}
 */
export function Player(name, width, height, color) {
	let didJumpAttack = false;

	const o = /** @type{TActor<TPlayerState>} */(Actor(name, width, height, color));
	const _addTo = o.addTo;
	const _update = o.update;
	const _reset = o.reset;
	const _kill = o.kill;
	const swingSpeedX = 1.6;
	let loved = false;

	const self = Object.assign(
		o,
		/** @type {Partial<TPlayer>}*/ ({
			type: 'player',
			jForce: 2,
			swung: false,
			addTo(group, index) {
				_addTo(group, index);
				self.setVisible(false, true);
			},
			update() {
				_update();

				self.moving = false;

				if (store.gWon) {
					self.changeState('idle');
					return;
				}

				if (btn.is('right').down) {
					self.flipH = 1;
					self.moving = true;
				} else if (btn.is('left').down) {
					self.flipH = -1;
					self.moving = true;
				}

				if (self.moving) {
					self.vx = self.flipH * self.sx;
				} else {
					self.vx = 0;
				}

				if (self.swung) {
					self.vx = self.flipH * swingSpeedX;
				}

				if (self.grounded) {
					self.jumping = false;
					self.swung = false;
					didJumpAttack = false;
				}

				updateMovement();
			},
			vsExits(colliders) {
				for (let i = 0; i < colliders.length; i++) {
					const exit = colliders[i];
					const r1 = self.body;
					const r2 = exit;
					const hit = overlap(r1, r2);

					if (hit) {
						root.scene.next();
						break;
					}
				}
			},
			vsTriggers(triggers, boulders, texts) {
				triggers.forEach((trigger, index) => {
					const r1 = self.body;
					const r2 = trigger;
					const hit = overlap(r1, r2);

					if (hit) {
						let nodes = trigger.nodes;

						boulders.forEach((boulder) => {
							if (!boulder.reserved) {
								return;
							}
							// search matching linked node
							for (let i = 0; i < nodes.length; i++) {
								const pos = nodes[i];
								if (pos.x === boulder.x && pos.y === boulder.y) {
									boulder.onTrigger(trigger, trigger.delay);
									trigger.register(index);
									break;
								}
							}
						});
						texts.forEach((text) => {
							if (text.visible) {
								return;
							}
							// search matching linked node
							for (let i = 0; i < nodes.length; i++) {
								const offsetX = text.width/2;
								const pos = nodes[i];

								if (pos.x + offsetX === text.x && pos.y === text.y) {
									text.visible = true;
									trigger.register(index);
									break;
								}
							}
						});
					}

					if (trigger.isJobDone()) {
						const triggerIndex = getChildIndex(triggers, trigger);
						triggers.splice(triggerIndex, 1);
						trigger.kill();
					}
				});
			},
			vsAlice(alice, callback) {
				if (loved) {
					return;
				}
				const r1 = self.body;
				const r2 = alice.body;
				const hit = overlap(r1, r2, 0.5);

				if (hit && alice.active) {
					alice.doLove();
					doLove();
					if (!store.gWon) {
						store.gWon = true;
					}
					if (callback) {
						callback();
					}
				}
			},
			vsFrog(frog) {
				const r1 = self.body;
				const r2 = frog.body;
				const hit = overlap(r1, r2, 0.8, 0.8);

				if (hit && frog.smash()) {
					self.receiveDamage(1, frog);
				}
			},
			vsFallTiles(tiles) {
				const r1 = self.body;
				const r2 = tiles.body;
				const hit = overlap(r1, r2, 0.2);

				if (hit && tiles.active) {
					self.g = 0.1;
					tiles.play();
				}
			},
			vsBoulders(colliders) {
				for (let i = 0; i < colliders.length; i++) {
					const boulder = colliders[i];
					const r1 = self.body;
					const r2 = boulder.body;
					const hit = overlap(r1, r2, 0.8, 0.8);

					if (hit) {
						self.receiveDamage(1, boulder);
						break;
					}
				}
			},
			changeState(state) {
				self.currentState = state;
				switch (state) {
				case 'idle':
					doIdle();
					break;
				case 'run':
					doRun();
					break;
				case 'jump':
					doJump();
					break;
				case 'fall':
					doFall();
					break;
				case 'attack':
					doAttack();
					break;
				case 'swing':
					doSwing();
					break;
				}
			},
			reset() {
				_reset();
				loved = false;
				didJumpAttack = false;
				self.swung = false;
			},
			kill() {
				_kill();
				self.setVisible(false, false);
				Sound.play('punch');
				self.addSfx('blast');
				WaitTimer(1, onKill);
			},
			doSwing() {
				if (self.swung) {
					return;
				}
				resetAttackState();
				doSwing();
			},
			onLanded() {
				self.addSfx('impactDusts');
				Sound.play('landed');
			}
		}),
	);

	self.sx = 0.5;
	self.jForce = 3;
	// self.flipHSkinDisabled = true;

	btn.is('jump').onDown(() => {
		if (store.lockedMovement()) {
			return;
		}
		onJump();
	});
	btn.is('attack').onDown(() => {
		if (store.lockedMovement()) {
			return;
		}
		onAttack();
	});

	self.addSkin({
		idle: { texture: PLAYER_IDLE },
		run: { texture: PLAYER_RUN },
		fall: { texture: PLAYER_FALL },
		jump: { texture: PLAYER_JUMP },
		attack: { texture: PLAYER_ATTACK, loop: false },
	});

	self.skin.onComplete = (/** @type{TPlayerState}*/ animName) => {
		const isAttackAnim = animName === 'attack';

		if (isAttackAnim) {
			resetAttackState();
		}
	};

	doIdle();

	function updateMovement() {
		if (btn.is('right').down) {
			if (!self.attacking) {
				self.changeState('run');
			}
		} else if (btn.is('left').down) {
			if (!self.attacking) {
				self.changeState('run');
			}
		} else {
			if (self.grounded && !self.attacking) {
				self.changeState('idle');
			}
		}

		if (self.falling && !self.attacking) {
			self.changeState('fall');
		}

		if (self.attacking) {
			self.resetVx();
			self.resetVy();
			self.voidGrav();
		}
	}

	function doIdle() {
		self.moving = false;
		self.resetVx();

		self.skin.play('idle');
	}

	function doRun() {
		if (self.grounded && !self.falling) {
			self.skin.play('run');
		}
	}

	function doFall() {
		self.skin.play('fall');
	}

	function doJump(force=self.jForce) {
		self.jumping = true;
		self.grounded = false;
		self.g = self.jg;
		self.vy -= force;

		if (!self.moving) {
			self.skin.play('jump');
		}
		// Sound.play('fxSpawnD');
	}

	function doSwing() {
		self.swung = true;
		doJump(1.8);
		WaitTimer(1, onSwingComplete);
	}

	function doAttack() {
		self.attacking = true;

		if (self.jumping && !didJumpAttack) {
			didJumpAttack = true;
		}

		addPower('tailwhip');

		self.skin.play('attack');

	}

	function doLove() {
		loved = true;
		self.addSfx('love', self.x, self.y - self.body.height);
	}

	/**
	 * @param {TPowerType} type
	 */
	function addPower(type) {
		if (!self.active) {
			return;
		}

		switch (type) {
		case 'tailwhip': {
			const mc = root.powerPool.get(type);

			if (!mc) {
				return;
			}

			mc.addTo(self.parent, LAYERS.fg);
			mc.flipH = self.flipH;
			mc.scx = self.flipH;
			// mc.body.alpha = 0.5;
			// mc.body.visible = true;

			const offsetX = 0;
			mc.x = !self.isFlipH() ? self.x - self.width/2 - offsetX : self.x - mc.width/2 - offsetX;
			mc.y = self.y - mc.height + self.height;

			mc.play();
			// powers.push(mc);
			Sound.play('lash');
			break;
		}
		}
	}

	function resetAttackState() {
		self.attacking = false;
		self.g = self.jumping ? self.jg : self.dg;
	}

	function onSwingComplete() {
		self.swung = false;
	}

	function onAttack() {
		if (self.dead || self.attacking || didJumpAttack) {
			return;
		}

		self.changeState('attack');
	}

	function onKill() {
		self.detach();
		root.scene.reload();
	}

	function onJump() {
		if (self.jumping) {
			return;
		}

		if (self.grounded && !self.attacking) {
			self.changeState('jump');
		}
	}

	return self;
}
