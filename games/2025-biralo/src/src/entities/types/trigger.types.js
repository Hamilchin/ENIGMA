/**
 * @typedef {{x:number, y:number}[]} TNodes
 */

/**
 * @typedef {object} TTriggerOnlyProps
 * @property {(index:number)=>void} register
 * @property {boolFunc} isJobDone
 * @property {voidFunc} kill
 * @property {number} [ delay ]
 * @property {TNodes} nodes
 */

/**
 * @typedef {TRect & TTriggerOnlyProps} TTrigger
 */

/**
 * @callback FTrigger
 * @param {TNodes} nodeList
 * @param {number} width
 * @param {number} height
 * @param {string} [ color ]
 * @returns {TTrigger}
 */

