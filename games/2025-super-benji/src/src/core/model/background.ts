import { hexToRgbaString, randomisePalette } from "@/core/utilities";
import {
  BACKGROUND_MOVEMENT_Y_SPEED,
  BACKGROUND_MOVEMENT_Y_SPEED_MAX,
  BACKGROUND_WAVE_DISTORTION,
  STORY_LEVELS,
} from "../config";
import { Coordinates } from "../types";

const BASE_BACKGROUND_PALETTE = [
  "#06040f", // BG colour
  "#4d592a",
  "#231952",
  "#354652",
  "#353550",
  "#363692",
  "#69416e",
];

interface BackgroundLayer {
  palette: string[];
  tile: HTMLImageElement;
  offsetX: number;
  offsetY: number;
  speedY: number;
  speedXMultiplier: number;
}

export class Background {
  layers: BackgroundLayer[] = [];
  private xMovementBuffer = 100;
  private XMovementAmount = 0.4;
  private tileSize = 256;
  backgroundYSpeed;
  private time = 0;
  private currentLevel;

  constructor(
    backgroundYSpeed = BACKGROUND_MOVEMENT_Y_SPEED,
    currentLevel = 1
  ) {
    // Randomise a base palette
    const basePalette = randomisePalette(BASE_BACKGROUND_PALETTE);

    this.backgroundYSpeed = Math.min(
      backgroundYSpeed,
      BACKGROUND_MOVEMENT_Y_SPEED_MAX
    );
    this.currentLevel = currentLevel;

    // Create layers with different densities and speeds for parallax effect
    this.layers.push(
      this.createLayer(
        basePalette,
        this.tileSize,
        0.001,
        this.backgroundYSpeed * 0.4,
        0.2,
        1
      )
    );
    this.layers.push(
      this.createLayer(
        basePalette,
        this.tileSize,
        0.002,
        this.backgroundYSpeed * 0.6,
        0.3,
        1
      )
    );
    this.layers.push(
      this.createLayer(
        basePalette,
        this.tileSize,
        0.003,
        this.backgroundYSpeed * 1,
        0.4,
        1
      )
    );
  }

  private createLayer(
    palette: string[],
    tileSize: number,
    starDensity: number,
    speedY: number,
    speedXMultiplier: number,
    starSize: number
  ): BackgroundLayer {
    const tile = this.generateStarTile(
      tileSize,
      starDensity,
      palette,
      starSize
    );
    return {
      palette,
      tile,
      offsetX: 0,
      offsetY: 0,
      speedY,
      speedXMultiplier,
    };
  }

  update(delta: number, playerVelocity: Coordinates = { x: 0, y: 0 }) {
    this.time += delta * 0.1;
    for (const layer of this.layers) {
      if (layer.tile.width === 0 || layer.tile.height === 0) {
        // Tile not loaded yet, skip updating this layer
        continue;
      }

      layer.offsetY =
        (layer.offsetY +
          layer.speedY * delta -
          playerVelocity.y * 0.5 * layer.speedXMultiplier) %
        layer.tile.height;

      if (layer.offsetY < 0) {
        layer.offsetY += layer.tile.height; // prevent negative values
      }

      layer.offsetX =
        (layer.offsetX -
          playerVelocity.x * this.XMovementAmount * layer.speedXMultiplier) %
        layer.tile.width;
    }
  }

  private getWaveDistortion(): number {
    for (let i = STORY_LEVELS.length - 1; i >= 0; i--) {
      if (this.currentLevel >= STORY_LEVELS[i]) {
        return BACKGROUND_WAVE_DISTORTION[i];
      }
    }
    return 0; // default before act2
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas;
    ctx.imageSmoothingEnabled = false;

    const layer = this.layers[0];
    ctx.save();
    ctx.fillStyle = layer.palette[0];
    ctx.fillRect(0, 0, width, height);

    for (const layer of this.layers) {
      if (!layer.tile.complete) continue;

      const pattern = ctx.createPattern(layer.tile, "repeat");
      if (!pattern) continue;

      ctx.save();

      // Make stars "wave" in X
      const waveAmplitude = 20 * layer.speedXMultiplier; // pixels

      // Distort background through story
      const waveSpeed = this.getWaveDistortion();

      const waveOffset =
        Math.sin(this.time * waveSpeed + layer.speedXMultiplier * 2) *
        waveAmplitude;

      // Translate by the negative offsets to scroll the pattern seamlessly
      ctx.translate(layer.offsetX + waveOffset, layer.offsetY);

      ctx.fillStyle = pattern;
      ctx.fillRect(
        -layer.tile.width / 4,
        -layer.tile.height,
        width + this.xMovementBuffer,
        height + layer.tile.height
      );
      ctx.restore();
    }
    ctx.restore();
  }

  generateStarTile(
    size = 128,
    density = 0.01,
    palette: string[] = BASE_BACKGROUND_PALETTE,
    starSize: number
  ): HTMLImageElement {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;

    // Stars
    for (let i = 0; i < Math.floor(size * size * density); i++) {
      ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
      ctx.fillRect(
        Math.floor(Math.random() * size),
        Math.floor(Math.random() * size),
        starSize,
        starSize
      );
    }

    // Add nebula clouds
    this.drawGalaxyClouds(ctx, size, 2, palette);

    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
  }

  private drawGalaxyClouds(
    ctx: CanvasRenderingContext2D,
    size: number,
    count: number,
    palette: string[]
  ) {
    for (let i = 0; i < count; i++) {
      this.drawWrappedGradient(
        ctx,
        Math.random() * size,
        Math.random() * size,
        Math.random() * (size / 2) + size / 3,
        size,
        palette
      );
    }
  }

  private drawWrappedGradient(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    size: number,
    palette: string[]
  ) {
    for (let offsetX = -size; offsetX <= size; offsetX += size) {
      for (let offsetY = -size; offsetY <= size; offsetY += size) {
        const grad = ctx.createRadialGradient(
          x + offsetX,
          y + offsetY,
          0,
          x + offsetX,
          y + offsetY,
          radius
        );

        grad.addColorStop(0, hexToRgbaString(palette[5], 0.1));
        grad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
      }
    }
  }
}
