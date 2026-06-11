import { GameState } from './GameState.js';
import { BlackCat } from './Cat.js';
import { Car } from './Car.js';
import { InputManager } from './InputManager.js';
import { Road } from './Road.js';
import { levelsNumberCat, carWidth, carHeight, catHeight, catWidth, debug, penaltyColors } from './data.js';
import { startContinuousMusic, stopContinuousMusic } from './Music.js';
import { checkCollision, drawCollisionCircle, drawPixelNumber, drawPixelHeart, drawPenaltyCloud } from './Utils.js';
import carImage from './assets/car.png';
import catImage from './assets/cat.png';

export class GameManager {
   constructor(canvas) {
      this.canvas = canvas;
      this.context = canvas.getContext('2d');
      this.context.imageSmoothingEnabled = false;

      this.fps = 0;
      this.frameCount = 0;
      this.fpsTimer = 0;

      this.gameState = new GameState();

      this.inputManager = new InputManager(this.gameState);

      this.setupEventListeners();

      this.roads = [];
      this.cars = [];
      this.cats = [];

      window.gameManager = this;

      this.levelCompleteEffect = { active: false, timer: 0, duration: 2000 };
      this.winEffect = { active: false, timer: 0, duration: 4000 };

      this.musicGamePlaying = false;

      this.carImage = new Image();
      this.carImage.src = carImage;

      this.catImage = new Image();
      this.catImage.src = catImage;

      this.plotShown = false;
   }

   initializeRoadsAndCars() {
      if (this.cars.length > 0) {
         this.cars = [];
      }

      const roadsCount = this.gameState.getRoadsCount();
      for (let i = 0; i < roadsCount; i++) {
         const road = new Road(this.gameState, i, roadsCount, this.canvas.width, this.canvas.height, carHeight);
         this.roads.push(road);

         const startOnLeft = Math.random() < 0.5;
         const x = startOnLeft ? 0 : this.canvas.width - carWidth;
         const y = road.getCarY();
         // target: opposite end for now
         const targetX = startOnLeft ? this.canvas.width - carWidth / 2 : carWidth / 2;
         const targetY = road.getRoadCenter();
         this.cars.push(new Car(this.gameState, x, y, carImage, carWidth, carHeight, targetX, targetY, i));
      }
   }

   initializeBlackCats() {
      const numberOfCatsByLevel = levelsNumberCat[this.gameState.level - 1] || 2;
      for (let i = 0; i < numberOfCatsByLevel; i++) {
         const { startX, startY } = this.calculateCatRandomPosition();
         const cat = new BlackCat(this.gameState, startX, startY, catImage, catWidth, catHeight, i);
         this.cats.push(cat);
      }
   }

   calculateCatRandomPosition() {
      const padding = catWidth;
      const minX = padding;
      const minY = padding;
      const maxX = this.canvas.width - padding - catWidth;
      const maxY = this.canvas.height - padding - catHeight;

      const startX = Math.random() * (maxX - minX) + minX;
      const startY = Math.random() * (maxY - minY) + minY;

      return { startX, startY };
   }

   setupEventListeners() {
      document.addEventListener('keydown', (e) => {
         if (e.code === 'Space') {
            if (this.gameState.isState('menu')) {
               if (!this.plotShown) {
                  this.startPlot();
               } else {
                  this.startGame();
               }
            } else if (this.gameState.isState('plot')) {
               this.startGame(); // dallo stato plot vai al gioco
            } else if (this.gameState.isState('gameOver') || this.gameState.isState('gameWin')) {
               this.restartGame();
            }
         }
      });

      document.addEventListener('click', () => {
         if (this.gameState.isState('menu')) {
            if (!this.plotShown) {
               this.startPlot();
            } else {
               this.startGame();
            }
         } else if (this.gameState.isState('plot')) {
            this.startGame();
         } else if (this.gameState.isState('gameOver') || this.gameState.isState('gameWin')) {
            this.restartGame();
         }
      });
   }

   startPlot() {
      this.gameState.setState('plot');
      this.plotShown = true;
   }

   startGame() {
      this.gameState.setState('playing');
      this.resetLevel();
   }

   restartGame() {
      this.gameState = new GameState();
      this.inputManager = new InputManager(this.gameState);
      this.startGame();
   }

   resetLevel() {
      this.inputManager.selectedCarIndex = Math.floor(Math.random() * this.gameState.level);
      this.gameState.carIndexCompleted = [];
      this.cars = [];
      this.roads = [];
      this.cats = [];
      this.initializeBlackCats();
      this.initializeRoadsAndCars();
      if (!this.musicGamePlaying) {
         startContinuousMusic();
         this.musicGamePlaying = true;
      }
   }

   nextLevel() {
      this.gameState.nextLevel();

      if (this.gameState.level > 9) {
         this.gameState.setState('gameWin');
         this.winEffect = { active: true, timer: 0, duration: 4000 };

         this.levelCompleteEffect.active = false;
         if (this.musicGamePlaying) {
            stopContinuousMusic();
            this.musicGamePlaying = false;
         }
         return;
      }

      this.resetLevel();
      this.levelCompleteEffect.active = true;
      this.levelCompleteEffect.timer = 0;
      this.gameState.catLives = 9;
   }

