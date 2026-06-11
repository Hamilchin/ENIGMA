import { carWidth, debug, catWidth, catHeight } from './data';

export class BlackCat {
   static image = null;
   static imageLoaded = false;
   constructor(gameState, x, y, imageSrc, width, height, index, path = null) {
      this.gameState = gameState;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.index = index;

      this.speed = this.gameState.getCatSpeed(); // px/sec

      // TODO defined path
      // If there is a default path, use that, otherwise stay random
      this.path = path;
      this.currentWaypoint = 0;
      this.forwardPath = null;

      this.vx = 0;
      this.vy = 0;

      if (!BlackCat.image) {
         BlackCat.image = new Image();
         BlackCat.image.src = imageSrc;
         BlackCat.image.onload = () => (BlackCat.imageLoaded = true);
      }
      this.hasBeenHit = false;
      this.hitTimer = 0;
      this.resurrectionProgress = 0;

      this.bloodSplashes = [];

      this.facingLeft = false;
      this.directionTimer = 0;

      this.spriteWidth = catWidth;
      this.spriteHeight = catHeight;
      this.currentFrame = 0;
      this.frameCount = 2;
      this.frameTimer = 0;
      this.frameInterval = 0.2;
   }

   hit() {
      if (!this.hasBeenHit) {
         this.hasBeenHit = true;
         this.hitTimer = 2; // 2 sec paused
         this.createHitBloodSplashes();
      }
   }

   createHitBloodSplashes() {
      for (let i = 0; i < 25; i++) {
         const angle = Math.random() * 2 * Math.PI;
         const speed = Math.random() * 120 + 60;
         this.bloodSplashes.push({
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0.4 + Math.random() * 0.3,
            size: Math.floor(Math.random() * 3) + 2,
         });
      }
   }

   updateBloodSplashes(delta) {
      this.bloodSplashes = this.bloodSplashes.filter((p) => {
         p.x += p.vx * delta;
         p.y += p.vy * delta;
         p.life -= delta;
         return p.life > 0;
      });
   }

   renderBloodSplashes(ctx) {
      ctx.fillStyle = 'rgba(180,0,0,0.9)';
      this.bloodSplashes.forEach((p) => {
         ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      });
   }

