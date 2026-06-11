import { AnimatedSprite } from '@lib/display';

/**
 * @type {FSfxBase}
 */
export function SfxBase(name, texture, loop=false) {
	const o = AnimatedSprite(texture, false, loop);
	const self = Object.assign(o,  /** @type {TSfxBase}*/({
		name,
		onComplete(name) {
			self.kill();
		},
		kill() {
			self.stop();
			self.detach();
			self.reserved = false;
		}
	}));

	self.visible = true;

	Object.defineProperties(self, {
		active: {
			get() {
				return self.parent;
			}
		}
	});

	return self;
}
