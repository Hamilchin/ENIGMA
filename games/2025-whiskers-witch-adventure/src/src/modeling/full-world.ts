import {
  frontLeftCliffForBridge,
  makeFloor,
  mountainAreaLeftCliff, nightCave,
  tubeCliffAndCave, worldWall,
} from './world-geography';
import { Mesh } from '@/engine/renderer/mesh';
import { mountain } from './mountain';
import { materials } from '@/textures';
import { hedgeMazeAndTube, tunnel } from './hedge-maze-and-tube';
import { rampToJump } from './ramp-to-jump';
import { floatingPlatforms } from './floating-platforms';
import { floatingPath } from './floating-path';
import { bridge, frontRamp } from './bridges';
import {makeTreeline} from "./opening-area";
import { makeWorldTrees } from './world-trees';

export function makeWorld() {
  return new Mesh(
    tubeCliffAndCave()
      .merge(mountainAreaLeftCliff())
      .merge(frontLeftCliffForBridge())
      .merge(worldWall())
      .merge(nightCave())
      .merge(hedgeMazeAndTube())
      .merge(tunnel())
      .merge(rampToJump())
      .merge(floatingPlatforms())
      .merge(floatingPath())
      .merge(mountain())
      .merge(bridge())
      .merge(frontRamp())
      .merge(makeTreeline())
      .merge(makeWorldTrees())
      .done_()
  , materials.cartoonGrass);
}