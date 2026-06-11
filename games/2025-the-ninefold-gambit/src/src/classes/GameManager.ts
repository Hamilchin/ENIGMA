import levelTileData from '@/data/levelTilesetData.json';
import { Vector2 } from "@/core/vector";
import { Animations, Box, PatrolPoints } from "@/model/common.model";
import { Player } from "./player/Player";
import playerAnimationData from '@/data/playerAnimationData.json';
import { TileMapGenerator } from "./TileMapGenerator";
import { Engine } from '@/core/engine';
import { CollisionBlock } from './CollisionBlock';
import { BASE_TILE_SIZE, COLLISION_SYMBOL_KEY, OBJECT_BLOCK, PatrolDirection, UNLOCKABLE_ABILITY, UnlockableAbility } from '@/constans/game-contstans';
import { images } from './Images';
import blackCatAnimationData from '@/data/blackCatAnimationData.json';
import bossCatAnimationData from '@/data/bossCatAnimationData.json';
import { BlackCatEnemy } from './enemy/BlackCatEnemy';
import { DialogTrigger } from './dialog-system/DialogTrigger';
import { DialogSystem } from './dialog-system/DialogSystem';
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { AbilityUnlocker } from './objects/AbilityUnlocker';
import { Camera } from './Camera';
import { ObjectBlock } from './objects/ObjectBlock';
import { BossCatEnemy } from './enemy/boss-cat/BossCatEnemy';
import { ILevel } from '@/model/IGameObject';
import { PlayerHUD } from './player/PlayerHUD';
import { ParticleSystem } from '@/core/particle-system';
import { gamerEndState } from '@/game-states/game-end.state';
import { gameStateMachine } from '@/core/game-state-machine';
import { time } from '@/core/time';
// import { GameLoader } from './GameLoader';

export class GameManager {
    public player!: Player;
    public playerImg: string = 'mouse_run_horz.png';
    public playerAnimation: Array<Animations> = [];
    public playerAnimationData = playerAnimationData;

    public levelNumber = 1;
    public tileMapGenerator!: TileMapGenerator;
    // public levelCollection: Array<GameLoader> = [];

    public collisions: Array<number> = [];
    public collisionBlocks: any;

    // public mapObjectsData: any;

    // public stoneBlock!: ObjectBlock;
    public woodBlocksArray: Array<ObjectBlock> = [];
    public stoneBlocksArray: Array<ObjectBlock> = [];
    public wallBlocksArray: Array<ObjectBlock> = [];

    public bossCat!: BossCatEnemy;
    public bossCatArray: Array<BossCatEnemy> = [];
    public bossCatAnimations!: Array<Animations>;

    // public whiteCatEnemy!: WhiteCatEnemy;
    // public whiteCatEnemies: Array<WhiteCatEnemy> = [];
    // private whiteCatEnemiesAnimations!: Array<Animations>;
    // private whiteCatSprite: string = 'white_cat_run.png';

    // public blackCatEnemy!: BlackCatEnemy;
    public blackCatEnemies: Array<BlackCatEnemy> = [];
    private blackCatEnemiesAnimations!: Array<Animations>;
    private blackCatSprite: string = 'black_cat_run.png';


    // public blobBlock!: BlobBlock;
    // public blobBlocksArray!: Array<BlobBlock>;
    // private blobBlockAnimations!: Array<Animations>;

    // private abilityUnlockerPunch!: AbilityUnlocker;
    // private abilityUnlockerDigDash!: AbilityUnlocker;
    // private abilityUnlockerFire!: AbilityUnlocker;
    private abilityUnlockersArray: Array<AbilityUnlocker> = [];

    private dialogBox = new DialogSystem();
    private dialogTriggers: DialogTrigger[] = [];

    public lifeArray: Array<PlayerHUD> = [];

    public particalSystem!: ParticleSystem;

    private timeOutDuration: number = 2000;
    private timOutElapsed: number = 0;

    private canBossActive = false;

    // private dialogActiveDuration: number = 500;
    // private dialogActiveElapsed: number = 0;

    constructor() {
        // this.whiteCatEnemiesAnimations = whiteCatAnimationData;
        this.blackCatEnemiesAnimations = blackCatAnimationData;
        this.bossCatAnimations = bossCatAnimationData;
        // this.blobBlockAnimations = blobAnimationData;
    }

