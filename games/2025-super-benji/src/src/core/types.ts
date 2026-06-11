export interface State {
  onUpdate: (timeElapsed: number) => void;
  onEnter?: Function;
  onLeave?: Function;
}

export type ItemRarity = "Common" | "Rare" | "Epic" | "Legendary";

export type Upgrade = {
  rarity: ItemRarity;
  name: string;
  description: string;
  description2?: string;
  apply: () => void;
};

export type Bargain = {
  cost: number;
  description: string;
  description2?: string;
  apply: () => void;
};

export type Coordinates = {
  y: number;
  x: number;
};

export type ImageProperties = Coordinates & {
  width: number;
  height: number;
};

export type StoryLine = {
  speaker: Character;
  text: string;
};

export const StoryActs = {
  Act1: 0,
  Act2: 1,
  Act3: 2,
  Epilogue: 4,
};

export type Character = "Benji" | "Maggie" | "Torx" | "Jackal";

export type MovePattern = "none" | "sine" | "zigzag";
export type ShootPattern =
  | "single"
  | "burst"
  | "spread"
  | "megaspread"
  | "boss";

export type EnemyConfig = {
  sprite: HTMLImageElement;
  movePattern: MovePattern;
  shootPattern: ShootPattern;
  bulletSpeed: number;
  bulletDamage: number;
  health: number;
};
