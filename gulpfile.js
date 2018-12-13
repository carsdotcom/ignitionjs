const gulp = require('./gulp')([ 'clean', 'lint', 'package', 'run-tests' ]);

/**
 * build
 * Runs all build tasks
 *
 */
gulp.task('build', gulp.series('clean', 'package', 'lint'));

/**
 * run-watch
 * Rebuild as files change
 */
gulp.task('run-watch', function () {
    gulp.watch('src/**.js', gulp.series('package'));
});

/**
 * watch
 * Rebuild as files change
 */
gulp.task('watch', gulp.series('clean', 'package', 'run-watch'));

/**
 * default
 * Sets build as default gulp task so that you can simple type `gulp` to run the build
 *
 */
gulp.task('default', gulp.series('build'));

/**
 * test
 * Runs build followed by test runner
 *
 */
gulp.task('test', gulp.series('build', 'run-tests'));
