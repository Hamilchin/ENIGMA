import { Shop } from '../entities/Shop.js';
import { Player } from '../entities/Player.js';
import { Cauldron } from '../entities/Cauldron.js';
import { Inventory } from '../entities/Inventory.js';

import { onClick, onMouseUp } from '../utils/interaction.js';
import { ItemManager } from './ItemManager.js';
import { Cat } from '../entities/Cat.js';

export let setup = () => {
    window.shop = new Shop();

    window.shelves = new Inventory(shlf, wrk);
    window.cat = new Cat(c);
    window.player = new Player(w, 100, shelves);
    window.player.inventory.addAll([
        ItemManager.makeItem("lunar moss"),
        ItemManager.makeItem("liver"),
        ItemManager.makeItem("vial"),
        ItemManager.makeItem("vial"),
        ItemManager.makeItem("roe"),
        ItemManager.makeItem("sap"),
        ItemManager.makeItem("sap"),
        ItemManager.makeItem("water"),
    ]);
    window.cauldron = new Cauldron(cldrn, wrk);
    window.customer = null;

    shop.resetCalendar();
    shop.selectShelf();
    shop.drawables = [
        window.shelves,
        window.cauldron,
        window.player,
        window.cat,
        window.customer
    ];

    onClick(cldrn, () => {
        shop.selectCauldron();
    });
    onClick(shlf, () => {
        shop.selectShelf();
    });

    onMouseUp(document, (e) => {
        if (window.shop.currentlyHolding) {
            window.shop.currentlyHolding = null;
            window.shop.currentlyHoldingOrigin = null;
        }
        return false;
    }, false);

    let musicToggle = () => {
        window.playMusic = !window.playMusic;
        if(window.playMusic) {
            tglm.innerHTML = "🎵"
        } else {
            tglm.innerHTML = "🚫"
        }
    }

    let soundToggle = () => {
        window.playSounds = !window.playSounds;
        if(window.playSounds) {
            tgls.innerHTML = "🔈"
        } else {
            tgls.innerHTML = "🚫"
        }
    }
    onClick(tglm, musicToggle);
    onClick(tgls, soundToggle);
    musicToggle();
    soundToggle();
};