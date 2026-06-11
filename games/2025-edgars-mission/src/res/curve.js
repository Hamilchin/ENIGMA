/*global Curve: true*/
Curve =
(function () {
"use strict";

function Curve (points) {
	var i;
	points[0].xc = points[0].x;
	points[0].yc = points[0].y;
	for (i = 1; i < points.length; i++) {
		if (points[i].xc === undefined) {
			points[i].xc = (points[i - 1].x + points[i].x) / 2;
			points[i].yc = (points[i - 1].y + points[i].y) / 2;
		} else if (points[i].yc === undefined) {
			points[i].yc = points[i - 1].y + (points[i - 1].y - points[i - 1].yc) *
				(points[i].xc - points[i - 1].x) / (points[i - 1].x - points[i - 1].xc);
		}
	}
	this.points = points;
	this.min = points[0].x;
	this.max = points[points.length - 1].x;
}

function interpolate (x, x0, y0, xc, yc, x1, y1) {
	var a, t;
	a = x0 + x1 - 2 * xc;
	if (a === 0) {
		t = (x - x0) / (x1 - x0);
	} else {
		t = (x0 - xc + Math.sqrt(xc * xc - x0 * x1 + a * x)) / a;
	}
	return (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * yc + t * t * y1;
}

Curve.prototype.y = function (x) {
	var i = 0;
	while (this.points[i + 1].x < x) {
		i++;
	}
	return interpolate(
		x,
		this.points[i].x, this.points[i].y,
		this.points[i + 1].xc, this.points[i + 1].yc,
		this.points[i + 1].x, this.points[i + 1].y
	);
};

Curve.prototype.path = function (ctx) {
	var i;
	for (i = 0; i < this.points.length; i++) {
		ctx.quadraticCurveTo(this.points[i].xc, this.points[i].yc, this.points[i].x, this.points[i].y);
	}
};

Curve.prototype.pathBottom = function (ctx) {
	/*like .path, but
	(1) starts with a moveTo
	(2) from right to left
	(3) with visual offset to top to accommodate for height of cat*/
	var i, l = this.points.length;
	ctx.moveTo(this.points[l - 1].x, this.points[l - 1].y - 30);
	for (i = l - 2; i >= 0; i--) {
		ctx.quadraticCurveTo(this.points[i + 1].xc, this.points[i + 1].yc - 30, this.points[i].x, this.points[i].y - 30);
	}
};

Curve.prototype.grass = function (ctx, min, max, time) {
	var x, y, xx;
	min = Math.max(this.min, min - 2);
	max = Math.min(this.max, max + 2);
	if (min + 2 >= max - 2) {
		return;
	}
	for (x = min + 2; x < max - 2; x += 5) {
		xx = 5 * Math.floor(x / 5);
		xx += 2 * Math.sin(xx);
		y = this.y(xx);
		ctx.moveTo(xx, y + 5);
		ctx.quadraticCurveTo(xx, y - 10, xx + 1 + 3 * Math.sin(time / 300 + xx / 200), y - 13 + 3 * Math.cos(xx / 100));
		ctx.quadraticCurveTo(xx, y - 10, xx + 1.5, y + 5);
		ctx.closePath();
	}
};

return Curve;
})();