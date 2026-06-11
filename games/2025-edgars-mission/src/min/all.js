(function(){var storage, audio, Canvas, Curve, Block, Drone, Level, drawCat, Cat, keys, levels, intro;
/*global storage: true*/
storage =
(function () {
"use strict";

var key = 'schnark-js13k2025';

function get (defaultValue) {
	try {
		return JSON.parse(localStorage.getItem(key) || 'x');
	} catch (e) {
		return defaultValue;
	}
}

function set (value) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch (e) {
	}
}

return {
	get: get,
	set: set
};

})();/*global audio: true*/
audio =
(function () {
"use strict";

var audioMode = 2, isPlaying = false, AC, audioContext, nodes = [], staffs, lastTime, baseDur = 40 / 100;

function getFreq (note, key) {
	return key[note];
}

function getNode (time, type) {
	var i, osc, gain;
	type = type || 'sine';
	for (i = 0; i < nodes.length; i++) {
		if (nodes[i].osc.type === type && nodes[i].t < time) {
			return i;
		}
	}
	osc = audioContext.createOscillator();
	gain = audioContext.createGain();
	osc.type = type;
	gain.gain.value = 0;
	osc.connect(gain);
	gain.connect(audioContext.destination);
	osc.start();
	nodes.push({osc: osc, gain: gain});
	return nodes.length - 1;
}

function playNote (start, end, freq, volume) {
	var i = getNode(start);
	nodes[i].osc.frequency.setValueAtTime(freq, start);
	nodes[i].gain.gain.setValueAtTime(0.001, start);
	nodes[i].gain.gain.exponentialRampToValueAtTime(volume, start + 0.05);
	nodes[i].gain.gain.linearRampToValueAtTime(volume, end - 0.05);
	nodes[i].gain.gain.exponentialRampToValueAtTime(0.001, end);
	nodes[i].gain.gain.setValueAtTime(0, end + 0.01);
	nodes[i].t = end + 0.01;
}

function playNotes (notes, dur, start, key, volume) {
	var i, end = start + dur;
	for (i = 0; i < notes.length; i++) {
		playNote(start, end, getFreq(notes[i], key), volume);
	}
	return end;
}

function playStaff (staff) {
	var notes;
	while (staff.time - audioContext.currentTime < 0.3) {
		notes = staff.notes[staff.pos];
		if (notes[0][0] === 'z') {
			staff.time += notes[1] * baseDur;
		} else {
			staff.time = playNotes(
				notes[0], notes[1] * baseDur,
				staff.time,
				staff.key,
				staff.volume
			);
		}
		staff.pos = (staff.pos + 1) % staff.notes.length;
	}
}

function modifySpeed (speedModify, time) {
	var dt, dbD;
	if (lastTime) {
		dt = time - lastTime;
		if (speedModify) {
			dbD = speedModify * dt / 20;
		} else {
			dbD = 40 / 100 - baseDur;
			dbD = Math.max(dbD, -dt / 20);
			dbD = Math.min(dbD, dt / 20);
		}
		baseDur += dbD;
		baseDur = Math.max(baseDur, 15 / 100);
		baseDur = Math.min(baseDur, 65 / 100);
	}
	lastTime = time;
}

function playStaffs (speedModify) {
	var i, time;
	if (!isPlaying || audioMode !== 2) {
		return;
	}
	if (!audioContext) {
		audioContext = new AC();
	}
	modifySpeed(speedModify, audioContext.currentTime);
	for (i = 0; i < staffs.length; i++) {
		if (staffs[i].time === -1) {
			if (!time) {
				time = audioContext.currentTime + 0.1;
			}
			staffs[i].time = time;
		}
		playStaff(staffs[i]);
	}
}

function stop () {
	var i, time;
	isPlaying = false;
	if (!audioContext) {
		return;
	}
	time = audioContext.currentTime + 0.1;
	for (i = 0; i < nodes.length; i++) {
		nodes[i].osc.frequency.cancelScheduledValues(time);
		nodes[i].gain.gain.cancelScheduledValues(time);
		nodes[i].gain.gain.setValueAtTime(0, time);
		nodes[i].t = time;
	}
	for (i = 0; i < staffs.length; i++) {
		staffs[i].time = -1;
		staffs[i].pos = 0;
	}
}

function initStaff (notes, key, volume) {
	staffs.push({
		time: -1,
		pos: 0,
		notes: notes,
		key: key,
		volume: volume
	});
}

function parseNotes (notes) {
	return notes.split(' ').map(function (n) {
		var l;
		n = n.split(/([\^_]?[a-zA-Z][',]*)/);
		l = Number(n.pop() || 1);
		return [
			n.filter(function (a) {
				return a;
			}),
			l
		];
	});
}

function init (data, baseDur) {
	var i;
	staffs = [];
	for (i = 0; i < data.length; i++) {
		initStaff(parseNotes(data[i][0]), data[i][1], data[i][2], baseDur);
	}
}

function setMelody () {
	var cMajorOctaveLower = {
		//C: Math.pow(2, -9 / 12) * 220,
		'^C': Math.pow(2, -8 / 12) * 220,
		D: Math.pow(2, -7 / 12) * 220,
		E: Math.pow(2, -5 / 12) * 220,
		//F: Math.pow(2, -4 / 12) * 220,
		'^F': Math.pow(2, -3 / 12) * 220,
		G: Math.pow(2, -2 / 12) * 220,
		A: 220,
		B: Math.pow(2, 2 / 12) * 220,
		c: Math.pow(2, 3 / 12) * 220,
		d: Math.pow(2, 5 / 12) * 220
	},

	parts = [
		'D G B2 G D ^C2 D G B d c3',
		'B G A B A ^F G A G E ^F G4 z',
		'B d c B A c B A G B A ^F4 G z2'
	],
	melody = [], i, m;

	melody.push(parts[0], parts[1], parts[0], parts[2], parts[0]);
	for (i = 0; i < 10; i++) {
		m = parts[Math.max(0, Math.floor(Math.random() * 4) - 1)];
		if (Math.random() < 0.3) {
			m = m.split(' ').reverse().join(' ');
		}
		melody.push(m);
	}

	init([[melody.join(' '), cMajorOctaveLower, 0.2]]);
}

function generateSound (freq, incr, delay, times, vol, type) {
	//based on https://github.com/foumart/JS.13kGames/blob/master/lib/SoundFX.js
	//which is why the parameters are a little odd
	var i, start, end;

	if (!audioContext) {
		audioContext = new AC();
	}
	start = audioContext.currentTime + 0.01;
	end = start + delay * times / 1000;
	i = getNode(start, ['square', 'sawtooth', 'triangle', 'sine'][type || 0]);

	nodes[i].osc.frequency.setValueAtTime(freq, start);
	nodes[i].osc.frequency.linearRampToValueAtTime(freq + incr * times, end);
	nodes[i].gain.gain.setValueAtTime(vol, start);
	nodes[i].gain.gain.linearRampToValueAtTime(0, end);
	nodes[i].t = end;
}

function playSound (sound) {
	if (audioMode === 0) {
		return;
	}
	switch (sound) {
	case 'cat0': //start of jump
		generateSound(150, 30, 10, 20, 0.15);
		break;
	case 'cat1': //end of jump
		generateSound(100, -10, 15, 15, 0.7, 2);
		break;
	case 'end1':
		generateSound(100, -10, 10, 25, 0.5);
		generateSound(125, -5, 20, 45, 0.1, 1);
		generateSound(40, 2, 20, 20, 1, 2);
		generateSound(200, -4, 10, 100, 0.25, 2);
		break;
	case 'end2':
		generateSound(750, -30, 5, 20, 0.25);
		setTimeout(function () {
			generateSound(150, 30, 5, 20, 0.25);
		}, 100);
		break;
	case 'end3':
		generateSound(440, -15, 35, 15, 0.3, 2);
		break;
	case 'end-1':
		generateSound(510, 0, 15, 20, 0.1);
		setTimeout(function () {
			generateSound(2600, 1, 10, 50, 0.2);
		}, 80);
	}
}

AC = window.AudioContext || window.webkitAudioContext;
setMelody();

return {
	setMode: function (mode) {
		if (mode === audioMode) {
			return;
		}
		if (audioMode === 2 && isPlaying) {
			stop();
			isPlaying = true; //technically, we are still playing, just muted
		}
		audioMode = mode;
	},
	start: function () {
		isPlaying = true;
	},
	stop: stop,
	tick: AC ? playStaffs : function () {},
	sound: AC ? playSound : function () {}
};

})();/*global Canvas: true*/
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
})();/*global Curve: true*/
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
})();/*global Block: true*/
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
})();/*global Drone: true*/
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
})();/*global Level: true*/
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
})();/*global drawCat: true*/
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
})();/*global Cat: true*/
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
})();/*global keys: true*/
/*global Event*/
keys =
(function () {
"use strict";

var keys = {
	left: false,
	right: false,
	jump: false
}, audioCheckbox;

function getKey (e) {
	if (e.key && e.key !== 'Unidentified') {
		return {
			Left: 'ArrowLeft',
			Up: 'ArrowUp',
			Right: 'ArrowRight'
		}[e.key] || e.key;
	}
	return {
		37: 'ArrowLeft',
		38: 'ArrowUp',
		39: 'ArrowRight'
	}[e.which];
}

function getAction (e) {
	if (e.ctrlKey || e.altKey || e.shiftKey) {
		return;
	}
	switch (getKey(e)) {
	case 'a':
	case 'q':
	case 'ArrowLeft':
		return 'left';
	case 'd':
	case 'ArrowRight':
		return 'right';
	case 'w':
	case 'z':
	case ' ':
	case 'ArrowUp':
		return 'jump';
	case 'm':
		return 'audio';
	}
}

function handler (e) {
	var action = getAction(e);
	if (action === 'audio') {
		if (e.type === 'keydown') {
			audioCheckbox.checked = !audioCheckbox.checked;
			audioCheckbox.dispatchEvent(new Event('change'));
			e.preventDefault();
		}
	} else if (action) {
		keys[action] = e.type === 'keydown';
		e.preventDefault();
	}
}

audioCheckbox = document.getElementById('a');
document.addEventListener('keydown', handler);
document.addEventListener('keyup', handler);
document.addEventListener('blur', function () {
	keys.left = false;
	keys.right = false;
	keys.jump = false;
});

return keys;
})();/*global levels: true*/
/*global Curve, Block, Level*/

