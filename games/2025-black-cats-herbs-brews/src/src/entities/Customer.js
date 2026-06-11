import { femaleVillagerSkirt, maleVillagerBeard } from '../drawables/images';
import { Note } from '../utils/audio-utils';
import { adjust, base10ToHex, newColour } from '../utils/colour';
import { onClick, onMouseDown, onMouseIn, onMouseUp } from '../utils/interaction';
import { int, pick } from '../utils/random';
import { Drawable } from './generic/Drawable';

let formatWants = (wants) => {
    if (wants.length === 1) {
        return wants[0].name;
    } else {
        return `${wants.slice(0, -1).map(item => item.name).join(", ")} and ${wants[wants.length - 1].name}`;
    }
};

let populateDialogue = (line) => {
    dlg_c.style.display = "none";
    dlgt.innerHTML = "";
    dlgo.innerHTML = "";
    setTimeout(() => {
        dlg_c.style.display = "block";
        dlgt.innerHTML = line.text;
        setTimeout(() => {
            populateOptions(line.options || []);
        }, 650);
    }, 200);
};

let populateOptions = (options) => {
    let list = document.createElement('ul');
    options.forEach(option => {
        let optionElement = document.createElement('li');
        optionElement.innerHTML = option.text;
        onClick(optionElement, () => {
            option.action();
        });
        onMouseDown(optionElement, () => { }, Note.new("c", 5, 0.05));
        onMouseIn(optionElement, () => { }, Note.new("f#", 4, 0.05));
        list.appendChild(optionElement);
    });
    dlgo.innerHTML = "";
    dlgo.appendChild(list);
};

let leave = () => {
    window.customer.disappear();
};

let nextDialogue = () => {
    window.customer.doDialogue(window.customer.nextLine);
};

let wait = () => {
    dlg_c.style.display = 'none';
    dlgt.innerHTML = "";
    dlgo.innerHTML = "";
    setTimeout(() => {
        nextDialogue();
    }, int(1000, 5000));
};

let waitForSale = () => {
    dlg_c.style.display = 'none';
    dlgt.innerHTML = "";
    dlgo.innerHTML = "";
    window.customer.waitForSale();
};

export class Customer extends Drawable {
    constructor(canvas, wants) {
        let topColour = newColour(int(0, 360) / 360, 0.5, 0.4) + "ff";
        let topShading = adjust(topColour, -50) + "ff";
        let bottomColour = newColour(int(0, 360) / 360, 0.7, 0.3) + "ff";
        let eyeColour = newColour(int(0, 360) / 360, 0.8, 0.5) + "ff";
        let hairRedChannel = `${int(22, 99)}`.padStart(2, '0');
        let hairGreenChannel = `${int(0, 20)}`.padStart(2, '0');
        let hairBlueChannel = `${int(0, 20)}`.padStart(2, '0');
        let hairGrays = base10ToHex(int(0, 200));
        let hairColour = pick(`#${hairGrays}${hairGrays}${hairGrays}ff`, `#${hairRedChannel}${hairGreenChannel}${hairBlueChannel}ff`);
        let hairShading = adjust(hairColour, -20) + "ff";
        let skinColour = pick("#513021ff", "#803716ff", "#a96238ff", "#f9bf91ff", "#dfc9b8ff");
        let isFemale = pick(true, false);
        super(canvas,
            isFemale ? femaleVillagerSkirt : maleVillagerBeard,
            isFemale ? ["#000000ff", hairShading, hairColour, skinColour, "#ffffffff", eyeColour, topColour, "#cd6644ff", "#ce3b4dff", "#77624cff", "#e7d3bcff", topShading, adjust(eyeColour, -50) + "ff"] : ["#000000ff", hairShading, hairColour, skinColour, "#ffffffff", eyeColour, "#a2462dff", "#8b2d16ff", topShading, topColour, "#b38558ff", "#e9c897ff", "#b26824ff", adjust(bottomColour, -50) + "ff", bottomColour]
        );
        this.isFemale = isFemale;

        this.wants = wants; // Array of items the customer wants
        this.inventory = [];
        this.goldNeeded = this.wants.reduce((total, item) => total + item.value, 0);
        this.gold = pick(this.goldNeeded, this.goldNeeded, int(this.goldNeeded / 2, this.goldNeeded * 2), 30);

        this.currentLineIndex = -1;
        this.justBrowsing = pick(true, false, false, false);
        this._waitingTimeout = null;
        this.hasWaited = false;
        onMouseUp(this.canvas, () => {
            this.onMouseUp();
        });
        onMouseIn(this.canvas, () => {
            this.onMouseIn();
        }, false);
    }

    get lines() {
        let wantLine = `${pick("do you have", "may i have")} ${formatWants(this.wants)}?`;
        let browsingLine = pick("just browsing", "i'm just looking");
        let greetingLine = pick("hi!", "hello!");
        return [
            {
                text: greetingLine,
                options: [
                    { text: `${pick("hello!", "hi!")} ${pick("how can i help?", "need something?")}`, action: nextDialogue },
                    { text: "get the hells out of my shop!", action: leave }
                ]
            },
            this.justBrowsing ? {
                text: browsingLine,
                options: [
                    {
                        text: "sure", action: () => {
                            if (pick(true, false, false)) {
                                this.justBrowsing = false;
                                this.currentLineIndex = 0;
                            }
                            wait();
                        }
                    },
                    { text: pick("get the hells out of my shop!", "this isn't a museum"), action: leave }
                ]
            } : {
                text: wantLine,
                options: [
                    { text: `that will be ${this.goldNeeded}🪙`, action: waitForSale },
                    { text: `that will be ${Math.floor(this.goldNeeded * 1.5)}🪙`, action: () => { this.goldNeeded = Math.floor(this.goldNeeded * 1.5); waitForSale(); } },
                    { text: "i can't help you with that", action: leave }
                ]
            },
            {
                text: pick("bye!", "have a good day"),
                options: [
                    { text: pick("come again!", "take care!"), action: leave }
                ]
            }
        ];
    }

