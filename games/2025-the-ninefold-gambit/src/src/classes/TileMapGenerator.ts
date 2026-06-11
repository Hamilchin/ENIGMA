import { Engine } from './../core/engine';
import { drawEngine } from "@/core/draw-engine";
import { ITileMap } from "@/model/ITileMap";

import levelTileData from '@/data/levelTilesetData.json'
import { BACK_GROUND, OBJECT_TILES, PLATFORM_TILES } from "@/constans/game-contstans";
import { Vector2 } from '@/core/vector';

export class TileMapGenerator {

    protected bufferCanvas: HTMLCanvasElement;
    protected bufferContext: CanvasRenderingContext2D;
    protected tileData: ITileMap;
    protected tileDataArray: Array<ITileMap>;
    public tileSize: number;
    protected tileColumns: number;
    protected tileRows: number;
    public mapWidth: number
    public mapHeight: number;

    protected platformData: Array<number>;
    protected isPlatformTileLoaded: boolean = false;
    protected platformTileSheetImage: HTMLImageElement;
    protected platformSheetColCount: number;
    protected platformSpriteStartingIndex: number;


    public collisions: Array<number>;

    constructor(tileDataKey: string) {
        this.tileDataArray = levelTileData;
        this.tileData = this.tileDataArray.find((dataObj: ITileMap) => dataObj.key === tileDataKey) as ITileMap;

        this.tileSize = this.tileData.tileSize;
        this.tileColumns = this.tileData.width;
        this.tileRows = this.tileData.height;

        this.mapWidth = this.tileData.width * this.tileData.tileSize;
        this.mapHeight = this.tileData.height * this.tileData.tileSize;

        this.bufferCanvas = document.createElement('canvas');
        this.bufferCanvas.width = this.mapWidth;
        this.bufferCanvas.height = this.mapHeight;
        this.bufferContext = this.bufferCanvas.getContext('2d')!;
        this.bufferContext.imageSmoothingEnabled = false;

        // Platform tiles setup.
        this.platformData = this.tileData.platform.data;
        this.platformTileSheetImage = new Image();
        this.platformTileSheetImage.src = this.tileData.platform.spriteSrc;
        this.platformTileSheetImage.onload = () => {
            if (!this.platformTileSheetImage) return;
            this.isPlatformTileLoaded = true;
            this.tryRenderToBuffer();
        }
        this.platformSheetColCount = this.tileData.platform.tileSheetColumns;
        this.platformSpriteStartingIndex = this.tileData.platform.tileIndexStart;

        this.collisions = this.tileData.platform.data;
        

    }

    // Add this helper method:
    private tryRenderToBuffer() {
    if (this.isPlatformTileLoaded) {
        this.renderToBuffer();
    }
}

    // This will calculate the tile's source position in the tile sheet given the number of columns in the tile sheet and the index of the tile in the tile sheet.
    protected calculateTileSourcePosition(tileIndex: number, tileSheetColumns: number, tileType: string) {
        let tileStartingIndex: number = 0;
        if (tileType === PLATFORM_TILES) {
            tileStartingIndex = this.platformSpriteStartingIndex;
        }
        let index = tileIndex - tileStartingIndex;
        let xPos = index % tileSheetColumns * this.tileSize;
        let yPos = Math.floor(index / tileSheetColumns) * this.tileSize;

        return new Vector2(xPos, yPos);
    }

    protected renderTiles(tileType: string, bufferContext: CanvasRenderingContext2D) {
        let tileMapData: Array<number> = [];

        if (tileType === PLATFORM_TILES) {
            tileMapData = this.platformData;
        }

        const map2DArray = Engine.parseTo2DArray(tileMapData, this.tileColumns);

        for (let mapRow = 0; mapRow < this.tileRows; mapRow++) {
            for (let mapColumn = 0; mapColumn < this.tileColumns; mapColumn++) {
                const tileValue = map2DArray[mapRow][mapColumn];

                let tileSourcePosition: Vector2 = new Vector2();
                let displayTile: HTMLImageElement = new Image();

                if (tileValue === 0) continue;

                if (tileType === PLATFORM_TILES) {
                    displayTile = this.platformTileSheetImage;
                    tileSourcePosition = this.calculateTileSourcePosition(tileValue, this.platformSheetColCount, tileType);
                }

                // Draw directly to main context
                bufferContext.drawImage(
                    displayTile,
                    tileSourcePosition.x,
                    tileSourcePosition.y,
                    this.tileSize,
                    this.tileSize,
                    mapColumn * this.tileSize,
                    mapRow * this.tileSize,
                    this.tileSize,
                    this.tileSize
                );
            }
        }
    }

    protected renderMap() {
        drawEngine.context.drawImage(this.bufferCanvas, 0, 0);
    }

    protected renderToBuffer() {
        this.bufferContext.clearRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);

        this.drawPlatformTiles();

    }

    public draw() {
        this.renderMap();
    }

    protected drawPlatformTiles() {
        this.renderTiles(PLATFORM_TILES, this.bufferContext);
    }
}