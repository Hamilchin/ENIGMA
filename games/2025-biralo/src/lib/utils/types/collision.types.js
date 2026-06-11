/**
 * @typedef {object} THitTestResult
 * @property {boolean} [ hit ]
 * @property {TCollisionSide} side
 * @property {TPoint} overlap
 */

/**
 * @typedef {'t' | 'b' | 'l' | 'r' | ''} TCollisionSide - t=top, b=bottom, l=left, r=right
 */

/**
 * @callback FHitTest
 * @param {TRect} source
 * @param {TRect} other
 * @returns {THitTestResult}
 */

/**
 * @callback FOverlap
 * @param {TRectBounds} source
 * @param {TRectBounds} other
 * @param {number} [ dw ] - offset width ratio
 * @param {number} [ dh ] - offset height ratio
 * @returns {boolean}
 */
