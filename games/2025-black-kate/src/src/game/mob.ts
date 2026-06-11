import { AnimationFrame } from "../engine/animation";
import { getStage } from "../engine/stage";
import { addUnit, Unit, UnitConfig, units, UnitState } from "../engine/unit";
import { man0, man1, man10, man11, man12, man2, man3, man4, man5, man6, man7, man8, man9, man13, man14, man15, man16, man17, man18, man19, man20, man21, man22 } from "../resources/id";
import { addImage, images } from "../resources/images";
import { cloneObject } from "../utils/browser";
import { Box2, Vector2 } from "../utils/geom";
import { applyPallette, applyShadow, cloneCanvas, noise } from "../utils/image";
import { chance, limit, mathAbs, mathCos, mathPI, mathPI2, mathRandom, mathSin, numberMax, randomRange, randomSelect } from "../utils/math";
import { deltaS } from "../utils/time";
import { getHero } from "./hero";

const minDistance = 10;

const fightDistanceX = 18;
const fightDistanceY = 5;

const safeDistanceX = 50;
const safeDistanceY = 20;

export const attackers: Array<Unit> = [];

let resetAttackersTimer = 0;

export interface MobData {
    reaction_: { min_: number, max_: number },
    reactionTimeout_: number,
    reactionTime_: number,
    attackActive_: boolean,
};

export const mobs: Array<Unit> = [];

const pallette = [
    0xff000000, // hair
    0xffff9300, // face
    0xff942192, // body
    0xffaa7942, // hand0
    0xff5e0e01, // hand1
    0xffbf6d5e, // hand2
    0xff006500, // legs0
    0xff006a6b, // legs1
    0xff01187d, // legs2
];

const baseConfig: UnitConfig = {
    mob_: true,
    name_: "enemy",
    health_: 100,
    walkSpeed_: 20,
    offset_: { x: 16, y: 31 },
    animations_: {
        stand_: [
            { image_: man0, time_: 0.3 },
            { image_: man1, time_: 0.3 },
            { image_: man0, time_: 0.3 },
            { image_: man2, time_: 0.3 },
            { image_: man3, time_: 0.3 },
            { image_: man2, time_: 0.3 },
        ],
        walkH_: [
            { image_: man0, time_: 0.2 },
            { image_: man4, time_: 0.2 },
            { image_: man0, time_: 0.2 },
            { image_: man5, time_: 0.2 },
        ],
        walkV_: [
            { image_: man0, time_: 0.2 },
            { image_: man9, time_: 0.2 },
            { image_: man0, time_: 0.2 },
            { image_: man10, time_: 0.2 },
        ],
        jab_: [
            { image_: man0, time_: 0.2 },
            { image_: man6, time_: 0.2 },
        ],
        cross_: [
            { image_: man6, time_: 0.2 },
            { image_: man7, time_: 0.2 },
            { image_: man8, time_: 0.2 },
            { image_: man7, time_: 0.2 },
        ],
        kick_: [
            { image_: man0, time_: 0.2 },
            { image_: man11, time_: 0.2 },
            { image_: man12, time_: 0.2 },
            { image_: man11, time_: 0.2 },
        ],
        damage1_: [
            { image_: man14, time_: 0.5 },
            { image_: man13, time_: 0.3 },
        ],
        damage2_: [
            { image_: man18, time_: 0.5 },
            { image_: man17, time_: 0.3 },
        ],
        knockdown_: [
            { image_: man13, time_: 0.2 },
            { image_: man14, time_: 0.5 },
            { image_: man15, time_: 1.0 },
            { image_: man16, time_: 0.3 },
            { image_: man17, time_: 0.2 },
        ],
        dead1_: [
            { image_: man18, time_: 0.2 },
            { image_: man19, time_: 0.2 },
            { image_: man20, time_: 0.2 },
            { image_: man21, time_: 1.0 },
            { image_: -1, time_: 0.2 },
            { image_: man21, time_: 0.2 },
            { image_: -1, time_: 0.2 },
            { image_: man21, time_: 0.2 },
            { image_: -1, time_: 0.2 },
            { image_: man21, time_: 0.2 },
        ],
        dead2_: [
            { image_: man13, time_: 0.2 },
            { image_: man14, time_: 0.5 },
            { image_: man15, time_: 1.0 },
            { image_: -1, time_: 0.2 },
            { image_: man15, time_: 0.2 },
            { image_: -1, time_: 0.2 },
            { image_: man15, time_: 0.2 },
            { image_: -1, time_: 0.2 },
            { image_: man15, time_: 0.2 },
        ],
        sit_: [
            { image_: man22, time_: 0.0 },
        ]
    },
    damages_: {
        [man6]: 5, // jab
        [man8]: 10, // cross
        [man12]: 20, // kick
    },
};

export const mobsConfigs: Array<UnitConfig> = [];

