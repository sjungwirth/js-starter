'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var purify = require('gulp-purifycss');

gulp.task('css:watch', function () {
    gulp.watch('./public/css/*.scss', ['css']);
});

gulp.task('css', function () {
    return gulp.src('./public/css/index.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(purify(['./public/app/**/*.js', './public/**/*.html']))
        .pipe(gulp.dest('./public/build/'));
});


gulp.task('javascript', function () {
    var browserify = require('browserify'),
        path = require('path'),
        fs = require('fs'),
        exorcist = require('exorcist'),
        mapfile = path.join(__dirname, 'public/build/index.js.map');

    browserify({debug: true})
        .transform({
            global: true
        }, 'uglifyify')
        .require(require.resolve('./app/index'), {entry: true})
        .bundle()
        .pipe(exorcist(mapfile))
        .pipe(fs.createWriteStream(path.join(__dirname, 'public/build/index.js'), 'utf8'))
});
