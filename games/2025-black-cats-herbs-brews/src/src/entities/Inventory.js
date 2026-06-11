import { ItemManager } from '../config/ItemManager';
import { cupboard } from '../drawables/images';
import { onMouseIn } from '../utils/interaction';
import { ItemContainer } from './generic/ItemContainer';

export class Inventory extends ItemContainer {
    constructor(triggerElement, parentElement) {
        super(triggerElement, parentElement, cupboard, ["#000000ff", "#5b2d19ff", "#703c25ff"]);
        this.sizeIncrement = 5;
        this.size = 10;
        this.items = [];
    }

    drawContents() {
        super.drawContents();
        this.parentElement.classList = ["inventory"];

        let goldNumber = document.createElement("div");
        goldNumber.innerText = `${window.player.gold}🪙`;
        let debtMarker = document.createElement("div");
        debtMarker.classList.add("debt");
        debtMarker.innerText = window.player.debt > 0 ? '(↘)' : '';
        onMouseIn(debtMarker, () => {
            window.tooltipShowWithIcon(null, "debt", `you owe ${window.player.debt}🪙 (${window.player.dailyDebt}🪙/day)`);
        }, false);

        let buyIngredientsButton = document.createElement("button");
        buyIngredientsButton.innerText = "shop";
        buyIngredientsButton.onclick = () => {
            let shopOptions = ItemManager.ingredients.map(i => {
                return [`${i.shopPrice}🪙 - ${i.name}`, () => {
                    window.player.buyItem(i.clone());
                }];
            });
            let recipes = ItemManager.recipes
                .filter(r => !window.player.knownRecipes.includes(r))
                .map(r => {
                    return [`${r.result.shopPrice * 2}🪙 - recipe: ${r.result.name}`, () => {
                        window.player.buyRecipe(r, r.result.shopPrice * 2);
                    }];
                });
            window.popUpWithOptions("shop", {
                ...Object.fromEntries(shopOptions),
                ...Object.fromEntries(recipes),
                "close": window.closePopUp
            });
        };

        let loanButton = document.createElement("button");
        loanButton.innerText = "take a loan (250🪙)";
        loanButton.onclick = () => {
            if (window.player.debt >= 750) {
                return;
            }
            window.player.addDebt(250 * 1.25);
            window.player.gold += 250;
            this.drawContents();
        };

        let goldDisplay = document.createElement("div");
        goldDisplay.classList.add("gdisp");
        goldDisplay.appendChild(goldNumber);
        goldDisplay.appendChild(debtMarker);
        goldDisplay.appendChild(buyIngredientsButton);
        goldDisplay.appendChild(loanButton);
        this.parentElement.appendChild(goldDisplay);
    }
}