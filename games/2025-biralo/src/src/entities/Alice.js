import { ALICE_LOVE, ALICE_WAVE } from 'media/miscAssets';

import { Actor } from './Actor';

/**
 * @type {FAlice}
 */
export function Alice(width, height, color) {
	const name = 'alice';
	const o = /** @type{TActor<TAliceState>} */(Actor(name, width, height, color));

	const _kill = o.kill;
	const self = Object.assign(
		o,
		/** @type {TAlice}*/ ({
			g: 0,
			type: name,
			kill() {
				_kill();
				self.setVisible(false, false);
				self.detach();
			},
			doLove() {
				self.skin.play('love');
			},
			vsPlatforms() {},
			vsHurts() {}
		}),
	);

	self.addSkin({
		wave: { texture: ALICE_WAVE },
		love: { texture: ALICE_LOVE },
	});

	self.skin.play('wave');

	return self;
}
