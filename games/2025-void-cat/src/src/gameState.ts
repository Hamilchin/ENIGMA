import type { ScreenId } from './screen';

type GameStateType = {
  caloriesBurned: number;
  money: number;
  energyCurrent: number;
  energyMax: number;
  currentTurn: number;
  currentStage: number;
  currentScreen: ScreenId;
};

export const GAME_STATE_OF_TRUTH: GameStateType = {
  caloriesBurned: 0,
  money: 0,
  energyCurrent: 5,
  energyMax: 5,
  currentTurn: 0,
  currentStage: 0,
  currentScreen: 'si',
};

export function setGameState<K extends keyof GameStateType>(
  key: K,
  value: GameStateType[K]
): void {
  GAME_STATE_OF_TRUTH[key] = value;
}
