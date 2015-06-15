/**
 * package
 * Bundles JS as part of build task
 *
 */
var gulp,
    util,
    rename,
    uglify,
    babel;

gulp = require('gulp');
util = require('gulp-util');
rename = require('gulp-rename');
uglify = require('gulp-uglify');
babel = require('gulp-babel');

module.exports = function () {
    return gulp.src('src/ignition.js')
        .pipe(babel())
        .pipe(gulp.dest('dist/'))
        .pipe(rename('ignition.min.js'))
        .pipe(uglify({
            preserveComments: 'some'
        }))
        .pipe(gulp.dest('dist/'))
        .on('error', util.log);
};
