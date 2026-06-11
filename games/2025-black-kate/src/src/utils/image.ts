import { images } from "../resources/images";
import { createCanvas, drawImage, getContext } from "./browser";
import { mathCeil, mathRandom, randomChancesSelect, randomSelect } from "./math";
import { createGradient } from "./pattern";

export const generateRandomTileImage = (width: number, height: number, ids: Array<number>, chances: Array<number>): HTMLCanvasElement => {
    const canvas = createCanvas();
    const context = getContext(canvas);

    let image = images[ids[0]];

    canvas.width = width;
    canvas.height = height;

    const sx = mathCeil(width / image.width);
    const sy = mathCeil(height / image.height);

    for (let x = 0; x < sx; x++) {
        for (let y = 0; y < sy; y++) {
            image = images[randomChancesSelect(ids, chances)];
            context.drawImage(image, x * image.width, y * image.height);
        }
    }

    return canvas;
}

export const generateTileImage = (width: number, height: number, imageId: number): HTMLCanvasElement => {
    const canvas = createCanvas();
    const context = getContext(canvas);

    canvas.width = width;
    canvas.height = height;

    const image = images[imageId];

    const sx = mathCeil(width / image.width);
    const sy = mathCeil(height / image.height);

    for (let x = 0; x < sx; x++) {
        for (let y = 0; y < sy; y++) {
            context.drawImage(image, x * image.width, y * image.height);
        }
    }

    return canvas;
}

export const drawCommands = (commands: Array<number>, context: CanvasRenderingContext2D) => {
    for (let i = 0; i < commands.length; i += 3) {
        const id = commands[i];
        const x = commands[i + 1];
        const y = commands[i + 2];
        const image = images[id];
        drawImage(context, image, x, y);
    }
}

export const drawGradientV = (context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, startColor: number, endColor: number) => {
    context.fillStyle = createGradient(context, x, y, x, y + height, startColor, endColor);
    context.fillRect(x, y, width, height);
}

export const drawGradientH = (context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, startColor: number, endColor: number) => {
    context.fillStyle = createGradient(context, x, y, x + width, y, startColor, endColor);
    context.fillRect(x, y, width, height);
}

export const filterImage = (canvas: HTMLCanvasElement, filter: (color: Uint8ClampedArray) => void) => {
    const context = getContext(canvas);
    const width = canvas.width;
    const height = canvas.height;

    const imageData = context.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    let i = 0;

    while (i < pixels.length) {
        const pixel = pixels.slice(i, i + 4);

        filter(pixel);

        pixels.set(pixel, i);

        i += 4;
    }

    context.putImageData(imageData, 0, 0);
}

export const cloneCanvas = (source: HTMLCanvasElement): HTMLCanvasElement => {
    var target = createCanvas();
    var context = getContext(target);
    target.width = source.width;
    target.height = source.height;
    context.drawImage(source, 0, 0);
    return target;
}

export const getPallette = (canvas: HTMLCanvasElement): Array<number> => {
    const pallette: Array<number> = [];

    filterImage(canvas, (pixel) => {
        const color = pixelToColor(pixel);
        if (pallette.indexOf(color) == -1) {
            pallette.push(color);
        }
    });

    return pallette;
}

export const applyPallette = (canvas: HTMLCanvasElement, sourcePallette: Array<number>, targetPallette: Array<number>) => {
    filterImage(canvas, (pixel) => {
        const sourceColor = pixelToColor(pixel);

        const index = sourcePallette.indexOf(sourceColor);

        if (index != -1) {
            const targetColor = targetPallette[index];

            colorToPixel(targetColor, pixel);
        }
    });
}

export const applyShadow = (canvas: HTMLCanvasElement) => {
    const context = getContext(canvas);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let x = 1; x < canvas.width - 1; x++) {
        for (let y = 1; y < canvas.height - 1; y++) {
            const i = (y * canvas.width + x) * 4;
            const pixel = data.slice(i, i + 4);

            const l = (y * canvas.width + x - 1) * 4;
            const left = data.slice(l, l + 4);

            const r = (y * canvas.width + x + 1) * 4;
            const right = data.slice(r, r + 4);

            if (pixel[3] != 0 && left[3] == 0) {
                pixel[0] *= 0.5;
                pixel[1] *= 0.5;
                pixel[2] *= 0.5;
                data.set(pixel, i);
            } else if (pixel[3] != 0 && right[3] == 0) {
                pixel[0] *= 0.9;
                pixel[1] *= 0.9;
                pixel[2] *= 0.9;
                data.set(pixel, i);
            }
        }
    }

    context.putImageData(imageData, 0, 0);
}

const u32 = new Uint32Array(1);

export const pixelToColor = (pixel: Uint8ClampedArray): number => {
    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];
    const a = pixel[3];

    u32[0] = (a << 24) | (r << 16) | (g << 8) | b;

    return u32[0];
}

export const colorToPixel = (color: number, pixel: Uint8ClampedArray) => {
    const a = (color >> 24) & 0xff;
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;

    pixel[0] = r;
    pixel[1] = g;
    pixel[2] = b;
    pixel[3] = a;
}

export const noise = (offset: number, canvas: HTMLCanvasElement) => {
    const context = getContext(canvas);
    const offset2 = offset / 2;
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let i = 0;
    while (i < data.length) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        data[i] = r - offset2 + offset * mathRandom();
        data[i + 1] = g - offset2 + offset * mathRandom();
        data[i + 2] = b - offset2 + offset * mathRandom();
        i += 4;
    }
    context.putImageData(imageData, 0, 0);
}