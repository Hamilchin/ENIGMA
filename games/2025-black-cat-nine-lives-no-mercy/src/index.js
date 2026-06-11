/*remap
a_position,A
a_color,B
u_resolution,C
zeroToOne,D
zeroToTwo,E
clipSpace,F
_accuracy,ac
_moveSpeed,d
_baseMoveSpeed,bm
_type,b
_textColor,Z
_textScale,Y
_text,X
_visible,W
_borderColor,bc
_action,a
_camera,c
_meshIndex,M
_vertices,v
_ttlMax,T
_ttl,t
_color,C
_baseColor,B
_collisionRadius,J
_attackRange,K
_rateOfFire,L
_projSpeed,N
_projTTL,O
_altitude,al
_turnSpeed,Q
_reloaded,H
_wayPoint,R
_fakeYaw,I
_counter,U
_enabled,V
pitch,p
yaw,Y
_distanceToPlayer,dp
_flies,f
_jumping,j
_ground,gr
_notRescuedOrKilled,nr
_cargoType,cg
_orbitAngle,A
_orbitDistance,D
_orbitSpeed,G
_flashing,fl
_flashCounter,fc
_baseTurnSpeed,bt
_anchorX,ax
_anchorZ,az
_xCounter,xc
_zCounter,zc
_xRockSpeed,xr
_zRockSpeed,zr
_xRockMagnitude,xm
_zRockMagnitude,zm
_startSize,S
_endSize,E
_painted,P
_target,T
*/

// index.js

//beginclip
let godMode;

let frameCount = 0;
let fpsTime = 0;
let fps = 0;

let enemyTypeStrings = ['TURI', 'BOTA', 'QUBI', 'DART', 'TRIA', 'PROWLER'];

let bigString = '';

//endclip

// Program states.
let STATE_NONE              = 0;
let STATE_MAINMENU          = 1;
let STATE_GAMEON            = 2;
let STATE_GAMEOVER          = 3;

let programState; // Current state of program.

let trainingMode;
let trainingPhase;
let trainingTarget;
let waitingForNextObjective;
let nextObjectiveTimer;

// Frame timing.
let dt;
let lastTime = 0;

// Viewport.
let WIDTH                   = 1920;
let HEIGHT                  = 1080;

// View.
let FOCAL_LENGTH            = WIDTH * 0.8;

// 3rd person camera orientation.
let VIEW_Y                  = 18;
let VIEW_Z                  = 31;
let VIEW_PITCH              = -0.6;

let VIEW_DRAW_RANGE         = 41; // Width and depth of terrain rendering.
let VIEW_CULL_RANGE         = 24; // Distance after which game objects are not visible.

// World dimensions.
let MAP_SIZE;
let MAP_CENTER;

// Scrolling limits.
let MAX_XZ                  = MAP_SIZE - 1;
let MIN_XZ                  = 1; 

let FLIGHT_HEIGHT           = 3.2; // Y position for flying objects.

let COLOR_WHITE               = 'ffff';
let COLOR_ORANGE              = 'f80f';
let COLOR_YELLOW              = 'ff0f';

// NOTE: These values could be incoaporated into the appropriate object template.
let bulletColors = [
  'fc8f',       // (0) Turi.
  'f00f',       // (1) Bota.
  ,             // (2) Qubi.
  COLOR_ORANGE, // (3) Dart.
  ,             // (4) Tria.
  'f00f',       // (5) Prowler.
  ,             // (6) Pyra.
  '4f8c',       // (7) Player.
];

let cosmicNebulaColors = ['305', 'd0f', '0af', 'f8c', 'fea'];

let hornetThrustColors = ['fff', 'ff0', 'f80', 'f00'];

let laserColors = ['f00', 'e01', 'd13', 'b14', 'a25', '927', '838', '639', '54b', '44c'];

// #region Object Data.

// Object types (`EncodedMeshes` and `objectTemplates` are ordered in this order).
let TYPE_TURI               = 0; // Ground.
let TYPE_BOTA               = 1; // Marine.
let TYPE_QUBI               = 2; // Flying...
let TYPE_DART               = 3;
let TYPE_TRIA               = 4;
let TYPE_PROWLER            = 5;
let TYPE_PYRA               = 6; // Ground.
let TYPE_PLAYER             = 7; // Flying.
let TYPE_CARGO              = 8; // Ground.
let TYPE_SHIELD             = 9; // Orbiting...
let TYPE_WINGMAN            = 10;
let TYPE_LASER              = 11;
let TYPE_HORNET             = 12;

let GLOBE_MESH              = 13; // Just mesh indexes...
let KABOOM_MESH              = 14;
let EXPLOSION_MESH          = 15;
let ARROW_MESH              = 16;
let RING_MESH               = 17;

// Templates for all enemy types.
let objectTemplates = [

  [                       // (0) Turi.
    TYPE_TURI,            // Mesh.
    'f84',                // Color.
    .6,                   // Collision radius.
    15, 20,               // Attack range (lower, upper).
    1,  .8,               // Rate of fire.
    10, 14,               // Projectile speed.
    0,  0,                // Movement speed.
    0,  0,                // Turn speed.
    0,                    // Altitude.
    0,                    // Flies.
  ],

  [                       // (1) BOTA.
    TYPE_BOTA,            // Mesh.
    'f44',                // Color.
    .6,                   // Collision radius.
    10, 13,               // Attack range
    1,  .8,               // Rate of fire.
    10, 15,               // Projectile speed.
    .5, .5,               // Movement speed.
    0,  0,                // Turn speed.
    0,                    // Altitude.
    0,                    // Flies.
  ],

  [                       // (2) Qubi.
    TYPE_QUBI,            // Mesh.
    '04f',                // Color.
    .5,                   // Collision radius.
    0,  0,                // Attack range
    0,   0,               // Rate of fire.
    0,   0,               // Projectile speed.
    10,  16,              // Movement speed.
    .02, .04,             // Turn speed.
    FLIGHT_HEIGHT,        // Altitude.
    1,                    // Flies.
  ], 
  
  [                       // Dart (3).
    TYPE_DART,            // Mesh.
    'ccc',                // Color.
    .5,                   // Collision radius.
    0, 0,                 // Attack range
    1, .6,                // Rate of fire.
    9, 14,                // Projectile speed.
    3, 5,                 // Movement speed.
    1.15, 1.1,            // Turn speed.
    FLIGHT_HEIGHT,        // Altitude.
    1,                    // Flies.
  ],

  [                       // (4) Tria.
    TYPE_TRIA,            // Mesh.
    '0c0',                // Color.
    .7,                   // Collision radius.
    0, 0,                 // Attack range
    1, 1,                 // Rate of fire.
    0, 0,                 // Projectile speed.
    3, 5,                 // Movement speed.
    .5, .5,               // Turn speed.
    FLIGHT_HEIGHT,        // Altitude.
    1,                    // Flies.
  ],

  [                       // (5) Prowler.
    TYPE_PROWLER,         // Mesh.
    'f00',                // Color.
    .7,                   // Collision radius.
    300, 310,             // Attack range
    1, .6,                // Rate of fire.
    10, 14,               // Projectile speed.
    3, 5,                 // Movement speed.
    .85, .95,             // Turn speed.
    FLIGHT_HEIGHT,        // Altitude.
    1,                    // Flies.
  ],

  [                       // (6) Pyra.
    TYPE_PYRA,            // Mesh.
    'f4f',                // Color.
    .4,                   // Collision radius.
    , ,                   // Attack range
    , ,                   // Rate of fire.
    , ,                   // Projectile speed.
    , ,                   // Movement speed.
    , ,                   // Turn speed.
    .05,                  // Altitude.
    ,                     // Flies.
  ],

  // (7) Player. IMPRTANT! Do NOT spawn an object of `TYPE_PLAYER`.
  ,

  [                       // (8) Cargo.
    TYPE_CARGO,           // Mesh.
    'fc4',                // Color.
    ,                     // Collision radius.
    , ,                   // Attack range
    , ,                   // Rate of fire.
    , ,                   // Projectile speed.
    , ,                   // Movement speed.
    , ,                   // Turn speed.
    ,                     // Altitude.
    ,                     // Flies.
  ],

  [                       // (9) Shield.
    TYPE_SHIELD,          // Mesh.
    '8f4',                // Color.
    .5,                   // Collision radius.
    , ,                   // Attack range
    , ,                   // Rate of fire.
    , ,                   // Projectile speed.
    , ,                   // Movement speed.
    , ,                   // Turn speed.
    ,                     // Altitude.
    ,                     // Flies.
  ],

  [                       // Wingman.
    TYPE_WINGMAN,         // Mesh.
    '8cf',                // Color.
    .4,                   // Collision radius.
    , ,                   // Attack range
    , ,                   // Rate of fire.
    , ,                   // Projectile speed.
    , ,                   // Movement speed.
    , ,                   // Turn speed.
    ,                     // Altitude.
    ,                     // Flies.
  ],
  
  [                       // (11) Laser.
    TYPE_LASER,           // Mesh
    '44c',                // Color
    .4,                   // Collision radius.
    , ,                   // _attackRange
    .25, ,                // _rateOfFire
    , ,                   // _projSpeed
    , ,                   // _moveSpeed
    , ,                   // _turnSpeed
    ,                     // _altitude
    1,                    // _flies
  ],

  [                       // (12) Hornet.
    TYPE_HORNET,          // Mesh.
    COLOR_ORANGE,         // Color.
    .4,                   // Collision radius.
    , ,                   // Attack range
    , ,                   // Rate of fire.
    , ,                   // Projectile speed.
    40, ,                 // Movement speed.
    1, ,                  // Turn speed.
    FLIGHT_HEIGHT,        // Altitude.
    0,                    // Flies.
  ],
];

let encodedMeshes = [
  // (0) Turi.
  '(),,),,)(()(*,*', // Vertices.
  '()*)+*+(+,,*(,,)', // Edges.

  // (1) Bota.
  ')*))*++*++*))+(++()+,++,+,(),(++)+,)),))+)',
  '()+*(+(,+-,-).*/)*./,.-/-010,1032314435452',

  // (2) Qubi.
  ')*)+*))*++*+*+**)*',
  '()(**+)+,)-)(-(,-+*-*,,+',

  // (3) Dart.
  '**,)*((*(,*(+*(*+(*)(+*)',
  '*)*(,+(+)--,(-)..,(,.(',

  // (4) Tria.
  ',)(,+(,+,,),(),(+,(+**+**)(*)**+(()*',
  '()+*)*(+,+,--*./010(022)2/313.3,.-1/',

  // (5) Prowler.
  '**)+**)**)*+**,+*+*+*++))+)*)+++()+(',
  '()*(*++,,-)-,.+..-(/0(1,1(1)*1(.*..)2/303((2',

  // (6) Pyra.
  ',,,,*,+),)),(*,(,,)+,++,)(,*),+(,*+,+)+))*)(*))++(*+)******)*+(*)*',
  ')(*)+*,+,--..//(0+01122*245+65670784899*3*+3:95::3;:;<=86=/),.',
  
  // (7) Player.
  ',*(+*(*+()*((*((*)**,,*))*)*+)+*)*)(*))',
  ')(*)+*,+,--../(/+0*1.1)2.212010.2/-0+33)34044.42',

  // (8) Cargo crate.
  '(((,((,,((,(,,,,(,((,(,,',
  '())*+*(+-,*,)-.-.//,(.+/',

  // (9) Shield.
  '*(*(**(,**+*,,*,***(*,**,,**+*(,*(**(+*,+*()*,)*',
  '*++,+,*+6(7,(76*',

  // (10) Wingman.
  '*+(**))*(+*(+**)****(**,*++',
  ')(*+*))+),-).(-//,)00,-0/0',

  // (11) Laser pod.
  '**(+)*))*)+*++******,',
  '()*)*++(*(),+,(,-.',

  // (12) Hornet.
  '**,*+(*)(+*()*(',
  '()*)*((+,+,(',

  // (13) Globe - Explosion cloud.
  '++()+())(+)(+())()(+)())),)+,),+),)),)+,+++,++(+++,+),),+)+,(++)),)(+()+',
  ')(*++(*),+-*.)/*/./-)0.0(112(2,3+3-,32344525651674,70198947985:686;8;:0:.<<;=;=9->>=?=?</??>>7<:',

  // (14) Kapow.
  ',(**)*((*)**(,**+*,,*+***((**)*,(*(,**+*,,',
  ')(*)*+,+,--././(0)0112-23)3445-5',

  // (15) Explosion.
  '*+(*)(*()*(+*),*+,*,+*,)),*+,*,+*,)*+(*)(*()*(+*',
  ')(*)*++,,--.(//.0112324354656770',

  // (16) Arrow.
  '**+)*)+*)',
  ')((*)*',

  // (17) Ring.
  ')*,+*,,*+,*)+*()*((*)(*+',
  '())*+*,+-,.-.//(',

  // (18) Sphere (inserted in `generateSphere`).
  '',
  '',

];

// #endregion




let score;
// let gotNewHigh;
let lives;

// Cat related.
let liveCats;
let catsRescued;
let catsToRescue;

// This function has been added purely to shave bytes from the final zip file.
let newTempObject = (_camera, _meshIndex, _color, _size, _baseColor, _collisionRadius) => ({
  _camera,
  _meshIndex,
  _color,
  _size,
  _baseColor,
  _collisionRadius,
});

let playerShip = newTempObject(
  0, 
  TYPE_PLAYER,
  '4fff', 
  0, 
  '4ff', 
  .5,
);

let playerVisible;

let playerDied;

let playerCanBeDamaged;

let playerOnRails; // Player cannot thrust, fire, or drop bombs while this flag is true.

let playerGrounded;
let playerDestHeight;
let playerLanding;
let playerDustingOff;

let playerLeaving;
let playerBlastingOff;
let playerEntering;
let gpc;

let passengerCount;
let boardingPassenger;
let cargoBeingLoaded;
let boardingLoadingSoundCounter;
let playerBoardingOrLoading;
let boardingOrLoadingCounter;

let objectMeshes = [];

let gameObjects;

let enemiesRemaining;
let notified;
let notifyCounter;
let notifying;

let particles = [];

let objectsToDraw;
let visibleObjects;

let gameOverAnimTimer;

let shields;

let hasLaser;
let laser;
let beamCount;
let laserTarget; // Object the laser is currently firing at.

let wingMen;

let hasHornets;
let hornets;
let hornetROF = .2;
let hornetReloaded;

let allPyra;
let pyraIndicator;
let lastNearestPyra;
let isIndicatorVisible;

let BOMB_RANGE                  = 14;
let BOMB_COOLDOWN               = 0.5;
let BOMB_FORWARD_VELOCITY       = 5;

let lastBombDropTime            = 0;
let bombVy;
let bDh; // Bomb detonation height.
let bombs;

let BULLET_COOLDOWN             = 0.1;
let BULLET_SPEED                = 15;

let lastBulletFireTime          = 0;
let bullets;

let THRUST_PARTICLE_TTL         = 0.5;
let THRUST_PARTICLES_PER_SECOND = 200;
let THRUST_PARTICLE_SPEED       = 5;
let THRUST_PARTICLE_SPREAD      = 4;

let EXPLOSION_PARTICLES         = 30;
let EXPLOSION_TTL               = 1.5;
let EXPLOSION_SPEED             = 8;
let EXPLOSION_LIFT              = 10; // How far particles are thrown into the air.


let BOARDING_AND_LOADING_RADIUS = 6;
    
let PLAYER_HORIZONTAL_SPEED     = 10;
let PLAYER_STRAFE_SPEED         = 10;

let PLAYER_TURN_SPEED           = .001;

let accelerationDuration        = 1.0;
let decelerationFactor          = 0.95;
let currentSpeed                = 0;
let accelerationTimer           = 0;
let strafeSpeed                 = 0;
let strafeAccelerationTimer     = 0;

let GRAVITY                     = 9.8;





// #region WebGL init.

let program;

let positionLocation;
let colorLocation;
let resolutionLocation;

let vertexBuffer;
let triangleVertexBuffer;

// WebGL constants.
let GL_LINES                = 1;
let GL_TRIANGLES            = 4;
let GL_SRC_ALPHA            = 770;
let GL_ONE_MINUS_SRC_ALPHA  = 771;
let GL_BLEND                = 3042;
let GL_FLOAT                = 5126;
let GL_color_BUFFER_BIT     = 16384;
let GL_ARRAY_BUFFER         = 34962;
let GL_DYNAMIC_DRAW         = 35048;
let GL_FRAGMENT_SHADER      = 35632;
let GL_VERTEX_SHADER        = 35633;

// Layers.
let WORLD_LAYER             = 0;
let PARTICLE_LAYER          = 1;
let UI_LAYER                = 2;
let NUM_LAYERS              = 3;

let maxLines                = 3e4; // Total lines maximum. (10k per layer).
let maxTriangles            = 3e4; // Total triangles maximum.

let lineCount               = [0, 0, 0]; // Line count per layer.
let triangleCount           = [0, 0, 0]; // Triangle count per layer.

// Track where each layer starts in the buffers.
let lineLayerOffset         = [0, 0, 0];
let triangleLayerOffset     = [0, 0, 0];

// Vertex data buffers.
let lineVertexData = new Float32Array(maxLines * 12); // All line data.
let triangleVertexData = new Float32Array(maxTriangles * 18); // All triangle data.

// let fragmentShaderSource = `
//   precision mediump float;
//   varying vec4 color;
  
//   void main() {
//     gl_FragColor = color;
//   }
// `;

// let vertexShaderSource = `
//   attribute vec2 a_position;
//   attribute vec4 a_color;
//   uniform vec2 u_resolution;
//   varying vec4 color;
  
//   void main() {
//     // Convert from pixels to 0.0 to 1.0
//     vec2 zeroToOne = a_position / u_resolution;
//     // Convert from 0->1 to 0->2
//     vec2 zeroToTwo = zeroToOne * 2.0;
//     // Convert from 0->2 to -1->+1 (clipspace)
//     vec2 clipSpace = zeroToTwo - 1.0;
    
//     gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
//     color = a_color;
//   }
// `;

let gl = C.getContext('webgl');

// Create a shader of the given type using the given source.
let createShader = (type, source) => {
	let shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	return shader;
};
// Create program.
program = gl.createProgram();
// gl.attachShader(program, createShader(GL_VERTEX_SHADER, vertexShaderSource));
gl.attachShader(program, createShader(GL_VERTEX_SHADER, `attribute vec2 a_position;attribute vec4 a_color;uniform vec2 u_resolution;varying vec4 color;void main(){vec2 zeroToOne=a_position/u_resolution;vec2 zeroToTwo=zeroToOne*2.0;vec2 clipSpace=zeroToTwo-1.0;gl_Position=vec4(clipSpace*vec2(1,-1),0,1);color=a_color;}`));
// gl.attachShader(program, createShader(GL_FRAGMENT_SHADER, fragmentShaderSource));
gl.attachShader(program, createShader(GL_FRAGMENT_SHADER, `precision mediump float;varying vec4 color;void main(){gl_FragColor=color;}`));
gl.linkProgram(program);
// Get attribute locations.
positionLocation = gl.getAttribLocation(program, "a_position");
colorLocation = gl.getAttribLocation(program, "a_color");
resolutionLocation = gl.getUniformLocation(program, "u_resolution");

// Set viewport and clear color.
gl.viewport(0, 0, C.width, C.height);
gl.clearColor(0.1, 0.1, 0.15, 1.0); // Dark blue-gray background.

gl.enable(GL_BLEND); // Enable alpha blending.
gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA); // Standard alpha blending.

gl.useProgram(program);
gl.uniform2f(resolutionLocation, C.width, C.height);

vertexBuffer = gl.createBuffer();
triangleVertexBuffer = gl.createBuffer();
// #endregion




// #region WebGL drawing
// Convert the given RGBA hex string to normalized floats.
let hexToRGBA = hex => ([parseInt(hex[0], 16) / 15, parseInt(hex[1], 16) / 15, parseInt(hex[2], 16) / 15, parseInt(hex[3], 16) / 15]);

// Convert the given fraction to a hex char.
let toHex = v => '0123456789abcdef'[v * 15 | 0];

// Add a line to the batch - write directly to vertex buffer.
let addLine = (x1, y1, x2, y2, color, layer = WORLD_LAYER) => {
  let totalLines = lineCount[0] + lineCount[1] + lineCount[2];
  if (totalLines < maxLines) {
    let [r, g, b, a] = hexToRGBA(color);
    
    let offset = (lineLayerOffset[layer] + lineCount[layer]) * 12; // Calculate offset (previous layers + current layer count).
    
    // First vertex.
    lineVertexData[offset++] = x1; lineVertexData[offset++] = y1;
    lineVertexData[offset++] = r; lineVertexData[offset++] = g; lineVertexData[offset++] = b; lineVertexData[offset++] = a;
    
    // Second vertex.
    lineVertexData[offset++] = x2; lineVertexData[offset++] = y2;
    lineVertexData[offset++] = r; lineVertexData[offset++] = g; lineVertexData[offset++] = b; lineVertexData[offset++] = a;
    
    lineCount[layer]++;
  }
};

// Add a triangle to the batch - write directly to vertex buffer.
let addTriangle = (x1, y1, x2, y2, x3, y3, color, layer = WORLD_LAYER) => {
  let totalTriangles = triangleCount[0] + triangleCount[1] + triangleCount[2];
  if (totalTriangles < maxTriangles) {

    let [r, g, b, a] = hexToRGBA(color);
    
    let offset = (triangleLayerOffset[layer] + triangleCount[layer]) * 18; // Calculate offset (previous layers + current layer count).
    
    // First vertex.
    triangleVertexData[offset++] = x1; triangleVertexData[offset++] = y1;
    triangleVertexData[offset++] = r; triangleVertexData[offset++] = g; triangleVertexData[offset++] = b; triangleVertexData[offset++] = a;
    
    // Second vertex.
    triangleVertexData[offset++] = x2; triangleVertexData[offset++] = y2;
    triangleVertexData[offset++] = r; triangleVertexData[offset++] = g; triangleVertexData[offset++] = b; triangleVertexData[offset++] = a;
    
    // Third vertex.
    triangleVertexData[offset++] = x3; triangleVertexData[offset++] = y3;
    triangleVertexData[offset++] = r; triangleVertexData[offset++] = g; triangleVertexData[offset++] = b; triangleVertexData[offset++] = a;
    
    triangleCount[layer]++;
  }
};

// Add a rectangle as 2 triangles.
let addRect = (x, y, w, h, color, layer = WORLD_LAYER) => {
  addTriangle(x, y, x + w, y, x, y + h, color, layer); // Top-left triangle.
  addTriangle(x + w, y, x + w, y + h, x, y + h, color, layer); // Bottom-right triangle.
};

