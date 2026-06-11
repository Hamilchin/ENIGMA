import { ECatColor, ETiles } from "../utils/constants";

export type TCatColor = keyof typeof ECatColor;

export interface coordinate {
  x: number;
  y: number;
}

export interface Cat {
  color: TCatColor;
  position: coordinate;
  destroy?: boolean;
}

export type CatElemet = Record<TCatColor, HTMLButtonElement | null>;

export interface Tiles {
  type: ETiles;
  position: coordinate;
  delay?: number;
  hide?: boolean;
  open?: boolean;
  destroy?: boolean;
}

export interface Level {
  width: number;
  height: number;
  cats: Cat[];
  tiles: Tiles[];
}

export interface IBoardKeys {
  total: number;
  collected: number;
}

export interface GridActionDetail {
  success?: boolean;
  isExplode: boolean;
}

export type GridActionEvent = CustomEvent<GridActionDetail>;

export type NavigateDetail = {
  page: string;
  params?: Record<string, any>;
};
