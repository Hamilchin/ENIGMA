import { controls } from '@/core/controls';
import { gameStateMachine } from '@/core/game-state-machine';
import { MenuState } from './menu.state';
import { DrawEngine, drawEngine } from '@/core/draw-engine';
import { SceneState } from '@/core/scene-state';
import { zzfxX, zzfxM, zzfxP, zzfxXReset } from '@/audio/zzfx';
import { bgm } from '@/audio/audio';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@/constans/game-contstans';
import { gameState } from './game.state';

class GamerEndState implements SceneState {

  private patternOffset = 0;
  music: AudioBufferSourceNode | null = null;

  onEnter() {
    zzfxX?.close();
    zzfxXReset();
    new DrawEngine(1920, 1080);
  }
  onUpdate() {
    // const context = drawEngine.context;
    // const canvasWidth = drawEngine.canvasWidth;
    // const canvasHeight = drawEngine.canvasHeight;
    // const tileSize = 100; 

    // // Update the pattern offset to create movement
    // this.patternOffset -= 0.2;
    // if (this.patternOffset <= -tileSize) {
    //     this.patternOffset = 0; 
    // }

    // // Translate the canvas to the center and rotate the entire context
    // context.save();
    // context.translate(canvasWidth / 2, canvasHeight / 2);
    // context.rotate(Math.PI / 4); // Rotate the entire canvas by 45 degrees

    // for (let y = -canvasHeight; y < canvasHeight; y += tileSize) {
    //     for (let x = -canvasWidth; x < canvasWidth; x += tileSize) {
    //         const adjustedX = x + this.patternOffset;

    //         // Alternating between two colors
    //         context.fillStyle = (Math.floor((adjustedX / tileSize) + (y / tileSize)) % 2 === 0) ? '#282328' : '#a3a29a';
    //         context.fillRect(adjustedX, y, tileSize, tileSize);
    //     }
    // }

    // // Restore canvas rotation
    // context.restore(); 
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem('gameWin')) {

      const xCenter = drawEngine.context.canvas.width / 2;
      drawEngine.drawText('Congratulations!', 200, xCenter, 350, '#c56981');
      drawEngine.drawText('You saved your love', 60, xCenter, 550, '#a3a29a');
      drawEngine.drawText('Thank you for playing!', 60, xCenter, 620, '#a3a29a');
      drawEngine.drawText('Press [Enter] or (A) to Return to the Main Menu', 50, xCenter, 750, '#a3a29a');
    
    } else if (typeof sessionStorage !== "undefined" && sessionStorage.getItem('gameOver')) {

      const xCenter = drawEngine.context.canvas.width / 2;
      drawEngine.drawText('Game Over', 200, xCenter, xCenter/2, '#c56981');
      drawEngine.drawText('Press [Enter] or (A) to Return to the Main Menu', 50, xCenter, 650, '#545c7e');
    }
    this.updateControls();
  }

  updateControls() {
    if ((controls.isConfirm && !controls.previousState.isConfirm) || (controls.isAttack && !controls.previousState.isAttack)) {
      const menuState = new MenuState();
      gameStateMachine.setState(menuState);
      // sessionStorage.removeItem('unlocked'); 
    }
  }

  onExit() {
    sessionStorage.removeItem('gameWin');
    sessionStorage.removeItem('gameOver');
    new DrawEngine(CANVAS_WIDTH, CANVAS_HEIGHT);
  }
}

export const gamerEndState = new GamerEndState();
