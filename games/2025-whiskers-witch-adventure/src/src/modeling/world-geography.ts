import { Mesh } from '@/engine/renderer/mesh';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import {heightmap, materials} from "@/textures";
import {makeBridgePiece} from "./bridges";
import { cylinderSelector2 } from './building-blocks';
import { Material } from '@/engine/renderer/material';

export const geoTexPerSide = () => [materials.cartoonRockWall, materials.cartoonRockWall, materials.cartoonGrass, materials.cartoonRockWall, materials.cartoonRockWall, materials.cartoonRockWall];

export function makeFloor() {
  const floorGeo = new MoldableCubeGeometry(512, 1, 512, 1, 1, 1, 1)
  return new Mesh(floorGeo
      .texturePerSide(materials.cartoonGrass)
      .spreadTextureCoords(40, 40).computeNormals().done_(), materials.cartoonGrass);
}

export function makePlinth(height: number, radius: number, texture: Material, sides = 2) {
  return new MoldableCubeGeometry(4, height, 4, sides, 1, sides)
    .selectBy(cylinderSelector2(2))
    .cylindrify(radius)
    .texturePerSide(texture)
    .all_()
    .translate_(0, height / 2)
    .spreadTextureCoords()
    .computeNormals();
}

export function makeTree(isRound?:boolean) {
  const base = new MoldableCubeGeometry(4, isRound ? 4 : 30, 4, 3, isRound ? 3 : 1, 3)

    .texturePerSide(materials.shrubs);

  if (isRound) {
    base.spherify(12)
  } else {
    base.selectBy(cylinderSelector2())
      .cylindrify(12)
      .selectBy(vert => vert.y > 0)
      .scale_(0.5, 1, 0.5)

  }

  return base.all_().translate_(0, 25).spreadTextureCoords().merge(
    new MoldableCubeGeometry(4, 15, 4, 3, 1, 3)
      .selectBy(cylinderSelector2())
      .spreadTextureCoords()

      .cylindrify(2)
      .all_()
      .translate_(0, 8)
      .texturePerSide(materials.wood)
  )

    .computeNormals(true)
}

export function tubeCliffAndCave() {
  return new MoldableCubeGeometry(130, 30, 90, 4, 3, 2)
      .texturePerSide(...geoTexPerSide())

      .selectBy(vert => vert.x > 60)
      .translate_(0, 0, -5)

      .selectBy(vert => vert.x > 60 && vert.z < -30)
      .translate_(40, 0, 35)

      .selectBy(vert => vert.x < 30)
      .translate_(0, 0, 10)

    .selectBy(vert => vert.y > 10 && vert.x < -40 && vert.z < 0)
    .translate_(-6, 6)

      .selectBy(vert => vert.y > 10)
      .scale_(1.2, 1, 1.2)

    .merge(new MoldableCubeGeometry(1.5, 84, 120, 1, 1, 3)
      .selectBy(vert => vert.y > 0)
      .cylindrify(50, 'x')
      .all_()
      .texturePerSide(materials.cartoonRockWall)
      .translate_(105,27,10)
    )

    .merge(
      new MoldableCubeGeometry(4, 20, 4, 2, 1, 2).selectBy(cylinderSelector2(2))
        .cylindrify(10)
        .texturePerSide(...geoTexPerSide())
        .all_()
        .translate_(10, -5, -60)
    )
    .merge(
      new MoldableCubeGeometry(4, 10, 4, 3, 1, 2).selectBy(cylinderSelector2(2))
        .cylindrify(10)
        .texturePerSide(...geoTexPerSide())
        .all_()
        .translate_(-20, -10, -75)
    )

      .all_()

      // world positioning
      .translate_(150, 15, -100).done_()
}

export function mountainAreaLeftCliff() {
  return new MoldableCubeGeometry(240, 40, 240, 4, 2, 4)
      .texturePerSide(...geoTexPerSide())

      // Make a bit of a hill so the surface isn't just flat
      .selectBy(vert => vert.y > 15 && Math.abs(vert.x) < 120 && Math.abs(vert.z) < 120)
      .translate_(0, 7)

      // extend back side to connect to raised path
      .selectBy(vert => vert.x > 0 && vert.z < 40)
      .translate_(25, 0)

      .selectBy(vert => vert.x > 0 && vert.z < 0)
      .translate_(90)


      // create overhang
      .selectBy(vert => vert.y > 15 && vert.x > 0)
      .scale_(1.1, 1, 1.1)

      // World positioning
      .all_()
      .spreadTextureCoords(40, 40)
      .translate_(-135, 20, -135)
      .done_();
}