   update(deltaTime) {
      if (this.gameState.isState('playing')) {
         if (this.gameState.catLives === 0) {
            this.gameState.setState('gameOver');
         }
         // Check level completion
         this.checkLevelCompletion();
      }

      // Update effects
      this.updateEffects(deltaTime);
   }

   updateEffects(deltaTime) {
      // Level complete effect
      if (this.levelCompleteEffect.active) {
         this.levelCompleteEffect.timer += deltaTime * 1000;
         if (this.levelCompleteEffect.timer >= this.levelCompleteEffect.duration) {
            this.levelCompleteEffect.active = false;
         }
      }

      // Win effect
      if (this.winEffect.active) {
         this.winEffect.timer += deltaTime * 1000;
         if (this.winEffect.timer >= this.winEffect.duration) {
            this.winEffect.active = false;
         }
      }
   }

   checkLevelCompletion() {
      const allCarsFinished = this.cars.length > 0 && this.cars.every((car) => car.isAtFinish());
      if (allCarsFinished) {
         this.nextLevel();
      }
   }

   render(deltaTime) {
      // Clear canvas
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.fillStyle = '#1a1a1a';
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

      if (this.gameState.isState('menu')) {
         this.renderMenu();
      } else if (this.gameState.isState('plot')) {
         this.renderPlot();
      } else if (this.gameState.isState('playing')) {
         this.renderGame(deltaTime);
      } else if (this.gameState.isState('gameOver')) {
         this.renderGameOver();
      } else if (this.gameState.isState('gameWin')) {
         this.renderGameWin();
      }
   }

   renderMenu() {
      const centerX = this.canvas.width / 2;

      const spacing = 20;

      const totalWidth = carWidth * 2 + spacing;
      const startX = centerX - totalWidth / 2;
      const y = 60;

      this.context.drawImage(this.carImage, startX, y + 40, carWidth, carHeight);

      this.context.drawImage(this.catImage, startX + catWidth + spacing, y, catWidth, catHeight);

      this.context.fillStyle = '#ffffff';
      this.context.font = '32px Trebuchet MS';
      this.context.textAlign = 'center';
      this.context.fillText('THE BLACK CROSSCAT', this.canvas.width / 2, this.canvas.height / 2 - 50);

      this.context.font = '20px Trebuchet MS';
      this.context.fillText('Press SPACE or Click to start', this.canvas.width / 2, this.canvas.height / 2);

      this.context.font = '14px Trebuchet MS';
      this.context.fillText('Use ARROWS to control cars and avoid the black cat!', this.canvas.width / 2, this.canvas.height / 2 + 30);

      // Show controls
      this.context.font = '16px Trebuchet MS';
      this.context.fillText('Controls: ↑↓ Select Car | ←→ Move Car', this.canvas.width / 2, this.canvas.height / 2 + 60);

      this.renderMenuPenalties();
   }

   renderPlot() {
      // 👇 Placeholder — qui ci scriverai la tua storiella
      this.context.fillStyle = '#ffffff';
      this.context.font = '18px Trebuchet MS';
      this.context.textAlign = 'center';
      this.context.fillText(
         'An ancient belief holds that if a black cat crosses your path, you will be marked by bad luck.',
         this.canvas.width / 2,
         this.canvas.height / 2 - 20
      );
      this.context.fillText('So be careful to get to the end of the road without hitting the black cat,', this.canvas.width / 2, this.canvas.height / 2);
      this.context.fillText(' who like an outlaw crosses the road on his dirt bike!', this.canvas.width / 2, this.canvas.height / 2 + 20);
      this.context.font = '16px Trebuchet MS';
      this.context.fillText('Press SPACE or Click to start', this.canvas.width / 2, this.canvas.height / 2 + 80);
   }

   renderMenuPenalties() {
      // --- Legenda ---
      this.context.font = '14px Trebuchet MS';
      this.context.textAlign = 'left';

      let startY = this.canvas.height / 2 + 100;
      let lineHeight = 40;

      const title = '⚡ Penalty Colors:';
      const titleWidth = this.context.measureText(title).width;
      const startX = this.canvas.width / 2 - titleWidth / 2;

      this.context.fillStyle = 'white';
      this.context.fillText(title, startX, startY);

      const cloudWidth = 40;
      const spacing = 10;

      const entries = Object.entries(penaltyColors);

      entries.forEach(([penalty, color], index) => {
         const y = startY + (index + 1) * lineHeight;

         drawPenaltyCloud(this.context, startX + cloudWidth / 2, y - 10, color);

         this.context.fillStyle = '#ffffff';
         this.context.textAlign = 'left';
         this.context.fillText(penalty, startX + cloudWidth + spacing, y);
      });

      this.context.textAlign = 'center';
   }

