import { Rectangle } from '@lib/display';

/**
 * @type {FReverser}
 */
export function Reverser(name, x, y, width, height) {
	const o = Rectangle(x, y, width, height);
	const self = Object.assign(o, /** @type {TReverser}*/({
		name,
		side: 1
	}));

	return self;
}
