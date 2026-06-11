/**
 * @typedef {object} TActorPool
 * @property {voidFunc} init
 * @property {voidFunc} detach
 * @property {()=>TPlayer} getPlayer
 * @property {()=>TTotem} getTotem
 * @property {()=>TFrog} getFrog
 */

/**
 * @callback FActorPool
 * @returns {TActorPool}
 */

/**
 * @typedef {object} TTotemPoolStorage
 * @property {number} max
 * @property {TTotem[]} pool
 */