levels = [
	//Level 1-5: introduction
	//Level 1: only walking
	[new Level(
		new Curve([
			{x: 0, y: 600},
			{x: 200, y: 630, xc: 100, yc: 630},
			{x: 400, y: 600, xc: 300},
			{x: 800, y: 580, xc: 500},
			{x: 1200, y: 500, xc: 900},
			{x: 1500, y: 400, xc: 1400},
			{x: 1600, y: 600, xc: 1510},
			{x: 1800, y: 600, xc: 1700},
			{x: 2700, y: 600}
		]),
		[
			new Block(
				new Curve([{x: 1500, y: 400}, {x: 1900, y: 400}]),
				new Curve([{x: 1500, y: 480}, {x: 1900, y: 480}]),
				1
			),
			new Block(
				new Curve([{x: 1800, y: 430}, {x: 1830, y: 430}]),
				new Curve([{x: 1800, y: 630}, {x: 1830, y: 630}]),
				1
			),
			new Block(
				new Curve([{x: 1615, y: 630}, {x: 1785, y: 630}]),
				new Curve([{x: 1615, y: 670}, {x: 1785, y: 670, xc: 1697, yc: 850}]),
				3
			)
		],
		[],
		[600]
	), 'Use ←/→ or A/D to move.'],
	//Level 2: simple jumps
	[new Level(
		new Curve([
			{x: 0, y: 600},
			{x: 200, y: 630, xc: 50, yc: 600},
			{x: 400, y: 620, xc: 350},
			{x: 800, y: 580, xc: 450},
			{x: 1250, y: 500},
			{x: 1400, y: 550, xc: 1300, yc: 480},
			{x: 3300, y: 600, xc: 1600}
		]),
		[
			new Block(
				new Curve([{x: 800, y: 550}, {x: 950, y: 550}]),
				new Curve([{x: 800, y: 620}, {x: 950, y: 620}]),
				1
			),
			new Block(
				new Curve([{x: 1400, y: 380}, {x: 1850, y: 360, xc: 1600, yc: 350}]),
				new Curve([{x: 1400, y: 450}, {x: 1850, y: 450}]),
				0
			),
			new Block(
				new Curve([{x: 2000, y: 230}, {x: 2500, y: 230}]),
				new Curve([{x: 2000, y: 290}, {x: 2500, y: 290}]),
				1
			),
			new Block(
				new Curve([{x: 2050, y: 240}, {x: 2070, y: 240}]),
				new Curve([{x: 2050, y: 730}, {x: 2070, y: 730}]),
				1
			),
			new Block(
				new Curve([{x: 2430, y: 240}, {x: 2450, y: 240}]),
				new Curve([{x: 2430, y: 730}, {x: 2450, y: 730}]),
				1
			),
			new Block(
				new Curve([{x: 2600, y: 430}, {x: 2800, y: 430}]),
				new Curve([{x: 2600, y: 490}, {x: 2800, y: 490}]),
				1
			)
		]
	), 'Use ↑ or W or Space to jump.'],
	//Level 3: first deadly obstacles
	[new Level(
		new Curve([
			{x: 0, y: 600},
			{x: 200, y: 640},
			{x: 400, y: 610, xc: 300, yc: 620},
			{x: 800, y: 580, xc: 600},
			{x: 1200, y: 500, xc: 1000},
			{x: 1400, y: 600, xc: 1250},
			{x: 1401, y: 650},
			{x: 1499, y: 650},
			{x: 1500, y: 600},
			{x: 2000, y: 600},
			{x: 2001, y: 620},
			{x: 2999, y: 620},
			{x: 3000, y: 600},
			{x: 3600, y: 590}
		]),
		[
			new Block(
				new Curve([{x: 600, y: 570}, {x: 800, y: 570, xc: 750, yc: 520}]),
				new Curve([{x: 600, y: 620}, {x: 800, y: 620, xc: 700, yc: 650}]),
				2
			),
			new Block(
				new Curve([{x: 1400, y: 600}, {x: 1500, y: 600}]),
				new Curve([{x: 1400, y: 700}, {x: 1500, y: 700, xc: 1450, yc: 800}]),
				3
			),
			new Block(
				new Curve([{x: 2000, y: 600}, {x: 3000, y: 600}]),
				new Curve([{x: 2000, y: 650}, {x: 3000, y: 650, xc: 2500, yc: 700}]),
				3
			),
			new Block(
				new Curve([{x: 2200, y: 400}, {x: 2700, y: 400, xc: 2450, yc: 350}]),
				new Curve([{x: 2200, y: 480}, {x: 2700, y: 480, xc: 2450, yc: 500}]),
				0
			),
			new Block(
				new Curve([{x: 2400, y: 370}, {x: 2500, y: 370, xc: 2450, yc: 320}]),
				new Curve([{x: 2400, y: 420}, {x: 2500, y: 420}]),
				2
			)
		]
	), 'Be careful!', [2, 3]],
	//Level 4: more complex jumps
	[new Level(
		new Curve([
			{x: 0, y: 550},
			{x: 200, y: 600, xc: 100, yc: 580},
			{x: 400, y: 570, xc: 250},
			{x: 1000, y: 600, xc: 600},
			{x: 1700, y: 600, xc: 1400}
		]),
		[
			new Block(
				new Curve([{x: 700, y: 250}, {x: 900, y: 250, xc: 800, yc: 200}]),
				new Curve([{x: 700, y: 630}, {x: 900, y: 630}]),
				1
			)
		]
	), 'To climb a wall jump against it, then jump again.'],
	//Level 5: drones
	[new Level(
		new Curve([
			{x: 0, y: 600},
			{x: 3600, y: 600, xc: 1800, yc: 400}
		]),
		[],
		[
			[900, 1700, 0.08],
			[1800, 3000, 0.12]
		],
		[1100, 2800]
	), 'Watch out for drones!', [1]],
	//more levels
	//walk above thorns
	[new Level(
		new Curve([
			{x: 0, y: 600},
			{x: 3600, y: 600, xc: 1800, yc: 495}
		]),
		[
			new Block(
				new Curve([{x: 600, y: 550}, {x: 3000, y: 550}]),
				new Curve([{x: 600, y: 650}, {x: 3000, y: 650}]),
				2
			),
			new Block(
				new Curve([{x: 0, y: 350}, {x: 300, y: 400}]),
				new Curve([{x: 0, y: 450}, {x: 300, y: 500}]),
				0
			),
			new Block(
				new Curve([{x: 600, y: 200}, {x: 1600, y: 200}]),
				new Curve([{x: 600, y: 280}, {x: 1600, y: 280}]),
				1
			),
			new Block(
				new Curve([{x: 2000, y: 200}, {x: 3000, y: 200}]),
				new Curve([{x: 2000, y: 280}, {x: 3000, y: 280}]),
				1
			)
		]
	)],
	//drones and thorns
	[new Level(
		new Curve([
			{x: 0, y: 600},
			{x: 1000, y: 600, xc: 500, yc: 650},
			{x: 2000, y: 600, xc: 1500},
			{x: 3000, y: 600, xc: 2500}
		]),
		[
			new Block(
				new Curve([{x: 600, y: 600}, {x: 700, y: 600, xc: 650, yc: 580}]),
				new Curve([{x: 600, y: 650}, {x: 700, y: 650}]),
				2
			),
			new Block(
				new Curve([{x: 1000, y: 570}, {x: 1100, y: 570, xc: 1050, yc: 550}]),
				new Curve([{x: 1000, y: 620}, {x: 1100, y: 620}]),
				2
			),
			new Block(
				new Curve([{x: 1400, y: 560}, {x: 1500, y: 560, xc: 1450, yc: 540}]),
				new Curve([{x: 1400, y: 610}, {x: 1500, y: 610}]),
				2
			),
			new Block(
				new Curve([{x: 1800, y: 570}, {x: 1900, y: 570, xc: 1850, yc: 550}]),
				new Curve([{x: 1800, y: 620}, {x: 1900, y: 620}]),
				2
			),
			new Block(
				new Curve([{x: 2200, y: 600}, {x: 2300, y: 600, xc: 2250, yc: 580}]),
				new Curve([{x: 2200, y: 650}, {x: 2300, y: 650}]),
				2
			),
			new Block(
				new Curve([{x: 2600, y: 600}, {x: 2700, y: 600, xc: 2650, yc: 580}]),
				new Curve([{x: 2600, y: 650}, {x: 2700, y: 650}]),
				2
			)
		],
		[[500, 1200], [1600, 2500], [1750, 2650]],
		[850, 2050]
	)],
	//platforms over water
	[new Level(
		new Curve([
			{x: 0, y: 600},
			{x: 300, y: 600},
			{x: 301, y: 620},
			{x: 2999, y: 620},
			{x: 3000, y: 600},
			{x: 3500, y: 600}
		]),
		[
			new Block(
				new Curve([{x: 300, y: 600}, {x: 3000, y: 600}]),
				new Curve([{x: 300, y: 650}, {x: 3000, y: 650, xc: 1650, yc: 700}]),
				3
			),
			new Block(
				new Curve([{x: 400, y: 500}, {x: 700, y: 500}]),
				new Curve([{x: 400, y: 550}, {x: 700, y: 550, xc: 550, yc: 600}]),
				0
			),
			new Block(
				new Curve([{x: 900, y: 350}, {x: 1150, y: 350}]),
				new Curve([{x: 900, y: 450}, {x: 1150, y: 450}]),
				1
			),
			new Block(
				new Curve([{x: 1400, y: 200}, {x: 1600, y: 200, xc: 1500, yc: 180}]),
				new Curve([{x: 1400, y: 300}, {x: 1600, y: 300, xc: 1500, yc: 350}]),
				0
			),
			new Block(
				new Curve([{x: 1750, y: 150}, {x: 1850, y: 150, xc: 1800, yc: 100}]),
				new Curve([{x: 1750, y: 180}, {x: 1850, y: 180, xc: 1800, yc: 230}]),
				2
			),
			new Block(
				new Curve([{x: 1750, y: 0}, {x: 1850, y: 0, xc: 1800, yc: -50}]),
				new Curve([{x: 1750, y: 30}, {x: 1850, y: 30, xc: 1800, yc: 80}]),
				2
			),
			new Block(
				new Curve([{x: 1850, y: 500}, {x: 2000, y: 500}]),
				new Curve([{x: 1850, y: 600}, {x: 2000, y: 600}]),
				1
			),
			new Block(
				new Curve([{x: 2100, y: 250}, {x: 2400, y: 200, xc: 2300, yc: 200}]),
				new Curve([{x: 2100, y: 450}, {x: 2400, y: 450}]),
				0
			)
		]
	)],
	//long jumps and a drone
	[new Level(
		new Curve([
			{x: 0, y: 600},
			{x: 260, y: 600},
			{x: 261, y: 620},
			{x: 799, y: 620},
			{x: 800, y: 600},
			{x: 1300, y: 600},
			{x: 1301, y: 620},
			{x: 1799, y: 620},
			{x: 1800, y: 600},
			{x: 2300, y: 600},
			{x: 2301, y: 620},
			{x: 2839, y: 620},
			{x: 2840, y: 600},
			{x: 3300, y: 600}
		]),
		[
			new Block(
				new Curve([{x: 260, y: 600}, {x: 800, y: 600}]),
				new Curve([{x: 260, y: 650}, {x: 800, y: 650, xc: 530, yc: 700}]),
				3
			),
			new Block(
				new Curve([{x: 1300, y: 600}, {x: 1800, y: 600}]),
				new Curve([{x: 1300, y: 650}, {x: 1800, y: 650, xc: 1550, yc: 700}]),
				3
			),
			new Block(
				new Curve([{x: 2300, y: 600}, {x: 2840, y: 600}]),
				new Curve([{x: 2300, y: 650}, {x: 2840, y: 650, xc: 2570, yc: 700}]),
				3
			)
		],
		[[1100, 2000]],
		[1100, 2000]
	)],
	//jumps below thorns
	[new Level(
		new Curve([
			{x: 0, y: 600},
			{x: 1000, y: 600, xc: 500, yc: 650},
			{x: 1800, y: 600, xc: 1500},
			{x: 2000, y: 600},
			{x: 2001, y: 630},
			{x: 2199, y: 630},
			{x: 2200, y: 600},
			{x: 2350, y: 600},
			{x: 2351, y: 630},
			{x: 2499, y: 630},
			{x: 2500, y: 600},
			{x: 3000, y: 600}
		]),
		[
			new Block(
				new Curve([{x: 850, y: 500}, {x: 1050, y: 500, xc: 950, yc: 450}]),
				new Curve([{x: 850, y: 630}, {x: 1050, y: 630}]),
				2
			),
			new Block(
				new Curve([{x: 850, y: 200}, {x: 1050, y: 200}]),
				new Curve([{x: 850, y: 350}, {x: 1050, y: 350, xc: 950, yc: 300}]),
				2
			),
			new Block(
				new Curve([{x: 1450, y: 400}, {x: 1500, y: 400}]),
				new Curve([{x: 1450, y: 600}, {x: 1500, y: 600}]),
				2
			),
			new Block(
				new Curve([{x: 1450, y: 120}, {x: 1500, y: 120}]),
				new Curve([{x: 1450, y: 270}, {x: 1500, y: 270}]),
				2
			),
			new Block(
				new Curve([{x: 2000, y: 600}, {x: 2200, y: 600}]),
				new Curve([{x: 2000, y: 670}, {x: 2200, y: 670, xc: 2100, yc: 690}]),
				3
			),
			new Block(
				new Curve([{x: 2350, y: 600}, {x: 2500, y: 600}]),
				new Curve([{x: 2350, y: 670}, {x: 2500, y: 670, xc: 2425, yc: 690}]),
				3
			),
			new Block(
				new Curve([{x: 2050, y: 300}, {x: 2450, y: 300, xc: 2250, yc: 280}]),
				new Curve([{x: 2050, y: 400}, {x: 2450, y: 400, xc: 2250, yc: 420}]),
				2
			)
		]
	)],
	//many drones
	[new Level(
		new Curve([
			{x: 0, y: 600},
			{x: 3600, y: 600, xc: 1800, yc: 500}
		]),
		[],
		[
			[-500, 500, 0.05],
			[300, 1000],
			[600, 1300, 0.12],
			[900, 2400],
			[1400, 2800],
			[1600, 3000, 0.12],
			[2200, 3400, 0.09],
			[3000, 3700, 0.2]
		],
		[800, 2000, 2800]
	)],
	//many platforms
	[new Level(
		new Curve([
			{x: 0, y: 600},
			{x: 1000, y: 600, xc: 500, yc: 550},
			{x: 2000, y: 600, xc: 1500},
			{x: 3000, y: 600, xc: 2500},
			{x: 4000, y: 600, xc: 3500},
			{x: 5000, y: 600, xc: 4500}
		]),
		[
			new Block(
				new Curve([{x: 350, y: 450}, {x: 550, y: 450, xc: 450, yc: 430}]),
				new Curve([{x: 350, y: 520}, {x: 550, y: 520, xc: 450, yc: 550}]),
				0
			),
			new Block(
				new Curve([{x: 750, y: 250}, {x: 950, y: 250, xc: 850, yc: 230}]),
				new Curve([{x: 750, y: 320}, {x: 950, y: 320, xc: 850, yc: 350}]),
				0
			),
			new Block(
				new Curve([{x: 1250, y: 150}, {x: 1450, y: 150, xc: 1350, yc: 130}]),
				new Curve([{x: 1250, y: 220}, {x: 1450, y: 220, xc: 1350, yc: 250}]),
				0
			),
			new Block(
				new Curve([{x: 1750, y: 150}, {x: 1950, y: 150, xc: 1850, yc: 130}]),
				new Curve([{x: 1750, y: 220}, {x: 1950, y: 220, xc: 1850, yc: 250}]),
				0
			),
			new Block(
				new Curve([{x: 2350, y: 150}, {x: 2550, y: 150, xc: 2450, yc: 130}]),
				new Curve([{x: 2350, y: 220}, {x: 2550, y: 220, xc: 2450, yc: 250}]),
				0
			),
			new Block(
				new Curve([{x: 2850, y: 150}, {x: 3000, y: 150, xc: 2925, yc: 130}]),
				new Curve([{x: 2850, y: 220}, {x: 3000, y: 220, xc: 2925, yc: 250}]),
				0
			),
			new Block(
				new Curve([{x: 3350, y: 150}, {x: 3500, y: 150, xc: 3425, yc: 130}]),
				new Curve([{x: 3350, y: 220}, {x: 3500, y: 220, xc: 3425, yc: 250}]),
				0
			),
			new Block(
				new Curve([{x: 3600, y: 200}, {x: 3700, y: 200}]),
				new Curve([{x: 3600, y: 650}, {x: 3700, y: 650}]),
				2
			)
		]
	)],
	//a chasing drone
	[new Level(
		new Curve([
			{x: 0, y: 600},
			{x: 1000, y: 600, xc: 500, yc: 550},
			{x: 2000, y: 600, xc: 1500},
			{x: 3000, y: 600, xc: 2500},
			{x: 4000, y: 600, xc: 3500},
			{x: 5000, y: 600, xc: 4500}
		]),
		[
			new Block(
				new Curve([{x: 600, y: 450}, {x: 650, y: 450}]),
				new Curve([{x: 600, y: 650}, {x: 650, y: 650}]),
				1
			),
			new Block(
				new Curve([{x: 1150, y: 590}, {x: 1330, y: 600}]),
				new Curve([{x: 1150, y: 640}, {x: 1330, y: 650}]),
				2
			),
			new Block(
				new Curve([{x: 1900, y: 450}, {x: 2000, y: 450}]),
				new Curve([{x: 1900, y: 650}, {x: 2000, y: 650}]),
				1
			),
			new Block(
				new Curve([{x: 2500, y: 550}, {x: 2700, y: 550}]),
				new Curve([{x: 2500, y: 600}, {x: 2700, y: 600}]),
				2
			),
			new Block(
				new Curve([{x: 3500, y: 450}, {x: 3550, y: 450}]),
				new Curve([{x: 3500, y: 670}, {x: 3550, y: 670}]),
				1
			),
			new Block(
				new Curve([{x: 4100, y: 560}, {x: 4300, y: 550}]),
				new Curve([{x: 4100, y: 610}, {x: 4300, y: 600}]),
				2
			)
		],
		[[-400, 5000, 0.195]]
	), 'RUN!']
];/*global intro: true*/
/*global Canvas, Curve, Level*/
intro =
(function () {
"use strict";

var canvas = new Canvas(document.getElementById('i'), 250, 450, 450),
	level = new Level(new Curve([{x: 0, y: 210}, {x: 500, y: 240, xc: 250, yc: 190}]), []);
level.intro = true;

function setLabel (label) {
	level.next = label;
}

function start () {
	level.run(canvas, null, function () {});
}

function stop () {
	level.stop = true;
}

return {
	setLabel: setLabel,
	start: start,
	stop: stop
};

})();/*global storage, audio, Canvas, levels, intro*/
(function () {
"use strict";

var i, l, canvas, state, hints, hintsForLevel, audioCheckbox, continueGame, newGame;

l = levels.length;
for (i = 0; i < l - 1; i++) {
	levels[i][0].next = (i + 2) + '/' + l;
}
levels[l - 1][0].next = 'End';

canvas = new Canvas(document.getElementById('c'), 700, 900, 1400); //700 = nominal height of level

state = storage.get({
	level: 0,
	deaths: 0,
	time: 0,
	hints: [-1],
	audio: true
});

hints = [
	'',
	'As a black cat, you can hide from drones in the shadows below trees.',
	'Keep away from thorns.',
	'Keep away from water.'
];

function formatTime (t) {
	var parts = [], i;
	parts.unshift(t % 60);
	t = Math.floor(t / 60);
	parts.unshift(t % 60);
	t = Math.floor(t / 60);
	if (t) {
		parts.unshift(t);
	}
	for (i = 1; i < parts.length; i++) {
		if (parts[i] < 10) {
			parts[i] = '0' + parts[i];
		}
	}
	return parts.join(':');
}

function onMsg (msg) {
	var showMsg = false, hint, time;
	if (state.hints.indexOf(msg) === -1) {
		state.hints.push(msg);
		showMsg = true;
	}
	if (hintsForLevel.indexOf(msg) > -1) {
		showMsg = true;
	}
	if (showMsg) {
		if (msg === -1) {
			time = formatTime(Math.round(state.time / 1000));
			switch (state.deaths) {
			case 0:
				hint = 'You win without ever dying after ' + time + '!';
				break;
			case 1:
				hint = 'You win (after having died once) after ' + time + '!';
				break;
			default:
				hint = 'You win (after having died ' + state.deaths + ' times) after ' + time + '!';
			}
			hints[msg] = hint;
		}
		canvas.setText(hints[msg]);
	}
	audio.sound('end' + msg);
}

function playLevel (n, callback) {
	var level = levels[n], start;

	function onEnd (end) {
		state.time += (Date.now() - start);
		if (end !== -1) {
			state.deaths++;
			storage.set(state);
			start = Date.now();
			level[0].run(canvas, onMsg, onEnd);
		} else {
			state.level++;
			storage.set(state);
			callback();
		}
	}

	hintsForLevel = level[2] || [];
	if (n === levels.length - 1) {
		hintsForLevel.push(-1);
	}
	canvas.setText(level[1]);
	state.level = n;
	start = Date.now();
	level[0].run(canvas, onMsg, onEnd);
}

function playLevels (n, callback) {
	if (n === levels.length) {
		callback();
	} else {
		playLevel(n, function () {
			playLevels(n + 1, callback);
		});
	}
}

function run (newGame) {
	if (newGame) {
		state.level = 0;
		state.deaths = 0;
		state.time = 0;
	}
	intro.stop();
	document.getElementById('s').hidden = true;
	document.getElementById('g').hidden = false;
	audio.start();
	playLevels(state.level, function () {
		state.level = 0;
		state.deaths = 0;
		state.time = 0;
		storage.set(state);
		canvas.ctx.fillText('Finally! I found my owner!', canvas.w / 2, 200, canvas.w);
		canvas.ctx.fillText('Now where is my dinner?', canvas.w / 2, 250, canvas.w);
	});
}

audioCheckbox = document.getElementById('a');
continueGame = document.getElementById('p');
newGame = document.getElementById('n');
audioCheckbox.checked = state.audio;
audio.setMode(state.audio ? 2 : 0);
audioCheckbox.addEventListener('change', function () {
	state.audio = audioCheckbox.checked;
	//we actually could disable music without also disabling sounds
	//but it doesn't seem worth the trouble
	audio.setMode(state.audio ? 2 : 0);
	storage.set(state);
});
if (state.level === 0) {
	continueGame.style.display = 'none';
	newGame.textContent = 'Start game';
} else {
	newGame.addEventListener('mouseenter', function () {
		intro.setLabel('1/' + levels.length);
	});
	newGame.addEventListener('mouseleave', function () {
		intro.setLabel((state.level + 1) + '/' + levels.length);
	});
	newGame.addEventListener('focus', function () {
		intro.setLabel('1/' + levels.length);
	});
	newGame.addEventListener('blur', function () {
		intro.setLabel((state.level + 1) + '/' + levels.length);
	});
}
intro.setLabel((state.level + 1) + '/' + levels.length);
intro.start();
continueGame.addEventListener('click', function () {
	run();
});
newGame.addEventListener('click', function () {
	run(true);
});
document.getElementById('i').addEventListener('click', function () {
	run();
});

})();})()
