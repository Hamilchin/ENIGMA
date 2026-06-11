import { music } from './audio/music.js';
import { ItemManager } from './config/ItemManager.js';
import { setup } from "./config/setup.js";
import { Customer } from './entities/Customer.js';
import { onClick } from './utils/interaction.js';
import { int, pick } from './utils/random.js';

window.paused = false;

window.popUpMsg = function (message, time) {
    let element = document.createElement("p");
    element.innerText = message;
    window.popUp([element], time);
};

window.popUpWithOptions = function (message, options) {
    let messageElement = document.createElement("h1");
    messageElement.innerText = message;
    let elements = [messageElement];
    Object.entries(options).forEach(([text, action]) => {
        let buttonElement = document.createElement("button");
        buttonElement.innerText = text;
        onClick(buttonElement, () => {
            action();
        });
        elements.push(buttonElement);
    });

    window.popUp(elements);
};

window.popUp = function (elements, time) {
    msg.style.display = 'block';
    o.style.display = 'flex';
    elements.forEach(el => {
        msgt.appendChild(el);
    });

    if (time) {
        window.closePopUp(time);
    }
};

window.closePopUp = function (time) {
    time = time || 100;
    setTimeout(() => {
        msg.style.top = '-50%';
        setTimeout(() => {
            msg.style.top = '50%';
            o.style.display = 'none';
            msg.style.display = 'none';
            msgt.innerHTML = '';
        }, time / 4);
    }, (time / 4) * 3);
};

window.tooltipShowWithIcon = function (icon, name, description) {
    let tooltipContent = document.createElement("div");
    tooltipContent.classList.add("tooltipc");

    let tooltipText = document.createElement("div");
    tooltipText.classList.add("tooltipt");

    let tooltipName = document.createElement("div");
    tooltipName.classList.add("tooltipn");
    tooltipName.innerText = name;

    let iconHolder = document.createElement("div");
    iconHolder.classList.add("item-icon-holder");
    if (icon) {
        let iconElement = document.createElement("img");
        iconElement.classList.add("item-icon");
        iconElement.src = icon;
        iconHolder.appendChild(iconElement);
    }

    let tooltipDescription = document.createElement("div");
    tooltipDescription.innerText = description;

    tooltipText.appendChild(tooltipName);
    tooltipText.appendChild(tooltipDescription);
    tooltipContent.appendChild(iconHolder);
    tooltipContent.appendChild(tooltipText);
    tooltipShow(tooltipContent);
};

window.tooltipShow = function (element) {
    ttip.innerHTML = "";
    ttip.appendChild(element);
    ttip.style.display = 'block';
};

window.tooltipHide = function () {
    ttip.innerHTML = "";
    ttip.style.display = 'none';
};

window.main = function () {
    window.shop.draw();

    setInterval(() => {
        if (window.paused) {
            return;
        }

        if (!window.customer && int(0, 7) < 3) {
            let numberOfItems = int(1, 3);
            let wants = [];
            let candidates = [...ItemManager.advancedPotions, ...ItemManager.advancedPotions, ...ItemManager.basicPotions, ...ItemManager.allItems];
            if (window.shop.date.getDate() === 1 && window.shop.date.getFullYear() === 2025 && window.shop.date.getMonth() === 0) {
                numberOfItems = 1;
                candidates = [ItemManager.basicPotions[0]];
            }
            else if (window.shop.date.getFullYear() === 2025 && window.shop.date.getMonth() === 0) {
                numberOfItems = int(1, 2);
                candidates = [...ItemManager.basicPotions, ...ItemManager.basicPotions, ...ItemManager.basicPotions, ...ItemManager.ingredients];
            } else if (window.shop.date.getMonth() >= 3 || window.shop.date.getFullYear() === 2025) {
                candidates = [...ItemManager.basicPotions, ...ItemManager.basicPotions, ...ItemManager.advancedPotions, ...ItemManager.ingredients];
            }
            for (let i = 0; i < numberOfItems; i++) {
                wants.push(pick(...candidates));
            }
            let cstmrCanvas = document.createElement("canvas");
            cstmrCanvas.id = "cstmr";
            c.after(cstmrCanvas);
            window.customer = new Customer(cstmrCanvas, [...new Set(wants)]);
            window.customer.draw();
            window.customer.appear();
        }
    }, 2000);

    setInterval(() => {
        if (window.paused) {
            return;
        }

        window.shop.increaseTime();
        if (window.player.gold < 0) {
            setTimeout(() => {
                let loan1 = 250 + Math.abs(window.player.gold);
                let loan2 = 500 + Math.abs(window.player.gold);
                let options = {
                    "restart": () => window.location.reload()
                };
                if (window.player.debt < 750) {
                    options[`take a loan (${loan1}🪙)`] = () => {
                        window.player.gold += loan1;
                        window.player.addDebt(loan1 * 1.25);
                        window.closePopUp();
                        window.shop.drawCurrentWindow();
                        window.paused = false;
                    };
                    options[`take a loan (${loan2}🪙)`] = () => {
                        window.player.gold += loan2;
                        window.player.addDebt(loan2 * 1.25);
                        window.closePopUp();
                        window.shop.drawCurrentWindow();
                        window.paused = false;
                    };
                }
                window.popUpWithOptions(`you're broke${window.player._debt.length > 2 ? ' and have too much debt' : ''}`, options);
            }, 1000);
            window.paused = true;
        }
    }, 30000);
};

let doMusic = (t) => {
    music.play(t);
    window.requestAnimationFrame(doMusic);
}

setup();
main();
doMusic();