import { Vector2 } from "./vector";

const enum XboxControllerButton {
  A, B, X, Y,
  LeftBumper, RightBumper,
  LeftTrigger, RightTrigger,
  Select, Start, L3, R3,
  DpadUp, DpadDown, DpadLeft, DpadRight
}

class Controls {
  isUp = false;
  isDown = false;
  isLeft = false;
  isRight = false;
  isConfirm = false;
  isEscape = false;
  isAttack = false;
  isDash = false;
  isFire = false;
  inputDirection = new Vector2();

  keyMap: { [key: string]: boolean } = {};
  previousState = {
    isUp: false, isDown: false, isLeft: false, isRight: false,
    isConfirm: false, isEscape: false, isAttack: false, isDash: false, isFire: false
  };

  isPressed = false;
  isReleased = false;
  pressFlag = false;
  gamepad: any;

  isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
  touchDirection = new Vector2();
  isTouchAttack = false;
  isTouchDash = false;
  isTouchFire = false;

  constructor() {
    const toggle = (e: KeyboardEvent, p: boolean) => this.keyMap[e.code] = p;
    document.addEventListener('keydown', e => {
      toggle(e, true);
      this.isPressed = true;
      this.isReleased = false;
    });
    document.addEventListener('keyup', e => {
      toggle(e, false);
      this.isPressed = false;
      this.isReleased = true;
    });

    if (this.isMobile) {
      alert('For A Best Experience Please Use Landscape Mode')
      this.setupMobileControls();
    }
  }

  queryController() {
    const prev = this.previousState;
    prev.isUp = this.isUp;
    prev.isDown = this.isDown;
    prev.isLeft = this.isLeft;
    prev.isRight = this.isRight;
    prev.isConfirm = this.isConfirm;
    prev.isEscape = this.isEscape;
    prev.isAttack = this.isAttack;
    prev.isDash = this.isDash;
    prev.isFire = this.isFire;

    const gamepads = navigator.getGamepads?.();
    for (const gpad of gamepads) {
      if (gpad) {
        this.gamepad = gpad;
        break;
      }
    }
    const pad = this.gamepad;
    const b = (btn: XboxControllerButton) => pad?.buttons?.[btn]?.pressed;

    const leftVal = (this.keyMap['KeyA'] || this.keyMap['ArrowLeft'] || b(XboxControllerButton.DpadLeft)) ? -1 : 0;
    const rightVal = (this.keyMap['KeyD'] || this.keyMap['ArrowRight'] || b(XboxControllerButton.DpadRight)) ? 1 : 0;
    const upVal = (this.keyMap['KeyW'] || this.keyMap['ArrowUp'] || b(XboxControllerButton.DpadUp)) ? -1 : 0;
    const downVal = (this.keyMap['KeyS'] || this.keyMap['ArrowDown'] || b(XboxControllerButton.DpadDown)) ? 1 : 0;

    this.inputDirection.x = (leftVal + rightVal) || pad?.axes?.[0] || 0;
    this.inputDirection.y = (upVal + downVal) || pad?.axes?.[1] || 0;

    if (this.isMobile && (this.touchDirection.x || this.touchDirection.y)) {
      this.inputDirection.x = this.touchDirection.x;
      this.inputDirection.y = this.touchDirection.y;
    }

    const d = this.inputDirection;
    if (Math.hypot(d.x, d.y) < 0.1) d.x = d.y = 0;

    this.isUp = d.y < 0;
    this.isDown = d.y > 0;
    this.isLeft = d.x < 0;
    this.isRight = d.x > 0;
    this.isConfirm = !!(this.keyMap['Enter'] || b(XboxControllerButton.A) || b(XboxControllerButton.Start));
    this.isEscape = !!(this.keyMap['Escape'] || b(XboxControllerButton.Select));
    this.isAttack = !!(this.keyMap['Space'] || this.keyMap['KeyJ'] || this.keyMap['Numpad2'] || b(XboxControllerButton.A) || (this.isMobile && this.isTouchAttack));
    this.isDash = !!(this.keyMap['ShiftLeft'] || this.keyMap['KeyK'] || b(XboxControllerButton.B) || (this.isMobile && this.isTouchDash));
    this.isFire = !!(this.keyMap['KeyL'] || this.keyMap['ShiftRight'] || b(XboxControllerButton.X) || (this.isMobile && this.isTouchFire));
  }

  setupMobileControls() {
    const style = (el: HTMLElement, css: Partial<CSSStyleDeclaration>) => Object.assign(el.style, css);

    const joystick = document.createElement('div');
    style(joystick, {
      position: 'fixed', bottom: '50px', left: '50px',
      width: '100px', height: '100px', background: 'rgba(255,255,255,0.2)',
      borderRadius: '50%', touchAction: 'none', pointerEvents: 'auto', zIndex: '1000'
    });
    document.body.appendChild(joystick);

    const joystickThumb = document.createElement('div');
    Object.assign(joystickThumb.style, {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: '30px',
      height: '30px',
      marginLeft: '-15px',
      marginTop: '-15px',
      background: '#fff',
      borderRadius: '50%',
      opacity: '0.8',
      pointerEvents: 'none',
      transition: '0.05s',
    });
    joystick.appendChild(joystickThumb);

    let center: Vector2 | null = null;
    joystick.addEventListener('touchstart', e => {
      const t = e.touches[0];
      center = new Vector2(t.clientX, t.clientY);
    });

    joystick.addEventListener('touchmove', e => {
      e.preventDefault();
      const touch = e.touches[0];
      if (center) {
        const dx = touch.clientX - center.x;
        const dy = touch.clientY - center.y;
        const maxDistance = 30;
        const magnitude = Math.min(Math.hypot(dx, dy), maxDistance);
        const angle = Math.atan2(dy, dx);

        let x = Math.cos(angle) * (magnitude / maxDistance);
        let y = Math.sin(angle) * (magnitude / maxDistance);

        const absX = Math.abs(x);
        const absY = Math.abs(y);

        if (absX > absY) {
          y = 0;
          x = x > 0 ? 1 : -1;
        } else if (absY > absX) {
          x = 0;
          y = y > 0 ? 1 : -1;
        } else {
          x = 0;
          y = 0;
        }

        this.touchDirection.x = x;
        this.touchDirection.y = y;

        joystickThumb.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    });
    joystick.addEventListener('touchend', () => {
      this.touchDirection.x = 0;
      this.touchDirection.y = 0;

      joystickThumb.style.transform = 'translate(0px, 0px)';
    });

    const makeBtn = (id: string, label: string, right: number, bottom: number, callback: (v: boolean) => void) => {
      const btn = document.createElement('button');
      btn.id = id;
      btn.innerText = label;
      style(btn, {
        position: 'fixed', bottom: `${bottom}px`, right: `${right}px`,
        width: '60px', height: '60px', borderRadius: '50%',
        fontSize: '20px', background: 'rgba(255,255,255,0.2)',
        border: 'none', zIndex: '1000', touchAction: 'none', pointerEvents: 'auto'
      });
      btn.addEventListener('touchstart', () => callback(true));
      btn.addEventListener('touchend', () => callback(false));
      document.body.appendChild(btn);
    };

    makeBtn('btn-attack', 'A', 120, 60, v => this.isTouchAttack = v);
    makeBtn('btn-dash', 'B', 40, 70, v => this.isTouchDash = v);
    makeBtn('btn-fire', 'X', 40, 145, v => this.isTouchFire = v);
  }
}

export const controls = new Controls();