// Render all batched geometry layer by layer.
let render = e => {
  gl.clear(GL_color_BUFFER_BIT);
  
  // Render each layer in order: WORLD -> PARTICLE -> UI.
  for (let layer = 0; layer < NUM_LAYERS; layer++) {
    
    // Draw triangles first in this layer.
    if (triangleCount[layer] > 0) {
      gl.bindBuffer(GL_ARRAY_BUFFER, triangleVertexBuffer);
      let startOffset = triangleLayerOffset[layer] * 18;
      let dataLength = triangleCount[layer] * 18;
      gl.bufferData(GL_ARRAY_BUFFER, triangleVertexData.subarray(startOffset, startOffset + dataLength), GL_DYNAMIC_DRAW);
      
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, GL_FLOAT, false, 24, 0);
      gl.enableVertexAttribArray(colorLocation);
      gl.vertexAttribPointer(colorLocation, 4, GL_FLOAT, false, 24, 8);
      
      gl.drawArrays(GL_TRIANGLES, 0, triangleCount[layer] * 3);
    }
    
    // Draw lines on top in this layer.
    if (lineCount[layer] > 0) {
      gl.bindBuffer(GL_ARRAY_BUFFER, vertexBuffer);
      let startOffset = lineLayerOffset[layer] * 12;
      let dataLength = lineCount[layer] * 12;
      gl.bufferData(GL_ARRAY_BUFFER, lineVertexData.subarray(startOffset, startOffset + dataLength), GL_DYNAMIC_DRAW);
      
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, GL_FLOAT, false, 24, 0);
      gl.enableVertexAttribArray(colorLocation);
      gl.vertexAttribPointer(colorLocation, 4, GL_FLOAT, false, 24, 8);
      
      gl.drawArrays(GL_LINES, 0, lineCount[layer] * 2);
    }
  }
};

// Clear all geometry and recalculate layer offsets.
let clear = e => { 
  lineCount = [0, 0, 0]; 
  triangleCount = [0, 0, 0];
  
  // Recalculate layer offsets for optimal packing.
  let maxLinesPerLayer = maxLines / NUM_LAYERS | 0;
  let maxTrianglesPerLayer = maxTriangles / NUM_LAYERS | 0;
  
  for (let i = 0; i < NUM_LAYERS; i++) {
    lineLayerOffset[i] = i * maxLinesPerLayer;
    triangleLayerOffset[i] = i * maxTrianglesPerLayer;
  }
};
// #endregion




// #region User Interface

let activeMenu;
let activeControl;

// Control types.
let UI_BUTTON                 = 0;
let UI_LABEL                  = 1;
let UI_RECT                   = 2;
let UI_FRAME                  = 3;

// Point-in-polygon test using ray casting algorithm.
let pointInPolygon = (px, py, vertices) => {
  let inside = 0;
  let j = vertices.length - 1;
  
  for (let i = 0; i < vertices.length; i++) {
    let [xi, yi] = vertices[i];
    let [xj, yj] = vertices[j];
    
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) inside = !inside;

    j = i;
  }
  return inside;
};

let FONT_SIZE = 10; // Base dimensions for font characters (actually 9x9 with 1 pixel padding on left and bottom).

let fontDef;
/*
// Only includes characters A-Z 0-9
let fontDef = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // !"#$%&'()*+,-.
  [0, 8, 8, 0], // /.
  [0, 4, 4, 8, 8, 4, 4, 0, 0, 4], // 0.
  [1, 3, 4, 0, 4, 8, -8, 8, 0, 8], // 1.
  [0, 0, 6, 0, 8, 2, 6, 4, 2, 4, 0, 6, 0, 8, 8, 8], // 2.
  [0, 0, 6, 0, 8, 2, 6, 4, 8, 6, 6, 8, 0, 8, -6, 4, 2, 4], // 3.
  [0, 0, 0, 2, 2, 4, 8, 4, -8, 0, 8, 8], // 4.
  [8, 0, 0, 0, 0, 4, 6, 4, 8, 6, 6, 8, 0, 8 ], // 5.
  [8, 0, 2, 0, 0, 2, 0, 6, 2, 8, 6, 8, 8, 6, 6, 4, 0, 4], // 6.
  [0, 0, 8, 0, 8, 4, 4, 8], // 7.
  [2, 0, 6, 0, 8, 2, 6, 4, 8, 6, 6, 8, 2, 8, 0, 6, 2, 4, 0, 2, 2, 0, -2, 4, 6, 4], // 8.
  [0, 8, 6, 8, 8, 6, 8, 2, 6, 0, 2, 0, 0, 2, 2, 4, 8, 4], // 9.
  0, 0, 0, 0, // :;<=

  , //[0,0,4,1,8,0,8,2,7,3,8,4,8,6,6,8,2,8,0,6,0,4,1,3,0,2,0,0,-2.5,3,3.5,3,-4.5,3,5.5,3,-3,5,5,5,-4,5,4,8], // >. GENERAL CAT/DOG.
  , //[0,0,3,2,5,2,8,0,8,6,6,8,2,8,0,6,0,0,-1.5,4,2.5,4,-5.5,4,6.5,4,-3,6,4,5,5,6],  // ?. BLACK CAT.

  [0,0, 2,2, 6,2, 8,0, 8,6, 6,8, 2,8, 0,6, 0,0,], // @ (Life meter (cat head icon)).

  [0, 8, 0, 4, 4, 0, 8, 4, 8, 8, -8, 4, 0, 4,], // A.
  [0, 0, 0, 8, 6, 8, 8, 6, 6, 4, 8, 2, 6, 0, 0, 0, -6, 4, 0, 4], // B.
  [8, 0, 4, 0, 0, 4, 4, 8, 8, 8], // C.
  [0, 0, 4, 0, 8, 4, 4, 8, 0, 8, 0, 0], // D.
  [8, 0, 0, 0, 0, 8, 8, 8, -8, 4, 0, 4], // E.
  [8, 0, 0, 0, 0, 8, -8, 4, 0, 4], // F.
  [8, 0, 4, 0, 0, 4, 4, 8, 8, 8, 8, 4], // G.
  [0, 0, 0, 8, -8, 4, 0, 4, -8, 0, 8, 8], // H.
  [0, 0, 8, 0, -4, 0, 4, 8, -8, 8, 0, 8], // I.
  [4, 0, 8, 0, 8, 4, 4, 8, 0, 4], // J.
  [0, 0, 0, 8, -8, 0, 8, 2, 6, 4, 0, 4, -8, 8, 8, 6, 6, 4], // K.
  [0, 0, 0, 8, 8, 8], // L.
  [0, 8, 0, 0, 4, 4, 8, 0, 8, 8], // M.
  [0, 8, 0, 0, 8, 8, 8, 0], // N.
  [0, 4, 4, 8, 8, 4, 4, 0, 0, 4], // O.
  [0, 4, 6, 4, 8, 2, 6, 0, 0, 0, 0, 8], // P.
  [0, 4, 4, 8, 8, 4, 4, 0, 0, 4, -5, 5, 8, 8], // Q.
  [0, 8, 0, 0, 6, 0, 8, 2, 6, 4, 8, 6, 8, 8, -6, 4, 0, 4], // R.
  [8, 0, 2, 0, 0, 2, 2, 4, 6, 4, 8, 6, 6, 8, 0, 8 ], // S.
  [0, 0, 8, 0, -4, 0, 4, 8 ], // T.
  [0, 0, 0, 4, 4, 8, 8, 8, 8, 0 ],  // U.
  [0, 0, 0, 4, 4, 8, 8, 4, 8, 0 ], // V.
  [0, 0, 0, 8, 4, 4, 8, 8, 8, 0 ],  // W.
  [0, 0, 8, 8, -8, 0, 0, 8 ],  // X.
  [0, 0, 4, 4, 4, 8, -4, 4, 8, 0 ], // Y.
  [0, 0, 8, 0, 0, 8, 8, 8 ], // Z.
];
*/

// Get the width of the given string in pixels, at the given scale.
let stringWidthInPixels = (str, scale = 1) => (str.length * FONT_SIZE * scale);

// Get the x position for the given string to center it on screen.
let centerText = (text, scale = 2.5) => (WIDTH - stringWidthInPixels(text, scale)) / 2;

// Draw the given string at the given coordinates, in the given color, at the given scale.
let drawString = (x, y, str, color = COLOR_WHITE, scale = 1) => {

  x += scale; // Small positioning adjustment.

  let drawX = x; // Current line cursor position.

  for (let i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i) - 32;

    if (charCode === 3) { // Newline. Reset x and advance y.

      y += (FONT_SIZE + 4) * scale;
      drawX = x;

    } else {
      let points = fontDef[charCode];

      if (points) { // No need to check length > 0, a truthy check is enough.
        let currentX = points[0];
        let currentY = points[1];

        for (let j = 2; j < points.length; j += 2) {
          let nextX = points[j];
          let nextY = points[j + 1];

          if (nextX < 0) { // Move the cursor without drawing.
            currentX = -nextX;
            currentY = nextY;

          } else { // Draw the line.
            addLine(drawX + currentX * scale, y + currentY * scale, drawX + nextX * scale, y + nextY * scale, color, UI_LAYER);

            currentX = nextX;
            currentY = nextY;
          }
        }
      }
      drawX += FONT_SIZE * scale; // Advance cursor for next char.
    }
  }
};

// Draw the given button to the given layer.
let addHexButton = (button, layer = UI_LAYER) => {
  let vertices = button._vertices;

  let borderColor = (button === activeControl) ? COLOR_WHITE : button._borderColor;
  
  let fill = '0006'; // Default behavior is to darken the buttons inner area.
  
  // Convert vertices to individual coordinates for triangle rendering.
  let [p1, p2, p3, p4, p5, p6] = vertices;
  
  // Render filled background as 4 triangles.
  addTriangle(p1[0], p1[1], p2[0], p2[1], p6[0], p6[1], fill, layer); // Left triangle.
  addTriangle(p2[0], p2[1], p3[0], p3[1], p5[0], p5[1], fill, layer); // Top triangle.
  addTriangle(p2[0], p2[1], p5[0], p5[1], p6[0], p6[1], fill, layer); // Center triangle.
  addTriangle(p3[0], p3[1], p4[0], p4[1], p5[0], p5[1], fill, layer); // Right triangle.
  
  // Draw outline.
  for (let i = 0; i < vertices.length; i++) {
    let curr = vertices[i];
    let next = vertices[(i + 1) % vertices.length];
    addLine(curr[0], curr[1], next[0], next[1], borderColor, layer);
  }

  // Draw button text (centered inside button).
  let scale = button._textScale;
  let text = button._text;
  let x = (button.x + button.w / 2) - (stringWidthInPixels(text, scale)) / 2 ;
  let y = button.y + (button.h / 2) - ((FONT_SIZE * scale) / 2);
  drawString(x, y, text, button._textColor, scale);
};

// Draw the given label.
let addLabel = label => drawString(label.x, label.y, label._text, label._textColor, label._textScale);

// Create a new button with the given properties.
let newButton = (x, y, w, h, _text, _textScale, _textColor, _borderColor, _action, _visible = 1) => {
  let hh = h * 0.5; // Half height for pointy ends.
  let my = y + hh; // Middle y coordinate.
  let ml = x - hh; // Left point.
  let mr = x + w + hh; // Right point.

  return {
    _type: UI_BUTTON,
    x,
    y,
    w,
    h,
    _text,
    _textScale,
    _textColor,
    _borderColor,
    _action,
    _vertices : [
      [ml, my],        // Left point.
      [x, y],          // Top left.
      [x + w, y],      // Top right.  
      [mr, my],        // Right point.
      [x + w, y + h],  // Bottom right.
      [x, y + h]       // Bottom left.
    ],
    _visible,
  };
};

// Create a new label with the given properties.
let newLabel = (x, y, _text, _textScale, _textColor, _visible = 1) => ({
  _type: UI_LABEL,
  x,
  y,
  _text,
  _textScale,
  _textColor,
  _visible,
});

// Create a new rectangle with the given properties.
let newRect = (x, y, w, h, _color, _visible = 1) => ({
  _type: UI_RECT,
  x,
  y,
  w,
  h,
  _color,
  _visible,
});

// Create a new frame with the given properties.
let newFrame = (x, y, w, h, _color, _visible = 1) => ({
  _type: UI_FRAME,
  x,
  y,
  w,
  h,
  _color,
  _visible,
});

// Convert screen mouse coordinates to scaled canvas coordinates.
let getMousePosition = e => {
  let rect = C.getBoundingClientRect();
  return [
    (e.clientX - rect.left) * WIDTH / rect.width,
    (e.clientY - rect.top) * HEIGHT / rect.height,
  ];
};

// Mouse click event handler.
onclick = e => {

  let [x, y] = getMousePosition(e);
  let uiClicked = 0; // Flag to track if a UI button was clicked.
 
  // First, check for UI button clicks.
  if (activeMenu && !mouseLocked) {
    for (let control of activeMenu) {
      if (control._visible) {
        if (control._type < UI_LABEL && pointInPolygon(x, y, control._vertices)) {
          if (control._action) {
            fx_play(FX_BUTTON);
            control._action(e); // Call button action if it has one.
          }
          uiClicked = 1; // A button was clicked, set the flag.
          break;
        }
      }
    }
  }

  // Only re-lock the pointer if the game is on AND no UI button was clicked.
  if (!uiClicked && programState === STATE_GAMEON && !mouseLocked && !playerDied) C.requestPointerLock();
}

// Mouse move event handler.
onmousemove = e => {

  let [x, y] = getMousePosition(e);

  let newActiveControl = 0;

  // Process UI button hovering.
  if (activeMenu && !mouseLocked) {
    for (let control of activeMenu) {
      if (control._visible) {
        if (control._type < UI_LABEL && pointInPolygon(x, y, control._vertices)) {
          newActiveControl = control;
          break;
        }
      }
    }
  }
  
  activeControl = newActiveControl;
}

// #endregion




// #region Menu definitions.

// 
// Main menu.
// 

let mainMenu = [
  newLabel(474, 50, 'BLACK CAT', 11, '55ff'),
  newLabel(536, 155, 'NINE LIVES NO MERCY', 4.5, 'f6ff'),

  newButton(1400, 299, 400, 80, 'OPTIONS', 3.5, COLOR_ORANGE, COLOR_YELLOW, e => activeMenu = optionsMenu),

  newButton(1400, 499, 400, 80, 'HIGHSCORES', 3.5, COLOR_ORANGE, COLOR_YELLOW, e => activeMenu = highscoresMenu),

  // newButton(1400, 699, 400, 80, 'HELP', 3.5, COLOR_ORANGE, COLOR_YELLOW, e =>activeMenu = helpMenu),
  newButton(1400, 699, 400, 80, 'TRAINING', 3.5, COLOR_ORANGE, COLOR_YELLOW, e => {
    trainingMode = 1;
    playerCanBeDamaged = 0;
    C.requestPointerLock();
    startNewGame();
  }),

  newButton(710, 885, 510, 100, 'LAUNCH', 6.5, COLOR_ORANGE, COLOR_YELLOW, e => {
    C.requestPointerLock();
    startNewGame();
  }),

  newLabel(624, 1030, 'A TINY SHMUP FOR JS13K 2025', 2.5, COLOR_WHITE),
];

// 
// Highscores menu.
// 

// Update highscore menu with best scores from options.
let updateHighscoreLabels = e => {
  for (let i = 5; i--;) {
    let score = OPTIONS.s[i];
    let s = score.n + ' ' + score.s;
    let control = highscoresMenu[i];
    control._text = s;
    control.x = centerText(s, 5);// x;
  }
};

let highscoresMenu = [
    // newRect( 480, 285, 960, 570, '0003', 1),  // (5) Boarding/loading frame.

    newLabel(536, 330, '', 5, '0f0f'),
    newLabel(536, 430, '', 5, COLOR_YELLOW),
    newLabel(536, 530, '', 5, 'f0ff'),
    newLabel(536, 630, '', 5, '0fff'),
    newLabel(536, 730, '', 5, COLOR_WHITE),

    newLabel(420, 100, 'HIGHSCORES', 11, 'ffff'),

    newButton(719, 920, 400, 80, 'OKAY', 4, COLOR_ORANGE, COLOR_YELLOW, e => activeMenu = mainMenu),
];

// 
// Options menu.
// 

let updateOptionsButton = (index, text) => optionsMenu[index]._text = ['FORWARDS', 'REVERSE', 'LEFT', 'RIGHT', 'LAND', 'SOUND EFFECTS'][index] + ' ' + text.toUpperCase();

let toggleSoundEffects = e => {
  OPTIONS.a = !OPTIONS.a;
  updateOptionsButton(5, OPTIONS.a ? 'ON' : 'OFF');
};

let optionsMenu = [
  newButton(160, 420, 720, 80, '', 4, COLOR_ORANGE, COLOR_YELLOW, e => initControlRemap(THRUST_FORWARD_CONTROL)),   // (0).
  newButton(1000, 420, 720, 80, '', 4, COLOR_ORANGE, COLOR_YELLOW, e => initControlRemap(THRUST_REVERSE_CONTROL)),  // (1).
  
  newButton(160, 560, 720, 80, '', 4, COLOR_ORANGE, COLOR_YELLOW, e => initControlRemap(STRAFE_LEFT_CONTROL)),     // (2).
  newButton(1000, 560, 720, 80, '', 4, COLOR_ORANGE, COLOR_YELLOW, e => initControlRemap(STRAFE_RIGHT_CONTROL)),     // (3).
  
  newButton(569, 700, 720, 80, '', 4, COLOR_ORANGE, COLOR_YELLOW, e => initControlRemap(LAND_DUSTOFF_CONTROL)),     // (4).
  
  newButton(569, 250, 700, 80, '', 4, COLOR_ORANGE, COLOR_YELLOW, e => toggleSoundEffects()),

  newLabel(439, 820, 'PRESS NEW CONTROL KEY', 5, COLOR_WHITE, 0),

  newLabel(585, 100, 'OPTIONS', 11, 'f0ff'),

  newButton(719, 920, 400, 80, 'OKAY', 4, COLOR_ORANGE, COLOR_YELLOW, e => {
    activeMenu = mainMenu;
    saveOptions();
  }),
];

// 
// Game menu.
// 

// Control indexes, used to chamge control properties such as position, or text.

let returnToMainMenu = e => {

  trainingMode = 0;

  gameMenu[9]._visible = 0;

  generateTerrain(1);

  activeMenu = mainMenu;
  programState = STATE_MAINMENU;

  if (mouseLocked) D.exitPointerLock();


};

let BOARDING_BAR      = 0;
let BOARDING_FRAME    = 1;
let SCORE_LABEL       = 2;
let LIVES_LABEL       = 3;
let CATS_LABEL        = 4;

let gameMenu = [
  newRect(480, 1000, 0, 20, '8f8f', 0),             // (0) Boarding/loading frame.
  newFrame(480, 1000, 960, 20, 'eeef', 0),          // (1) Boarding/loading progress bar.

  newLabel(20, 20, '', 6, COLOR_WHITE),             // (2) Score readout.
  newLabel(692, 20,  '', 6, COLOR_WHITE),           // (3) Lives readout.
  newLabel(20, 980, '', 6, COLOR_WHITE),            // (4) Rescued cats readout.
  newLabel(20, 980, '', 6, COLOR_WHITE),            // (5)

  newRect( 360, 800, 1200, 90, '0008', 0),         // (6) Notify background.
  newFrame(360, 800, 1200, 90, COLOR_YELLOW, 0),   // (7) Notify frame.
  newLabel(370, 835, '', 2.5, COLOR_WHITE, 0),      // (8) Notify text.

  newButton(1200, 962, 600, 80, 'END TRAINING', 4, COLOR_ORANGE, COLOR_YELLOW, e => returnToMainMenu(), 0),

  newButton(1830, 20, 40, 60, 'E', 4, COLOR_ORANGE, COLOR_YELLOW, e => {
    C.requestPointerLock();
    toggleSoundEffects();
  }),
];

// 
// Gameover menu.
// 

let gameOverMenu = [
  newRect( 400, 400, 1120, 200, '0003', 0),
  newFrame(400, 400, 1120, 200, COLOR_YELLOW, 0),
  newLabel(686, 525, '', 2.5, COLOR_WHITE, 0),
  newLabel(543, 450, 'YOU GOT A NEW HIGH SCORE', 3.5, 'ff8f', 0),
  
  newButton(657, 900, 600, 100, 'CONTINUE', 5, COLOR_ORANGE, COLOR_YELLOW, e => returnToMainMenu()),

  newLabel(475, 80, 'GAME OVER', 11, 'f84f'),
];

// #endregion




//#region Camera/projection.

let playerCamera; // Location of the player is in the game world.

let viewCamera; // The 3rd person camera, loacted above and behind the player, looking down at the player.

// Create a new camera at the given location facing in the given directions.
let newCamera = (x, y, z, yaw, pitch) => ({x, y, z, yaw, pitch});

// Get the 3rd person view, positioned above and behind the player.
let getViewCamera = e => newCamera(playerCamera.x + .5, playerCamera.y + VIEW_Y, playerCamera.z - VIEW_Z, 0, VIEW_PITCH);

// Determine whether the 2 given cameras are in range of eachother as determined by the given radius.
let isInRangeOf = (cameraA, cameraB, distance) => {
  let dx = cameraA.x - cameraB.x;
  let dz = cameraA.z - cameraB.z;
  return (dx * dx + dz * dz) < distance;
};

// Choose a new random location in the world (away from the edges).
// NOTE: The min and max are relative to `MAP_SIZE`, so adjust accordingly if you increase or decrease that variable.
let newWayPoint = e => newCamera(randomInt(16, MAP_SIZE - 32), 0 , randomInt(16, MAP_SIZE - 32));

// Project a single 3D point to 2D screen space.
let projectPoint = (wx, wy, wz) => {
  // Pre-calculate the sin/cos values for the camera's rotation.
  let cosYaw = cos(viewCamera.yaw), sinYaw = sin(viewCamera.yaw);
  let cosPitch = cos(viewCamera.pitch), sinPitch = sin(viewCamera.pitch);

  let dx = wx - viewCamera.x, dy = wy - viewCamera.y, dz = wz - viewCamera.z; // Convert world coordinates to be relative to the camera position.

  let rx = dx * cosYaw + dz * sinYaw, rz = dz * cosYaw - dx * sinYaw; // Rotate around the Y-axis to handle left/right camera rotation.

  let ry = dy * cosPitch - rz * sinPitch, rz_pitched = dy * sinPitch + rz * cosPitch; // Rotate around the X-axis to handle up/down camera rotation.

  if (rz_pitched <= 0.1) return 0; // The point is behind or very close to the camera (don't draw).

  return { x: (rx / rz_pitched) * FOCAL_LENGTH + (WIDTH / 2), y: -(ry / rz_pitched) * FOCAL_LENGTH + (HEIGHT / 2) }; // Divide by depth to create the perspective effect, then scale and center on screen.
};

