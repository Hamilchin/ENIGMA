import {MoldableCubeGeometry} from "@/engine/moldable-cube-geometry";
import {materials} from "@/textures";
import { rampSection, tubify } from './hedge-maze-and-tube';
import { geoTexPerSide, makePlinth, makeTree } from './world-geography';

export function makeTreeline() {
  return makeTree()
    .merge(makeTree(true).translate_(32, 0, 10))
    .merge(makeTree().translate_(60, 0, 20))
    .merge(makeTree(true).translate_(93, 0, 38))
    // wall
    .merge(rampSection(20, 0, 39, 45)
      .spreadTextureCoords()
      .texturePerSide(materials.shrubs)
      .scale_(1, 1.5, 1)
      .rotate_(0, 3)
      .translate_(90, 0, 90)
      .computeNormals()
    )

    // shrub platform
    .merge(new MoldableCubeGeometry(140, 30, 20).texturePerSide(materials.shrubs)
      .selectBy(vert => vert.z < 0 && vert.x < 0)
      .translate_(0,0,-20)
      .all_()
      .translate_(10, 15, 135)
      .spreadTextureCoords()
      .computeNormals()
    )

    // cage wall
    .merge(
      new MoldableCubeGeometry(80, 35, 2)
        .texturePerSide(materials.bars)
        .translate_(-100, 13, 107)
        .spreadTextureCoords(3)
    )

    // back of cage shrub
    .merge(
      new MoldableCubeGeometry(30, 33, 40).texturePerSide(materials.shrubs)
        .translate_(-155, 14, 125)
        .spreadTextureCoords()
        .computeNormals()
    )


    // get to trees
    .merge(makePlinth(30, 4, materials.brickWall).translate_(-15, 0, -20))
    .merge(makePlinth(20, 4, materials.brickWall).translate_(-25, -2, -36))
    .merge(makePlinth(10, 4, materials.brickWall).translate_(-30, 0, -50))

    // exit cage
    .merge(makePlinth(20, 4, materials.brickWall).translate_(-135, 0, 132))
    .merge(makePlinth(10, 4, materials.brickWall).translate_(-135, 0, 118))

    // witch stand cage
    .merge(makePlinth(10, 14, materials.brickWall).translate_(-100, -5, 125))

    // witch stand main
    .merge(makePlinth(5, 18, materials.brickWall).translate_(-10, 0, 40))

    // world alignment
    .translate_(120, 0, 110)
}