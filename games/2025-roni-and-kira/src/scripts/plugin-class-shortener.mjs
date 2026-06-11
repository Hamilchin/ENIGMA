import { createHash } from "node:crypto";

export default function classShortener() {
  const map = new Map(); // original -> short
  const cssClassRE = /\.(?:[a-zA-Z_][\w-]*)/g; // class names in CSS selectors
  const tplClassAttrRE = /class\s*=\s*"([^"]+)"/g; // class="..." in templates

  const short = (name) => {
    if (!map.has(name)) {
      // deterministic short name: a, b, c, ..., aa, ab, ...
      const idx = map.size;
      const base = 52;
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let n = idx;
      let out = "";
      do {
        out = chars[n % base] + out;
        n = Math.floor(n / base) - 1;
      } while (n >= 0);
      map.set(name, out);
    }
    return map.get(name);
  };

  const rewriteClasses = (classes) =>
    classes
      .split(/\s+/)
      .map((c) => map.get(c) || c)
      .join(" ");

  return {
    name: "class-shortener",
    enforce: "pre",
    apply: "build",

    transform(code, id) {
      if (id.endsWith(".css")) {
        // Collect class names
        const classes = new Set();
        for (const m of code.matchAll(cssClassRE)) {
          const cls = m[0].slice(1);
          classes.add(cls);
        }
        // Replace in CSS (whole-word after '.')
        let out = code;
        for (const cls of classes) {
          const s = short(cls);
          const re = new RegExp(`\\.${cls}(?![\\w-])`, "g");
          out = out.replace(re, "." + s);
        }
        return { code: out, map: null };
      }

      if (id.endsWith(".ts") || id.endsWith(".js")) {
        // Replace inside HTML template class="..."
        let out = code;
        out = out.replace(tplClassAttrRE, (_m, g1) => {
          const classes = g1.trim().split(/\s+/);
          const mapped = classes.map((c) => map.get(c) || c).join(" ");
          return `class="${mapped}"`;
        });
        return { code: out, map: null };
      }
    },
  };
}
