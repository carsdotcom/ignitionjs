/*!
 * IgnitionJS v4.1.1 <https://github.com/carsdotcom>
 * @license Apache 2.0
 * @copyright 2014 Cars.com <http://www.cars.com/>
 * @author Mac Heller-Ogden
 * @summary A fast and flexible, module loader/bootstrapper for AngularJS.
 * @requires LABjs 2.0.3 <http://labjs.com/>.
 */
'use strict';

{
    (function () {
        var IgnitionError = function IgnitionError(message) {
            this.name = 'IgnitionError';
            this.message = message;
        };

        var generateTypeValidation = function generateTypeValidation(type) {
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
        };

        var isRegistered = function isRegistered(collection, item, superset) {
            var spaces;
            superset = isArray(superset) ? superset : [];
            isArray(collection, true);
            collection = collection.concat(superset);
            if (isString(item)) {
                return collection.indexOf(item) >= 0;
            } else if (isFunction(item)) {
                spaces = / +?/g;
                item = item.toString().replace(spaces, '');
                for (var i = 0; i < collection.length; i++) {
                    if (isFunction(collection[i]) && collection[i].toString().replace(spaces, '') === item) {
                        return true;
                    }
                }
            }
            return false;
        };

        var generateRegistration = function generateRegistration(registry, validation) {
            return function (subject) {
                if (!validation(subject)) throw new IgnitionError('Invalid subject');
                if (!isRegistered(registry, subject)) registry.push(subject);
            };
        };

        var registerMulti = function registerMulti(registration, subjects) {
            isArray(subjects, true);
            for (var i = 0; i < subjects.length; i++) {
                registration(subjects[i]);
            }
        };

        var execFunctionQueue = function execFunctionQueue(queue) {
            for (var i = 0; i < queue.length; i++) {
                queue[i].call(window);
            }
        };

        var buildBundlePath = function buildBundlePath(name, baseDir, ext) {
            if (baseDir.substr(-1) !== '/') {
                baseDir += '/';
            }
            return baseDir + name + '.' + ext;
        };

        var Ignition = function Ignition(options) {
            var ig = this,
                hasAliases,
                aliases,
                defaults = {
                bundles: {
                    validation: function validation(subject) {
                        return isString(subject) && /^[A-Za-z]+\w*$/.test(subject);
                    },
                    dir: '/app/bundles/',
                    loadCss: false
                },
                bootstrap: function bootstrap(modules) {
                    angular.bootstrap(document, modules);
                }
            };

            options = (function extend(target) {
                var from;
                for (var i = 1; i < arguments.length; ++i) {
                    from = arguments[i];
                    if (!isObject(from)) continue;
                    for (var j in from) {
                        if (from.hasOwnProperty(j)) {
                            target[j] = isObject(from[j]) ? extend({}, target[j], from[j]) : from[j];
                        }
                    }
                }
                return target;
            })({}, defaults, options);

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
                if (isString(subject)) {
                    var _parseSubject = parseSubject(subject);

                    var parsedSubject = _parseSubject.parsedSubject;
                    var isOptional = _parseSubject.isOptional;

                    this.registerSrc(ig.namedSrcs[parsedSubject], isOptional);
                } else if (isArray(subject)) {
                    for (var i = 0; i < subject.length; i++) {
                        var _parseSubject2 = parseSubject(subject[i]);

                        var parsedSubject = _parseSubject2.parsedSubject;
                        var isOptional = _parseSubject2.isOptional;

                        this.registerSrc(ig.namedSrcs[parsedSubject], isOptional);
                    }
                } else {
                    throw new IgnitionError('Invalid subject');
                }
            }

            function parseSubject(subject) {
                var parsedSubject = subject.indexOf('?') === subject.length - 1 ? subject.slice(0, subject.length - 1) : subject;

                return {
                    parsedSubject: parsedSubject,
                    isOptional: subject !== parsedSubject
                };
            }

            function getAllSrcs() {
                var result = [];
                for (var t = 0; t < ig.tierCount; t++) {
                    result = result.concat(ig.tiers[t].srcs);
                }
                return result;
            }

            function generateTierRegistration(t) {
                return function (subject) {
                    var optional = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

                    if (!ig.tiers[t].validation(subject)) throw new IgnitionError('Invalid subject');
                    if (!isRegistered(ig.tiers[t].srcs, subject, getAllSrcs())) {
                        if (optional) {
                            ig.tiers[t].optionalSrcs.push(subject);
                        } else {
                            ig.tiers[t].srcs.push(subject);
                        }
                    }
                };
            }

            ig.namedSrcs = isObject(options.sources) ? options.sources : {};

            ig.bundles = {};
            ig.bundles.names = [];
            ig.bundles.getNames = generateArrayPropCloner('names');
            ig.bundles.modules = isObject(options.bundles.modules) ? options.bundles.modules : {};

            ig.bundleModules = {};
            ig.bundleModules.names = [];
            ig.bundleModules.getNames = generateArrayPropCloner('names');

            ig.bundles.validation = options.bundles.validation;
            isFunction(ig.bundles.validation, true);

            ig.bundles.dir = options.bundles.dir;
            isString(ig.bundles.dir, true);

            ig.bundles.loadCss = options.bundles.loadCss;
            isBoolean(ig.bundles.loadCss, true);

            ig.bundles.registerOne = generateRegistration(ig.bundles.names, ig.bundles.validation);

            ig.bundles.registerMany = function (bundles) {
                ig._registerMulti(this.registerOne, bundles);
            };

            ig.bundles.register = function (bundleName) {
                var bundleModules = arguments.length <= 1 || arguments[1] === undefined ? ig.bundles.modules[bundleName] || [bundleName] : arguments[1];
                return (function () {
                    isString(bundleName, true);
                    ig.bundles.registerOne(bundleName);
                    ig.bundleModules.registerMany(bundleModules);
                })();
            };

            ig.bundles.getSrcs = function (type) {
                var bundles = this.getNames(),
                    bundleSrcs = [],
                    isCss = type === 'css' ? true : false,
                    ext = isCss ? 'css' : 'js';
                for (var i = 0; i < bundles.length; i++) {
                    bundleSrcs.push(ig._buildBundlePath(bundles[i], this.dir, ext));
                }
                return bundleSrcs;
            };

            ig.bundleModules.registerOne = generateRegistration(ig.bundleModules.names, function () {
                return true;
            });

            ig.bundleModules.registerMany = function (bundleModules) {
                ig._registerMulti(this.registerOne, bundleModules);
            };

            ig.bootstrap = options.bootstrap;
            isFunction(ig.bootstrap, true);

            ig.tiers = [];
            if (isArray(options.tiers)) {
                ig.tierCount = options.tiers.length;
                options.tiers = options.tiers;
            } else {
                ig.tierCount = 2;
                options.tiers = [];
            }
            for (var t = 0; t < ig.tierCount; t++) {
                ig.tiers[t] = {};
                hasAliases = options.tiers[t] && isArray(options.tiers[t].aliases);
                ig.tiers[t].aliases = aliases = hasAliases ? options.tiers[t].aliases : [];
                for (var a = 0; a < aliases.length; a++) {
                    if (isUndefined(ig[aliases[a]])) {
                        ig[aliases[a]] = ig.tiers[t];
                    } else {
                        throw new IgnitionError('Illegal alias name');
                    }
                }

                ig.tiers[t].validation = options.tiers[t] && isFunction(options.tiers[t].validation) ? options.tiers[t].validation : isString;
                ig.tiers[t].fns = [];
                ig.tiers[t].srcs = [];
                ig.tiers[t].optionalSrcs = [];
                ig.tiers[t].getSrcs = generateArrayPropCloner('srcs');
                ig.tiers[t].getOptionalSrcs = generateArrayPropCloner('optionalSrcs');
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
        };

        var isString = undefined,
            isFunction = undefined,
            isObject = undefined,
            isArray = undefined,
            isUndefined = undefined,
            isBoolean = undefined;

        IgnitionError.prototype = Error.prototype;

        isString = generateTypeValidation('string');
        isFunction = generateTypeValidation('function');
        isObject = generateTypeValidation('object');
        isArray = generateTypeValidation('array');
        isUndefined = generateTypeValidation('undefined');
        isBoolean = generateTypeValidation('boolean');

        Ignition.fn = Ignition.prototype;

        Ignition.fn._isString = isString;
        Ignition.fn._isFunction = isFunction;
        Ignition.fn._isObject = isObject;
        Ignition.fn._isArray = isArray;
        Ignition.fn._isRegistered = isRegistered;
        Ignition.fn._generateRegistration = generateRegistration;
        Ignition.fn._registerMulti = registerMulti;
        Ignition.fn._execFunctionQueue = execFunctionQueue;
        Ignition.fn._buildBundlePath = buildBundlePath;

        Ignition.fn._loadTier = function (t, chain) {
            var ig = this;
            return chain.optionalScript(ig.tiers[t].getOptionalSrcs()).script(ig.tiers[t].getSrcs()).wait(function () {
                ig._execFunctionQueue(ig.tiers[t].getFns());
            });
        };

        Ignition.fn._injectCss = function (src) {
            var head = document.getElementsByTagName('head')[0],
                links,
                link;
            links = head.getElementsByTagName('link');
            for (var i = 0; i < links.length; i++) {
                if (links[i].getAttribute('href') === src) return;
            }
            link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('type', 'text/css');
            link.setAttribute('href', src);
            head.appendChild(link);
        };

        Ignition.fn.load = function () {
            var ig = this,
                chain;
            if (!$LAB) throw new IgnitionError('$LAB not found.');
            chain = $LAB;
            for (var t = 0; t < ig.tierCount; t++) {
                chain = ig._loadTier(t, chain);
            }if (ig.bundles.loadCss) {
                for (var c = 0, cssSrcs = ig.bundles.getSrcs('css'); c < cssSrcs.length; c++) {
                    ig._injectCss(cssSrcs[c]);
                }
            }
            chain.script(ig.bundles.getSrcs()).wait(function () {
                ig.bootstrap(ig.bundleModules.getNames());
                ig._execFunctionQueue(ig.ready.getFns());
            });
        };

        window.Ignition = Ignition;
    })();
}