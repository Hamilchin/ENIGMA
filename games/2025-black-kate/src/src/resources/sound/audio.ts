import { timeout } from "../../utils/browser";
import background from "./background";
import { zzfxX as audioContext, zzfx, zzfxM, zzfxP, zzfxX } from "./zzfx";

export const musicGainNode = audioContext.createGain();
musicGainNode.gain.value = 0.3;

export const effectsGain = { value: 0.6 };

const effectHit = [, , 418, .01, .01, .03, 4, 2.1, -1, , , , , .2, , .2, , .67, .03, , 107];
const effectKick = [, 1, 48, , .04, .01, 4, 1.6, 1, -26, 300, , , 1.3, , .1, , .9, .03];
const effectWhoosh = [.5, .4, 500, .1, .01, , , 1.8, -0.5, -20, 100, .5, , 2.5, , , , .1, .1, , 400];
const effectLoose = [2.1, 0, 65.40639, .03, .6, .16, 2, 3.7, , -0.5, , , , .2, , .1, .01, .33, .08];
const effectWin = [2, , 61, .08, .24, .42, , 3.7, 9, , , , , 1.4, , .1, .21, .32, .09];
const effectEnemyKilled = [, .2, 329.6276, .4, .01, , , 10, , 10, 15, .1, 1, 1, , .08, .1, .92, .4, 1, 1e3];

const unlockAudio = (force = false) => {
  if (force || audioContext.state === "suspended") {
    audioContext.resume().catch();
  }
};

const playMusic = async () => {
  const buffer = await renderSong(background),
    node = zzfxP(...buffer);

  node.connect(musicGainNode);
  node.loop = true;
  node.start();

  musicGainNode.connect(zzfxX.destination);

  zzfxX.resume();
};

const renderSong = async (song: any): Promise<any[][]> => {
  await timeout(50);
  return zzfxM(...song);
};

const playEffect = (effect: any, volume: number = 1) => {
  const effectGainNode = audioContext.createGain();
  effectGainNode.gain.value = effectsGain.value * volume;

  const node = zzfx(...effect);
  node.connect(effectGainNode);
  node.loop = false;

  effectGainNode.connect(zzfxX.destination);

  node.start();
}

export const playWhoosh = () => playEffect(effectWhoosh, 0.5);
export const playHit = () => playEffect(effectHit);
export const playKick = () => playEffect(effectKick);
export const playLoose = () => playEffect(effectLoose, 1.5);
export const playWin = () => playEffect(effectWin, 1.5);
export const playEnemyKilled = () => playEffect(effectEnemyKilled);

export { audioContext, unlockAudio, playMusic };

