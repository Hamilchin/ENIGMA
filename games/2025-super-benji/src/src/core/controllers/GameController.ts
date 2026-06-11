import { Player } from "@/core/model/player";
import { Background } from "@/core/model/background";
import { Bullet } from "@/core/model/bullet";
import { LevelController } from "./LevelController";
import { Enemy } from "@/core/model/enemy";
import { CollisionController } from "./CollisionController";
import { SpriteController } from "./SpriteController";
import { BulletPool } from "../model/bulletPool";
import { UpgradeScreenController } from "./UpgradeScreenController";
import { roll } from "../utilities";
import { StoryController } from "./StoryController";
import { MusicPlayer } from "../music/music";
import { BargainScreenController } from "./BargainScreenController";
import { LOCAL_STORAGE_KEY, PLAYER_EVASION_CAP } from "../config";

export class GameController {
  musicPlayer!: MusicPlayer;
  spriteManager!: SpriteController;
  player!: Player;
  background: Background;
  levelManager!: LevelController;
  enemies: Enemy[] = [];
  playerBulletPool!: BulletPool;
  enemyBulletPool!: BulletPool;
  storyController: StoryController;
  upgradeScreen: UpgradeScreenController;
  bargainScreen: BargainScreenController;
  paused = true;

  constructor(spriteManager: SpriteController) {
    this.spriteManager = spriteManager;
    this.background = new Background();
    this.storyController = new StoryController(this);
    this.upgradeScreen = new UpgradeScreenController(this);
    this.bargainScreen = new BargainScreenController(this);
  }

  update(delta: number, mouse: { x: number; y: number }) {
    const { player, background, levelManager } = this;

    // Background
    background.update(delta, player.velocity);

    this.bargainScreen.update();

    if (this.bargainScreen.isActive || this.upgradeScreen.isActive) return;

    // Bullets
    this.playerBulletPool.updateAll(delta);
    this.enemyBulletPool.updateAll(delta);

    if (this.paused) return;

    // Player movement
    player.update(delta, mouse.x, mouse.y);

    // Enemies
    for (const enemy of this.enemies) {
      enemy.update(delta);
    }
    // Remove dead enemies
    this.enemies = this.enemies.filter(
      (enemy) => !enemy.offScreen() && !enemy.isDead()
    );

    // Player Bullet and enemy collision
    CollisionController.checkAll(
      this.playerBulletPool.pool.filter((b) => b.active && !b.isExploding),
      this.enemies.filter((e) => !e.isExploding),
      (bulletObject, enemyObject) => {
        const enemy = enemyObject as Enemy;
        const bullet = bulletObject as Bullet;

        enemy.takeDamage(bullet.damage);
        bullet.explode(6, 2);
      }
    );

    // Player and enemy proximity collision
    CollisionController.checkAll(
      [this.player],
      this.enemies,
      (playerObject, enemyObject) => {
        const player = playerObject as Player;
        const enemy = enemyObject as Enemy;
        player.takeDamage(enemy.proximityDamage);
      }
    );

    // Player and enemy bullet collision
    CollisionController.checkAll(
      [this.player],
      this.enemyBulletPool.pool.filter((b) => b.active && !b.isExploding),
      (playerObject, bulletObject) => {
        const player = playerObject as Player;
        const bullet = bulletObject as Bullet;

        bullet.explode(6, 2);

        let evasion = Math.min(player.evasion, PLAYER_EVASION_CAP);
        if (player.moveSpeedEvasionBuff) {
          evasion += player.movementXSpeed * 0.05;
        }
        if (roll() > evasion) {
          player.takeDamage(bullet.damage);
        }
      }
    );

    // Level logic
    levelManager && levelManager.update(delta);
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.upgradeScreen.isActive) {
      this.upgradeScreen.draw(ctx);
      return;
    }

    if (this.bargainScreen.isActive) {
      this.bargainScreen.draw(ctx);
      return;
    }

    this.background.draw(ctx);
    this.enemies.forEach((enemy) => enemy.draw(ctx));
    this.player.draw(ctx);
    this.levelManager && this.levelManager.draw();

    this.playerBulletPool.drawAll(ctx);
    this.enemyBulletPool.drawAll(ctx);

    if (this.storyController.isActive) {
      this.storyController.draw();
    }
  }

  addEnemy(enemy: Enemy) {
    this.enemies.push(enemy);
  }

  async init(musicPlayer: MusicPlayer): Promise<GameController> {
    // Anything that depends on sprites need to be awaited as the spritesheet is loaded, so we create some objects here instead of the constuctor
    this.musicPlayer = musicPlayer;
    // Create Bullet pools
    this.playerBulletPool = new BulletPool(100, () => {
      // always grab the latest sprite from the sprite manager
      return new Bullet(this.spriteManager.getBulletSprite());
    });
    this.enemyBulletPool = new BulletPool(
      100,
      () => new Bullet(this.spriteManager.getBulletSprite("red"))
    );

    // Create Player
    this.player = new Player(
      this,
      this.spriteManager.getPlayerSprite(),
      this.playerBulletPool
    );
    // Begin Story
    this.storyController.start();

    return this;
  }

  startGame() {
    this.storyController.isActive = false;
    this.paused = true;
    this.levelManager = new LevelController(this);

    if (localStorage.getItem(`${LOCAL_STORAGE_KEY}hasDied`) == "true") {
      // Make the game more interesting for players who have already played before by
      // doing a bargain at start of game
      this.bargainScreen.start();
    }
    // Make the game easier for new players without the Life Exchange screen straight away
    this.levelManager.nextLevel();
  }
}
