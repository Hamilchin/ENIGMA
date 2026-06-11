export class Item {
    constructor(name, type, value, icon, mainColour) {
        this.uuid = crypto.randomUUID();
        this.name = name;
        this.type = type;
        this.value = value;
        this.icon = icon;
        this.mainColour = mainColour;
    }

    get shopPrice() {
        return Math.ceil(this.value * window.shop.priceModifier);
    }

    draw() {
        let itemContainerElement = document.createElement("div");
        itemContainerElement.classList.add("item-container", `type-${this.type}`);
        let itemElement = document.createElement("div");
        itemElement.classList.add("item");
        itemElement.innerText = this.name;
        itemElement.style.backgroundImage = `url(${this.icon})`;
        itemContainerElement.appendChild(itemElement);
        return itemContainerElement;
    }

    clone() {
        return new Item(this.name, this.type, this.value, this.icon);
    }
}
