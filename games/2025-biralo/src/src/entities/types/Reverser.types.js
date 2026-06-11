/**
 * @typedef {object} TReverserOnlyProps
 * @property {number} [ side ] - set flipH direction 0, 1 or -1 of entity on overlap 
 */

/**
 * @typedef {TRect & TReverserOnlyProps} TReverser
 */


/**
 * @callback FReverser
 * @param {string} name
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @returns {TReverser}
 */
