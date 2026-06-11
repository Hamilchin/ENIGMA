import { ItemManager } from '../config/ItemManager';
import { witch } from '../drawables/images';
import { Drawable } from './generic/Drawable';

export class Player extends Drawable {
    constructor(canvas, gold, inventory) {
        super(canvas,
            witch,
            ["#000000ff", "#a8aba6ff", "#bdc2c0ff", "#d29558ff", "#3f3a3aff", "#ffffffff", "#289769ff", "#b46a47ff", "#740c0cff"]
        );
        this.gold = gold;
        this._debt = [];
        this.inventory = inventory;
        this.chosenOption;
        this.previousLine;
        this.knownRecipes = [
            ItemManager.recipes[0]
        ];
    }

    get debt() {
        return this._debt.reduce((acc, d) => acc + d.current, 0);
    }

    get dailyDebt() {
        return this._debt.map(d => {
            let _payment = Math.ceil(d.original / 30);
            return Math.min(d.current, _payment);
        }).reduce((acc, curr) => acc + curr, 0);
    }

    get debtPortion() {
        return this._debt.reduce((a, b) => a + b, 0) / 365;
    }

    addDebt(value) {
        this._debt.push({ current: Math.ceil(value), original: Math.ceil(value) });
    }

    payDebt() {
        this._debt = this._debt.map(d => {
            let _payment = Math.ceil(d.original / 30);
            let payment = Math.min(d.current, _payment);
            this.gold -= payment;
            return {
                ...d,
                current: Math.max(0, Math.ceil(d.current - payment))
            };
        }).filter(d => d.current > 0);
    }

    buyRecipe(recipe, gold) {
        if (this.gold < gold) {
            window.closePopUp(100);
            setTimeout(() => {
                window.popUpMsg("you don't have enough 🪙", 1500);
            }, 500);
            return;
        }
        this.gold -= gold;
        this.knownRecipes.push(recipe);
    }

    buyItem(item) {
        if (this.gold < item.shopPrice) {
            window.closePopUp(100);
            setTimeout(() => {
                window.popUpMsg("you don't have enough 🪙", 1500);
            }, 500);
            return;
        }
        try {
            this.inventory.add(item);
        } catch (error) {
            window.closePopUp(500);
            setTimeout(() => {
                window.popUpMsg(error.message, 1500);
            }, 500);
            return;
        }
        this.gold -= item.shopPrice;
    }

    animate() {
        this.blink([10,11], [16,17, 22, 23], 4, 7, 6, !window.customer);
        return true;
    }
}
