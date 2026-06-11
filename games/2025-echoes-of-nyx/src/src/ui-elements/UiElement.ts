import { getGridRealHeight, getGridRealWidth, getSquareSize, uiSquareRatio } from '../config';
import { UiScene } from './Scene';

export abstract class UiElement {
  x: number;
  y: number;
  _size: number;
  height: number;
  width: number;
  onClick: Function = () => {};
  hovered: boolean;
  parent: UiElement | UiScene;
  loaded: boolean = false;
  centered: boolean[] = [false, false];
  inverted: number = -1;
  abstract needRender: boolean;

  set size(value: number) {
    this._size = value;
  }

  get size(): number {
    return Math.round((this._size * getSquareSize()) / uiSquareRatio);
  }

  constructor(x: number, y: number, size: number, centered: boolean[] = [false, false]) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.centered = centered;
  }

  setParent(parent: UiElement | UiScene) {
    this.parent = parent;
    this.centerElement();
  }

  centerElement() {
    if (!this.parent) return;
    const parenSize = this.parent.getRealSize() ?? { width: getGridRealWidth(), height: getGridRealHeight() };
    const buttonRealSize = this.getRealSize();
    this.height = buttonRealSize.height;
    this.width = buttonRealSize.width;
    if (this.centered[0]) {
      this.x = this.parent.x + Math.round((parenSize.width - this.width) / 2);
    }
    if (this.centered[1]) {
      this.y = this.parent.y + Math.round((parenSize.height - this.height) / 2);
    }
    this.needRender = true;
  }

  update() {
    this.parent?.update();
  }

  refresh() {
    this.parent?.refresh();
  }

  getRealSize() {
    return {
      width: 0,
      height: 0,
    };
  }

  render(ctx: CanvasRenderingContext2D, inverted: boolean) {
    if (inverted || this.inverted !== -1) {
      ctx.filter = `invert(${this.inverted})`;
    }
  }

  load() {
    this.loaded = true;
  }

  unload() {
    this.loaded = false;
  }
}