//#endregion




// #region Terrain Generation

// NOTE: Normals are disabled but left commented out. These would be handy for effects 

// SVG turbulence filter settings.
let feTurbulenceBaseFrequency = .04;
let feTurbulenceNumOctaves    = 5;

// Terrain type heights.
let SHALLOW_HEIGHT            = .03;
let SAND_HEIGHT               = .08;
let GRASS_HEIGHT              = .13;
let FOREST_HEIGHT             = .3;
let MOUNTAIN_HEIGHT           = .4
let SNOW_HEIGHT               = .6;

// let map, colors, normals;
let map, colors;

let sandTiles, grassTiles, forestTiles, waterTiles, landTiles;

let generatingTerrain;

let generateTerrain = (notGame = 0) => {
  //beginclip
  let s = performance.now();
  //endclip

  generatingTerrain = 1;

  MAP_SIZE = notGame ? 80 : 128;
  MAP_CENTER = MAP_SIZE / 2;

  // log(`generating terrain:${MAP_SIZE}`);

  // map = []; colors = []; normals = []; sandTiles = []; grassTiles = []; forestTiles = []; waterTiles = []; // Obliterate the previous universe.
  map = []; colors = []; sandTiles = []; grassTiles = []; forestTiles = []; waterTiles = []; // Obliterate the previous universe.
  let canvas = D.createElement('canvas');
  canvas.width = MAP_SIZE; canvas.height = MAP_SIZE;
  let ctx = canvas.getContext('2d');
  let image = new Image();

  image.onload = e => {
    ctx.drawImage(image, 0, 0);
    let imageData = ctx.getImageData(0, 0, MAP_SIZE, MAP_SIZE).data;
    for (let z = 0; z < MAP_SIZE; z++) {
      let rowOfHeight = [], rowOfColor = [];
      for (let x = 0; x < MAP_SIZE; x++) {

        let height = ((imageData[(z * MAP_SIZE + x) * 4] )/ 255) * (1 - (sqrt((MAP_CENTER - x) * (MAP_CENTER - x) + (MAP_CENTER - z) * (MAP_CENTER - z)) / MAP_CENTER));

        if (height < SHALLOW_HEIGHT) { rowOfHeight.push(0); rowOfColor.push('04c'); if(x > 1 && x < MAP_SIZE - 2 && z > 1 && z < MAP_SIZE - 2) waterTiles.push([x, z]);} // Deep water.
        else if (height < SAND_HEIGHT) { rowOfHeight.push(0); rowOfColor.push('48f'); waterTiles.push([x, z]); } // Shallow water.
        // else if (height < grass) { rowOfHeight.push(.4 + random() * .05); rowOfColor.push('fe7'); sandTiles.push([x, z]); } // Sand.
        // else if (height < forest) { rowOfHeight.push(.6 + random() * .1); rowOfColor.push('7f2'); grassTiles.push([x, z]); } // Grass.

        else if (height < GRASS_HEIGHT) { rowOfHeight.push(.4); rowOfColor.push('fe7'); sandTiles.push([x, z]); } // Sand.
        else if (height < FOREST_HEIGHT) { rowOfHeight.push(.6); rowOfColor.push('7f2'); grassTiles.push([x, z]); } // Grass.
        else if (height < MOUNTAIN_HEIGHT) { rowOfHeight.push(.9 + random() * .25); rowOfColor.push('4f8'); forestTiles.push([x, z]); } // Forest.
        else if (height < SNOW_HEIGHT) { rowOfHeight.push(1.2 + random() * .5); rowOfColor.push('987'); } // Mountain.
        else { rowOfHeight.push(1.6 + random() * 1.5); rowOfColor.push('fff'); } // Snow.
      }
      map.push(rowOfHeight); colors.push(rowOfColor);
    }

    // Generate normals.
    // for (let z = 0; z < MAP_SIZE; z++) {
    //   let rowOfNormal = [];
    //   for (let x = 0; x < MAP_SIZE; x++) {
    //     let hL = map[z][x > 0 ? x-1 : x], hR = map[z][x < MAP_SIZE-1 ? x+1 : x];
    //     let hD = map[z > 0 ? z-1 : z][x], hU = map[z < MAP_SIZE-1 ? z+1 : z][x];
    //     let n = { x: hL-hR, y: 2.0, z: hD-hU };
    //     let len = sqrt(n.x*n.x + n.y*n.y + n.z*n.z);
    //     n.x /= len; n.y /= len; n.z /= len;
    //     rowOfNormal.push(n);
    //   }
    //   normals.push(rowOfNormal);
    // }

    landTiles = [...sandTiles, ...grassTiles, ...forestTiles];

    //beginclip
    log(`terrain generated in ${performance.now() - s}ms`);
    log(`waterTiles:${waterTiles.length} sandTiles:${sandTiles.length} grassTiles:${grassTiles.length} forestTiles:${forestTiles.length} landTiles:${landTiles.length}`);
    //endclip

    if (notGame) { // Generating for menus background.

      programState = STATE_NONE;

      generateSphere();

      activeMenu = mainMenu;
      programState = STATE_MAINMENU;

      //beginclip
      frameCount = 0;
      fpsTime = 0;
      fps = 0;
      //endclip

      mainGameLoop(0);

    } else { // Generating for new level.

      terrainGenerated();

    }

    generatingTerrain = 0;

  };
  image.src = `data:image/svg+xml;base64,${btoa(`<svg width="256" height="256" version="1.1" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><filter id="n"><feTurbulence type="turbulence" seed="${random() * 1e6}" baseFrequency="${feTurbulenceBaseFrequency}" numOctaves="${feTurbulenceNumOctaves}"/><feColorMatrix values="0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 1"/></filter><rect x="0" y="0" width="256" height="256" filter="url(#n)"/></svg>`)}`;
};
//#endregion




//#region Terrain Operations.

let getColorForHeight = height => {
  if (height < .5) return '48f'; // Shallows.
  if (height < .7) return 'fe7'; // Sand.
  if (height < 1) return '7f2'; // Grass.
  if (height < 1.3) return '4f8'; // Forest.
  return '897'; // Mountain.
};

let DEFORMATION_DEPTH = .5; // How much any tile is lowered when bombed.

// Deform the terrain at the given coordinates, lowering it by an amount.
let deformTerrain = (impactX, impactZ) => {
  // Find the top-left vertex of the quad the bomb landed in.
  // let ix = impactX - .5 | 0;
  // let iz = impactZ - .5| 0;
  let ix = impactX | 0;
  let iz = impactZ -.5| 0;

  // Define the amount to lower each of the 4 vertices.
  let depth = DEFORMATION_DEPTH; 

  // Lower all 4 vertices.
  for (let dz = -1; dz <= 0; dz++) {
    for (let dx = -1; dx <= 0; dx++) {
      let nx = ix + dx;
      let nz = iz + dz;

      if (nx < 0 || nx >= MAP_SIZE || nz < 0 || nz >= MAP_SIZE) continue; // Boundary check for each vertex.
      
      map[nz][nx] = M.max(0, map[nz][nx] - depth); // Lower the vertex height, ensuring it doesn't go below zero.
    }
  }

  // 
  // NOTE: Do we even need to have normal data? I mean nothing now seems to use them.. hmm.
  // 

  // Update color and normal.
  for (let dz = -1; dz <= 2; dz++) {
    for (let dx = -1; dx <= 2; dx++) {
      let nx = ix + dx;
      let nz = iz + dz;
      
      if (nx < 0 || nx >= MAP_SIZE || nz < 0 || nz >= MAP_SIZE) continue; // Boundary check.

      // Recalculate color for this tile
      colors[nz][nx] = getColorForHeight(map[nz][nx]);

      // recalculateNormalAt(nx, nz);
    }
  }
};

// let recalculateNormalAt = (x, z) => {
//   // if (x < 0 || x >= MAP_SIZE || z < 0 || z >= MAP_SIZE) return;
//   if (x || x < MAP_SIZE || z || z < MAP_SIZE) {

//     let heightLeft = map[z][x > 0 ? x - 1 : x];
//     let heightRight = map[z][x < MAX_XZ ? x + 1 : x];
//     let heightDown = map[z > 0 ? z - 1 : z][x];
//     let heightUp = map[z < MAX_XZ ? z + 1 : z][x];

//     let n = { x: heightLeft - heightRight, y: 2.0, z: heightDown - heightUp };
//     let len = sqrt(n.x * n.x + n.y * n.y + n.z * n.z) || 1; // Avoid division by zero.
//     n.x /= len; n.y /= len; n.z /= len;

//     normals[z][x] = n;
//   }
// };

// Get a random position that is surrounded be the same terrain type. Surrounding tiles will be excluded from any other call to this function.
let getPositionInTileFrom = (tiles, altitude, fixedAltitude) => {

  let DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

  let tx, tz;
  let done;

  do {
   
    // if (!tiles.length) return newCamera(0, 0, 0, 0, 0); // If we run out of possible tiles, exit to prevent an infinite loop.

    let index = randomInt(0, tiles.length - 1);
    [tx, tz] = tiles.splice(index, 1)[0]; // Get (and remove) a tile.

    // Check if the chosen tile itself is within bounds before accessing colors array.
    if (tz < 0 || tz >= MAP_SIZE || tx < 0 || tx >= MAP_SIZE) {
        done = 0;
        continue; // Skip this invalid tile and try again.
    }

    let color = colors[tz][tx];

    // Check surrounding 8 tiles.
    done = DIRS.every(([dx, dz]) => {
      let nx = tx + dx;
      let nz = tz + dz;

      // Ensure neighbor coordinates are within bounds first
      if (nz < 0 || nz >= MAP_SIZE || nx < 0 || nx >= MAP_SIZE) return 0; // This neighbor is off the map, so the tile is not 'surrounded'.

      return colors[nz][nx] === color;
    });

  } while (!done);

  // If we get here, we have a valid tile.
  
  // Remove surrounding tiles from the available pool.
  for (let [dx, dz] of DIRS) {
    let nx = tx + dx;
    let nz = tz + dz;
    // Find the index of the neighbor tile in the 'tiles' array.
    let indexToRemove = tiles.findIndex(t => t[0] === nx && t[1] === nz);
    
    // If it's found (index > -1), remove it.
    if (indexToRemove > -1) {
      tiles.splice(indexToRemove, 1);
    }
  }

  return newCamera(tx + 0.5, fixedAltitude ? 3.2 : map[tz][tx] + altitude, tz + 0.5, random() * PI2, 0);
};

//#endregion




// #region Mainmenu Stuff.

let INTROSHIP_ORIGIN_X = -1.25;
let INTROSHIP_ORIGIN_Y = 0.5;
let INTROSHIP_ORIGIN_Z = -27;

let introShip = newTempObject(
  newCamera(INTROSHIP_ORIGIN_X, INTROSHIP_ORIGIN_Y, INTROSHIP_ORIGIN_Z, 0, 0),
  // newCamera(INTROSHIP_ORIGIN_X, INTROSHIP_ORIGIN_Y, INTROSHIP_ORIGIN_Z, -0.074, -0.0185),
	TYPE_PLAYER,
  '4ff'
);

let introShipDriftCounterX = random();
let introShipDriftCounterY = random();

// let sphere = {
// 	_camera: newCamera(0, 0, 0, 0, 0),
// 	_meshIndex: 18,
// };

let sphere = newTempObject(
	newCamera(0, 0, 0, 0, 0), 
  18 // Sphere.
);

let TERRAIN_AMPLITUDE         = 0.35; // Influences the height of the terrain on the sphere.
let TOTAL_LATITUDE_BANDS      = 96;   // Number of segments from pole to pole.
let SPHERE_RADIUS             = 6;

// Generate a sphere and map a generated terrain to it's surface.
let generateSphere = e => {

  let vertices = [];
  let edges = [];

  let equatorBand = TOTAL_LATITUDE_BANDS / 2;
  let terrainHalfHeight = MAP_CENTER;
  let terrainStartBand = equatorBand - terrainHalfHeight;
  let terrainEndBand = equatorBand + terrainHalfHeight;

  for (let lat = 0; lat <= TOTAL_LATITUDE_BANDS; lat++) {
    let theta = lat * PI / TOTAL_LATITUDE_BANDS;
    let sinTheta = sin(theta);
    let cosTheta = cos(theta);

    for (let lon = 0; lon <= TOTAL_LATITUDE_BANDS; lon++) {
      let phi = lon * PI2 / TOTAL_LATITUDE_BANDS;
      let sinPhi = sin(phi);
      let cosPhi = cos(phi);
      
      let height = 0; 

      if (lat >= terrainStartBand && lat < terrainEndBand && lon < MAP_SIZE) height = map[lat - terrainStartBand][lon];
      
      let newRadius = SPHERE_RADIUS + (height * TERRAIN_AMPLITUDE);

      let x = cosPhi * sinTheta;
      let y = cosTheta;
      let z = sinPhi * sinTheta;

      vertices.push(newRadius * x, newRadius * y, newRadius * z);
    }
  }
  
  for (let lat = 0; lat < TOTAL_LATITUDE_BANDS; lat++) {
    for (let lon = 0; lon < TOTAL_LATITUDE_BANDS; lon++) {
      let first = (lat * (TOTAL_LATITUDE_BANDS + 1)) + lon;
      let second = first + TOTAL_LATITUDE_BANDS + 1;
      edges.push(first, first + 1);
      edges.push(first, second);
    }
  }

  // The sphere's mesh data is always at index 19.
  objectMeshes[36] = vertices;
  objectMeshes[37] = edges;

};

let STAR_ORIGIN_X             = 40;
let STAR_ORIGIN_Y             = 0;
let STAR_ORIGIN_Z             = 100;

let NUM_STARS                 = 400;
let STAR_SPEED                = 10;
let STARFIELD_DEPTH           = 30;
let STARFIELD_SPREAD          = STARFIELD_DEPTH * 3;

let stars = []; // We need this array again

let starfieldMoveVector;// = { x: 0, y: 0, z: 0 };

// Generate a cloud of 3D stars.
let generateStars = e => {
  // All stars move from far away in the angle between the origin and the intro ship.
  let dirX = INTROSHIP_ORIGIN_X - STAR_ORIGIN_X;
  let dirY = INTROSHIP_ORIGIN_Y - STAR_ORIGIN_Y;
  let dirZ = INTROSHIP_ORIGIN_Z - STAR_ORIGIN_Z;

  let mag = sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);

  starfieldMoveVector = newCamera(dirX / mag, dirY / mag, dirZ / mag);
  
  // Generate stars in a volume (this part is also the same).
  for (let i = NUM_STARS; i--;) {
    stars.push({
      x: (random() - 0.5) * STARFIELD_SPREAD,
      y: (random() - 0.5) * STARFIELD_SPREAD,
      z: random() * STARFIELD_DEPTH,
      size: random() * 4 + 1,
    });
  }
};

// Update and draw stars.
let updateAndDrawStars = e => {
  let sphereRadiusSq = SPHERE_RADIUS * SPHERE_RADIUS * SPHERE_RADIUS; 

  for (let star of stars) {
    // Move the star along the constant, pre-calculated direction vector.
    star.x += starfieldMoveVector.x * STAR_SPEED * dt;
    star.y += starfieldMoveVector.y * STAR_SPEED * dt;
    star.z += starfieldMoveVector.z * STAR_SPEED * dt;

    let distSq = star.x * star.x + star.y * star.y + star.z * star.z;
    if (distSq < sphereRadiusSq) continue; // This star is inside the sphere, so skip to the next one.

    // reset it to the "front" of the scene (the far positive Z boundary).
    if (star.z < -STARFIELD_DEPTH) { // Reset star.
        star.x = -STARFIELD_DEPTH + random() * STARFIELD_SPREAD;
        star.y = -STARFIELD_DEPTH + random() * STARFIELD_SPREAD;
        star.z += STARFIELD_DEPTH * 2;
      }

    // Project and draw the star.
    let p = projectPoint(star.x, star.y, star.z);
    if (p) {
      // Fade stars based on depth.
      // let alpha = 1.0 - (star.z / STARFIELD_DEPTH);
      // let color = 'fff' + toHex(clamp(alpha, 0, 1));
      // addRect(p.x, p.y, star.size, star.size, color);
      addRect(p.x, p.y, star.size, star.size, 'fff' + toHex(clamp(1.0 - (star.z / STARFIELD_DEPTH), 0, 1)));
    }
  }
};

// #endregion




//#region Input handlers.

let remapIndex;
let waitingForKeypress;

// Initialize control key remap.
let initControlRemap = index => {
  remapIndex = index;
  waitingForKeypress = 1;
  optionsMenu[6]._visible = 1;
};

// Remap control.
let remapControl = (key) => {
  keys[key] = 0;
  OPTIONS.c[remapIndex].k = key
  updateOptionsButton(remapIndex, key);
  optionsMenu[6]._visible = 0;
  waitingForKeypress = 0;
};

let keys = [];

let mouseLocked;

let scoreIndex;
let enteredName = '';
let enteringName; // For testing, set this to true
let MAX_NAME_LENGTH = 10; // A good practice to limit the name length

onkeydown = e => {

  if (enteringName) {
    let key = e.key;

    if (key === 'Enter') {

      if (enteredName === '') enteredName = 'RANDOM CAT';

      gameOverMenu[4]._visible = 0;

      gameOverMenu[0]._visible = 0;
      gameOverMenu[1]._visible = 0;
      gameOverMenu[2]._visible = 0;
      gameOverMenu[3]._visible = 0;

      OPTIONS.s[scoreIndex].n = enteredName;
      OPTIONS.s[scoreIndex].s = score;

      enteringName = 0;

      updateHighscoreLabels();

      saveOptions();

      generateTerrain(1);
      
      programState = STATE_MAINMENU
      activeMenu = highscoresMenu;

    } else if (key === 'Backspace') {
      enteredName = enteredName.slice(0, -1);

    // Test the key against the regex if it's a single character.
    } else if (key.length === 1 && enteredName.length < MAX_NAME_LENGTH && /^[a-z0-9 ]$/i.test(key)) {

      enteredName += key.toUpperCase();
    }

    // Update label in menu.
    let control = gameOverMenu[2];
    control._text = enteredName;
    control.x = centerText(enteredName);

  } else {

    keys[e.code] = 1;
  }
}

onkeyup = e => {
  if (waitingForKeypress) {
    remapControl(e.code);

  } else {
    // if (programState != STATE_GAMEON && (keys['Enter'] || keys['Space'])) rejigMenus();
    if (programState != STATE_GAMEON && (keys['Enter'] || keys['Space'])) {
      if (activeMenu === mainMenu) {

        startNewGame();

      } else if (activeMenu) {

        if (activeMenu === optionsMenu) {
          optionsMenu[6]._visible = 0;
          waitingForKeypress = 0;
        }

        if (activeMenu === gameOverMenu) {
          D.exitPointerLock();
          generateTerrain(1);
          programState = STATE_MAINMENU;
          particles = [];
        }

        activeMenu = mainMenu;
      }
    }

    keys[e.code] = 0;
  }
}

D.onpointerlockchange = e => mouseLocked = D.pointerLockElement === C;

D.onmousemove = e => {
  if (programState === STATE_GAMEON && !playerOnRails) playerCamera.yaw -= e.movementX * PLAYER_TURN_SPEED;
};

onmousedown = e => {
  // log(e);

  if (programState === STATE_GAMEON) {

    let time = performance.now();

    if (e.button === 0 && (time - lastBulletFireTime) / 1e3 > BULLET_COOLDOWN && !playerOnRails) { // Fire a bullet.
      lastBulletFireTime = time;
      let vx = -sin(playerCamera.yaw) * BULLET_SPEED;
      let vz = cos(playerCamera.yaw) * BULLET_SPEED;
      newBullet(TYPE_PLAYER, playerCamera.x, playerCamera.y, playerCamera.z, vx, 0, vz);

      for (let wingman of wingMen) { // Fire bullets for enabled wingman.
        if (wingman._enabled) {
          let wingmanCamera = wingman._camera;
          newBullet(TYPE_PLAYER, wingmanCamera.x, wingmanCamera.y, wingmanCamera.z, vx, 0, vz);
        }
      }

      fx_play(FX_SHOOT);
    }

    if (e.button === 2 && (time - lastBombDropTime) / 1e3 > BOMB_COOLDOWN && !playerOnRails) { // Drop a bomb.
      lastBombDropTime = time;
      bombs.push({
        bDh,
        x: playerCamera.x, 
        y: playerCamera.y, 
        z: playerCamera.z, 
        yaw: playerCamera.yaw,
        vx: -sin(playerCamera.yaw) * PLAYER_HORIZONTAL_SPEED,
        vy: bombVy, 
        vz: cos(playerCamera.yaw) * PLAYER_HORIZONTAL_SPEED,
      });

      fx_play(FX_DROP_BOMB);
    }
  }
};

//#endregion.

// let rejigMenus = e => {
//   if (activeMenu === mainMenu) {

//     startNewGame();

//   } else if (activeMenu) {

//     if (activeMenu === optionsMenu) {
//       optionsMenu[6]._visible = 0;
//       waitingForKeypress = 0;
//     }

//     if (activeMenu === gameOverMenu) {
//       D.exitPointerLock();
//       generateTerrain(1);
//       programState = STATE_MAINMENU;
//       particles = [];
//     }

//     activeMenu = mainMenu;
//   }
// };

//#region Particles

let TYPE_RECTANGLE      = 0;
let TYPE_TRIANGLE       = 1;
let TYPE_MESH           = 2;

// Create a new particle at the given coordinates, with the given properties.
let newParticle = (x, y, z, vx, vy, vz, ttl, _ttlMax, _baseColor, _size = 1, obeysGravity = 0, _type = TYPE_RECTANGLE, _meshIndex = 0, yaw = 0, pitch = 0, _startSize = -1, _endSize = -1) => {

  let particle = {
    x, 
    y, 
    z, 
    vx, 
    vy, 
    vz, 
    ttl, 
    _ttlMax,
    _baseColor, 
    _size, 
    gy: obeysGravity ? GRAVITY : 0, 
    _type,
    _color: 0, // Color.
    _meshIndex,
    yaw,
    pitch,
    _startSize,
    _endSize,
    _camera: 0,
  }

  particle._camera = particle;

  particles.push(particle);
};

