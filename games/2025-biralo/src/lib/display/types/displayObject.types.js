/**
 * @typedef {object} TDisplayObject
 * @property {number} uid - private only
 * @property {string} [name]
 * @property {string} [type] - DisplayObject type; eg. enemy, bullet, platform ..
 * @property {boolean} [ reserved ] - when extracted from pool but not spawned
 * @property {boolean} [ roundPixels ] 
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {number} scx - scale x
 * @property {number} scy - scale y
 * @property {number} pvx - pivot x
 * @property {number} pvy - pivot y
 * @property {number} rot - rotation
 * @property {boolean} visible
 * @property {number} alpha
 * @property {TGroup} [parent]
 * @property {number} gx
 * @property {number} gy
 * @property {FSceneRender} [render]
 * @property {FSceneUpdate} [update]
 * @property {voidFunc} [destroy]
 * @property {FRemoveFromParent} detach
 */

/**
 * @callback FRemoveFromParent  
 * @returns {void}
 */

/**
 * @typedef {object} TDisplayobjectWithUID
 * @property {number} [ uid ]
 */

/**
 * @callback FDisplayObject
 * @returns {TDisplayObject}
 */
