/*global drawCat: true*/
drawCat =
(function () {
"use strict";

function drawTurningCat (ctx, l, a, w, v, t) {
	ctx.save();
	ctx.beginPath();
	ctx.rect(0, -80, 2 * l, 100);
	ctx.clip();
	ctx.save();
	ctx.scale(-1, 1);
	ctx.translate(-t * l, 0);
	drawCat(ctx, l, a, w - t, v);
	ctx.restore();
	ctx.translate(-t * l, 0);
	drawCat(ctx, l, a, w - t, v);
	ctx.restore();
}

function drawCat (ctx, l, a, w, v, t) {
	var xb0, yb0, xb1, yb1, xb2, yb2, xb3, yb3, //body
		xbc0, ybc0, xbc1, ybc1, xbc2, ybc2, xbc3, ybc3,
		xt, yt, //tail
		xtc0, ytc0, xtc1, ytc1,
		xf0, yf0, xf1, yf1, xf2, yf2, xf3, yf3, //feet
		xfc0, yfc0, xfc1, yfc1, xfc2, yfc2, xfc3, yfc3,
		m;

	function loop (min, max, p) {
		return min + (max - min) * (1 + Math.sin(2 * Math.PI * p)) / 2;
	}

	if (t) {
		drawTurningCat(ctx, l, a, w, v, t);
		return;
	}

	xb0 = 22 + 17 * Math.sin(a);
	yb0 = -38;
	xb1 = l - 22 + 17 * Math.sin(a);
	yb1 = -41;
	xb2 = xb1 + 5;
	yb2 = -17;
	xb3 = xb0 - 5;
	yb3 = -16;
	xbc0 = (xb0 + xb1) / 2 + l / 10;
	ybc0 = (yb0 + yb1) / 2 + 2 * Math.sin(2 * Math.PI * v) + Math.min(0, l - 100);
	xbc1 = (xb1 + xb2) / 2 + 2 + Math.sin(6 * v);
	ybc1 = (yb1 + yb2) / 2;
	xbc2 = xbc0 - l / 5;
	ybc2 = ybc0 + 23;
	xbc3 = (xb3 + xb0) / 2 - 2 - Math.sin(6 * v);
	ybc3 = (yb3 + yb0) / 2;

	xt = 1.5 * Math.sin(7 * v);
	yt = Math.sin(6 * v) - 12;
	xtc0 = xb0 - 20;
	m = (ybc0 - yb0) / (xbc0 - xb0);
	ytc0 = m * xtc0 + ybc0 - m * xbc0;
	xtc1 = xt + 10;
	ytc1 = yt - 10;

	xf0 = loop(0, xb3 + 5, w);
	yf0 = Math.min(0, loop(-5, 5, w + 0.75));
	xf1 = loop(0, xb3 + 5, w + 0.5);
	yf1 = Math.min(0, loop(-5, 5, w + 0.25));
	xf2 = loop(xb2 - 5, l, w + 0.25);
	yf2 = Math.min(0, loop(-5, 5, w));
	xf3 = loop(xb2 - 5, l, w + 0.75);
	yf3 = Math.min(0, loop(-5, 5, w + 0.5));
	xfc0 = loop(xb3 * 0.7, xb3 + 10, w);
	yfc0 = -8;
	xfc1 = loop(xb3 * 0.7, xb3 + 10, w + 0.5);
	yfc1 = -8;
	xfc2 = loop(xb2, xb2 * 0.3 + l * 0.7, w + 0.25);
	yfc2 = -8;
	xfc3 = loop(xb2, xb2 * 0.3 + l * 0.7, w + 0.75);
	yfc3 = -8;

	ctx.save();
	ctx.fillStyle = '#000';
	ctx.strokeStyle = '#000';
	ctx.lineWidth = 7;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';

	ctx.beginPath();
	ctx.moveTo(xb0, yb0);
	ctx.quadraticCurveTo(xbc0, ybc0, xb1, yb1);
	ctx.quadraticCurveTo(xbc1, ybc1, xb2, yb2);
	ctx.quadraticCurveTo(xbc2, ybc2, xb3, yb3);
	ctx.quadraticCurveTo(xbc3, ybc3, xb0, yb0);
	ctx.fill();
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(xb0, yb0);
	ctx.bezierCurveTo(xtc0, ytc0, xtc1, ytc1, xt, yt);

	ctx.moveTo(xb3, yb3);
	ctx.quadraticCurveTo(xfc0, yfc0, xf0, yf0);
	ctx.lineTo(xf0 + 2, yf0);
	ctx.moveTo(xb3 + 4, yb3);
	ctx.quadraticCurveTo(xfc0, yfc0, xf0, yf0);
	ctx.moveTo(xb3, yb3);
	ctx.quadraticCurveTo(xfc1, yfc1, xf1, yf1);
	ctx.lineTo(xf1 + 3, yf1);
	ctx.moveTo(xb3 + 4, yb3);
	ctx.quadraticCurveTo(xfc1, yfc1, xf1, yf1);
	ctx.moveTo(xb2, yb2);
	ctx.quadraticCurveTo(xfc2, yfc2, xf2, yf2);
	ctx.lineTo(xf2 + 2, yf2);
	ctx.moveTo(xb2 - 4, yb2);
	ctx.quadraticCurveTo(xfc2, yfc2, xf2, yf2);
	ctx.moveTo(xb2, yb2);
	ctx.quadraticCurveTo(xfc3, yfc3, xf3, yf3);
	ctx.lineTo(xf3 + 3, yf3);
	ctx.moveTo(xb2 - 4, yb2);
	ctx.quadraticCurveTo(xfc3, yfc3, xf3, yf3);
	ctx.stroke();

	ctx.translate(xb1 - 5, yb1 + 10);
	ctx.rotate(0.2 * Math.sin(v) - 0.4 * Math.sin(a));

	ctx.beginPath();
	ctx.moveTo(-5, -12);
	ctx.bezierCurveTo(10, -12, 5, -26, 15, -26);
	ctx.bezierCurveTo(25, -26, 28, -18, 28, -15);
	ctx.bezierCurveTo(28, -8, 10, -10, 5, 10);
	ctx.moveTo(9, -20);
	ctx.lineTo(15 + 2 * Math.sin(1.5 * v), -30);
	ctx.lineTo(22, -20);
	ctx.fill();

	ctx.fillStyle = '#ff0';
	ctx.beginPath();
	ctx.arc(20, -17, 2, 0, 2 * Math.PI);
	ctx.fill();

	ctx.restore();
}

return drawCat;
})();