// Manage particles.
let updateParticles = e => {
  for (let i = particles.length; i--;) {
    let p = particles[i];

    if ((p.ttl -= dt) <= 0) {
      particles.splice(i, 1);
      continue;
    }

    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.z += p.vz * dt;

    p.vy -= p.gy * dt;
   
    p._color = p._baseColor + toHex(p.ttl / p._ttlMax); // Set color and add alpha.

    if (p._startSize !== -1 && p._endSize !== -1) p._size = p._startSize + (p._endSize - p._startSize) * (1.0 - (p.ttl / p._ttlMax)); // Linearly interpolate between the start and end size based on life progress.

    if (p._type > TYPE_TRIANGLE) { // Particle drawn as a mesh.

      objectsToDraw.push(p);

      // Spawn smoke. Can go if pressed for space.
      if (p.y < 1 && p.y > 0) {
        newParticle(
          p.x - .5 + random(), p.y, p.z,
          0, random(), 0, 
          3, 3, 
          ['888', '666', '444', '222'][randomInt(0, 3)],
          0,
          0,TYPE_RECTANGLE,0,0,0,randomInt(2, 3), randomInt(20, 30),
        );
      }

    } else { // Particle drawn as triangle or rectangle (currently only rectangle is implemented).

      let screenP = projectPoint(p.x, p.y, p.z);
      if (screenP) {
        let size = p._size;
        addRect(screenP.x - size / 2, screenP.y - size / 2, size, size, p._color);
      }

    }
  }
};

// Create an explosion!
let createExplosion = (x, y, z, color = 'fff', addMesh = -1, pitch = 0, yaw = 0) => {

  // Spawn rect particles.
  for (let i = EXPLOSION_PARTICLES; i--;) {
    newParticle(
      x, y, z, 
      (random() - 0.5) * EXPLOSION_SPEED, random() * EXPLOSION_LIFT, (random() - 0.5) * EXPLOSION_SPEED, 
      random() * EXPLOSION_TTL, EXPLOSION_TTL, 
      color, 
      randomInt(4, 6), 
      1,
    );
  }

  // Spawn globe and "boom" mesh particles.
  for (let i = 2; i--;) {
    newParticle(
      x, y, z, 
      0, 0, 0,
      [EXPLOSION_TTL, EXPLOSION_TTL][i], EXPLOSION_TTL, 
      ['f80', 'ccc'][i], 
      1,
      0,
      TYPE_MESH, [EXPLOSION_MESH, GLOBE_MESH][i],
      random() * PI,
      random() * PI,
      [2.0, 0.2][i], // Start sizes.
      [0.5, 4][i],
    );
  }

  // Spawn mesh particle if required.
  if (addMesh > -1) {
    newParticle(
      x, 
      y, 
      z, 
      0,
      5,
      0,
      1.6, // Ttl.
      1.6, 
      color,
      1,
      1,
      TYPE_MESH,
      addMesh, // This has the mesh id.
      yaw,
      pitch,
      1,
      1,
    );
  }

};

//#endregion




//#region Draw Objects.

// Draw currently visible game objects.
let drawGameObjects = e => {

  for (let object of objectsToDraw) {

    let objectCamera = object._camera;
    let screenPoints = [];

    let pY = sin(objectCamera.yaw), pC = cos(objectCamera.yaw), pP = sin(objectCamera.pitch), cP = cos(objectCamera.pitch);

    let vertices = objectMeshes[object._meshIndex * 2];

    for (let i = 0; i < vertices.length;) {
      let x = vertices[i++], y = vertices[i++], z = vertices[i++];

      if (object._size) {
        let size = object._size;
        x *= size; y *= size; z *= size;
      }

      let rz = z * cP - y * pP;
      let ry = z * pP + y * cP;
      let rx = x * pC - rz * pY;
      rz = x * pY + rz * pC;

      let p = projectPoint(objectCamera.x + rx, objectCamera.y + ry, objectCamera.z + rz);
      screenPoints.push(p);
    }

    if (object._meshIndex === 18 && !generatingTerrain) { // Draw the sphereical terrain!

      let alpha = activeMenu === highscoresMenu || activeMenu === optionsMenu ? '6' : 'f'; // Need to darken the sphere when either of these menus are open.
      
      let latitudeBands = TOTAL_LATITUDE_BANDS;
      let longitudeBands = TOTAL_LATITUDE_BANDS;
      let localVertices = objectMeshes[object._meshIndex * 2];
      let equatorBand = TOTAL_LATITUDE_BANDS / 2;
      let terrainHalfHeight = MAP_SIZE / 2;
      let terrainStartBand = equatorBand - terrainHalfHeight;
      let terrainEndBand = equatorBand + terrainHalfHeight;

      for (let lat = 0; lat < latitudeBands; lat++) {

        for (let lon = 0; lon < longitudeBands; lon++) {
          
          let first = (lat * (longitudeBands + 1)) + lon;
          
          let v_idx = first * 3;
          let nx = localVertices[v_idx], ny = localVertices[v_idx + 1], nz = localVertices[v_idx + 2];
          let world_nz = nz * cP - ny * pP, world_ny = nz * pP + ny * cP;
          let world_nx = nx * pC - world_nz * pY; world_nz = nx * pY + world_nz * pC;
          let viewX = viewCamera.x - world_nx, viewY = viewCamera.y - world_ny, viewZ = viewCamera.z - world_nz;
          let dotProduct = world_nx * viewX + world_ny * viewY + world_nz * viewZ;

          if (dotProduct > 0) {
            
            let lineColor = '04c' + alpha;

            if (lat >= terrainStartBand && lat < terrainEndBand && lon < MAP_SIZE) lineColor = colors[lat - terrainStartBand][lon] + alpha;

            let second = first + longitudeBands + 1;
            let nextLon = first + 1;
            let p1 = screenPoints[first], p2 = screenPoints[nextLon], p3 = screenPoints[second];

            if (p1 && p2) addLine(p1.x, p1.y, p2.x, p2.y, lineColor);
            if (p1 && p3) addLine(p1.x, p1.y, p3.x, p3.y, lineColor);
          }
        }
      }

    } else { // Draw a normal mesh.

      let edges = objectMeshes[(object._meshIndex * 2) + 1];
      for (let i = 0; i < edges.length;) {
        let p1 = screenPoints[edges[i++]], p2 = screenPoints[edges[i++]];
        if (p1 && p2) addLine(p1.x, p1.y, p2.x, p2.y, object._color + 'f');
      }
    }
  }
};

//#endregion




// #region Spawn object

// Spawn a new object.
let spawnObject = (_type, tiles, fixedAltitude, fixedPosition, dontAddToGameObjects) => {
  // let [_meshIndex, _baseColor, _collisionRadius, _attackRange, _u1, _accuracy, _u2, _rateOfFire, _u3, _projSpeed, _u4, _moveSpeed, _u5, _turnSpeed, _u6, _altitude, _flies] = objectTemplates[_type];

  let [_meshIndex, _baseColor, _collisionRadius, _attackRange, atkRangeInc, _rateOfFire, rofInc, _projSpeed, projSpeedInc, _moveSpeed, moveSpeedInc, _turnSpeed, turnSpeedInc, _altitude, _flies] = objectTemplates[_type];
  // let [_meshIndex, _baseColor, _collisionRadius, _attackRange, _u1, _rateOfFire, _u2, _projSpeed, _u3, _moveSpeed, _u4, _turnSpeed, _u5, _altitude, _flies] = objectTemplates[_type];
  
  let _camera = fixedPosition ? fixedPosition : getPositionInTileFrom(tiles, _altitude, fixedAltitude);


  // We only apply scaling to the main enemy types (Turi up to Prowler, types 0-5).
  if (_type < 6) { 

    // Determine the effective level for scaling, capping at 10 levels of increase.
    // Since `level` starts at 1 for the first playthrough, `level - 1` gives 0, resulting in base stats.
    let effectiveLevel = min(level - 1, 10);
    
    // Apply the scaling to each stat by adding the base value to the calculated increment.
    _attackRange += atkRangeInc * effectiveLevel;
    _rateOfFire  += rofInc * effectiveLevel;
    _projSpeed   += projSpeedInc * effectiveLevel;
    _moveSpeed   += moveSpeedInc * effectiveLevel;
    _turnSpeed   += turnSpeedInc * effectiveLevel;
  }

  let object = {
    _type, 
    _camera,
    _meshIndex,
    _baseColor,
    _color: _baseColor + 'f', 

    _flies,

    _collisionRadius, 
    _attackRange, 
    // _accuracy, 

    _rateOfFire, 
    _reloaded: 0,

    _projSpeed, 
    _moveSpeed, 
    _baseMoveSpeed: _moveSpeed,
    _anchorX: _camera.x,
    _anchorZ: _camera.z,
    _altitude, 
    _turnSpeed, 
    _baseTurnSpeed: 0,
    _wayPoint: newWayPoint(),
    vx: 0,
    vy: 0,
    vz: 0,
    _fakeYaw: random() * PI2,
    _distanceToPlayer: 0,

    _jumping: 0, // Pyra.
    _notRescuedOrKilled: 1, // Pyra.

    _enabled: 0,

    _orbitAngle: 0,
    _orbitDistance: 0,
    _orbitSpeed: 0,

    _counter: random(),

    _flashing: 0,
    _flashCounter: random(),

    _ground: _camera.y, // Ground level when spawned.

    _cargoType: 0,

    _painted: 0,
    _target: 0,

  };

  if (!dontAddToGameObjects) gameObjects.push(object);

  return object;
};

// #endregion






// Start a new game.
let startNewGame = e => {
  hasHornets = 0
  hasLaser = 0;
  enableWingMen(0);

  score = 0;
  awardPoints(0);

  lives = 9;
  updateLives();

  playerDied = 0;

  level = 0;
  nextLevel();
};


// Advance the level counter and generate a new level.
let nextLevel = e => {
  programState = STATE_NONE; // Main loop won't do anything while the program is in this state.
  generateTerrain();
};

let level; // We will use this later as a difficulty scalar.

let levelData = [
  [ // 0.
    5, // TYPE_TURI.
    6, // TYPE_BOTA.
    4, // TYPE_DART.
    6, // TYPE_TRIA.
    0, // TYPE_PROWLER.
  ],

  [ // 1.
    10, // TYPE_TURI.
    9, // TYPE_BOTA.
    8, // TYPE_DART.
    12, // TYPE_TRIA.
    3, // TYPE_PROWLER.
  ],

  [ // 2.
    15, // TYPE_TURI.
    12, // TYPE_BOTA.
    12, // TYPE_DART.
    16, // TYPE_TRIA.
    5, // TYPE_PROWLER.
  ],

  [ // 3.
    20, // TYPE_TURI.
    15, // TYPE_BOTA.
    16, // TYPE_DART.
    20, // TYPE_TRIA.
    9, // TYPE_PROWLER.
  ],

  // 
  // From here on everything is scaled.
  // 

];

// Terrain has been generated, populate the game world.
let terrainGenerated = e => {

  let pyraCount = clamp(level * .5 + 2, 0, 6) | 0; // Increase 1 per 2 levels, capped at 5.

  // Declare variables for enemy counts.
  let turiCount, botaCount, dartCount, triaCount, prowlerCount;

  // For the first 4 levels (0-3), use the predefined data directly.
  if (level < 4) {
    [turiCount, botaCount, dartCount, triaCount, prowlerCount] = levelData[level];
  
  } else { // For level 4 (which is the 5th level) and beyond, use scaling.
    
    // Get the base numbers from the last dataset.
    [turiCount, botaCount, dartCount, triaCount, prowlerCount] = levelData[3];

    // Spawning object count scaling.
    let startLevel = 4;   // Scaling starts at level index 4 (the 5th level)
    let endLevel = 14;    // Scaling ends at level index 14 (the 15th level)
    let scalingRange = endLevel - startLevel; // This is 10
    
    // Cap the effective level at the end of the scaling range.
    let effectiveLevel = min(level, endLevel);

    // Calculate progress as a value from 0.0 to 1.0
    let progress = (effectiveLevel - startLevel) / scalingRange;

    // The multiplier scales from 1.0 (at level 5) to 2.5 (at level 15).
    // The total multiplier range is 1.5 (from 2.5 - 1.0).
    let magicNumber = 1.0 + (1.5 * progress);

    // Apply the multiplier to all base counts and round to the nearest whole number.
    turiCount = (turiCount * magicNumber) | 0;
    botaCount = (botaCount * magicNumber) | 0;
    dartCount = (dartCount * magicNumber) | 0;
    triaCount = (triaCount * magicNumber) | 0;
    prowlerCount = (prowlerCount * magicNumber) | 0;
  }

  level++; 

  //beginclip
  // Debug difficulty scaling;

  bigString += `\nlevel ${level} - scaling factor:${min(level - 1, 10)} object count:${turiCount + botaCount + dartCount + triaCount + prowlerCount} objects: ${turiCount} TURI, ${botaCount} BOTA, ${dartCount} DART, ${triaCount} TRIA, ${prowlerCount} PROWLER\n`;

  log(`\nlevel ${level} - scaling factor:${min(level - 1, 10)} object count:${turiCount + botaCount + dartCount + triaCount + prowlerCount} objects: ${turiCount} TURI, ${botaCount} BOTA, ${dartCount} DART, ${triaCount} TRIA, ${prowlerCount} PROWLER, `);

  for (let i = 0; i < TYPE_PYRA; i++) {
    let [, , , _attackRange, atkRangeInc, _rateOfFire, rofInc, _projSpeed, projSpeedInc, _moveSpeed, moveSpeedInc, _turnSpeed, turnSpeedInc, , ] = objectTemplates[i];

    let effectiveLevel = min(level - 1, 10);
    _attackRange += atkRangeInc * effectiveLevel;
    _rateOfFire  += rofInc * effectiveLevel;
    _projSpeed   += projSpeedInc * effectiveLevel;
    _moveSpeed   += moveSpeedInc * effectiveLevel;
    _turnSpeed   += turnSpeedInc * effectiveLevel;
    log(`${enemyTypeStrings[i]} range:${_attackRange.toFixed(2)} rof:${_rateOfFire.toFixed(2)} proj:${_projSpeed.toFixed(2)} move:${_moveSpeed.toFixed(2)} turn:${_turnSpeed.toFixed(2)} `);
    bigString += `${enemyTypeStrings[i]} range:${_attackRange.toFixed(2)} rof:${_rateOfFire.toFixed(2)} proj:${_projSpeed.toFixed(2)} move:${_moveSpeed.toFixed(2)} turn:${_turnSpeed.toFixed(2)}\n`;
  }
  //endclip


  playerCamera = newCamera(MAP_CENTER, FLIGHT_HEIGHT, MAP_CENTER, 0, 0);
  playerShip._camera = playerCamera;

  for (let hornet of hornets) hornet._target = 0; // Just incase.

  hornetReloaded = 0;

  laserTarget = 0;
  laser._reloaded = 0;
  
  // Reset player flags
  playerBlastingOff = 0;
  playerLeaving = 0;
  playerLanding = 0;
  playerDustingOff = 0;
  playerBoardingOrLoading = 0;
  playerGrounded = 0;
  passengerCount = 0;
  boardingPassenger = 0;
  cargoBeingLoaded = 0;

  liveCats = pyraCount;
  catsToRescue = pyraCount;
  catsRescued = 0;
  allPyra = [];
  pyraIndicator = 0;

  bombs = [];
  bullets = [];

  gameObjects = []; // Extinct previous population.

  if (trainingMode) { // Initialize training mode.

    trainingPhase = 0;

    gameMenu[9]._visible = 1;

    liveCats = 0;
    catsToRescue = 9;

  } else { // Not training.

    for (let i = turiCount; i--;) spawnObject(TYPE_TURI, grassTiles);

    for (let i = botaCount; i--;) spawnObject(TYPE_BOTA, waterTiles);

    for (let i = dartCount; i--;) spawnObject(TYPE_DART, landTiles, 1);

    for (let i = triaCount; i--;) spawnObject(TYPE_TRIA, landTiles, 1);

    for (let i = prowlerCount; i--;) spawnObject(TYPE_PROWLER, landTiles, 1);

    enemiesRemaining = gameObjects.length; // Actual number of enemies remaining.

    for (let i = pyraCount; i--;) allPyra.push(spawnObject(TYPE_PYRA, grassTiles)); // Pyra are added to the list but not counted as enemies.
  }

  updateCatsReadout();

  activeMenu = gameMenu;

  programState = STATE_GAMEON;

  //beginclip
  debugControls.style.display = 'block';
  //endclip

  playerCanBeDamaged = 0;
  playerEntering = 1;
  gpc = 1;
  playerVisible = 0;
  playerOnRails = 1;

  // Spawn "terminator arrives" effect.
  for (let i = 5; i--;) {
    newParticle(
      playerCamera.x, playerCamera.y, playerCamera.z,
      0, 0, 0,
      1, 1,
      cosmicNebulaColors[randomInt(0, 4)], // Cosmic Nebula palette.
      1,
      0,
      TYPE_MESH, GLOBE_MESH,
      random() * PI2, random() * PI2,
      5 + random(), random(),
    );
  }

  // Spawn mesh particle.
  newParticle(
    playerCamera.x, playerCamera.y, playerCamera.z,
    0, 0, 0,
    2, 3,
    '4cf',
    1,
    0,
    TYPE_MESH, TYPE_PLAYER,
    0, 0,
    0, 1,
  );

  fx_play(FX_WARP_IN);

};

// Award the given number of points to the player.
let awardPoints = points => {
  if (!trainingMode) {
    score += points;
    gameMenu[SCORE_LABEL]._text = '' + score;
  }
};

let updateLives = e => gameMenu[LIVES_LABEL]._text = '@'.repeat(lives);

let updateCatsReadout = e => gameMenu[CATS_LABEL]._text = '@' + catsRescued + '/' + liveCats;

// The given object will turn towards the player.
let targetPlayer = (object) => {
  let objectCamera = object._camera;
        
  let dx = playerCamera.x - objectCamera.x, dz = playerCamera.z - objectCamera.z;

  let targetYaw = atan2(-dx, dz);
  
  // Find the shortest way to turn.
  let diff = targetYaw - objectCamera.yaw;
  if (diff > PI) diff -= PI2;
  if (diff < -PI) diff += PI2;

  // let diff = (((targetYaw - objectCamera.yaw) + Math.PI) % PI2 + PI2) % PI2 - Math.PI; <-- Actually larger zip file after minification!

  // Turn by a limited amount per frame.
  let turnAmount = object._turnSpeed * dt;
  objectCamera.yaw += clamp(diff, -turnAmount, turnAmount);

  return abs(diff) < .001; // Return true if facing player.
};

// Damage the player by the given amount.
let damagePlayer = (damage = 1) => {
  
  if (playerCanBeDamaged) { // Required so the player doesn;t die multiple times whilst the game over animation sequence is playing.

    lives -= damage;

    if (lives > -1) updateLives();

    if (lives < 0) {

      playerOnRails = 1; // Player has no control over their ship.
      playerDied = 1;

      playerCanBeDamaged = 0;

      //beginclip
      debugControls.style.display = 'none';
      //endclip

    } else {

    newParticle(
      playerCamera.x, playerCamera.y, playerCamera.z, // Position.
      0, 0, 0, // Velocity..
      .5, .5, // Ttl
      'f00', 
      1, // Size.
      0, // Obeys gravity.
      TYPE_MESH, KABOOM_MESH, // Mesh
      random() * PI2, random() * PI2, .2, 5, // Start/end sizes.
    );

      fx_play(FX_PLAYER_HIT);

    }
  }
};

// Turn the given object towards the target camera.
let doTheTurn = (object, targetCam, dt) => {
  let targetYaw = atan2(-(targetCam.x - object._camera.x), targetCam.z - object._camera.z);
  let diff = targetYaw - object._fakeYaw;
  if (diff > PI) diff -= PI2;
  if (diff < -PI) diff += PI2;
  let turnAmount = object._turnSpeed * dt;
  return clamp(diff, -turnAmount, turnAmount);
};

// Spawn a new bullet.
let newBullet = (_type, x, y, z, vx = 0, vy = 0, vz = 0) => {
  bullets.push({
    _type,
    x,
    y,
    z,
    vx,
    vy,
    vz,
  });
};

// Set the width of the loading/borading bar.
let updateBoardingBar = w => gameMenu[BOARDING_BAR].w = w;

// Show or hide the loading/boarding bar according to the given state.
let showBoardingBar = state => {
  gameMenu[BOARDING_BAR]._visible = state;
  gameMenu[BOARDING_FRAME]._visible = state;
};

// Find all visible objects in the given range of the given cameras position.
let GetObjectsInRadius = (camera, radius) => {

  let objectX = camera.x;
  let objectZ = camera.z;

  let objectsInRadius = [];
  
  for (let i = visibleObjects.length; i--;) {

    let other = visibleObjects[i];
    if (!other._flies) { // Only non flying objects are affected by bombs.
      let dx = abs(objectX - other._camera.x);
      let dz = abs(objectZ - other._camera.z);
      if (dx < radius && dz < radius) objectsInRadius.push(other); // Object is within radius.
    }
  }
  return objectsInRadius.length ? objectsInRadius : 0;
};

//Initiate boarding or loading if there is a passenger or cargo nearby.
let boardOrLoad = e => {

  let inRange = GetObjectsInRadius(playerCamera, BOARDING_AND_LOADING_RADIUS);

  if (inRange) {

    for (let i = inRange.length; i--;) {

      let object = inRange[i];

      if (object._type === TYPE_PYRA) { // Begin cargo loading.

        if (object._notRescuedOrKilled) {

          boardingPassenger = object;

          showBoardingBar(1);

          boardingOrLoadingCounter = 0;
          playerBoardingOrLoading = 1;
        }

      } else if (object._type === TYPE_CARGO) { // Begin cargo loading.

        cargoBeingLoaded = object;

        showBoardingBar(1);

        boardingOrLoadingCounter = 0;
        playerBoardingOrLoading = 1;
      }

      boardingLoadingSoundCounter = .1;
      fx_play(FX_LOAD_BOARD);
    }
  }
};

// #region Powerups

// Check if any shield plate was able to block an attack.
let checkShields = e => {
  for (let shield of shields) {

    if (shield._enabled) {

      shield._enabled = 0;

      fx_play(FX_XEVIOUS);

      createExplosion(shield._camera.x, shield._camera.y, shield._camera.z, shield._baseColor);

      return 1; // Player will take NO damage.
    }
  }
  return 0; // Player will take damage.
};

// Enable/disable shields according to the given state.
let enableShields = state => {
  for (let i = 5; i--;) {
    let shield = shields[i];
    shield._enabled = state;
    shield._orbitAngle = PI2 / 5 * i; // Space them evenly around the player.
  }
};

// Disable the given wingman for a short period of time.
let disableWingman = wingman => {

  wingman._enabled = 0;

  createExplosion(
    wingman._camera.x, wingman._camera.y, wingman._camera.z, 
    wingman._baseColor,
    wingman._type,
    wingman._camera.pitch, wingman._camera.yaw,
  );

  fx_play(FX_WINGMAN_HIT);
};

let enableWingMen = state => {
  for (let wingman of wingMen) wingman._enabled = state;
};

