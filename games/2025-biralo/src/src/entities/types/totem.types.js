/**
 * @typedef {object} TTotemOnlyProps
 * @property {number} [ attackTime ]
 * @property {(state: TTotemState) => void} changeState
 */

/**
 * @typedef {TActor<TTotemState> & TTotemOnlyProps} TTotem
 */


/**
 * @callback FTotem
 * @param {string} name
 * @param {number} width
 * @param {number} height
 * @param {string} [ color ]
 * @returns {TTotem}
 */

/**
 * @typedef {'idle' | 'attack'} TTotemState
 */

/**
 * @typedef {'idle' | 'attack'} TTotemSkinType
 */
