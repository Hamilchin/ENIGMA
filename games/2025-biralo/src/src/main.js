import { Game } from './Game';

window.onload = () => {
	Game();
	window.focus();
	document.body.addEventListener('click', function() {
		window.focus();
	}, false);
};