// Destroy laser.
let destroyLaser = e => {
  hasLaser = 0;
  createExplosion(
    laser._camera.x, laser._camera.y, laser._camera.z, 
    laser._baseColor, 
    laser._type, 
    laser._camera.pitch, laser._camera.yaw
  );

  fx_play(FX_KILL_ENEMY);
};



// let CHANCE_TO_SPAWN_CARGO   = .6;

let CARGO_TYPE_POINTS       = 0;
let CARGO_TYPE_LIFE         = 1;
let CARGO_TYPE_SHIELDS      = 2;
let CARGO_TYPE_WINGMEN      = 3;
let CARGO_TYPE_HORNETS      = 4;
let CARGO_TYPE_AIRSTRIKE    = 5;
let CARGO_TYPE_LASER        = 6;

// Spawn random cargo at the given object's location.
let spawnCargo = (object, setCargo = -1) => {

  if (trainingMode && setCargo < 0) return; // We only want to spawn set cargo when training.

  let objectCamera = object._camera

  // CHANCE_TO_SPAWN_CARGO = 1;
  // CHANCE_TO_SPAWN_CARGO = setCargo > -1 ? 1 : .6;

  let chance = setCargo > -1 ? 1 : .6;

  if (random() < chance) { // Spawn random cargo.

    let n = random();

    //beginclip
     let v = n;
    //endclip

    if (n > 95) {
      n = CARGO_TYPE_LASER;

    } else if (n > .9) {
      n = CARGO_TYPE_HORNETS;

    } else if (n > .85) {
      n = CARGO_TYPE_WINGMEN;

    } else if (n > .75) {
      n = CARGO_TYPE_SHIELDS

    } else if (n > .3) {
      n = CARGO_TYPE_LIFE;

    } else {
      n = CARGO_TYPE_POINTS;

    }

    if (setCargo > -1) n = setCargo; // We want this cargo.

    let cargo= spawnObject(TYPE_CARGO, 0, 0, newCamera(objectCamera.x, objectCamera.y, objectCamera.z, 0, 0));
    cargo._cargoType = n;
    cargo._size = .5;
    let color = [COLOR_YELLOW, 'aaaf', '0f0f', '0fff', COLOR_ORANGE, '48ff'][n];
    cargo._baseColor = color;
    cargo._color = color;

    //beginclip
    log(`spawnCargo() random:${v.toFixed(3)} ${['CARGO_TYPE_POINTS', 'CARGO_TYPE_LIFE', 'CARGO_TYPE_SHIELDS', 'CARGO_TYPE_WINGMEN', 'CARGO_TYPE_HORNETS', 'CARGO_TYPE_LASER'][n]}`);
    //endclip

    return cargo;
  }
};

// #endregion

let notify = (text, sticky = 0, duration = 2, beep = 1) => {

  if (!text) { // If text is empty, hide the notification
    notifying = 0;
    return;

  } else {
   
    gameMenu[8]._text = text;
    gameMenu[8].x = centerText(text);
    
    if (beep) fx_play(FX_XEVIOUS);

    notifyCounter = sticky ? 99: duration;
  }

  notifying = 1;

  gameMenu[6]._visible = notifying; // 0 or 1;
  gameMenu[7]._visible = notifying;
  gameMenu[8]._visible = notifying;
};

// Cancel the current boarding or loading sequence.
let cancelBoardingOrLoading = e => {
  playerBoardingOrLoading = 0;
  boardingPassenger = 0; // No passenger.
  cargoBeingLoaded = 0; // No cargo.
  showBoardingBar(0);
};


let OBJECTIVE_PRESS_KEY       = 0;
let OBJECTIVE_PRESS_BUTTON    = 1;
let OBJECTIVE_KILL_ENEMY      = 2;
let OBJECTIVE_INFORMATION     = 3;
let OBJECTIVE_PICKUP          = 4;
let OBJECTIVE_GOTO            = 5;

let LEFT_MOUSE_BUTTON         = 0;
let RIGHT_MOUSE_BUTTON        = 1;

let objectiveType;
let objectiveKey; // Multi purpose (key code, object type, duration).

let strings = ['LAND CLOSE CARGO TO BEGIN LOADING', 'NAVIGATE TO NEXT CARGO'];

let objectiveData = [
  [OBJECTIVE_INFORMATION,   2,                        'TRAINING BEGINS'],

  [OBJECTIVE_PRESS_KEY,     THRUST_FORWARD_CONTROL,   'TO MOVE FORWARDS'],
  [OBJECTIVE_PRESS_KEY,     THRUST_REVERSE_CONTROL,   'TO MOVE BACKWARDS'],
  [OBJECTIVE_PRESS_KEY,     STRAFE_LEFT_CONTROL,      'TO MOVE LEFT'],
  [OBJECTIVE_PRESS_KEY,     STRAFE_RIGHT_CONTROL,     'TO MOVE RIGHT'],

  [OBJECTIVE_INFORMATION,   3,                        'AIM WITH MOUSE'],

  [OBJECTIVE_PRESS_BUTTON,  LEFT_MOUSE_BUTTON,        'SHOOT'],
  [OBJECTIVE_PRESS_BUTTON,  RIGHT_MOUSE_BUTTON,       'BOMB'],

  [OBJECTIVE_PRESS_KEY,     LAND_DUSTOFF_CONTROL,     'TO LAND'],
  [OBJECTIVE_INFORMATION,   1,                        ''],
  [OBJECTIVE_PRESS_KEY,     LAND_DUSTOFF_CONTROL,     'TO DUSTOFF'],

  [OBJECTIVE_INFORMATION,   2,                        ''],
  
  [OBJECTIVE_INFORMATION,   3,                        'LIBERATE PYRA AND DO NOT BOMB THEM'],

  [OBJECTIVE_GOTO,          TYPE_PYRA,                'FOLLOW THE FLASHING ARROW'],
  [OBJECTIVE_PICKUP,        ,                         'LAND CLOSE TO PYRA'],
  [OBJECTIVE_INFORMATION,   1,                        'PYRA LIBERATED'],
  [OBJECTIVE_PRESS_KEY,     LAND_DUSTOFF_CONTROL,     'TO DUSTOFF'],

  [OBJECTIVE_GOTO,          TYPE_BOTA,                'NAVIGATE TO BOTA'],
  [OBJECTIVE_KILL_ENEMY,    ,                         'BOMB BOTA'],
  [OBJECTIVE_INFORMATION,   2,                        'GOT IT'],

  [OBJECTIVE_GOTO,          TYPE_TURI,                'NAVIGATE TO TURI'],
  [OBJECTIVE_KILL_ENEMY,    ,                         'BOMB TURI'],
  [OBJECTIVE_INFORMATION,   2,                        'GOOD'],

  [OBJECTIVE_GOTO,          TYPE_TRIA,                'NAVIGATE TO TRIA'],
  [OBJECTIVE_KILL_ENEMY,    ,                         'SHOOT TRIA'],
  [OBJECTIVE_INFORMATION,   2,                        'WELL DONE'],

  [OBJECTIVE_GOTO,          TYPE_DART,                'NAVIGATE TO DART'],
  [OBJECTIVE_KILL_ENEMY,    ,                         'SHOOT DART'],
  [OBJECTIVE_INFORMATION,   2,                        'MASTERFUL'],

  [OBJECTIVE_GOTO,          TYPE_PROWLER,             'NAVIGATE TO PROWLER'],
  [OBJECTIVE_KILL_ENEMY,    ,                         'SHOOT PROWLER'],
  [OBJECTIVE_INFORMATION,   2,                        'EXCELLENT'],

  [OBJECTIVE_INFORMATION,   3,                        'BOTA AND TURI CAN DROP CARGO ON DEATH'],

  [OBJECTIVE_GOTO,          -CARGO_TYPE_WINGMEN,      strings[1]],
  [OBJECTIVE_PICKUP,        ,                         strings[0]],
  [OBJECTIVE_INFORMATION,   2,                        ''],
  [OBJECTIVE_INFORMATION,   3,                        'WINGMEN INCREASE YOUR SHOOTING ABILITY'],

  [OBJECTIVE_GOTO,          -CARGO_TYPE_HORNETS,      strings[1]],
  [OBJECTIVE_PICKUP,        ,                         strings[0]],
  [OBJECTIVE_INFORMATION,   2,                        ''],
  [OBJECTIVE_INFORMATION,   3,                        'HORNETS AUTO TARGET GROUND ENEMIES'],
  [OBJECTIVE_GOTO,          TYPE_TURI,                'NAVIGATE TO TURI'],
  [OBJECTIVE_KILL_ENEMY,    ,                         'MOVE INTO HORNET RANGE'],
  [OBJECTIVE_INFORMATION,   2,                        'KABOOM'],

  [OBJECTIVE_GOTO,          -CARGO_TYPE_LASER,        strings[1]],
  [OBJECTIVE_PICKUP,        ,                         strings[0]],
  [OBJECTIVE_INFORMATION,   2,                        ''],
  [OBJECTIVE_INFORMATION,   3,                        'LASERS AUTO TARGET FLYING ENEMIES'],
  [OBJECTIVE_GOTO,          TYPE_TRIA,                'NAVIGATE TO TRIA'],
  [OBJECTIVE_KILL_ENEMY,    ,                         'MOVE INTO LASER RANGE'],
  [OBJECTIVE_INFORMATION,   2,                        'ZAP'],

  [OBJECTIVE_INFORMATION,   2,                        ''],
  // [OBJECTIVE_INFORMATION,   2,                        'THERE ARE OTHER TYPES OF CARGO TO DISCOVER'],
  // [OBJECTIVE_INFORMATION,   1,                        ''],
  // [OBJECTIVE_INFORMATION,   2,                        'TRAINING COMPLETE'],
];

// A new helper function to ensure a spawned object is a safe distance from the player.
let getPositionAwayFromPlayer = (tiles, altitude, fixedAltitude) => {
  let positionCamera;
  let distanceSq;
  // let MIN_DISTANCE = VIEW_CULL_RANGE * 2; // "2 screens" away is a good, safe distance.
  // let MIN_DISTANCE_SQ = MIN_DISTANCE * MIN_DISTANCE;
  // let safetyCounter = 50; // A fallback to prevent the game from freezing.

  do {
    // IMPORTANT: getPositionInTileFrom modifies the array it's given by using splice().
    // We must pass it a copy, otherwise our loop will quickly destroy the original tiles array.
    // let tempTiles = [...tiles];
    // positionCamera = getPositionInTileFrom(tempTiles, altitude, fixedAltitude);

    positionCamera = getPositionInTileFrom(tiles, altitude, fixedAltitude);

    // If we somehow run out of tiles, break and return what we have.
    // if (!positionCamera) break;

    let dx = playerCamera.x - positionCamera.x;
    let dz = playerCamera.z - positionCamera.z;
    distanceSq = dx * dx + dz * dz;

  // } while (distanceSq < MIN_DISTANCE_SQ && --safetyCounter > 0);
  } while (distanceSq < 2e3);
  // } while (distanceSq < MIN_DISTANCE_SQ);

  return positionCamera;
};

let startNextObjectiveDelay = e => {
  waitingForNextObjective = 1;
  nextObjectiveTimer = .6;
  notify(0, 0); // Hide the current prompt immediately.
};

// Set the next training objective.
let setNextTrainingObjective = e => {

  if (trainingPhase === objectiveData.length) {
    
    notify('TRAINING COMPLETE', 1);
    // notify('GOOD LUCK OUT THERE PILOT', 1);
    trainingMode = 0;
    return;
  }

  let [type, key, text] = objectiveData[trainingPhase];

  if (type < OBJECTIVE_PRESS_BUTTON ) { // Press key.

    key = OPTIONS.c[key].k;
    notify('PRESS ' + key.toUpperCase() + ' ' + text, 1);

  } else if (type < OBJECTIVE_KILL_ENEMY ) { // Press button.

    notify('PRESS ' + ['LEFT', 'RIGHT'][key] + ' MOUSE BUTTON TO ' + text, 1);

  } else if (type < OBJECTIVE_INFORMATION ) { // Kill enemy.

    notify(text, 1);

  } else if (type < OBJECTIVE_PICKUP ) { // Information.

    notify(text, 0, 3);

  } else if (type < OBJECTIVE_GOTO ) { // Pickup.

    notify(text, 1);

  // } else { // Goto.

  //   let tiles = key === TYPE_BOTA ? waterTiles : grassTiles;

  //   if (key < 0) {
  //     trainingTarget = spawnCargo(newTempObject(getPositionInTileFrom(tiles, 0, 0)), -key);

  //   } else {
  //     trainingTarget = spawnObject(key, tiles);
  //   }

  //   trainingTarget._enabled = 1;

  //   notify(text, 1);

  // }
  } else { // Goto.

    let tiles = key === TYPE_BOTA ? waterTiles : grassTiles;

    if (key < 0) { // Spawning a specific cargo type.
      // let cargoType = -key;
      // let position = getPositionAwayFromPlayer(tiles, 0, 0); // Cargo is on the ground.
      // trainingTarget = spawnCargo(newTempObject(position), cargoType);

      trainingTarget = spawnCargo(newTempObject(getPositionAwayFromPlayer(tiles, 0, 0)), -key);

    } else { // Spawning a specific enemy type.
      // We get the enemy's altitude and flying status from its template to pass to our new function.
      // let altitude = objectTemplates[key][13];
      // let flies = objectTemplates[key][14];
      // let position = getPositionAwayFromPlayer(tiles, altitude, flies);

      
      
      // We now call spawnObject with a fixed position, so we pass '0' for the tiles array.
      trainingTarget = spawnObject(key, 0, 0, getPositionAwayFromPlayer(tiles, objectTemplates[key][13], objectTemplates[key][14]));
    }

    trainingTarget._enabled = 1;

    notify(text, 1);
  }
  objectiveType = type;
  objectiveKey = key;

  //beginclip
  log(`phase:${trainingPhase} type:${['OBJECTIVE_PRESS_KEY', 'OBJECTIVE_PRESS_BUTTON', 'OBJECTIVE_KILL_ENEMY', 'OBJECTIVE_INFORMATION', 'OBJECTIVE_PICKUP', 'OJECTIVE_GOTO'][type]} key:${key}`);
  //endclip

  trainingPhase++;
};

//#endregion



// Spawn dust-off thrust and ring effect, with sound played also.
let spawnDustOffEffects = e => {
  // Spawn rect particles.
  for (let i = EXPLOSION_PARTICLES; i--;) {
    newParticle(
      playerCamera.x, playerCamera.y, playerCamera.z, 
      (random() - 0.5) * 3, 0, (random() - 0.5) * 3, 
      random() * EXPLOSION_TTL, EXPLOSION_TTL, 
      'ca7',
      randomInt(1, 4), 
      0, 
    );
  }

  // Spawn mesh particle.
  newParticle(
    playerCamera.x, playerCamera.y, playerCamera.z, 
    0, 0, 0, 
    2.5, objectstodraw =2.5, 
    '889', 
    1, 
    0, 
    TYPE_MESH, RING_MESH, 
    playerCamera.yaw, 0, 
    .1, 9, 
  );

  fx_play(FX_THRUST);
};



let checkLevelComplete = wasKilled => {
if (liveCats && catsRescued === liveCats) {

  let reward = catsRescued * 1000;
  awardPoints(reward);
  notify('PYRA X 1000 BONUS');

  playerOnRails = 1;
  playerBlastingOff = 1;
  spawnDustOffEffects();
  fx_play(FX_LAUNCH);

} else if (!wasKilled) {
  notify('PYRA LIBERATED', 0, 2, 0);
}
};


