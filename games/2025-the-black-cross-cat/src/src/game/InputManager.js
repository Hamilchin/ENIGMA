export class InputManager {
   constructor(gameState) {
      this.gameState = gameState;
      this.selectedCarIndex = 0;
      this.keys = {};
      this.setupEventListeners();
   }

   setupEventListeners() {
      document.addEventListener('keydown', (e) => {
         this.keys[e.code] = true;
         this.handleKeyDown(e.code);
      });

      document.addEventListener('keyup', (e) => {
         this.keys[e.code] = false;
         this.lastMoveDirection = null;
      });
   }

   handleKeyDown(keyCode) {
      if (this.gameState.isState('playing')) {
         switch (keyCode) {
            case 'ArrowUp':
               this.selectPreviousCar();
               break;
            case 'ArrowDown':
               this.selectNextCar();
               break;
            case 'ArrowLeft':
               this.moveSelectedCarLeft();
               break;
            case 'ArrowRight':
               this.moveSelectedCarRight();
               break;
         }
      }
   }

   selectPreviousCar() {
      let newIndex = this.selectedCarIndex - 1;

      while (newIndex >= 0) {
         // if it is NOT completed, we select it and exit
         if (!this.gameState.carIndexCompleted.includes(newIndex)) {
            this.selectedCarIndex = newIndex;
            return;
         }
         // otherwise keep scrolling back
         newIndex--;
      }
   }

   selectNextCar() {
      const maxCars = this.gameState.getRoadsCount();

      let newIndex = this.selectedCarIndex + 1;

      while (newIndex < maxCars) {
         // if it is NOT completed, we select it and exit
         if (!this.gameState.carIndexCompleted.includes(newIndex)) {
            this.selectedCarIndex = newIndex;
            return;
         }
         // otherwise keep scrolling forward
         newIndex++;
      }
   }

   moveSelectedCarLeft() {
      this.lastMoveDirection = 'left';
   }

   moveSelectedCarRight() {
      this.lastMoveDirection = 'right';
   }

   getSelectedCarIndex() {
      return this.selectedCarIndex;
   }

   getLastMoveDirection() {
      return this.lastMoveDirection;
   }

   isKeyPressed(keyCode) {
      return this.keys[keyCode] || false;
   }
}
