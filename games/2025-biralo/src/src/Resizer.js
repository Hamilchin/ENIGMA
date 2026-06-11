import { toPx } from '@lib/utils/css';


/**
 * @param {TDimension} dimension
 * @param {TCanvasLayer[]} layers
 * @returns {void}
 */
export function Resizer(layers, dimension) {
	let defaultSize = 512;
	let fullScreen = true;
	// let fullScreen = true;
	// btn.is('fscreen').onDown = () => {
	// 	fullScreen = !fullScreen;
	// 	resize();
	// };

	const resize = () => {
		const windowWidth = window.innerWidth;
		const windowHeight = window.innerHeight;
		// available ratio
		const availableRatio = windowWidth / windowHeight;
		// base ratio
		const canvasRatio = dimension.width / dimension.height;
		let appliedWidth = 0;
		let appliedHeight = 0;

		if (availableRatio <= canvasRatio) {
			appliedWidth = windowWidth;
			appliedHeight = appliedWidth / canvasRatio;
		} else {
			appliedHeight = windowHeight;
			appliedWidth = appliedHeight * canvasRatio;
		}

		layers.forEach(layer => {
			const canvas = layer.canvas;

			if (fullScreen) {
				canvas.style.width = toPx(appliedWidth);
				canvas.style.height = toPx(appliedHeight);
			} else {
				canvas.style.width = toPx(defaultSize);
				canvas.style.height = toPx(defaultSize);
			}
		});
	};

	window.onresize = resize;
	resize();
}
