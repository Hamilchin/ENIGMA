/*global Block: true*/
Block =
(function () {
"use strict";

function Block (top, bottom, type) {
	this.top = top;
	this.bottom = bottom;
	this.type = type;
	this.min = top.min; //must be === bottom.min
	this.max = top.max; //must be === bottom.max
}

Block.prototype.inside = function (x, y) {
	var top, bottom;
	if (x <= this.min || x >= this.max) {
		return false;
	}
	top = this.top.y(x);
	bottom = this.bottom.y(x);
	return y > top && y < bottom && {l: x - this.min, r: this.max - x, t: y - top, b: bottom - y, block: this};
};

Block.prototype.path = function (ctx, t) {
	if (this.type === 2) {
		this.thornyPath(ctx, t);
		return;
	}
	this.bottom.pathBottom(ctx);
	this.top.path(ctx);
	ctx.closePath();
	if (this.type === 3) {
		this.waterPath(ctx, t);
	}
};

Block.prototype.thornyPath = function (ctx, t) {
	var x, y, Y, l, d, corner = true, out = true;
	x = this.min;
	y = this.top.y(x);
	ctx.moveTo(x, y);
	l = this.max - this.min - 20;
	d = l / (2 * Math.round(l / 10) + 2);
	while (x < this.max - 10 - 1.5 * d) {
		x += corner ? 10 + d : d;
		y = this.top.y(x);
		out = !out;
		ctx.lineTo(x + 2 * Math.sin(x / 30 + t / 1000), y + (out ? -1 : 10));
		corner = false;
	}
	x = this.max;
	y = this.top.y(x);
	ctx.lineTo(x, y);
	out = true;
	corner = true;
	Y = this.bottom.y(x);
	l = Y - y - 20;
	d = l / (2 * Math.round(l / 10) + 2);
	while (y < Y - 10 - 1.5 * d) {
		y += corner ? 10 + d : d;
		out = !out;
		ctx.lineTo(x + (out ? 1 : -10), y + 2 * Math.sin(y / 30 + t / 1000));
		corner = false;
	}
	y = Y;
	ctx.lineTo(x, y);
	out = true;
	corner = true;
	l = this.max - this.min - 20;
	d = l / (2 * Math.round(l / 10) + 2);
	while (x > this.min + 10 + 1.5 * d) {
		x -= corner ? 10 + d : d;
		y = this.bottom.y(x);
		out = !out;
		ctx.lineTo(x + 2 * Math.cos(x / 30 + t / 1000), y + (out ? 1 : -10));
		corner = false;
	}
	x = this.min;
	y = this.bottom.y(x);
	ctx.lineTo(x, y);
	out = true;
	corner = true;
	Y = this.top.y(x);
	l = y - Y - 20;
	d = l / (2 * Math.round(l / 10) + 2);
	while (y > Y + 10 + 1.5 * d) {
		y -= corner ? 10 + d : d;
		out = !out;
		ctx.lineTo(x + (out ? -1 : 10), y + 2 * Math.cos(y / 30 + t / 1000));
		corner = false;
	}
	ctx.closePath();
};

Block.prototype.waterPath = function (ctx, t) {
	var top = this.top, l = (this.max - this.min) / 5;

	function wave (x) {
		ctx.moveTo(x - l, top.y(x - l) + 2);
		ctx.quadraticCurveTo(x, top.y(x) - 5, x + l, top.y(x + l) + 2);
	}

	wave(this.min + l + (this.max - this.min - 2 * l) * (1 + Math.sin(t / 700)) / 2);
	wave(this.min + l + (this.max - this.min - 2 * l) * (1 + Math.sin(t / 600)) / 2);
	wave(this.min + l + (this.max - this.min - 2 * l) * (1 + Math.sin(t / 500)) / 2);
	ctx.closePath();
};

Block.prototype.y = function (x) {
	return this.top.y(x);
};

return Block;
})();