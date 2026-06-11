export const CANVAS_WIDTH = 320;
export const CANVAS_HEIGHT = 180;

export const BASE_TILE_HEIGHT = 8;
export const BASE_TILE_WIDTH = 8;
export const BASE_TILE_SIZE = 8;

// export const GRAVITY = 0.5;
export const PLAYER_SPEED = 100

export const SOUND_FX = true;

export const BACK_GROUND = 'bg';
export const PLATFORM_TILES = 'tiles'
export const OBJECT_TILES = 'object'
export const COLLISION_SYMBOL_KEY = 2;

export const DEBUGGER = false; // Enable or disable debugger mode

export const Direction = {
    NONE: 'None',
    UP: 'Up',
    DOWN: 'Down',
    LEFT: 'Left',
    RIGHT: 'Right'
}

export enum PatrolDirection {
    Vertical,
    Horizontal,
    NONE
}

export const ProjectileType = {
    PLAYER: 'Player',
    ENEMY: 'Enemy'
}

export enum UnlockableAbility {
    Punch,
    FireBall,
    DigDash
}

export const UNLOCKABLE_ABILITY = {
    PUNCH_ABILITY: 'melee',
    FIRE_ABILITY: 'fire',
    DIG_DASH: 'digdash'
}

export const ENEMY_TYPE = {
    WHITE_CAT: 'white_cat',
    BLACK_CAT: 'black_cat',
    BAT: 'bat',
    BOSS_CAT: 'boss_cat'
}

export const ENEMY_ANIMATION_NAME = {
    IDLE: 'idle',
    WALK: 'walk',
    RUN: 'run',
    ATTACK: 'attack',
    FIRE: 'fire',
    FLY: 'fly'
}

export const OBJECT_BLOCK = {
    WOOD: 'wood',
    STONE: 'stone',
    BLOCK_TILE: 'block_tile'
}