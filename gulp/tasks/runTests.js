/**
 * run-tests
 * Runs unit tests
 *
 * Note: `build` task needs to be run first
 *
 */
const path = require('path'),
      argv = require('minimist')(process.argv.slice(2)),
      karma = require('karma');

module.exports = function (done) {
    const options = {
        configFile: path.resolve(__dirname, '../../test/karma.conf.js'),
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

    new karma.Server(options, done).start();
};
