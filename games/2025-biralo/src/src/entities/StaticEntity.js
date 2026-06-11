import { AnimatedSprite, Rectangle } from '@lib/display';

import { BaseEntity } from './BaseEntity';

/**
 * @type {FStaticEntity}
 */
export function StaticEntity(name, texture) {
	const o = BaseEntity(name);
	const _kill = o.kill;
	const self = Object.assign(o, /** @type {TStaticEntity} */({
		loop: true,
		addBody() {
			self.body = Rectangle(0, 0, texture.w, texture.h);
			self.body.name = `${name}.body`;
			self.body.visible = false;
		},
		addSkin() {
			self.skin = AnimatedSprite(texture, false, self.loop);
			self.skin.name = `${name}.skin`;
			self.skin.onComplete = self.onComplete;
		},
		play() {
			self.skin.visible = true;
			self.skin.start();
		},
		stop(frameIndex) {
			self.skin.stop(frameIndex);
		},
		kill() {
			self.skin.stop();
			_kill();
		}
	}));

	return self;
}
