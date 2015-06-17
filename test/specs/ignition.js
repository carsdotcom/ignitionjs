describe('an ignition instance', function () {
    var ignition, LabConstructor, newLab;

    beforeEach(function () {
        LabConstructor = function () {};
        newLab = function (arg) { if (typeof arg === 'function') arg(); return new LabConstructor(); };
        LabConstructor.prototype.script = newLab;
        LabConstructor.prototype.wait = newLab;
        $LAB = new LabConstructor();
        spyOn($LAB, 'script').and.callThrough();
        spyOn($LAB, 'wait').and.callThrough();
        angular = {
            bootstrap: function () {}
        };
    });

    describe('when instantiated with an options object', function () {
        it('any properties not directly on the options object will be ignored', function () {
            /* eslint no-undefined: 0 */
            var StrangeOptionsObj, options, ignition;
            StrangeOptionsObj = function () {};
            StrangeOptionsObj.prototype.foo = 'bar';
            options = new StrangeOptionsObj();
            ignition = new Ignition(options);
            expect(ignition.foo).toEqual(undefined);
        });
        describe('the sources property', function () {
            it('will be set on the ignition instance as namedSrcs', function () {
                var namedSrcs = {
                        foo: 'http://foo.com/foo.js'
                    },
                    ig = new Ignition({
                        sources: namedSrcs
                    });
                expect(ig.namedSrcs).toEqual(namedSrcs);
            });
        });
        describe('the tiers[0].aliases property', function () {
            it('will set a corresponding property on the ignition instance object for each item in the aliases array', function () {
                ignition = new Ignition({
                    tiers: [{
                        aliases: [ 'foo' ]
                    }]
                });
                expect(ignition.foo).toEqual(ignition.tiers[0]);
            });
            it('will not set a corresponding property on the ignition instance object for any property which is already defined', function () {
                ignition = new Ignition({
                    tiers: [{
                        aliases: [ 'ready' ]
                    }]
                });
                expect(ignition.ready).not.toEqual(ignition.tiers[0]);
            });
            it('to should not accept an aliases with a name that conflict with another ignition property', function () {
                expect(function () {
                    ignition = new Ignition({
                        tiers: [{
                            aliases: [ 'bundles' ]
                        }]
                    });
                }).toThrow();
            });
            it('to default to an empty array if not set', function () {
                ignition = new Ignition({
                    tiers: [{}]
                });
                expect(ignition.tiers[0].aliases).toEqual([]);
            });
        });
        describe('the tiers[0].validation property', function () {
            it('will be set based a property of the same name in the options object', function () {
                function option() {}
                ignition = new Ignition({
                    tiers: [{
                        validation: option
                    }]
                });
                expect(ignition.tiers[0].validation).toEqual(option);
            });
        });
        describe('the tiers[1].validation property', function () {
            it('will be set based a property of the same name in the options object', function () {
                function option() {}
                ignition = new Ignition({
                    tiers: [{},{
                        validation: option
                    }]
                });
                expect(ignition.tiers[1].validation).toEqual(option);
            });
        });
        describe('the bundles.modules property', function () {
            it('will be set based a property of the same name in the options object', function () {
                var option = { 'foo': [ 'bar', 'baz' ] };
                ignition = new Ignition({
                    bundles: {
                        modules: option
                    }
                });
                expect(ignition.bundles.modules).toEqual(option);
            });
            it('will be set to an empty object if property of the same name is not in the options object', function () {
                var option = {};
                ignition = new Ignition({
                    bundles: {}
                });
                expect(ignition.bundles.modules).toEqual(option);
            });
        });
        describe('the bundles.validation property', function () {
            it('will be set based a property of the same name in the options object', function () {
                function option() {}
                ignition = new Ignition({
                    bundles: {
                        validation: option
                    }
                });
                expect(ignition.bundles.validation).toEqual(option);
            });
            it('will throw if value is not of type `function`', function () {
                var option = 'foo';
                expect(function () {
                    ignition = new Ignition({
                        bundles: {
                            validation: option
                        }
                    });
                }).toThrow();
            });
        });
        describe('the bundles.dir property', function () {
            it('will be set based a property of the same name in the options object', function () {
                var option = 'foo';
                ignition = new Ignition({
                    bundles: {
                        dir: option
                    }
                });
                expect(ignition.bundles.dir).toEqual(option);
            });
            it('will throw if value is not of type `string`', function () {
                function option() {};
                expect(function () {
                    ignition = new Ignition({
                        bundles: {
                            dir: option
                        }
                    });
                }).toThrow();
            });
        });
        describe('the bundles.bootstrap property', function () {
            it('will be set based a property of the same name in the options object', function () {
                function option() {};
                ignition = new Ignition({
                    bootstrap: option
                });
                expect(ignition.bootstrap).toEqual(option);
            });
            it('will throw if value is not of type `function`', function () {
                var option = 'foo';
                expect(function () {
                    ignition = new Ignition({
                        bootstrap: option
                    });
                }).toThrow();
            });
        });
        describe('the bundles.loadCss property', function () {
            it('will default to false', function () {
                ignition = new Ignition();
                expect(ignition.bundles.loadCss).toEqual(false);
            });
            it('if set to false, then calling load will never call _injectCss', function () {
                ignition = new Ignition({
                    bundles: {
                        loadCss: false
                    }
                });
                ignition.bundles.register('foo');
                spyOn(ignition, '_injectCss');
                ignition.load();
                expect(ignition._injectCss).not.toHaveBeenCalled();
            });
        });
    });

    describe('#_isString', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should return `true` if called with an argument of type `string`', function () {
            expect(ignition._isString('')).toEqual(true);
        });
        it('should return `false` if called with an argument not of type `string`', function () {
            expect(ignition._isString(true)).toEqual(false);
            expect(ignition._isString(1)).toEqual(false);
            expect(ignition._isString(function () {})).toEqual(false);
            expect(ignition._isString({})).toEqual(false);
            expect(ignition._isString([])).toEqual(false);
        });
        it('should throw if called with an argument not of a type `string` and a truthy second argument is passed', function () {
            expect(function () { ignition._isString(true, true); }).toThrow();
            expect(function () { ignition._isString(1, true); }).toThrow();
            expect(function () { ignition._isString(function () {}, true); }).toThrow();
            expect(function () { ignition._isString({}, true); }).toThrow();
            expect(function () { ignition._isString([], true); }).toThrow();
        });
    });

    describe('#_isFunction', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should return `true` if called with an argument of type `function`', function () {
            expect(ignition._isFunction(function () {})).toEqual(true);
        });
        it('should return `false` if called with an argument not of type `function`', function () {
            expect(ignition._isFunction(true)).toEqual(false);
            expect(ignition._isFunction(1)).toEqual(false);
            expect(ignition._isFunction('foo')).toEqual(false);
            expect(ignition._isFunction({})).toEqual(false);
            expect(ignition._isFunction([])).toEqual(false);
        });
        it('should throw if called with an argument not of a type `function` and a truthy second argument is passed', function () {
            expect(function () { ignition._isFunction(true, true); }).toThrow();
            expect(function () { ignition._isFunction(1, true); }).toThrow();
            expect(function () { ignition._isFunction('foo', true); }).toThrow();
            expect(function () { ignition._isFunction({}, true); }).toThrow();
            expect(function () { ignition._isFunction([], true); }).toThrow();
        });
    });

    describe('#_isObject', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should return `true` if called with an argument of type `object`', function () {
            expect(ignition._isObject({})).toEqual(true);
        });
        it('should return `false` if called with an argument not of type `object`', function () {
            expect(ignition._isObject(true)).toEqual(false);
            expect(ignition._isObject(1)).toEqual(false);
            expect(ignition._isObject('foo')).toEqual(false);
            expect(ignition._isObject(function () {})).toEqual(false);
            expect(ignition._isObject([])).toEqual(false);
        });
        it('should throw if called with an argument not of a type `object` and a truthy second argument is passed', function () {
            expect(function () { ignition._isObject(true, true); }).toThrow();
            expect(function () { ignition._isObject(1, true); }).toThrow();
            expect(function () { ignition._isObject('foo', true); }).toThrow();
            expect(function () { ignition._isObject(function () {}, true); }).toThrow();
            expect(function () { ignition._isObject([], true); }).toThrow();
        });
    });

    describe('#_isArray', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should return `true` if called with an argument of type `array`', function () {
            expect(ignition._isArray([])).toEqual(true);
        });
        it('should return `false` if called with an argument not of type `array`', function () {
            expect(ignition._isArray(true)).toEqual(false);
            expect(ignition._isArray(1)).toEqual(false);
            expect(ignition._isArray('foo')).toEqual(false);
            expect(ignition._isArray(function () {})).toEqual(false);
            expect(ignition._isArray({})).toEqual(false);
        });
        it('should throw if called with an argument not of a type `array` and a truthy second argument is passed', function () {
            expect(function () { ignition._isArray(true, true); }).toThrow();
            expect(function () { ignition._isArray(1, true); }).toThrow();
            expect(function () { ignition._isArray('foo', true); }).toThrow();
            expect(function () { ignition._isArray(function () {}, true); }).toThrow();
            expect(function () { ignition._isArray({}, true); }).toThrow();
        });
    });

    describe('#_isRegistered', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('given an array of strings and a string should return `true` if a matching string is found in the array', function () {
            expect(ignition._isRegistered([ 'foo', 'bar' ], 'foo')).toEqual(true);
        });
        it('given an array of functions and a function should return `true` if a matching function is found in the array', function () {
            /*eslint no-unused-vars:0*/
            expect(ignition._isRegistered(

                [
                    function () { var foo; },
                    function () { var bar; }
                ],

                function () { var foo; }

                )).toEqual(true);
        });
        it('given an array of functions and a function should return `false` if no matching function is found in the array', function () {
            /*eslint no-unused-vars:0*/
            expect(ignition._isRegistered(

                [
                    function () { var foo; },
                    function () { var bar; }
                ],

                function () { var baz; }

                )).toEqual(false);
        });
        it('will return false if second argument is a function but the collection is strings', function () {
            expect(ignition._isRegistered(['foo'], function() {})).toEqual(false);
        });
        it('will return false if second argument is not of either type `string` or `function`', function () {
            expect(ignition._isRegistered(['foo'], true)).toEqual(false);
            expect(ignition._isRegistered(['foo'], 1)).toEqual(false);
            expect(ignition._isRegistered(['foo'], [])).toEqual(false);
            expect(ignition._isRegistered(['foo'], {})).toEqual(false);
            expect(ignition._isRegistered([function () {}], true)).toEqual(false);
            expect(ignition._isRegistered([function () {}], 1)).toEqual(false);
            expect(ignition._isRegistered([function () {}], [])).toEqual(false);
            expect(ignition._isRegistered([function () {}], {})).toEqual(false);
        });
        it('will throw if first argument is not of type `array`', function () {
            expect(function () { ignition._isRegistered(''); }).toThrow();
        });
    });

    describe('#_generateRegistration', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('given an array and a function should return a function', function () {
            expect(ignition._generateRegistration(['foo','bar'], function (foo) { return !!foo; })).toEqual(jasmine.any(Function));
        });
    });

    describe('#_registerMulti', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('given a function and an array should call the given function once for each item in the array', function () {
            var spy = jasmine.createSpy(),
                arr = [ 'foo', 'bar' ];
            ignition._registerMulti(spy, arr);
            expect(spy.calls.count()).toEqual(arr.length);
        });
    });

    describe('#_execFunctionQueue', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('given an array of functions should call each function', function () {
            var spyOne = jasmine.createSpy(),
                spyTwo = jasmine.createSpy(),
                spyThree = jasmine.createSpy();
            ignition._execFunctionQueue([ spyOne, spyTwo, spyThree ]);
            expect(spyOne).toHaveBeenCalled();
            expect(spyTwo).toHaveBeenCalled();
            expect(spyThree).toHaveBeenCalled();
        });
    });

    describe('#bundles.register', function () {
        var options;

        beforeEach(function () {
            options = {
                bundles: {
                    modules: {
                        myMappedBundle: [ 'myAngularModule', 'mySecondAngularModule' ]
                    }
                }
            };
            ignition = new Ignition(options);
        });
        it('should register a bundle', function () {
            var bundleName = 'myBundle';
            ignition.bundles.register(bundleName, [ 'moduleOne', 'moduleTwo' ]);
            expect(ignition.bundles.getNames()).toEqual([ bundleName ]);
        });
        it("should register a bundle's modules when passed a second parameter", function () {
            var bundleName = 'myBundle';
            var bundleModules = [ 'moduleOne', 'moduleTwo' ];
            ignition.bundles.register(bundleName, bundleModules);
            expect(ignition.bundleModules.getNames()).toEqual(bundleModules);
        });
        it("should register a bundle's modules when not passed a second parameter if modules are defined in bundles.modules", function () {
            var bundleName = 'myMappedBundle';
            ignition.bundles.register(bundleName);
            expect(ignition.bundleModules.getNames()).toEqual(options.bundles.modules[bundleName]);
        });
        it('should throw when passed a non-string', function () {
            var bundleName = {};
            expect(function () { ignition.bundles.register(bundleName, [ 'moduleOne', 'moduleTwo' ]); }).toThrow();
        });
        it('should register a module of the same name as the bundle when no bundleModules are provided and bundles.modules does not contain bundle name', function () {
            var bundleName = 'myBundle';
            ignition.bundles.register(bundleName);
            expect(ignition.bundleModules.getNames()).toEqual([bundleName]);
        });
    });

    describe('#bundles.getNames', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.bundles.getNames).toEqual(jasmine.any(Function));
        });
        describe('when called', function () {
            it('should return an array', function () {
                var bundles = ignition.bundles.getNames();
                expect(bundles).toEqual(jasmine.any(Object));
                expect(bundles.length).toEqual(jasmine.any(Number));
            });
        });
    });

    describe('#bundles.getSrcs', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.bundles.getSrcs).toEqual(jasmine.any(Function));
        });
        describe('when called', function () {
            it('should return an array of the same length as bundles.getNames', function () {
                var arr, bundleSources;
                arr = [ 'foo', 'bar', 'baz' ];
                spyOn(ignition.bundles, 'getNames').and.callFake(function () {
                    return arr;
                });
                bundleSources = ignition.bundles.getSrcs();
                expect(bundleSources).toEqual(jasmine.any(Object));
                expect(bundleSources.length).toEqual(arr.length);
            });
            describe('with no argument or an argument other than `css`', function () {
                it('should return paths to js sources', function () {
                    var arr, bundleSources;
                    arr = [ 'foo', 'bar', 'baz' ];
                    spyOn(ignition.bundles, 'getNames').and.callFake(function () {
                        return arr;
                    });
                    bundleSources = ignition.bundles.getSrcs();
                    expect(bundleSources[0]).toEqual('/app/bundles/foo.js');
                    expect(bundleSources[1]).toEqual('/app/bundles/bar.js');
                    expect(bundleSources[2]).toEqual('/app/bundles/baz.js');
                });

            });
            describe('with `css` as string argument', function () {
                it('should return paths to css sources instead of js', function () {
                    var arr, bundleSources;
                    arr = [ 'foo', 'bar', 'baz' ];
                    spyOn(ignition.bundles, 'getNames').and.callFake(function () {
                        return arr;
                    });
                    bundleSources = ignition.bundles.getSrcs('css');
                    expect(bundleSources[0]).toEqual('/app/bundles/foo.css');
                    expect(bundleSources[1]).toEqual('/app/bundles/bar.css');
                    expect(bundleSources[2]).toEqual('/app/bundles/baz.css');
                });

            });
        });
    });

    describe('#bundles.registerOne', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.bundles.registerOne).toEqual(jasmine.any(Function));
        });
        describe('when called', function () {
            it('with a valid bundle name which hasn\'t already been added should add the bundle to the bundles array', function () {
                ignition.bundles.registerOne('foo');
                expect(ignition.bundles.getNames().indexOf('foo') >= 0).toEqual(true);
                expect(ignition.bundles.getNames().length === 1).toEqual(true);
            });
            it('with a valid bundle name which has already been added should not add the bundle to the bundles array', function () {
                ignition.bundles.registerOne('foo');
                ignition.bundles.registerOne('foo');
                expect(ignition.bundles.getNames().length === 1).toEqual(true);
            });
            it('with a invalid bundle name should throw an error', function () {
                expect(function () { ignition.bundles.registerOne('$foo'); }).toThrow();
                expect(function () { ignition.bundles.registerOne(1); }).toThrow();
                expect(function () { ignition.bundles.registerOne([]); }).toThrow();
                expect(function () { ignition.bundles.registerOne({}); }).toThrow();
                expect(function () { ignition.bundles.registerOne(function () {}); }).toThrow();
            });
        });
    });

    describe('#bundles.registerMany', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.bundles.registerMany).toEqual(jasmine.any(Function));
        });
        it('should call _registerMulti with bundles.registerOne and an array', function () {
            var arr = [ 'foo', 'bar' ];
            spyOn(ignition, '_registerMulti');
            ignition.bundles.registerMany(arr);
            expect(ignition._registerMulti).toHaveBeenCalledWith(ignition.bundles.registerOne, arr);
        });
    });

    describe('#tiers[0].getSrcs', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.tiers[0].getSrcs).toEqual(jasmine.any(Function));
        });
        describe('when called', function () {
            it('should return an array', function () {
                var srcs = ignition.tiers[0].getSrcs();
                expect(srcs).toEqual(jasmine.any(Object));
                expect(srcs.length).toEqual(jasmine.any(Number));
            });
        });
    });

    describe('#tiers[0].register', function () {
        beforeEach(function () {
            ignition = new Ignition({
                sources: {
                    foo: 'foo/bar.js'
                }
            });
        });
        it('should be a function', function () {
            expect(ignition.tiers[0].register).toEqual(jasmine.any(Function));
        });
        describe('when called with a name which has been defined in options.sources', function () {
            describe('the first time it is called', function () {
                it('will register the corresponding source', function () {
                    ignition.tiers[0].register('foo');
                    expect(ignition.tiers[0].getSrcs().indexOf('foo/bar.js') >= 0).toEqual(true);
                });
            });
            describe('if already registered to another tier', function () {
                it('will do nothing because the source is already registered', function () {
                    ignition.tiers[0].register('foo');
                    ignition.tiers[1].register('foo');
                    expect(ignition.tiers[0].getSrcs().length === 1).toEqual(true);
                    expect(ignition.tiers[1].getSrcs().length === 0).toEqual(true);
                    ignition = new Ignition({
                        sources: {
                            foo: 'foo/bar.js'
                        }
                    });
                    ignition.tiers[1].register('foo');
                    ignition.tiers[0].register('foo');
                    expect(ignition.tiers[1].getSrcs().length === 1).toEqual(true);
                    expect(ignition.tiers[0].getSrcs().length === 0).toEqual(true);
                });
            });
            describe('the second time it is called', function () {
                it('will do nothing because the source is already registered', function () {
                    ignition.tiers[0].register('foo');
                    ignition.tiers[0].register('foo');
                    ignition.tiers[0].register('foo');
                    expect(ignition.tiers[0].getSrcs().length === 1).toEqual(true);
                });
            });
        });
        describe('when called with a name which has not been defined in options.sources', function () {
            it('should throw an error', function () {
                expect(function () {
                    ignition.tiers[0].register('bar');
                }).toThrow();
            });
        });
        describe('when called with an array', function () {
            it('should call registerSrc once for each item in the array', function () {
                    var srcs = [ 'foo', 'bar', 'baz' ];
                    ignition = new Ignition({
                        sources: {
                            foo: 'foo/foo.js',
                            bar: 'bar/bar.js',
                            baz: 'baz/baz.js'
                        }
                    });
                    spyOn(ignition.tiers[0], 'registerSrc').and.callThrough();
                    ignition.tiers[0].register(srcs);
                    expect(ignition.tiers[0].registerSrc.calls.count()).toEqual(srcs.length);
            });
        });
        describe('when called with something other than a string or an array', function () {
            it('should throw an error', function () {
                expect(function () { ignition.tiers[0].register(1); }).toThrow();
                expect(function () { ignition.tiers[0].register({}); }).toThrow();
                expect(function () { ignition.tiers[0].register(function () {}); }).toThrow();
            });
        });
    });

    describe('#tiers[0].registerSrc', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.tiers[0].registerSrc).toEqual(jasmine.any(Function));
        });
        describe('when called', function () {
            it('with a string which hasn\'t already been added should add the string to the sources array', function () {
                ignition.tiers[0].registerSrc('foo');
                expect(ignition.tiers[0].getSrcs().indexOf('foo') >= 0).toEqual(true);
                expect(ignition.tiers[0].getSrcs().length === 1).toEqual(true);
            });
            it('with a string which has already been added should not add the string to the sources array', function () {
                ignition.tiers[0].registerSrc('foo');
                ignition.tiers[0].registerSrc('foo');
                expect(ignition.tiers[0].getSrcs().length === 1).toEqual(true);
            });
            it('with something other than a string should throw an error', function () {
                expect(function () { ignition.tiers[0].registerSrc(1); }).toThrow();
                expect(function () { ignition.tiers[0].registerSrc([]); }).toThrow();
                expect(function () { ignition.tiers[0].registerSrc({}); }).toThrow();
                expect(function () { ignition.tiers[0].registerSrc(function () {}); }).toThrow();
            });
        });
    });

    describe('#tiers[0].registerSrcs', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.tiers[0].registerSrcs).toEqual(jasmine.any(Function));
        });
        it('should call _registerMulti with tiers[0].registerSrc and an array', function () {
            var arr = [ 'foo', 'bar' ];
            spyOn(ignition, '_registerMulti');
            ignition.tiers[0].registerSrcs(arr);
            expect(ignition._registerMulti).toHaveBeenCalledWith(ignition.tiers[0].registerSrc, arr);
        });
    });

    describe('#tiers[0].registerFns', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.tiers[0].registerFns).toEqual(jasmine.any(Function));
        });
        it('should call _registerMulti with tiers[0].registerFn and an array', function () {
            var arr = [ 'foo', 'bar' ];
            spyOn(ignition, '_registerMulti');
            ignition.tiers[0].registerFns(arr);
            expect(ignition._registerMulti).toHaveBeenCalledWith(ignition.tiers[0].registerFn, arr);
        });
    });

    describe('#ready.registerFns', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.ready.registerFns).toEqual(jasmine.any(Function));
        });
        it('should call _registerMulti with ready.registerFn and an array', function () {
            var arr = [ 'foo', 'bar' ];
            spyOn(ignition, '_registerMulti');
            ignition.ready.registerFns(arr);
            expect(ignition._registerMulti).toHaveBeenCalledWith(ignition.ready.registerFn, arr);
        });
    });

    describe('#_injectCss', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition._injectCss).toEqual(jasmine.any(Function));
        });
        describe('when called', function () {
            it('with a source (string) should inject a link tag element into the head tag of the page with an href value which matches the given string, ', function () {
                var src = 'foo.css',
                    links;
                ignition._injectCss(src);
                links = document.getElementsByTagName('head')[0].getElementsByTagName('link');
                expect(links[links.length - 1].getAttribute('href')).toEqual(src);
            });
            it('a with a source which already exists in the head should not add any additional links tags to the head', function () {
                var src = 'foo.css',
                    head = document.getElementsByTagName('head')[0],
                    link,
                    initialLinkCount;
                link = document.createElement('link');
                link.setAttribute('href', src);
                head.appendChild(link);
                initialLinkCount = head.getElementsByTagName('link').length;
                ignition._injectCss(src);
                expect(initialLinkCount).toEqual(head.getElementsByTagName('link').length);
            });
        });
    });
    describe('#_buildBundlePath', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition._buildBundlePath).toEqual(jasmine.any(Function));
        });
        describe('when called', function () {
            it('with a base directory, bundle name and extension should return a formatted bundle path', function () {
                expect(ignition._buildBundlePath('name', 'base/', 'js')).toEqual('base/name.js');
                expect(ignition._buildBundlePath('name', 'base', 'js')).toEqual('base/name.js');
                expect(ignition._buildBundlePath('name', 'base', 'css')).toEqual('base/name.css');
            });
        });
    });

    describe('#_loadTier', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition._loadTier).toEqual(jasmine.any(Function));
        });
        describe('when called with a tier index and a $LAB chain', function () {
            it('should call script with the sources from the tier corresponding to the given tier index', function () {
                var srcs = [ 'foo', 'bar' ];
                $LAB = new LabConstructor();
                ignition.tiers[0].registerSrcs(srcs);
                spyOn($LAB, 'script').and.callThrough();
                ignition._loadTier(0, $LAB);
                expect($LAB.script).toHaveBeenCalledWith(srcs);
            });
        });
    });

    describe('#load', function () {
        var bundleName = 'myBundle',
            bundleModules = [ 'moduleOne', 'moduleTwo' ];
        beforeEach(function () {
            ignition = new Ignition();
            ignition.bundles.register(bundleName, bundleModules);
        });
        it('should be a function', function () {
            expect(ignition.load).toEqual(jasmine.any(Function));
        });
        describe('when called', function () {
            it('should throw if $LAB is not set', function () {
                $LAB = null;
                ignition = new Ignition();
                ignition.tiers[0].registerSrcs([ 'foo', 'bar' ]);
                ignition.tiers[0].registerSrcs([ 'foo', 'bar' ]);
                ignition.tiers[0].registerFn(function () {});
                ignition.tiers[1].registerSrcs([ 'foo', 'bar' ]);
                ignition.tiers[1].registerFn(function () {});
                expect(function () { ignition.load(); }).toThrow();
            });
            it('should call _loadTier with a string and a $LAB chain', function () {
                spyOn(ignition, '_loadTier').and.callThrough();
                ignition.load();
                expect(ignition._loadTier).toHaveBeenCalledWith(jasmine.any(Number), jasmine.any(Object));
            });
            it('should call _injectCss once for each bundle, if loadCss option is set to true', function () {
                var bundles = [ 'foo', 'bar', 'baz' ];
                ignition = new Ignition({bundles:{loadCss:true}});
                ignition.bundles.register(bundles[0]);
                ignition.bundles.register(bundles[1]);
                ignition.bundles.register(bundles[2]);
                spyOn(ignition, '_injectCss').and.callThrough();
                ignition.load();
                expect(ignition._injectCss.calls.count()).toEqual(bundles.length);
            });
            it('should call bootstrap once with bundle module names', function () {
                spyOn(ignition, 'bootstrap').and.callThrough();
                ignition.load();
                expect(ignition.bootstrap.calls.count()).toEqual(1);
                expect(ignition.bootstrap).toHaveBeenCalledWith(bundleModules);
            });
            it('should call _execFunctionQueue four times', function () {
                spyOn(ignition, '_execFunctionQueue').and.callThrough();
                ignition.load();
                expect(ignition._execFunctionQueue.calls.count()).toEqual(3);
            });
        });
    });
});

