import { DEBUG } from "../debug";
import { getHero } from "../game/hero";
import { createMob, MobData, mobs, mobsConfigs, setAttackers } from "../game/mob";
import { playWin } from "../resources/sound/audio";
import { cloneObject } from "../utils/browser";
import { Box2 } from "../utils/geom";
import { lerp, mathMax, mathMin, mathRound, numberMax, randomRange, randomSelect } from "../utils/math";
import { game, GameState } from "./game";
import { gameWidth } from "./graphics";
import { getStage } from "./stage";
import { units } from "./unit";

export interface WaveMob {
    config_: number,
    count_: number,
    health_: number,
    walkSpeed_: number,
    reaction_: {
        min_: number,
        max_: number
    },
}

export interface Wave {
    mobs_: Array<WaveMob>,
    attackers_: number,
}

let waves: Array<Wave> = [];

export const getLevel = (): number => 13 - waves.length;

export const lastLevel = () => {
    if (DEBUG) {
        // while (waves.length > 1) {
        waves.shift();
        // }
    }
}

export const initWaves = () => {
    waves = [];

    const reactionStart = 3;
    const reactionEnd = 2;

    const countStart = 2;
    const countEnd = 5;

    const healthStart = 100;
    const healthEnd = 150;

    const walkSpeedStart = 30;
    const walkSpeedEnd = 35;

    const attackersStart = 1;
    const attackersEnd = 3;

    const wavesCount = 12;

    for (let i = 0; i < wavesCount; i++) {
        const value = i / (wavesCount - 1);

        const reaction = lerp(reactionStart, reactionEnd, value);
        const count = mathRound(lerp(countStart, countEnd, value));
        const health = mathRound(lerp(healthStart, healthEnd, value));
        const walkSpeed = lerp(walkSpeedStart, walkSpeedEnd, value);
        const attackers = mathRound(lerp(attackersStart, attackersEnd, value));

        waves.push(
            {
                attackers_: attackers,
                mobs_: [
                    {
                        reaction_: { min_: reaction, max_: reaction * 1.2 },
                        count_: count,
                        config_: -1,
                        health_: health,
                        walkSpeed_: walkSpeed,
                    }
                ],
            }
        )
    }

    waves.push(
        {
            attackers_: attackersEnd,
            mobs_: [
                {
                    reaction_: { min_: reactionEnd, max_: reactionEnd * 1.2 },
                    count_: 3,
                    config_: 1, // bodyguard
                    health_: healthEnd,
                    walkSpeed_: walkSpeedEnd,
                },
                {
                    reaction_: { min_: reactionEnd, max_: reactionEnd * 1.2 },
                    count_: 1,
                    config_: 0, // boss
                    health_: 500,
                    walkSpeed_: walkSpeedEnd,
                }
            ],
        }
    )
}

const names = ["bob", "jay", "jack", "serg", "alex", "john", "mike", "buba", "val", "noah", "levi", "leo", "alan", "ben", "kyle", "ivan"];

export const getZones = (): Array<Box2> => {
    const top = 32;
    const bottom = 64;

    const zones: Array<Box2> = [];

    const stage = getStage();

    const leftMin = mathMax(stage.bounds_.x, stage.camera_.x - 30);
    const leftMax = stage.camera_.x;

    const left: Box2 = {
        x: leftMin,
        y: stage.bounds_.y + top,
        w: leftMax - leftMin,
        h: stage.bounds_.h - top - bottom,
    }

    if (left.w > 0) {
        zones.push(left);
    }

    const rightMin = stage.camera_.x + gameWidth;
    const rightMax = mathMin(stage.bounds_.x + stage.bounds_.w, stage.camera_.x + gameWidth + 30);

    const right: Box2 = {
        x: rightMin,
        y: stage.bounds_.y + top,
        w: rightMax - rightMin,
        h: stage.bounds_.h - top - bottom,
    }

    if (right.w > 0) {
        zones.push(right);
    }

    return zones;
};

export const generateMobs = () => {
    const zones = getZones();

    if (!zones.length) {
        return;
    }

    if (!mobs.length) {
        if (waves.length) {
            const usualMobsConfigs = [...mobsConfigs];
            usualMobsConfigs.shift();
            usualMobsConfigs.shift();

            const wave = waves.shift()!;

            setAttackers(wave.attackers_);

            for (const waveMob of wave.mobs_) {
                for (let i = 0; i < waveMob.count_; i++) {
                    const config = cloneObject(waveMob.config_ == -1 ? randomSelect(usualMobsConfigs) : mobsConfigs[waveMob.config_]);
                    config.health_ = waveMob.health_;
                    config.walkSpeed_ = waveMob.walkSpeed_;
                    if (waveMob.config_ == 0) {
                        config.name_ = "boss";
                    } else {
                        config.name_ = randomSelect(names);
                    }

                    const mob = createMob(config);
                    const mobData = mob.custom_ as MobData;
                    mobData.reaction_ = waveMob.reaction_;

                    const zone = randomSelect(zones);

                    mob.position_.x = zone.x + randomRange(0, zone.w);
                    mob.position_.y = zone.y + randomRange(0, zone.h);
                }
            }
        } else {
            if (units.length == 1) {
                game.state = GameState.GameWin;
                playWin();
            }
        }
    }
}