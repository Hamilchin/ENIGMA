// Bundle the in-page shim to a single IIFE injectable via Playwright addInitScript.
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
await build({
  entryPoints: [join(__dir, 'shim-entry.mjs')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'chrome120',
  outfile: join(__dir, 'shim.bundle.js'),
  legalComments: 'none',
  // fake-timers has a node-only `require("util").promisify` (guarded by process at
  // runtime, but esbuild resolves it statically) — alias to a browser stub.
  alias: { util: join(__dir, 'util-stub.js') },
});
console.log('[build-shim] wrote env/clock/shim.bundle.js');
