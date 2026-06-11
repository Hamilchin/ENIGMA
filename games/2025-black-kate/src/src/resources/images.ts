import { createCanvas, getContext } from "../utils/browser";
import { cloneCanvas, filterImage, noise } from "../utils/image";
import { mathRandom, mathRound } from "../utils/math";

export const images: HTMLCanvasElement[] = [];

const coloredImages: { [key: string]: number } = {};
const noisedImages: { [key: number]: boolean } = {};

export const addImage = (image: HTMLCanvasElement): number => {
    const id = images.length;
    images.push(image);
    return id;
}

export const getColoredImage = (id: number, color: number): number => {
    if (id == -1) return -1;

    const key = `${id}_${color}`;
    if (!coloredImages[key]) {
        const a = (color >> 24) & 0xff;
        const r = (color >> 16) & 0xff;
        const g = (color >> 8) & 0xff;
        const b = color & 0xff;

        const coloredImage = cloneCanvas(images[id]);

        filterImage(coloredImage, (color) => {
            color[0] = r;
            color[1] = g;
            color[2] = b;
            if (color[3]) {
                color[3] = a;
            }
        });

        coloredImages[key] = addImage(coloredImage);
    }

    return coloredImages[key];
}

export const addNoiseToImage = (image: number, value: number = 10) => {
    if (!noisedImages[image]) {
        const source = images[image];
        noise(value, source);
    }
}