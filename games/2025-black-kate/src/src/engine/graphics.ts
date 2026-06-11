import { DEBUG } from "../debug";
import { units } from "./unit";
import { getIdByCharCode } from "../resources/font";
import { getColoredImage, images } from "../resources/images";
import { drawImage, getContext, hasTouch, now } from "../utils/browser";
import { limit, mathFloor, mathMax, mathMin, mathPI2, mathRound } from "../utils/math";
import { deltaS, nowMS } from "../utils/time";
import { getStage } from "./stage";
import { drawSprite } from "./sprite";
import { effects } from "./effect";
import { entities } from "./entity";
import { formatColor } from "../utils/pattern";
import { joystick } from "./joystick";
import { getHero, HeroInputType, heroInputType } from "../game/hero";
import { game, GameState } from "./game";
import { getLevel } from "./waves";
import { attackers, mobs } from "../game/mob";

export const screenCanvas = document.getElementById('c') as HTMLCanvasElement;
screenCanvas.style.imageRendering = 'pixelated';

const context = getContext(screenCanvas);

export const gameWidth = 200;
export const gameHeight = 200;

export const screenOffset = { x: 0, y: 0 };
export let screenScale = 1;

export const updateSize = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    screenScale = mathMin(screenWidth / gameWidth, screenHeight / gameHeight);

    screenCanvas.width = mathMax(gameWidth, screenWidth / screenScale);
    screenCanvas.height = mathMax(gameHeight, screenHeight / screenScale);

    screenCanvas.style.width = `${screenWidth}px`;
    screenCanvas.style.height = `${screenHeight}px`;

    screenOffset.x = mathFloor((screenCanvas.width - gameWidth) / 2);
    screenOffset.y = 0;//mathFloor((screenCanvas.height - gameHeight) / 2);
}

export const draw = () => {
    context.clearRect(0, 0, screenCanvas.width, screenCanvas.height);
    const stage = getStage();

    context.save();
    context.setTransform(1, 0, 0, 1, screenOffset.x, screenOffset.y);

    context.save();
    context.translate(mathRound(-stage.camera_.x), mathRound(-stage.camera_.y));

    drawSprite(context, stage.back_);

    context.shadowBlur = 2;
    context.shadowColor = "black";
    for (const unit of units) {
        drawSprite(context, unit.shadow_);
    }
    for (const item of stage.items_) {
        if (item.shadow_) {
            drawSprite(context, item.shadow_);
        }
    }
    context.shadowBlur = 0;

    entities.sort((a, b) => a.position_.y == b.position_.y ? b.position_.x - a.position_.x : a.position_.y - b.position_.y);

    for (const entity of entities) {
        drawSprite(context, entity.sprite_);
    }

    // for (const item of stage.items) {
    //     context.fillStyle = formatColor(0x55ff0000);
    //     context.fillRect(
    //         item.position.x + item.bounds.x,
    //         item.position.y + item.bounds.y,
    //         item.bounds.w,
    //         item.bounds.h,
    //     );
    // }

    for (const effect of effects) {
        drawSprite(context, effect.sprite_);
    }

    context.restore();

    context.fillStyle = "black";
    if (screenCanvas.width < screenCanvas.height) {
        context.fillRect(0, - screenOffset.y, gameWidth, screenOffset.y);
        context.fillRect(0, gameHeight, gameWidth, gameHeight);
    } else {
        context.fillRect(- screenOffset.x, 0, screenOffset.x, gameWidth);
        context.fillRect(gameWidth, 0, gameWidth, gameHeight);
    }

    drawUI();

    context.restore();

    drawDebug();

    // drawText(
    //     65, 0,
    //     'BLACK KATE',
    //     0xffffff
    // );

    // for (const touchId in touches) {
    //     const touch = touches[touchId];
    //     context.fillStyle = "red";
    //     context.fillRect(touch.x, touch.y, 10, 10);
    // }

    if (heroInputType == HeroInputType.TouchJoystick) {
        context.strokeStyle = formatColor(0x99ffffff);
        context.lineWidth = 2;

        context.beginPath();
        context.arc(mathRound(joystick.move_.x), mathRound(joystick.move_.y), joystick.moveRadius_, 0, mathPI2);
        context.closePath();
        context.stroke();

        if (joystick.moveId_ != -1) {
            context.beginPath();
            context.arc(mathRound(joystick.moveStick_.x), mathRound(joystick.moveStick_.y), joystick.moveStickRadius_, 0, mathPI2);
            context.closePath();
            context.stroke();
        }

        context.strokeStyle = formatColor(0x99ff0000);
        context.lineWidth = 2;

        context.beginPath();
        context.arc(mathRound(joystick.attack_.x), mathRound(joystick.attack_.y), joystick.attackRadius_, 0, mathPI2);
        context.closePath();
        context.stroke();
        if (joystick.attackId_ != -1) {
            context.fillStyle = formatColor(0x33ff0000);
            context.fill();
        }
    }


}

