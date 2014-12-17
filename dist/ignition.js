/*!
 * IgnitionJS v2.0.3 <https://github.com/carsdotcom>
 * @license Apache 2.0
 * @copyright 2014 Cars.com <http://www.cars.com/>
 * @author Mac Heller-Ogden
 * @summary A fast and flexible, module loader/bootstrapper for AngularJS.
 * @requires LABjs 2.0.3 <http://labjs.com/>.
 */
(function () {

    var isString,
        isFunction,
        isObject;

    function IgnitionError(message) {
        this.name = 'IgnitionError';
        this.message = (typeof message === 'string') ? message : '';
    }
    IgnitionError.prototype = Error.prototype;

    function generateTypeValidation(type) {
        return function (subject) {
            var subjectType = typeof subject;
            if (subjectType !== type) {
                throw new IgnitionError('Expected `' + type + '`, instead recieved `' + subjectType + '`.' );
            } else {
                return true;
            }
        };
    };

    isString = generateTypeValidation('string');
    isFunction = generateTypeValidation('function');
    isObject = generateTypeValidation('object');

    function isRegistered(collection, item) {
        var i,
            spaces = / +?/g;
        if (typeof item === 'string') {
            return collection.indexOf(item) >= 0;
        } else if (typeof item === 'function') {
            item = item.toString().replace(spaces, '');
            for (i = 0; i < collection.length; i++) {
                if (typeof collection[i] === 'function') {
                    if (collection[i].toString().replace(spaces, '') === item) return true;
                }
            }
        }
        return false;
    }

    function generateRegistration(registry, validation) {
        return function (subject) {
            if (!validation(subject)) {
                throw new IgnitionError('Invalid subject');
            }
            if (!isRegistered(registry, subject)) {
                registry.push(subject);
            }
        };
    }

    function registerMulti(registration, subjects) {
        var i;
        if (!(isObject(subjects) && subjects.hasOwnProperty('length'))) {
            throw new IgnitionError('Expected `array`, instead recieved `' + typeof subjects + '`.' );
        } else {
            for (i = 0; i < subjects.length; i++) {
                registration(subjects[i]);
            }
        }
    }

    function execFunctionQueue(queue) {
        var i;
        for (i = 0; i < queue.length; i++) {
            queue[i].call(window);
        }
    };

    function Ignition(options) {
        var dependencies = [],
            plugins = [],
            modules = [],
            dependencyBootstraps = [],
            pluginBootstraps = [],
            postLoadBootstraps = [];

        options = (typeof options === 'object') ? options : {};

        this.dependencyValidation = options.dependencyValidation || isString;
        this.pluginValidation = options.pluginValidation || isString;
        this.moduleValidation = options.moduleValidation || function (subject) { return ((typeof subject === 'string') && /^[A-Za-z]+\w*$/.test(subject)); };

        this.moduleDir = options.moduleDir || '/app/js/modules/';
        this.moduleBootstrap = options.moduleBootstrap || function (modules) { angular.bootstrap(document, modules); };

        this.getDependencies = function () { return Array.prototype.slice.call(dependencies, 0); };
        this.getPlugins = function () { return Array.prototype.slice.call(plugins, 0); };
        this.getModules = function () { return Array.prototype.slice.call(modules, 0); };

        this.getDependencyBootstraps = function () { return dependencyBootstraps; };
        this.getPluginBootstraps = function () { return pluginBootstraps; };
        this.getPostLoadBootstraps = function () { return postLoadBootstraps; };

        this.registerDependency = generateRegistration(dependencies, this.dependencyValidation);
        this.registerPlugin = generateRegistration(plugins, this.pluginValidation);
        this.registerModule = generateRegistration(modules, this.moduleValidation);

        this.registerDependencyBootstrap = generateRegistration(dependencyBootstraps, isFunction);
        this.registerPluginBootstrap = generateRegistration(pluginBootstraps, isFunction);
        this.registerPostLoadBootstrap = generateRegistration(postLoadBootstraps, isFunction);
    }

    Ignition.fn = Ignition.prototype;

    Ignition.fn.getModulePath = function (name, baseDir) {
        if (baseDir.substr(-1) !== '/') {
            baseDir += '/';
        }
        return baseDir + name + '/' + name + '.js';
    };

    Ignition.fn.getModuleSources = function () {
        var i,
            modules = this.getModules(),
            moduleSources = [];
        for (i = 0; i < modules.length; i++) {
            moduleSources.push(this.getModulePath(modules[i], this.moduleDir));
        }
        return moduleSources;
    };

    Ignition.fn.registerModules = function (modules) {
        registerMulti(this.registerModule, modules);
    };

    Ignition.fn.registerDependencies = function (dependency) {
        registerMulti(this.registerDependency, dependency);
    };

    Ignition.fn.registerPlugins = function (plugin) {
        registerMulti(this.registerPlugin, plugin);
    };

    Ignition.fn.registerDependencyBootstraps = function (bootstrap) {
        registerMulti(this.registerDependencyBootstrap, bootstrap);
    };

    Ignition.fn.registerPluginBootstraps = function (bootstrap) {
        registerMulti(this.registerPluginBootstrap, bootstrap);
    };

    Ignition.fn.registerPostLoadBootstraps = function (bootstrap) {
        registerMulti(this.registerPostLoadBootstrap, bootstrap);
    };

    Ignition.fn.load = function () {
        var ignition = this;
        if (!$LAB) throw new IgnitionError('$LAB not found.');
        $LAB.script(this.getDependencies).wait(function () {
                execFunctionQueue(ignition.getDependencyBootstraps());
            })
            .script(this.getPlugins).wait(function () {
                execFunctionQueue(ignition.getPluginBootstraps());
            })
            .script(this.getModuleSources()).wait(function () {
                ignition.moduleBootstrap(ignition.getModules());
                execFunctionQueue(ignition.getPostLoadBootstraps());
            });
    };

    window.Ignition = Ignition;

}());
