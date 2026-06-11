import { execFileSync } from "node:child_process";
import { statSync } from "node:fs";
import advzip from "advzip-bin";
import type { Plugin } from "vite";
// import { addDefaultValues, printJs13kStats } from './utils';

export interface AdvzipOptions {
  pedantic?: boolean;
  shrinkLevel?:
    | 0
    | 1
    | 2
    | 3
    | 4
    | "store"
    | "fast"
    | "normal"
    | "extra"
    | "insane";
}

export const defaultAdvzipOptions: AdvzipOptions = {
  shrinkLevel: "insane",
  pedantic: true,
};

/**
 * Creates the advzip plugin that uses AdvanceCOMP to optimize the zip file.
 * @returns The advzip plugin.
 */
export function advzipPlugin(
  options: AdvzipOptions = defaultAdvzipOptions
): Plugin {
  const advzipOptions = options;
  return {
    name: "vite:advzip",
    apply: "build",
    enforce: "post",
    closeBundle: async (): Promise<void> => {
      try {
        const args = ["--recompress"];
        if (advzipOptions.pedantic) {
          args.push("--pedantic");
        }
        if (advzipOptions.shrinkLevel !== undefined) {
          if (typeof advzipOptions.shrinkLevel === "number") {
            args.push(`-${advzipOptions.shrinkLevel}`);
          } else {
            args.push(`--shrink-${advzipOptions.shrinkLevel}`);
          }
        }
        args.push("dist/index.zip");
        const result = execFileSync(advzip, args);
        console.log(result.toString().trim());
        const stats = statSync("dist/index.zip");
        console.info("advzip ZIP", stats.size);
      } catch (err) {
        console.log("advzip error", err);
      }
    },
  };
}
