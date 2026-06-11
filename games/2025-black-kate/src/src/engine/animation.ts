export interface AnimationFrame {
    image_: number,
    time_: number,
}

export const animationDuration = (animation: Array<AnimationFrame>): number => {
    let time = 0;

    for (const frame of animation) {
        time += frame.time_;
    }

    return time;
}

export const getFrameImage = (animation: Array<AnimationFrame>, animationTime: number): number => {
    let time = 0;

    const duratuion = animationDuration(animation);
    animationTime %= duratuion;

    for (let i = 0; i < animation.length; i++) {
        const frame = animation[i];
        time += frame.time_;

        if (animationTime <= time) {
            return frame.image_;
        }
    }

    return 0;
}

export const isAnimationFinished = (animation: Array<AnimationFrame>, animationTime: number): boolean => {
    const duratuion = animationDuration(animation);
    return animationTime >= duratuion;
}
