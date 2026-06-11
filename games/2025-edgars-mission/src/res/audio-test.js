/*global audio*/
(function () {
"use strict";

var slower = document.getElementById('slower'),
	faster = document.getElementById('faster');

window.setInterval(function () {
	var d = 0;
	if (slower.checked) {
		d = 1;
	} else if (faster.checked) {
		d = -1;
	}
	audio.tick(d);
}, 50);

document.getElementById('play').addEventListener('click', audio.start);
document.getElementById('stop').addEventListener('click', audio.stop);
document.getElementById('sound-cat0').addEventListener('click', function () {
	audio.sound('cat0');
});
document.getElementById('sound-cat1').addEventListener('click', function () {
	audio.sound('cat1');
});
document.getElementById('sound-end1').addEventListener('click', function () {
	audio.sound('end1');
});
document.getElementById('sound-end2').addEventListener('click', function () {
	audio.sound('end2');
});
document.getElementById('sound-end3').addEventListener('click', function () {
	audio.sound('end3');
});
document.getElementById('sound-end-1').addEventListener('click', function () {
	audio.sound('end-1');
});

})();