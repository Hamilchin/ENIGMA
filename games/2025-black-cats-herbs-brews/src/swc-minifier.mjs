import { minify } from '@swc/core';
import fs from 'fs';

let inputFile = process.argv[2];
let outputFile = process.argv[3];

let code = fs.readFileSync(inputFile, 'utf-8');
let minified = await minify(code, {
    compress: true,
    mangle: true,
    sourceMap: false,
    format: {
        comments: false
    }
});

fs.writeFileSync(outputFile, minified.code);