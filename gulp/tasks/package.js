/**
 * package
 * Bundles JS as part of build task
 *
 */
var gulp,
    util,
    rename,
    uglify,
    babel,
    sourcemaps;

gulp = require('gulp');
util = require('gulp-util');
rename = require('gulp-rename');
sourcemaps = require('gulp-sourcemaps');
uglify = require('gulp-uglify');
babel = require('gulp-babel');

module.exports = function () {
    return gulp.src('src/ignition.js')
        .pipe(sourcemaps.init())
        .pipe(babel({ presets: ['babel-preset-es2015'] }))
        .pipe(gulp.dest('dist/'))
        .pipe(rename('ignition.min.js'))
        .pipe(uglify({
            preserveComments: 'some'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/'))
        .on('error', util.log);
};
