import { now } from "./browser";

export let nowMS: number = now();
export let deltaS: number = 0;

export const calculateTime = () => {
    const oldMS = nowMS;
    nowMS = now();
    deltaS = (nowMS - oldMS) / 1000;
}