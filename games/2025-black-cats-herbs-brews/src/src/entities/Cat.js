import { ItemManager } from '../config/ItemManager';
import { cat } from '../drawables/images';
import { onClick, onMouseIn, onMouseUp } from '../utils/interaction';
import { int, pick } from '../utils/random';
import { Drawable } from './generic/Drawable';

export class Cat extends Drawable {
    constructor(canvas) {
        super(canvas,
            cat,
            ["#000000ff", "#282828ff", "#171717ff"],
            { x: 5, y: 0, width: 23, height: 22 });
        this.canvas = canvas;
        this.hunger = 0;
        this.isGone = false;
        onClick(this.canvas, () => {
            this.onClick();
        });

        onMouseUp(this.canvas, (e) => {
            if (window.shop.currentlyHolding && window.shop.currentlyHolding.type === "animal") {
                window.shop.currentlyHoldingOrigin.remove(window.shop.currentlyHolding);
                window.shop.drawCurrentWindow();
                window.shop.currentlyHoldingOrigin.draw();
                window.shop.currentlyHolding = null;
                window.shop.currentlyHoldingOrigin = null;
                this.hunger = 0;
            }
            return false;
        });

        onMouseIn(this.canvas, () => {
            window.tooltipShowWithIcon(canvas.toDataURL(), "your black cat", `she ${this.hunger > 70 ? "looks hungry" : this.hunger < 50 ? "is purring happily" : "looks restless"}`);
            return false;
        }, false);

        this.doMischief();
    }

    doMischief() {
        if (window.paused || this.isGone) {
            setTimeout(() => {
                this.doMischief();
            });
            return;
        }

        if (this.hunger > 70 && pick(true, true, this.hunger >= 100)) {
            if (window.player.inventory.items.length > 0) {
                this.bounce();
                let item = pick(...window.player.inventory.items);
                if (item.type === "animal") {
                    this.hunger = 0;
                }
                window.player.inventory.remove(item);
                window.shop.drawCurrentWindow();
            } else if (!this.isGone) {
                this.disappear();
                setTimeout(() => {
                    this.appear();
                    this.hunger = 0;
                }, 30000);
            }
        }
        setTimeout(() => {
            this.doMischief();
            this.hunger = Math.min(this.hunger + int(0, 10), 100);
        }, int(6000, 10000));
    }

    bounce() {
        this.canvas.classList.add("bounce");
        setTimeout(() => {
            this.canvas.classList.remove("bounce");
        }, 1000);
    }

    appear() {
        this.isGone = false;
        setTimeout(() => {
            this.canvas.classList.add("out");
            this.canvas.classList.remove("in");
            this.canvas.classList.remove("out-anim");
            this.canvas.classList.remove("in-anim");
            setTimeout(() => {
                this.canvas.classList.remove("out");
                this.canvas.classList.add("in-anim");
            }, 1);
        }, 1);
        setTimeout(() => {
            this.canvas.classList.remove("in-anim");
        }, 1000);
    }

    disappear() {
        this.isGone = true;
        setTimeout(() => {
            this.canvas.classList.remove("out");
            this.canvas.classList.remove("in");
            this.canvas.classList.remove("out-anim");
            this.canvas.classList.remove("in-anim");
            setTimeout(() => {
                this.canvas.classList.add("out-anim");
            }, 1);
        }, 1);
        setTimeout(() => {
            this.canvas.classList.add("out");
            this.canvas.classList.remove("out-anim");
        }, 1000);
    }

    findItem() {
        return pick(...ItemManager.ingredients, ...ItemManager.allItems).clone();
    }

    onClick() {
        if (this.hunger >= 100) {
            return;
        }
        this.disappear();
        setTimeout(() => {
            if (window.player.inventory.hasSpace) {
                setTimeout(() => {
                    if (pick(true, false, false, false, false)) {
                        window.player.gold += int(5, 10) === 5 ? int(10, 100) : int(5, 10);
                    } else {
                        window.player.inventory.add(this.findItem());
                    }
                    window.shop.drawCurrentWindow();
                }, 1000);
            }
            this.appear();
        }, int(5000, 10000));
    }

    animate() {
        this.blink([6, 7], [10, 16], 2, 1, 1);
        return true;
    }
}
