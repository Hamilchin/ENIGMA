import gulp from 'gulp';
import webpackStream from 'webpack-stream';
import replaceHTML from 'gulp-html-replace';
import zip from 'gulp-zip';
import fs from 'fs';
import { Packer } from 'roadroller';
import gulpCheckFilesize from 'gulp-check-filesize';
import deleteFiles from 'gulp-delete-files';
import GulpCleanCss from 'gulp-clean-css';

const config = {
    src: {
        html: 'src/**.html',
        css: 'src/**.css',
        js: 'src/game/**.js'
        //images: 'src/images/**'
    },
    build: {
        dir: 'build',
        css: 'style.css',
        js: 'main.js',
        jsMin: 'main.min.js'
        //images: 'build/images'
    },
    dist: {
        dir: 'dist',
        css: 'style.min.css',
        js: 'game.min.js'
        //images: 'dist/images'
    },
    zipFileName: 'miami_mice.zip',
    zipFileSizeLimit: 13 * 1024 // 13 KB
};

gulp.task('webpackJS', () => {
    console.log('Building JS with Webpack...');
    return gulp.src('src/game/main.js')
    .pipe(webpackStream({
        mode: 'production',
    }))
    .pipe(gulp.dest(config.build.dir));
});

gulp.task('buildHTML', () => {
    console.log('Building HTML...');
    return gulp.src(config.src.html)
        .pipe(replaceHTML({
            css: config.build.css,
            js: config.build.jsMin
        }))
        .pipe(gulp.dest(config.build.dir));
});

gulp.task('buildCSS', () => {
    console.log('Building CSS...');
    return gulp.src(config.src.css)
        .pipe(GulpCleanCss())
        .pipe(gulp.dest(config.build.dir));
});

async function roadRollJs() {
    
    const packer = new Packer([
        {
            data: fs.readFileSync(config.build.dir + '/' + config.build.js, 'utf8'),
            type: 'js',
            action: 'eval'
        }
    ]);
    await packer.optimize(1);
    const { firstLine, secondLine } = packer.makeDecoder();
    let jsString = firstLine + secondLine;
    
    fs.writeFileSync(config.build.dir + '/' + config.build.jsMin, jsString, 'utf8');
    fs.unlink(config.build.dir + '/' + config.build.js, (err)=>{});
}

gulp.task('zip', () => {

    gulp.src('dist/*')
        .pipe(deleteFiles());

    return gulp.src(`${config.build.dir}/**`)
        .pipe(zip(config.zipFileName))
        .pipe(gulp.dest('dist'))
        .pipe(gulpCheckFilesize({
            fileSizeLimit: config.zipFileSizeLimit
        }));
});

gulp.task('directories', function () {
    return gulp.src('*.*', {read: false})
        .pipe(gulp.dest('./build'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', gulp.series(
    'directories',
    'webpackJS',
    roadRollJs,
    'buildHTML',
    'buildCSS',
    'zip'
));