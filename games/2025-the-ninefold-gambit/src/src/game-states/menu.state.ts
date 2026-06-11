import { SceneState } from '@/core/scene-state';
import { DrawEngine, drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/core/game-state-machine';
import { gameState } from './game.state';
import { images } from '@/classes/Images';
import { Vector2 } from '@/core/vector';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@/constans/game-contstans';
import { zzfx, zzfxM, zzfxP } from '@/audio/zzfx';
import { bgm } from '@/audio/audio';
import { Engine } from '@/core/engine';
import { time } from '@/core/time';

type MenuButton = {
  label: string;
  action: () => void;
};

export class MenuState implements SceneState {
  private selectedIndex = 0;
  private isMusicOn = false;
  private isPressedAnyKey = false;
  private gameStartText: string = '';

  private currentTime = 0;
  private blinkInterval = 500;

  public music: AudioBufferSourceNode | null = null;


  private buttons: MenuButton[] = [
    {
      label: 'Start Game',
      action: () => {
        new DrawEngine(CANVAS_WIDTH, CANVAS_HEIGHT);
        gameStateMachine.setState(gameState);
      }
    },
    {
      label: this.isMusicOn ? 'Music: on' : 'Music: off',
      action: () => {
        this.toggleMusic();
        console.log('Toggle music: ', this.isMusicOn);
      }
    },
    {
      label: 'Full Screen',
      action: () => this.toggleFullscreen()
    }
  ];

  onEnter() {
    time.reset(performance.now());

    new DrawEngine(1920, 1080);

    let unlocked = false;

    
    if (!controls.isMobile) {
      this.gameStartText = 'Press any key'
      document.addEventListener('keydown', () => {
        if (this.isPressedAnyKey) return;
        this.unlockGame(unlocked)
      });
    } else {
      this.gameStartText = 'Touch to start'
      document.addEventListener('touchend', () => {
        if (this.isPressedAnyKey) return;
        this.unlockGame(unlocked)
      });
    }

    this.halfSecond = Engine.ticker(500);

  }

  halfSecond: any;
  buttonBlink: any;
  onUpdate(delta: number) {
    const xCenter = drawEngine.context.canvas.width / 2;


    if (!this.isPressedAnyKey) {
      if (this.halfSecond.tick(delta)) {
        this.buttonBlink = !this.buttonBlink
      }

      if (this.buttonBlink) {
        drawEngine.drawText(this.gameStartText, 50, xCenter, 550, 'white', "center");
      }

      // this.countdown = new Timer(1000, () => {
      //   console.log('5 seconds passed!');
      //   drawEngine.drawText('Press any key', 50, xCenter, 550, 'white', "center");
      // });

    } else {

      // this.isPressedAnyKey = false;
      drawEngine.drawText('The Ninefold Gambit', 200, xCenter, 350, '#c56981', "center");
      drawEngine.drawText('© 2025 Himanshu Bisht', 50, xCenter, 1010, '#a3a29a', "center");

      const buttonWidth = 300;
      const buttonHeight = 80;
      const buttonSpacing = 20;
      const startY = 600;

      this.buttons.forEach((button, index) => {
        if (button?.label === 'Music: on' && !this.isMusicOn) {
          button.label = 'Music: off'
        } else if (button?.label === 'Music: off' && this.isMusicOn) {
          button.label = 'Music: on'
        }
        const y = startY + index * (buttonHeight + buttonSpacing);
        this.drawButton(xCenter - buttonWidth / 2, y, buttonWidth, buttonHeight, button.label, index === this.selectedIndex);
      });


    }


    this.updateControls();

    // this.countdown.update()
    // const remaining = this.countdown.getTimeRemaining();
    // console.log(`Remaining time: ${remaining.toFixed(0)} ms`);
  }

  private drawButton(x: number, y: number, width: number, height: number, text: string, isSelected: boolean) {
    const ctx = drawEngine.context;

    ctx.fillStyle = isSelected ? '#a3a29a' : '#282328';
    ctx.fillRect(x, y, width, height);

    ctx.lineWidth = 6;
    ctx.strokeStyle = isSelected ? '#a3a29a' : '#a3a29a';
    ctx.strokeRect(x, y, width, height);

    const textColor = isSelected ? '#282328' : '#a3a29a';
    drawEngine.drawText(text, 45, x + width / 2, y + height / 2 + 2, textColor, 'center');
  }

  updateControls() {
    const maxIndex = this.buttons.length - 1;

    if (controls.isDown && !controls.previousState.isDown) {
      this.selectedIndex = (this.selectedIndex + 1) > maxIndex ? 0 : this.selectedIndex + 1;
    }

    if (controls.isUp && !controls.previousState.isUp) {
      this.selectedIndex = (this.selectedIndex - 1) < 0 ? maxIndex : this.selectedIndex - 1;
    }

    if (this.isPressedAnyKey && ((controls.isConfirm && !controls.previousState.isConfirm) || (controls.isAttack && !controls.previousState.isAttack))) {
      const selectedButton = this.buttons[this.selectedIndex];
      selectedButton.action();
    }
  }

  toggleMusic() {
    this.isMusicOn = !this.isMusicOn;
    // for (let i = 0; i < this.buttons.length; i++) {
    //   if (this.buttons[i]?.label === 'Music: on' && this.isMusicOn) {
    //     this.buttons[i].label = 'Music: off'
    //   } else if (this.buttons[i]?.label === 'Music: off' && !this.isMusicOn) {
    //     this.buttons[i].label = 'Music: on'
    //   }
    // }
    this.toggleBGM();

  }

  public toggleBGM() {
    if (this.music) {
      this.music.stop();
      this.music = null;
    } else {
      // @ts-ignore
      this.music = zzfxP(...zzfxM(...bgm));
      this.music!.loop = true;
    }
  }

  // public startBGM() {
  //   if (!this.music) {
  //     // @ts-ignore
  //     this.music = zzfxP(...zzfxM(...bgm));
  //     this.music!.loop = true;
  //   }
  // }

  private unlockGame(unlocked: boolean) {
    if (!unlocked) {
      // this.startBGM();
      this.toggleBGM();
      unlocked = true;
      this.isMusicOn = true;
      this.isPressedAnyKey = true;
    }
  }

  // public toggleBGM() {
  //   if (this.music) {
  //     this.music.stop();
  //     this.music = null;
  //   } else {
  //     // @ts-ignore
  //     this.music = zzfxP(...zzfxM(...bgm));
  //     this.music!.loop = true;
  //   }
  // }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
}

// export const menuState = new MenuState();
