/*global intro: true*/
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

})();