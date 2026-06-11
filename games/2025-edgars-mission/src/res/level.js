/*global Level: true*/
/*global Curve, Drone, Cat, audio, keys*/
Level =
(function () {
"use strict";

var MOON = '#aa8',
	//SKY = '#004',
	//HILL = '#688',
	GRASS = '#001a00',
	WOOD = '#100',
	THORNS = '#200',
	WATER = '#002',
	SHADOW = '#111';

function Level (ground, blocks, drones, shadows) {
	var hillData = [], x, y, i;
	this.ground = ground;
	this.blocks = [[], [], [], []];
	for (i = 0; i < blocks.length; i++) {
		this.blocks[blocks[i].type].push(blocks[i]);
	}
	this.droneData = drones || [];
	this.shadows = shadows || [];
	this.min = ground.min;
	this.max = ground.max;

	x = this.min;
	y = 100 + 50 * Math.random();
	hillData.push({x: x, y: y});
	while (x < this.max) {
		x += 100 + 100 * Math.random();
		y = 100 + 50 * Math.random();
		hillData.push({x: x, y: y});
	}
	this.hills = new Curve(hillData);
}

Level.prototype.run = function (canvas, onMsg, onEnd) {
	var cat, t0, start, end,
		level = this,
		rAF = window.requestAnimationFrame || window.mozRequestAnimationFrame;
	this.startTime = 0;
	this.endTime = 0;
	this.animationTime = 0;
	this.drones = this.droneData.map(function (data) {
		return new Drone(data[0], data[1], data[2] || 0.1);
	});

	function moveStep (dt) {
		var i;
		for (i = 0; i < level.drones.length; i++) {
			level.drones[i].move(dt);
		}
		end = cat.move(keys.left, keys.right, keys.jump, dt);
	}

	function move (dt) {
		var MAX_DT = 50;
		while (dt > MAX_DT) {
			dt -= MAX_DT;
			moveStep(MAX_DT);
			if (end) {
				return;
			}
		}
		if (dt) {
			moveStep(dt);
		}
	}

	function loop (t) {
		var dt = 0, musicSpeed, stopLoop;
		if (!level.intro) {
			if (start || end) {
				musicSpeed = 0;
			} else if (Math.abs(cat.vx) > 0.1 || Math.abs(cat.vy) > 0.15) {
				musicSpeed = -1;
			} else {
				musicSpeed = 1;
			}
			audio.tick(musicSpeed);
		}
		if (t0) {
			dt = t - t0;
			if (!start && !end) {
				move(dt);
				if (end) {
					onMsg(end);
				}
			} else if (start || end === -1) {
				cat.move(false, false, false, dt);
			}
		}

		if (start) {
			start = !level.drawStart(canvas, cat, dt);
		} else if (end) {
			stopLoop = level.drawEnd(canvas, cat, dt, end);
		} else {
			level.draw(canvas, cat, dt);
		}
		if (!start && !end && (keys.left || keys.right || keys.jump)) {
			canvas.setText();
		}
		canvas.showText();

		t0 = t;
		if (level.intro && level.stop) {
			stopLoop = true;
		}
		if (!stopLoop) {
			rAF(loop);
		} else {
			onEnd(end);
		}
	}

	start = true;
	cat = new Cat(level);
	rAF(loop);
};

Level.prototype.insideBlock = function (x, y) {
	var i, inside;
	for (i = 0; i < this.blocks[0].length; i++) {
		inside = this.blocks[0][i].inside(x, y);
		if (inside) {
			return inside;
		}
	}
	for (i = 0; i < this.blocks[1].length; i++) {
		inside = this.blocks[1][i].inside(x, y);
		if (inside) {
			return inside;
		}
	}
};

Level.prototype.getEnd = function (x, y) {
	var i;
	for (i = 0; i < this.blocks[2].length; i++) {
		if (this.blocks[2][i].inside(x, y)) {
			return 2;
		}
	}
	for (i = 0; i < this.blocks[3].length; i++) {
		if (this.blocks[3][i].inside(x, y)) {
			return 3;
		}
	}
	if (x >= this.max - 140) {
		return -1;
	}
};

Level.prototype.getDroneEnd = function (x, y) {
	var i;
	for (i = 0; i < this.shadows.length; i++) {
		if (Math.abs(this.shadows[i] - x) < 60 && this.ground.y(x) - y < 40) {
			return;
		}
	}
	for (i = 0; i < this.drones.length; i++) {
		if (Math.abs(this.drones[i].x - x) < 10) {
			return 1;
		}
	}
};

function drawTree (ctx, l, a) {
	var d;
	if (l < 2) {
		return;
	}
	d = l / 4;
	ctx.rect(-d / 2, -l, d, l);
	ctx.save();
	ctx.translate(-d * 0.2, 5 - l);
	ctx.rotate(-0.3 + a);
	drawTree(ctx, l * 0.6, a);
	ctx.restore();
	ctx.save();
	ctx.translate(d * 0.2, 5 - l);
	ctx.rotate(0.4 + a);
	drawTree(ctx, l * 0.7, a);
	ctx.restore();
}

Level.prototype.draw = function (canvas, cat, dt, noCatNoRestore) {
	var dx, dy, x, y, i;
	dx = (cat.x0 + cat.x1) / 2 - canvas.w / 2;
	dx = Math.min(this.max - canvas.w, dx);
	dx = Math.max(0, dx);
	dy = (cat.y0 + cat.y1) / 2 - canvas.h / 3;
	dy = Math.min(0, dy);
	this.animationTime += dt;

	//background
	canvas.ctx.fillStyle = canvas.sky;
	canvas.ctx.fillRect(0, 0, canvas.w, canvas.h);
	canvas.ctx.fillStyle = MOON;
	canvas.ctx.beginPath();
	canvas.ctx.arc(100, 100, 55, 0, 2 * Math.PI);
	canvas.ctx.fill();

	canvas.ctx.save();
	canvas.ctx.translate(-dx / 2, -0.25 * dy);

	//hills
	canvas.ctx.fillStyle = canvas.hills;
	canvas.ctx.beginPath();
	canvas.ctx.moveTo(this.min, canvas.h);
	this.hills.path(canvas.ctx);
	canvas.ctx.lineTo(this.max, canvas.h);
	canvas.ctx.closePath();
	canvas.ctx.fill();

	canvas.ctx.translate(-dx / 2, -0.75 * dy);

	//sign post at the end
	if (dx > this.max - canvas.w - 200) {
		y = this.ground.y(this.max - 140);
		canvas.ctx.fillStyle = WOOD;
		canvas.ctx.beginPath();
		canvas.ctx.rect(this.max - 150, y - 200, 20, 220);
		canvas.ctx.moveTo(this.max - 190, y - 170);
		canvas.ctx.lineTo(this.max - 95, y - 170);
		canvas.ctx.lineTo(this.max - 80, y - 155);
		canvas.ctx.lineTo(this.max - 95, y - 140);
		canvas.ctx.lineTo(this.max - 190, y - 140);
		canvas.ctx.closePath();
		canvas.ctx.fill();
		canvas.ctx.fillStyle = MOON;
		canvas.ctx.font = '20px sans-serif';
		canvas.ctx.textAlign = 'left';
		canvas.ctx.textBaseline = 'alphabetic';
		canvas.ctx.fillText(this.next, this.max - 160, y - 150);
	}

	//drones
	for (i = 0; i < this.drones.length; i++) {
		this.drones[i].draw(canvas.ctx, 10 + dy);
	}

	//shadows
	canvas.ctx.fillStyle = SHADOW;
	canvas.ctx.beginPath();
	for (i = 0; i < this.shadows.length; i++) {
		x = this.shadows[i];
		if (x - 110 > dx + canvas.w || x + 110 < dx) {
			continue;
		}
		y = this.ground.y(x);
		canvas.ctx.moveTo(x - 110, this.ground.y(x - 110) + 30);
		canvas.ctx.bezierCurveTo(x - 90, y - 140, x + 90, y - 140, x + 110, this.ground.y(x + 110) + 30);
		canvas.ctx.closePath();
	}
	canvas.ctx.fill();
	canvas.ctx.fillStyle = WOOD;
	canvas.ctx.beginPath();
	for (i = 0; i < this.shadows.length; i++) {
		x = this.shadows[i];
		if (x - 110 > dx + canvas.w || x + 110 < dx) {
			continue;
		}
		y = this.ground.y(x);
		canvas.ctx.save();
		canvas.ctx.translate(x - 50, y + 10);
		drawTree(canvas.ctx, 100, 0.05 * Math.sin(this.animationTime / 1500));
		canvas.ctx.restore();
	}
	canvas.ctx.fill();

	//ground and grass blocks
	canvas.ctx.fillStyle = GRASS;
	canvas.ctx.beginPath();
	canvas.ctx.moveTo(this.min, canvas.h);
	this.ground.path(canvas.ctx);
	canvas.ctx.lineTo(this.max, canvas.h);
	canvas.ctx.closePath();
	canvas.blockPaths(this.blocks[0], dx, dx + canvas.w, this.animationTime);
	canvas.ctx.fill();

	//cat
	if (!noCatNoRestore) {
		cat.draw(canvas.ctx);
	}

	//grass
	canvas.ctx.fillStyle = GRASS;
	canvas.ctx.beginPath();
	this.ground.grass(canvas.ctx, dx, dx + canvas.w, this.animationTime);
	for (i = 0; i < this.blocks[0].length; i++) {
		this.blocks[0][i].top.grass(canvas.ctx, dx, dx + canvas.w, this.animationTime);
	}
	canvas.ctx.fill();

	//wood/brick blocks
	canvas.ctx.fillStyle = WOOD;
	canvas.ctx.beginPath();
	canvas.blockPaths(this.blocks[1], dx, dx + canvas.w, this.animationTime);
	canvas.ctx.fill();

	//thorns and rivers
	canvas.ctx.fillStyle = THORNS;
	canvas.ctx.beginPath();
	canvas.blockPaths(this.blocks[2], dx, dx + canvas.w, this.animationTime);
	canvas.ctx.fill();
	canvas.ctx.fillStyle = WATER;
	canvas.ctx.beginPath();
	canvas.blockPaths(this.blocks[3], dx, dx + canvas.w, this.animationTime);
	canvas.ctx.fill();

	if (!noCatNoRestore) {
		canvas.ctx.restore();
	}
};

Level.prototype.drawStart = function (canvas, cat, dt) {
	this.draw(canvas, cat, dt);
	if (this.intro) {
		return;
	}
	this.startTime += dt;
	canvas.fade(1 - this.startTime / 500);
	return this.startTime > 500;
};

Level.prototype.drawEnd = function (canvas, cat, dt, end) {
	var x, y, i;
	this.endTime += dt;
	this.draw(canvas, cat, dt, end !== -1);
	x = (cat.x0 + cat.x1) / 2;
	y = (cat.y0 + cat.y1) / 2;
	switch (end) {
	case 1:
		canvas.ctx.strokeStyle = '#f00';
		canvas.ctx.lineWidth = 2;
		canvas.ctx.beginPath();
		canvas.ctx.moveTo(x, y);
		canvas.ctx.lineTo(x, 50 + Math.min(0, y - canvas.h / 3));
		canvas.ctx.stroke();
		/*falls through*/
	case 2:
		canvas.ctx.translate(x, y + this.endTime * this.endTime / 3000);
		canvas.ctx.fillStyle = '#000';
		for (i = 0; i < 100; i++) {
			canvas.ctx.beginPath();
			canvas.ctx.arc(0, (i + 1) * this.endTime / 180, 4, 0, 2 * Math.PI);
			canvas.ctx.fill();
			canvas.ctx.rotate(2.4); //this is the so-called golden angle
		}
		canvas.ctx.restore();
		break;
	case 3:
		canvas.ctx.fillStyle = WATER;
		canvas.ctx.beginPath();
		canvas.ctx.arc(x, y, this.endTime, 0, 2 * Math.PI);
		canvas.ctx.fill();
		cat.draw(canvas.ctx);
		canvas.ctx.restore();
	}
	canvas.fade(this.endTime / 1500);
	return this.endTime > 1500;
};

return Level;
})();