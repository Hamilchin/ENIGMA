import { penalties, penaltyColors, carWidth, carHeight } from './data';
export class Car {
   static image = null;
   static imageLoaded = false;
   constructor(gameState, x, y, imageSrc, width = 100, height = 50, targetX = 0, targetY = 0, i) {
      this.gameState = gameState;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;

      this.baseY = y;
      this.baseWidth = width;
      this.baseHeight = height;

      this.speed = 0;
      this.maxSpeed = 250;
      this.baseMaxSpeed = this.maxSpeed;
      this.acceleration = 800;
      this.friction = 600;

      this.targetX = targetX;
      this.targetY = targetY;
      this.isSafe = false; // become true when car arrives to finish line
      this.i = i;

      this.facingLeft = this.targetX < this.x;
      this.movingDirection = 0;

      this.penalty = null;
      this.penaltyTime = 0;

      this.lastHitTime = 0;
      this.hitCooldown = 0.5;

      this.particles = [];

      if (!Car.image) {
         Car.image = new Image();
         Car.image.src = imageSrc;
         Car.image.onload = () => (Car.imageLoaded = true);
      }

      this.knockback = null;
      this.lightningParticles = [];

      this.spriteWidth = carWidth; // frame width
      this.spriteHeight = carHeight; // frame height
      this.currentFrame = 0;
      this.frameCount = 2;
      this.frameTimer = 0;
      this.frameInterval = 0.2;

      this.reset();
   }

   reset() {
      this.isSafe = false;
   }

   applyPenalty(forcedPenalty = null) {
      if (forcedPenalty) {
         this.penalty = forcedPenalty;
         this.penaltyTime = 180;
         //if there's already a penalty remove it
         this.gameState.removePenalty(this.i);
         this.gameState.addPenalty(this.i, this.penalty);
      } else {
         const pIndex = Math.floor(Math.random() * penalties.length);

         if (this.penalty === penalties[pIndex]) {
            // if same penalty extend penalty timer
            this.penaltyTime += 120;
         } else {
            // new penalty
            this.penalty = penalties[pIndex];
            this.penaltyTime = 180;
            //if there's already a penalty remove it
            this.gameState.removePenalty(this.i);
            this.gameState.addPenalty(this.i, this.penalty);
         }
      }
   }

   runPenaltyEffect(_delta) {
      switch (this.penalty) {
         case 'invert':
            if (this.movingDirection === -1) this.movingDirection = 1;
            else if (this.movingDirection === 1) this.movingDirection = -1;
            break;
         case 'brake':
            if (Math.random() < 0.05) this.speed = 0;
            break;
         case 'badLuckCat':
            this.maxSpeed = 150;
            this.speed *= 0.5;
            break;
      }
   }

   resetPenalty() {
      this.penalty = null;
      this.width = this.baseWidth;
      this.height = this.baseHeight;
      this.maxSpeed = this.baseMaxSpeed;
      this.y = this.baseY + (this.baseHeight - this.height);
      this.gameState.removePenalty(this.i);
   }

   update(delta, movingDirection, minX, maxX) {
      if (this.isSafe) return;

      this.updateParticles(delta);
      this.updateLightningParticles(delta);
      //this.updateFrame(delta);

      this.movingDirection = 0;

      if (movingDirection === 'left') {
         this.movingDirection = -1;
      } else if (movingDirection === 'right') {
         this.movingDirection = 1;
      }

      if (this.penaltyTime > 0) {
         this.penaltyTime -= delta * 60;
         this.runPenaltyEffect(delta);
      } else {
         this.resetPenalty();
      }

      if (this.movingDirection !== 0) {
         // acceleration towards the desired direction
         this.speed += this.movingDirection * this.acceleration * delta;

         // limit speed
         if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
         if (this.speed < -this.maxSpeed) this.speed = -this.maxSpeed;
      } else {
         this.completeSpeedDeceleration(delta);
      }

      this.manageKnockback(delta);

      this.x += this.speed * delta;

      // target arrival control (only X for now)
      if (this.x <= this.targetX && this.x + this.width >= this.targetX) {
         this.resetPenalty();
         this.x = this.targetX - this.width / 2;
         this.isSafe = true;
         this.gameState.carIndexCompleted.push(this.i);
         this.gameState.score = this.gameState.score + 100 - (9 - this.gameState.catLives) * 4;
      }

      // canvas limits
      if (this.x < minX) {
         this.x = minX;
         this.speed = 0;
      }
      if (this.x + this.width > maxX) {
         this.x = maxX - this.width;
         this.speed = 0;
      }

      if (this.lastHitTime > 0) {
         this.lastHitTime -= delta;
      }
   }