const drawDebug = () => {
    if (DEBUG) {
        context.shadowBlur = 3;
        context.shadowColor = "black";

        const frameTime = (now() - nowMS).toFixed();
        const fps = (1 / deltaS).toFixed();

        drawText(
            3, screenCanvas.height - 8 - 3,
            `FPS ${fps} TIME ${frameTime}`,
            0xffffffff
        );

        context.shadowBlur = 0;

        // const musicVolume = mathRound(musicGainNode.gain.value * 100);
        // const effectVolume = mathRound(effectGainNode.gain.value * 100);

        // drawText(
        //     3, 3 + 16,
        //     `MUSIC ${musicVolume}`,
        //     0xff00ffff
        // );

        // drawText(
        //     3, 3 + 32,
        //     `EFFECT ${effectVolume}`,
        //     0xffff00ff
        // );
    }
}

const drawText = (x: number, y: number, text: string, color: number) => {
    for (let i = 0; i < text.length; i++) {
        const code = text[i].toUpperCase().charCodeAt(0);
        const id = getIdByCharCode(code);
        if (id !== undefined) {
            const char = getColoredImage(id, color);
            let image = images[char];
            if (image !== undefined) {
                drawImage(context, image, x + i * 8, y);
            }
        }
    }
}

const drawUIText = (x: number, y: number, text: string, color: number) => {
    drawText(x - 1, y - 1, text, 0xff000000);
    drawText(x + 1, y - 1, text, 0xff000000);
    drawText(x + 1, y + 1, text, 0xff000000);
    drawText(x + 1, y - 1, text, 0xff000000);
    drawText(x, y, text, color);
}

const drawUI = () => {
    switch (game.state) {
        case GameState.Game:
            const hero = getHero();
            const health = limit(0, mathRound(hero.config_.health_), mathRound(hero.health_));
            const healthText = `${hero.config_.name_} ${health}`;
            drawUIText(5, 5, healthText, 0xff99ff99);

            const level = getLevel();
            const levelText = `LEVEL ${level}`;
            const levelWidth = levelText.length * 8;
            drawUIText(gameWidth - levelWidth - 5, 5, levelText, 0xffffff99);

            const eneies = [...mobs];
            eneies.sort((a, b) => a.health_ - b.health_);

            if (eneies.length >= 1) {
                const attacker = eneies[0];
                const health = limit(0, mathRound(attacker.config_.health_), mathRound(attacker.health_));
                const healthText = `${attacker.config_.name_} ${health}`;
                drawUIText(5, gameHeight - 5 - 8, healthText, 0xffff9999);
            }

            if (eneies.length >= 2) {
                const attacker = eneies[1];
                const health = limit(0, mathRound(attacker.config_.health_), mathRound(attacker.health_));
                const healthText = `${attacker.config_.name_} ${health}`;
                drawUIText(gameWidth - 5 - healthText.length * 8, gameHeight - 5 - 8, healthText, 0xffff9999);
            }
            break;

        case GameState.GameOver:
            drawBack(0x99660000);
            const gameOverText = 'GAME OVER';
            drawUIText(
                (gameWidth - gameOverText.length * 8) / 2,
                (gameHeight - 8) / 2,
                gameOverText,
                0xffffffff
            );

            drawPressAny();
            break;

        case GameState.GameWin:
            drawBack(0x99006600);

            const gameWinText = 'CONGRATULATIONS!';
            drawUIText(
                (gameWidth - gameWinText.length * 8) / 2,
                (gameHeight - 8) / 2,
                gameWinText,
                0xffffffff
            );

            drawPressAny();
            break;
    }
}

const drawPressAny = () => {
    const pressAny1 = hasTouch ? 'TAP TO START AGAIN' : 'PRESS ANY KEY';
    const pressAny2 = hasTouch ? '' : 'TO START AGAIN';
    drawUIText(
        (gameWidth - pressAny1.length * 8) / 2,
        (gameHeight - 8) / 2 + 64,
        pressAny1,
        0xffffffff
    );
    drawUIText(
        (gameWidth - pressAny2.length * 8) / 2,
        (gameHeight - 8) / 2 + 76,
        pressAny2,
        0xffffffff
    );
}

const drawBack = (color: number) => {
    context.fillStyle = formatColor(color);
    context.fillRect(0, 0, screenCanvas.width, screenCanvas.height);
}