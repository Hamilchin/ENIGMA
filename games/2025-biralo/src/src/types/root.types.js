/**
 * @typedef {object} TRoot
 * @property {TRootSceneManager} scene
 * @property {TCanvasLayers} layers
 * @property {TActorPool} actorPool
 * @property {TSfxPool} sfxPool
 * @property {TPowerPool} powerPool
 */

/**
 * @typedef {object} TRootSceneManager
 * @property {FRootSetScene} set
 * @property {FRootSceneRender} render
 * @property {FSceneUpdate} update
 * @property {voidFunc} next
 * @property {voidFunc} reload
 */

/**
 * @callback FRootSetScene
 * @param {number} sceneIndex
 * @returns {void}
 */

/**
 * @callback FRootSceneRender
 * @param {TCanvasLayer[]} canvasLayers
 * @returns {void}
 */


/**
 * @typedef {object} TStore
 * @property {number} [ sceneIndex ]
 * @property {number} [ endSceneIndex ]
 * @property {boolean} [ loaded ]
 * @property {boolean} [ gWon ] - gamewon
 * @property {voidFunc} reset - reset progress
 * @property {() => boolean} lockedMovement - lock player movement
 */

