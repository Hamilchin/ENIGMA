// utility.js

//beginclip
let log = t => console.log(t);
//endclip

let clamp = (v, min, max) => (v < min ? min : v > max ? max : v);

// #region Random

// Random number generator.
let randomState = Date.now();

let random = max => {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  let result = (randomState >>> 0) / 4294967296 * (max | 1);
  return (!max) ? result : ~~result;
};

let randomInt = (min, max) => ((random(max) + min));

let coinToss = e => random() < .5;

// #endregion

// Easing functions.

let easeOutCubic = t => 1 - M.pow(1 - t, 3);

// let easeInCubic = t => t * t * t;

// #region localstorage
let OPTIONS; // Persistent data buffer.

let NAMESPACE = 'com.antix.nlnm'; // Persistent data filename.

// Save options to local storage.
let saveOptions = () => localStorage.setItem(NAMESPACE, JSON.stringify(OPTIONS));

let newScore = (s, n = 'ANTIX') => ({n, s});
let newControl = k => ({k});

let THRUST_FORWARD_CONTROL      = 0;
let THRUST_REVERSE_CONTROL      = 1;
let STRAFE_LEFT_CONTROL         = 2;
let STRAFE_RIGHT_CONTROL        = 3;
let LAND_DUSTOFF_CONTROL        = 4;
let AIRSTRIKE_CONTROL           = 5;

// Reset options to default and save them to local storage.
let resetOptions = () => {
  OPTIONS = {
    s: [ // Highscores.
      newScore(8e6),
      newScore(4e5),
      newScore(2e5),
      newScore(1e5),
      newScore(5e4),
    ],
    a: 1, // Audio enabled.
    c: [ // Controls.
      newControl('KeyW'), // (0) Forward thrust.
      newControl('KeyS'), // (1) Reverse Thrust.
      newControl('KeyA'), // (2) Strafe left.
      newControl('KeyD'), // (3) Strafe right.
      newControl('KeyE'), // (4) Land/dust-off.
      newControl('KeyQ'), // (5) Airstrike.
    ]
  };

  saveOptions(); // Save options to local storage.
};

// #endregion

// Sound effects.
let FX_BUTTON             = 0;
let FX_SHOOT              = 1;
let FX_DROP_BOMB          = 2;
let FX_BOMB_EXPLOSION     = 3;
let FX_PASSENGER_BOARDED  = 4;
let FX_SPAWN_QUBI         = 5;
let FX_KILL_ENEMY         = 6;
let FX_CARGO_LOADED       = 7;
let FX_KILLED_CAT         = 8;
let FX_PLAYER_HIT         = 9;
let FX_PYRA_JUMP          = 10;
let FX_PLAYER_DIED        = 11;
let FX_TURI_SHOOT         = 12;
let FX_XEVIOUS            = 13;
let FX_LOAD_BOARD         = 14;
let FX_QUBI_EXPLOSION     = 15;
let FX_DART_SHOOT         = 16;
let FX_BULLET_SPRAY       = 17;
let FX_PROWLER_SHOOT      = 18;
let FX_PLAYER_HIT2        = 19;
let FX_WINGMAN_HIT        = 20;
let FX_LASER              = 21;
let FX_LAUNCH             = 22;
let FX_WARP_IN            = 23;
let FX_LAUNCH_HORNET      = 24;
let FX_THRUST             = 25;

