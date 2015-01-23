/*!
 * IgnitionJS v3.1.0 <https://github.com/carsdotcom>
 * @license Apache 2.0
 * @copyright 2014 Cars.com <http://www.cars.com/>
 * @author Mac Heller-Ogden
 * @summary A fast and flexible, module loader/bootstrapper for AngularJS.
 * @requires LABjs 2.0.3 <http://labjs.com/>.
 */
(function () {
    var isString,
        isNumber,
        isFunction,
        isObject,
        isArray,
        isUndefined;

    function IgnitionError(message) {
        this.name = 'IgnitionError';
        this.message = message;
    }
    IgnitionError.prototype = Error.prototype;

    function generateTypeValidation(type) {
        return function (subject, throwError) {
            var subjectType = typeof subject,
                isNull = false,
                isArray = false,
                isValid = true;
            if (subjectType === 'object' && !(isNull = subject === null)) {
                isArray = Object.prototype.toString.call(subject) === '[object Array]';
            }
            if (type === 'number') {
                isValid = (!isNaN(subject) && subjectType === type);
            } else if (type === 'array') {
                isValid = isArray;
            } else if (type === 'object' && (isArray || isNull)) {
                isValid = false;
            } else if (subjectType !== type) {
                isValid = false;
            }
            if (!isValid && throwError) throw new IgnitionError('Expected `' + type + '` and instead received `' + subjectType + '`');
            return isValid;
        };
    };

    isString = generateTypeValidation('string');
    isNumber = generateTypeValidation('number');
    isFunction = generateTypeValidation('function');
    isObject = generateTypeValidation('object');
    isArray = generateTypeValidation('array');
    isUndefined = generateTypeValidation('undefined');

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
                if (typeof collection[i] === 'function' && collection[i].toString().replace(spaces, '') === item) {
                    return true;
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
    }

    function buildModulePath(name, baseDir) {
        if (baseDir.substr(-1) !== '/') {
            baseDir += '/';
        }
        return baseDir + name + '/' + name + '.js';
    }

    function Ignition(options) {
        var ig = this,
            t,
            tiers = 3,
            tierKey,
            a,
            aliases,
            defaults = {
                modules: {
                    validation: function (subject) { return ((typeof subject === 'string') && /^[A-Za-z]+\w*$/.test(subject)); },
                    dir: '/app/js/modules/',
                    bootstrap: function (modules) { angular.bootstrap(document, modules); }
                }
            };

        options = (function extend(target) {
            var i, from, j;
            for (i = 1; i < arguments.length; ++i) {
                from = arguments[i];
                if (typeof from !== 'object') continue;
                for (j in from) {
                    if (from.hasOwnProperty(j)) {
                        target[j] = isObject(from[j]) ? extend({}, target[j], from[j]) : from[j];
                    }
                }
            }
            return target;
        }({}, defaults, options));

        ig.tiers = options.tiers || tiers;
        isNumber(ig.tiers, true);

        function getSrcs() {
            return Array.prototype.slice.call(this.srcs, 0);
        };

        function getFns() {
            return Array.prototype.slice.call(this.fns, 0);
        };

        function registerSrcs(srcs) {
            ig._registerMulti(this.registerSrc, srcs);
        };

        function registerFns(fns) {
            ig._registerMulti(this.registerFn, fns);
        };

        for (t = 1; t <= tiers; t++) {
            tierKey = 'tier' + t;
            ig[tierKey] = {};
            aliases = (options[tierKey] && isArray(options[tierKey].aliases)) ? options[tierKey].aliases : [];
            for (a = 0; a < aliases.length; a++) {
                if (isUndefined(ig[aliases[a]])) {
                    ig[aliases[a]] = ig[tierKey];
                    ig[tierKey].aliases = aliases = (options[tierKey] && isArray(options[tierKey].aliases)) ? options[tierKey].aliases : [];
                }
            }
            ig[tierKey].validation = (options[tierKey] && isFunction(options[tierKey].validation)) ? options[tierKey].validation : isString;
            ig[tierKey].fns = [];
            ig[tierKey].srcs = [];
            ig[tierKey].getSrcs = getSrcs;
            ig[tierKey].getFns = getFns;
            ig[tierKey].registerSrc = generateRegistration(ig[tierKey].srcs, ig[tierKey].validation);
            ig[tierKey].registerFn = generateRegistration(ig[tierKey].fns, isFunction);
            ig[tierKey].registerSrcs = registerSrcs;
            ig[tierKey].registerFns = registerFns;
        }

        ig.ready = {
            fns: []
        };
        ig.ready.getFns = getFns;
        ig.ready.registerFn = generateRegistration(ig.ready.fns, isFunction);
        ig.ready.registerFns = function (fns) {
            ig._registerMulti(this.registerFn, fns);
        };

        ig.modules = {
            names: [],
            validation: options.modules.validation,
            dir: options.modules.dir,
            bootstrap: options.modules.bootstrap
        };
        isFunction(ig.modules.validation, true);
        isString(ig.modules.dir, true);
        isFunction(ig.modules.bootstrap, true);

        ig.modules.registerOne = generateRegistration(ig.modules.names, ig.modules.validation);
        ig.modules.registerMany = function (modules) {
            ig._registerMulti(this.registerOne, modules);
        };
        ig.modules.register = function (subject) {
            if (isString(subject)) {
                ig.modules.registerOne(subject);
            } else if (isArray(subject)) {
                ig.modules.registerMany(subject);
            } else {
                throw new IgnitionError('Expected `array` or `string` and instead received `' + typeof subject + '`');
            }
        };

        ig.modules.getNames = function () { return Array.prototype.slice.call(this.names, 0); };
        ig.modules.getSrcs = function () {
            var i,
                modules = this.getNames(),
                moduleSrcs = [];
            for (i = 0; i < modules.length; i++) {
                moduleSrcs.push(ig._buildModulePath(modules[i], this.dir));
            }
            return moduleSrcs;
        };
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
    Ignition.fn._buildModulePath = buildModulePath;

    Ignition.fn._loadTier = function (key, chain) {
        var ig = this;
        return chain.script(ig[key].getSrcs()).wait(function () {
            ig._execFunctionQueue(ig[key].getFns());
        });
    };

    Ignition.fn.load = function () {
        var ig = this,
            t,
            chain = $LAB;
        if (!$LAB) throw new IgnitionError('$LAB not found.');
        for (t = 1; t <= ig.tiers; t++) {
            chain = ig._loadTier('tier' + t, chain);
        }
        chain.script(ig.modules.getSrcs()).wait(function () {
            ig.modules.bootstrap(ig.modules.getNames());
            ig._execFunctionQueue(ig.ready.getFns());
        });
    };

    window.Ignition = Ignition;

}());
