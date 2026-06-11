import { WORLD_SCALE_Y } from "./const";
import { drawChest } from "./draw";
import { DropItem, EntityType, type Drop } from "./entity_type";
import { ctx, time } from "./system";
import { cos, min, PI, random, sin, TAU } from "./math";
import { bwColor, calcBaseColor } from "./colors";
import { drops } from "./entities";
import { css_rgba } from "./utils";

export const drawDrop = (drop: Drop) => {
  ctx.save();
  ctx.translate(
    drop.x,
    drop.y * WORLD_SCALE_Y -
      2 +
      sin(time * 4 + drop.anim0) / 2 +
      // -5 * (1 - (1 - drop.captureTime) ** 2)
      -12 * sin(drop.captureTime * 2.5)
  );
  if (drop.item === DropItem.Magnet) {
    ctx.rotate(PI / 6);
    ctx.fillStyle = bwColor(sin(time * 8) / 2 + 0.5);
    ctx.fillRect(-3, -2, 6, 4);
    ctx.fillStyle = "#f00";
    ctx.fillRect(-2, -1, 2, 2);
    ctx.fillStyle = "#00f";
    ctx.fillRect(0, -1, 2, 2);
  } else if (drop.item === DropItem.Bomb) {
    // ctx.rotate(PI / 4);
    // ctx.fillStyle = bwColor(sin(time * 4) / 2 + 0.5);
    // ctx.fillRect(-2, -2, 4, 4);

    ctx.rotate((sin(time * 4) * PI) / 10);
    const s = cos(time * 4);
    //ctx.scale(cos(time * 4) ** 0.5, 1);
    ctx.fillStyle = bwColor(sin(time * 8) / 2 + 0.5);
    ctx.fillRect(-2 * s, -2, 4 * s, 1);
    ctx.fillRect(-0.5, -4, 1, 6);
  } else if (drop.item === DropItem.Chest) {
    drawChest(drop.anim0);
  } else {
    ctx.beginPath();
    ctx.ellipse(
      0,
      0,
      drop.radius + sin(drop.anim0 + time * 13) / 8,
      drop.radius + cos(drop.anim0 + time * 19) / 8,
      0,
      0,
      TAU
    );
    ctx.lineWidth = 1;
    const col =
      drop.item === DropItem.Xp
        ? [0x00ff00, 0x66ffcc, 0xcc66ff][min(2, drop.count - 1)]
        : 0x990000;
    ctx.fillStyle = css_rgba(col);
    ctx.strokeStyle = calcBaseColor(col, 0.5);
    ctx.stroke();
    ctx.fill();
  }
  ctx.restore();
};

export const addDropItem = (
  x: number,
  y: number,
  item: DropItem,
  amount: number,
  radius = item === DropItem.Chest ? 5 : 1
) =>
  drops.push({
    x,
    y: y + 1,
    item: item,
    type: EntityType.Drop,
    count: amount,
    vx: 0,
    vy: 0,
    shadowSize: 1,
    radius: radius,
    captured: 0,
    captureTime: 0,
    anim0: random() * 10,
    color:
      item === DropItem.Xp
        ? [0x00ff00, 0x66ffcc, 0xcc66ff][min(2, amount - 1)]
        : item === DropItem.Hp
        ? 0x990000
        : 0xcccc99,
  });
