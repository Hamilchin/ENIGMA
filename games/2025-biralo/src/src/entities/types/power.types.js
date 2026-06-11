/**
 * @typedef {{[name:string]: TPowerPoolStorage}} TPowerPoolBasket
 */

/**
 * @typedef {{[id:number]: TPowerBase}} TPowerPoolUpdaters
 */

/**
 * @typedef {object} TPowerPoolStorage
 * @property {number} max
 * @property {TPowerBase[]} pool
 */

/**
 * @typedef {object} TPowerPool
 * @property {voidFunc} init
 * @property {FPowerUpdate} update
 * @property {FSceneRender} render
 * @property {FPowerPoolExtract} get
 * @property {voidFunc} detach
 */

/**
 * @callback FPowerUpdate  
 * @param {TGroup} group
 * @param {TRect[]} platforms
 * @param {TTotem[]} totems
 * @param {TPlayer} player
 * @param {TStaticEntity[]} torches
 * @param {TFrog} frog
 * @returns {void}
 */

/**
 * @callback FPowerPoolExtract
 * @param {TPowerType} name
 * @returns {TPowerBase}
 */

/**
 * @callback FPowerPool
 * @returns {TPowerPool}
 */

/**
 * @typedef {'fireball' | 'laserBeam' | 'tailwhip' } TPowerType
 */

/**
 * @typedef {object} TPowerBaseOnlyProps
 * @property {number} vx
 * @property {number} vy
 * @property {number} sx - speed x
 * @property {number} sy - speed y
 * @property {number} scx - scale x
 * @property {boolean} [ allowHit ]
 * @property {boolean} [ toVx ]
 * @property {boolean} [ toVy ]
 * @property {number} flipH - 1 or -1
 * @property {FActorVsRects} vsPlatforms
 * @property {(totems:TTotem[])=>void} [ vsTotems ]
 * @property {(player:TPlayer)=>void} [ vsPlayer ]
 * @property {(frog:TFrog)=>void} [ vsFrog ]
 * @property {(torches:TStaticEntity[], player:TPlayer)=>void} [ vsTorches ]
 * @property {(platform:TRect)=>void} onHitPlatform
 */

/**
 * @typedef {TStaticEntity & TPowerBaseOnlyProps} TPowerBase
 */

/**
 * @callback FPowerBase
 * @param {string} name
 * @param {TSpriteTexture} texture
 * @returns {TPowerBase}
 */