   renderGame(deltaTime) {
      this.roads.forEach((road, index) => {
         // Highlight selected car
         road.setSelected(index === this.inputManager.getSelectedCarIndex());
         const isRoadCompleted =
            this.gameState.carIndexCompleted.length > 0 &&
            this.gameState.carIndexCompleted.find((i) => {
               return i === index;
            }) !== undefined;
         road.setCompleted(isRoadCompleted);
         road.render(this.context);
      });

      if (this.cats.length > 0) {
         this.cats.forEach((cat) => {
            cat.update(deltaTime, this.canvas.width, this.canvas.height);
            cat.render(this.context);
            if (debug) {
               drawCollisionCircle(this.context, cat, 'rgba(0,0,255,0.3)');
            }
         });
      }

      //this.handleCarUpdate(deltaTime);

      this.cars.forEach((car, index) => {
         let direction = null;
         if (index === this.inputManager.getSelectedCarIndex()) {
            direction = this.inputManager.getLastMoveDirection();
         }
         if (!car || car.isAtFinish()) return;
         car.update(deltaTime, direction, 0, this.canvas.width);
         car.render(this.context);

         if (debug) {
            drawCollisionCircle(this.context, car, 'rgba(255,0,0,0.3)');
         }

         if (!car.isSafe) {
            this.cats.forEach((cat) => {
               if (cat && !cat.hasBeenHit && cat.resurrectionProgress === 0 && checkCollision(car, cat)) {
                  cat.hit();
                  car.onCarHitsCat(cat.x, cat.y, cat.width, cat.height);
               }
            });
         }

         //TODO in the future?
         /* if (car.isCatCrossingInFront(cat, road)) {
        car.applyPenalty"badLuckCat");
      } */
      });

      // Render level complete effect
      if (this.levelCompleteEffect.active) {
         this.renderLevelCompleteEffect();
      }

      // Render UI
      this.renderUI(deltaTime);
   }

   renderLevelCompleteEffect() {
      const alpha = 1 - this.levelCompleteEffect.timer / this.levelCompleteEffect.duration;
      this.context.fillStyle = `rgba(0, 255, 0, ${alpha * 0.5})`;
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      this.context.font = '48px Trebuchet MS';
      this.context.textAlign = 'center';
      this.context.fillText('LEVEL COMPLETE!', this.canvas.width / 2, this.canvas.height / 2);
   }

   renderUI(deltaTime) {
      this.context.fillStyle = '#ffffff';
      this.context.font = '16px Trebuchet MS';
      this.context.textAlign = 'left';

      this.context.fillStyle = 'white';
      this.context.fillText('Level', 14, 28); // titolo
      drawPixelNumber(this.context, this.gameState.level, 60, 14, 3, 'lime');

      this.context.fillStyle = 'white';
      this.context.fillText(`Score ${this.gameState.score}`, 100, 28);

      for (let i = 0; i < this.gameState.catLives; i++) {
         drawPixelHeart(this.context, 260 + i * 30, 10, 5);
      }

      if (debug) {
         this.context.fillStyle = 'white';
         this.context.fillText(`Canvas: ${this.canvas.width}x${this.canvas.height}`, 10, 125);
         // Show selected car
         this.context.fillText(`Selected Car: ${this.inputManager.getSelectedCarIndex() + 1}`, 10, 145);
      }
      if (debug) {
         this.calcFps(deltaTime);

         this.context.font = '16px Trebuchet MS';
         this.context.fillStyle = 'white';
         this.context.fillText(`FPS: ${this.fps}`, 10, 165);
      }
   }

   calcFps(deltaTime) {
      this.frameCount++;
      this.fpsTimer += deltaTime;
      if (this.fpsTimer >= 1) {
         // update every second
         this.fps = Math.round(this.frameCount / this.fpsTimer);
         this.frameCount = 0;
         this.fpsTimer = 0;
      }
   }

   renderGameOver() {
      this.context.fillStyle = '#ffffff';
      this.context.font = '32px Trebuchet MS';
      this.context.textAlign = 'center';
      this.context.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);

      this.context.font = '20px Trebuchet MS';
      this.context.fillText(`Final Score: ${this.gameState.score}`, this.canvas.width / 2, this.canvas.height / 2);
      this.context.fillText('Press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 40);
      if (this.musicGamePlaying) {
         stopContinuousMusic();
         this.musicGamePlaying = false;
      }
   }

   renderGameWin() {
      if (this.winEffect?.active) {
         const alpha = 1 - this.winEffect.timer / this.winEffect.duration;
         this.context.fillStyle = `rgba(0, 255, 0, ${alpha * 0.6})`;
         this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
      this.context.fillStyle = '#ffffff';
      this.context.font = '32px Trebuchet MS';
      this.context.textAlign = 'center';
      this.context.fillText('YOU WIN!', this.canvas.width / 2, this.canvas.height / 2 - 50);

      this.context.font = '20px Trebuchet MS';
      this.context.fillText(`Final Score: ${this.gameState.score}`, this.canvas.width / 2, this.canvas.height / 2);

      this.context.fillText('Press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 40);
   }
}
