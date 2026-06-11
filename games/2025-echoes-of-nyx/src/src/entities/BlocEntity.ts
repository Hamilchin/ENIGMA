import { backgroundShift } from '../background';
import { darkBackground, getGridRealHeight, getSquareSize, lightBackground } from '../config';
import Game from '../Game';
import { Coord } from '../utils';
import Entity from './Entity';

const getBlockMoveSpeed = () => Math.round(getSquareSize() / 8);
export default class BlocEntity extends Entity {
  initialisFilled: boolean;
  startX: number;
  _moveRangeX: number = 0;
  _moveRangeY: number = 0;
  currentMoveShiftX: number = 0;
  movingRight: boolean = true;

  movingTop: boolean = false;
  offsets: Coord = { x: 0, y: 0 };

  set x(value: number) {
    this._x = value;
  }

  get x(): number {
    return this._x * getSquareSize() + this.offsets.x;
  }

  set y(value: number) {
    this._y = value;
  }

  get y(): number {
    return this._y * getSquareSize() + this.offsets.y;
  }

  set moveRangeX(value: number) {
    this._moveRangeX = value;
  }

  get moveRangeX() {
    return (this._moveRangeX ?? 0) * getSquareSize();
  }

  set moveRangeY(value: number) {
    this._moveRangeY = value;
  }

  get moveRangeY() {
    return (this._moveRangeY ?? 0) * getSquareSize();
  }

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    isFilled: boolean,
    moveRangeX: number = 0,
    moveRangeY: number = 0,
  ) {
    super(x, y, width, height);
    this.startX = this.x;
    this.isFilled = isFilled;
    this.initialisFilled = isFilled;
    this.moveRangeY = moveRangeY;
    this.moveRangeX = moveRangeX;
    this.movingRight = moveRangeX > 0;
    this.movingTop = moveRangeY > 0;
  }

  reset() {
    this.isFilled = this.initialisFilled;
    this.offsets = { x: 0, y: 0 };
    this.currentMoveShiftX = 0;
  }

  update() {
    if (this.moveRangeX !== 0) {
      if (
        (this.moveRangeX > 0 && (this.offsets.x < 0 || this.offsets.x >= this.moveRangeX)) ||
        (this.moveRangeX < 0 && (this.offsets.x > 0 || this.offsets.x <= this.moveRangeX))
      ) {
        this.movingRight = !this.movingRight;
      }
      this.currentMoveShiftX = (this.movingRight ? 1 : -1) * getBlockMoveSpeed();
      this.offsets.x += this.currentMoveShiftX;
    }
    if (this.moveRangeY !== 0) {
      if (
        (this.moveRangeY > 0 && (this.offsets.y < 0 || this.offsets.y >= this.moveRangeY)) ||
        (this.moveRangeY < 0 && (this.offsets.y > 0 || this.offsets.y <= this.moveRangeY))
      ) {
        this.movingTop = !this.movingTop;
      }
      this.offsets.y += (this.movingTop ? 1 : -1) * getBlockMoveSpeed();
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();
    const emptyColor = Game.instance.currentLvl > backgroundShift ? `${darkBackground}10` : `${lightBackground}35`;
    const emptyBorderColor =
      Game.instance.currentLvl > backgroundShift ? `${darkBackground}20` : `${lightBackground}50`;
    ctx.fillStyle = this.isFilled ? darkBackground : emptyColor;
    ctx.strokeStyle = this.isFilled ? 'black' : emptyBorderColor;
    ctx.lineWidth = 2;

    if (!this.isFilled) {
      ctx.setLineDash([5]);
    }

    let corners: number | number[] = 4;
    if (this.y === 0) {
      corners = [4, 4, 0, 0];
    }
    const y = getGridRealHeight() - this.y - this.height;
    ctx.roundRect(this.x, y, this.width, this.height, corners);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    ctx.restore();
  }
}
