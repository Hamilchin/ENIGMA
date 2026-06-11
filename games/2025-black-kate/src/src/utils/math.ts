const math = Math;

export const mathFloor = math.floor;
export const mathCeil = math.ceil;
export const mathRound = math.round;
export const mathMin = math.min;
export const mathMax = math.max;
export const mathHypot = math.hypot;
export const mathAbs = math.abs;
export const mathRandom = math.random;
export const mathAtan2 = math.atan2;
export const mathCos = math.cos;
export const mathSin = math.sin;
export const mathPI = math.PI;
export const mathPI2 = mathPI * 2;
export const numberMax = Number.MAX_VALUE;

export const limit = (min: number, max: number, value: number) => mathMin(max, mathMax(min, value));
export const lerp = (min: number, max: number, value: number) => min + value * (max - min);
export const randomRange = (min: number, max: number): number => lerp(min, max, mathRandom());
export const chance = (chance: number): boolean => mathRandom() < chance;

export function randomSelect<T>(values: T[]): T {
    return values[mathRound(randomRange(0, values.length - 1))];
}

export function randomChancesSelect<T>(values: T[], chances: Array<number>): T {
    const total = chances.reduce((p, c) => p + c, 0);

    const chance = mathRandom() * total;
    
    let c = 0;

    for(let i = 0; i < values.length; i++) {
        c += chances[i];
        if (chance < c) {
            return values[i];
        }
    }

    return values[0];
}