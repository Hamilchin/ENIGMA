/**
 * @typedef {'idle' | 'run' | 'fall' | 'attack' | 'hurt' | 'jump' | 'swing'} TPlayerState
 */

/**
 * @typedef {object} TPlayerOnlyProps
 * @property {FActorVsRects} [ vsExits ]
 * @property {FPlayerVsAlice} [ vsAlice ]
 * @property {FPlayerVsFrog} [ vsFrog ]
 * @property {FPlayerVsFallingTiles} [ vsFallTiles ]
 * @property {FPlayerVsBoulders} [ vsBoulders ]
 * @property {FPlayerVsTriggers} [ vsTriggers ]
 * @property {boolean} [ swung ]
 * @property {voidFunc} [ doSwing ]
 */

/**
 * @callback FPlayerVsAlice
 * @param {TAlice} alice
 * @param {voidFunc} [ callback ]
 * @returns {void}
 */

/**
 * @callback FPlayerVsFrog
 * @param {TFrog} frog
 * @returns {void}
 */

/**
 * @callback FPlayerVsFallingTiles
 * @param {TStaticEntity} fallingTiles
 * @returns {void}
 */

/**
 * @callback FPlayerVsTriggers
 * @param {TTrigger[]} triggers
 * @param {TBoulder[]} boulders
 * @param {TBitmapFont[]} texts
 * @returns {void}
 */

/**
 * @callback FPlayerVsBoulders
 * @param {TBoulder[]} boulders
 * @returns {void}
 */

/**
 * @typedef {TActor<TPlayerState> & TPlayerOnlyProps} TPlayer
 */

/**
 * @callback FPlayer
 * @param {string} name
 * @param {number} width
 * @param {number} height
 * @param {string} [ color ]
 * @returns {TPlayer}
 */
