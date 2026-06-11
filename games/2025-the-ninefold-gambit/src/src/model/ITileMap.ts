export interface ITileMap {
    key: string,
    tileSize: number,
    width: number,
    height: number,
    platform: ITile,
    collision: Array<number>
}

export interface ITile {
    spriteSrc: string,
    tileSheetColumns: number,
    tileIndexStart: number,
    data: Array<number>
}