import { SceneState } from '@/core/scene-state';
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { MenuState } from '@/game-states/menu.state';
import { Box } from '@/model/common.model';
import { TileMapGenerator } from '@/classes/TileMapGenerator';
import { gameStateMachine } from '@/core/game-state-machine';
import { Vector2 } from '@/core/vector';
import { GameManager } from '@/classes/GameManager';
import { time } from '@/core/time';
import { Camera } from '@/classes/Camera';

class GameState implements SceneState {

  public levelNumber = 1;
  public tileMapGenerator!: TileMapGenerator;
  public camera!: Camera;

  private gameManager!: GameManager;
  private menuState!: MenuState;


  public MAP_WIDTH: number = 0;// 16 * 20; // Width of the map
  public MAP_HEIGHT: number = 0;// 16 * 11.25; // Height of the map

  public MAP_SCALE: number = 1.6; // Scale of the map, used for zooming in/out
  public VIEWPORT_WIDTH: number = drawEngine.canvasWidth / this.MAP_SCALE; // Width of the viewport
  public VIEWPORT_HEIGHT: number = drawEngine.canvasHeight / this.MAP_SCALE; // Height of the viewport
  // public VIEWPORT_CENTER_X: number = this.VIEWPORT_WIDTH / 2; // Center X of the viewport
  // public VIEWPORT_CENTER_Y: number = this.VIEWPORT_HEIGHT / 2; // Center Y of the viewport

  // public MAX_SCROLL_X: any;// = this.MAP_WIDTH - this.VIEWPORT_WIDTH
  // public MAX_SCROLL_Y: any;// = this.MAP_HEIGHT - this.VIEWPORT_HEIGHT


  constructor() {
  }

  // Make sure ball starts at the same spot when game is entered
  onEnter() {
    time.reset(performance.now());

    this.gameManager = new GameManager();

    this.gameManager.enter();



    this.camera = new Camera(this.VIEWPORT_WIDTH, this.VIEWPORT_HEIGHT);
    this.camera.setMapSize(this.gameManager.tileMapGenerator.mapWidth, this.gameManager.tileMapGenerator.mapHeight);

    
    this.camera.setLockZones(
      [
        new Box(new Vector2(-6, 115), 110, 100),
        new Box(new Vector2(288, 136), 177, 104),
        new Box(new Vector2(248, -5), 209, 100),
      ]
    );

    // this.MAP_WIDTH = gameManager.tileMapGenerator.mapWidth;
    // this.MAP_HEIGHT = gameManager.tileMapGenerator.mapHeight;

    // // this.MAX_SCROLL_X = this.MAP_WIDTH - this.VIEWPORT_WIDTH
    // this.MAX_SCROLL_X = this.MAP_WIDTH - (this.VIEWPORT_WIDTH ); // FOR TESTING PURPOSES
    // this.MAX_SCROLL_Y = this.MAP_HEIGHT - this.VIEWPORT_HEIGHT

    this.gameManager.player.position = new Vector2(20, ((this.gameManager.tileMapGenerator.mapHeight - 75)))
    // this.gameManager.player.position = new Vector2(510, ((this.gameManager.tileMapGenerator.mapHeight - 280)))
  }

  onUpdate(delta: number) {

    this.camera.follow(this.gameManager.player.position,
      this.gameManager.player.center,
      this.gameManager.player.hitBox
    )

    // var horzontalScrollDistance: number = Math.min(
    //   Engine.lerp(0,
    //      Math.max(0,
    //        gameManager.player.center.x - this.VIEWPORT_CENTER_X
    //       )
    //      ,1),
    //   this.MAX_SCROLL_X
    // );

    // var verticalScrollDistance: number = Math.min(
    //   Engine.lerp(0,
    //      Math.max(0,
    //        gameManager.player.center.y - this.VIEWPORT_CENTER_Y
    //       ),1),
    //   this.MAX_SCROLL_Y
    // );

    drawEngine.context.clearRect(0, 0, drawEngine.canvasWidth, drawEngine.canvasHeight);

    drawEngine.context.save();
    this.camera.applyTransform(drawEngine.context);
    // drawEngine.context.scale(this.MAP_SCALE, this.MAP_SCALE);
    // drawEngine.context.translate(
    //   -Math.round(horzontalScrollDistance),
    //   -Math.round(verticalScrollDistance)
    // );    

    this.gameManager.update(delta, this.camera);
     
    // this.camera.debugLockCameraBox();

    drawEngine.context.restore(); // context restore after all update for the screen setup.

    // if (controls.isEscape) {
    //   this.menuState = new MenuState();
    //   gameStateMachine.setState(this.menuState);
    // }
  }

  screenSetUp() {
    drawEngine.context.fillStyle = '#10141f';
    drawEngine.context.fillRect(0, 0, drawEngine.canvasWidth, drawEngine.canvasHeight);
  }
}

export const gameState = new GameState();
