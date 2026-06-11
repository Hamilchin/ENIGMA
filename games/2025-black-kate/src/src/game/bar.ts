import { Item } from "../engine/item";
import { drawSprite, drawSprites } from "../engine/sprite";
import { Stage } from "../engine/stage";
import { barBigItems0, barFloor0, barFloor1, barFloor2, barFloor3, barItem0, barItem1, barWall0, barWall1, barWall10, barWall2, barWall3, barWall4, barWall5, barWall6, barWall7, barWall8, barWall9, bottle0, bottle1, bottle2, bottle3, bottle4, bottle5, trash0, trash1, trash2, trash3, trash4 } from "../resources/id";
import { addImage, addNoiseToImage, getColoredImage, images } from "../resources/images";
import { createCanvas, drawImage, getContext } from "../utils/browser"
import { drawCommands, drawGradientV, generateRandomTileImage, generateTileImage, noise } from "../utils/image";
import { chance, mathRound, randomChancesSelect, randomRange, randomSelect } from "../utils/math";
import { randomMobConfig } from "./mob";

export const getBarStage = (): Stage => {
    const floorWidth = 400;
    const floorHeight = 150;
    const wallHeight = 95;

    addNoiseToImage(bottle0, 20);
    addNoiseToImage(bottle1, 20);
    addNoiseToImage(bottle2, 20);
    addNoiseToImage(bottle3, 20);
    addNoiseToImage(bottle4, 20);
    addNoiseToImage(bottle5, 20);

    const floorCanvas = generateFloorImage(floorWidth, floorHeight);
    const wallCanvas = generateWallImage(floorWidth, wallHeight);

    const backCanvas = createCanvas();
    const backContext = getContext(backCanvas);
    backCanvas.width = floorWidth;
    backCanvas.height = floorHeight + wallHeight;
    drawImage(backContext, wallCanvas, 0, 0);
    drawImage(backContext, floorCanvas, 0, wallHeight);

    const back = addImage(backCanvas);

    const borderX = 10;
    const borderY = 5;

    addNoiseToImage(barItem0);

    const items: Array<Item> = [];

    for (let i = 0; i < 10; i++) {
        addBarCounter(items, 90 + i * 21, 120);
    }

    addBarCounter(items, 84, 114);
    addBarCounter(items, 273, 114);

    addNoiseToImage(barItem1);

    for (let i = 0; i < 10; i++) {
        addBarStool(items, 100 + i * 20, 130);
    }

    addNoiseToImage(barBigItems0);

    for (let i = 0; i < 6; i++) {
        addTableArmchair(items, 80 + i * 45, 240);
    }

    return {
        bounds_: {
            x: borderX,
            y: wallHeight + borderY,
            w: floorWidth - borderX * 2,
            h: floorHeight - borderY * 2,
        },
        back_: { image_: back },
        camera_: { x: 0, y: 0 },
        items_: items
    }
}

const addBarCounter = (items: Array<Item>, x: number, y: number) => {
    items.push(
        {
            sprite_: { image_: barItem0 },
            position_: { x, y },
            offset_: { x: 16, y: 32 },
            bounds_: { x: -16, y: -10, w: 32, h: 12 }
        },
    );

    if (chance(0.5)) {
        items.push(
            {
                sprite_: { image_: randomSelect([bottle0, bottle1, bottle2, bottle3, bottle4, bottle5]) },
                position_: { x: x, y: y },
                offset_: { x: 4 + randomRange(-1, 1), y: 16 + 25 + randomRange(-1, 1) },
                bounds_: { x: 0, y: 0, w: 0, h: 0 },
            },
        )
    }

    if (chance(0.5)) {
        items.push(
            {
                sprite_: { image_: randomSelect([bottle0, bottle1, bottle2, bottle3, bottle4, bottle5]) },
                position_: { x: x, y: y },
                offset_: { x: 0 + randomRange(-1, 1), y: 16 + 27 + randomRange(-1, 1) },
                bounds_: { x: 0, y: 0, w: 0, h: 0 },
            },
        )
    }
}

const addBarStool = (items: Array<Item>, x: number, y: number) => {
    items.push(
        {
            sprite_: { image_: barItem1 },
            position_: { x, y },
            offset_: { x: 16, y: 32 },
            bounds_: { x: -6, y: -7, w: 12, h: 10 },
        },
    );
}

