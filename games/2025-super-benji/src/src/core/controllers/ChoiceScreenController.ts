import { addClick, clearClicks } from "./ClickController";
import { drawEngine } from "./DrawController";
import { GameController } from "./GameController";

export abstract class ChoiceScreenController<T> {
  isActive = false;
  canSelectOption = false;
  options: T[] = [];

  protected gameManager: GameController;

  constructor(gameManager: GameController) {
    this.gameManager = gameManager;
  }

  start() {
    this.isActive = true;
    this.canSelectOption = true;
    this.options = this.generateOptions();

    this.gameManager.storyController.randomiseDialog();
    clearClicks();
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.isActive) return;

    // Dim background
    drawEngine.save();
    ctx.fillStyle = "#000000b3";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Title
    drawEngine.drawTitle(this.getTitle(), 24, drawEngine.getCenterX(), 30);

    this.drawIntroSection();
    this.drawOptions(ctx);

    drawEngine.restore();
  }

  private drawOptions(ctx: CanvasRenderingContext2D) {
    drawEngine.save();
    const boxHeight = 90;
    const x = 10;
    const width = ctx.canvas.width - x * 2;

    clearClicks();

    this.options.forEach((option, index) => {
      const y = 200 + index * (boxHeight + 15);

      this.drawOption(ctx, x, y, width, boxHeight, option);

      if (!this.canSelectOption) return;

      addClick(x, y, width, boxHeight, () => {
        this.handleSelection(option);
      });
    });

    drawEngine.restore();
  }

  /** To be implemented by subclasses */
  protected abstract generateOptions(): T[];
  protected abstract drawOption(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    option: T
  ): void;

  protected abstract handleSelection(option: T): void;
  protected abstract getTitle(): string;
  protected abstract drawIntroSection(): void;
}
