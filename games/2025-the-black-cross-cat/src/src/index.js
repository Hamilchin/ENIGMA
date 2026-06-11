import { GameManager } from './game/GameManager.js';
//import bg from "./game/assets/bg.png";

// Initialize game
const canvas = document.getElementById('game');
const gameManager = new GameManager(canvas);

// Hide loading screen
//document.getElementById("loading").style.display = "none";
/* document.body.style.backgroundImage = `url(${bg})`;
document.body.style.backgroundSize = 'cover';
document.body.style.backgroundPosition = 'center'; */

// Game loop
let lastTime = 0;

function gameLoop(timestamp) {
   if (!lastTime) lastTime = timestamp;
   const deltaTime = (timestamp - lastTime) / 1000; // delta in secondi
   lastTime = timestamp;

   // Update game
   gameManager.update(deltaTime);

   // Render game
   gameManager.render(deltaTime);

   // Continue loop
   requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);
