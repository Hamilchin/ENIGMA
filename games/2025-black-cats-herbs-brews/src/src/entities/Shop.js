import { daysInMonth, getMonth, incrementDate } from '../utils/dates';
import { resizeImage } from '../utils/draw';
import { int } from '../utils/random';

export class Shop {
    constructor() {
        this.currentWindow = "inventory";
        this._currentlyHolding;
        this.currentlyHoldingOrigin;
        this.drawables = [];
        this.date = new Date(2025, 0, 1);
        this.previousDate;
        this.priceModifier = 1.2;
    }

    get currentlyHolding() {
        return this._currentlyHolding;
    }

    set currentlyHolding(item) {
        this._currentlyHolding = item;
        if (item && item.icon) {
            resizeImage(item.icon, 4, (dataUrl) => {
                document.body.style.cursor = `url(${dataUrl}), pointer`;
            });
        } else {
            document.body.style.cursor = "auto";
        }
    }

    resetCalendar() {
        clndrds.innerHTML = "";
        clndrm.innerHTML = `${getMonth(this.date)} ${this.date.getFullYear()}`;
        let dayOfTheWeek = this.date.getDay() || 7;
        for (let i = 0; i < dayOfTheWeek - 1; i++) {
            let empty = document.createElement("div");
            empty.classList.add("day-empty");
            clndrds.appendChild(empty);
        }
        for (let i = 0; i < daysInMonth(this.date); i++) {
            let day = document.createElement("div");
            day.classList.add("day", `day-${i + 1}`, `day-w${(dayOfTheWeek + i) % 7}`);
            clndrds.appendChild(day);
        }
    }

    selectCauldron() {
        this.currentWindow = "cauldron";
    }

    selectShelf() {
        this.currentWindow = "inventory";
    }

    increaseTime() {
        incrementDate(this.date);
        clndrd.innerHTML = this.date.getDate();
        document.querySelector(`.day-${this.date.getDate()}`).classList.add("ticked");
        if (this.date.getDate() === 1) {
            this.dueRent();
            this.resetCalendar();
        }
        this.priceModifier = int(2, 30) / 10;
        this.dueDebt();
    }

    dueDebt() {
        if (!window.player.debt) {
            return;
        }

        window.player.payDebt();
        this.drawCurrentWindow();
    }

    dueRent() {
        window.paused = true;
        window.popUpWithOptions(
            "rent is due",
            {
                "pay (1000🪙)": () => {
                    window.player.gold -= 1000;
                    window.paused = false;
                    window.closePopUp();
                }
            }
        );
    }

    drawCurrentWindow() {
        if (this.currentWindow === "cauldron") {
            window.cauldron.drawContents();
        } else {
            window.player.inventory.drawContents();
        }
    }

    draw() {
        this.drawCurrentWindow();
        this.drawables.forEach(drawable => drawable?.draw());
    }
}