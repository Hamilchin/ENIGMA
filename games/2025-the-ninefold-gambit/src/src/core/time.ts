// core/time.ts

export class Time {
  private _lastTime = 0;
  private _delta = 0;
  private _elapsed = 0;
  private _paused = false;
  private _timeScale = 1;
  private _started = false;

  private _frameInterval = 1000 / 60; // Lock to 60 FPS
  private _accumulator = 0;

  start(currentTime: number) {
    this._lastTime = currentTime;
    this._started = true;
  }

  update(currentTime: number) {
    if (!this._started) {
      this.start(currentTime);
      return;
    }

    if (this._paused) {
      this._delta = 0;
      this._lastTime = currentTime;
      return;
    }

    const rawDelta = currentTime - this._lastTime;
    this._accumulator += rawDelta;

    if (this._accumulator >= this._frameInterval) {
      this._delta = this._frameInterval * this._timeScale;
      this._elapsed += this._delta;
      this._lastTime = currentTime - (this._accumulator % this._frameInterval);
      this._accumulator %= this._frameInterval;
    } else {
      this._delta = 0;
    }
  }

  get delta(): number {
    return this._delta; // in milliseconds
  }

  get deltaSeconds(): number {
    return this._delta / 1000; // in seconds
  }

  get elapsed(): number {
    return this._elapsed;
  }

  get isPaused(): boolean {
    return this._paused;
  }

  get alpha(): number {
    return this._accumulator / this._frameInterval;
  }

  pause() {
    this._paused = true;
  }

  resume() {
    this._paused = false;
  }

  togglePause() {
    this._paused = !this._paused;
  }

  setTimeScale(scale: number) {
    this._timeScale = scale;
  }

  get timeScale(): number {
    return this._timeScale;
  }

  setFrameRate(fps: number) {
    this._frameInterval = 1000 / fps;
  }

  reset(currentTime: number = 0) {
    this._lastTime = currentTime;
    this._delta = 0;
    this._elapsed = 0;
    this._accumulator = 0;
    this._started = true;
  }
}

export const time = new Time();
