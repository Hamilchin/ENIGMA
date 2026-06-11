/*global keys: true*/
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
})();