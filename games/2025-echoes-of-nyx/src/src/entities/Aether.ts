import { FPS, getGridRealWidth } from '../config';
import PlayerEntity from './PlayerEntity';

const pauseTime = FPS * 1.5;
export class Aether extends PlayerEntity {
  counter: number = 0;

  constructor(x: number = 0, y: number = 1, isStartLeft: boolean = false) {
    super(x, y, !isStartLeft);
    this.width = 1.8;
    this.height = 1.8;
    this.isRunning = true;
    this.catSet = 1;
  }

  isInXLimit() {
    return this.offsets.x < getGridRealWidth() && this.x + this.width > 0;
  }

  mirrorUpdate(x: number) {
    if (this.counter < pauseTime) {
      this.counter++;
      if (this.counter === pauseTime) {
        this.isLeft = !this.isLeft;
      }
    } else {
      super.update(x);
    }
  }
}
