import {
  rollup,
  type OutputOptions,
  type RollupBuild,
  type RollupOptions,
} from "rollup";
import { build as esbuild } from "esbuild";
import { rollupTypeScriptPlugin } from "./rollupTypeScriptPlugin";
import { writeFileSync } from "node:fs";

export const buildIndexModuleNew = async (input: string, outfile: string) => {
  const logs: any[] = [];
  // see below for details on these options
  const inputOptions: RollupOptions = {
    input,
    external: [],
    plugins: [
      // nodeResolve({}),
      // glslify(),
      // json(),
      rollupTypeScriptPlugin(input),
    ],
    logLevel: "debug",
    onLog: (log) => {
      logs.push(log);
    },
  };
  let bundle: RollupBuild | undefined;
  let buildFailed = false;
  try {
    // Create a bundle. If you are using TypeScript or a runtime that
    // supports it, you can write
    //
    // await using bundle = await rollup(inputOptions);
    //
    // instead and do not need to close the bundle explicitly below.
    bundle = await rollup(inputOptions);
    console.info("count rollup logs:", logs.length);
    // for (const log of logs) {
    //   console.trace(log);
    // }

    await generateOutputs(bundle);
  } catch (error) {
    buildFailed = true;
    // do some error reporting
    console.error(error);
    throw error;
  }
  if (bundle) {
    // closes the bundle
    await bundle.close();
  }

  return await postBuild(outfile);
};

async function generateOutputs(bundle: RollupBuild) {
  // you can create multiple outputs from the same input to generate e.g.
  // different formats like CommonJS and ESM
  const outputOptionsList: OutputOptions[] = [
    {
      file: "build/index.js",
      format: "es",
      sourcemap: true,
    },
  ];
  for (const outputOptions of outputOptionsList) {
    await bundle.write(outputOptions);
  }
}

export const postBuild = async (outfile: string) => {
  const result = await esbuild({
    write: false,
    outfile: outfile,
    entryPoints: ["./build/index.js"],
    charset: "ascii",
    mangleProps: /^_(private|internal)_/,
    // mangleQuoted: false,
    minifyWhitespace: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minify: true,
    treeShaking: true,
    // define: defines,
    drop: ["debugger", "console"],
    legalComments: "none",
    keepNames: false,
    platform: "browser",
    target: ["esnext"],
    format: "esm",
    bundle: true,
    sourcemap: "external",
  });

  for (const error of result.errors) {
    console.error("ERROR:", error.text);
  }

  for (const warning of result.warnings) {
    console.warn("WARN:", warning.text);
  }

  if (result.outputFiles) {
    let code = "";
    let map = "{}";
    for (const outputFile of result.outputFiles) {
      if (outputFile.path.endsWith(".js")) {
        writeFileSync("build/index-esbuild.js", outputFile.text);
        console.info(
          "module: " +
            outputFile.path +
            " (" +
            outputFile.contents.byteLength +
            ")"
        );
        code = outputFile.text;
      } else if (outputFile.path.endsWith(".js.map")) {
        console.info(
          "sourcemap: " +
            outputFile.path +
            " (" +
            outputFile.contents.byteLength +
            ")"
        );
        map = outputFile.text;
      }
    }
    return {
      code: code,
      map: JSON.parse(map),
    };
  }
  throw new Error("fatal build error");
};
