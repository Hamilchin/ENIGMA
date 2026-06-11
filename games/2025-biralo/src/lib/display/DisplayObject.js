import { getUID } from '@lib/utils/misc';

/**
 * @param {TDisplayObject} self
 * @param {CanvasRenderingContext2D} ctx
 */
export function renderProps(self, ctx) {
	// without rounding pixels
	let _x = self.x + self.width * self.pvx;
	let _y = self.y + self.height * self.pvy;

	// round pixels
	if (self.roundPixels) {
		_x = (self.x + self.width * self.pvx) | 0;
		_y = (self.y + self.height * self.pvy) | 0;
	}

	ctx.setTransform(self.scx, 0, 0, self.scy, _x, _y);
	// ctx.rotate(self.rot);
}

/**
 * @type {FDisplayObject}
 */
export function DisplayObject() {
	let _alpha = 1;

	/**
	 * @type {TDisplayObject}
	 */
	let self = {
		x: 0,
		y: 0,
		alpha: 1,
		width: 0,
		height: 0,
		scx: 1,
		scy: 1,
		pvx: 0,
		pvy: 0,
		rot: 0,
		visible: true,
		uid: getUID(),
		gx: 0,
		gy: 0,
		detach() {
			if (self.parent) {
				self.parent.remove(self);
			}
		},
		render() {},
		update() {}
	};

	Object.defineProperties(self, {
		alpha: {
			get() {
				return self.parent ? self.parent.alpha * _alpha : _alpha;
			},
			/**
			 * @param {number} value
			 */
			set(value) {
				_alpha = value;
			}
		}, 
		gx: {
			get() {
				return self.parent ? self.x + self.parent.gx : self.x;
			}
		},
		gy: {
			get() {
				return self.parent ? self.y + self.parent.gy : self.y;
			}
		},
	});

	return self;
}
