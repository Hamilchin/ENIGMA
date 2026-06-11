/*global storage, audio, Canvas, levels, intro*/
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

})();