// Main game loop.
mainGameLoop = time => {
  dt = (time - lastTime) / 1e3;
  lastTime = time;

  //beginclip
  frameCount++;
  fpsTime += dt;

  playerCanBeDamaged = !godMode;
  //endclip

  requestAnimationFrame(mainGameLoop);

  if (!programState) return;


  clear();

  objectsToDraw = [];

  if (programState === STATE_GAMEON) {

    // #region Init Landing/dust-off.

    // 
    // Initiate landing or dust-off when 'E' key is pressed, so long as the player is not currently doing either.
    // 

    if (keys[OPTIONS.c[LAND_DUSTOFF_CONTROL].k] && !playerLanding && !playerDustingOff && !playerDied) { // Player wants to land or dust-off.

      if (playerGrounded) { // The player is on the ground, so they are wanting to dust-off.

        if (playerBoardingOrLoading) cancelBoardingOrLoading(); // Cancel any boarding or loading.

        // Initiate dust-off.
        playerCamera.vy = FLIGHT_HEIGHT - playerDestHeight;
        playerDestHeight = FLIGHT_HEIGHT;
        playerGrounded = 0;
        playerLanding = 0;
        playerDustingOff = 1;
        // log('player dusting off');

        spawnDustOffEffects();

      } else { // The player is in the air, so they want to land.
        playerDestHeight = map[playerCamera.z | 0][playerCamera.x | 0];
        playerCamera.vy = (-(FLIGHT_HEIGHT - playerDestHeight)) * 2;
        playerLanding = 1;
        // log('player landing');
      }

      playerOnRails = 1; // Player cannot shoot bullets, drop bombs, or thrust.
    }

    // #endregion




    // #region Player movement

    if (!playerDied) { // Process normal player movement.

      if (keys[OPTIONS.c[THRUST_FORWARD_CONTROL].k] && !playerOnRails) { // Forward thrust.
        // if (lastMovementDir != DIR_FORWARD && !keyHeld) {lastMovementDir = DIR_FORWARD; fx_play(FX_THRUST); keyHeld = 1;}
        accelerationTimer = clamp(accelerationTimer + dt, 0, accelerationDuration);
        currentSpeed = easeOutCubic(accelerationTimer / accelerationDuration) * PLAYER_HORIZONTAL_SPEED;

      } else if (keys[OPTIONS.c[THRUST_REVERSE_CONTROL].k] && !playerOnRails) { // Reverse thrust.
        // if (lastMovementDir != DIR_BACKWARD && !keyHeld) {lastMovementDir = DIR_BACKWARD; fx_play(FX_THRUST); keyHeld = 1;}
        accelerationTimer = clamp(accelerationTimer + dt, 0, accelerationDuration);
        currentSpeed = -easeOutCubic(accelerationTimer / accelerationDuration) * PLAYER_HORIZONTAL_SPEED;

      } else { // Decellerating.
        accelerationTimer = 0;
        currentSpeed *= decelerationFactor;
        if (abs(currentSpeed) < 0.01) currentSpeed = 0;
      }

      if (keys[OPTIONS.c[STRAFE_RIGHT_CONTROL].k] && !playerOnRails) { // Right thrust.
        // if (lastMovementDir != DIR_RIGHT && !keyHeld) {lastMovementDir = DIR_RIGHT; fx_play(FX_THRUST); keyHeld = 1;}
        strafeAccelerationTimer = clamp(strafeAccelerationTimer + dt, 0, accelerationDuration);
        strafeSpeed = easeOutCubic(strafeAccelerationTimer / accelerationDuration) * PLAYER_STRAFE_SPEED;
      
      } else if (keys[OPTIONS.c[STRAFE_LEFT_CONTROL].k] && !playerOnRails) { // Left thrust.
        // if (lastMovementDir != DIR_LEFT && !keyHeld) {lastMovementDir = DIR_LEFT; fx_play(FX_THRUST); keyHeld = 1;}
        strafeAccelerationTimer = clamp(strafeAccelerationTimer + dt, 0, accelerationDuration);
        strafeSpeed = -easeOutCubic(strafeAccelerationTimer / accelerationDuration) * PLAYER_STRAFE_SPEED;
      
      } else { // Decelerating strafe.
        strafeAccelerationTimer = 0;
        strafeSpeed *= decelerationFactor;
        if (abs(strafeSpeed) < 0.01) strafeSpeed = 0;
      }

    } else { // The player is currently dead, and the "crash and burn" movie sequence is playing.

      if (playerVisible) { // Still visible, so keep falling.

        if ((playerCamera.y -= 5 * dt) <= 0) { // The player has crashed into the terrain.

          playerCamera.y = 0;
          
          enableShields(0);

          createExplosion(
            playerCamera.x - .5 + random(), playerCamera.y - .5 + random(), playerCamera.z - .5 + random(), 
            playerShip._baseColor
          );

          // Soawn mesh particle.
          newParticle(
            playerCamera.x, playerCamera.y, playerCamera.z,
            0, 5, 0, 
            2, 2,
            playerShip._baseColor,
            0,
            1,
            TYPE_MESH, TYPE_PLAYER, playerCamera.yaw,0,
          );

          // Destroy wingmen.
          for (let wingman of wingMen) {
            if (wingman._enabled) {
              newParticle(
                wingman._camera.x, wingman._camera.y, wingman._camera.z,
                0, 5, 0, 
                3, 3,
                wingman._baseColor,
                0,
                1,
                TYPE_MESH, TYPE_WINGMAN, wingman._camera.yaw, 0,
              );
            }
          }

          // Destroy hornets.
          if (hasHornets) {
            hasHornets = 0;
            for (let hornet of hornets) {
              newParticle(
                hornet._camera.x, hornet._camera.y, hornet._camera.z,
                0, randomInt(4, 7), 0, 
                4, 4,
                hornet._baseColor,
                0,
                1,
                TYPE_MESH, TYPE_HORNET, hornet._camera.yaw,0,
              );
            }
          }

          destroyLaser();

          deformTerrain(playerCamera.x, playerCamera.z);

          currentSpeed = 0;
          strafeSpeed = 0;

          playerVisible = 0;

          // 
          // The player is dead!!!
          // 

          D.exitPointerLock();

          gameOverAnimTimer = 0;

          // 
          // Check for new high score.
          // 

          let scores = OPTIONS.s;
          scores.push(newScore(score, '')); // Add the new score.
          scores.sort((a, b) => b.s - a.s); // Sort in high to low order.
          scores.length = 5; // Truncate lowest.

          for (let i = 5; i--;) { // Process all 5 scores.

            if (scores[i].n === '') { // The new score is good.

              // gotNewHigh = 1;

              OPTIONS.s = scores;

              gameOverMenu[4]._visible = 0;
             
              gameOverMenu[0]._visible = 1;
              gameOverMenu[1]._visible = 1;
              gameOverMenu[3]._visible = 1;

              let text = 'ENTER YOUR NAME PLAYER';
              gameOverMenu[2]._visible = 1;
              gameOverMenu[2]._text = text;
              gameOverMenu[2].x = centerText(text);

              scoreIndex = i;

              enteredName = '';
              enteringName = 1;

              break;
            }
          }

          activeMenu = gameOverMenu;

          fx_play(FX_PLAYER_DIED);
        }

      }
    }

    // NOTE: The following block could be reduced to one ugly statement.
    // Update player pitch based on movement.
    let maxPitchAngle = 0.3; // Maximum pitch angle in radians (about 17 degrees).
    let normalizedSpeed = currentSpeed / PLAYER_HORIZONTAL_SPEED;
    playerCamera.pitch = -normalizedSpeed * maxPitchAngle; // Negative for forward pitch down, positive for reverse pitch up.

    if (currentSpeed !== 0 || strafeSpeed !== 0) {
      let pYaw = playerCamera.yaw;
      let sYaw = sin(pYaw);
      let cYaw = cos(pYaw);

      // Calculate total change in position from both forward/backward and strafe movement.
      let dx = (-sYaw * currentSpeed + cYaw * strafeSpeed) * dt;
      let dz = (cYaw * currentSpeed + sYaw * strafeSpeed) * dt;

      playerCamera.x = clamp(playerCamera.x + dx, MIN_XZ, MAX_XZ);
      playerCamera.z = clamp(playerCamera.z + dz, MIN_XZ, MAX_XZ);
    }

    // #endregion


    viewCamera = getViewCamera(); // Once player movement has been processed, get the 3rd person camera, positioned above and behind the player.


    // #region Bomb Indicator

    // 
    // Update the visual indicator that shows the player where a bomb will impact (when dropped).
    // 

    if (!playerDied) {

      let pY = playerCamera.yaw;
      let bX = playerCamera.x + -sin(pY) * BOMB_RANGE;
      let bZ = playerCamera.z + cos(pY) * BOMB_RANGE;

      if (bX >= 0 && bX < MAP_SIZE && bZ >= 0 && bZ < MAP_SIZE) {

        bDh = map[bZ | 0][ bX | 0]; // Height of the tile at the bombs range.
        bombVy = (-playerCamera.y / BOMB_RANGE) * PLAYER_HORIZONTAL_SPEED; // Calculate the Y velocity.

        let impactPoint = projectPoint(bX, 0, bZ);
        if (impactPoint) {
          // let color = [COLOR_YELLOW, COLOR_ORANGE, 'f00f', WHITE, ][randomInt(0, 3)]
          addLine(impactPoint.x - 20, impactPoint.y, impactPoint.x + 20, impactPoint.y, COLOR_WHITE);
          addLine(impactPoint.x, impactPoint.y - 20, impactPoint.x, impactPoint.y + 20, COLOR_WHITE);

          // objectsToDraw.push({
          //   _camera : newCamera(bX, 0, bZ, 0, 0),
          //   _size: 2.5,
          //   _color: 'fff6',
          //   _meshIndex: RING_MESH,
          // });

          objectsToDraw.push(newTempObject(
            newCamera(bX, 0, bZ, 0, 0),
            RING_MESH,
            'fff6',
            2.5,
          ));
        }
      }
    }

    // #endregion



    
    // #region Draw terrain.

    // 
    // Determine which terrain tiles are visible, then draw them.
    // 

    let halfView = VIEW_DRAW_RANGE / 2, gridCenterX = playerCamera.x | 0, gridCenterZ = playerCamera.z | 0;

    // Define the bright area and fade zone as a percentage of the total view distance.
    let BRIGHT_AREA_PERCENT = 0.6; // 60% of the view will be fully bright.
    let brightRadius = halfView * BRIGHT_AREA_PERCENT;
    let fadeZoneWidth = halfView - brightRadius; // The rest of the view is the fade zone.

    let projectedGrid = [];

    // Pass 1: Iterate through the world grid around the camera. For each point, project it into 2D screen coordinates and calculate its alpha based on distance from the center.
    for (let zOffset = halfView; zOffset >= -halfView; zOffset--) {

      let currentRow = [];

      for (let xOffset = -halfView; xOffset <= halfView; xOffset++) {

        let worldX = gridCenterX + xOffset + 0.5, worldZ = gridCenterZ + zOffset + 0.5;

        if (worldX < 0.5 || worldX >= MAP_SIZE - 0.5 || worldZ < 0.5 || worldZ >= MAP_SIZE - 0.5) {
          currentRow.push(0);
          continue;
        }

        let worldY = map[(worldZ - 0.5)|0][(worldX - 0.5)|0];
        let p = projectPoint(worldX, worldY, worldZ);

        if(!p) {
          currentRow.push(0);
          continue;
        }
        
        let dist = max(abs(xOffset), abs(zOffset)); // Use dynamic values for fading.

        // Ensure fadeZoneWidth is not zero to avoid division by zero errors.
        let alpha = 1.0;

        if (fadeZoneWidth > 0 && dist > brightRadius) {
          alpha = 1.0 - (dist - brightRadius) / fadeZoneWidth;

        } else if (dist > brightRadius) {
          alpha = 0.0; // If there's no fade zone, just cut off
        }
        
        currentRow.push({ x: p.x, y: p.y, a: max(0, alpha), _camera: colors[worldZ|0][worldX|0] + toHex(max(0, alpha))});
      }
      projectedGrid.push(currentRow);
    }

    // Pass 2: Iterate through the 2D array of projected points and draw lines between adjacent neighbors to form the grid mesh.
    for (let z = 0; z < projectedGrid.length; z++) {
      for (let x = 0; x < projectedGrid[z].length; x++) {

        let p_tl = projectedGrid[z][x]; // Current point, or "top-left" in a quad context.
        if (!p_tl || !p_tl.a) continue; // Skip if point is off-screen or invisible.

        // Draw line to the point on the right, if it exists.
        if (x < projectedGrid[z].length - 1) {
          let p_tr = projectedGrid[z][x + 1]; // "top-right".
          if (p_tr && p_tr.a) addLine(p_tr.x, p_tr.y, p_tl.x, p_tl.y, p_tl._camera + toHex(min(p_tr.a, p_tl.a)));
        }

        // Draw line to the point below, if it exists.
        if (z < projectedGrid.length - 1) {
          let p_bl = projectedGrid[z + 1][x]; // "bottom-left".
          if (p_bl && p_bl.a) addLine(p_bl.x, p_bl.y, p_tl.x, p_tl.y, p_tl._camera + toHex(min(p_bl.a, p_tl.a)));
        }
      }
    }

    // #endregion

    // 
    // With the terrain drawn, it's time to process the game objects!
    // 

    visibleObjects = [];

    // Cache player variables that will be used many times.
    let playerX = playerCamera.x;
    let playerY = playerCamera.y;
    let playerZ = playerCamera.z;
    let playerYaw = playerCamera.yaw;

    let sinYaw = sin(playerYaw);
    let cosYaw = cos(playerYaw);

    let playerFlying = playerY == FLIGHT_HEIGHT; // So we can tell if we are landing, dusting off, or on the ground.

    // Make the given object orbit the player.
    let orbitPlayer = (object, distance, speed, isVertical) => {
      let objectCamera = object._camera;

      // This part is the same for both orbit types
      object._orbitAngle += speed * dt;
      if (object._orbitAngle > PI2) object._orbitAngle -= PI2;
      if (object._orbitAngle < 0) object._orbitAngle += PI2;

      let angle = object._orbitAngle;
      let sinAngle = sin(angle);
      let cosAngle = cos(angle);

      if (isVertical) { // Vertical orbit (x/y axis)
        // let sinYaw = sin(playerYaw);
        // let cosYaw = cos(playerYaw);

        let local_Y_offset = cosAngle * distance;
        let local_X_offset = sinAngle * distance;

        objectCamera.y = playerY + local_Y_offset;

        objectCamera.x = playerX + cosYaw * local_X_offset;
        objectCamera.z = playerZ + sinYaw * local_X_offset;

      } else { // Horizontal orbit (x/z axis).
        objectCamera.x = playerX - sinAngle * distance;
        objectCamera.z = playerZ + cosAngle * distance;
        objectCamera.y = playerY;
      }
    };
    
    // Destroy the given object.
    let destroyObject = (object, index) => {

      let type = object._type;

      gameObjects.splice(index, 1); // Remove the object.

      createExplosion(
        object._camera.x, object._camera.y, object._camera.z, 
        object._baseColor, 
        type, 
        object._camera.pitch, object._camera.yaw);

      fx_play(FX_KILL_ENEMY);

      if (trainingMode && object === trainingTarget) {
        startNextObjectiveDelay();

      } else {

        if (type < TYPE_PYRA) {
          if ((--enemiesRemaining) === 0) notify('LEVEL PURGED');
        }

        awardPoints([
          100,  // TYPE_TURI
          150,  // TYPE_BOTA
          10,   // TYPE_QUBI
          250,  // TYPE_DART
          200,  // TYPE_TRIA
          400,  // TYPE_PROWLER
          0,0,0,0,0,0,0

        ][type]); // award points based on the type of object.
      }

    };

    // Detect collision between the given enemy and the players bullets.
    let DidBulletHitEnemy = (object) => {

      // 
      // NOTE: Bullets that are not visible have already been spliced from the `bullets` array.
      // 
      
      // Check collision with all bullets.
      for (let i = bullets.length; i--;) { // Iterate backwards for safe removal

        let bullet = bullets[i];

        if (bullet._type === TYPE_PLAYER) { // Only check against bullets the player has fired.

          if (isInRangeOf(bullet, object._camera, object._collisionRadius)) { // The bullet hit.. destroy the object.

            bullets.splice(i, 1); // Remove the bullet.
            return 1; // Return 1 to indicate hit.
          }
        }
      }
      return 0; // No collision detected.
    };

    // #region Process Powerups

    // Make the laser orbit the player.
    if (hasLaser) {
      laser._camera.yaw = playerYaw;
      orbitPlayer(laser, laser._orbitDistance, laser._orbitSpeed, 1);
      objectsToDraw.push(laser);
    }

    // Make enabled shields orbit the player.
    for (let shield of shields) {
      if (shield._enabled) {
        orbitPlayer(shield, shield._orbitDistance, shield._orbitSpeed);
        objectsToDraw.push(shield);
      }
    }

    // Make wingmen orbit player.
    for (let k = 2; k--;) {
      let wingman = wingMen[k];

      if (wingman._enabled) {
        // Position wingman.
        wingman._orbitAngle = [PI2 / 4, -(PI2 / 4)][k] + playerYaw;
        wingman._camera.yaw = playerYaw;

        orbitPlayer(wingman, wingman._orbitDistance, 0);

        objectsToDraw.push(wingman);
      }
    }

    // Process hornets.
    if (hasHornets) {
      for (let hornet of hornets) {

        if (hornet._enabled) { // The hornet is active and swarming behind the player.

          // Position the hornet in its swarm formation.
          hornet._orbitAngle = PI2 / 2 + playerYaw;
          hornet._camera.yaw = playerYaw;
          orbitPlayer(hornet, 2, 0);

          // Calculate and apply the "rocking" motion.
          hornet._xCounter += hornet._xRockSpeed * dt;
          hornet._zCounter += hornet._zRockSpeed * dt;
          let localX_offset = sin(hornet._xCounter) * hornet._xRockMagnitude;
          let localZ_offset = sin(hornet._zCounter) * hornet._zRockMagnitude;
          let world_dx = (localX_offset * cosYaw) - (localZ_offset * sinYaw);
          let world_dz = (localX_offset * sinYaw) + (localZ_offset * cosYaw);
          hornet._camera.x += world_dx;
          hornet._camera.z += world_dz;

          // Add it to the list of objects to be drawn this frame.
          objectsToDraw.push(hornet);
        }

        else if (hornet._target) { // The hornet has been fired and is homing in on a target.

          let targetObject = hornet._target;
          let objectCamera = hornet._camera;

          // If the target was destroyed by other means, the hornet becomes "spent".
          if (gameObjects.indexOf(targetObject) === -1) {
            hornet._target = 0;
            continue;
          }

          // Move hornet.
          objectCamera.x += hornet.vx * dt;
          objectCamera.y += hornet.vy * dt;
          objectCamera.z += hornet.vz * dt;

          // Spawn thrust particles.
          let invSpeed = 1 / (sqrt(hornet.vx * hornet.vx + hornet.vy * hornet.vy + hornet.vz * hornet.vz) || 1);
          let thrustDirX = -hornet.vx * invSpeed;
          let thrustDirY = -hornet.vy * invSpeed;
          let thrustDirZ = -hornet.vz * invSpeed;

          for (let k = 2; k--;) {
            newParticle(
              objectCamera.x, objectCamera.y, objectCamera.z,
              thrustDirX * THRUST_PARTICLE_SPEED + (random() - 0.5) * THRUST_PARTICLE_SPREAD,
              thrustDirY * THRUST_PARTICLE_SPEED + (random() - 0.5) * THRUST_PARTICLE_SPREAD,
              thrustDirZ * THRUST_PARTICLE_SPEED + (random() - 0.5) * THRUST_PARTICLE_SPREAD,
              THRUST_PARTICLE_TTL, THRUST_PARTICLE_TTL,
              hornetThrustColors[randomInt(0, 3)],
              randomInt(2, 4),
            );
          }

          let targetCamera = targetObject._camera;

          if (objectCamera.y <= targetCamera.y) { // Hornet impacted the ground at the targets location (or close enough to).

            createExplosion(objectCamera.x, targetCamera.y, objectCamera.z, hornet._baseColor);

            // NOTE: Do we even need to check? Maybe just destroy it.
            let combinedRadius = hornet._collisionRadius + targetObject._collisionRadius;
            if (isInRangeOf(objectCamera, targetCamera, combinedRadius)) {
              destroyObject(targetObject, gameObjects.indexOf(targetObject));
              spawnCargo(targetObject);
            }

            // The hornet has completed its run. It is now "spent".
            hornet._target = 0;
            hornet.vx = hornet.vy = hornet.vz = 0;
            objectCamera.pitch = 0;
          }

          objectsToDraw.push(hornet);
        }
      }
    }
    // #endregion




    // #region Process bullets.
      
    for (let i = bullets.length; i--;) {

      let bullet = bullets[i];

      let type = bullet._type;
      let isRising;

      if (type <= TYPE_BOTA) {
        
        if (bullet.y < FLIGHT_HEIGHT) { // Bullet has not reached desired height.

           bullet.y = clamp(bullet.y + bullet.vy * dt, 0, FLIGHT_HEIGHT); // Fix height, meaning from now on it will move in its predetermined direction.
           isRising = 1;

           if (bullet.y === FLIGHT_HEIGHT && type === TYPE_BOTA) { // Spawn shower of flak, firing in 6 directions.
            let yaw = random() * PI2; // Random direction.
            for (let j = 6; j--;) {
              newBullet(type, bullet.x, FLIGHT_HEIGHT,bullet.z, -sin(yaw) * 16, 1, cos(yaw) * 16);
              yaw += PI2 / 6;
            }
            fx_play(FX_BULLET_SPRAY);
          }
        }
      }

      if (!isRising) { // It's not rising, so move it on the x/z axis.
        bullet.x += bullet.vx * dt;
        bullet.z += bullet.vz * dt;
      }

      // Destroy if not visible.
      let dx = bullet.x - playerX, dz = bullet.z - playerZ;
      let dist = dx * dx + dz * dz;

      if (dist > (VIEW_CULL_RANGE * VIEW_CULL_RANGE)) {
        // As soon as a bullet is no longer visible, it is destroyed.

        // NOTE: This may come back to bite us in the butt later.

        bullets.splice(i, 1);
        continue;
      }

      if (type < TYPE_PLAYER) {
        if (dist < .5) { // The bullet is an enemy bullet, and can collide with the player.

          if (playerFlying) { // When they are on the ground, player cannot be damaged by bullets.

            if (!checkShields()) damagePlayer();
            bullets.splice(bullets.indexOf(bullet), 1);

          }
        }

        if (playerFlying && playerCanBeDamaged) { // Check for bullet collision with wingmen.
          
          for (let wingman of wingMen) {

            if (wingman._enabled) {

              let dx = wingman._camera.x - bullet.x;
              let dz = wingman._camera.z - bullet.z;

              if ( (dx * dx + dz * dz) < (wingman._collisionRadius * wingman._collisionRadius) ) { // Bullet hit wingman.
                bullets.splice(i, 1);
                disableWingman(wingman);
                break; 
              }

            }
          }
        }

      }

      // Draw the bullet if it is visible.
      let point = projectPoint(bullet.x, bullet.y, bullet.z);
      if (point) {
        let size = 6;
        addRect(point.x - size / 2, point.y - size / 2, size, size, bulletColors[type]);
      }
    }
    
    // 
    // IMPORTANT: The bullets array now contains ONLY visible bullets!
    // 

    // #endregion.




    // #region Object loop

    let hornetReady;
    if (playerFlying && hasHornets && (hornetReloaded -= dt) <= 0) hornetReady = 1;

    // 
    // Process all objects.
    // 

    mainGameObjectLoop:
      for (let j = gameObjects.length; j--;) {

      if (playerDied) break; // Skip if the player is dead.

      let object = gameObjects[j];

      let type = object._type;

      if (type === TYPE_LASER && !hasLaser) continue; // Janky fix so laser is not drawn when player doesn't have it.

      let objectCamera = object._camera;
      
      let visible = 0; // Whether the enemy currently being processed is visible.

      // Get distance between player and object.
      let dx = objectCamera.x - playerX, dz = objectCamera.z - playerZ;
      let distanceToPlayer = dx * dx + dz * dz;

      let targetAndFireAt = (y, targetPlayer = 1) => {
        if (visible) {

          if (distanceToPlayer < object._attackRange * object._attackRange) { // Player is in range and enemy is able to attack.

            if ((object._reloaded -= dt) < 0) { // Enemy is able to fire at player.
              object._reloaded = object._rateOfFire;

              let targetYaw = object._camera.yaw; // By default, fire in the direction the enemy is facing.
              
              if (targetPlayer) targetYaw = atan2(-(playerCamera.x - object._camera.x), playerCamera.z - object._camera.z); // Fire at the player.

              // if (object._type === TYPE_TRIA) log(`${object._camera.y}`)
    
              newBullet(type, object._camera.x, object._camera.y + y, object._camera.z, -sin(targetYaw) * object._projSpeed, 1, cos(targetYaw) * object._projSpeed);
              return 1;
            }
          }

        }
        return 0;
      };

      // Move the current object between waypoints, creating a new one when in range of the current one.
      let moveBetweenWaypoints = e => {
        if (isInRangeOf(objectCamera, object._wayPoint, 5)) object._wayPoint = newWayPoint();

        object._fakeYaw += doTheTurn(object, object._wayPoint, dt);

        objectCamera.x += -sin(object._fakeYaw) * object._moveSpeed * dt;
        objectCamera.z += cos(object._fakeYaw) * object._moveSpeed * dt;

        if (visible) checkEnemyCollidedWithPlayer(object);
      };

      // Check whether the current object has collided with the payer and act accordingly.
      let checkEnemyCollidedWithPlayer = e => {

        if ((object._flies && !playerGrounded) || (!object._flies && playerGrounded)) { // Player collides with flying enemies whilst not grounded, and with ground based enemies when grounded.

          // let enemyTypeStrings = ['TYPE_PYRA', 'TYPE_TURI', 'TYPE_QUBI', 'TYPE_BOTA', 'TYPE_DART', 'TYPE_TRIA', 'TYPE_SIX', 'TYPE_SEVEN', 'TYPE_CARGO'];
          // log(`type: ${enemyTypeStrings[object._type]} enemy flying:${['no', 'yes'][object._flies]} player grounded:${['no', 'yes'][playerGrounded]}`);

          if (isInRangeOf(objectCamera, playerCamera, object._collisionRadius)) { // Enemy collided with the player.

            if (!checkShields()) damagePlayer(); // Damage player, or deplete shields if shielded.

              destroyObject(object, j);
            
            return 1;
          }

        }
        return 0;
      };

      // if (distanceToPlayer < (VIEW_CULL_RANGE * VIEW_CULL_RANGE)) { // The enemy is visible to the player.
      if (distanceToPlayer < 1152) { // The enemy is visible to the player.
        
        if (type !== TYPE_SHIELD) { // Shields are processed further on.

          if (object._flies) { // Check for bullet collision vs flying objects.
            
            if (DidBulletHitEnemy(object)) { // A bullet hit this object.

              destroyObject(object, j)

              continue; // Skip to next object since this one is destroyed.
            }
          }
         
          // Add to draw list if still alive.
          objectsToDraw.push(object);
          visibleObjects.push(object);

          if (type === TYPE_CARGO) { // Crates flash to draw the players attention to them.

            if (object._flashing) { // Flashing.

              if((object._flashCounter -= dt) < 0) {
                object._flashing = 0;
                object._flashCounter = 2;// random() * 2;
                object._color = object._baseColor;
              }

            } else { // Counting down to next flash.

              if((object._flashCounter -= dt) < 0) {
                object._flashing = 1;
                object._flashCounter = .05;
                object._color = COLOR_WHITE;
              }
            }
          }

          // Detect and resolve collisions between enemies and wingmen.
          if (playerFlying && object._flies) {

            for (let wingman of wingMen) {

              if (wingman._enabled) {

                let combinedRadius = object._collisionRadius + wingman._collisionRadius;

                if (isInRangeOf(objectCamera, wingman._camera, combinedRadius)) { // Object collided with wingman.

                  destroyObject(object, j);

                  disableWingman(wingman);

                  continue mainGameObjectLoop; // Skip to next object.
                }
              }
            }
          }

          // 
          // TODO: Add more global effects for visible enemies here.
          // 

        }

        // Find and fire at the first available flying target.
        if (playerFlying && hasLaser && !laser._flashing && (laser._reloaded -= dt) < 0) {

          if (type < TYPE_PYRA && distanceToPlayer < 200 && object._flies) { // Current object is in range! Fire!
            
            if ((beamCount--) === 0) destroyLaser();

            // Laser changes color from blue through to red indicating heat.
            laser._color = laserColors[beamCount];

            laser._reloaded = laser._rateOfFire;
            laserTarget = object;
            laser._flashing = 1;
            laser._flashCounter = 1;
            fx_play(FX_LASER);

            destroyObject(object, j);

            if (!object._flies && type !== TYPE_PYRA) spawnCargo(object);
            continue;
          }
        }

        // If a hornet is avalailable, find and fire it at the first available ground target.
        if (playerFlying && hasHornets && hornetReady) {

          if (type < TYPE_QUBI && distanceToPlayer < 200) { // Current object is in range! Fire!

            for (let hornet of hornets) {

              if (hornet._enabled && !object._painted) {

                hornetReloaded = hornetROF; // Small delay between firing hornets.

                hornet._target = object; // Oh boy, is this object in trouble!
                object._painted = 1; // <Locked on!
                hornet._enabled = 0;

                let hornetCam = hornet._camera;
                let targetCam = object._camera;

                // Calculate the direction vector from hornet to target.
                let dx = targetCam.x - hornetCam.x;
                let dy = targetCam.y - hornetCam.y; // Vertical difference.
                let dz = targetCam.z - hornetCam.z;

                // Instantly point the hornet at the target.
                hornetCam.yaw = atan2(-dx, dz); // Point on the horizontal plane.
                hornetCam.pitch = atan2(-dy, sqrt(dx * dx + dz * dz)); // Point up/down.

                // Calculate distance and normalize the vector.
                let dist = sqrt(dx * dx + dy * dy + dz * dz) || 1;
                let normX = dx / dist;
                let normY = dy / dist;
                let normZ = dz / dist;

                // Set velocity for a direct path.
                hornet.vx = normX * hornet._moveSpeed;
                hornet.vy = normY * hornet._moveSpeed;
                hornet.vz = normZ * hornet._moveSpeed;

                fx_play(FX_LAUNCH_HORNET);
                break;
              }

            }
          }
        }

        visible = 1;
      }




      if (type === TYPE_PYRA && visible) {
        
        // 
        // Pyra performs turning jumps at random intervals, but only when visible.
        // They do not move, they just wait to be rescued by the player.
        // 

        if (!object._jumping) { // Enemy not jumping.
          if ((object._counter -= dt) < 0) {
            object._jumping = 1;
            object.vy = 5;
            fx_play(FX_PYRA_JUMP);
          }

        } else { // Must be jumping.

          objectCamera.y += object.vy * dt;
          object.vy -= GRAVITY * dt;
          objectCamera.yaw -= .03;

          if (objectCamera.y < object._ground) { // Qubi landed on the ground.
            objectCamera.y = object._ground;
            object._jumping = 0;
            object._counter = random() * 2;
          }
        }

      } else if (type === TYPE_TURI) {


        
        // 
        // Turi do not move, they just fire at the player when they are in range (and only if the turi is visible).
        // 

        if (targetAndFireAt(1)) fx_play(FX_TURI_SHOOT); 

      } else if (type === TYPE_QUBI) {

        // 
        // Qubi move in a set direction, tumble, and decelerate until they are stationary.
        // They detonate after an amount of time.
        // 

        // Tumble.
        objectCamera.yaw += object._moveSpeed * dt;
        objectCamera.pitch += object._moveSpeed * dt;

        if ((object._moveSpeed *= .968) < .01) object._moveSpeed = 0; // Decelerate over time.

        // Move based on its current speed and fake yaw.
        objectCamera.x += -sin(object._fakeYaw) * object._moveSpeed * dt;
        objectCamera.z += cos(object._fakeYaw) * object._moveSpeed * dt;

        if ((object._counter-= dt) < 0) { // Qubi explodes after 12 seconds.

          gameObjects.splice(gameObjects.indexOf(object), 1);

          if (--enemiesRemaining === 0) {
            notify('ALL ENEMY UNITS DESTROYED');
          }

          if (visible) {
            createExplosion(
              objectCamera.x, objectCamera.y, objectCamera.z, 
              object._color
            );

            newParticle(
              objectCamera.x, objectCamera.y, objectCamera.z, 
              0, 0, 0,
              1.2, 1, 
              'fff',
              0,
              0,
              TYPE_MESH, RING_MESH,
              objectCamera.yaw,
              0,
              .5, 10,
            );

            fx_play(FX_QUBI_EXPLOSION);
          }

        } else if (visible) {
          checkEnemyCollidedWithPlayer(object);
        }

      
      } else if (type === TYPE_BOTA) {

        // 
        // Bota gently rock back and forth never straying far from their original location.
        // They fire a flak shell when the payer is in range.
        // 

        if (visible) {
        
          if ((object._counter -= dt) < 0) {
            object._counter = 2;
            object._baseMoveSpeed = coinToss() ? .5 : -.5; // Always move, just pick direction
          }
          
          // Smooth acceleration curve over 2 seconds
          let t = 2 - object._counter; // 0 to 2
          let factor = t < .5 ? t * 2 : t > 1.5 ? (2 - t) * 2 : 1; // Ramp up/down
          let currentMoveSpeed = object._baseMoveSpeed * factor;
          
          // Apply the rocking movement
          objectCamera.x += -sin(objectCamera.yaw) * currentMoveSpeed * dt;
          objectCamera.z += cos(objectCamera.yaw) * currentMoveSpeed * dt;
          
          // Gently pull back toward anchor point (like an anchor chain)
          let dx = object._anchorX - objectCamera.x;
          let dz = object._anchorZ - objectCamera.z;
          objectCamera.x += dx * 0.1 * dt; // Gentle restoration force
          objectCamera.z += dz * 0.1 * dt;
          
          targetAndFireAt(0.5, 1);
          checkEnemyCollidedWithPlayer(object);
        }

      } else if (type === TYPE_DART) {
        
        // 
        // Darts move about the world between waypoints generated on the fly.
        // They periodically fire in the direction they are moving.
        // 

        moveBetweenWaypoints();

        objectCamera.yaw = object._fakeYaw;

        if (visible) {

          checkEnemyCollidedWithPlayer(object);

          if ((object._reloaded -= dt) < 0) { // Enemy is able to fire at player.
            object._reloaded = object._rateOfFire;
            let vx = -sin(objectCamera.yaw) * object._projSpeed;
            let vz = cos(objectCamera.yaw) * object._projSpeed;

            newBullet(type, objectCamera.x, objectCamera.y, objectCamera.z, vx, 0, vz);

            fx_play(FX_DART_SHOOT);

          }
        }

      } else if (type === TYPE_CARGO) {

        // 
        // Cargo just spins on its x/z axis (when visible), waiting to be collected by the player.
        // 

        if (visible) object._camera.yaw += 1.1 * dt;

      } else if (type === TYPE_TRIA) {

        // 
        // Tria moves about the world between waypoints generated on the fly.
        // They spin on their x/z axis and periodically spawn Qubi's.
        // 

        objectCamera.yaw += 4.5 * dt; // Spin on x/z axis.

        if (!trainingMode) {
          if ((object._counter -= dt) < 0) { // Spawn a qubi.
            let qubi = spawnObject(TYPE_QUBI, 0, 0, newCamera(objectCamera.x, objectCamera.y, objectCamera.z, random() * PI2, random() * PI2));
            enemiesRemaining++;
            qubi._counter = 9;
            object._counter = random() * 4 + 3
            if (visible) fx_play(FX_SPAWN_QUBI);
          }
        }

        moveBetweenWaypoints();

      } else if (type === TYPE_PROWLER) {

        // 
        // Prowler moves about the world between waypoints generated on the fly.
        // When the player is in range, the prowler will turn to face the player and shoot at them.
        // 

        moveBetweenWaypoints();

        let attacking;

        if (visible && distanceToPlayer < object._attackRange) {

          attacking = 1;

          object._moveSpeed = clamp(object._moveSpeed *= .98, 0, object._baseMoveSpeed); // Slow to a stop.

          if (targetPlayer(object)) { // The enemy is facing the player.

            if ((object._reloaded -= dt) < 0) { // Enemy is able to fire at player.

              object._reloaded = object._rateOfFire;
              newBullet(type, objectCamera.x, FLIGHT_HEIGHT, objectCamera.z, -sin(objectCamera.yaw) * object._projSpeed, 1, cos(objectCamera.yaw) * object._projSpeed);
              fx_play(FX_PROWLER_SHOOT);
            }
          }
        }

        if (!attacking) {
          object._moveSpeed = object._baseMoveSpeed; // Enemy not visible so the jarring acceleration from 0 to max speed will never be seen.
          objectCamera.yaw = object._fakeYaw; // Ditto with the jarring rotation.
        }

      }

    } // End main object loop.

    // Draw the laser beam visual if it's currently active.
    if (hasLaser && laser._flashing) {
      if (laserTarget) { // Check if we have a target to draw to.
        let p0 = projectPoint(laser._camera.x, laser._camera.y, laser._camera.z);
        // The target was destroyed, but we draw the beam to its last known position.
        let p1 = projectPoint(laserTarget._camera.x, laserTarget._camera.y, laserTarget._camera.z);
        if (p0 && p1) {
          // Draw a beam that fades out over it's short duration (0.2s).
          addLine(p0.x, p0.y, p1.x - 5 + randomInt(0, 10), p1.y - 5 + randomInt(0, 10), ['fff', 'fff', '0ff', '00f'][randomInt(0, 3)]  + toHex(laser._flashCounter));

          // addLine(p0.x, p0.y, p1.x, p1.y, '0ff' + toHex(laser._flashCounter / 0.2));
        }
      }
      // Countdown the visual effect and stop it when done.
      if ((laser._flashCounter -= dt) <= 0) {
        laser._flashing = 0;
        laserTarget = 0; // Clear the target reference.
      }
    }

    if (playerVisible) objectsToDraw.push(playerShip);

    if (playerDied && playerVisible) { // Spawn smoke particles when player crashing.
      newParticle(
        playerCamera.x - .5 + random(), playerCamera.y, playerCamera.z - .5 + random(),
        0, random(), 0, 
        3, 3, 
        ['fff', 'ccc', '999', '666'][randomInt(0, 3)],
        0,
        0,TYPE_RECTANGLE,0,0,0,randomInt(2, 3), randomInt(20, 30),
      );

    } else {

      if (abs(currentSpeed) > 0.1) { // Emit thrust particles.
      
        let particlesToSpawn = (abs(currentSpeed) / PLAYER_HORIZONTAL_SPEED) * THRUST_PARTICLES_PER_SECOND * dt | 0;
        let shipDirX = -sin(playerCamera.yaw), shipDirZ = cos(playerCamera.yaw);
        
        // Determine thrust direction and emission point
        let isReversing = currentSpeed < 0;
        let thrustDirX = isReversing ? -shipDirX : shipDirX; // Reverse thrust direction when backing up
        let thrustDirZ = isReversing ? -shipDirZ : shipDirZ;
        
        // Emit particles from the opposite end (back when forward, front when reverse)
        let emitOffsetX = isReversing ? shipDirX * 0.5 : -shipDirX * 0.5;
        let emitOffsetZ = isReversing ? shipDirZ * 0.5 : -shipDirZ * 0.5;
        let emitX = playerCamera.x + emitOffsetX, emitY = playerCamera.y, emitZ = playerCamera.z + emitOffsetZ;

        for (let i = particlesToSpawn; i--;) {
          newParticle(
            emitX, emitY, emitZ, 
            thrustDirX * THRUST_PARTICLE_SPEED + (random() - 0.5) * THRUST_PARTICLE_SPREAD, (random() - 0.5) * THRUST_PARTICLE_SPREAD, thrustDirZ * THRUST_PARTICLE_SPEED + (random() - 0.5) * THRUST_PARTICLE_SPREAD,
            THRUST_PARTICLE_TTL, THRUST_PARTICLE_TTL,
            'fff',
            2,
          );
        }
      }

      if (abs(strafeSpeed) > 0.1) { // Emit strafe particles.
        let pYaw = playerCamera.yaw;
        let sYaw = sin(pYaw);
        let cYaw = cos(pYaw);

        // Determine thrust direction (outward from the side) and emission point.
        let isStrafingRight = strafeSpeed > 0;
        let sideThrustDirX = isStrafingRight ? -cYaw : cYaw; // Thrust fires from the opposite side.
        let sideThrustDirZ = isStrafingRight ? -sYaw : sYaw;
        
        let particleVelocityX = sideThrustDirX * THRUST_PARTICLE_SPEED;
        let particleVelocityZ = sideThrustDirZ * THRUST_PARTICLE_SPEED;

        // Emitter is on the side of the ship.
        let shipWidth = 0.5; // Approximate width for emitter offset.
        let emitOffsetX = sideThrustDirX * shipWidth / 2;
        let emitOffsetZ = sideThrustDirZ * shipWidth / 2;
        
        let emitX = playerCamera.x + emitOffsetX;
        let emitY = playerCamera.y;
        let emitZ = playerCamera.z + emitOffsetZ;
        
        let particlesToSpawn = (abs(strafeSpeed) / PLAYER_STRAFE_SPEED) * THRUST_PARTICLES_PER_SECOND * dt | 0;

        for (let i = particlesToSpawn; i--;) {
          newParticle(
            emitX, emitY, emitZ,
            particleVelocityX + (random() - 0.5) * THRUST_PARTICLE_SPREAD, (random() - 0.5) * THRUST_PARTICLE_SPREAD, particleVelocityZ + (random() - 0.5) * THRUST_PARTICLE_SPREAD,
            THRUST_PARTICLE_TTL, THRUST_PARTICLE_TTL,
            'fff',
            2,
          );
        }
      }

    }

    // #endregion

    


    // #region Pyra indicator.

    // Find nearest pyra to the player.
    let findClosestPyra = e => {
      let nearest;
      let minDistSq = 1e9;

      for (let pyra of allPyra) {
        let dx = pyra._camera.x - playerX;
        let dz = pyra._camera.z - playerZ;
        let distSq = dx * dx + dz * dz;

        if (distSq < minDistSq) {
          minDistSq = distSq;
          nearest = pyra;
        }
      }
      
      if (nearest) nearest._distanceToPlayer = minDistSq;

      return nearest;
    };
    
    let closestPyra = findClosestPyra();
    
    let shouldBeVisibleThisFrame = closestPyra && closestPyra._distanceToPlayer > (VIEW_CULL_RANGE * VIEW_CULL_RANGE); // Determine if the indicator should be visible this frame.
    
    let ghost; // Will hold the ghost particle data if needed.

    if (isIndicatorVisible && pyraIndicator) {
      if (!shouldBeVisibleThisFrame || closestPyra !== lastNearestPyra) ghost = pyraIndicator._camera; // A ghost is needed. Grab the state of the indicator from the previous frame.
    }

    if (shouldBeVisibleThisFrame && !playerDied & !playerOnRails) { // Calculate new position and orientation for the active indicator.
      let pyraCam = closestPyra._camera;
      
      let dx = pyraCam.x - playerX;
      let dz = pyraCam.z - playerZ;
      
      let angle = atan2(-dx, dz);
      let indicatorDistance = 3;

      let indicatorX = playerX - sin(angle) * indicatorDistance;
      let indicatorY = playerY;
      let indicatorZ = playerZ + cos(angle) * indicatorDistance;

      // Create or update the main indicator object.
      // pyraIndicator = {
      //   _camera: newCamera(indicatorX, indicatorY, indicatorZ, angle, 0), 
      //   _meshIndex: ARROW_MESH,
      //   _color: 'f0f',
      //   _size: 1,
      // };

      pyraIndicator = newTempObject(
        newCamera(indicatorX, indicatorY, indicatorZ, angle, 0), ARROW_MESH, cosmicNebulaColors[randomInt(0, 4)], 1
      );

      objectsToDraw.push(pyraIndicator);
    }
    
    // Draw ghost image if it was created.
    if (ghost) {
      newParticle(
        ghost.x, ghost.y, ghost.z, 0, 0, 0,
        1, 
        1, 
        'fff', 
        1, 0, 
        TYPE_MESH, ARROW_MESH,
        ghost.yaw, ghost.pitch, 1, 1,
      );
    }

    // Update State for next frame.
    isIndicatorVisible = shouldBeVisibleThisFrame;
    lastNearestPyra = closestPyra;

    // #endregion




    // #region manage boarding/loading.

    if (playerBoardingOrLoading) {

      if ((boardingLoadingSoundCounter -= dt) <= 0) { // Play sound effect as boarding/loading progress bar fills.
        boardingLoadingSoundCounter += .1;

        fx_play(FX_LOAD_BOARD);
        
        let target = cargoBeingLoaded ? cargoBeingLoaded : boardingPassenger;
        let camera = target._camera;
       
        newParticle(
          camera.x, camera.y, camera.z, // Position.
          0, 20, 0, // Velocity
          1, 1, // TTL.
          target._baseColor,
          7,
        );
      }

       if ((boardingOrLoadingCounter += dt / 2) >= 1) { // 2 seconds to board or load.

        // If in training mode and picking up a Pyra, advance to the next objective.
        if (trainingMode && (boardingPassenger || cargoBeingLoaded)) {
          startNextObjectiveDelay();
        }

        let object;

        if (boardingPassenger) { // Passenger successfully boarded
          fx_play(FX_PASSENGER_BOARDED);
          object = boardingPassenger;

          // Mark the Pyra as rescued. This prevents it from being picked up again in the same frame when boardOrLoad() is called at the end of this block.
          object._notRescuedOrKilled = 0;

          gameObjects.splice(gameObjects.indexOf(object), 1);

          if (!trainingMode) {
            allPyra.splice(allPyra.indexOf(object), 1);
            awardPoints(1250);
            catsRescued++;
            updateCatsReadout();
            checkLevelComplete();
          }

          boardingPassenger = 0;

        } else { // Cargo successfully loaded.
          visibleObjects.splice(visibleObjects.indexOf(cargoBeingLoaded), 1);
          gameObjects.splice(gameObjects.indexOf(cargoBeingLoaded), 1);


          fx_play(FX_CARGO_LOADED);
          awardPoints(150);

          let cargoType = cargoBeingLoaded._cargoType;

          notify(['POINTS', 'LIFE', 'SHIELDS', 'WINGMEN', 'HORNETS', 'LASER'][cargoType], 0, 1, 0);

          if (cargoType === CARGO_TYPE_POINTS) {
            awardPoints(1000);
          } else if (cargoType === CARGO_TYPE_LIFE) {
            lives = clamp(lives + 1, 0, 9);
            updateLives();
          } else if (cargoType === CARGO_TYPE_SHIELDS) {
            enableShields(1);
          } else if (cargoType === CARGO_TYPE_WINGMEN) {
            // for (let wingman of wingMen) wingman._enabled = 1;
            enableWingMen(1);

          } else if (cargoType === CARGO_TYPE_HORNETS) {
            hasHornets = 1;
            for (let hornet of hornets) hornet._enabled = 1;
          } else if (cargoType === CARGO_TYPE_LASER) {
            hasLaser = 1;
            laserTarget = 0;
            beamCount = 9;
            laser._color = laserColors[beamCount];
          }

          object = cargoBeingLoaded;
          cargoBeingLoaded = 0;
        }

        // Spawn mesh particle.
        let camera = object._camera;
        newParticle(
          camera.x, camera.y, camera.z, // Position.
          0, 15, 0, // Velocity
          .8, .8, // TTL.
          object._baseColor,
          1, // Size.
          0, // Obey gravity.
          TYPE_MESH, object._meshIndex, // Mesh.
          camera.yaw, 0, // Orientation.
          object._size, object._size // Start/end sizes.
        );

        playerBoardingOrLoading = 0;

        showBoardingBar(0);

        boardOrLoad(); // Board or load the next passenger or cargo in range.
      }
      updateBoardingBar(960 * boardingOrLoadingCounter);

    }
    // #endregion




    // #region Manage landing/dust-off.

    if (playerLanding) { // Player is currently landing.

      playerCamera.y += playerCamera.vy * dt;
      playerCamera.yaw -= .03;

      if (playerCamera.y <= playerDestHeight) {
        playerCamera.y = playerDestHeight; // Correct height.
        playerBoardingOrLoading = 0;
        playerGrounded = 1; // Player has landed.
        playerLanding = 0;
        // log('Player has landed');

        boardOrLoad(); // Initiate boarding or loading if there is a passenger or cargo nearby.
      }
      
    } else if (playerDustingOff) { // The player is currently dusting off.

      playerCamera.y += playerCamera.vy * dt;

      if (playerCamera.y >= playerDestHeight) { // Dust-off process complete.

        playerCamera.y = playerDestHeight; // Correct height.
        playerOnRails = 0; // Not landing or dusting off.
        playerDustingOff = 0;
        // log('player has dusted off');
      }
    }

    // #endregion




    // #region Process bombs

    for (let i = bombs.length; i--;) {

      let b = bombs[i];

      // Update position.
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.z += b.vz * dt;
      
      let bX = b.x;
      let bZ = b.z;

      if (bX < 0 || bX >= MAP_SIZE || bZ < 0 || bZ >= MAP_SIZE) { // Bomb left map.
        bombs.splice(i, 1);
        continue
      }

      if (b.y <= 0) { // Bomb collided with ground.
        // log(`Bomb hit ground.. x:${b.x.toFixed(2)} y:${b.y.toFixed(2)} z:${b.z.toFixed(2)} yaw:${b.yaw.toFixed(2)}`);

        let inRange = GetObjectsInRadius(b, 3);

        // log('inRange')
        // log(inRange)

        if (inRange) { // There was one of more enemies in the bombs blast radius.

          for (let k = inRange.length; k--;) {

            let object = inRange[k];
            let type = object._type;
            // let c = object._camera;
            
            if (type !== TYPE_CARGO) { // Cargo is indestructable.

              if (type !== TYPE_PYRA) { // All enemies that are not pyra, can spawn a cargo crate on death.

                spawnCargo(object);

              } else {

                cancelBoardingOrLoading();

                notify('DO NOT BOMB THE PYRA');

                allPyra.splice(allPyra.indexOf(object), 1); // Remove from pyra list.

                liveCats--;
                if (liveCats < 1) damagePlayer(1e9); // Game over if all cats died.

                updateCatsReadout();

                fx_play(FX_KILLED_CAT);

                checkLevelComplete(1);

              }

              // Destroy any enemy that is not cargo.

              destroyObject(object, gameObjects.indexOf(object));

            }
 
          }

        } else { // There were no enemies in the bombs blast radius.

          let ix = b.x | 0, iz = b.z | 0;
          if (ix > 0 || ix < MAP_SIZE || iz > 0 || iz < MAP_SIZE) createExplosion(
            b.x, b.y, b.z, 
            colors[iz][ix]
          );

        }

        deformTerrain(b.x, b.z);

        fx_play(FX_BOMB_EXPLOSION);

        bombs.splice(i, 1);
        continue
      }

      let point = projectPoint(b.x, b.y, b.z);
      if (point) {
        let size = 5;
        addRect(point.x - size / 2, point.y - size / 2, size, size, 'fc8f');
      }

      // Spawn bomb trail effect.
      newParticle(
        b.x, 
        b.y,
        b.z, 
        -sin(b.yaw) * THRUST_PARTICLE_SPEED + (random() - 0.5) * THRUST_PARTICLE_SPREAD,
        (random() - 0.5) * 2,
        cos(b.yaw) * THRUST_PARTICLE_SPEED + (random() - 0.5) * THRUST_PARTICLE_SPREAD,

        THRUST_PARTICLE_TTL,
        THRUST_PARTICLE_TTL,
        ['f00f', COLOR_ORANGE, COLOR_YELLOW, COLOR_WHITE][randomInt(0, 3)],
        2,
      );

    }

    // #endregion




    // #region Between levels

    let BLAST_OFF_SPEED = 30;

    if (playerBlastingOff) {
      playerCamera.y += BLAST_OFF_SPEED * dt;
      playerCamera.yaw += .02;

      let blastSpread = 8; // How wide the exhaust cone is.
      let blastSpeed = 25; // Base downward speed of the particles.

      if (playerY < 8) { // Spawn blast off particles when low to ground.

        newParticle(
          playerX, playerY, playerZ,
          (random() - 0.5) * blastSpread, -blastSpeed - (random() * 15), (random() - 0.5) * blastSpread,
          THRUST_PARTICLE_TTL, THRUST_PARTICLE_TTL,
          'ffff',
          randomInt(2, 4),
        );

      } else { // spawn space warp particles.

        // Need better colors
        newParticle(
          playerX, playerY, playerZ,
          0, BLAST_OFF_SPEED, 0,
          1, 1,
          cosmicNebulaColors[randomInt(0, 4)], // Cosmic Nebula palette.
          1,
          0,
          TYPE_MESH, RING_MESH,
          random() * PI2, random() * PI2,
          .5, 40,
        );
      }

      if (playerCamera.y > 25) {
        playerLeaving = 1;
        playerBlastingOff = 0;
        gpc = 2;
        playerVisible = 0;

        newParticle(
          playerX, playerY, playerZ,
          0, BLAST_OFF_SPEED, 0,
          1, 1,
          playerShip._baseColor,
          1,
          0,
          TYPE_MESH, TYPE_PLAYER,
          playerCamera.yaw, 0,
          1, 1,
        );

      }

    } else if (playerLeaving) { // Player is fading out.

      playerCamera.y += BLAST_OFF_SPEED * dt;

      if ((gpc -= dt) < 0) nextLevel(); // Advance to the next level.

    } else if (playerEntering) { // Player is spawning.

      if ((gpc -= dt) < 0) { // The particle effects have finished by now so let the lpayer take damage and be able to perform actions.

        playerCanBeDamaged = 1;
        playerOnRails = 0;
        playerEntering = 0;
        playerVisible = 1;



        if (trainingMode) {
          setNextTrainingObjective();

        } else {
          notify(`LEVEL ${level} LIBERATE ${catsToRescue} PYRA`, 0, 3);
        }

      }

    }

    // #endregion




    // #region Training mode
    if (trainingMode) {

      if (waitingForNextObjective) { // Delaying until next ojective.

        if ((nextObjectiveTimer -= dt) < 0) { // Delay done.
          waitingForNextObjective = 0;
          setNextTrainingObjective();  // Start the next phase.
        }

      } else { // Check for objective completion.

        if (objectiveType < OBJECTIVE_PRESS_BUTTON) { // Press key.
          if (keys[objectiveKey]) startNextObjectiveDelay();

        } else if (objectiveType < OBJECTIVE_KILL_ENEMY) { // Press button.
          if (objectiveKey < 1) { // Left mouse
            if (bullets.length) startNextObjectiveDelay();
          } else { // Right mouse
            if (bombs.length) startNextObjectiveDelay();
          }

        // } else if (objectiveType < OBJECTIVE_INFORMATION) { // Kill enemy.

          // Handled elsewhere.

        } else if (objectiveType < OBJECTIVE_PICKUP) { // Information.
          if ((objectiveKey -= dt) < 0) startNextObjectiveDelay();


        // } else if (objectiveType < OBJECTIVE_GOTO) { // Pickup.

          // Handled elsewhere.

        } else if (objectiveType > OBJECTIVE_PICKUP) { // Goto..
        // } else { // Goto.
          if (trainingTarget) {

            if (isInRangeOf(playerCamera, trainingTarget._camera, 600)) startNextObjectiveDelay();
          }
  
        }
      }

      // 
      // Draw an indicator pointing towards the training target (if any).
      // 

      if (trainingTarget && trainingTarget._enabled) {
        let targetCamera = trainingTarget._camera;

        // Calculate vector and squared distance from player to target.
        let dx = targetCamera.x - playerX;
        let dz = targetCamera.z - playerZ;
        let distSq = dx * dx + dz * dz;

        // The new threshold for hiding the indicator (12 * 12 = 144).
        // let HIDE_INDICATOR_THRESHOLD_SQ = 144; 

        // --- Only draw the indicator if the target is farther than 12 units away ---
        if (distSq > 144) {
        // if (distSq > HIDE_INDICATOR_THRESHOLD_SQ) {
          
          let distanceToTarget = sqrt(distSq);
          let minIndicatorDist = 1;
          let maxIndicatorDist = 10;//20;
          let farDistanceThreshold = 100;//100;

          // Calculate progress (0.0 to 1.0) based on how far the target is.
          // This logic remains the same and works perfectly.
          let progress = clamp((distanceToTarget - VIEW_CULL_RANGE) / (farDistanceThreshold - VIEW_CULL_RANGE), 0, 1);
          
          // Use progress to determine the indicator's distance from the player.
          let indicatorDistance = minIndicatorDist + (maxIndicatorDist - minIndicatorDist) * progress;

          let angleToTarget = atan2(-dx, dz);

          let indicatorX = playerX - sin(angleToTarget) * indicatorDistance;
          let indicatorY = playerY;
          let indicatorZ = playerZ + cos(angleToTarget) * indicatorDistance;
          
          objectsToDraw.push(newTempObject(
            newCamera(indicatorX, indicatorY, indicatorZ, angleToTarget, 0),
            ARROW_MESH,
            cosmicNebulaColors[randomInt(0, 4)],
            1,
          ));

        }
      }
    }
    // #endregion

  } // End STATE_GAMEON.



  // #region Maion menu
  if (programState === STATE_MAINMENU) {
    // Camera setup.
    playerCamera = newCamera(0, 0, 0, 0, 0);
    viewCamera = newCamera(0, 0, -31, 0, 0);

    // Rotate sphere.
    sphere._camera.yaw += .0011;
    sphere._camera.pitch -= .0013;
    
    // Ship drift.
    let shipCam = introShip._camera;

    let driftSpeed = 0.3;
    let driftMagnitude = 0.15;

    introShipDriftCounterX += driftSpeed * dt;
    introShipDriftCounterY += driftSpeed * dt;

    shipCam.x = INTROSHIP_ORIGIN_X + sin(introShipDriftCounterX) * driftMagnitude;
    shipCam.y = INTROSHIP_ORIGIN_Y + cos(introShipDriftCounterY) * driftMagnitude;

    // Recalculate yaw and pitch to always face the origin (0,0,0)
    let dx = 0 - shipCam.x;
    let dz = 0 - shipCam.z; // Z is constant at -27
    shipCam.yaw = atan2(-dx, dz);
    
    let dy = 0 - shipCam.y;
    let horizontalDist = sqrt(dx * dx + dz * dz);
    
    shipCam.pitch = atan2(dy, horizontalDist);

    updateAndDrawStars();

    objectsToDraw = [sphere, introShip];

  }
  // #endregion

  // IMPORTANT: The following code is executed in ALL program states.

  updateParticles();

  // #region Draw UI.

  // Overlay the UI.
  if (activeMenu) { // Draw the active menu.

    if (notifying) {
      // log('notifying')
      if ((notifyCounter -= dt) < 0) {
        notifying = 0;
        gameMenu[6]._visible = 0;
        gameMenu[7]._visible = 0;
        gameMenu[8]._visible = 0;
      }
    }

    if (activeMenu === gameOverMenu) {

      // Animate camera up to y=5 over 2 seconds.
      gameOverAnimTimer = min(2, gameOverAnimTimer + dt); // Increment timer, cap at 2s.
      let p = gameOverAnimTimer / 2; // Progress (0 to 1).
      let t = 1 - p;
      playerCamera.y = 5 * (1 - t * t * t); // Apply ease: 1 - (1-p)^3.

      gameOverMenu[0]._textColor = ['f00f', COLOR_ORANGE, COLOR_YELLOW, '0f0f', '0fff', '000f', COLOR_WHITE][randomInt(0, 6)];
    }

    for (let control of activeMenu) {

      if (control._visible) { // Only draw visible controls.

        let type = control._type;

        if (type < UI_LABEL) { // Control is a button.
          addHexButton(control);

        } else  if (type < UI_RECT) { // Control is a label.
          addLabel(control);

        } else  if (type < UI_FRAME) { // Control is a label.
          addRect(control.x, control.y, control.w, control.h, control._color, UI_LAYER);

        } else  {//if (type < UI_MESH) { // Control is a frame.
          let l = control.x;
          let t = control.y;
          let r = l + control.w;
          let b = t + control.h;
          addLine(l, t, r, t, control._color, UI_LAYER);
          addLine(r, t, r, b, control._color, UI_LAYER);
          addLine(l, b, r, b, control._color, UI_LAYER);
          addLine(l, b, l, t, control._color, UI_LAYER);

        }
      }
    }
  }
  // #endregion

  // if (activeMenu === helpMenu) {

  //   let newMesh = (x, y, z, _meshIndex, _color) => ({
  //     _camera: newCamera(x, y, z, 0, 0),
  //     _meshIndex,
  //     _color,
  //   })

  //   objectsToDraw = [
  //     newMesh(-9, 6, -6, TYPE_PYRA, 'f0ff'),
  //     newMesh(-3, 6, -6, TYPE_PYRA, 'f0ff'),
  //     newMesh( 3, 6, -6, TYPE_PYRA, 'f0ff'),
  //     newMesh( 9, 6, -6, TYPE_PYRA, 'f0ff'),

  //     newMesh(-9,   0, -6, TYPE_CARGO, 'f0ff'),
  //     newMesh(-4.5, 0, -6, TYPE_CARGO, 'f0ff'),
  //     newMesh( 0,   0, -6, TYPE_CARGO, 'f0ff'),
  //     newMesh(4.5,  0, -6, TYPE_CARGO, 'f0ff'),
  //     newMesh(  9,  0, -6, TYPE_CARGO, 'f0ff'),

  //     newMesh(-9,   -3, -6, TYPE_CARGO, 'f0ff'),
  //     newMesh(-4.5, -3, -6, TYPE_CARGO, 'f0ff'),
  //     newMesh( 0,   -3, -6, TYPE_CARGO, 'f0ff'),
  //     newMesh(4.5,  -3, -6, TYPE_CARGO, 'f0ff'),
  //     newMesh(  9,  -3, -6, TYPE_CARGO, 'f0ff'),

  //     newMesh(-9,   -6, -6, TYPE_CARGO, 'f0ff'),
  //     newMesh(-4.5, -6, -6, TYPE_CARGO, 'f0ff'),
  //     newMesh( 0,   -6, -6, TYPE_CARGO, 'f0ff'),
  //     newMesh(4.5,  -6, -6, TYPE_CARGO, 'f0ff'),
  //     newMesh(  9,  -6, -6, TYPE_CARGO, 'f0ff'),

  //   ];


  // }


  drawGameObjects(); // Queue lines, rectangles, and meshes dor rendering.

  render(); // Render everything!

  //beginclip
  let lines = lineCount[0] + lineCount[0] + lineCount[0];
  let triangles = triangleCount[0] + triangleCount[0] + triangleCount[0];
  linesLabel.innerHTML = `lines:${lines}`;
  trianglesLabel.innerHTML = `triangles:${triangles}`;


  if (fpsTime >= 1.0) {
    fps = M.round(frameCount / fpsTime);
    frameCount = 0;
    fpsTime = 0;
  }
  
  fpsLabel.innerHTML = `fps:${fps}`;
  //endclip

}

