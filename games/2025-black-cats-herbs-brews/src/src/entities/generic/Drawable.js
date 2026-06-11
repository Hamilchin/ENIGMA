import { makeImage } from '../../utils/draw';
import { int } from '../../utils/random';

export class Drawable {
    constructor(canvas, imageMatrix, colours, crop) {
        this.canvas = canvas;
        this.background = colours[1];
        this.imageMatrix = imageMatrix;
        this.colours = colours;
        this.crop = crop;
        this.animateInterval;
    }


    draw() {
        if (this.imageMatrix) {
            // let {width, height} = this.crop ? {
            //     width: this.crop.width,
            //     height: this.crop.height
            // } : getDimensions(this.imageMatrix);
            this.canvas.width = this.crop ? this.crop.width : this.imageMatrix[0].length;
            this.canvas.height = this.crop ? this.crop.height : this.imageMatrix.length;
            this.canvas.style.width = `${this.canvas.width * 10}px`;
            this.canvas.style.height = `${this.canvas.height * 10}px`;

            let ctx = this.canvas.getContext("2d");
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            makeImage(ctx, this.imageMatrix, this.colours, this.crop);

            if (this.animate()) {
                clearInterval(this.animateInterval);
                this.animateInterval = setInterval(() => {
                    this.animate();
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    makeImage(ctx, this.imageMatrix, this.colours, this.crop);
                }, 250);
            }
        }
    }

    animate() {
        return false;
    }

    blink(rows, cells, skinColourIndex, leftColour, rightColour, swapLeftEye) {
        if(this.imageMatrix[rows[0]][cells[0]] !== skinColourIndex && int(0, 35) < 1){
            rows.forEach(r => {
                cells.forEach((c, i) => {
                    this.imageMatrix[r][c] = skinColourIndex;
                });
            });
        } else {
            rows.forEach(r => {
                cells.forEach((c, i) => {
                    this.imageMatrix[r][c] = i%2 ? rightColour : leftColour;
                    if (swapLeftEye && i < 2) {
                        this.imageMatrix[r][c] = i%2 ? leftColour : rightColour;
                    }
                });
            });
        }
    }
}