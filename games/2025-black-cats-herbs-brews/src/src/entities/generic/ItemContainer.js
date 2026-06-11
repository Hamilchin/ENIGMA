import { onMouseDown, onMouseIn, onMouseUp } from '../../utils/interaction';
import { Drawable } from './Drawable';

export class ItemContainer extends Drawable {
    constructor(triggerElement, parentElement, imageMatrix, mirrorImage, colours) {
        super(triggerElement, imageMatrix, mirrorImage, colours);
        this.triggerElement = triggerElement;
        this.parentElement = parentElement;
        this.upgradeCost = 50;
        this.size = 10;
        this.items = [];
        onMouseUp(this.triggerElement, () => {
            this.onMouseUp();
        });
    }

    get hasSpace() {
        return this.items.length < this.size;
    }

    addAll(items) {
        items.forEach(item => this.add(item));
    }

    add(item) {
        if (this.hasSpace) {
            this.items.push(item);
        } else {
            throw new Error("it's full");
        }
    }

    hasItemType(itemName) {
        return this.items.some(i => i.name === itemName);
    }

    hasAllItems(itemNames) {
        return itemNames.every(name => this.hasItemType(name));
    }

    remove(item) {
        if (!item) {
            throw new Error("item not found");
        }
        this.items = this.items.filter(i => i.uuid !== item.uuid);
        return item;
    }

    upgrade() {
        if(window.player.gold >= this.upgradeCost){
            this.size = this.size + this.sizeIncrement;
            window.player.gold -= this.upgradeCost;
            this.upgradeCost = Math.ceil(this.upgradeCost * 1.5);
        }
        this.drawContents();
    }

    // onClickItem(item, itemContainerElement, event) {
    // }

    onMouseDownItem(item, itemContainerElement, event) {
        window.shop.currentlyHolding = item;
        window.shop.currentlyHoldingOrigin = this;
    }

    onMouseInItem(item, itemContainerElement, event) {
        window.tooltipShowWithIcon(item.icon, item.name, `${item.type}\n\nsells for: ${item.value}🪙`);
        return false;
    }

    onMouseUp() {
        if (window.shop.currentlyHolding && window.shop.currentlyHoldingOrigin !== this) {
            try {
                this.add(window.shop.currentlyHolding);
                window.shop.currentlyHoldingOrigin.remove(window.shop.currentlyHolding);
            } catch (e) {
                window.popUpMsg(e.message, 1500);
            }
            window.shop.currentlyHolding = null;
            window.shop.currentlyHoldingOrigin = null;
        }
    }

    drawContents() {
        this.parentElement.innerHTML = "";
        this.parentElement.style.background = this.background;
        let upgradeButton = document.createElement("button");
        upgradeButton.innerText = `upgrade (${this.upgradeCost}🪙)`;
        if(window.player.gold >= this.upgradeCost){
            upgradeButton.onclick = () => this.upgrade();
        } else {
            upgradeButton.disabled = true;
        }
        this.parentElement.appendChild(upgradeButton);
        let itemHolder = document.createElement("div");
        itemHolder.classList.add("item-holder");
        this.items.forEach(i => {
            let drawnItem = i.draw();
            // onClick(drawnItem, (e) => this.onClickItem(i, drawnItem, e));
            onMouseDown(drawnItem, (e) => this.onMouseDownItem(i, drawnItem, e));
            onMouseIn(drawnItem, (e) => this.onMouseInItem(i, drawnItem, e));
            itemHolder.appendChild(drawnItem);
        });
        for (let i = this.items.length; i < this.size; i++) {
            let itemContainerElement = document.createElement("div");
            itemContainerElement.classList.add("item-container", "empty");
            let itemElement = document.createElement("div");
            itemElement.classList.add("item");
            itemContainerElement.appendChild(itemElement);
            itemHolder.appendChild(itemContainerElement);
        }
        this.parentElement.appendChild(itemHolder);
    }
}