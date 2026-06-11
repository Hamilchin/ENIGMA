import { State } from "./state";

export class StateMachine<T> {
  private states: { [key: string]: State<T> } = {};
  private currentState: State<T> | null = null;
  private lockedStates: Set<string> = new Set();

  constructor(public gameObject: T) { }

  addState(name: string, StateClass: new (gameObject: T, fsm: StateMachine<T>) => State<T>) {
    this.states[name] = new StateClass(this.gameObject, this);
  }

  changeState(name: string): void {
    if (this.isLocked(name)) {
      // Optional: Log or ignore
      // console.warn(`State "${name}" is currently locked and cannot be activated.`);
      return;
    }

    this.currentState?.exit();
    this.currentState = this.states[name];
    this.currentState.enter();
  }

  handleInput(input: any): void {
    this.currentState?.handleInput(input);
  }

  update(delta: number): void {
    this.currentState?.update(delta);
  }

  lockState(stateName: string): void {
    this.lockedStates.add(stateName);
  }

  lockAllStates(): void {
    for (const stateName in this.states) {
      this.lockedStates.add(stateName);
    }
  }

  unlockState(stateName: string): void {
    this.lockedStates.delete(stateName);
  }

  unlockAllStates(): void {
    this.lockedStates.clear();
  }

  isLocked(stateName: string): boolean {
    return this.lockedStates.has(stateName);
  }

}
