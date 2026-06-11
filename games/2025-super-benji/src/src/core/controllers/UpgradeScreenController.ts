import { Upgrade, ItemRarity } from "../types";
import { UpgradeController } from "./UpgradeController";
import { DEFAULT_FONT, RARITY_WEIGHTS, RarityLabel, WHITE } from "../config";
import { GameController } from "./GameController";
import { ChoiceScreenController } from "./ChoiceScreenController";
import { drawEngine } from "./DrawController";
import { screenTransitions } from "./ScreenTransitionController";
import { clearClicks } from "./ClickController";

export class UpgradeScreenController extends ChoiceScreenController<Upgrade> {
  private allUpgrades: Upgrade[] = [];

  constructor(gameManager: GameController) {
    super(gameManager);
    const upgradeController = new UpgradeController(gameManager);
    this.allUpgrades = upgradeController.getAllUpgrades();
  }

  protected getTitle() {
    return "Zone Cleared!";
  }

  protected drawIntroSection() {
    this.gameManager.storyController.drawUpgradeDialog("Torx");
  }

  protected generateOptions(): Upgrade[] {
    const chosen: Upgrade[] = [];
    const pickFromRarity = (rarity: ItemRarity): Upgrade => {
      let pool = this.allUpgrades.filter(
        (u) => u.rarity === rarity && !chosen.includes(u)
      );
      if (!pool.length) {
        pool = this.allUpgrades.filter(
          (u) => u.rarity === RarityLabel.Common && !chosen.includes(u)
        );
      }
      if (!pool.length) {
        pool = this.allUpgrades.filter((u) => !chosen.includes(u));
      }
      return pool[Math.floor(Math.random() * pool.length)];
    };

    while (chosen.length < 3) {
      const r = Math.random() * 100;
      let rarity: ItemRarity;
      if (r <= RARITY_WEIGHTS.Legendary) rarity = RarityLabel.Legendary;
      else if (r <= RARITY_WEIGHTS.Legendary + RARITY_WEIGHTS.Epic)
        rarity = RarityLabel.Epic;
      else if (
        r <=
        RARITY_WEIGHTS.Legendary + RARITY_WEIGHTS.Epic + RARITY_WEIGHTS.Rare
      )
        rarity = RarityLabel.Rare;
      else rarity = RarityLabel.Common;

      chosen.push(pickFromRarity(rarity));
    }

    return chosen;
  }

  protected drawOption(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    upgrade: Upgrade
  ) {
    const padding = 10;
    const lineHeight = 18;

    let borderColor = "#aaa";
    let borderDarkColor = "#1d1d1d";
    if (upgrade.rarity === "Rare") {
      borderColor = "#60a5fa";
      borderDarkColor = "#132741";
    } else if (upgrade.rarity === "Epic") {
      borderColor = "#c084fc";
      borderDarkColor = "#2a1d38";
    } else if (upgrade.rarity === "Legendary") {
      borderColor = "#fb923c";
      borderDarkColor = "#41250f";
    }

    drawEngine.drawBeveledRect(
      ctx,
      x,
      y,
      w,
      h,
      1,
      "#333",
      borderColor,
      borderDarkColor
    );

    const fontSize = "16px";

    let textY = y + lineHeight;
    ctx.fillStyle = borderColor;
    ctx.font = `${fontSize} ${DEFAULT_FONT}`;
    ctx.fillText(`[${upgrade.rarity}]`, x + padding, textY);

    textY += lineHeight;
    ctx.font = `900 ${fontSize} ${DEFAULT_FONT}`;
    ctx.fillStyle = WHITE;
    ctx.fillText(upgrade.name, x + padding, textY);

    ctx.font = `${fontSize} ${DEFAULT_FONT}`;
    textY += lineHeight;
    ctx.fillText(upgrade.description, x + padding, textY);

    if (upgrade.description2) {
      textY += lineHeight;
      ctx.fillText(upgrade.description2, x + padding, textY);
    }
  }

  protected handleSelection(upgrade: Upgrade) {
    upgrade.apply();
    this.gameManager.musicPlayer.playMenuSuccess();
    this.canSelectOption = false;

    this.allUpgrades = this.allUpgrades.filter((u) => {
      if (u.rarity === RarityLabel.Common) return true;
      return u !== upgrade;
    });

    screenTransitions.fadeOutThenIn(() => {
      clearClicks();
      this.isActive = false;
      this.gameManager.levelManager.nextLevel();
    });
  }
}