export const randomMobConfig = (): UnitConfig => randomSelect(mobsConfigs);

export const generateMobsConfigs = () => {
    // const pallette = getPallette(images[man0]);
    // for (const color of pallette) {
    //     console.log(`0x${color.toString(16)}`);
    // }

    // boss
    generateConfig([
        0xff000000, // hair
        0xffff9300, // face
        0xffaaaaaa, // body
        0xffffffff, // hand0
        0xffffffff, // hand1
        0xffff9300, // hand2
        0xff666666, // legs0
        0xff666666, // legs1
        0xff000000 // legs2
    ]);

    // bodyguard
    generateConfig([
        0xff000000, // hair
        0xffff9300, // face
        0xff111111, // body
        0xff111111, // hand0
        0xff111111, // hand1
        0xffff9300, // hand2
        0xff111111, // legs0
        0xff111111, // legs1
        0xff000000 // legs2
    ]);

    const hairs = [0xff090806, 0xff9B6C4C, 0xffA95942];
    const skins = [0xffE7C2AA, 0xffC99073, 0xffE1BA91, 0xffBC8663, 0xff553D2D];
    const shirts = [0xff333333, 0xff2E4A57, 0xff005493];
    const pants = [0xff000033, 0xff797B8B, 0xff005493, 0xff003F24];
    const shoes = [0xff000000, 0xffEBEBEB, 0xff270C01];

    for (let i = 0; i < 10; i++) {
        let hair = randomSelect(hairs);
        const face = randomSelect(skins);
        const shirt = randomSelect(shirts);
        const pant = randomSelect(pants);
        const shoe = randomSelect(shoes);

        let body = shirt;
        let hand0 = shirt;
        let hand1 = shirt;
        let hand2 = face;

        let legs0 = pant;
        let legs1 = pant;

        // blind
        if (chance(0.1)) {
            hair = face;
        }

        // short shirt
        if (chance(0.5)) {
            hand1 = face;
        }

        // gloves
        if (chance(0.2)) {
            hand2 = 0xff111111;
        }

        // short pants
        if (chance(0.5)) {
            legs1 = face;
        }

        generateConfig([
            hair, // hair
            face, // face
            body, // body
            hand0, // hand0
            hand1, // hand1
            hand2, // hand2
            legs0, // legs0
            legs1, // legs1
            shoe, // legs2
        ]);
    }
}

const generateConfig = (targetPallette: number[]) => {
    const newConfig: UnitConfig = cloneObject(baseConfig);

    newConfig.walkSpeed_ = randomRange(10, 20);

    const id = mobsConfigs.length;

    const animations = newConfig.animations_ as any;
    for (const name in animations) {
        const animation = animations[name] as Array<AnimationFrame>;
        replaceImagesPallette(animation, pallette, targetPallette, id);
    }

    for (const image in newConfig.damages_) {
        const newImage = getPalletteImage(Number(image), pallette, targetPallette, id);
        newConfig.damages_[newImage] = newConfig.damages_[image];
    }

    mobsConfigs.push(newConfig);
}

const replaceImagesPallette = (animation: Array<AnimationFrame>, sourcePallette: Array<number>, targetPallette: Array<number>, palletteId: number) => {
    for (const frame of animation) {
        frame.image_ = getPalletteImage(frame.image_, sourcePallette, targetPallette, palletteId);
    }
}

const imagesPallete: { [key: string]: number } = {};
const getPalletteImage = (id: number, sourcePallette: Array<number>, targetPallette: Array<number>, palletteId: number) => {
    if (id == -1) return -1;

    const key = `${id}_${palletteId}`;
    if (!imagesPallete[key]) {
        const target = cloneCanvas(images[id]);
        applyPallette(target, sourcePallette, targetPallette);
        applyShadow(target);
        noise(10, target);
        imagesPallete[key] = addImage(target);
    }
    return imagesPallete[key];
}

export const createMob = (config: UnitConfig): Unit => {
    const mob = addUnit(config);
    const mobData: MobData = {
        reaction_: {
            min_: 1,
            max_: 2,
        },
        reactionTimeout_: 0,
        reactionTime_: 0,
        attackActive_: false,
    };
    mob.custom_ = mobData;
    mobs.push(mob);
    return mob;
}

export const clearMobs = () => {
    mobs.splice(0, mobs.length);
}

export const removeMob = (mob: Unit) => {
    const index = mobs.indexOf(mob);
    if (index != -1) {
        mobs.splice(index, 1);
    }
}

export const removeAttacker = (mob: Unit) => {
    const index = attackers.indexOf(mob);
    if (index != -1) {
        attackers.splice(index, 1);
    }
}