// #region Init

// When page loaded, initialize program.
onload = e => {

  // Window resize event handler. Scale and center game content.
  onresize = e => {
    C.style.transform = 'scale(' + min(innerWidth / WIDTH, innerHeight / HEIGHT) + ')'; // Scale.
    C.style.left = ((innerWidth - C.getBoundingClientRect().width) / 2 | 0) + 'px'; // Center.
  }
  onresize();

  (!(OPTIONS = localStorage.getItem(NAMESPACE))) ? resetOptions() : OPTIONS = JSON.parse(OPTIONS); // Load optisons , creating new options if not found.

  // Update option menu buttons.
  for (let i = 6; i--;) {
    if (i === 5) {
      updateOptionsButton(5, OPTIONS.a ? 'ON' : 'OFF');
    } else {
      updateOptionsButton(i, OPTIONS.c[i].k);
    }
  }

  updateHighscoreLabels();

  // 
  // Decode meshes.
  // 

  let decodeValues = [-.6, -.3, 0, .3, .6]; // Vertex positions.

  // IMPORTANT: Meshes with more than 88 edges will be problematic.
  let encodeValues = '';
  for(i = 40; i < 127; i++) encodeValues += String.fromCharCode(i); // ()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~

  // Decode meshes.
  for (let i = 0; i < encodedMeshes.length;) {
    objectMeshes.push([...encodedMeshes[i++]].map(char => decodeValues[encodeValues.indexOf(char)])); // Decode vertices.
    objectMeshes.push([...encodedMeshes[i++]].map(char => encodeValues.indexOf(char))); // Decode edges.
  }

  generateStars();

  generateTerrain(1);

  // 
  // Create the powerup objects.
  // 

  // Create shields.
  shields = [];
  for (let i = 5; i--;) {
    let shield = spawnObject(TYPE_SHIELD, 0, 0, newCamera(0, FLIGHT_HEIGHT, 0, 0, 0), 1);
    shield._orbitDistance = 4;
    shield._orbitAngle = PI2 / 5 * i;
    shield._orbitSpeed = 4;
    shield._size = .5;
    shields.push(shield);
  }

  // Create hornets.
  hornets = [];
  for (let i = 5; i--;) {
    let hornet = spawnObject(TYPE_HORNET, 0, 0, newCamera(0, FLIGHT_HEIGHT, 0, 0, 0), 1);
    hornet._size = .5;

    // Start at random points in the cycle.
    hornet._xCounter = random() * PI2; 
    hornet._zCounter = random() * PI2;

    // How fast the hornet rocks on each axis.
    hornet._xRockSpeed = 1.5 + random();
    hornet._zRockSpeed = 1.5 + random();

    // How FAR the hornet rocks on each axis (the magnitude of the swarm)
    hornet._xRockMagnitude = 0.5 + random();
    hornet._zRockMagnitude = 0.5 + random();

    hornets.push(hornet);
  }

  // Create wingmen.
  wingMen = [];
  for (let i = 2; i--;) {
    let wingman = spawnObject(TYPE_WINGMAN, 0, 0, newCamera(0, FLIGHT_HEIGHT, 0, 0, 0), 1);
    wingman._orbitDistance = 2;
    wingman._size = 1;
    wingMen.push(wingman);
  }

  // Create laser.
  laser = spawnObject(TYPE_LASER, 0, 0, newCamera(0, FLIGHT_HEIGHT, 0, 0, 0), 1);
  laser._orbitDistance = 1.25;
  laser._size = 1;
  laser._orbitSpeed = 4;

  // 
  // Encoded font code.
  // 

  // 
  // NOTE:  Using the encoded font as opposed to the unencoded font save only 14 bytes. Is it worth it?
  // 

  // Encode font.
  // let encodedFont = [];
  // for (let i = 0; i < fontDef.length; i++) {
  //   let charDef = fontDef[i];
  //   let encodedChar = '';
  //   for (let j = 0; j < charDef.length; j++) {
  //     let value = charDef[j];
  //     encodedChar += (value < 0) ? '9:;<=>?@A'[-value] : '012345678'[value];
  //   }
  //   encodedFont.push((encodedChar.length) ? encodedChar : 0);
  // }

  // Print encoed font.
  // let out = '';
  // let n = 32;
  // for (let i = 0; i < encodedFont.length; i++) {
  //   let encodedChar = encodedFont[i];
  //   if (encodedChar) {
  //     out += `'${encodedChar}', // ${String.fromCharCode(n + i)}.\n`;

  //   } else {
  //     out += `0, // ${String.fromCharCode(n + i)}.\n`;
  //   }
  // }

  let encodedFont = [
    0, //  .
    0, // !.
    0, // ".
    0, // #.
    0, // $.
    0, // %.
    0, // &.
    0, // '.
    0, // (.
    0, // ).
    0, // *.
    0, // +.
    0, // ,.
    0, // -.
    0, // ..
    '0880', // /.
    '0448844004', // 0.
    '134048A808', // 1.
    '0060826424060888', // 2.
    '00608264866808?424', // 3.
    '00022484A088', // 4.
    '80000464866808', // 5.
    '802002062868866404', // 6.
    '00808448', // 7.
    '2060826486682806240220;464', // 8.
    '086886826020022484', // 9.
    0, // :.
    0, // ;.
    0, // <.
    0, // =.
    0, // >.
    0, // ?.
    '002262808668280600', // @.
    '0804408488A404', // A.
    '0008688664826000?404', // B.
    '8040044888', // C.
    '004084480800', // D.
    '80000888A404', // E.
    '800008A404', // F.
    '804004488884', // G.
    '0008A404A088', // H.
    '0080=048A808', // I.
    '4080844804', // J.
    '0008A0826404A88664', // K.
    '000888', // L.
    '0800448088', // M.
    '08008880', // N.
    '0448844004', // O.
    '046482600008', // P.
    '0448844004>588', // Q.
    '08006082648688?404', // R.
    '8020022464866808', // S.
    '0080=048', // T.
    '0004488880', // U.
    '0004488480', // V.
    '0008448880', // W.
    '0088A008', // X.
    '004448=480', // Y.
    '00800888', // Z.
  ];

  // Decode font character definitions.
  let s = '012345678:;<=>?@A';
  fontDef = encodedFont.map(c =>
    c ? [...c].map(v => (i = s.indexOf(v)) < 9 ? i : 8 - i) : 0
  );


// Pre-calculate the increment-per-level for all scalable stats.
  // We'll store the increment back into the 'upper' bound's slot for efficiency.
  let scalingLevels = 10;
  
  // The starting indices for each [lower, upper] stat pair in the templates.
  let statIndices = [3, 5, 7, 9, 11]; // AtkRange, RoF, ProjSpeed, MoveSpeed, TurnSpeed.

  // Loop through the enemy templates that have scalable stats (Turi to Prowler, indices 0-5)
  for (let i = 0; i < 6; i++) {
    let template = objectTemplates[i];
    
    // For each stat, calculate (upper - lower) / levels and store it.
    for (let index of statIndices) {
      let lower = template[index];
      let upper = template[index + 1];
      template[index + 1] = (upper - lower) / scalingLevels;
    }
  }


  // let scalingLevels = 10;

  // // The loop needs to be for (i = 6; i--;) to process templates from index 5 down to 0.
  // for (i = 6; i--;) {
  //   let template = objectTemplates[i];

  //   // Attack Range (indices 3 & 4)
  //   template[4] = (template[4] - template[3]) / scalingLevels;

  //   // Accuracy (indices 5 & 6)
  //   template[6] = (template[6] - template[5]) / scalingLevels;

  //   // Rate of Fire (indices 7 & 8)
  //   template[8] = (template[8] - template[7]) / scalingLevels;

  //   // Projectile Speed (indices 9 & 10)
  //   template[10] = (template[10] - template[9]) / scalingLevels;

  //   // Movement Speed (indices 11 & 12)
  //   template[12] = (template[12] - template[11]) / scalingLevels;

  //   // Turn Speed (indices 13 & 14)
  //   template[14] = (template[14] - template[13]) / scalingLevels;
  // }














};

