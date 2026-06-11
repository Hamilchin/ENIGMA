const { copyFileSync, constants } = require('node:fs');

copyFileSync('./src/index.html', './dist/build/index.html', constants.COPYFILE_EXCL);