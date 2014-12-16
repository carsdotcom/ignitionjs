/*!
 * IgnitionJS v2.0.2 <https://github.com/carsdotcom>
 * @license Apache 2.0
 * @copyright 2014 Cars.com <http://www.cars.com/>
 * @author Mac Heller-Ogden
 * @summary A fast and flexible, module loader/bootstrapper for AngularJS.
 * @requires LABjs 2.0.3 <http://labjs.com/>.
 */
(function () {

    function IgnitionError(message) {
        this.name = 'IgnitionError';
        this.message = (typeof message === 'string') ? message : '';
    }
    IgnitionError.prototype = Error.prototype;


    function isRegistered(collection, item) {
        var i;
        if (typeof item === 'string') {
            return collection.indexOf(item) >= 0;
        } else if (typeof item === 'function') {
            item = item.toString();
            for (i = 0; i < collection.length; i++) {
                if (typeof collection[i] === 'function') {
                    if (collection[i].toString() === item) return true;
                }
            }
        }
        return false;
    }

    function generateRegistration(registry, predicate) {
        return function (subject) {
            if (typeof registry !== 'object' || !registry.hasOwnProperty('length')) {
                throw new IgnitionError('Argument `registry` must be an array.');
            }
            if (typeof predicate !== 'function') {
                throw new IgnitionError('Argument `predicate` must be a function.');
            }
            if (!predicate(subject)) {
                throw new IgnitionError('Invalid subject');
            }
            if (!isRegistered(registry, subject)) {
                registry.push(subject);
            }
        };
    }

    function registerMulti(registration, subjects) {
        var i;
        if (typeof registration !== 'function') {
            throw new IgnitionError('Argument `registration` must be a function');
        }
        if (typeof subjects !== 'object' || !subjects.hasOwnProperty('length')) {
            throw new IgnitionError('Argument `subjects` must be an array');
        }
        for (i = 0; i < subjects.length; i++) {
            registration(subjects[i]);
        }
    }

    function execFunctionQueue(queue, context) {
        var i;
        context = (typeof context === 'object') ? context : window;
        for (i = 0; i < queue.length; i++) {
            queue[i].call(context);
        }
    };

    function Ignition(options) {
        var dependencies = [],
            plugins = [],
            modules = [],
            dependencyBootstraps = [],
            pluginBootstraps = [];

        options = (typeof options === 'object') ? options : {};

        this.dependencyValidation = this.pluginValidation = options.dependencyValidation || function (subject) { return (typeof subject === 'string'); };
        this.moduleValidation = options.moduleValidation || function (subject) { return ((typeof subject === 'string') && /^[A-Za-z]+\w*$/.test(subject)); };
        this.bootstrapValidation = function (subject) { return (typeof subject === 'function'); };

        this.moduleDir = options.moduleDir || '/app/js/modules/';
        this.moduleBootstrap = options.moduleBootstrap || function (modules) { angular.bootstrap(document, modules); };

        this.getDependencies = function () { return Array.prototype.slice.call(dependencies, 0); };
        this.getPlugins = function () { return Array.prototype.slice.call(plugins, 0); };
        this.getModules = function () { return Array.prototype.slice.call(modules, 0); };
        this.getDependencyBootstraps = function () { return dependencyBootstraps; };
        this.getPluginBootstraps = function () { return pluginBootstraps; };

        this.registerDependency = generateRegistration(dependencies, this.dependencyValidation);
        this.registerPlugin = generateRegistration(plugins, this.pluginValidation);
        this.registerModule = generateRegistration(modules, this.moduleValidation);
        this.getDependencyBootstraps = function () { return dependencyBootstraps; };
        this.getPluginBootstraps = function () { return pluginBootstraps; };

        this.registerDependency = generateRegistration(dependencies, this.dependencyValidation);
        this.registerPlugin = generateRegistration(plugins, this.pluginValidation);
        this.registerModule = generateRegistration(modules, this.moduleValidation);

        this.registerDependencyBootstrap = generateRegistration(dependencyBootstraps, this.bootstrapValidation);
        this.registerPluginBootstrap = generateRegistration(pluginBootstraps, this.bootstrapValidation);
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

    Ignition.fn.dependencyBootstrap = function () {
        execFunctionQueue(this.getDependencyBootstraps(), this);
    };

    Ignition.fn.pluginBootstrap = function () {
        execFunctionQueue(this.getPluginBootstraps(), this);
    };

    Ignition.fn.load = function () {
        var ignition = this;
        if (!$LAB) throw new IgnitionError('$LAB not found.');
        $LAB.script(this.getDependencies).wait(this.dependencyBootstrap)
            .script(this.getPlugins).wait(this.pluginBootstrap)
            .script(this.getModuleSources()).wait(function () {
                ignition.moduleBootstrap(ignition.getModules());
            });
    };

    window.Ignition = Ignition;

}());
