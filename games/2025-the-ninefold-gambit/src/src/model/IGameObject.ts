import { Animations } from "./common.model";

export interface ILevel {
    player: IPlayer;
    collisions: any;
    enemies?: IEnemy;
    collectibales?: ICollectibales;
    worldObjects?: IWorldObjects;
}

// export interface ILevelChangePoint {
//     positionX: number,
//     positionY: number,
//     currentLevel: number,
//     nextLevel: number,
//     playerNewPositionX: number;
//     playerNewPositionY: number;
// }

export interface IPlayer {
    positionX: number;
    positionY: number;
    src: string;
    animations: Array<Animations>;
}

export interface IEnemy {
    whiteCatEnemy: Array<ICatEnemy>;
    blackCatEnemy: Array<ICatEnemy>;
    batEnemy: Array<IBatEnemy>;
    bossCatEnemy: Array<ICatEnemy>;
    // spikes: Array<ISpikes>;
}

export interface ICatEnemy {
    positionX: number;
    positionY: number;
    src: string;
    animations: Array<Animations>;
    canMove: boolean;
    moveSpeed: number;
}

export interface IBatEnemy {
    positionX: number;
    positionY: number;
    src: string;
    animations: Array<Animations>;
    canMove: boolean;
    moveSpeed: number;
}

// export interface ISpikes {
//     positionX: number;
//     positionY: number;
// }

export interface ICollectibales {
    healthUpgrade: Array<IHealthUpgrade>;
    abilityUnlocker: Array<IAbilityUnlocker>;
}

export interface IWorldObjects {
    woodBlocks: Array<IWoodBlock>;
    stoneBlocks: Array<IStoneBlock>;
}

export interface IWoodBlock {
    positionX: number;
    positionY: number;
    type: string;
}

export interface IStoneBlock {
    positionX: number;
    positionY: number;
    type: string;
}

export interface IHealthUpgrade {
    positionX: number;
    positionY: number;
}

export interface IAbilityUnlocker {
    positionX: number;
    positionY: number;
    unlockableAbility: string;
}