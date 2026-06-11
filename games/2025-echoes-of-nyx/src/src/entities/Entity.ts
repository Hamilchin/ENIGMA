import { getSquareSize } from '../config';

export default class Entity {
  _x: number;
  _y: number;
  _width: number;
  _height: number;
  isFilled: boolean;

  set x(value: number) {
    this._x = value;
  }

  get x(): number {
    return Math.round(this._x * getSquareSize());
  }

  set y(value: number) {
    this._y = value;
  }

  get y(): number {
    return Math.round(this._y * getSquareSize());
  }

  set width(value: number) {
    this._width = value;
  }

  get width(): number {
    return Math.round(this._width * getSquareSize());
  }

  set height(value: number) {
    this._height = value;
  }

  get height(): number {
    return Math.round(this._height * getSquareSize());
  }

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}
