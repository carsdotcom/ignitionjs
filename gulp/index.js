var path,
    gulp,
    changeCase;

path = require('path');
gulp = require('gulp');
changeCase = require('change-case');

module.exports = function (tasks) {
    tasks.forEach(function (name) {
        gulp.task(name, require(path.join(__dirname, '/tasks/', changeCase.camelCase(name))));
    });
    return gulp;
};
