/**
 * @typedef {object} Ingredient
 * @property {string}   name
 * @property {number}   x
 * @property {number}   y
 * @property {number}   w
 * @property {number}   h
 * @property {string}   fluidColor
 * @property {function} draw
 */

/**
 * @typedef {object} Potion
 * @property {string}       name
 * @property {string[]}     desc
 * @property {Ingredient[]} ingredients
 * @property {Potion[]?}    alternatives - Alternatives to this potion the customer will also accept, but for not as many points.
 * @property {function}     draw
 */

/**
 * @typedef {object} PotionOrder
 * @property {Potion}       potion
 * @property {string}       desc           - A randomly picked description.
 * @property {number}       timeLimit      - Time limit for the order in seconds.
 * @property {js13k.Timer?} timer          - Timer started when the order was selected as current one.
 * @property {js13k.Timer?} animationTimer - Timer for the slide-in animation.
 * @property {number?}      score          - The scoring result when this order was finished.
 */
