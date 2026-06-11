/**
 * @type {FKeyboard}
 */
export function Keyboard(keys, onDownCallback) {
	/**
	 * @type {TKeyboardInputkeys}
	 */
	const inputKeys = {}; 

	for (let key in keys) {
		/**
		 * @type{TKeyState}
		 */
		const inputKey = {
			code: keys[key],
			down: false,
			downHandlers: new Map() 
		};
		inputKey.onDown = (callback) => {
			const id = inputKey.downHandlers.size;
			inputKey.downHandlers.set(id, callback);

			const clearHandler = () => {
				inputKey.downHandlers.delete(id);
			};

			// returns self deleting handler
			return clearHandler;
		};
		inputKeys[key] = inputKey;
	}

	window.addEventListener('keydown', onKeyDownHandler, false);
	window.addEventListener('keyup', onKeyUpHandler, false);

	/**
	 * @param {KeyboardEvent} e
	 * @returns {void}
	 */
	function onKeyDownHandler(e) {
		if (onDownCallback) {
			onDownCallback();
		}
		setKeyPressState(e.key, true);
		// prevent arrow keys from scrolling the page when the game is in an iframe
		const preventDefaultList = [' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];

		if(preventDefaultList.includes(e.key)) {
			// console.log('preventDefault');
			e.preventDefault();
		}
	}

	/**
	 * @param {KeyboardEvent} e
	 * @returns {void}
	 */
	function onKeyUpHandler(e) {
		setKeyPressState(e.key, false);
		// e.preventDefault();
	}

	/**
	 * @param {string} keyCode
	 * @param {boolean} isDown
	 * @returns {void}
	 */
	function setKeyPressState(keyCode, isDown) {
		const keys = Object.keys(inputKeys);
		keys.forEach(key => {
			const inputKey = inputKeys[key];

			if (keyCode === inputKey.code) {
				if (isDown) {
					if (!inputKey.down) {
						inputKey.downHandlers.forEach(onDown => {
							onDown();
						});
					}
				}

				inputKey.down = isDown;
			}
		});
	}

	return {
		is(key) {
			return inputKeys[key];
		},
	};
}
