/*!
 * IgnitionJS v1.0.0 <https://github.com/carsdotcom>
 * @license Apache 2.0
 * @copyright 2014 Cars.com <http://www.cars.com/>
 * @author Mac Heller-Ogden
 * @summary A fast and flexible, module loader/bootstrapper for AngularJS.
 * @requires LABjs 2.0.3 <http://labjs.com/>.
 */
(function () {

    function Ignition(options) {
        var modules = [],
            dependencies = [];

        options = (typeof options === 'object') ? options : {};

        this.modulesDir = options.modulesDir || '/app/js/modules/';
        this.moduleNameValidation = options.moduleNameValidation || /^[A-Za-z]+\w*$/;
        this.bootstrap = options.bootstrap || function (modules) {
            angular.bootstrap(document, modules);
        };

        this.getModules = function () {
            return modules;
        };

        this.getDependencies = function () {
            return dependencies;
        };

        this.registerModule = function (module) {
            if ((typeof module === 'string') && this.moduleNameValidation.test(module)) {
                if (modules.indexOf(module) === -1) {
                    modules.push(module);
                }
            } else {
                throw new Error('Ignition Error: Invalid module name');
            }
        };

        this.registerDependency = function (script) {
            if (typeof script === 'string') {
                if (dependencies.indexOf(script) === -1) {
                    dependencies.push(script);
                }
            } else {
                throw new Error('Ignition Error: Invalid dependency');
            }
        };

    }

    Ignition.fn = Ignition.prototype;

    Ignition.fn.registerModules = function (modules) {
        var i;
        if (typeof modules === 'object' && typeof modules.length === 'number') {
            for (i = 0; i < modules.length; i++) {
                this.registerModule(modules[i]);
            }
        } else {
            throw new Error('Ignition Error: Argument must be an array');
        }
    };

    Ignition.fn.registerDependencies = function (scripts) {
        var i;
        if (typeof scripts === 'object' && typeof scripts.length === 'number') {
            for (i = 0; i < scripts.length; i++) {
                this.registerDependency(scripts[i]);
            }
        } else {
            throw new Error('Ignition Error: Argument must be an array');
        }
    };

    Ignition.fn.buildModulePath = function (name, baseDir) {
        if (baseDir.substr(-1) != '/') {
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