   update(delta, canvasWidth, canvasHeight) {
      this.updateBloodSplashes(delta);
      //this.updateFrame(delta);

      if (this.hasBeenHit) {
         this.resurrectionProgress += delta / 2;
         if (this.resurrectionProgress > 1) this.resurrectionProgress = 1;
         this.hitTimer -= delta;
         if (this.hitTimer <= 0) {
            this.hasBeenHit = false;
            this.resurrectionProgress = 0;
         } else {
            return;
         }
      }

      //TODO in the future enable followpath?
      /* if (this.path && this.path.length > 0) {
      this.followPath(delta);
    } else {
      this.randomMove(delta, canvasWidth, canvasHeight);
    } */

      this.randomMove(delta, canvasWidth, canvasHeight);
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

   getRandomMoveArea(canvasWidth, canvasHeight, padding) {
      // internal canvas rectangle in which the cat must remain
      const minX = padding;
      const minY = 0;
      const maxX = canvasWidth - padding - this.width;
      const maxY = canvasHeight;
      return { minX, minY, maxX, maxY };
   }

   randomMove(delta, canvasWidth, canvasHeight, padding = carWidth) {
      const { minX, minY, maxX, maxY } = this.getRandomMoveArea(canvasWidth, canvasHeight, padding);

      // timer for cat change direction
      this.directionTimer -= delta;
      if (this.directionTimer <= 0) {
         // new direction
         const currAngle = Math.atan2(this.vy, this.vx) || 0;
         const offset = Math.random() - 0.5;
         let angle = currAngle + offset;

         // towards less explored areas (moves away from the current center)
         const dx = (this.x - canvasWidth / 2) / canvasWidth;
         const dy = (this.y - canvasHeight / 2) / canvasHeight;
         angle = Math.atan2(-dy + (Math.random() - 0.5), -dx + (Math.random() - 0.5));

         this.vx = Math.cos(angle) * this.speed;
         this.vy = Math.sin(angle) * this.speed;
         this.directionTimer = 2 + Math.random() * 4; // changes direction every 2–6s
      }

      this.x += this.vx * delta;
      this.y += this.vy * delta;

      // check boundaries and bounce randomly
      if (this.x < minX) {
         this.x = minX;
         this.vx *= -1 + (Math.random() - 0.5) * 0.5;
      }
      if (this.x > maxX) {
         this.x = maxX;
         this.vx *= -1 + (Math.random() - 0.5) * 0.5;
      }
      if (this.y < minY) {
         this.y = minY;
         this.vy *= -1 + (Math.random() - 0.5) * 0.5;
      }
      if (this.y + this.height > maxY) {
         this.y = maxY - this.height;
         this.vy *= -1 + (Math.random() - 0.5) * 0.5;
      }

      this.facingLeft = this.vx < 0;
   }

   /* followPath(delta) {
    const target = this.path[this.currentWaypoint];

    if (this.x !== target.x) {
      const dirX = target.x > this.x ? 1 : -1;
      this.facingLeft = dirX < 0; // aggiorna direzione
      const moveX = dirX * this.speed * delta;
      if (Math.abs(moveX) > Math.abs(target.x - this.x)) {
        this.x = target.x;
      } else {
        this.x += moveX;
      }
    } else if (this.y !== target.y) {
      const dirY = target.y > this.y ? 1 : -1;
      const moveY = dirY * this.speed * delta;
      if (Math.abs(moveY) > Math.abs(target.y - this.y)) {
        this.y = target.y;
      } else {
        this.y += moveY;
      }
    } else {
      if (this.forwardPath) {
        this.currentWaypoint++;
        if (this.currentWaypoint >= this.path.length) {
          this.currentWaypoint = this.path.length - 2;
          this.forwardPath = false;
        }
      } else {
        this.currentWaypoint--;
        if (this.currentWaypoint < 0) {
          this.currentWaypoint = 1;
          this.forwardPath = true;
        }
      }
    }
  } */

   checkCollision(car) {
      return !car.isSafe && this.x < car.x + car.width && this.x + this.width > car.x && this.y < car.y + car.height && this.y + this.height > car.y;
   }

   render(ctx) {
      if (!BlackCat.imageLoaded) return;
      this.renderBloodSplashes(ctx);
      if (debug) {
         const { minX, minY, maxX, maxY } = this.getRandomMoveArea(800, 600, carWidth);
         ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
         ctx.lineWidth = 2;
         ctx.strokeRect(minX, minY, maxX, maxY);
      }

      // if frames
      const sx = this.currentFrame * this.spriteWidth;
      const sy = 0;

      if (this.hasBeenHit && this.resurrectionProgress < 1) {
         // Draw a pool of blood
         ctx.fillStyle = 'rgba(180, 0, 0, 0.8)';
         ctx.beginPath();
         ctx.ellipse(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width / 2,
            this.height / 3,
            Math.random() * 0.2 - 0.1, // random rotation to boil effect
            0,
            2 * Math.PI
         );
         ctx.fill();

         for (let i = 0; i < 3; i++) {
            const offsetX = (Math.random() - 0.5) * this.width * 0.6;
            const offsetY = (Math.random() - 0.5) * this.height * 0.6;
            const radiusX = Math.random() * this.width * 0.15 + 2;
            const radiusY = Math.random() * this.height * 0.1 + 2;

            ctx.beginPath();
            ctx.ellipse(this.x + this.width / 2 + offsetX, this.y + this.height / 2 + offsetY, radiusX, radiusY, 0, 0, 2 * Math.PI);
            ctx.fill();
         }

         // ---- Draw a cat emerging from the center of the puddle with movement ----
         ctx.save();

         const centerY = this.y + this.height / 2;
         const riseDistance = this.height / 2;
         const bounce = Math.sin(this.resurrectionProgress * Math.PI) * 0.2;

         const clipHeight = riseDistance * this.resurrectionProgress * (1 + bounce);
         ctx.beginPath();
         ctx.rect(this.x, centerY - clipHeight, this.width, clipHeight);
         ctx.clip();

         const offsetY = riseDistance * (1 - this.resurrectionProgress) * (1 - bounce);
         ctx.drawImage(BlackCat.image, sx, sy, this.spriteWidth, this.spriteHeight, this.x, this.y + offsetY, this.width, this.height);

         ctx.restore();
      } else {
         ctx.save();
         if (this.facingLeft) {
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.scale(-1, 1);
            ctx.drawImage(BlackCat.image, sx, sy, this.spriteWidth, this.spriteHeight, -this.width / 2, -this.height / 2, this.width, this.height);
         } else {
            ctx.drawImage(BlackCat.image, sx, sy, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
         }
         ctx.restore();
      }
   }
}
