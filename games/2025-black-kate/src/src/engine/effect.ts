import { hit0, hit1, hit2, hitMini0, hitMini1, hitMini2, hitRed0, hitRed1, hitRed2 } from "../resources/id";
import { Vector2 } from "../utils/geom";
import { deltaS } from "../utils/time";
import { animationDuration, AnimationFrame, getFrameImage } from "./animation";
import { Sprite } from "./sprite";

export const effects: Array<Effect> = [];

export interface Effect {
    sprite_: Sprite,
    animation_: Array<AnimationFrame>,
    animationTime_: number,
}

export interface EffectConfig {
    animation_: Array<AnimationFrame>,
    offset_: Vector2,
}

export const hitEffect: EffectConfig = {
    animation_: [
        { image_: hit0, time_: 0.1 },
        { image_: hit1, time_: 0.1 },
        { image_: hit2, time_: 0.1 },
    ],
    offset_: { x: 16, y: 16 }
}

export const hitMiniEffect: EffectConfig = {
    animation_: [
        { image_: hitMini0, time_: 0.1 },
        { image_: hitMini1, time_: 0.2 },
        { image_: hitMini2, time_: 0.2 },
    ],
    offset_: { x: 8, y: 8 }
}

export const hitRedEffect: EffectConfig = {
    animation_: [
        { image_: hitRed0, time_: 0.1 },
        { image_: hitRed1, time_: 0.2 },
        { image_: hitRed2, time_: 0.2 },
    ],
    offset_: { x: 8, y: 8 }
}

export const removeEffect = (effect: Effect) => {
    const index = effects.indexOf(effect);
    if (index != -1) {
        effects.splice(index, 1);
    }
}

export const addEffect = (config: EffectConfig, position: Vector2) => {
    effects.push({
        animation_: config.animation_,
        animationTime_: 0,
        sprite_: {
            image_: -1,
            x: position.x - config.offset_.x,
            y: position.y - config.offset_.y
        }
    });
}

export const updateEffects = () => {
    for (const effect of effects) {
        const duration = animationDuration(effect.animation_);
        effect.animationTime_ += deltaS;
        if (effect.animationTime_ > duration) {
            removeEffect(effect);
        } else {
            effect.sprite_.image_ = getFrameImage(effect.animation_, effect.animationTime_);
        }
    }
}