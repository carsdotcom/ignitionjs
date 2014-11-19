var sequence,
    argv,
    gulp,
    buildTask;

sequence = require('run-sequence');
argv = require('minimist')(process.argv.slice(2));

gulp = require('./gulp')([
    'clean',
    'lint',
    'package',
    'run-tests'
]);

/**
 * build
 * Runs all build tasks
 *
 */
buildTask = (argv.watch) ? [ 'watch' ] : function (cb) {
    sequence('clean', 'package', 'lint', cb);
};
gulp.task('build', buildTask);

/**
 * watch
 * Rebuild as files change
 */
gulp.task('watch', function () {
    sequence('clean', 'package', 'run-watch');
});

/**
 * run-watch
 * Rebuild as files change
 */
gulp.task('run-watch', function () {
    gulp.watch('src/**.js', [ 'package' ]);
});

/**
 * default
 * Sets build as default gulp task so that you can simple type `gulp` to run the build
 *
 */
gulp.task('default', [ 'build' ]);

/**
 * test
 * Runs build followed by test runner
 *
 */
gulp.task('test', function (cb) {
    sequence('build', 'run-tests', cb);
});
