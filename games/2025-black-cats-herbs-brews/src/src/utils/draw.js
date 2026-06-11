import { hexToRgbA } from './colour.js';

// export let getDimensions = (matrix) => {
//     return {
//         width: matrix[0].length,
//         height: matrix.length
//     };
// };

// 0 = transparent, 1 = colour1, 2 = colour2, etc...
export let makeImage = (ctx, matrix, colours, crop) => {
    let colouredMatrix = matrix.map(row => row.map(cell => hexToRgbA(["#00000000", ...colours][cell])));
    let width = colouredMatrix[0].length;
    let height = colouredMatrix.length;
    let imageData = new ImageData(width, height);
    colouredMatrix.forEach((row, y) => {
        row.forEach((colour, x) => {
            imageData.data.set(colour, (y * width + x) * 4);
        });
    });
    ctx.imageSmoothingEnabled = false;
    ctx.putImageData(imageData, -crop?.x || 0, -crop?.y || 0);
};

export let asCanvas = (matrix, colours, crop) => {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    canvas.width =  matrix[0].length;
    canvas.height = matrix.length;
    makeImage(ctx, matrix, colours, crop);
    return canvas;
};

// export let asDataUrl = (matrix, colours, crop) => {
//     return asCanvas(matrix, colours, crop).toDataURL();
// };

export let resizeImage = (url, factor, callback) => {
    let sourceImage = new Image();

    sourceImage.onload = function () {
        // Create a canvas with the desired dimensions
        let canvas = document.createElement("canvas");
        canvas.width = sourceImage.width * factor;
        canvas.height = sourceImage.height * factor;
        // Scale and draw the source image to the canvas
        let ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

        // Convert the canvas to a data URL in PNG format
        callback(canvas.toDataURL());
    };

    sourceImage.src = url;
};
