import { SceneState } from './scene-state';

export class SceneStateMachine {
  private currentState: SceneState;

  constructor(initialState: SceneState, ...enterArgs: any) {
    this.currentState = initialState;
    this.currentState.onEnter?.(...enterArgs);
  }

  setState(newState: SceneState, ...enterArgs: any) {
    this.currentState.onExit?.();
    this.currentState = newState;
    this.currentState.onEnter?.(...enterArgs);
  }

  getState() {
    return this.currentState;
  }
}