fx_add(.05,379,.02,.02,.06,0,3.4,0,25,468,.07,.06,0,22,.1,.02,.59,.04,0,0);     // (0) FX_BUTTON.
fx_add(.02,246,.01,.03,.08,1,.3,-4,11,0,0,0,0,0,0,0,.53,.07,0,231);             // (1) FX_SHOOT.
fx_add(.02,838,.01,.45,.003,0,4.1,0,0,0,0,0,0,.1,0,0,.96,.41,0,-1204);          // (2) FX_DROP_BOMB.
fx_add(.04,80,.01,.05,.58,4,.4,-1,0,0,0,0,.7,0,.4,0,.36,.07,0,769);             // (3) FX_BOMB_EXPLOSION.
fx_add(.05,1e3,.05,.2,.2,2,1,3,-15,0,0,0,.2,0,0,0,.7,.05,0,0);                  // (4) FX_PASSENGER_BOARDED.
fx_add(.01,188,0,.03,.04,0,1.8,-55,0,6,.34,0,0,0,.1,0,.69,.03,0,-1469);         // (5) FX_SPAWN_CUBI.
fx_add(.05,56,.02,.09,.24,3,2.8,-9,3,0,0,0,.5,0,.8,.1,.5,.06,0,0);              // (6) FX_KILL_ENEMY.
fx_add(.05,321,.01,.15,.006,2,.8,-12,-60,0,0,0,0,21,0,.49,.64,.25,0,0);         // (7) FX_LOADED_CARGO.
fx_add(.05,439,.01,.17,.06,3,3.3,15,-20,0,0,0,0,0,.5,0,.92,.08,0,99);           // (8) FX_KILLED_CAT.
fx_add(.1,71,.06,.13,.43,2,2.4,-9,0,0,0,0,1.9,63,.5,0,.37,.12,0,1426);          // (9) FX_PLAYER_HIT.
fx_add(.005,356,.04,.03,.09,0,1,0,194,0,0,0,0,0,0,0,.55,.05,0,-1340);           // (10) FX_PYRA_JUMP.
fx_add(.3,96,.02,.25,.58,2,1.8,-1,0,0,0,.15,1.4,0,.2,.35,.47,.06,.28,0);        // (11) FX_PLAYER_DIED.
fx_add(.02,209,0,.05,.06,0,1.2,5,-15,0,0,0,0,16,0,.15,.96,.09,0,0);             // (12) FX_TURI_SHOOT.
fx_add(.07,732,0,.01,.08,3,3.7,0,0,157,0,.02,0,0,0,.16,.76,.01,0,0);            // (13) FX_XEVIOUS (The xevious sound is so damn good!).
fx_add(.1,286,.03,0,.01,0,4.3,-0.3,.3,50,.01,.02,.1,-1,-0.1,0,.33,.01,0,252);   // (14) FX_LOAD_BOARD.
fx_add(.03,89,.04,.22,.24,2,2.8,4,-5,0,0,0,1.5,28,.4,0,.46,.11,0,-3105);        // (15) FX_QUBI_EXPLOSION.
fx_add(.03,159,.02,.02,.05,2,1.9,1,37,0,0,0,0,15,0,.14,.79,.07,0,-1411);        // (16) FX_DART_SHOOT.
fx_add(.03,370,.02,.05,.05,3,0,13,-10,0,0,0,0,0,.3,.1,.71,.09,0,0);             // (17) FX_BULLET_SPRAY.
fx_add(.2,159,.02,.02,.05,2,1.9,1,37,0,0,0,0,15,0,.14,.79,.07,0,-1411);         // (18) FX_PROWLER_SHOOT.
fx_add(.2,499,0,.02,.06,0,.4,-17,27,0,0,.07,0,1.1,.3,.11,.76,.06,.04,425);      // (19) FX_PLAYER_HIT2.
fx_add(.1,376,.02,.14,.08,3,3.8,-11,48,0,0,0,0,18,0,0,.72,.07,0,0);             // (20) FX_WINGMAN_HIT.
fx_add(.05,529,.04,.1,.28,4,3.6,0,1,0,0,0,0,85,0,0,.58,.01,0,117);              // (21) FX_LASER.
fx_add(.2,96,.02,.25,.58,2,1.8,-1,0,0,0,.15,1.4,0,.2,.35,.47,.06,.28,0);        // (22) FX_LAUNCH.
fx_add(.05,796,.42,0,.02,4,.4,0,0,261,.1,0,0,0,.5,0,.79,0,.07,0);               // (23) FX_WARP_IN.
fx_add(.02,150,.01,.1,.25,4,.6,20,0,0,0,0,0,0,0,.02,.8,.02,0,0);                // (24) FX_LAUNCH_HORNET.
fx_add(.002,261,.1,.2,.4,4,.2,0,0,0,0,0,.4,0,0,0,.4,.1,0,0);                    // (25) FX_THRUST.
