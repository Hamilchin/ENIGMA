import BlocEntity from './entities/BlocEntity';
import EndEntity from './entities/EndEntity';
import Entity from './entities/Entity';
import TreatEntity from './entities/TreatEntity';
import { Box, isCollidingWith } from './utils';

export default class Level {
  startX: number;
  startY: number;
  isStartLeft: boolean;
  name: string;
  mirrored: boolean;
  blocks: BlocEntity[];
  end: EndEntity;
  treat: TreatEntity;
  foundTreat: boolean = false;
  alreadyFoundTreat: boolean = false;
  treatFilled: boolean;

  constructor(
    name: string,
    startX: number,
    startY: number,
    isStartLeft: boolean = false,
    blocks: any[],
    mirrored: boolean,
    alreadyFoundTreat: boolean = false,
    treat?: any[],
    end?: number[],
  ) {
    this.name = name;
    this.startX = startX;
    this.startY = startY;
    this.isStartLeft = isStartLeft;
    this.mirrored = mirrored;
    this.alreadyFoundTreat = alreadyFoundTreat;
    this.blocks = blocks.map(
      ([x, y, width, height, isFilled, moveRangeX, moveRangeY]) =>
        new BlocEntity(x, y, width, height, isFilled, moveRangeX, moveRangeY),
    );
    if (treat) {
      this.treatFilled = treat[2] ?? true;
      this.treat = new TreatEntity(treat[0], treat[1], treat[2]);
    }
    if (end) {
      this.end = new EndEntity(end[0], end[1], this.blocks[this.blocks.length - 1].isFilled);
    }
  }

  reset(hasFoundTreat: boolean = false) {
    this.blocks.forEach((block) => block.reset());
    if (this.end) {
      this.end.isFilled = this.blocks[this.blocks.length - 1].isFilled;
    }
    this.foundTreat = hasFoundTreat;
    if (this.treat) {
      this.treat.isFilled = this.treatFilled;
    }
  }

  checkTreatGathering(hitBox: Box) {
    if (this.treat && !this.foundTreat) {
      const hasTreat = isCollidingWith(hitBox, this.treat);
      if (hasTreat) {
        this.foundTreat = true;
        return !this.alreadyFoundTreat;
      }
    }
    return false;
  }

  render(ctx: CanvasRenderingContext2D) {
    this.blocks.forEach((block) => block.render(ctx));
    if (this.treat && !this.foundTreat) {
      ctx.save();
      this.treat.render(ctx);
      ctx.restore();
    }
    this.end?.render(ctx);
  }

  invert() {
    this.blocks.forEach((block, index) => index !== 0 && (block.isFilled = !block.isFilled));
    if (this.end) {
      this.end.isFilled = !this.end.isFilled;
    }
    if (this.treat) {
      this.treat.isFilled = !this.treat.isFilled;
    }
  }
}