    public enter() {
        this.tileMapGenerator = new TileMapGenerator(`level${this.levelNumber}TilesData`);
        this.collisions = levelTileData[0].platform.data;
        let array2d = Engine.parseTo2DArray(this.collisions, this.tileMapGenerator.mapWidth / BASE_TILE_SIZE);
        this.collisionBlocks = Engine.createArrayFrom2D(array2d, COLLISION_SYMBOL_KEY);


        this.playerAnimationData.forEach((data: Animations) => {
            const animation = new Animations(data.animationName, data.props);
            this.playerAnimation.push(animation);
        });

        // this.player = new Player(this.collisionBlocks, new Vector2(20, 585), this.playerImg, this.playerAnimation, 2, 7);
        this.player = new Player(this.collisionBlocks, new Vector2(536, 117), this.playerImg, this.playerAnimation, 2, 7);
        this.player.enter(); // Player enter function.

        // this.levelCollection[0].enter();

        this.woodBlocksArray.push(
            new ObjectBlock(new Vector2(136, 160), '', this.player, OBJECT_BLOCK.WOOD),
            new ObjectBlock(new Vector2(172, 168), '', this.player, OBJECT_BLOCK.WOOD),
            new ObjectBlock(new Vector2(288, 168), '', this.player, OBJECT_BLOCK.WOOD),
            new ObjectBlock(new Vector2(304, 168), '', this.player, OBJECT_BLOCK.WOOD),
            new ObjectBlock(new Vector2(352, 112), '', this.player, OBJECT_BLOCK.WOOD),
            new ObjectBlock(new Vector2(240, 104), '', this.player, OBJECT_BLOCK.WOOD),


            new ObjectBlock(new Vector2(36, 76), '', this.player, OBJECT_BLOCK.WOOD),
        );

        this.stoneBlocksArray.push(
            new ObjectBlock(new Vector2(184, 80), '', this.player, OBJECT_BLOCK.STONE),
            new ObjectBlock(new Vector2(168, 88), '', this.player, OBJECT_BLOCK.STONE),
            new ObjectBlock(new Vector2(105, 96), '', this.player, OBJECT_BLOCK.STONE),
            new ObjectBlock(new Vector2(92, 80), '', this.player, OBJECT_BLOCK.STONE),

            new ObjectBlock(new Vector2(90, 28), '', this.player, OBJECT_BLOCK.STONE),


        );

        this.wallBlocksArray.push(
            new ObjectBlock(new Vector2(312, 94), '', this.player, OBJECT_BLOCK.BLOCK_TILE, new Box(new Vector2(), 8, 8, true)),
            new ObjectBlock(new Vector2(320, 96), '', this.player, OBJECT_BLOCK.BLOCK_TILE, new Box(new Vector2(), 8, 8, true)),
            new ObjectBlock(new Vector2(328, 94), '', this.player, OBJECT_BLOCK.BLOCK_TILE, new Box(new Vector2(), 8, 8, true)),
            new ObjectBlock(new Vector2(336, 96), '', this.player, OBJECT_BLOCK.BLOCK_TILE, new Box(new Vector2(), 8, 8, true)),
        )

        this.bossCat = new BossCatEnemy(new Vector2(300, 0), 'boss_cat_run.png', this.player, this.bossCatAnimations, true);
        this.bossCatArray = [this.bossCat]

        this.blackCatEnemies.push(
            new BlackCatEnemy(new Vector2(217, 140), this.blackCatSprite, this.player, this.blackCatEnemiesAnimations,
                PatrolDirection.Horizontal, 35, true),
                new BlackCatEnemy(new Vector2(254, 90), this.blackCatSprite, this.player, this.blackCatEnemiesAnimations,
                    PatrolDirection.Horizontal, 30, true),
            new BlackCatEnemy(new Vector2(340, 96), this.blackCatSprite, this.player, this.blackCatEnemiesAnimations,
                PatrolDirection.Horizontal, 20, true),
            new BlackCatEnemy(new Vector2(120, 70), this.blackCatSprite, this.player, this.blackCatEnemiesAnimations,
                PatrolDirection.Horizontal, 20, true),
            new BlackCatEnemy(new Vector2(-5, 55), this.blackCatSprite, this.player, this.blackCatEnemiesAnimations,
                PatrolDirection.Horizontal, 10, true),
            new BlackCatEnemy(new Vector2(54, 0), this.blackCatSprite, this.player, this.blackCatEnemiesAnimations,
                PatrolDirection.Vertical, 20, true),
            new BlackCatEnemy(new Vector2(190, 15), this.blackCatSprite, this.player, this.blackCatEnemiesAnimations,
                PatrolDirection.Horizontal, 20, true),
            new BlackCatEnemy(new Vector2(188, -5), this.blackCatSprite, this.player, this.blackCatEnemiesAnimations,
                PatrolDirection.Horizontal, 22, true)
        )
        
        this.abilityUnlockersArray.push(
            new AbilityUnlocker(new Vector2(115, 125), '', this.player, UNLOCKABLE_ABILITY.PUNCH_ABILITY),
            new AbilityUnlocker(new Vector2(372, 166), '', this.player, UNLOCKABLE_ABILITY.DIG_DASH),
            new AbilityUnlocker(new Vector2(15, 12), '', this.player, UNLOCKABLE_ABILITY.FIRE_ABILITY)
        )

        this.dialogTriggers.push(
            new DialogTrigger(new Vector2(115, 125), 16, 16, "You have unlocked the Punch ability! Press '[Space],[J]' or '(A)' to punch."),
            new DialogTrigger(new Vector2(372, 166), 16, 16, "You have unlocked the Dig Dash ability! Press '[L Shift],[K]' or '(B)' to dash."),
            new DialogTrigger(new Vector2(15, 12), 16, 16, "You have unlocked the Fire Ball ability! Press '[R Shift],[L]' or '(X)' to fire."),

            new DialogTrigger(new Vector2(320, 92), 16, 16, "No! this path is blocked."),
            new DialogTrigger(new Vector2(310, 69), 32, 16, "Haha you find me! Now you have to defeat me to save your love!"),
            new DialogTrigger(new Vector2(61, 120), 16, 128, "Come here I can help you."),
            new DialogTrigger(new Vector2(84, 174), 16, 32, "This way behind me is a secret path, go!"),
        );

        this.particalSystem = new ParticleSystem();


    }


