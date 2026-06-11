/**
 * @typedef {object} TBoulderOnlyProps
 * @property {(state: TBoulderState) => void} changeState
 * @property {FBoulderVsReversers} [ vsReversers ]
 * @property {FActorVsRects} [ vsStoppers ]
 * @property {FBoulderOnTrigger} onTrigger
 * @property {number} [ startTime ]
 * @property {voidFunc} start
 */

/**
 * @typedef {TActor<TBoulderState> & TBoulderOnlyProps} TBoulder
 */

/**
 * @callback FBoulderOnTrigger
 * @param {TDisplayObject} from
 * @param {number} delay
 * @returns {void}
 */

/**
 * @callback FBoulderVsReversers
 * @param {TReverser[]} Reverser
 * @returns {void}
 */

/**
 * @callback FBoulder
 * @param {string} name
 * @param {number} width
 * @param {number} height
 * @param {string} [ color ]
 * @returns {TBoulder}
 */

/**
 * @typedef {'idle' | 'roll' | 'stop'} TBoulderState
 */

/**
 * @typedef {'roll'} TBoulderSkinType
 */
