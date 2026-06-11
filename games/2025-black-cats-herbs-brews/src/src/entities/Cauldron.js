import { onClick, } from '../utils/interaction';
import { ItemContainer } from './generic/ItemContainer';
import { WebGLHandler, makeFumesShader } from '../effects/fumes';
import { ItemManager } from '../config/ItemManager';
import { cauldronTop } from '../drawables/images';
import { hexToRgbA } from '../utils/colour';

export class Cauldron extends ItemContainer {
    constructor(triggerElement, parentElement) {
        super(
            triggerElement,
            parentElement,
            cauldronTop,
            ["#000000ff", "#453333ff", "#382828ff", "#423030ff"]
        );
        this.size = 3;
        this.sizeIncrement = 1;
        this.brewingRecipe;
        this.resultSlot;
        this.brewProgressInterval;
    }

    brew() {
        if(this.brewingRecipe){
            return;
        }

        this.brewingRecipe = ItemManager.findRecipe(this.items);

        if (!this.brewingRecipe) {
            this.items = [];
            this.drawContents();
            throw new Error("oops... ingredients ruined");
        } else {
            if(!window.player.knownRecipes.includes(this.brewingRecipe)){
                window.player.knownRecipes.push(this.brewingRecipe);
            }
        }
        this.items = [];
        this.draw();
        setTimeout(() => {
            this.resultSlot = this.brewingRecipe.result.clone();
            this.brewingRecipe = null;
            this.draw();
            window.shop.drawCurrentWindow();
            this.drawProgress(start);
        }, this.brewingRecipe.brewingTimeInSeconds * 1000);
        let start = this.brewingRecipe.brewingTimeInSeconds;
        this.brewProgressInterval = setInterval(() => {
            this.drawProgress(--start);
        }, 1000);
        return this.brewingRecipe;
    }

    drawProgress(remainingTime) {
        let brewProgress = document.getElementById("brewProgress");
        if(this.brewingRecipe && brewProgress) {
            let percentage = `${(remainingTime/this.brewingRecipe.brewingTimeInSeconds)*100}%`;
            brewProgress.style.background = `linear-gradient(90deg,${this.brewingRecipe.result.mainColour} 0%, ${this.brewingRecipe.result.mainColour} ${percentage}, #00000000 ${percentage})`;
        } else {
            clearInterval(this.brewProgressInterval);
        }
    }

    drawContents() {
        super.drawContents();
        this.parentElement.classList = ["cauldron"];
        let recipeButton = document.createElement("button");
        recipeButton.innerText = "recipes";
        onClick(recipeButton, () => {
            let recipesContainer = document.createElement("div");
            recipesContainer.classList.add("recipes-container");
            window.player.knownRecipes.forEach(recipe => {
                recipesContainer.appendChild(recipe.asElement());
            });
            let closeButton = document.createElement("button");
            closeButton.innerText = "close";
            onClick(closeButton, () => {
                window.closePopUp();
            });
            window.popUp([recipesContainer, closeButton]);
        });
        let brewButton = document.createElement("button");
        brewButton.innerText = "brew";
        if(this.brewingRecipe){
            brewButton.disabled = true;
        }
        onClick(brewButton, () => {
            try {
                this.brew();
            } catch (e) {
                window.popUpMsg(e.message, 2500);
            }
        });

        
        let brewProgressElement = document.createElement("div");
        brewProgressElement.id = "brewProgress";
        brewProgressElement.style.height = "5px";
        brewProgressElement.style.width = "100px";
        this.parentElement.appendChild(brewButton);
        this.parentElement.appendChild(brewProgressElement);

        let itemHolder = document.createElement("div");
        itemHolder.classList.add("item-holder");
        if (this.resultSlot) {
            let drawnItem = this.resultSlot.draw();
            onClick(drawnItem, () => {
                window.shelves.add(this.resultSlot);
                this.resultSlot = null;
            });
            itemHolder.appendChild(drawnItem);
        } else {
            let itemContainerElement = document.createElement("div");
            itemContainerElement.classList.add("item-container", "empty");
            let itemElement = document.createElement("div");
            itemElement.classList.add("item");
            itemContainerElement.appendChild(itemElement);
            itemHolder.appendChild(itemContainerElement);
        }

        this.parentElement.appendChild(itemHolder);
        this.parentElement.appendChild(recipeButton);
    }

    draw() {
        super.draw();
        if (this.brewingRecipe) {
            let canvas = cldrnfx.appendChild(document.createElement("canvas"));
            canvas.style.display = "block";
            canvas.width = cldrnfx.clientWidth / 10;
            canvas.height = cldrnfx.clientHeight / 10;
            let [r, g, b, a] = hexToRgbA(this.brewingRecipe.result.mainColour);
            new WebGLHandler(canvas, makeFumesShader(r, g, b));
        } else {
            cldrnfx.innerHTML = "";
        }
    }
}