    public update(delta: number, camera: Camera) {
        this.tileMapGenerator.draw();
        this.particalSystem.updateAndDraw(delta);

        // Old mouse sprite draw
        images.getOldMouseSprite(new Vector2(75, 150))

        this.bossCatArray.forEach((bossCat: BossCatEnemy) => {
            bossCat.isActive = this.canBossActive;
            bossCat.updateAndDraw(delta);
            const attackedEnemy = this.player.attackEnemy(bossCat, 0, this.bossCatArray);
            if (attackedEnemy instanceof BossCatEnemy) {
                // attackedEnemy.position.x += this.player.directionVector.x + 10;
                attackedEnemy.position = attackedEnemy.position.add(new Vector2(this.player.directionVector.x, this.player.directionVector.y).multiply(5));
                const particalPosition = new Vector2();
                particalPosition.x = attackedEnemy.hitBox.position.x + (this.player.directionVector.x > 0 ? 1 : -1);;
                particalPosition.y = attackedEnemy.hitBox.position.y + attackedEnemy.hitBox.height / 2;

                this.particalSystem.burst(particalPosition, 20, '#282328');
            }
            this.particalSystem.resetBurst();

        })

        this.woodBlocksArray.forEach((wood: ObjectBlock) => {
            wood.update(delta);
        })

        this.stoneBlocksArray.forEach((stone: ObjectBlock) => {
            stone.update(delta);
        })

        if (this.blackCatEnemies?.length > 0) {
            this.wallBlocksArray.forEach((wall: ObjectBlock) => {
                wall.update(delta);
            });
        } else {
            if (this.dialogTriggers[3].text === "No! this path is blocked.") {
                this.dialogTriggers.splice(3, 1);
            }
            if (this.canBossActive) {
                this.wallBlocksArray.forEach((wall: ObjectBlock) => {
                    wall.update(delta)
                });
            }
        }

        this.abilityUnlockersArray.forEach((unlocker: AbilityUnlocker) => {
            unlocker.update(delta)
            unlocker.collidePlayer();
        })

        this.player.update(delta)

        this.blackCatEnemies.forEach((blackCat: BlackCatEnemy, index: number) => {
            blackCat.updateAndDraw(delta);
            blackCat.name = 'enemy_bcat' + (index + 1);
            const attackedEnemy = this.player.attackEnemy(blackCat, index, this.blackCatEnemies);
            if (attackedEnemy instanceof BlackCatEnemy) {
                // attackedEnemy.position.x += this.player.directionVector.x + 10;
                attackedEnemy.position = attackedEnemy.position.add(new Vector2(this.player.directionVector.x, this.player.directionVector.y).multiply(10));
                const particalPosition = new Vector2();
                particalPosition.x = attackedEnemy.hitBox.position.x + (this.player.directionVector.x > 0 ? 1 : -1);;
                particalPosition.y = attackedEnemy.hitBox.position.y + attackedEnemy.hitBox.height / 2;
                this.particalSystem.burst(particalPosition, 30, '#282328');
            }
            this.particalSystem.resetBurst();
        });

        this.collisionBlocks.forEach((collisionBlock: CollisionBlock) => {
            collisionBlock.update();
        });

        camera.drawDimOverlayIfLocked(this.player.hitBox);


        this.renderDialogBoxAndHUD(delta);

        if (!this.player.isAlive) {
            sessionStorage.setItem('gameOver', 'true');
            sessionStorage.removeItem('gameWin');
            this.timOutElapsed += delta;
            // if (!this.isPlayDieSound) {
            //     if (SOUND_FX) audio.playPlayerGetHitFx();
            //     this.isPlayDieSound = true;
            // }
            if (this.timOutElapsed >= this.timeOutDuration) {
                gameStateMachine.setState(gamerEndState);
            }
        }

        if (this.bossCatArray?.length === 0) {
            sessionStorage.setItem('gameWin', 'true');
            sessionStorage.removeItem('gameOver');
            this.player.canControlPlayer = false;
            this.timOutElapsed += delta;
            if (this.timOutElapsed >= this.timeOutDuration) {
                gameStateMachine.setState(gamerEndState);
            }
        }

    }

