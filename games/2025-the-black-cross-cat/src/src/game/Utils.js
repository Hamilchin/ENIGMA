import { tolerance } from './data';

export function getCollisionCircle(obj) {
   const cx = obj.x + obj.width / 2;
   const cy = obj.y + obj.height / 2;
   const base = Math.min(obj.width, obj.height);
   const radius = base * tolerance;
   return { cx, cy, radius };
}

export function checkCollision(a, b) {
   const ca = getCollisionCircle(a, tolerance);
   const cb = getCollisionCircle(b, tolerance);

   const dx = ca.cx - cb.cx;
   const dy = ca.cy - cb.cy;
   const dist = Math.sqrt(dx * dx + dy * dy);

   return dist < ca.radius + cb.radius;
}

export function drawCollisionCircle(ctx, obj, color = 'rgba(255,0,0,0.3)') {
   const c = getCollisionCircle(obj, tolerance);

   ctx.beginPath();
   ctx.arc(c.cx, c.cy, c.radius, 0, Math.PI * 2);
   ctx.fillStyle = color;
   ctx.fill();
   ctx.strokeStyle = color.replace('0.3', '1');
   ctx.stroke();
}

export function drawPixelNumber(ctx, num, x, y, scale = 4, color = 'white') {
   const PIXEL_DIGITS = {
      0: [
         [1, 1, 1, 1, 1],
         [1, 0, 0, 0, 1],
         [1, 0, 0, 0, 1],
         [1, 0, 0, 0, 1],
         [1, 1, 1, 1, 1],
      ],
      1: [
         [0, 0, 1, 0, 0],
         [0, 1, 1, 0, 0],
         [1, 0, 1, 0, 0],
         [0, 0, 1, 0, 0],
         [1, 1, 1, 1, 1],
      ],
      2: [
         [1, 1, 1, 1, 1],
         [0, 0, 0, 0, 1],
         [1, 1, 1, 1, 1],
         [1, 0, 0, 0, 0],
         [1, 1, 1, 1, 1],
      ],
      3: [
         [1, 1, 1, 1, 1],
         [0, 0, 0, 0, 1],
         [0, 1, 1, 1, 1],
         [0, 0, 0, 0, 1],
         [1, 1, 1, 1, 1],
      ],
      4: [
         [1, 0, 0, 1, 0],
         [1, 0, 0, 1, 0],
         [1, 1, 1, 1, 1],
         [0, 0, 0, 1, 0],
         [0, 0, 0, 1, 0],
      ],
      5: [
         [1, 1, 1, 1, 1],
         [1, 0, 0, 0, 0],
         [1, 1, 1, 1, 1],
         [0, 0, 0, 0, 1],
         [1, 1, 1, 1, 1],
      ],
      6: [
         [1, 1, 1, 1, 1],
         [1, 0, 0, 0, 0],
         [1, 1, 1, 1, 1],
         [1, 0, 0, 0, 1],
         [1, 1, 1, 1, 1],
      ],
      7: [
         [1, 1, 1, 1, 1],
         [0, 0, 0, 0, 1],
         [0, 0, 0, 1, 0],
         [0, 0, 1, 0, 0],
         [0, 1, 0, 0, 0],
      ],
      8: [
         [1, 1, 1, 1, 1],
         [1, 0, 0, 0, 1],
         [1, 1, 1, 1, 1],
         [1, 0, 0, 0, 1],
         [1, 1, 1, 1, 1],
      ],
      9: [
         [1, 1, 1, 1, 1],
         [1, 0, 0, 0, 1],
         [1, 1, 1, 1, 1],
         [0, 0, 0, 0, 1],
         [1, 1, 1, 1, 1],
      ],
   };

   ctx.fillStyle = color;
   let offsetX = x;
   for (let char of num.toString()) {
      let grid = PIXEL_DIGITS[char];
      for (let row = 0; row < grid.length; row++) {
         for (let col = 0; col < grid[row].length; col++) {
            if (grid[row][col]) {
               ctx.fillRect(offsetX + col * scale, y + row * scale, scale, scale);
            }
         }
      }
      offsetX += (grid[0].length + 1) * scale;
   }
}

export function drawPixelHeart(ctx, x, y, scale = 4, color = 'red') {
   // 0/1 matrix representing the heart (1 = pixel lit)
   const heart = [
      [0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
   ];

   ctx.fillStyle = color;

   for (let row = 0; row < heart.length; row++) {
      for (let col = 0; col < heart[row].length; col++) {
         if (heart[row][col]) {
            ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
         }
      }
   }
}

export function drawPenaltyCloud(ctx, x, y, color) {
   const pixel = 4;

   ctx.save();
   ctx.translate(x, y);

   // --- cloud pixel art ---
   ctx.fillStyle = '#333';
   ctx.fillRect(-5 * pixel, -2 * pixel, 10 * pixel, 4 * pixel);
   ctx.fillRect(-3 * pixel, -3 * pixel, 6 * pixel, pixel);
   ctx.fillRect(2 * pixel, -3 * pixel, 2 * pixel, pixel);
   ctx.fillRect(-4 * pixel, -3 * pixel, 2 * pixel, pixel);
   ctx.fillRect(-6 * pixel, -1 * pixel, pixel, 2 * pixel);
   ctx.fillRect(5 * pixel, -1 * pixel, pixel, 2 * pixel);
   ctx.fillRect(-3 * pixel, 2 * pixel, 6 * pixel, pixel);

   // --- lightning ---
   ctx.fillStyle = color;
   ctx.fillRect(-1 * pixel, -1 * pixel, pixel, pixel);
   ctx.fillRect(0, -1 * pixel, pixel, pixel);
   ctx.fillRect(0, 0, pixel, pixel);
   ctx.fillRect(1 * pixel, 0, pixel, pixel);
   ctx.fillRect(1 * pixel, 1 * pixel, pixel, pixel);
   ctx.fillRect(0, 1 * pixel, pixel, pixel);
   ctx.fillRect(0, 2 * pixel, pixel, pixel);

   ctx.restore();
}
