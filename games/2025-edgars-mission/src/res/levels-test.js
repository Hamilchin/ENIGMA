/*global Cat, Canvas, audio, levels*/
(function () {
"use strict";

var xPos, yPos, setCat, endLevel,
	levelSelect = document.getElementById('l'),
	xPosOutput = document.getElementById('x'),
	yPosOutput = document.getElementById('y'),
	deathOutput = document.getElementById('d'),
	reloadButton = document.getElementById('r'),
	canvas = new Canvas(document.getElementById('c'), 700, 700, 1400);

audio.setMode(0);

Cat.prototype.moveOrig = Cat.prototype.move;
Cat.prototype.move = function (left, right, jump, dt) {
	var end;
	if (setCat) {
		this.x0 = xPos + 50;
		this.x1 = xPos - 50;
		this.y0 = yPos;
		this.y1 = yPos;
		this.curve0 = null;
		this.curve1 = null;
	} else {
		xPos = (this.x0 + this.x1) / 2;
		yPos = (this.y0 + this.y1) / 2;
		xPosOutput.textContent = Math.round(xPos);
		yPosOutput.textContent = Math.round(yPos);
	}
	end = this.moveOrig(left, right, jump, dt);
	deathOutput.textContent = end || '';
	return endLevel && 2;
};

function loadLevels (callback) {
	var script = document.createElement('script');
	script.src = 'res/levels.js';
	script.onload = callback;
	document.head.appendChild(script);
}

function testSelectedLevel () {
	var level;
	endLevel = false;
	window.setTimeout(function () {
		setCat = false;
	}, 500);
	level = levels[levelSelect.value][0];
	level.next = '';
	level.run(canvas, function () {}, testSelectedLevel);
}

function init () {
	var i;
	levelSelect.innerHTML = '';
	for (i = 0; i < levels.length; i++) {
		levelSelect.innerHTML += '<option>' + i + '</option>';
	}
	levelSelect.addEventListener('change', function () {
		endLevel = true;
	});
	reloadButton.addEventListener('click', function () {
		loadLevels(function () {
			endLevel = true;
			setCat = true;
		});
	});
	testSelectedLevel();
}

init();

})();