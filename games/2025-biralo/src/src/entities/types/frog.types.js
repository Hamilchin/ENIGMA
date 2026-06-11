/**
 * @typedef {object} TFrogOnlyProps
 * @property {voidFunc} start
 * @property {() => boolean} weak - vulnerable
 * @property {() => boolean} smash - jump smash player
 * @property {(state: TFrogState) => void} changeState
 */

/**
 * @typedef {TActor<TFrogState> & TFrogOnlyProps} TFrog
 */


/**
 * @callback FFrog
 * @param {string} name
 * @param {number} width
 * @param {number} height
 * @param {string} [ color ]
 * @returns {TFrog}
 */

/**
 * @typedef {'idle' | 'attack' | 'fly' | 'jump'} TFrogState
 */

/**
 * @typedef {'idle' | 'attack' | 'fly' | 'jump'} TFrogSkinType
 */
