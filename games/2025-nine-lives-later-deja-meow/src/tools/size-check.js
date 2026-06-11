import { existsSync, statSync } from 'fs';
import { resolve } from 'path';

const zipPath = resolve('dist/game.zip');
const LIMIT = 13 * 1024; // 13,312 bytes

if (!existsSync(zipPath)) {
    console.error('❌ No game.zip found at', zipPath);
    process.exit(1);
}

const { size } = statSync(zipPath);
const remaining = LIMIT - size;
const pct = ((size / LIMIT) * 100).toFixed(1);

const fmt = n => n.toLocaleString('en-US');
console.log(`ZIP: ${fmt(size)} bytes (${pct}% of ${fmt(LIMIT)}).`);
console.log(
    remaining >= 0
        ? `Remaining: ${fmt(remaining)} bytes.`
        : `Over by: ${fmt(-remaining)} bytes.`
);
