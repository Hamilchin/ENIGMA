/**
 * @template T - currentState
 * @typedef {object} TActorOnlyProps
 * @property {number} uid
 * @property {number} vx
 * @property {number} vy
 * @property {number} health
 * @property {number} alpha
 * @property {number} g - gravity
 * @property {number} dg - default gravity
 * @property {number} jg - jump gravity
 * @property {number} jForce - jump force
 * @property {number} sx - speed x
 * @property {boolean} [ attacking ]
 * @property {boolean} [ dead ]
 * @property {boolean} [ grounded ]
 * @property {boolean} [ onWall ] - hit sides left, right on vsPlatforms
 * @property {boolean} [ jumping ]
 * @property {boolean} [ falling ]
 * @property {boolean} [ moving ]
 * @property {number} flipH - 1 or -1
 * @property {T} [ currentState ]
 * @property {FRemoveFromParent} detach
 * @property {FActorSetVisibility} setVisible
 * @property {FActorVsRects} vsPlatforms
 * @property {FActorVsRects} vsHurts
 * @property {FActorReceiveDamage} receiveDamage
 * @property {(list:TMovieClipList) => void} addSkin
 * @property {voidFunc} doFlipH
 * @property {voidFunc} reset
 * @property {voidFunc} voidGrav - void gravity
 * @property {voidFunc} resetGrav
 * @property {voidFunc} resetVx
 * @property {voidFunc} resetVy
 * @property {voidFunc} resetGrav
 * @property {voidFunc} onLanded
 * @property {voidFunc} onDamage
 * @property {voidFunc} updateSkin
 * @property {boolFunc} isFlipH
 * @property {boolean} [ flipHSkinDisabled ]
 * @property {FActorAddSfx} addSfx
 * @property {FChangeState<T>} [ changeState ]
 */

/**
 * @template T
 * @callback FChangeState
 * @param {T} state
 * @returns {void}
 */

/**
 * @callback FActorAddSfx
 * @param {TSfxType} type
 * @param {number} [ x ]
 * @param {number} [ y ]
 * @returns {void}
 */

/**
 * @callback FActorIsFlipH
 * @returns {boolean}
 */

/**
 * @callback FActorReceiveDamage
 * @param {number} amount
 * @param {*} from - any displayObject
 * @returns {void}
 */

/**
 * @callback FActorVsRects
 * @param {TRect[]} colliders
 * @returns {void}
 */

/**
 * @callback FActorAddTo
 * @param {TGroup} group
 * @param {number} [ index ]
 * @returns {void}
 */

/**
 * @callback FActorSetVisibility
 * @param {boolean} bodyVisible
 * @param {boolean} skinVisible
 * @returns {void}
 */

/**
 * @callback FActorSetBodyProps
 * @param {number} width
 * @param {number} height
 * @param {string} [ color ]
 * @returns {void}
 */

/**
 * @template T
 * @typedef {TBaseEntity<TMovieClip> & TActorOnlyProps<T>} TActor
 */

/**
 * @template T
 * @callback FActor
 * @param {string} name
 * @param {number} width
 * @param {number} height
 * @param {string} [ color ]
 * @returns {TActor<T>}
 */
