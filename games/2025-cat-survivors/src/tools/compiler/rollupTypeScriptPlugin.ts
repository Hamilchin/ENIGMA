import typescript from "@rollup/plugin-typescript";
import { tsInlineConstEnums } from "./inline-const-enum/transform";
import { tsOptimizeConstEnums } from "./const-enum/transform";
import { propertiesRenameTransformer } from "./mangler/transformer";

export const rollupTypeScriptPlugin = (input: string) =>
  typescript({
    tsconfig: "src/tsconfig.json",
    transformers: (program) => {
      return {
        before: [
          tsInlineConstEnums(program),
          tsOptimizeConstEnums(program),
          propertiesRenameTransformer(program, {
            entrySourceFiles: [input],
          }),
        ],
        after: [],
        afterDeclarations: [
          //tsOptimizeConstEnums(program)
        ],
      };
    },
  });
