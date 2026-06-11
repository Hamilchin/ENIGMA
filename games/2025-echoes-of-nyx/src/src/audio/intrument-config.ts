import { SynthConfig } from './Synthetizer';

export const minAttack = 0.008;

export const subConfig: SynthConfig = {
  volume: 0.4,
  type: 'sawtooth',
  enveloppe: {
    attack: 0.5,
    release: 0.09,
  },
  filter: {
    cutoff: -6,
    enveloppeShift: 12,
    enveloppe: {
      attack: 0.5,
      release: 0.09,
    },
  },
  unisson: {
    amount: 7,
    percent: 20,
  },
};

export const bassConfig: SynthConfig = {
  volume: 0.5,
  type: 'sawtooth',
  enveloppe: {
    attack: minAttack,
    release: 0.09,
  },
  filter: {
    cutoff: 0,
    enveloppeShift: 24,
    enveloppe: {
      attack: minAttack,
      release: 0.09,
    },
  },
  unisson: {
    amount: 7,
    percent: 20,
  },
};

const bassSuppEnveloppe = {
  attack: minAttack,
  decay: 0.25,
  sustain: 0.42,
  release: 0.215,
};

export const bassSup1Config: SynthConfig = {
  volume: 0.5,
  type: 'sine',
  enveloppe: bassSuppEnveloppe,
  filter: {
    cutoff: 2,
    enveloppeShift: 12,
    enveloppe: bassSuppEnveloppe,
  },
  unisson: {
    amount: 3,
    percent: 7,
  },
};
export const bassSup2Config: SynthConfig = {
  volume: 0.5,
  type: 'sawtooth',
  enveloppe: bassSuppEnveloppe,
  filter: {
    cutoff: 5,
    enveloppeShift: 0,
  },
  unisson: {
    amount: 2,
    percent: 4,
  },
};

const leadEnveloppe = {
  attack: 0.024,
  decay: 0.5,
  sustain: 0.5,
  release: 1,
};

export const lead1Config: SynthConfig = {
  volume: 0.18,
  type: 'sine',
  enveloppe: leadEnveloppe,
  filter: {
    cutoff: 0,
    enveloppeShift: 24,
    enveloppe: leadEnveloppe,
  },
  unisson: {
    amount: 12,
    percent: 20,
  },
};

export const lead2Config: SynthConfig = {
  volume: 0.17,
  type: 'square',
  enveloppe: leadEnveloppe,
  filter: {
    cutoff: -12,
    enveloppeShift: 12,
    enveloppe: leadEnveloppe,
  },
  unisson: {
    amount: 12,
    percent: 6,
  },
};
