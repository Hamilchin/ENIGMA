import { getColoredImage, images } from "../resources/images";
import { playEnemyKilled, playHit, playKick, playWhoosh } from "../resources/sound/audio";
import { Vector2 } from "../utils/geom";
import { chance, limit, mathAbs, mathHypot, mathRound, numberMax, randomChancesSelect, randomRange, randomSelect } from "../utils/math";
import { deltaS } from "../utils/time";
import { animationDuration, AnimationFrame, getFrameImage, isAnimationFinished } from "./animation";
import { addEffect, hitEffect, hitMiniEffect, hitRedEffect } from "./effect";
import { entities, removeEntity } from "./entity";
import { Sprite } from "./sprite";
import { getStage } from "./stage";

export const units: Array<Unit> = [];

export const enum UnitState {
    Stand,
    Walk,
    Attack,
    Damage,
    Dead,
}

export interface Unit {
    config_: UnitConfig,
    state_: UnitState,
    controller_: {
        move_: Vector2,
        attack_: boolean,
    },
    health_: number,
    direction_: number,
    position_: Vector2,
    speed_: Vector2,
    animationTime_: number,
    animation_?: Array<AnimationFrame>,
    sprite_: Sprite,
    shadow_: Sprite,
    frame_: number,
    damage_: number,
    custom_: any,
}

export interface UnitConfig {
    mob_: boolean,
    name_: string,
    health_: number,
    walkSpeed_: number,
    offset_: Vector2,
    animations_: {
        stand_: Array<AnimationFrame>,
        walkH_: Array<AnimationFrame>,
        walkV_: Array<AnimationFrame>,
        jab_: Array<AnimationFrame>,
        cross_: Array<AnimationFrame>,
        kick_: Array<AnimationFrame>,
        damage1_: Array<AnimationFrame>,
        damage2_: Array<AnimationFrame>,
        knockdown_: Array<AnimationFrame>,
        dead1_: Array<AnimationFrame>,
        dead2_: Array<AnimationFrame>,
        sit_: Array<AnimationFrame>,
    },
    damages_: { [key: number]: number },
}

export const addUnit = (config: UnitConfig): Unit => {
    let unit: Unit = {
        config_: config,
        state_: UnitState.Stand,
        controller_: {
            move_: {
                x: 0,
                y: 0
            },
            attack_: false,
        },
        health_: config.health_,
        direction_: 1,
        position_: {
            x: 0,
            y: 0
        },
        speed_: {
            x: 0,
            y: 0
        },
        animationTime_: 0,
        sprite_: {
            image_: -1,
        },
        shadow_: {
            image_: -1,
        },
        damage_: 0,
        frame_: 0,
        custom_: null,
    };

    units.push(unit);
    entities.push(unit);

    return unit;
}

export const removeUnit = (unit: Unit) => {
    const index = units.indexOf(unit);
    if (index != -1) {
        units.splice(index, 1);
    }
    removeEntity(unit);
}

export const clearUnits = () => {
    units.splice(0, units.length);
}

export const limitUnitsPositions = () => {
    const stage = getStage();

    for (const unit of units.values()) {
        unit.position_.x = limit(stage.bounds_.x, stage.bounds_.x + stage.bounds_.w, unit.position_.x);
        unit.position_.y = limit(stage.bounds_.y, stage.bounds_.y + stage.bounds_.h, unit.position_.y);
    }
}

export const updateUnits = () => {
    for (const unit of units.values()) {
        updateUnit(unit);
    }
}

