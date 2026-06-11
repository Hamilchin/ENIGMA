// scripts/zip-and-check.mjs
import zl from "zip-lib";
import { statSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
// Zip fuera de dist/, en la raíz del proyecto
const OUT_ZIP = join(process.cwd(), "game.zip");
const LIMIT = 13 * 1024; // 13 KB

async function main() {
  if (!existsSync(DIST)) {
    console.error("Build not found. Expected dist/ folder");
    process.exit(1);
  }

  // Si ya existe el zip anterior, lo borramos para no incluirlo
  if (existsSync(OUT_ZIP)) {
    rmSync(OUT_ZIP);
  }

  // Crea un zip con TODO lo que hay en dist/
  await zl.archiveFolder(DIST, OUT_ZIP);

  const size = statSync(OUT_ZIP).size;
  const kb = (size / 1024).toFixed(2);
  const ok = size <= LIMIT;
  console.log(
    `\nZIP size: ${kb} KB (${size} bytes) — ${ok ? "OK ✅" : "TOO BIG ❌"}`
  );
  if (!ok) process.exitCode = 2;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
