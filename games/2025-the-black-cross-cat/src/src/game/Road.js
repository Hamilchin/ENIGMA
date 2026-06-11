export class Road {
   constructor(gameState, index, totalRoads, canvasWidth, canvasHeight, carHeight) {
      this.gameState = gameState;
      this.index = index;
      this.totalRoads = totalRoads;
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.carHeight = carHeight;
      this.selected = false;
      this.completed = false;
      this.height = this.canvasHeight / this.totalRoads;
      this.y = Math.floor(this.index * this.height);

      // Calculating the vertical position (center of the lane)
      this.carY = (canvasHeight / totalRoads) * index + canvasHeight / totalRoads / 2 - carHeight / 2;

      this.createDirtyPixel();
   }

   getCarY() {
      return this.carY;
   }

   getRoadCenter() {
      const roadHeight = this.canvasHeight / this.totalRoads;
      const y = Math.floor(this.index * roadHeight);
      return y + roadHeight / 2;
   }

   setSelected(isSelected) {
      this.selected = isSelected;
   }

   setCompleted(value) {
      this.completed = value;
   }

   createDirtyPixel() {
      this.dirtPixels = [];
      const roadHeight = Math.floor(this.canvasHeight / this.totalRoads);
      const numSpots = 80;
      for (let i = 0; i < numSpots; i++) {
         this.dirtPixels.push({
            x: Math.floor(Math.random() * this.canvasWidth),
            y: Math.floor(Math.random() * roadHeight),
            color: Math.random() > 0.5 ? '#636161ff' : '#888686ff',
         });
      }
   }

   render(context) {
      const roadHeight = Math.floor(this.canvasHeight / this.totalRoads);
      const y = Math.floor(this.index * roadHeight);

      // asphalt
      let baseColor = this.index % 2 === 0 ? '#202020' : '#252525';
      let fillStyle = this.selected ? '#6793a9ff' : baseColor;
      if (this.completed) fillStyle = '#094b07ff';

      context.fillStyle = fillStyle;
      context.fillRect(0, y, this.canvasWidth, roadHeight);

      // Pixelated dirt
      if (!this.completed) {
         for (const spot of this.dirtPixels) {
            context.fillStyle = spot.color;
            context.fillRect(spot.x, y + spot.y, 2, 2);
         }
      }

      // Blocky central line of the road
      context.fillStyle = this.completed ? '#ffffff' : '#f5e663';
      const dashWidth = 20;
      const dashGap = 15;
      const lineY = y + Math.floor(roadHeight / 2) - 1;
      for (let x = 0; x < this.canvasWidth; x += dashWidth + dashGap) {
         context.fillRect(x, lineY, dashWidth, 3);
      }
   }
}
