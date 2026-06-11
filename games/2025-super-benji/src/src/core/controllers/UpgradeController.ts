import { RarityLabel } from "../config";
import { Upgrade } from "../types";
import { GameController } from "./GameController";

// Save some bytes by storing repeated text as vars
const StatLabel: Record<string, string> = {
  DMG: "Damage",
  ATKSPD: "Fire Rate",
  PROJSPD: "Proj Speed",
  HP: "HP",
  REGEN: "Regen",
  HEAL: "Heal",
  EVASION: "Evasion",
  MOVESPD: "Move Speed",
};

export class UpgradeController {
  private gameManager: GameController;

  constructor(gameManager: GameController) {
    this.gameManager = gameManager;
  }

  getAllUpgrades() {
    return this.upgrades;
  }

  private upgrades: Upgrade[] = [
    {
      rarity: RarityLabel.Common,
      name: "Cosmic Claw",
      description: `${StatLabel.DMG} +4, ${StatLabel.PROJSPD} 15%`,
      description2: `Spread Shot`,
      apply: async () => {
        this.gameManager.player.damage += 4;
        this.gameManager.player.bulletSpeed *= 1.15;
        this.gameManager.player.bulletColor = "orange";
        this.gameManager.player.shootPattern = "spread";
      },
    },
    {
      rarity: RarityLabel.Common,
      name: "Starburst",
      description: `${StatLabel.DMG} +6, ${StatLabel.ATKSPD} 10%`,
      description2: `Burst Shot`,
      apply: async () => {
        this.gameManager.player.damage += 6;
        this.gameManager.player.attackSpeed *= 0.9;
        this.gameManager.player.shootPattern = "burst";
      },
    },
    {
      rarity: RarityLabel.Rare,
      name: "Nebula Railcoil",
      description: `${StatLabel.DMG} +8, ${StatLabel.PROJSPD} +30%`,
      description2: "Burst Shot",
      apply: () => {
        this.gameManager.player.damage += 5;
        this.gameManager.player.bulletSpeed *= 1.3;
        this.gameManager.player.bulletColor = "purple";
        this.gameManager.player.shootPattern = "burst";
      },
    },
    {
      rarity: RarityLabel.Epic,
      name: "Iron Fang Torpedo",
      description: `${StatLabel.DMG} +6, ${StatLabel.ATKSPD} +20%`,
      description2: "Spread Shot",
      apply: () => {
        this.gameManager.player.damage += 6;
        this.gameManager.player.attackSpeed *= 0.8;
        this.gameManager.player.bulletColor = "orange";
        this.gameManager.player.shootPattern = "spread";
      },
    },
    {
      rarity: RarityLabel.Epic,
      name: "Modified Sprinkler",
      description: `${StatLabel.DMG} -6, ${StatLabel.ATKSPD} +50%`,
      description2: "Mega Shot",
      apply: () => {
        this.gameManager.player.damage -= 6;
        this.gameManager.player.attackSpeed *= 0.5;
        this.gameManager.player.bulletColor = "pink";
        this.gameManager.player.shootPattern = "megaspread";
      },
    },
    {
      rarity: RarityLabel.Legendary,
      name: "Glass Cannon",
      description: `${StatLabel.DMG} +10 ${StatLabel.HP} -20`,
      description2: "Mega Shot",
      apply: () => {
        this.gameManager.player.damage += 10;
        this.gameManager.player.life -= 20;
        this.gameManager.player.bulletColor = "orange";
        this.gameManager.player.shootPattern = "megaspread";
      },
    },
    // Defensive
    {
      rarity: RarityLabel.Common,
      name: "Mithril Plating",
      description: `${StatLabel.HP} +10, ${StatLabel.REGEN} +1`,
      description2: `${StatLabel.EVASION} +2%`,
      apply: () => {
        this.gameManager.player.maxLife += 10;
        this.gameManager.player.life += 10;
        this.gameManager.player.regen += 1;
        this.gameManager.player.evasion += 2;
        this.gameManager.player.playerColor = "purple";
      },
    },
    {
      rarity: RarityLabel.Common,
      name: "Adamite Panels",
      description: `${StatLabel.HP} +12, ${StatLabel.REGEN} +2`,
      apply: () => {
        this.gameManager.player.maxLife += 12;
        this.gameManager.player.life += 12;
        this.gameManager.player.regen += 2;
        this.gameManager.player.playerColor = "green";
      },
    },
    {
      rarity: RarityLabel.Rare,
      name: "Torx’s Reinforced Shell",
      description: `${StatLabel.HP} +20, ${StatLabel.REGEN} +3`,
      apply: () => {
        this.gameManager.player.maxLife += 20;
        this.gameManager.player.life += 20;
        this.gameManager.player.regen += 3;
      },
    },
    {
      rarity: RarityLabel.Epic,
      name: "Aether Veil",
      description: `${StatLabel.EVASION} +15%`,
      apply: () => {
        this.gameManager.player.evasion += 15;
      },
    },
    {
      rarity: RarityLabel.Legendary,
      name: "Maggie's Cloak",
      description: `${StatLabel.HP} +25, ${StatLabel.REGEN} +4`,
      description2: `${StatLabel.EVASION} +10%`,
      apply: () => {
        this.gameManager.player.maxLife += 25;
        this.gameManager.player.life += 25;
        this.gameManager.player.regen += 4;
        this.gameManager.player.evasion += 10;
        this.gameManager.player.playerColor = "blue";
      },
    },
    // Movement
    {
      rarity: RarityLabel.Common,
      name: "Advanced Wings",
      description: `${StatLabel.MOVESPD} +12%`,
      description2: `${StatLabel.ATKSPD} +3%`,
      apply: () => {
        this.gameManager.player.movementXSpeed *= 1.12;
        this.gameManager.player.movementYSpeed *= 1.12;
        this.gameManager.player.attackSpeed *= 0.97;
      },
    },
    {
      rarity: RarityLabel.Rare,
      name: "Meteor Thrusters",
      description: `${StatLabel.MOVESPD} +20%`,
      description2: `${StatLabel.EVASION} +5%`,
      apply: () => {
        this.gameManager.player.movementXSpeed *= 1.2;
        this.gameManager.player.movementYSpeed *= 1.2;
        this.gameManager.player.evasion += 5;
      },
    },
    {
      rarity: RarityLabel.Legendary,
      name: "Voidstep Drive",
      description: `${StatLabel.MOVESPD} +35%`,
      description2: `${StatLabel.EVASION} +10%`,
      apply: () => {
        this.gameManager.player.attackSpeed *= 0.9;
        this.gameManager.player.movementXSpeed *= 1.35;
        this.gameManager.player.movementYSpeed *= 1.35;
        this.gameManager.player.evasion += 10;
      },
    },
    // Utility
    {
      rarity: RarityLabel.Common,
      name: "Hunter’s Instinct",
      description: `${StatLabel.DMG} +4, ${StatLabel.EVASION} +2%`,
      description2: `${StatLabel.MOVESPD} +3%`,
      apply: () => {
        this.gameManager.player.damage += 4;
        this.gameManager.player.evasion += 2;
        this.gameManager.player.movementXSpeed *= 1.03;
        this.gameManager.player.movementYSpeed *= 1.03;
      },
    },
    {
      rarity: RarityLabel.Common,
      name: "Lazer pointer addon",
      description: `${StatLabel.ATKSPD} +6%`,
      description2: `${StatLabel.EVASION} 3%`,
      apply: () => {
        this.gameManager.player.attackSpeed *= 0.94;
        this.gameManager.player.evasion += 3;
      },
    },
    {
      rarity: RarityLabel.Rare,
      name: "Astro Whiskers",
      description: `${StatLabel.ATKSPD} +15%`,
      description2: `${StatLabel.PROJSPD} +40%`,
      apply: () => {
        this.gameManager.player.attackSpeed *= 0.85;
        this.gameManager.player.bulletSpeed *= 1.4;
      },
    },
    {
      rarity: RarityLabel.Rare,
      name: "Reverse Polarity",
      description: `${StatLabel.PROJSPD} +60%`,
      description2: `${StatLabel.MOVESPD} -15%`,
      apply: () => {
        this.gameManager.player.bulletSpeed *= 1.6;
        this.gameManager.player.movementXSpeed *= 0.85;
        this.gameManager.player.movementYSpeed *= 0.85;
      },
    },
    {
      rarity: RarityLabel.Epic,
      name: "Warp Core Fragment",
      description: `${StatLabel.ATKSPD} +40%`,
      description2: `${StatLabel.PROJSPD} -15%`,
      apply: () => {
        this.gameManager.player.attackSpeed *= 0.6;
        this.gameManager.player.bulletSpeed *= 0.85;
      },
    },
    {
      rarity: RarityLabel.Legendary,
      name: "Jackalbane Core",
      description: `${StatLabel.DMG} +7, ${StatLabel.HP} +35`,
      description2: `${StatLabel.PROJSPD} 20%`,
      apply: () => {
        this.gameManager.player.damage += 7;
        this.gameManager.player.maxLife += 35;
        this.gameManager.player.life += 35;
        this.gameManager.player.bulletSpeed *= 1.2;
      },
    },
    // Heal
    {
      rarity: RarityLabel.Common,
      name: "Left-over Sushi",
      description: `${StatLabel.HEAL} +20, ${StatLabel.REGEN} +2`,
      apply: () => {
        this.gameManager.player.regen += 2;
        this.gameManager.player.heal(20);
      },
    },
    {
      rarity: RarityLabel.Common,
      name: "Alien Catnip",
      description: `${StatLabel.HEAL} +30 ${StatLabel.HP} +4`,
      description2: `${StatLabel.DMG} +3`,
      apply: () => {
        this.gameManager.player.damage += 3;
        this.gameManager.player.maxLife += 4;
        this.gameManager.player.heal(30);
      },
    },
    {
      rarity: RarityLabel.Rare,
      name: "Iron Jackal Bru",
      description: `${StatLabel.HEAL} +30, ${StatLabel.REGEN} +3`,
      description2: `${StatLabel.ATKSPD} +12%`,
      apply: () => {
        this.gameManager.player.regen += 3;
        this.gameManager.player.heal(30);
        this.gameManager.player.attackSpeed *= 0.88;
      },
    },
    {
      rarity: RarityLabel.Legendary,
      name: "Schrodinger Sandwich",
      description: `${StatLabel.HEAL} +80, ${StatLabel.ATKSPD} +20%`,
      apply: () => {
        this.gameManager.player.heal(80);
        this.gameManager.player.attackSpeed *= 0.8;
      },
    },
  ];
}