    private renderDialogBoxAndHUD(delta: number) {
        if (this.dialogBox.isActive) {
            this.player.canControlPlayer = false;
            this.player.isDialogActive = true;
            time.setTimeScale(0.001);
        }

        for (const trigger of this.dialogTriggers) {
            if (!trigger.triggered && Engine.collisions(trigger.hitbox, this.player.hitBox)) {
                this.dialogBox.triggerDialog(trigger.text);
                if (trigger.text === 'Haha you find me! Now you have to defeat me to save your love!') {
                    this.canBossActive = true;
                }
                trigger.triggered = true;
                break; // Only one at a time
            }
        }

        drawEngine.context.save();
        drawEngine.context.setTransform(1, 0, 0, 1, 0, 0);
        this.dialogBox.update(drawEngine.context);

        this.showPlayerLifeHearts();
        this.lifeArray.forEach((heart: PlayerHUD, index: number) => {
            heart.healthImgDraw();
        })
        this.lifeArray = [];

        drawEngine.context.restore();

        if (controls.isAttack) {
            time.setTimeScale(1);
            this.dialogBox.onKeyPress();
            this.player.canControlPlayer = true;

            setTimeout(() => {
                this.player.isDialogActive = false;
            }, 500);
        }
    }

    private showPlayerLifeHearts() {
        for (let i = 0; i < this.player.health; i++) {
            let pos = this.heartPositionData[i];
            this.lifeArray.push(new PlayerHUD(new Vector2(pos.heartPosition.x, pos.heartPosition.y), true));
        }
        return this.lifeArray;
    }

    private heartPositionData = [
        {
            heartPosition: {
                x: 5,
                y: 5
            }
        },
        {
            heartPosition: {
                x: 19,
                y: 5
            }
        },
        {
            heartPosition: {
                x: 33,
                y: 5
            }
        },
        {
            heartPosition: {
                x: 47,
                y: 5
            }
        },
        {
            heartPosition: {
                x: 61,
                y: 5
            }
        }
    ]

    // public exit() {
    //     this.whiteCatEnemiesAnimations = [];
    //     this.blackCatEnemiesAnimations = [];
    //     this.blackBatEnemiesAnimations = [];
    //     this.bossCatAnimations = [];
    // }
}

// export const gameManager = new GameManager();