export const updateMobs = () => {
    resetAttackersTimer -= deltaS;
    if (resetAttackersTimer < 0) {
        resetAttackersTimer = randomRange(3, 5);
        attackers.splice(0, attackers.length);
    }

    const hero = getHero();

    for (const mob of mobs) {
        if (mob.health_ <= 0 || !units.includes(mob)) {
            removeMob(mob);
            removeAttacker(mob);
            continue;
        }

        mob.controller_.move_.x = 0;
        mob.controller_.move_.y = 0;
        mob.controller_.attack_ = false;

        const mobData = mob.custom_ as MobData;

        if (!mobData.attackActive_) {
            mobData.reactionTime_ += deltaS;
            if (mobData.reactionTime_ > mobData.reactionTimeout_) {
                mobData.reactionTime_ = 0;
                mobData.reactionTimeout_ = randomRange(mobData.reaction_.min_, mobData.reaction_.max_);
                mobData.attackActive_ = true;
            }
        }
    }

    updateAttackersList(hero);

    for (const mob of mobs) {
        if (mob.health_ <= 0 || mob.animation_ == mob.config_.animations_.knockdown_) {
            continue;
        }

        if (mob.state_ != UnitState.Walk && mob.state_ != UnitState.Stand) {
            continue;
        }

        if (hero.health_ <= 0 || hero.animation_ == hero.config_.animations_.knockdown_) {
            continue;
        }

        const nearHero = onFightDistance(mob, hero);
        if (nearHero) {
            const mobData = mob.custom_ as MobData;
            if (mobData.attackActive_) {
                mobData.attackActive_ = false;

                const direction = Vector2.subtract_(hero.position_, mob.position_);
                mob.direction_ = limit(-1, 1, direction.x);
                mob.controller_.attack_ = true;

                if (!attackers.includes(mob)) {
                    attackers.push(mob);
                }
            }
        } else {
            let walkToHero = false;

            if (attackers.includes(mob)) {
                walkToHero = true;
            } else {
                if (!onSafeDistance(mob, hero)) {
                    walkToHero = true;
                }
            }

            if (walkToHero) {
                const direction = Vector2.subtract_(hero.position_, mob.position_);
                Vector2.normalize_(direction);
                mob.controller_.move_.x = direction.x;
                mob.controller_.move_.y = direction.y;
            }
        }
    }

    mobsCollision();
}

const mobsCollision = () => {
    for (let i = 0; i < mobs.length; i++) {
        const mob0 = mobs[i];
        if (mob0.state_ == UnitState.Walk || mob0.state_ == UnitState.Stand) {
            for (let j = i + 1; j < mobs.length; j++) {
                const mob1 = mobs[j];
                if (mob1.state_ == UnitState.Walk || mob1.state_ == UnitState.Stand) {
                    const direction = Vector2.subtract_(mob1.position_, mob0.position_);
                    if (direction.x == 0 && direction.y == 0) {
                        direction.x = 1;
                    }
                    const distance = Vector2.length_(direction);
                    if (distance < minDistance) {
                        const scale = (minDistance - distance) / distance;

                        mob0.position_.x -= direction.x * scale;
                        mob0.position_.y -= direction.y * scale;

                        mob1.position_.x += direction.x * scale;
                        mob1.position_.y += direction.y * scale;
                    }
                }
            }
        }
    }
}

let attackersMax = 1;

export const setAttackers = (count: number) => attackersMax = count;

export const updateAttackersList = (hero: Unit) => {
    while (attackers.length < attackersMax) {
        let nearDistance = numberMax;
        let nearMob: Unit | undefined;

        for (const mob of mobs) {
            if ((mob.state_ == UnitState.Stand || mob.state_ == UnitState.Walk) && mob.health_ > 0) {
                if (!attackers.includes(mob)) {
                    const distance = Vector2.distance_(hero.position_, mob.position_);
                    if (nearDistance > distance) {
                        nearDistance = distance;
                        nearMob = mob;
                    }
                }
            }
        }

        if (nearMob) {
            attackers.push(nearMob);
        } else {
            break;
        }
    }

    while (attackers.length > attackersMax) {
        let furtherUnit: Unit | undefined;
        let furtherDistance = 0;
        for (const attacker of attackers) {
            const distance = Vector2.distance_(attacker.position_, hero.position_);
            if (furtherDistance < distance) {
                furtherDistance = distance;
                furtherUnit = attacker;
            }
        }

        if (furtherUnit) {
            removeAttacker(furtherUnit);
        }
    }
}

const onFightDistance = (mob: Unit, hero: Unit): boolean => onDistance(mob, hero, fightDistanceX, fightDistanceY);
const onSafeDistance = (mob: Unit, hero: Unit): boolean => onDistance(mob, hero, safeDistanceX, safeDistanceY);

const onDistance = (mob: Unit, hero: Unit, dx: number, dy: number): boolean => {
    const direction = Vector2.subtract_(hero.position_, mob.position_);
    return mathAbs(direction.x) < dx && mathAbs(direction.y) < dy;
}