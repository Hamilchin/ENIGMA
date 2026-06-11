/*global Drone: true*/
Drone =
(function () {
"use strict";

function Drone (min, max, v) {
	this.min = min;
	this.max = max;
	this.v = v;
	this.x = min;
}

Drone.prototype.move = function (dt) {
	this.x += this.v * dt;
	if (this.x > this.max) {
		this.x = 2 * this.max - this.x;
		this.v *= -1;
	} else if (this.x < this.min) {
		this.x = 2 * this.min - this.x;
		this.v *= -1;
	}
};

Drone.prototype.draw = function (ctx, y) {
	var lr = this.x % 1 < 0.5;
	ctx.fillStyle = '#aaa';
	ctx.strokeStyle = '#888';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.rect(this.x - 40, y + 15, 80, 25);
	ctx.moveTo(this.x - 30, y + 15);
	ctx.quadraticCurveTo(this.x, y + 5, this.x + 30, y + 15);
	ctx.fill();

	ctx.beginPath();
	ctx.moveTo(this.x - 40, y + 15);
	ctx.lineTo(this.x - 50, y);
	ctx.lineTo(this.x - 30, y + 15);
	ctx.moveTo(this.x + 40, y + 15);
	ctx.lineTo(this.x + 50, y);
	ctx.lineTo(this.x + 30, y + 15);

	ctx.moveTo(this.x - 50, y);
	ctx.lineTo(this.x - (lr ? 40 : 60), y);
	ctx.moveTo(this.x + 50, y);
	ctx.lineTo(this.x + (lr ? 40 : 60), y);
	ctx.stroke();
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(this.x - 50, y);
	ctx.lineTo(this.x - (lr ? 60 : 40), y);
	ctx.moveTo(this.x + 50, y);
	ctx.lineTo(this.x + (lr ? 60 : 40), y);
	ctx.stroke();
};

return Drone;
})();