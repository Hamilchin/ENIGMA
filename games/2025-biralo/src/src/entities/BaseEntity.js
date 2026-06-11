/**
 * @type {FBaseEntity<TDisplayObject>}
 */
export function BaseEntity(name) {
	/**
	 * @type {TBaseEntity<TDisplayObject>}
	 */
	const self = {
		name,
		type: name,
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		addTo(group, index) {
			if (index !== undefined) {
				group.addAt(self.body, index);
				group.addAt(self.skin, index);
			} else {
				group.add(self.body);
				group.add(self.skin);
			}
			self.parent = group;
		},
		setBody(width, height, color) {
			self.body.width = width;
			self.body.height = height;
			self.body.color = color ? color : self.body.color;
		},
		update() {
			self.skin.x = self.body.x;
			self.skin.y = self.body.y;
			self.body.update();
			self.skin.update();
		},
		render(ctx) {},
		kill() {
			self.body.detach();
			self.skin.detach();
			self.parent = null;
			self.reserved = false;
		},
		attachProps: defineProps
	};

	function defineProps() {
		Object.defineProperties(self, {
			x: {
				/**
				 * @param {number} value
				 */
				set(value) {
					self.body.x = value;
				},
				get() {
					return self.body.x;
				}
			},
			y: {
				/**
				 * @param {number} value
				 */
				set(value) {
					self.body.y = value;
				},
				get() {
					return self.body.y;
				}
			},
			width: {
				/**
				 * @param {number} value
				 */
				set(value) {
					self.body.width = value;
				},
				get() {
					return self.body.width;
				}
			},
			height: {
				/**
				 * @param {number} value
				 */
				set(value) {
					self.body.height = value;
				},
				get() {
					return self.body.height;
				}
			},
			scx: {
				/**
				 * @param {number} value
				 */
				set(value) {
					self.body.scx = value;
				},
				get() {
					return self.body.scx;
				}
			},
			active: {
				get() {
					return Boolean(self.body.parent && self.skin.parent);
				},
				configurable: true,
				enumerable: true
			}
		});
	}
	return self;
}
