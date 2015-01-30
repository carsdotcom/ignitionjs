/*!
 * IgnitionJS v3.3.0 <https://github.com/carsdotcom>
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
        isArray,
        isUndefined,
        isBoolean;

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
            if (type === 'array') {
                isValid = isArray;
            } else if (type === 'object' && (isArray || isNull)) {
                isValid = false;
            } else if (subjectType !== type) {
                isValid = false;
            }
            if (!isValid && throwError) throw new IgnitionError('Expected `' + type + '` and instead received `' + subjectType + '`');
            return isValid;
        };
    }

    isString = generateTypeValidation('string');
    isFunction = generateTypeValidation('function');
    isObject = generateTypeValidation('object');
    isArray = generateTypeValidation('array');
    isUndefined = generateTypeValidation('undefined');
    isBoolean = generateTypeValidation('boolean');

    function isRegistered(collection, item, superset) {
        var i,
            spaces;
        superset = isArray(superset) ? superset : [];
        isArray(collection, true);
        collection = collection.concat(superset);
        if (isString(item)) {
            return collection.indexOf(item) >= 0;
        } else if (isFunction(item)) {
            spaces = / +?/g;
            item = item.toString().replace(spaces, '');
            for (i = 0; i < collection.length; i++) {
                if (isFunction(collection[i]) && collection[i].toString().replace(spaces, '') === item) {
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

    function buildModulePath(name, baseDir, ext) {
        if (baseDir.substr(-1) !== '/') {
            baseDir += '/';
        }
        return baseDir + name + '/' + name + '.' + ext;
    }

    function Ignition(options) {
        var ig = this,
            t,
            a,
            hasAliases,
            aliases,
            defaults = {
                modules: {
                    validation: function (subject) { return (isString(subject) && /^[A-Za-z]+\w*$/.test(subject)); },
                    dir: '/app/js/modules/',
                    loadCss: true,
                    cssDir: '/app/css/modules/',
                    bootstrap: function (modules) { angular.bootstrap(document, modules); }
                }
            };

        options = (function extend(target) {
            var i, from, j;
            for (i = 1; i < arguments.length; ++i) {
                from = arguments[i];
                if (!isObject(from)) continue;
                for (j in from) {
                    if (from.hasOwnProperty(j)) {
                        target[j] = isObject(from[j]) ? extend({}, target[j], from[j]) : from[j];
                    }
                }
            }
            return target;
        }({}, defaults, options));


        function generateArrayPropCloner(propName) {
            return function () {
                return Array.prototype.slice.call(this[propName], 0);
            };
        }

        function registerSrcs(srcs) {
            ig._registerMulti(this.registerSrc, srcs);
        }

        function registerFns(fns) {
            ig._registerMulti(this.registerFn, fns);
        }

        function registerByName(subject) {
            var i;
            if (isString(subject)) {
                this.registerSrc(ig.namedSrcs[subject]);
            } else if (isArray(subject)) {
                for (i = 0; i < subject.length; i++) {
                    this.registerSrc(ig.namedSrcs[subject[i]]);
                }
            } else {
                throw new IgnitionError('Invalid subject');
            }
        }

        function getAllSrcs() {
            var result = [],
                t;
            for (t = 0; t < ig.tierCount; t++) {
                result = result.concat(ig.tiers[t].srcs);
            }
            return result;
        }

        function generateTierRegistration(t) {
            return function (subject) {
                if (!ig.tiers[t].validation(subject)) throw new IgnitionError('Invalid subject');
                if (!isRegistered(ig.tiers[t].srcs, subject, getAllSrcs())) ig.tiers[t].srcs.push(subject);
            };
        }

        ig.namedSrcs = isObject(options.sources) ? options.sources : {};
        isObject(ig.namedSrcs, true);

        ig.modules = {};
        ig.modules.names = [];
        ig.modules.getNames = generateArrayPropCloner('names');

        ig.modules.validation = options.modules.validation;
        isFunction(ig.modules.validation, true);

        ig.modules.dir = options.modules.dir;
        isString(ig.modules.dir, true);

        ig.modules.loadCss = options.modules.loadCss;
        isBoolean(ig.modules.loadCss, true);

        ig.modules.cssDir = options.modules.cssDir;
        isString(ig.modules.cssDir, true);

        ig.modules.bootstrap = options.modules.bootstrap;
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

        ig.modules.getSrcs = function (type) {
            var i,
                modules = this.getNames(),
                moduleSrcs = [],
                isCss = (type === 'css') ? true : false,
                dir = (isCss) ? this.cssDir : this.dir,
                ext = (isCss) ? 'css' : 'js';
            for (i = 0; i < modules.length; i++) {
                moduleSrcs.push(ig._buildModulePath(modules[i], dir, ext));
            }
            return moduleSrcs;
        };

        ig.tiers = [];
        if (isArray(options.tiers)) {
            ig.tierCount = options.tiers.length;
            options.tiers = options.tiers;
        } else {
            ig.tierCount = 2;
            options.tiers = [];
        }
        for (t = 0; t < ig.tierCount; t++) {
            ig.tiers[t] = {};
            hasAliases = (options.tiers[t] && isArray(options.tiers[t].aliases));
            ig.tiers[t].aliases = aliases = hasAliases ? options.tiers[t].aliases : [];
            for (a = 0; a < aliases.length; a++) {
                if (isUndefined(ig[aliases[a]])) {
                    ig[aliases[a]] = ig.tiers[t];
                } else {
                    throw new IgnitionError('Illegal alias name');
                }
            }
            ig.tiers[t].validation = (options.tiers[t] && isFunction(options.tiers[t].validation)) ? options.tiers[t].validation : isString;
            ig.tiers[t].fns = [];
            ig.tiers[t].srcs = [];
            ig.tiers[t].getSrcs = generateArrayPropCloner('srcs');
            ig.tiers[t].getFns = generateArrayPropCloner('fns');
            ig.tiers[t].registerSrc = generateTierRegistration(t);
            ig.tiers[t].registerFn = generateRegistration(ig.tiers[t].fns, isFunction);
            ig.tiers[t].registerSrcs = registerSrcs;
            ig.tiers[t].registerFns = registerFns;
            ig.tiers[t].register = registerByName;
        }

        ig.ready = {
            fns: []
        };
        ig.ready.getFns = generateArrayPropCloner('fns');
        ig.ready.registerFn = generateRegistration(ig.ready.fns, isFunction);
        ig.ready.registerFns = function (fns) {
            ig._registerMulti(this.registerFn, fns);
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

    Ignition.fn._loadTier = function (t, chain) {
        var ig = this;
        return chain.script(ig.tiers[t].getSrcs()).wait(function () {
            ig._execFunctionQueue(ig.tiers[t].getFns());
        });
    };

    Ignition.fn._injectCss = function (src, element) {
        var link;
        element = isUndefined(element) ? document.getElementsByTagName('head')[0] : element;
        link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        link.setAttribute('href', src);
        element.appendChild(link);
    };

    Ignition.fn.load = function () {
        var ig = this,
            t,
            c,
            cssSrcs,
            chain;
        if (!$LAB) throw new IgnitionError('$LAB not found.');
        chain = $LAB;
        for (t = 0; t < ig.tierCount; t++) chain = ig._loadTier(t, chain);
        if (ig.modules.loadCss) for (c = 0, cssSrcs = ig.modules.getSrcs('css'); c < cssSrcs.length; c++) ig._injectCss(cssSrcs[c]);
        chain.script(ig.modules.getSrcs()).wait(function () {
            ig.modules.bootstrap(ig.modules.getNames());
            ig._execFunctionQueue(ig.ready.getFns());
        });
    };

    window.Ignition = Ignition;

}());
