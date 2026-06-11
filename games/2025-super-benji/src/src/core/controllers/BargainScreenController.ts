import { DEFAULT_FONT, WHITE } from "../config";
import { Bargain } from "../types";
import { BargainController } from "./BargainController";
import { ChoiceScreenController } from "./ChoiceScreenController";
import { clearClicks } from "./ClickController";
import { drawEngine } from "./DrawController";
import { GameController } from "./GameController";
import { screenTransitions } from "./ScreenTransitionController";

export class BargainScreenController extends ChoiceScreenController<Bargain> {
  private allBargains: Bargain[] = [];

  constructor(gameManager: GameController) {
    super(gameManager);
    const bargainController = new BargainController(gameManager);
    this.allBargains = bargainController.getAllBargains();
  }

  update() {
    if (this.gameManager.player.isDead() && this.gameManager.player.lives > 0) {
      this.gameManager.paused = true;
      this.start();
      this.gameManager.player.revive();
    }
  }

  protected getTitle() {
    return "Life Exchange";
  }

  protected drawIntroSection() {
    this.gameManager.storyController.drawUpgradeDialog("Maggie");
    drawEngine.drawTitle(
      this.gameManager.player.lives.toString(),
      38,
      drawEngine.getCenterX(),
      92
    );
    drawEngine.drawBenjiCoin({
      x: drawEngine.getCenterX() + 45,
      y: 80,
    });
  }

  protected generateOptions(): Bargain[] {
    const lives = this.gameManager.player.lives;

    // Split 0-cost and >0-cost bargains
    const freeBargains = this.allBargains.filter((b) => b.cost === 0);
    const paidBargains = this.allBargains.filter(
      (b) => b.cost > 0 && b.cost < lives
    );

    // Shuffle paid bargains
    for (let i = paidBargains.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [paidBargains[i], paidBargains[j]] = [paidBargains[j], paidBargains[i]];
    }

    // If only 1 life left, return exactly one free option
    if (lives === 1 && freeBargains.length > 0) {
      return [freeBargains[0]];
    }

    return paidBargains;
  }

  protected drawOption(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    bargain: Bargain
  ) {
    const padding = 10;
    const lineHeight = 18;

    drawEngine.drawBeveledRect(
      ctx,
      x,
      y,
      w,
      h,
      1,
      "#201e31",
      "#5d5d8f",
      "#0f0f13"
    );

    let textY = y + lineHeight;

    drawEngine.drawTitle(
      bargain.cost.toString(),
      24,
      drawEngine.getCenterX() - 13,
      textY + 10
    );
    drawEngine.drawBenjiCoin(
      {
        x: drawEngine.getCenterX() + 13,
        y: textY + 3,
      },
      10
    );

    ctx.fillStyle = WHITE;
    ctx.font = `16px ${DEFAULT_FONT}`;
    textY += lineHeight * 2;
    ctx.fillText(bargain.description, x + padding, textY);

    if (bargain.description2) {
      textY += lineHeight;
      ctx.fillText(bargain.description2, x + padding, textY);
    }
  }

  protected handleSelection(bargain: Bargain) {
    bargain.apply();
    this.gameManager.player.lives -= bargain.cost;
    this.gameManager.musicPlayer.playMenuSuccess();
    this.canSelectOption = false;

    screenTransitions.fadeOutThenIn(() => {
      clearClicks();
      this.isActive = false;
      this.gameManager.paused = false;
    });
  }
}