    get nextLine() {
        this.currentLineIndex++;
        return this.lines[this.currentLineIndex];
    }

    doDialogue(nextLine) {
        let line = nextLine || this.nextLine;
        populateDialogue(line);
    }

    appear() {
        this.canvas.style.bottom = `${pick(-4, 0) * 10}px`;
        this.canvas.style.transform = 'scale(1,1)';
        this.canvas.style.left = '32px';
        setTimeout(() => {
            this.doDialogue();
        }, 650);
    }

    disappear() {
        this.canvas.style.transform = 'scale(-1,1)';
        dlg_c.style.display = 'none';
        dlgt.innerHTML = "";
        dlgo.innerHTML = "";
        setTimeout(() => {
            this.canvas.style.left = '-340px';
            setTimeout(() => {
                this.canvas.remove();
                window.customer = null;
            }, 1000);
        }, 200);
    }

    pay(gold) {
        this.gold -= gold;
        populateDialogue({
            text: pick(`here's ${gold}🪙`),
            options: [
                {
                    text: "thanks!", action: () => {
                        player.gold += gold;
                        window.shop.drawCurrentWindow();
                        leave();
                    }
                }
            ]
        });
    }

    returnItems() {
        try {
            window.player.inventory.addAll(this.inventory);
        } catch (error) {
            window.popUpMsg("not enough shelf space", 2000);
            return;
        }
        this.inventory = [];
        leave();
        window.shop.drawCurrentWindow();
    }

    waitForSale() {
        this._waitingTimeout = setTimeout(() => {
            if (!window.customer) {
                clearTimeout(this._waitingTimeout);
                return;
            }

            if (this.hasAllItems(this.wants.map(i => i.name))) {
                clearTimeout(this._waitingTimeout);
                if (this.gold >= this.goldNeeded) {
                    this.pay(this.goldNeeded);
                } else {
                    pick(true, false) ? populateDialogue({
                        text: `i can't afford ${this.gold}🪙 bye`,
                        options: [
                            { text: "okay", action: () => { this.returnItems(); } },
                        ]
                    }) : populateDialogue({
                        text: `i only have ${this.gold}🪙`,
                        options: [
                            { text: "get the hells out of my shop!", action: () => { this.returnItems(); } },
                            { text: "okay", action: () => { this.pay(this.gold); } }
                        ]
                    });
                }
            } else if (int(0, 10) > 8) {
                if (this.hasWaited && pick(true, true, false)) {
                    populateDialogue({
                        text: "this is taking too long",
                        options: [{ text: "okay", action: () => { this.returnItems(); } }]
                    });
                } else {
                    populateDialogue({
                        text: pick("will it take long?", "is it ready yet?"),
                        options: [
                            {
                                text: pick("just a moment longer", "i'm almost done"), action: () => {
                                    this.hasWaited = true;
                                    clearTimeout(this._waitingTimeout);
                                    waitForSale();
                                }
                            },
                            { text: pick("i can't help you with that", "i don't have that"), action: () => { this.returnItems(); } }
                        ]
                    });
                }
            } else {
                clearTimeout(this._waitingTimeout);
                waitForSale();
            }
        }, 1000);
    }

    addAll(items) {
        items.forEach(item => this.add(item));
    }

    add(item) {
        this.inventory.push(item);
    }

    hasItemType(itemName) {
        return this.inventory.some(i => i.name === itemName);
    }

    hasAllItems(itemNames) {
        return itemNames.every(name => this.hasItemType(name));
    }

    remove(item) {
        if (!item) {
            throw new Error("item not found");
        }
        this.inventory = this.inventory.filter(i => i.uuid !== item.uuid);
        return item;
    }

    wantsItem(itemName) {
        return this.wants.map(i => i.name).includes(itemName);
    }

    onMouseUp() {
        if (window.shop.currentlyHolding && window.shop.currentlyHoldingOrigin !== this) {
            if (!this.wantsItem(window.shop.currentlyHolding.name)) {
                this.doDialogue({
                    text: "i don't want that",
                    options: [{
                        text: "okay",
                        action: () => {
                            this.currentLineIndex = 0;
                            nextDialogue();
                        }
                    }]
                });
                return;
            }
            window.shop.currentlyHoldingOrigin.remove(window.shop.currentlyHolding);
            this.add(window.shop.currentlyHolding);
            window.shop.currentlyHolding = null;
            window.shop.currentlyHoldingOrigin = null;
            clearTimeout(this._waitingTimeout);
            this.waitForSale();
        }
    }

    onMouseIn() {
        let wants = this.currentLineIndex > 0 ? this.justBrowsing ? "they're just browsing" : `they want ${formatWants(this.wants)}` : "you don't know what they want";
        let has = this.inventory.length > 0 ? `holding ${formatWants(this.inventory)}` : "";
        window.tooltipShowWithIcon(this.canvas.toDataURL(), "customer", `${wants}\n${has}`);
    }

    animate() {
        let rows = [9, 10];
        let cells = [16, 17, 21, 22];
        if (this.isFemale) {
            rows = [13, 14, 15];
            cells = [16, 17, 22, 23];
        }

        this.blink(rows, cells, 4, 5, 6);
        return true;
    }
}