/*global Canvas: true*/
Canvas =
(function () {
"use strict";

function Canvas (canvas, height, minWidth, maxWidth) {
	this.canvas = canvas;
	this.ctx = canvas.getContext('2d', {alpha: false});
	this.height = height;
	this.minWidth = minWidth;
	this.maxWidth = maxWidth;
	this.sky = this.ctx.createRadialGradient(100, 100, 50, 100, 100, height * 0.4);
	this.sky.addColorStop(0, '#006');
	this.sky.addColorStop(1, '#004');
	this.hills = this.ctx.createLinearGradient(0, 0, 0, height);
	this.hills.addColorStop(0, '#abb');
	this.hills.addColorStop(1, '#466');
	this.s = 1;
	this.resize();
	window.addEventListener('resize', this.resize.bind(this));
}

Canvas.prototype.resize = function () {
	var w, h, s;
	if (this.s !== 1) {
		this.ctx.restore();
	}
	//TODO also allow s > 1?
	if (window.innerHeight < this.height) {
		h = window.innerHeight;
		s = h / this.height;
	} else {
		h = this.height;
		s = 1;
	}
	w = Math.min(window.innerWidth, this.maxWidth * s);
	if (w < this.minWidth * s) {
		s = w / this.minWidth;
		h = s * this.height;
	}
	this.canvas.width = w;
	this.canvas.height = h;
	this.w = w / s;
	this.h = h / s;
	this.s = s;
	if (s !== 1) {
		this.ctx.save();
		this.ctx.scale(s, s);
	}
};

Canvas.prototype.fade = function (p) {
	this.ctx.fillStyle = 'rgba(0,0,0,' + p + ')';
	this.ctx.fillRect(0, 0, this.w, this.h);
};

Canvas.prototype.blockPaths = function (blocks, min, max, time) {
	var i;
	for (i = 0; i < blocks.length; i++) {
		if (blocks[i].min > max || blocks[i].max < min) {
			continue;
		}
		blocks[i].path(this.ctx, time);
	}
};

Canvas.prototype.setText = function (text) {
	this.text = text;
};

Canvas.prototype.showText = function () {
	if (!this.text) {
		return;
	}
	this.ctx.fillStyle = '#fff';
	this.ctx.textAlign = 'center';
	this.ctx.textBaseline = 'top';
	this.ctx.font = '30px sans-serif';
	this.ctx.fillText(this.text, this.w / 2, 15, this.w - 80 / this.s);
};

return Canvas;
})();