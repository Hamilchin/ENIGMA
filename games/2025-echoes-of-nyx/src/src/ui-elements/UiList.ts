import { getSquareSize, uiSquareRatio } from '../config';
import { UiScene } from './Scene';
import { UiElement } from './UiElement';

export class UiList extends UiElement {
  elements: UiElement[] = [];
  direction: string;
  _gap: number;
  _needRender: boolean;

  constructor(
    x: number | Function,
    y: number | Function,
    centered: boolean[] = [false, false],
    direction: string = 'column',
    gap: number = 30,
  ) {
    super(typeof x === 'function' ? x() : x, typeof y === 'function' ? y() : y, 0, centered);
    this.direction = direction;
    this.gap = gap;
  }

  set gap(value: number) {
    this._gap = value;
  }

  get gap(): number {
    return Math.round((this._gap * getSquareSize()) / uiSquareRatio);
  }

  get needRender(): boolean {
    return this._needRender;
  }

  set needRender(value: boolean) {
    this._needRender = true;
    this.elements.forEach((element) => {
      element.needRender = value;
    });
  }

  getRealSize() {
    const spacings = (this.elements.length - 1) * this.gap;
    return {
      width:
        this.direction === 'row'
          ? this.elements.reduce((h, e) => h + e.getRealSize().width, 0) + spacings
          : Math.max(...this.elements.map((e) => e.getRealSize().width), 0),
      height:
        this.direction === 'column'
          ? this.elements.reduce((h, e) => h + e.getRealSize().height, 0) + spacings
          : Math.max(...this.elements.map((e) => e.getRealSize().height), 0),
    };
  }

  load() {
    this.loaded = true;
    this.elements.forEach((element) => {
      element.load();
    });
  }

  unload() {
    this.loaded = false;
    this.elements.forEach((element) => {
      element.unload();
    });
  }

  centerElement() {
    super.centerElement();
    this.updateElements();
  }

  setParent(parent: UiElement | UiScene) {
    super.setParent(parent);
    this.centerElement();
  }

  updateElements() {
    this.elements.reduce((offset, element) => {
      if (this.direction === 'column') {
        element.y = this.y + offset;
        element.x = this.x;
        offset += element.getRealSize().height + this.gap;
      } else if (this.direction === 'row') {
        element.x = this.x + offset;
        element.y = this.y;
        offset += element.getRealSize().width + this.gap;
      }
      return offset;
    }, 0);
    this.elements.forEach((e) => e.centerElement());
  }

  add(...elements: UiElement[]) {
    for (const element of elements) {
      element.setParent(this);
      if (this.loaded) {
        element.load();
      }
      this.elements.push(element);
    }
    this.updateElements();
  }

  render(ctx: CanvasRenderingContext2D, inverted: boolean) {
    ctx.save();
    super.render(ctx, inverted);
    this.elements.forEach((element) => {
      ctx.save();
      element.render(ctx, inverted || this.inverted === 1);
      ctx.restore();
    });
    ctx.restore();
  }
}
