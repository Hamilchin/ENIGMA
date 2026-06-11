/*global Cat: true*/
/*global drawCat, audio*/
Cat =
(function () {
"use strict";

var WIDTH = 100,
	VX_MAX = 0.2,
	VY_MAX = 0.2,
	ACCEL = 0.0002,
	GRAVITY = 0.0002,
	JUMP = 0.3,
	JUMP_TIME = 200,
	ROTATION_MAX = 0.0007,
	JUMP_START_TIME = 50,
	TURNING_TIME = 200;

function Cat (level) {
	this.level = level;
	this.curve0 = level.ground;
	this.x0 = 140 + WIDTH;
	this.y0 = level.ground.y(this.x0);
	this.curve1 = level.ground;
	this.x1 = 140;
	this.y1 = level.ground.y(this.x1);

	this.vx = 0;
	this.vy = 0;
	this.turning = 0;
	this.jumpTime = 0;
	this.variationTime = 0;
	this.walkPos = 0;
	this.noRotTime = 0;
}

Cat.prototype.draw = function (ctx) {
	var dx, dy, a;
	dx = this.x0 - this.x1;
	dy = this.y0 - this.y1;
	ctx.save();
	ctx.translate(this.x1, this.y1);
	a = Math.atan2(dy, dx);
	ctx.rotate(a);
	if (dx < 0) {
		ctx.scale(1, -1);
	}
	drawCat(
		ctx,
		Math.sqrt(dx * dx + dy * dy), -a,
		this.walkPos / 100, this.variationTime / 1000, this.turning / TURNING_TIME
	);
	ctx.restore();
};

Cat.prototype.followCurve = function (x, curve, dx) {
	var xNew = x + dx, y, inside, block, stop = false, leave = false;

	if (xNew < this.level.min) {
		xNew = this.level.min;
		stop = true;
	} else if (xNew > this.level.max) {
		xNew = this.level.max;
		stop = true;
	}

	if (xNew < curve.min) {
		xNew = curve.min;
		stop = false;
		leave = true;
	} else if (xNew > curve.max) {
		xNew = curve.max;
		stop = false;
		leave = true;
	}

	y = curve.y(xNew);
	inside = this.level.insideBlock(xNew, y);
	if (inside) {
		block = inside.block;
		if (dx > 0) {
			if (block.y(block.min) >= curve.y(block.min)) {
				curve = block;
				if (xNew > curve.max) {
					xNew = curve.max;
					y = curve.y(xNew);
					stop = false;
					leave = true;
				} else {
					y = curve.y(xNew);
				}
			} else {
				xNew -= inside.l;
				stop = true;
				leave = false;
			}
		} else {
			if (block.y(block.max) >= curve.y(block.max)) {
				curve = inside.block;
				if (xNew < curve.min) {
					xNew = curve.min;
					y = curve.y(xNew);
					stop = false;
					leave = true;
				} else {
					y = curve.y(xNew);
				}
			} else {
				xNew += inside.r;
				stop = true;
				leave = false;
			}
		}
		y = curve.y(xNew);
	}

	return {
		x: xNew,
		y: y,
		curve: leave ? null : curve,
		remaining: stop || leave ? 1 - Math.abs((x - xNew) / dx) : 0,
		stop: stop
	};
};

Cat.prototype.catchCurve = function (x, y, dx, dy, other) {
	var xNew = x + dx, yNew = y + dy, inside, min, curve = null, hitSide = false, hitCurve = false;
	if (xNew < this.level.min) {
		xNew = this.level.min;
		hitSide = true;
	} else if (xNew > this.level.max) {
		xNew = this.level.max;
		hitSide = true;
	}

	inside = this.level.insideBlock(xNew, yNew);
	if (inside) {
		min = dx < 0 ? inside.r : inside.l;
		if (inside.block !== other) {
			min = Math.min(min, inside.b);
		}
		min = Math.min(min, inside.t);
		if (min === inside.l) {
			xNew -= inside.l;
			hitSide = true;
		} else if (min === inside.r) {
			xNew += inside.r;
			hitSide = true;
		} else if (min === inside.b) {
			yNew += inside.b;
			hitCurve = true;
		} else {
			yNew -= inside.t;
			hitCurve = true;
			curve = inside.block;
		}
		if (hitSide && inside.block === other) {
			hitCurve = true;
			curve = inside.block;
			yNew = curve.y(xNew);
		}
	}

	if (yNew >= this.level.ground.y(xNew)) {
		hitSide = false;
		hitCurve = true;
		curve = this.level.ground;
		yNew = curve.y(xNew);
	}

	return {
		x: xNew,
		y: yNew,
		curve: curve,
		hitSide: hitSide,
		hitCurve: hitCurve
	};
};

Cat.prototype.swap = function () {
	var x, y, curve;
	x = this.x0;
	y = this.y0;
	curve = this.curve0;
	this.x0 = this.x1;
	this.y0 = this.y1;
	this.curve0 = this.curve1;
	this.x1 = x;
	this.y1 = y;
	this.curve1 = curve;
};

Cat.prototype.move = function (left, right, jump, dt) {
	this.variationTime += dt;
	this.jumpTime = Math.max(0, this.jumpTime - dt);
	this.noRotTime = Math.max(0, this.noRotTime - dt);
	if (this.turning > 0) {
		this.turning -= dt;
		if (this.turning >= 0) {
			return;
		}
		dt = -this.turning;
		this.turning = 0;
	}
	if (this.curve0 && this.curve1) {
		this.walk(left, right, jump, dt);
	} else if (!this.curve0 && !this.curve1) {
		this.fly(left, right, jump, dt);
	} else {
		this.slide(left, right, jump, dt);
	}
	return this.level.getEnd(this.x0, this.y0) ||
		this.level.getEnd(this.x1, this.y1) ||
		this.level.getDroneEnd((this.x0 + this.x1) / 2, (this.y0 + this.y1) / 2);
};

Cat.prototype.walk = function (left, right, jump, dt) {
	var dx, dx1, pos0, pos1;
	if (left === right) {
		//if neither or both keys are pressed just stop
		this.vx = 0;
	} else {
		if (
			(left && this.x0 > this.x1) ||
			(right && this.x0 < this.x1)
		) {
			this.turning = TURNING_TIME;
			this.swap();
			this.vx = 0;
			return;
		}
		if (left) {
			this.vx -= dt * ACCEL;
			this.vx = Math.max(this.vx, -VX_MAX);
		} else {
			this.vx += dt * ACCEL;
			this.vx = Math.min(this.vx, VX_MAX);
		}
	}
	this.vy = Math.min(0, this.vx * (this.y1 - this.y0) / (this.x1 - this.x0));

	this.jumpTime = 0;
	if (jump) {
		audio.sound('cat0');
		this.curve0 = null;
		this.curve1 = null;
		this.jumpTime = JUMP_TIME;
		this.noRotTime = Math.max(JUMP_START_TIME, 2 * Math.abs(this.vy) / JUMP * JUMP_TIME);
		this.fly(left, right, jump, dt);
		return;
	}

	dx = this.vx * dt;
	//adjust to keep WIDTH
	if (this.x0 > this.x1) {
		dx1 = this.x0 - this.x1 + dx - WIDTH;
	} else {
		dx1 = this.x0 - this.x1 + dx + WIDTH;
	}
	if (dx > 0) {
		dx1 = Math.min(dx1, 1.5 * dx);
		dx1 = Math.max(dx1, 0.5 * dx);
	} else {
		dx1 = Math.max(dx1, 1.5 * dx);
		dx1 = Math.min(dx1, 0.5 * dx);
	}
	pos0 = this.followCurve(this.x0, this.curve0, dx);
	pos1 = this.followCurve(this.x1, this.curve1, dx1);
	if (pos0.remaining || pos1.remaining) {
		if (pos0.remaining < pos1.remaining) {
			pos0 = this.followCurve(this.x0, this.curve0, dx * (1 - pos1.remaining));
		} else {
			pos1 = this.followCurve(this.x1, this.curve1, dx1 * (1 - pos0.remaining));
		}
	}
	this.walkPos += Math.abs(pos0.x - this.x0);
	this.x0 = pos0.x;
	this.y0 = pos0.y;
	this.curve0 = pos0.curve;
	this.x1 = pos1.x;
	this.y1 = pos1.y;
	this.curve1 = pos1.curve;
	if (pos0.stop || pos1.stop) {
		this.vx = 0;
	} else if (pos0.remaining) {
		this.jumpTime = JUMP_TIME;
		if (!this.curve0 && !this.curve1) {
			this.fly(left, right, jump, dt * pos0.remaining);
		} else {
			this.slide(left, right, jump, dt * pos0.remaining);
		}
	}
};

Cat.prototype.slide = function (left, right, jump, dt) {
	var swap, dx, dy, pos;
	if (jump) {
		this.jumpTime = Math.max(this.jumpTime, JUMP_TIME / 2);
		this.vy -= JUMP * Math.min(dt, this.jumpTime) / JUMP_TIME;
		this.vy = Math.max(this.vy, -1.5 * JUMP);
		this.walkPos += dt * Math.abs(this.vy);
	}
	this.vy += GRAVITY * dt;
	this.vy = Math.min(this.vy, VY_MAX);
	if (left === right || (left && this.vx > 0) || (right && this.vx < 0)) {
		this.vx = 0;
	} else if (left) {
		this.vx -= ACCEL * dt;
		this.vx = Math.max(this.vx, this.x0 > this.x1 ? -VX_MAX / 2 : -VX_MAX);
	} else if (right) {
		this.vx += ACCEL * dt;
		this.vx = Math.min(this.vx, this.x0 > this.x1 ? VX_MAX : VX_MAX / 2);
	}

	if (this.vy < 0) {
		this.curve0 = null;
		this.curve1 = null;
		this.fly(false, false, false, dt); //set inputs to false, already handled above
		return;
	}

	if (Math.abs(this.y0 - this.y1) > WIDTH * 0.75) {
		this.vx = 0;
	}

	if (!this.curve0) {
		swap = true;
		this.swap();
	}

	dx = this.vx * dt;
	dy = this.vy * dt;

	//make sure that Math.abs(this.y0 - this.y1) <= WIDTH
	dy = Math.min(dy, Math.max(0, this.y0 - this.y1 + WIDTH));
	dy = Math.max(dy, Math.min(0, this.y0 - this.y1 - WIDTH));

	pos = this.catchCurve(this.x1, this.y1, dx, dy, this.curve0);
	if (pos.x === this.x0) {
		//make sure we never get this.x0 === this.x1
		if (this.x1 > this.x0) {
			pos.x += 0.01;
		} else {
			pos.x -= 0.01;
		}
	}
	this.x1 = pos.x;
	this.y1 = pos.y;
	if (pos.hitSide) {
		this.vx = 0;
	}
	if (pos.hitCurve) {
		this.vy = 0;
	}

	if (pos.curve) {
		this.curve1 = pos.curve;
	} else {
		//move x0 to adjust width
		if (Math.abs(this.y0 - this.y1) <= WIDTH) {
			dx = this.x1 - this.x0 +
				(this.x0 > this.x1 ? 1 : -1) * Math.sqrt(WIDTH * WIDTH - (this.y0 - this.y1) * (this.y0 - this.y1));
		} else {
			dx = this.x1 - this.x0;
		}
		pos = this.followCurve(this.x0, this.curve0, dx);
		if (pos.x === this.x1) {
			//make sure we never get this.x0 === this.x1
			if (this.x1 > this.x0) {
				this.x1 += 0.01;
			} else {
				this.x1 -= 0.01;
			}
			this.vx = (pos.x - this.x1) / dt;
		}
		this.walkPos += Math.abs(pos.x - this.x0);
		this.x0 = pos.x;
		this.y0 = pos.y;
		this.curve0 = pos.curve;
		if (pos.stop) {
			this.vx = 0;
			if (this.x0 > this.x1) {
				dx = this.x0 - this.x1 - WIDTH;
			} else {
				dx = this.x0 - this.x1 + WIDTH;
			}
			pos = this.catchCurve(this.x1, this.y1, dx, 0, this.curve0);
			if (pos.x === this.x0) {
				//make sure we never get this.x0 === this.x1
				if (this.x1 > this.x0) {
					pos.x += 0.01;
				} else {
					pos.x -= 0.01;
				}
			}
			this.x1 = pos.x;
			this.y1 = pos.y;
			if (pos.hitSide) {
				this.vx = 0;
			}
			if (pos.hitCurve) {
				this.vy = 0;
			}
			if (pos.curve) {
				this.curve1 = pos.curve;
			}
		}
	}

	if (swap) {
		this.swap();
	}
};

Cat.prototype.fly = function (left, right, jump, dt) {
	var vxMax, dx, dy, a, da, sina, cosa, x, y, pos;
	vxMax = VX_MAX;
	if (this.jumpTime === 0) {
		vxMax /= 10;
	}
	if (
		(left && this.x0 > this.x1) ||
		(right && this.x0 < this.x1)
	) {
		vxMax /= 2;
	}
	vxMax = Math.max(Math.abs(this.vx), vxMax);
	if (left) {
		this.vx -= ACCEL * dt;
		this.vx = Math.max(this.vx, -vxMax);
	} else if (right) {
		this.vx += ACCEL * dt;
		this.vx = Math.min(this.vx, vxMax);
	}
	if (jump) {
		this.vy -= JUMP * Math.min(dt, this.jumpTime) / JUMP_TIME;
		this.vy = Math.max(this.vy, -1.5 * JUMP);
	}
	this.vy += GRAVITY * dt;
	this.vy = Math.min(this.vy, VY_MAX);
	dx = this.vx * dt;
	dy = this.vy * dt;
	//rotate while jumping
	a = Math.atan2(this.y0 - this.y1, Math.abs(this.x0 - this.x1));
	da = (Math.atan2(dy, Math.abs(dx)) - a) % (2 * Math.PI);
	if (this.x0 < this.x1) {
		da = -da;
	}
	da = Math.min(Math.abs(dy) / WIDTH, Math.max(0, dt - this.noRotTime) * ROTATION_MAX, da);
	da = Math.max(-Math.abs(dy) / WIDTH, -Math.max(0, dt - this.noRotTime) * ROTATION_MAX, da);
	sina = Math.sin(da);
	cosa = Math.cos(da) - 1;
	x = (this.x0 + this.x1) / 2;
	y = (this.y0 + this.y1) / 2;

	pos = this.catchCurve(
		this.x0, this.y0,
		dx + (this.x0 - x) * cosa - (this.y0 - y) * sina,
		dy + (this.x0 - x) * sina + (this.y0 - y) * cosa
	);
	this.x0 = pos.x;
	this.y0 = pos.y;
	if (!jump && !this.noRotTime) {
		this.curve0 = pos.curve;
	}
	if (pos.hitSide) {
		this.jumpTime = Math.max(this.jumpTime, JUMP_TIME / 2);
		this.vx = 0;
		this.walkPos += dt * Math.abs(this.vy);
	}
	if (pos.hitCurve && !this.noRotTime) {
		this.vy = 0;
	}
	pos = this.catchCurve(
		this.x1, this.y1,
		dx + (this.x1 - x) * cosa - (this.y1 - y) * sina,
		dy + (this.x1 - x) * sina + (this.y1 - y) * cosa
	);
	if (pos.x === this.x0) {
		//make sure we never get this.x0 === this.x1
		if (this.x1 > this.x0) {
			pos.x += 0.01;
		} else {
			pos.x -= 0.01;
		}
	}
	this.x1 = pos.x;
	this.y1 = pos.y;
	if (!jump && !this.noRotTime) {
		this.curve1 = pos.curve;
	}
	if (pos.hitSide) {
		this.jumpTime = Math.max(this.jumpTime, JUMP_TIME / 2);
		this.vx = 0;
	}
	if (pos.hitCurve && !this.noRotTime) {
		this.vy = 0;
	}
	if (this.curve0 && this.curve1) {
		this.vx = 0;
	}
	if (this.curve0 || this.curve1) {
		audio.sound('cat1');
	}
};

return Cat;
})();