/*!
 * IgnitionJS v1.1.1 <https://github.com/carsdotcom>
 * @license Apache 2.0
 * @copyright 2014 Cars.com <http://www.cars.com/>
 * @author Mac Heller-Ogden
 * @summary A fast and flexible, module loader/bootstrapper for AngularJS.
 * @requires LABjs 2.0.3 <http://labjs.com/>.
 */
(function () {

    function register(registry, predicate, subject) {
        if (typeof registry !== 'object' || !registry.hasOwnProperty('length')) {
            throw new Error('Ignition Error: Argument `registry` must be an array.');
        }
        if (typeof predicate !== 'function') {
            throw new Error('Ignition Error: Argument `predicate` must be a function.');
        }
        if (!predicate(subject)) {
            throw new Error('Ignition Error: Invalid subject');
        }
        registry.push(subject);
    }

    function registerMultiple(registration, subjects) {
        var i;
        if (typeof registration !== 'function') {
            throw new Error('Ignition Error: Argument `registration` must be a function');
        }
        if (typeof subjects !== 'object' || !subjects.hasOwnProperty('length')) {
            throw new Error('Ignition Error: Argument `subjects` must be an array');
        }
        for (i = 0; i < subjects.length; i++) {
            registration(subjects[i]);
        }
    }

    function Ignition(options) {
        var modules = [],
            dependencies = [],
            ignition = this;

        options = (typeof options === 'object') ? options : {};

        this.modulesDir = options.modulesDir || '/app/js/modules/';

        this.moduleValidation = options.moduleValidation || function (subject) { return ((typeof subject === 'string') && /^[A-Za-z]+\w*$/.test(subject)); };

        this.dependencyValidation = options.dependencyValidation || function (subject) { return (typeof subject === 'string'); };

        this.bootstrap = options.bootstrap || function (modules) {
            angular.bootstrap(document, Array.prototype.slice.call(modules, 0));
        };

        this.getModules = function () {
            return modules;
        };

        this.getDependencies = function () {
            return dependencies;
        };

        this.registerModule = function (module) {
            if (modules.indexOf(module) < 0) {
                register(modules, ignition.moduleValidation, module);
            }
        };

        this.registerDependency = function (dependency) {
            if (dependencies.indexOf(dependency) < 0) {
                register(dependencies, ignition.dependencyValidation, dependency);
            }
        };

    }

    Ignition.fn = Ignition.prototype;

    Ignition.fn.registerModules = function (modules) {
        registerMultiple(this.registerModule, modules);
    };

    Ignition.fn.registerDependencies = function (dependency) {
        registerMultiple(this.registerDependency, dependency);
    };

    Ignition.fn.buildModulePath = function (name, baseDir) {
        if (baseDir.substr(-1) !== '/') {
            baseDir += '/';
        }
        return baseDir + name + '/' + name + '.js';
    };

    Ignition.fn.load = function () {
        var ignition = this,
            dependencyQueue = this.getDependencies(),
            moduleQueue = [],
            modules = this.getModules(),
            i;

        for (i = 0; i < modules.length; i++) {
            moduleQueue.push(this.buildModulePath(modules[i], this.modulesDir));
        }

        $LAB.script(dependencyQueue).wait()
            .script(moduleQueue).wait(function () {
                ignition.bootstrap(modules);
            });
    };

    window.Ignition = Ignition;

}());