//beginclip
/**
 * Runs a simulation to show enemy counts for each level.
 * @param {number} maxLevel - The number of levels to simulate.
 */
function runSpawnSimulation(maxLevel = 40) {

  // Loop from Level 1 up to the maxLevel.
  for (let level = 0; level < maxLevel; level++) {
    
    let turiCount, botaCount, dartCount, triaCount, prowlerCount;

    // --- LOGIC ---
    // For the first 4 levels (indices 0-3), we use the hardcoded data.
    if (level < 4) {
      [turiCount, botaCount, dartCount, triaCount, prowlerCount] = levelData[level];
    
    // For all subsequent levels, we scale the data from the 4th level (index 3).
    } else {
      // These are the base numbers we will be scaling up.
      let [baseTuri, baseBota, baseDart, baseTria, baseProwler] = levelData[3];

      // --- Define the parameters for our scaling calculation ---
      let scalingStartLevel = 4;   // Scaling begins at level index 4 (the 5th level)
      let scalingEndLevel = 14;    // Scaling reaches its maximum at level index 14 (the 15th level)
      let maxTuriTarget = 50;      // The desired Turi count at the end of scaling.

      // Calculate the total multiplier needed to get from the base Turi count to the max.
      // e.g., to get from 20 to 50, the total multiplier is 50 / 20 = 2.5
      let totalMultiplier = maxTuriTarget / baseTuri; 
      
      // The range of the multiplier is from 1.0 (no change) up to the total.
      // e.g., 2.5 - 1.0 = 1.5
      let multiplierRange = totalMultiplier - 1.0;
      
      // Determine how far we are through the scaling phase (a value from 0.0 to 1.0).
      // We use clamp to ensure that any level past scalingEndLevel is treated as 100% progress.
      let scalingProgress = clamp((level - scalingStartLevel) / (scalingEndLevel - scalingStartLevel), 0, 1);

      // The "magic number" starts at 1.0 and increases based on our progress.
      let magicNumber = 1.0 + (multiplierRange * scalingProgress);

      // Apply the multiplier to the base numbers and convert to integers.
      turiCount    = (baseTuri * magicNumber) | 0;
      botaCount    = (baseBota * magicNumber) | 0;
      dartCount    = (baseDart * magicNumber) | 0;
      triaCount    = (baseTria * magicNumber) | 0;
      prowlerCount = (baseProwler * magicNumber) | 0;
    }

    // --- OUTPUT ---
    // Using `level + 1` to make the log more human-readable (Level 1, not Level 0).
    log(`Level ${level + 1}: Turi: ${turiCount}, Bota: ${botaCount}, Dart: ${dartCount}, Tria: ${triaCount}, Prowler: ${prowlerCount}`);
  }
}

// runSpawnSimulation();

//endclip

//beginclip
toggleGodModeButton.onclick = e => {
    if (programState === STATE_GAMEON) {
      godMode = !godMode; notify(`GODMODE ${godMode ? 'ENABLED' : 'DISABLED'}` ); 
  }
  log(bigString);
}

nextLevelButton.onclick = e => { 
  if (programState === STATE_GAMEON) {
    catsRescued = liveCats; checkLevelComplete();
  }
}

wingmenButton.onclick = e => { 
  if (programState === STATE_GAMEON) {
    for (let wingman of wingMen) wingman._enabled = 1;
  }
}

shieldsButton.onclick = e => {
  if (programState === STATE_GAMEON) {
    enableShields(1);
  }
}

LaserButton.onclick = e => {
  if (programState === STATE_GAMEON) {
    hasLaser = 1;
    laserTarget = 0;
    beamCount = 9;
    laser._color = laserColors[beamCount]; } 
  }

HornetsButton.onclick = e => {
  if (programState === STATE_GAMEON) {
    for (let hornet of hornets) hornet._enabled = 1;
  }
}
//endclip

// #endregion