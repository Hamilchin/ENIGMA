/**
 * @typedef {'wave' | 'love'} TAliceState
 */

/**
 * @typedef {object} TAliceOnlyProps
 * @property {voidFunc} doLove
 */

/**
 * @typedef {TActor<TAliceState> & TAliceOnlyProps} TAlice
 */

/**
 * @callback FAlice
 * @param {number} width
 * @param {number} height
 * @param {string} [ color ]
 * @returns {TAlice}
 */
