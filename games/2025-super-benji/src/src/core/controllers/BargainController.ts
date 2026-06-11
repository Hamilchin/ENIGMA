import { Bargain } from "../types";
import { GameController } from "./GameController";
import { characterNames } from "./StoryController";

const enemyName = "Enemy";

export class BargainController {
  private gameManager: GameController;

  constructor(gameManager: GameController) {
    this.gameManager = gameManager;
  }

  getAllBargains() {
    return this.bargains;
  }

  private bargains: Bargain[] = [
    {
      cost: 3,
      description: `+ ${enemyName} proj speed`,
      description2: `+ ${characterNames.Benji} move speed`,
      apply: async () => {
        this.gameManager.levelManager.enemyTypes =
          this.gameManager.levelManager.enemyTypes.map((e) => {
            e.bulletSpeed *= 1.5;
            return e;
          });
        this.gameManager.player.movementYSpeed *= 1.2;
        this.gameManager.player.movementXSpeed *= 1.2;
      },
    },
    {
      cost: 8,
      description: `Warp to Rift Horizon`,
      description2: `(Danger!)`,
      apply: async () => {
        this.gameManager.levelManager.currentLevel = 15;
        this.gameManager.levelManager.startLevel();
      },
    },
    {
      cost: 7,
      description: `${characterNames.Benji}'s movement speed`,
      description2: `also increases evasion`,
      apply: async () => {
        this.gameManager.player.moveSpeedEvasionBuff = true;
      },
    },
    {
      cost: 6,
      description: `${characterNames.Benji}'s regen is`,
      description2: `increased at low health`,
      apply: async () => {
        this.gameManager.player.regenIncreaseBuff = true;
      },
    },
    {
      cost: 3,
      description: `+ ${enemyName} health`,
      description2: `+ ${characterNames.Benji} Fire Rate`,
      apply: async () => {
        this.gameManager.levelManager.enemyTypes =
          this.gameManager.levelManager.enemyTypes.map((e) => {
            e.health *= 1.5;
            return e;
          });
        this.gameManager.player.attackSpeed *= 0.85;
      },
    },
    {
      cost: 2,
      description: `+ ${enemyName} count`,
      description2: `+ ${characterNames.Benji} Proj Speed`,
      apply: async () => {
        this.gameManager.levelManager.baseEnemyCount *= 1.5;
        this.gameManager.player.bulletSpeed *= 1.2;
      },
    },
    {
      cost: 1,
      description: `Changes ${enemyName} attacks`,
      description2: `+ ${characterNames.Benji} Evasion`,
      apply: async () => {
        this.gameManager.levelManager.enemyTypes =
          this.gameManager.levelManager.enemyTypes.map((e) => {
            e.shootPattern = "megaspread";
            return e;
          });
        this.gameManager.player.evasion += 5;
      },
    },
    {
      cost: 5,
      description: `+ ${characterNames.Benji} damage`,
      description2: `- ${characterNames.Benji} health`,
      apply: async () => {
        this.gameManager.player.maxLife /= 1.5;
        this.gameManager.player.damage *= 1.5;
      },
    },
    {
      cost: 0,
      description: `(Last Chance!)`,
      description2: `Megashot`,
      apply: async () => {
        this.gameManager.player.shootPattern = "megaspread";
      },
    },
  ];
}
