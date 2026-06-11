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

})();