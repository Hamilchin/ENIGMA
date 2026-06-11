export const BASE_WIDTH = 412;
export const BASE_HEIGHT = 732;
export const PADDING_SIZE = 50;
export const BASE_WIDTH_TILE = BASE_WIDTH - PADDING_SIZE;
export const CAT_SPEED = 40;
export const HANDLE_GRID_ACTION = "grid-action";
export const GAME_LABEL_ATTRIBUTE = "level";
export const CUSTOM_ROUTER_EVENT_NAME = "navigate";

export const LOCAL_STORAGE_KEY = {
  LEVEL: "level",
  SOUNDS: "sounds",
  SELECTED: "selected",
};

export const ROUTER_PAGE = {
  LOBBY: "lobby",
  LEVEL_SELECT: "level-select",
  GAME: "game",
};

export const ROUTER_COMPONENT = {
  ROUTER: "app-router",
  GAME: "app-game",
  GRID: "grid-game",
  LEVEL_SELECT: "app-level-select",
  LOBBY: "app-lobby",
};

export const EVENT_TYPE = {
  CLICK: "click",
  MOUSE_DOWN: "mousedown",
  MOUSE_UP: "mouseup",
  TOUCH_START: "touchstart",
  TOUCH_END: "touchend",
  RESIZE: "resize",
  CONTEXT_MENU: "contextmenu",
};

export enum ECatColor {
  BLACK = "BLACK",
  YELLOW = "YELLOW",
}

export enum ETiles {
  BRICK,
  COIN,
  SPIKE,
  KEYS,
  GATES,
  BOXES,
}

export enum EDirections {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

export enum ESounds {
  CLICK,
  SWIPE,
  COIN,
  EXPLODE,
  KEY,
  OPEN,
  DESTROY,
  SUCESS,
  GAME_OVER,
}

export const INCREASE_SWIPE = [
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
];