const updateUnit = (unit: Unit) => {
    let currentAnimation = null;

    const config = unit.config_;
    const animations = config.animations_;

    switch (unit.state_) {
        case UnitState.Stand:
            currentAnimation = animations.stand_;

            if (unit.controller_.move_.x != 0 || unit.controller_.move_.y != 0) {
                unit.state_ = UnitState.Walk;
                unit.animationTime_ = 0;
            }

            checkAttack(unit);
            break;

        case UnitState.Walk:
            if (unit.controller_.move_.x == 0 && unit.controller_.move_.y == 0) {
                unit.state_ = UnitState.Stand;
                unit.animationTime_ = 0;
            }
            else if (mathAbs(unit.controller_.move_.x) > mathAbs(unit.controller_.move_.y)) {
                currentAnimation = animations.walkH_;
            } else {
                currentAnimation = animations.walkV_;
            }

            Vector2.normalize_(unit.controller_.move_);

            unit.position_.x += unit.controller_.move_.x * config.walkSpeed_ * deltaS;
            unit.position_.y += unit.controller_.move_.y * config.walkSpeed_ * deltaS;

            checkAttack(unit);
            break;

        case UnitState.Attack:
            currentAnimation = unit.animation_ || animations.jab_;

            if (isAnimationFinished(currentAnimation, unit.animationTime_)) {
                unit.state_ = UnitState.Stand;
                unit.animationTime_ = 0;
                unit.animation_ = undefined;
            }
            break;

        case UnitState.Damage:
            currentAnimation = unit.animation_ || animations.damage1_;

            if (isAnimationFinished(currentAnimation, unit.animationTime_)) {
                unit.state_ = UnitState.Stand;
                unit.animationTime_ = 0;
                unit.animation_ = undefined;
            }
            break;

        case UnitState.Dead:
            currentAnimation = unit.animation_ || animations.dead1_;

            const duration = animationDuration(currentAnimation);
            if (duration <= unit.animationTime_ + deltaS) {
                removeUnit(unit);
                currentAnimation = null;
            }
            break;
    }

    unit.position_.x += unit.speed_.x * deltaS;
    unit.position_.y += unit.speed_.y * deltaS;

    unit.speed_.x *= 0.9;
    unit.speed_.y *= 0.9;

    if (unit.controller_.move_.x > 0) {
        unit.direction_ = 1;
    } else if (unit.controller_.move_.x < 0) {
        unit.direction_ = -1;
    }

    if (currentAnimation) {
        unit.animationTime_ += deltaS;

        unit.sprite_.image_ = getFrameImage(currentAnimation, unit.animationTime_);
        unit.sprite_.flipX_ = unit.direction_ < 0;

        unit.shadow_.image_ = getColoredImage(unit.sprite_.image_, 0x55000000);
        unit.shadow_.flipX_ = unit.sprite_.flipX_;
    }

    unit.damage_ = 0;
    if (unit.frame_ != unit.sprite_.image_) {
        unit.frame_ = unit.sprite_.image_;
        unit.damage_ = config.damages_[unit.frame_] || 0;
    }
}

export const applyUnitsDamage = () => {
    for (const current of units) {
        if (current.health_ <= 0) {
            continue;
        }

        if (!current.damage_) {
            continue;
        }

        let opponent: Unit | null = null;
        let opponentDistanceX = numberMax;
        let opponentDistanceY = numberMax;

        for (const unit of units) {
            if (unit.health_ <= 0 || unit.animation_ == unit.config_.animations_.knockdown_) {
                continue;
            }

            if (current.config_.mob_ != unit.config_.mob_) {
                const directionX = unit.position_.x - current.position_.x;
                if (directionX * current.direction_ > 0) {
                    const distanceX = mathAbs(directionX);
                    const distanceY = mathAbs(current.position_.y - unit.position_.y);
                    if (distanceX < 25 && distanceY < 10) {
                        if (!opponent || opponentDistanceX > distanceX || opponentDistanceY > distanceY) {
                            opponent = unit;
                            opponentDistanceX = distanceX;
                            opponentDistanceY = distanceY;
                        }
                    }
                }
            }
        }

        if (opponent) {
            opponent.health_ -= current.damage_;

            opponent.speed_.x += current.direction_ * current.damage_ / 100 * 300;
            current.speed_.x += current.direction_ * 10;

            const effect = (() => {
                if (current.damage_ >= 20) {
                    playKick();
                    return hitEffect;
                } else {
                    playHit();
                    if (chance(0.5)) {
                        return hitRedEffect;
                    } else {
                        return hitMiniEffect;
                    }
                }
            })();

            addEffect(effect, Vector2.add_(opponent.position_, { x: randomRange(-3, 3), y: randomRange(-14, -18) }));

            const animations = opponent.config_.animations_;

            if (opponent.health_ > 0) {
                opponent.state_ = UnitState.Damage;

                opponent.animationTime_ = 0;

                opponent.animation_ = randomChancesSelect([
                    animations.damage1_,
                    animations.damage2_,
                    animations.knockdown_,
                ], [10, 10, 1]);
            } else {
                opponent.state_ = UnitState.Dead;
                opponent.animation_ = randomSelect([animations.dead1_, animations.dead2_]);
                opponent.animationTime_ = 0;

                if (opponent.config_.mob_) {
                    // playEnemyKilled();
                }
            }
        } else {
            if (!current.config_.mob_) {
                playWhoosh();
            }
        }
    }
}

export const updateUnitsSpritePositions = () => {
    for (const unit of units.values()) {
        updateUnitSpritePosition(unit);
    }
}

const updateUnitSpritePosition = (unit: Unit) => {
    const config = unit.config_;

    unit.sprite_.x = unit.position_.x - config.offset_.x;
    unit.sprite_.y = unit.position_.y - config.offset_.y;

    unit.shadow_.scaleY_ = 0.4;
    unit.shadow_.x = unit.position_.x - config.offset_.x + 0;
    unit.shadow_.y = unit.position_.y - config.offset_.y * unit.shadow_.scaleY_;
}

const checkAttack = (unit: Unit) => {
    if (unit.controller_.attack_) {
        const animations = unit.config_.animations_;
        unit.state_ = UnitState.Attack;
        unit.animation_ = randomSelect([animations.jab_, animations.cross_, animations.kick_]);
        unit.animationTime_ = 0;
    }
}