export function frontLeftCliffForBridge() {
  return new MoldableCubeGeometry(180, 30, 60, 4, 2, 2)
      .texturePerSide(...geoTexPerSide())

      .selectBy(vert => vert.x < -30 && vert.z > 20)
      .translate_(0, 0, 20)

      .selectBy(vert => vert.z < 0 && vert.x < 20 && vert.x > -60 && vert.y > 0)
      .translate_(0, 10)

      .selectBy(vert => vert.x < -60)
      .translate_(0, 0, 30)

      .selectBy(vert => vert.x > 30 && vert.x < 50 && vert.z > 20)
      .translate_(0, 0, 10)

      .selectBy(vert => vert.x > 50)
      .scale_(1, 1, 0.3)

      .selectBy(vert => vert.y > 10 && vert.x > -90)
      .scale_(1.2, 1, 1.2)

      .spreadTextureCoords(20, 20)

      // World positioning
      .all_()
      .translate_(-170, 15, 65)
      .done_();
}

export function worldWall() {
  return new MoldableCubeGeometry(512, 32, 2).texturePerSide(materials.shrubs).translate_(0, 16, 256)      .spreadTextureCoords()

      .merge(new MoldableCubeGeometry(2, 32, 512).texturePerSide(materials.shrubs).translate_(256, 16)      .spreadTextureCoords())

      .merge(new MoldableCubeGeometry(2, 32, 512, 1, 1, 4)
        .selectBy(vert => vert.z < 256 && vert.y > 0)
        .translate_(0, 20)
        .selectBy(vert => vert.z < 128 && vert.y > 0)
        .translate_(0, 20)
        .all_()
        .texturePerSide(materials.shrubs).translate_(-256, 16)
        .spreadTextureCoords(40,40)
      )

      .merge(
        new MoldableCubeGeometry(512, 32, 2, 4)
          .texturePerSide(materials.shrubs)
          .selectBy(vert => vert.y > 0 && vert.x < 256)
          .translate_(0, 40)
          .all_()
          .translate_(0, 16, -256)
          .spreadTextureCoords(20, 20)
      )

      .done_();
}

export function nightCave() {
  return makeBridgePiece(60, 1, 1.3)
      .texturePerSide(materials.cartoonRockWall)
      .selectBy(vert => vert.z > 10 && vert.y < 0)
      .translate_(0, -13)
      // .selectBy(vert => vert.x > 5 && vert.y > -20)
      // .scale_(1, 0.8, 0.5)

      // .selectBy(vert => vert.x > 6 && vert.y > 0 && vert.y < 25)
      // .scale_(1, 0.8, 0.8)


      // Roof with opening
      .merge(
        makeBridgePiece(2, 1, 1.3)
          .texturePerSide(materials.cartoonRockWall)
          .selectBy(vert => vert.y < 0 && Math.abs(vert.z) < 20)
          .scale_(1, 1, 0.2)
          .selectBy(vert => vert.y > 5 && vert.y < 16 && Math.abs(vert.z) < 17)
          .translate_(0, -14)
          .selectBy(vert => vert.y < 0)
          .translate_(0, -14)
          .spreadTextureCoords(20, 20)
          .all_().translate_(31).done_()
      )






    //roate and scale bridge into place
      .all_()
      .rotate_(0, 0, Math.PI / 2)
      .scale_(3, 1, 3)

    .selectBy(vert => vert.y > 10 && vert.z > 70)
    .translate_(0, 0, 10)

      // backing wall
      .merge(new MoldableCubeGeometry(2, 100, 150, 1, 1, 10)
        .texturePerSide(materials.cartoonRockWall)
        .selectBy(vert => vert.y > 0)
        .cylindrify(90, 'x')
        .translate_(0, -40)
        .all_()
        .translate_(100, 25)
      )

      // rooftop cave opening
      .merge(makeBridgePiece(120, 1, 1.).texturePerSide(materials.cartoonRockWall).scale_(1, 1, 1.3).all_().scale_(1, 1.3, 2).translate_(40, 50))

    .merge(new MoldableCubeGeometry(145, 1, 187)
      .texturePerSide(materials.cartoonRockWall)
      .selectBy(vert => vert.x < 0 && vert.z > 0)
      .translate_(3, 0, -2)
      .all_()
      .translate_(27, -24.8, -36)
    )

    .all_()
      // world positioniong
      .translate_(155, 25, 15)
      .computeNormals()
      .done_();
}