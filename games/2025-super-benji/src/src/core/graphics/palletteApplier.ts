import { hexToRgba } from "../utilities";

export class PaletteApplier {
  static applyPalette(
    baseImage: HTMLImageElement,
    palette: string[]
  ): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      if (baseImage.complete && baseImage.naturalWidth !== 0) {
        resolve(PaletteApplier._applyPaletteSync(baseImage, palette));
      } else {
        baseImage.onload = () => {
          resolve(PaletteApplier._applyPaletteSync(baseImage, palette));
        };
        baseImage.onerror = reject;
      }
    });
  }

  static _applyPaletteSync(
    baseImage: HTMLImageElement,
    palette: string[]
  ): HTMLImageElement {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    canvas.width = baseImage.width;
    canvas.height = baseImage.height;

    // Draw base image
    ctx.drawImage(baseImage, 0, 0);

    // Extract pixels
    const imageData = ctx.getImageData(0, 0, baseImage.width, baseImage.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      // If original pixel was transparent, keep it transparent
      if (alpha === 0) continue;

      const gray = data[i]; // R channel (assuming grayscale)
      const colorIndex = Math.min(
        palette.length - 1,
        Math.floor(gray / (256 / palette.length))
      );
      const color = hexToRgba(palette[colorIndex] || "#000000");

      data[i] = color.r;
      data[i + 1] = color.g;
      data[i + 2] = color.b;
    }

    ctx.putImageData(imageData, 0, 0);

    // Convert the canvas to an Image
    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
  }
}
