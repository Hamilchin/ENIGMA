/**
 * @typedef {object} TStaticEntityOnlyProps
 * @property {boolean} [ loop ]
 * @property {voidFunc} addBody
 * @property {voidFunc} addSkin
 * @property {voidFunc} play
 * @property {FAnimatedSpriteSeFrameIndex} stop
 * @property {FAnimatedSpriteOnComplete} [ onComplete ]
 */

/**
 * @typedef {TBaseEntity<TAnimatedSprite> & TStaticEntityOnlyProps} TStaticEntity
 */

/**
 * @callback FStaticEntity
 * @param {string} name
 * @param {TSpriteTexture} texture
 * @returns {TStaticEntity}
 */
