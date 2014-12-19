/*!
 * IgnitionJS v2.0.7 <https://github.com/carsdotcom>
 * @license Apache 2.0
 * @copyright 2014 Cars.com <http://www.cars.com/>
 * @author Mac Heller-Ogden
 * @summary A fast and flexible, module loader/bootstrapper for AngularJS.
 * @requires LABjs 2.0.3 <http://labjs.com/>.
 */
(function () {

    var isString,
        isFunction,
        isObject,
        isArray;

    function IgnitionError(message) {
        this.name = 'IgnitionError';
        this.message = message;
    }
    IgnitionError.prototype = Error.prototype;

    function generateTypeValidation(type) {
        return function (subject, throwError) {
            var subjectType = typeof subject,
                isArray = (subjectType === 'object') ? Object.prototype.toString.call(subject) === '[object Array]' : false,
                isValid = true;
            if (type === 'array') {
                if (!isArray) isValid = false;
            } else if (type === 'object' && isArray) {
                isValid = false;
            } else if (subjectType !== type) {
                isValid = false;
            }
            if (!isValid && throwError) throw new IgnitionError('Expected `' + type + '` and instead received `' + subjectType + '`');
            return isValid;
        };
    };

    isString = generateTypeValidation('string');
    isFunction = generateTypeValidation('function');
    isObject = generateTypeValidation('object');
    isArray = generateTypeValidation('array');

    function isRegistered(collection, item) {
        var i,
            spaces;
        isArray(collection, true);
        if (isString(item)) {
            return collection.indexOf(item) >= 0;
        } else if (isFunction(item)) {
            spaces = / +?/g;
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
            if (!validation(subject)) throw new IgnitionError('Invalid subject');
            if (!isRegistered(registry, subject)) registry.push(subject);
        };
    }

    function registerMulti(registration, subjects) {
        var i;
        isArray(subjects, true);
        for (i = 0; i < subjects.length; i++) {
            registration(subjects[i]);
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

        options = isObject(options) ? options : {};

        this.dependencyValidation = options.dependencyValidation || isString;
        isFunction(this.dependencyValidation, true);

        this.pluginValidation = options.pluginValidation || isString;
        isFunction(this.pluginValidation, true);

        this.moduleValidation = options.moduleValidation || function (subject) { return ((typeof subject === 'string') && /^[A-Za-z]+\w*$/.test(subject)); };
        isFunction(this.moduleValidation, true);

        this.moduleDir = options.moduleDir || '/app/js/modules/';
        isString(this.moduleDir, true);

        this.moduleBootstrap = options.moduleBootstrap || function (modules) { angular.bootstrap(document, modules); };
        isFunction(this.moduleBootstrap, true);

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

    Ignition.fn._isString = isString;
    Ignition.fn._isFunction = isFunction;
    Ignition.fn._isObject = isObject;
    Ignition.fn._isArray = isArray;
    Ignition.fn._isRegistered = isRegistered;
    Ignition.fn._generateRegistration = generateRegistration;
    Ignition.fn._registerMulti = registerMulti;
    Ignition.fn._execFunctionQueue = execFunctionQueue;

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
        this._registerMulti(this.registerModule, modules);
    };

    Ignition.fn.registerDependencies = function (dependency) {
        this._registerMulti(this.registerDependency, dependency);
    };

    Ignition.fn.registerPlugins = function (plugin) {
        this._registerMulti(this.registerPlugin, plugin);
    };

    Ignition.fn.registerDependencyBootstraps = function (bootstrap) {
        this._registerMulti(this.registerDependencyBootstrap, bootstrap);
    };

    Ignition.fn.registerPluginBootstraps = function (bootstrap) {
        this._registerMulti(this.registerPluginBootstrap, bootstrap);
    };

    Ignition.fn.registerPostLoadBootstraps = function (bootstrap) {
        this._registerMulti(this.registerPostLoadBootstrap, bootstrap);
    };

    Ignition.fn.load = function () {
        var ignition = this;
        if (!$LAB) throw new IgnitionError('$LAB not found.');
        $LAB.script(this.getDependencies).wait(function () {
                ignition._execFunctionQueue(ignition.getDependencyBootstraps());
            })
            .script(this.getPlugins).wait(function () {
                ignition._execFunctionQueue(ignition.getPluginBootstraps());
            })
            .script(this.getModuleSources()).wait(function () {
                ignition.moduleBootstrap(ignition.getModules());
                ignition._execFunctionQueue(ignition.getPostLoadBootstraps());
            });
    };

    window.Ignition = Ignition;

}());
