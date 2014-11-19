/**
 * clean
 * Remove dist directory created by build
 *
 */
var gulp,
    clean;

gulp = require('gulp');
clean = require('gulp-rimraf');

module.exports = function () {
    return gulp.src('dist/', { read: false })
        .pipe(clean());
};
