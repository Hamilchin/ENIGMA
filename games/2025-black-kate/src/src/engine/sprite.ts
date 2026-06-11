import { images } from "../resources/images";
import { drawImage } from "../utils/browser";
import { mathRound } from "../utils/math";

export interface Sprite {
    image_: number,
    x?: number,
    y?: number,
    flipX_?: boolean,
    flipY_?: boolean,
    scaleY_?: number,
}

export const drawSprite = (context: CanvasRenderingContext2D, sprite: Sprite) => {
    if (sprite.image_ == -1) return;

    context.save();

    const image = images[sprite.image_];

    let a = 1;
    let b = 0;
    let c = 0;
    let d = sprite.scaleY_ || 1;

    let tx = mathRound(sprite.x || 0);
    let ty = mathRound(sprite.y || 0);

    if (sprite.flipX_) {
        a = -1;
        tx += image.width;
    }

    if (sprite.flipY_) {
        d = -1;
        ty += image.height;
    }

    context.transform(a, b, c, d, tx, ty);

    drawImage(context, image, 0, 0);

    context.restore();
}

export const drawSprites = (context: CanvasRenderingContext2D, sprites: Array<Sprite>) => {
    for (const sprite of sprites) {
        drawSprite(context, sprite);
    }
}