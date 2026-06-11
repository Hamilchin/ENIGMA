export class GameState {
   constructor() {
      this.currentState = 'menu'; // menu, plot, playing, gameOver, levelComplete, gameWin
      this.level = 1;
      this.score = 0;
      this.catLives = 9;
      this.playerLives = 1;
      this.carIndexCompleted = [];
      this.activePenalties = [];
   }

   setState(newState) {
      this.currentState = newState;
   }

   isState(state) {
      return this.currentState === state;
   }

   addPenalty(index, penalty) {
      this.activePenalties.push({
         id: index,
         penalty: penalty,
      });
      //console.log(this.activePenalties)
   }

   removePenalty(index) {
      this.activePenalties = this.activePenalties.filter((element) => element.id !== index);
   }

   nextLevel() {
      this.level++;
      this.setState('playing');
   }

   resetLevel() {
      this.setState('playing');
   }

   gameOver() {
      this.setState('gameOver');
   }

   loseLife() {
      this.playerLives--;
      if (this.playerLives <= 0) {
         this.gameOver();
      }
   }

   getRoadsCount() {
      return this.level <= 3 ? this.level + 1 : this.level;
   }

   getCatSpeed() {
      const plusSpeed = this.level < 2 ? this.level * 10 : this.level * 20;
      return 100 + plusSpeed;
   }
}
