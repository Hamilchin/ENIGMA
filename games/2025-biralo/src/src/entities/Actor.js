import { LAYERS } from '@game/const';
import { root } from '@game/Game';
import { MovieClip, Rectangle } from '@lib/display';
import { getUID, hitTest, overlap } from '@lib/utils/misc';

import { BaseEntity } from './BaseEntity';

/**
 * @template T
 * @type {FActor<T>}
 */
export function Actor(name, width=0, height=0, color='#fff') {
	const body = Rectangle(0, 0, width, height, color);
	body.name = `${name}.body`;

	const o = BaseEntity(name);
	const self = Object.assign(o, /** @type {TActor<T>} */({
		uid: getUID(),
		width,
		height,
		health: 1,
		alpha: 1,
		vx: 0,
		vy: 0,
		sx: 0.8,
		jForce: 2,
		flipH: 1,
		dg: 0.5,
		jg: 0.2,
		g: 0.5,
		body,
		setVisible(bodyVisible, skinVisible) {
			self.body.visible = bodyVisible;
			self.skin.visible = skinVisible;
		},
		update() {
			self.body.update();
			self.updateSkin();
			updateVelocity();
		},
		render(ctx) {
			self.body.render(ctx);
			self.skin.render(ctx);
		},
		addSkin(list) {
			self.skin = MovieClip(list);
			self.skin.name = `${name}.skin`;
		},
		vsPlatforms(colliders) {
			colliders.forEach(platform => {
				var r1 = self.body;
				var r2 = platform;
				var test = hitTest(r1, r2);

				if (test.hit) {
					if (test.side === 'b') {
						// self.grounded = true;
						self.g = self.dg;
						self.y = self.y - test.overlap.y;
						self.resetVy();
					}
					else if (test.side === 't') {
						self.y = self.y + test.overlap.y;
						self.resetVy();
					}
					else if (test.side === 'r') {
						self.x = self.x - test.overlap.x;
						self.vx -= self.sx;
					}
					else if (test.side === 'l') {
						self.x = self.x + test.overlap.x;
						self.vx += self.sx;
					}

					self.grounded = test.side === 'b';
					self.onWall = test.side === 'r' || test.side === 'l';
				}
			});
		},
		vsHurts(colliders) {
			for (let i = 0; i < colliders.length; i++) {
				const hurt = colliders[i];
				const r1 = self.body;
				const r2 = hurt;
				const hit = overlap(r1, r2, 1, 0.1);

				if (hit) {
					self.receiveDamage(1, hurt);
					break;
				}
			}
		},
		addSfx(type, x, y) {
			const mc = root.sfxPool.get(type);

			if (!mc) {
				return;
			}

			self.parent.addAt(mc, LAYERS.fg);
			mc.x = x ?? self.x + self.width/2 - mc.width/2;
			mc.y = y ?? self.y + self.height - mc.height;
			mc.start(0);
		},
		receiveDamage(amount, from) {
			if (self.dead) {
				return;
			}

			self.health -= amount;

			self.onDamage();

			if (self.health <= 0) {
				self.health = 0;
				self.kill();
			}
		},
		onDamage() {},
		doFlipH() {
			self.flipH *= -1;
		},
		kill() {
			self.dead = true;
		},
		reset() {
			if (self.skin) {
				self.skin.stop();
			} 

			self.parent = null;
			self.flipH = 1;
			self.health = 1;
			self.dead = false;
			self.moving = false;
			self.grounded = false;
			self.onWall = false;
			self.jumping = false;
			self.falling = false;
			self.attacking = false;
			self.resetVx();
			self.resetVy();
			self.resetGrav();
		},
		detach() {
			self.skin.stop();
			self.skin.detach();
			self.body.detach();
			self.parent = null;
			self.reserved = false;
		},
		resetVx() {
			self.vx = 0;
		},
		resetVy() {
			self.vy = 0;
		},
		voidGrav() {
			self.g = 0;
		},
		resetGrav() {
			self.g = self.dg;
		},
		isFlipH() {
			return self.flipH === -1;
		},
		onLanded(){},
		updateSkin() {
			const skin = self.skin;
			if (skin) {
				if (!self.flipHSkinDisabled) {
					skin.scx = self.flipH;
					skin.x = self.body.x + self.body.width;
					if (self.isFlipH()) {
						skin.x = self.body.x + self.body.width;
					} else {
						skin.x = self.body.x;
					}
				} else {
					skin.x = self.body.x;
				}
				skin.y = self.body.y;
				skin.update();
			}
		}

	}));

	function updateVelocity() {
		self.vy += self.g;
		self.y += self.vy;
		self.x += self.vx;

		if (!self.grounded && self.vy > 0) {
			self.falling = true;
		}
		if (self.grounded && self.falling) {
			self.onLanded();
			self.falling = false;
		}
	}

	self.attachProps();

	Object.defineProperties(self, {
		active: {
			get() {
				return self.skin.parent && self.body.parent && !self.dead && self.skin.visible;
			},
			configurable: true,
			enumerable: true
		}
	});
	
	return self;
}
