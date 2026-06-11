export interface SceneState {
  onUpdate: (timeElapsed: number) => void;
  onEnter?: Function;
  onExit?: Function;
}