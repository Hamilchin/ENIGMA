import { StateMachine } from "./state-machine";

export class State<T> {
  constructor(
    public gameObject: T,
    public stateMachine: StateMachine<T>
  ) {}

  enter(): void {}
  handleInput(input: any): void {}
  update(delta: number): void {}
  exit(): void {}
}
