import { DEBUG } from "../debug";
import { game, GameState } from "../engine/game";
import { gamepadData } from "../engine/gamepad";
import { isKeyPressed, Key } from "../engine/input";
import { joystick } from "../engine/joystick";
import { addUnit, Unit, UnitConfig, units, UnitState } from "../engine/unit";
import { lastLevel } from "../engine/waves";
import { kate0, kate1, kate10, kate11, kate12, kate13, kate14, kate15, kate16, kate17, kate18, kate19, kate2, kate3, kate4, kate5, kate6, kate7, kate8, kate9 } from "../resources/id";
import { playLoose } from "../resources/sound/audio";
import { hasTouch } from "../utils/browser";
import { Vector2 } from "../utils/geom";

export const enum HeroInputType {
    Keyboard,
    TouchJoystick,
    Gamepad,
}

export let heroInputType: HeroInputType = HeroInputType.Keyboard;

export const setHeroInputType = (value: HeroInputType) => heroInputType = value;

const config: UnitConfig = {
    mob_: false,
    name_: "kate",
    health_: 1000,
    walkSpeed_: 40,
    offset_: { x: 16, y: 29 },
    animations_: {
        stand_: [
            { image_: kate0, time_: 0.2 },
            { image_: kate1, time_: 0.2 },
            { image_: kate2, time_: 0.2 },
            { image_: kate1, time_: 0.2 },
            { image_: kate0, time_: 0.2 },
            { image_: kate3, time_: 0.2 },
        ],
        walkH_: [
            { image_: kate0, time_: 0.1 },
            { image_: kate4, time_: 0.1 },
            { image_: kate5, time_: 0.1 },
            { image_: kate4, time_: 0.1 },
        ],
        walkV_: [
            { image_: kate11, time_: 0.1 },
            { image_: kate12, time_: 0.1 },
            { image_: kate11, time_: 0.1 },
            { image_: kate13, time_: 0.1 },
        ],
        jab_: [
            { image_: kate0, time_: 0.05 },
            { image_: kate8, time_: 0.1 },
        ],
        cross_: [
            { image_: kate8, time_: 0.1 },
            { image_: kate9, time_: 0.1 },
            { image_: kate10, time_: 0.1 },
            { image_: kate9, time_: 0.1 },
        ],
        kick_: [
            { image_: kate0, time_: 0.05 },
            { image_: kate6, time_: 0.05 },
            { image_: kate7, time_: 0.1 },
            { image_: kate6, time_: 0.1 },
        ],
        damage1_: [
            { image_: kate14, time_: 0.5 },
        ],
        damage2_: [
            { image_: kate15, time_: 0.5 },
        ],
        knockdown_: [
            { image_: kate15, time_: 0.3 },
            { image_: kate16, time_: 0.3 },
            { image_: kate17, time_: 1.0 },
            { image_: kate18, time_: 0.3 },
            { image_: kate19, time_: 0.3 },
            { image_: kate0, time_: 0.3 },
        ],
        dead1_: [
            { image_: kate0, time_: 0.1 },
            { image_: kate15, time_: 0.3 },
            { image_: kate16, time_: 0.3 },
            { image_: kate17, time_: 1.0 },
            { image_: -1, time_: 0.2 },
            { image_: kate17, time_: 0.2 },
            { image_: -1, time_: 0.2 },
            { image_: kate17, time_: 0.2 },
            { image_: -1, time_: 0.2 },
            { image_: kate17, time_: 0.2 },
        ],
        dead2_: [
            { image_: kate0, time_: 1.0 },
        ],
        sit_: []
    },
    damages_: {
        [kate8]: 10, // jab
        [kate10]: 20, // cross
        [kate7]: 30, // kick
    },
};

let hero: Unit | undefined;

export const createHero = () => {
    hero = addUnit(config);
}

export const getHero = (): Unit => {
    return hero!;
}

export const updateHero = () => {
    if (!hero) {
        return;
    }

    if (!units.includes(hero)) {
        game.state = GameState.GameOver;
        playLoose();
    }

    if (hero.health_ <= 0) {
        return;
    }

    hero.controller_.move_.x = 0;
    hero.controller_.move_.y = 0;
    hero.controller_.attack_ = false;

    if (isKeyPressed(Key.Left) || isKeyPressed(Key.A)) {
        hero.controller_.move_.x = -1;
        heroInputType = HeroInputType.Keyboard;
    }

    if (isKeyPressed(Key.Right) || isKeyPressed(Key.D)) {
        hero.controller_.move_.x = 1;
        heroInputType = HeroInputType.Keyboard;
    }

    if (isKeyPressed(Key.Up) || isKeyPressed(Key.W)) {
        hero.controller_.move_.y = -1;
        heroInputType = HeroInputType.Keyboard;
    }

    if (isKeyPressed(Key.Down) || isKeyPressed(Key.S)) {
        hero.controller_.move_.y = 1;
        heroInputType = HeroInputType.Keyboard;
    }

    if (isKeyPressed(Key.Space) || isKeyPressed(Key.X)) {
        hero.controller_.attack_ = true;
        heroInputType = HeroInputType.Keyboard;
    }

    if (DEBUG) {
        if (isKeyPressed(Key.Z)) {
            lastLevel();
        }
    }

    if (joystick.moveId_ != -1) {
        const direction = Vector2.subtract_(joystick.moveStick_, joystick.move_);
        hero.controller_.move_.x = direction.x;
        hero.controller_.move_.y = direction.y;

        heroInputType = HeroInputType.TouchJoystick;
    }

    if (joystick.attackId_ != -1) {
        hero.controller_.attack_ = true;
        heroInputType = HeroInputType.TouchJoystick;
    }

    if (gamepadData.axe_.x != 0 || gamepadData.axe_.y != 0) {
        hero.controller_.move_.x = gamepadData.axe_.x;
        hero.controller_.move_.y = gamepadData.axe_.y;
        heroInputType = HeroInputType.Gamepad;
    }

    if (gamepadData.button_) {
        hero.controller_.attack_ = true;
        heroInputType = HeroInputType.Gamepad;
    }
}