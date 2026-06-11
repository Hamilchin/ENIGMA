import { SceneStateMachine } from './scene-state-machine';
import { SceneState } from './scene-state';

export let gameStateMachine: SceneStateMachine;

export function createGameStateMachine(initialState: SceneState, ...initialArguments: any[]) {
  gameStateMachine = new SceneStateMachine(initialState, ...initialArguments);
}
