const { unlinkSync, existsSync } = require('node:fs');

deleteFile("./dist/build/index.html");
deleteFile("./dist/build/s.js");
deleteFile("./dist/build/s.js.map");
deleteFile("./dist/build/r");
deleteFile("./dist/game.zip");

function deleteFile(path) {
    if (existsSync(path)) {
        unlinkSync(path);
    }
}