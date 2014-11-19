/**
 * lint
 * lints js files
 *
 */
var gulp,
    util,
    eslint;

gulp = require('gulp');
util = require('gulp-util');
eslint = require('gulp-eslint');

module.exports = function () {
    return gulp.src('src/**/*.js')
        .pipe(eslint({
            rulesdir: './'
        }))
        .pipe(eslint.formatEach('compact', process.stderr))
        .on('error', util.log);
};
