/**
 * @template T - TAnimatedSprite or TMovieClip
 * @typedef {object} TBaseEntity
 * @property {string} [ name ]
 * @property {string} [ type ]
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {TGroup} [parent]
 * @property {boolean} [ reserved ] - when extracted from pool but not spawned
 * @property {boolean} [ active ]
 * @property {TRect} [ body ]
 * @property {T} [ skin ]
 * @property {FActorSetBodyProps} setBody
 * @property {voidFunc} kill
 * @property {FSceneRender} render
 * @property {FSceneUpdate} update
 * @property {FActorAddTo} addTo
 * @property {voidFunc} [destroy]
 * @property {voidFunc} attachProps - define custom properties like getter/setters
 */

/**
 * @template T - TAnimatedSprite or TMovieClip
 * @callback FBaseEntity
 * @param {string} name
 * @returns {TBaseEntity<T>}
 */