const addTableArmchair = (items: Array<Item>, x: number, y: number) => {
    items.push(
        {
            sprite_: { image_: barBigItems0 },
            position_: { x, y },
            offset_: { x: 32, y: 64 },
            bounds_: { x: -34, y: -22, w: 68, h: 25 },
        },
    );

    if (chance(0.9)) {
        const config = randomMobConfig();
        const offset = mathRound(randomRange(0, 2));
        items.push(
            {
                sprite_: { image_: config.animations_.sit_[0].image_ },
                position_: { x: x + offset, y: y + offset },
                offset_: { x: 12, y: 50 },
                bounds_: { x: 0, y: 0, w: 10, h: 10 },
            },
        );

        items.push(
            {
                sprite_: { image_: randomSelect([bottle0, bottle1, bottle2, bottle3, bottle4, bottle5]) },
                position_: { x: x, y: y },
                offset_: { x: 8 + randomRange(-1, 1), y: 16 + 20 + randomRange(-1, 1) },
                bounds_: { x: 0, y: 0, w: 0, h: 0 },
            },
        );
    }


}

const generateFloorImage = (width: number, height: number): HTMLCanvasElement => {
    const image = generateRandomTileImage(width, height, [barFloor0, barFloor1, barFloor2, barFloor3], [3, 2, 1, 1]);
    const context = getContext(image);

    const border = 30;

    context.fillStyle = "black";
    context.fillRect(0, 0, image.width, 1);

    drawGradientV(context, 0, 0, image.width, border, 0x77000000, 0);
    drawGradientV(context, 0, image.height - border, image.width, border, 0, 0x77000000);

    let trashCount = 150;

    while (trashCount-- > 0) {
        context.globalAlpha = randomRange(0.1, 0.3);
        const trash = images[randomSelect([trash0, trash1, trash2, trash3, trash4])];
        drawImage(context, trash, randomRange(0, width), randomRange(0, height));
    }

    noise(10, image);

    return image;
}

const generateWallImage = (width: number, height: number): HTMLCanvasElement => {
    const image = generateTileImage(width, height, barWall0);
    const context = getContext(image);

    const columns = [barWall1, barWall2, barWall3];
    const columnsChances = [2, 1, 1];

    const columnStep = 70;

    for (let x = 0; x < width; x += columnStep) {
        for (let y = 0; y < width; y += 16) {
            const columnImage = images[randomChancesSelect(columns, columnsChances)];
            drawImage(context, columnImage, x, y);
        }
    }

    drawCommands(
        [
            barWall4, columnStep - 13, 0,
            barWall4, columnStep * 3 - 13, 0,
            barWall4, columnStep * 6 - 13, 0,

            barWall5, columnStep * 2 - 17, 0,
            barWall5, columnStep * 5 - 30, 0
        ],
        context,
    );

    drawShelf(context, 89, 30);
    drawShelf(context, 159, 30);
    drawShelf(context, 229, 30);

    const border = 40;
    drawGradientV(context, 0, image.height - border, image.width, border, 0, 0x77000000);

    noise(10, image);

    return image;
}

const drawBottles = (context: CanvasRenderingContext2D, bottles: Array<number>, x: number, y: number) => {
    for (let i = 0; i < 6; i++) {
        const image = randomSelect(bottles);
        drawSprite(context, { image_: image, x: i * 7 + x, y });
    }
}

function drawShelf(context: CanvasRenderingContext2D, x: number, y: number) {
    context.setTransform(1, 0, 0, 1, x, y);

    drawSprites(context, [
        { image_: barWall6 },
        { image_: barWall7, y: 16 },
        { image_: barWall6, y: 32, flipY_: true },
        { image_: barWall8, x: 16 },
        { image_: barWall6, x: 32, flipX_: true },
        { image_: barWall7, x: 32, y: 16, flipX_: true },
        { image_: barWall6, x: 32, y: 32, flipY_: true, flipX_: true },
        { image_: barWall9, x: 16, y: 16 },
        { image_: barWall8, x: 16, y: 32, flipY_: true },
        { image_: barWall10, x: 3, y: 15 },
        { image_: barWall10, x: 16, y: 15 },
        { image_: barWall10, x: 29, y: 15 },
        { image_: barWall10, x: 3, y: 30 },
        { image_: barWall10, x: 16, y: 30 },
        { image_: barWall10, x: 29, y: 30 },
    ]);

    drawBottles(context, [bottle0, bottle1, bottle2], -1, -1);
    drawBottles(context, [bottle2, bottle3, bottle1], -1, 14);
    drawBottles(context, [bottle4], -1, 28);

    context.resetTransform();
}

