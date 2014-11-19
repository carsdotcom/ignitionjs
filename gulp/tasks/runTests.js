/**
 * run-tests
 * Runs unit tests
 *
 * Note: `build` task needs to be run first
 *
 */
var path,
    gulp,
    util,
    argv,
    karma;

path = require('path');
gulp = require('gulp');
util = require('gulp-util');
argv = require('minimist')(process.argv.slice(2));
karma = require('gulp-karma');

module.exports = function () {
    var options;

    options = {
        configFile: 'test/karma.conf.js',
        action: 'run',
        reporters: [ 'dots' ]
    };

    if (argv.browsers) {
        options.browsers = argv.browsers.split(',');
    }

    if (argv.watch) {
        options.action = 'watch';
    }

    if (argv.coverage) {
        options.reporters.push('coverage');
    }

    // source doesn't matter, all files are referenced in karma config
    return gulp.src('thisFileDoesNotExist.js', { read: false })
        .pipe(karma(options))
        .on('error', util.log);
};
