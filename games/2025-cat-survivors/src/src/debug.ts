import { drawText } from "./bubble";
import { CSS_WHITE } from "./colors";
import { getStat } from "./stats";
import { StatKey } from "./upgrade_types";

export const drawDebugStats = () => {
  let px = 0;
  let py = 80;
  const dy = 10;
  drawText(px, py, "max hp: " + getStat(StatKey.Hp), CSS_WHITE, 8, 0);
  py += dy;
  drawText(px, py, "+xp: " + getStat(StatKey.Xp), CSS_WHITE, 8, 0);
  py += dy;
  drawText(px, py, "Armor: " + getStat(StatKey.Armor), CSS_WHITE, 8, 0);
  py += dy;
  drawText(px, py, "Area: " + getStat(StatKey.DamageRadius), CSS_WHITE, 8, 0);
  py += dy;
  drawText(px, py, "Damage: " + getStat(StatKey.Damage), CSS_WHITE, 8, 0);
  py += dy;
  drawText(
    px,
    py,
    "Bullet speed: " + getStat(StatKey.BulletSpeed),
    CSS_WHITE,
    8,
    0
  );
  py += dy;
  drawText(
    px,
    py,
    "Extra proj: " + getStat(StatKey.Projectile),
    CSS_WHITE,
    8,
    0
  );
  py += dy;
  drawText(
    px,
    py,
    "Regen " + getStat(StatKey.Regen) + " per second",
    CSS_WHITE,
    8,
    0
  );
  py += dy;
  drawText(
    px,
    py,
    "Speed mod weapon " + getStat(StatKey.FireRate),
    CSS_WHITE,
    8,
    0
  );
  py += dy;
  drawText(px, py, "Luck " + getStat(StatKey.Luck), CSS_WHITE, 8, 0);
  py += dy;
  drawText(
    px,
    py,
    "Magnet Radius " + getStat(StatKey.MagnetRadius),
    CSS_WHITE,
    8,
    0
  );
  py += dy;
  drawText(
    px,
    py,
    "Passive Slots " + getStat(StatKey.PassiveSlots),
    CSS_WHITE,
    8,
    0
  );
  py += dy;
  drawText(
    px,
    py,
    "Weapon Slots " + getStat(StatKey.WeaponSlots),
    CSS_WHITE,
    8,
    0
  );
  py += dy;
  drawText(
    px,
    py,
    "Move Speeed " + getStat(StatKey.MoveSpeed),
    CSS_WHITE,
    8,
    0
  );
  py += dy;
};