   updateFrame(delta) {
      if (this.speed !== 0) {
         this.frameTimer += delta;
         if (this.frameTimer >= this.frameInterval) {
            this.frameTimer = 0;
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
         }
      } else {
         this.currentFrame = 0;
      }
   }

   manageKnockback(delta) {
      // handle knockback if active
      if (this.knockback) {
         this.knockback.progress += delta * 5;
         if (this.knockback.progress >= 1) {
            this.knockback.progress = 1;
         }

         // linear interpolation
         this.x = this.knockback.startX + (this.knockback.targetX - this.knockback.startX) * this.knockback.progress;

         if (this.knockback.progress === 1) {
            this.knockback = null;
         }
      }
   }

   completeSpeedDeceleration(delta) {
      if (this.speed > 0) {
         this.speed -= this.friction * delta;
         if (this.speed < 0) this.speed = 0;
      } else if (this.speed < 0) {
         this.speed += this.friction * delta;
         if (this.speed > 0) this.speed = 0;
      }
   }

   render(ctx) {
      if (Car.imageLoaded) {
         ctx.save();

         const sx = this.currentFrame * this.spriteWidth; // where to cut out X
         const sy = 0; // if the frames are in a horizontal row

         let bounceOffset = 0;
         if(this.speed !== 0) {
            bounceOffset = (Math.random() - 0.5) *  1.5;
         }

         if (this.facingLeft) {
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2 + bounceOffset);
            ctx.scale(-1, 1);
            ctx.drawImage(Car.image, sx, sy, this.spriteWidth, this.spriteHeight, -this.width / 2, -this.height / 2, this.width, this.height);
         } else {
            ctx.drawImage(Car.image, sx, sy, this.spriteWidth, this.spriteHeight, this.x, this.y + bounceOffset, this.width, this.height);
         }

         ctx.restore();

         this.renderPenaltyCloud(ctx);
         this.renderTarget(ctx);
         this.renderParticles(ctx);
      }
   }

   renderPenaltyCloud(ctx) {
      if (!this.penalty) return;

      const cloudX = Math.floor(this.x + this.width / 2);
      const baseY = Math.floor(this.y - 32);
      const pixel = 4;

      const t = Date.now() / 400;
      const floatOffset = Math.sin(t) * 2;

      ctx.save();
      ctx.translate(cloudX, baseY + floatOffset);

      // --- pixel art cloud ---
      ctx.fillStyle = '#333';
      ctx.fillRect(-5 * pixel, -2 * pixel, 10 * pixel, 4 * pixel);
      ctx.fillRect(-3 * pixel, -3 * pixel, 6 * pixel, pixel);
      ctx.fillRect(2 * pixel, -3 * pixel, 2 * pixel, pixel);
      ctx.fillRect(-4 * pixel, -3 * pixel, 2 * pixel, pixel);
      ctx.fillRect(-6 * pixel, -1 * pixel, pixel, 2 * pixel);
      ctx.fillRect(5 * pixel, -1 * pixel, pixel, 2 * pixel);
      ctx.fillRect(-3 * pixel, 2 * pixel, 6 * pixel, pixel);

      // --- flashing light ---
      const baseColor = penaltyColors[this.penalty] || 'yellow';

      const flash = Math.sin(Date.now() / 200) > 0 ? baseColor : 'yellow';
      ctx.fillStyle = flash;

      ctx.fillRect(-1 * pixel, -1 * pixel, pixel, pixel);
      ctx.fillRect(0, -1 * pixel, pixel, pixel);
      ctx.fillRect(0, 0, pixel, pixel);
      ctx.fillRect(1 * pixel, 0, pixel, pixel);
      ctx.fillRect(1 * pixel, 1 * pixel, pixel, pixel);
      ctx.fillRect(0, 1 * pixel, pixel, pixel);
      ctx.fillRect(0, 2 * pixel, pixel, pixel);

      // --- generates sparks ---
      if (Math.random() < 0.2) {
         this.lightningParticles.push({
            x: 0 + (Math.random() - 0.5) * 2,
            y: 3,
            dy: 0.5 + Math.random() * 1,
            life: 20 + Math.random() * 20,
            color: penaltyColors[this.penalty] || 'yellow',
         });
      }

      // --- draw sparks ---
      this.renderLightningParticles(ctx, 0, 0, pixel);

      ctx.restore();
   }

   setCarSpeed(value) {
      this.speed = value;
   }

   spawnExplosionParticles(x, y, width, height) {
      const particleCount = 60;

      for (let i = 0; i < particleCount; i++) {
         const angle = Math.random() * 2 * Math.PI;
         const speed = Math.random() * 1.5 + 0.5;
         const life = Math.random() * 40 + 40;

         this.particles.push({
            x: x + width / 2,
            y: y + height / 2,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            life: life,
            color: 'red',
            size: Math.random() * 3 + 2,
            drag: 0.92 + Math.random() * 0.03,
         });
      }
   }

   updateParticles(delta) {
      this.particles.forEach((p) => {
         p.x += p.dx * delta * 60;
         p.y += p.dy * delta * 60;

         p.dx *= p.drag;
         p.dy *= p.drag;

         p.life -= delta * 60;
      });

      this.particles = this.particles.filter((p) => p.life > 0);
   }

   renderParticles(ctx) {
      this.particles.forEach((p) => {
         ctx.globalAlpha = Math.max(0, p.life / 60);
         ctx.fillStyle = p.color;
         ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      });
      ctx.globalAlpha = 1;
   }

   updateLightningParticles(delta) {
      // update position and life
      this.lightningParticles.forEach((p) => {
         p.y += p.dy * delta * 60;
         p.life -= delta * 60;
      });

      // removed dead ones
      this.lightningParticles = this.lightningParticles.filter((p) => p.life > 0);
   }

   renderLightningParticles(ctx, originX, originY, pixel) {
      this.lightningParticles.forEach((p) => {
         ctx.fillStyle = p.color;
         ctx.fillRect(originX + p.x * pixel, originY + p.y * pixel, pixel, pixel);
      });
   }

   renderTarget(ctx) {
      if (this.isSafe) return;

      ctx.save();
      ctx.translate(this.targetX, this.targetY);

      const time = Date.now() / 200;

      // Checkered flag
      const squareSize = 6;
      const cols = 4,
         rows = 4; // griglia
      const flagWidth = cols * squareSize;
      const flagHeight = rows * squareSize;

      for (let row = 0; row < rows; row++) {
         for (let col = 0; col < cols; col++) {
            ctx.fillStyle = (row + col) % 2 === 0 ? '#fff' : '#000';

            //"fluttering" effect
            const waveOffset = Math.sin(time + row * 0.5 + col * 0.3) * 3;

            ctx.fillRect(-flagWidth / 2 + col * squareSize + waveOffset, -flagHeight / 2 + row * squareSize, squareSize, squareSize);
         }
      }

      ctx.restore();
   }

   onCarHitsCat(x, y, width, height) {
      if (this.lastHitTime > 0) return;
      this.gameState.catLives--;

      this.applyPenalty();
      this.spawnExplosionParticles(x, y, width, height);

      // bouncing direction
      const offset = this.facingLeft ? width : -width;

      this.knockback = {
         startX: this.x,
         targetX: this.x + offset,
         progress: 0,
      };

      this.lastHitTime = this.hitCooldown;
   }

   //TODO
   /* isCatCrossingInFront(cat) {
      if (!cat) return false;
      if (cat.hasBeenHit) return false;
      if (!cat.path || cat.path.length < 2) return false;

      const carFront = this.facingLeft ? this.x : this.x + this.width;
   } */

   isAtFinish() {
      return this.isSafe;
   }
}
