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
                            aliases: [ 'modules' ]
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
            it('will be set based a property of the same name in the the options object', function () {
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
            it('will be set based a property of the same name in the the options object', function () {
                function option() {}
                ignition = new Ignition({
                    tiers: [{},{
                        validation: option
                    }]
                });
                expect(ignition.tiers[1].validation).toEqual(option);
            });
        });
        describe('the modules.validation property', function () {
            it('will be set based a property of the same name in the the options object', function () {
                function option() {}
                ignition = new Ignition({
                    modules: {
                        validation: option
                    }
                });
                expect(ignition.modules.validation).toEqual(option);
            });
            it('will throw if value is not of type `function`', function () {
                var option = 'foo';
                expect(function () {
                    ignition = new Ignition({
                        modules: {
                            validation: option
                        }
                    });
                }).toThrow();
            });
        });
        describe('the modules.dir property', function () {
            it('will be set based a property of the same name in the the options object', function () {
                var option = 'foo';
                ignition = new Ignition({
                    modules: {
                        dir: option
                    }
                });
                expect(ignition.modules.dir).toEqual(option);
            });
            it('will throw if value is not of type `string`', function () {
                function option() {};
                expect(function () {
                    ignition = new Ignition({
                        modules: {
                            dir: option
                        }
                    });
                }).toThrow();
            });
        });
        describe('the modules.bootstrap property', function () {
            it('will be set based a property of the same name in the the options object', function () {
                function option() {};
                ignition = new Ignition({
                    modules: {
                        bootstrap: option
                    }
                });
                expect(ignition.modules.bootstrap).toEqual(option);
            });
            it('will throw if value is not of type `function`', function () {
                var option = 'foo';
                expect(function () {
                    ignition = new Ignition({
                        modules: {
                            bootstrap: option
                        }
                    });
                }).toThrow();
            });
        });
        describe('the modules.cssDir property', function () {
            it('will be set based a property of the same name in the the options object', function () {
                var option = 'foo';
                ignition = new Ignition({
                    modules: {
                        cssDir: option
                    }
                });
                expect(ignition.modules.cssDir).toEqual(option);
            });
            it('will throw if value is not of type `string`', function () {
                function option() {};
                expect(function () {
                    ignition = new Ignition({
                        modules: {
                            cssDir: option
                        }
                    });
                }).toThrow();
            });
        });
        describe('the modules.loadCss property', function () {
            it('will default to true', function () {
                ignition = new Ignition();
                expect(ignition.modules.loadCss).toEqual(true);
            });
            it('if set to false then calling load will never call _injectCss', function () {
                ignition = new Ignition({
                    modules: {
                        loadCss: false
                    }
                });
                ignition.modules.register('foo');
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

    describe('#modules.getNames', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.modules.getNames).toEqual(jasmine.any(Function));
        });
        describe('when called', function () {
            it('should return an array', function () {
                var modules = ignition.modules.getNames();
                expect(modules).toEqual(jasmine.any(Object));
                expect(modules.length).toEqual(jasmine.any(Number));
            });
        });
    });

    describe('#modules.getSrcs', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.modules.getSrcs).toEqual(jasmine.any(Function));
        });
        describe('when called', function () {
            it('should return an array of the same length as modules.getNames', function () {
                var arr, moduleSources;
                arr = [ 'foo', 'bar', 'baz' ];
                spyOn(ignition.modules, 'getNames').and.callFake(function () {
                    return arr;
                });
                moduleSources = ignition.modules.getSrcs();
                expect(moduleSources).toEqual(jasmine.any(Object));
                expect(moduleSources.length).toEqual(arr.length);
            });
            describe('with no argument or an argument other than `css`', function () {
                it('should return paths to js sources', function () {
                    var arr, moduleSources;
                    arr = [ 'foo', 'bar', 'baz' ];
                    spyOn(ignition.modules, 'getNames').and.callFake(function () {
                        return arr;
                    });
                    moduleSources = ignition.modules.getSrcs();
                    expect(moduleSources[0]).toEqual('/app/js/modules/foo/foo.js');
                    expect(moduleSources[1]).toEqual('/app/js/modules/bar/bar.js');
                    expect(moduleSources[2]).toEqual('/app/js/modules/baz/baz.js');
                });

            });
            describe('with `css` as string argument', function () {
                it('should return paths to css sources instead of js', function () {
                    var arr, moduleSources;
                    arr = [ 'foo', 'bar', 'baz' ];
                    spyOn(ignition.modules, 'getNames').and.callFake(function () {
                        return arr;
                    });
                    moduleSources = ignition.modules.getSrcs('css');
                    expect(moduleSources[0]).toEqual('/app/css/modules/foo/foo.css');
                    expect(moduleSources[1]).toEqual('/app/css/modules/bar/bar.css');
                    expect(moduleSources[2]).toEqual('/app/css/modules/baz/baz.css');
                });

            });
        });
    });

    describe('#modules.registerOne', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.modules.registerOne).toEqual(jasmine.any(Function));
        });
        describe('when called', function () {
            it('with a valid module name which hasn\'t already been added should add the module to the modules array', function () {
                ignition.modules.registerOne('foo');
                expect(ignition.modules.getNames().indexOf('foo') >= 0).toEqual(true);
                expect(ignition.modules.getNames().length === 1).toEqual(true);
            });
            it('with a valid module name which has already been added should not add the module to the modules array', function () {
                ignition.modules.registerOne('foo');
                ignition.modules.registerOne('foo');
                expect(ignition.modules.getNames().length === 1).toEqual(true);
            });
            it('with a invalid module name should throw an error', function () {
                expect(function () { ignition.modules.registerOne('$foo'); }).toThrow();
                expect(function () { ignition.modules.registerOne(1); }).toThrow();
                expect(function () { ignition.modules.registerOne([]); }).toThrow();
                expect(function () { ignition.modules.registerOne({}); }).toThrow();
                expect(function () { ignition.modules.registerOne(function () {}); }).toThrow();
            });
        });
    });

    describe('#modules.registerMany', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.modules.registerMany).toEqual(jasmine.any(Function));
        });
        it('should call _registerMulti with modules.registerOne and an array', function () {
            var arr = [ 'foo', 'bar' ];
            spyOn(ignition, '_registerMulti');
            ignition.modules.registerMany(arr);
            expect(ignition._registerMulti).toHaveBeenCalledWith(ignition.modules.registerOne, arr);
        });
    });

    describe('#modules.register', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.modules.register).toEqual(jasmine.any(Function));
        });
        describe('if called with a string', function () {
            it('should call modules.registerOne the given string', function () {
                var str = 'foo';
                spyOn(ignition.modules, 'registerOne');
                ignition.modules.register(str);
                expect(ignition.modules.registerOne).toHaveBeenCalledWith(str);
            });
        });
        describe('if called with an array', function () {
            it('should call modules.registerMany the given array', function () {
                var arr = [ 'foo', 'bar' ];
                spyOn(ignition.modules, 'registerMany');
                ignition.modules.register(arr);
                expect(ignition.modules.registerMany).toHaveBeenCalledWith(arr);
            });
        });
        describe('if called with a type other than a string or an array', function () {
            it('should throw', function () {
                function otherType() {};
                expect(function () {
                    ignition.modules.register(otherType);
                }).toThrow();
            });
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
            it('with a string and an element should inject a link tag element into the given elment with an href value which matches the given string, ', function () {
                var dom = document.createElement('div');
                ignition._injectCss('foo', dom);
                expect(dom.getElementsByTagName('link')[0].getAttribute('href')).toEqual('foo');
            });
        });
    });
    describe('#_buildModulePath', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition._buildModulePath).toEqual(jasmine.any(Function));
        });
        describe('when called', function () {
            it('with a base directory, module name and extension should return a formatted module path', function () {
                expect(ignition._buildModulePath('name', 'base/', 'js')).toEqual('base/name/name.js');
                expect(ignition._buildModulePath('name', 'base', 'js')).toEqual('base/name/name.js');
                expect(ignition._buildModulePath('name', 'base', 'css')).toEqual('base/name/name.css');
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
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.load).toEqual(jasmine.any(Function));
        });
        describe('when called', function () {
            it('should throw if $LAB is not set', function () {
                $LAB = null;
                ignition = new Ignition();
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
            it('should call _injectCss once for each module', function () {
                var modules = [ 'foo', 'bar', 'baz' ];
                ignition = new Ignition();
                ignition.modules.register(modules);
                spyOn(ignition, '_injectCss').and.callThrough();
                ignition.load();
                expect(ignition._injectCss.calls.count()).toEqual(modules.length);
            });
            it('should call modules.bootstrap once', function () {
                spyOn(ignition.modules, 'bootstrap').and.callThrough();
                ignition.load();
                expect(ignition.modules.bootstrap.calls.count()).toEqual(1);
            });
            it('should call _execFunctionQueue four times', function () {
                spyOn(ignition, '_execFunctionQueue').and.callThrough();
                ignition.load();
                expect(ignition._execFunctionQueue.calls.count()).toEqual(3);
            });
        });
    });
});

