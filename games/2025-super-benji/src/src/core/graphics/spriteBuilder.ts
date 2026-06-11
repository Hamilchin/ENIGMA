import {
  AVATAR_BODY_HEIGHT,
  AVATAR_BODY_WIDTH,
  SPRITE_BASE64,
} from "../config";
import { CanvasBuffer } from "./canvasBuffer";
import { PaletteApplier } from "./palletteApplier";

export class SpriteBuilder {
  sheet!: HTMLImageElement;

  async init() {
    const img = new Image();
    img.src = SPRITE_BASE64;

    return new Promise<SpriteBuilder>((resolve) => {
      img.onload = async () => {
        this.sheet = img;
        resolve(this);
      };
    });
  }

  // Abstracted to save space..
  async createSprite(
    palette: string[],
    width: number,
    height: number,
    posX: number,
    posY: number
  ) {
    // scale the sprite x2 it's intrinsic size
    const buffer = new CanvasBuffer(width * 2, height * 2);

    buffer.drawSprite(this.sheet, 0, 0, posX, posY, width, height);

    return SpriteBuilder.applyPalette(buffer, palette);
  }

  async createAvatar(
    palette: string[],
    width: number,
    height: number,
    posX: number,
    posY: number
  ) {
    const buffer = new CanvasBuffer(
      width * 2,
      (height + AVATAR_BODY_HEIGHT) * 2
    );

    // Head
    buffer.drawSprite(this.sheet, 0, 0, posX, posY, width, height);

    // Body
    buffer.drawSprite(
      this.sheet,
      1,
      height * 2,
      47,
      64,
      AVATAR_BODY_WIDTH,
      AVATAR_BODY_HEIGHT
    );

    return SpriteBuilder.applyPalette(buffer, palette);
  }

  private static async applyPalette(
    buffer: CanvasBuffer,
    palette: string[]
  ): Promise<HTMLImageElement> {
    const sprite = await PaletteApplier.applyPalette(buffer.toImage(), palette);

    // Ensure the sprite is fully loaded so we get the correct dimensions
    await sprite.decode();

    return sprite;
  }
}
