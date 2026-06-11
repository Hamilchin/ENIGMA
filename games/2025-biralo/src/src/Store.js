/**
 * @type {TStore}
 */
export const store = (() => {
	return {
		sceneIndex: 1,
		// will be set later in Game.js
		endSceneIndex: 6,
		lockedMovement() {
			return store.sceneIndex === store.endSceneIndex || store.sceneIndex === 1;
		},
		reset() {
			store.gWon = false;
		},
	};
})();
